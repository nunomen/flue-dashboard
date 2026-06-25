import { describe, expect, it } from 'vitest'
import type { MiddlewareHandler } from 'hono'

import { flueDashboard } from '../../src/server'
import type { DashboardRuntimeSource } from '../../src/server'
import { fixtureRuntime } from '../fixtures/runs'

const auth: MiddlewareHandler = async (context, next) => {
  if (context.req.header('x-admin') !== 'true') {
    return context.json({ error: { message: 'Unauthorized' } }, 401)
  }

  await next()
}

describe('flueDashboard', () => {
  it('fails closed when no auth middleware is provided', () => {
    expect(() => flueDashboard({ runtime: fixtureRuntime })).toThrow(/requires an auth middleware/)
  })

  it('requires the configured auth middleware', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const response = await app.request('/api/runs')

    expect(response.status).toBe(401)
  })

  it('lists normalized runs through the dashboard API', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const response = await app.request('/api/runs', {
      headers: { 'x-admin': 'true' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.runs).toHaveLength(2)
    expect(body.runs[0]).toMatchObject({
      id: 'run-success-1',
      workflowName: 'daily-report',
    })
  })

  it('returns normalized run detail records', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const response = await app.request('/api/runs/run-success-1', {
      headers: { 'x-admin': 'true' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.run).toMatchObject({
      id: 'run-success-1',
      workflowName: 'daily-report',
      input: {
        redacted: true,
      },
      result: {
        redacted: true,
      },
    })
  })

  it('returns normalized run events', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const response = await app.request('/api/runs/run-success-1/events', {
      headers: { 'x-admin': 'true' },
    })
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(body.events).toHaveLength(3)
    expect(body.summary.usage.totalTokens).toBe(140)
  })

  it('passes limit and tail options to the configured event reader', async () => {
    const calls: Array<{ runId: string, limit: number | undefined, tail: boolean | undefined }> = []
    const runtime: DashboardRuntimeSource = {
      ...fixtureRuntime,
      async listRunEvents(runId, options) {
        calls.push({ runId, limit: options?.limit, tail: options?.tail })
        return { events: [] }
      },
    }
    const app = flueDashboard({ runtime, auth })
    const response = await app.request('/api/runs/run-success-1/events?limit=3&tail=true', {
      headers: { 'x-admin': 'true' },
    })

    expect(response.status).toBe(200)
    expect(calls).toEqual([{ runId: 'run-success-1', limit: 3, tail: true }])
  })

  it('returns dashboard error DTOs for missing runs and unknown API routes', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const missingRunResponse = await app.request('/api/runs/missing-run', {
      headers: { 'x-admin': 'true' },
    })
    const unknownRouteResponse = await app.request('/api/not-found', {
      headers: { 'x-admin': 'true' },
    })

    await expect(missingRunResponse.json()).resolves.toEqual({
      error: { message: 'Run missing-run was not found.' },
    })
    await expect(unknownRouteResponse.json()).resolves.toEqual({
      error: { message: 'Dashboard API route was not found.' },
    })
    expect(missingRunResponse.status).toBe(404)
    expect(unknownRouteResponse.status).toBe(404)
  })

  it('returns runtime and stream configuration errors as dashboard DTOs', async () => {
    const unconfiguredApp = flueDashboard({ auth })
    const streamlessApp = flueDashboard({ runtime: fixtureRuntime, auth })
    const unconfiguredResponse = await unconfiguredApp.request('/api/runs', {
      headers: { 'x-admin': 'true' },
    })
    const streamlessResponse = await streamlessApp.request('/api/runs/run-success-1/stream', {
      headers: { 'x-admin': 'true' },
    })

    await expect(unconfiguredResponse.json()).resolves.toEqual({
      error: { message: 'Flue runtime source is not configured.' },
    })
    await expect(streamlessResponse.json()).resolves.toEqual({
      error: { message: 'Run event streaming is not configured for this dashboard.' },
    })
    expect(unconfiguredResponse.status).toBe(501)
    expect(streamlessResponse.status).toBe(501)
  })

  it('reports health diagnostics', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, auth })
    const response = await app.request('/api/health', {
      headers: { 'x-admin': 'true' },
    })

    await expect(response.json()).resolves.toEqual({
      ok: true,
      runtime: {
        configured: true,
      },
    })
    expect(response.status).toBe(200)
  })

  it('serves the dashboard shell in unsafe dev mode', async () => {
    const app = flueDashboard({ runtime: fixtureRuntime, unsafeDevMode: true })
    const response = await app.request('/')
    const html = await response.text()

    expect(response.status).toBe(200)
    expect(html).toContain('Flue Dashboard')
  })
})
