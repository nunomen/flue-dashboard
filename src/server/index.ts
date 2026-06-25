import { Hono } from 'hono'
import type { Context, MiddlewareHandler } from 'hono'

import { createHealthResponse, normalizeRunEvents, normalizeRunRecord, normalizeRunSummary } from '../shared'
import { dashboardAssets } from './dashboard-assets.generated'
import type { DashboardRuntimeSource } from './runtime-source'
import { extractCollection } from './runtime-source'

export interface FlueDashboardOptions {
  runtime?: DashboardRuntimeSource
  auth?: MiddlewareHandler
  unsafeDevMode?: boolean
}

export function flueDashboard(options: FlueDashboardOptions = {}): Hono {
  if (!options.auth && !options.unsafeDevMode) {
    throw new Error('flueDashboard requires an auth middleware option. Set unsafeDevMode: true only for local development.')
  }

  const app = new Hono()
  const auth = options.auth ?? allowUnsafeDevMode

  app.use('*', auth)

  app.get('/api/health', (context) => {
    return context.json(createHealthResponse(Boolean(options.runtime)))
  })

  app.get('/api/runs', async (context) => {
    const runtime = requireRuntime(context, options.runtime)
    if (runtime instanceof Response) return runtime

    const limit = readLimit(context.req.query('limit'))
    const rawRuns = extractCollection(await runtime.listRuns(), ['runs', 'items', 'data'])
    const runs = rawRuns.map(normalizeRunSummary).slice(0, limit)

    return context.json({ runs })
  })

  app.get('/api/runs/:runId', async (context) => {
    const runtime = requireRuntime(context, options.runtime)
    if (runtime instanceof Response) return runtime

    const runId = context.req.param('runId')
    const rawRun = await runtime.getRun(runId)

    if (!rawRun) {
      return jsonError(context, 404, `Run ${runId} was not found.`)
    }

    return context.json({ run: normalizeRunRecord(rawRun) })
  })

  app.get('/api/runs/:runId/events', async (context) => {
    const runtime = requireRuntime(context, options.runtime)
    if (runtime instanceof Response) return runtime

    const runId = context.req.param('runId')
    const limit = readLimit(context.req.query('limit'))
    const tail = context.req.query('tail') === 'true'
    const rawEvents = await readRunEvents(runtime, runId, { limit, tail })

    return context.json(normalizeRunEvents(runId, rawEvents))
  })

  app.get('/api/runs/:runId/stream', async (context) => {
    const runtime = requireRuntime(context, options.runtime)
    if (runtime instanceof Response) return runtime

    if (!runtime.streamRunEvents) {
      return jsonError(context, 501, 'Run event streaming is not configured for this dashboard.')
    }

    const streamed = await runtime.streamRunEvents(context.req.param('runId'))

    if (!streamed) {
      return jsonError(context, 404, 'Run event stream was not found.')
    }

    if (streamed instanceof Response) {
      return streamed
    }

    return new Response(streamed, {
      headers: {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
      },
    })
  })

  app.get('/assets/*', (context) => serveAsset(context, `/assets/${context.req.param('*')}`))
  app.get('*', (context) => {
    if (context.req.path.startsWith('/api/')) {
      return jsonError(context, 404, 'Dashboard API route was not found.')
    }

    return context.html(dashboardAssets.indexHtml)
  })

  return app
}

async function readRunEvents(
  runtime: DashboardRuntimeSource,
  runId: string,
  options: { limit: number, tail: boolean },
): Promise<unknown[]> {
  if (runtime.listRunEvents) {
    return extractCollection(await runtime.listRunEvents(runId, options), ['events', 'items', 'data'])
  }

  const run = await runtime.getRun(runId)
  return extractCollection(run, ['events'])
}

function serveAsset(context: Context, assetPath: string): Response {
  const asset = dashboardAssets.files[assetPath]

  if (!asset) {
    return jsonError(context, 404, 'Dashboard asset was not found.')
  }

  return new Response(base64ToArrayBuffer(asset.body), {
    headers: {
      'content-type': asset.contentType,
      'cache-control': 'public, max-age=31536000, immutable',
    },
  })
}

function requireRuntime(context: Context, runtime: DashboardRuntimeSource | undefined): DashboardRuntimeSource | Response {
  if (!runtime) {
    return jsonError(context, 501, 'Flue runtime source is not configured.')
  }

  return runtime
}

function jsonError(context: Context, status: 404 | 500 | 501, message: string): Response {
  return context.json({ error: { message } }, status)
}

function readLimit(value: string | undefined): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return 100
  return Math.min(Math.max(1, parsed), 500)
}

function base64ToArrayBuffer(value: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
  return bytes.buffer as ArrayBuffer
}

const allowUnsafeDevMode: MiddlewareHandler = async (_context, next) => {
  await next()
}

export type { DashboardRuntimeSource } from './runtime-source'
