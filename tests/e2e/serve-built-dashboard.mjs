import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '../../dist-dashboard')
const port = Number(process.env.PORT ?? 4173)

const fixtureRuns = [
  {
    id: 'run-success-1',
    workflowName: 'daily-report',
    status: 'completed',
    startedAt: '2026-06-25T08:00:00.000Z',
    endedAt: '2026-06-25T08:00:05.000Z',
    metadata: {
      environment: 'fixture',
      region: 'local',
      owner: 'operations',
      secret: 'hidden metadata value',
    },
    input: {
      accountId: 'acct_123',
      prompt: 'sensitive prompt',
    },
    result: {
      ok: true,
      workflowResult: 'sensitive result',
    },
    events: [
      {
        id: 'evt-1',
        type: 'workflow.started',
        timestamp: '2026-06-25T08:00:00.000Z',
        status: 'running',
        message: 'Workflow started',
      },
      {
        id: 'evt-2',
        type: 'model.turn.completed',
        timestamp: '2026-06-25T08:00:03.000Z',
        durationMs: 1200,
        operationId: 'op-model-1',
        turnId: 'turn-1',
        session: 'session-report-1',
        model: 'gpt-test',
        usage: {
          inputTokens: 100,
          outputTokens: 40,
          costUsd: 0.01,
        },
      },
      {
        id: 'evt-3',
        type: 'workflow.completed',
        timestamp: '2026-06-25T08:00:05.000Z',
        status: 'completed',
        message: 'Workflow completed',
      },
    ],
  },
  {
    id: 'run-failed-1',
    workflowName: 'invoice-sync',
    status: 'failed',
    startedAt: '2026-06-25T09:00:00.000Z',
    metadata: {
      environment: 'fixture',
      retryable: false,
    },
    events: [
      {
        id: 'evt-4',
        type: 'operation.error',
        timestamp: '2026-06-25T09:00:01.000Z',
        level: 'error',
        message: 'Operation failed',
        operationId: 'op-invoice-1',
        error: {
          message: 'Sensitive stack hidden by preview',
        },
      },
    ],
  },
]

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`)

  if (url.pathname.startsWith('/api/')) {
    handleApi(url, response)
    return
  }

  await serveStatic(url.pathname, response)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Serving built dashboard fixtures at http://127.0.0.1:${port}`)
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(() => process.exit(0))
  })
}

function handleApi(url, response) {
  if (url.pathname === '/api/health') {
    sendJson(response, 200, { ok: true, runtime: { configured: true } })
    return
  }

  if (url.pathname === '/api/runs') {
    sendJson(response, 200, { runs: fixtureRuns.map(normalizeRunSummary) })
    return
  }

  const eventsMatch = url.pathname.match(/^\/api\/runs\/([^/]+)\/events$/)
  if (eventsMatch?.[1]) {
    const runId = decodeURIComponent(eventsMatch[1])
    const run = fixtureRuns.find((candidate) => candidate.id === runId)
    sendJson(response, 200, normalizeRunEvents(runId, run?.events ?? []))
    return
  }

  const runMatch = url.pathname.match(/^\/api\/runs\/([^/]+)$/)
  if (runMatch?.[1]) {
    const run = fixtureRuns.find((candidate) => candidate.id === decodeURIComponent(runMatch[1]))

    if (!run) {
      sendJson(response, 404, { error: { message: 'Run was not found.' } })
      return
    }

    sendJson(response, 200, { run: normalizeRunRecord(run) })
    return
  }

  sendJson(response, 404, { error: { message: 'Fixture API route was not found.' } })
}

function normalizeRunSummary(run) {
  const events = (run.events ?? []).map(normalizeEventRecord)
  const usage = mergeUsage(events.map((event) => event.usage))

  return {
    id: run.id,
    workflowName: run.workflowName,
    status: run.status,
    startedAt: run.startedAt ?? null,
    endedAt: run.endedAt ?? null,
    durationMs: inferDuration(run.startedAt, run.endedAt),
    eventCount: events.length,
    errorCount: events.filter((event) => event.category === 'error' || event.level === 'error').length,
    warningCount: events.filter((event) => event.level === 'warn').length,
    usage,
  }
}

function normalizeRunRecord(run) {
  return {
    ...normalizeRunSummary(run),
    metadata: run.metadata ?? {},
    input: createPayloadPreview(run.input),
    result: createPayloadPreview(run.result),
  }
}

function normalizeRunEvents(runId, rawEvents) {
  const events = rawEvents.map(normalizeEventRecord)

  return {
    runId,
    events,
    summary: {
      status: inferStatus(events),
      eventCount: events.length,
      errorCount: events.filter((event) => event.category === 'error' || event.level === 'error').length,
      warningCount: events.filter((event) => event.level === 'warn').length,
      usage: mergeUsage(events.map((event) => event.usage)),
    },
  }
}

function normalizeEventRecord(event, index = 0) {
  const category = categorizeEvent(event)

  return {
    id: event.id ?? `event-${index}`,
    type: event.type ?? 'unknown',
    category,
    level: normalizeLevel(event.level),
    timestamp: event.timestamp ?? null,
    message: event.message ?? null,
    status: event.status ?? (category === 'error' ? 'failed' : 'unknown'),
    durationMs: event.durationMs ?? null,
    operationId: event.operationId ?? null,
    turnId: event.turnId ?? null,
    toolCallId: event.toolCallId ?? null,
    taskId: event.taskId ?? null,
    session: event.session ?? null,
    parentSession: event.parentSession ?? null,
    usage: readUsage(event),
    payload: createPayloadPreview(event),
    redacted: redactValue(event),
  }
}

function categorizeEvent(event) {
  const type = String(event.type ?? '').toLowerCase()
  const level = normalizeLevel(event.level)

  if (level === 'error' || type.includes('error') || type.includes('exception')) return 'error'
  if (type.includes('log') || level === 'debug' || level === 'info' || level === 'warn') return 'log'
  if (type.includes('model') || type.includes('llm') || event.turnId) return 'model'
  if (type.includes('tool') || event.toolCallId) return 'tool'
  if (type.includes('task') || event.taskId) return 'task'
  if (type.includes('operation') || event.operationId) return 'operation'
  if (type.includes('compact')) return 'compaction'
  if (type.includes('lifecycle') || type.includes('start') || type.includes('complete') || type.includes('finish')) return 'lifecycle'

  return 'unknown'
}

function inferStatus(events) {
  if (events.some((event) => event.status === 'failed' || event.category === 'error')) return 'failed'
  if (events.some((event) => event.status === 'canceled')) return 'canceled'
  if (events.some((event) => event.status === 'completed')) return 'completed'
  if (events.some((event) => event.status === 'running')) return 'running'
  return 'unknown'
}

function normalizeLevel(level) {
  switch (String(level ?? '').toLowerCase()) {
    case 'debug':
      return 'debug'
    case 'info':
    case 'log':
      return 'info'
    case 'warn':
    case 'warning':
      return 'warn'
    case 'error':
    case 'fatal':
      return 'error'
    default:
      return null
  }
}

function readUsage(event) {
  const usage = event.usage ?? {}
  const inputTokens = usage.inputTokens ?? usage.promptTokens ?? 0
  const outputTokens = usage.outputTokens ?? usage.completionTokens ?? 0

  return {
    inputTokens,
    outputTokens,
    totalTokens: usage.totalTokens ?? inputTokens + outputTokens,
    costUsd: usage.costUsd ?? null,
    models: event.model ? [event.model] : [],
  }
}

function mergeUsage(usages) {
  const models = new Set()
  let costUsd = 0
  let hasCost = false

  for (const usage of usages) {
    for (const model of usage.models) {
      models.add(model)
    }

    if (usage.costUsd != null) {
      costUsd += usage.costUsd
      hasCost = true
    }
  }

  return {
    inputTokens: usages.reduce((sum, usage) => sum + usage.inputTokens, 0),
    outputTokens: usages.reduce((sum, usage) => sum + usage.outputTokens, 0),
    totalTokens: usages.reduce((sum, usage) => sum + usage.totalTokens, 0),
    costUsd: hasCost ? costUsd : null,
    models: [...models].sort(),
  }
}

function inferDuration(startedAt, endedAt) {
  if (!startedAt || !endedAt) return null
  const started = Date.parse(startedAt)
  const ended = Date.parse(endedAt)
  return Number.isFinite(started) && Number.isFinite(ended) ? Math.max(0, ended - started) : null
}

function createPayloadPreview(value) {
  if (value == null) {
    return {
      kind: 'empty',
      label: 'No payload',
      redacted: false,
      truncated: false,
    }
  }

  if (Array.isArray(value)) {
    return {
      kind: 'array',
      label: `${value.length} items`,
      redacted: false,
      truncated: false,
      value,
    }
  }

  if (typeof value === 'object') {
    const entries = redactValue(value)

    return {
      kind: 'object',
      label: `${Object.keys(value).length} fields`,
      redacted: JSON.stringify(entries) !== JSON.stringify(value),
      truncated: false,
      entries,
    }
  }

  return {
    kind: 'primitive',
    label: String(value),
    redacted: false,
    truncated: false,
    value,
  }
}

function redactValue(value) {
  if (Array.isArray(value)) return value.map(redactValue)
  if (value == null || typeof value !== 'object') return value

  return Object.fromEntries(Object.entries(value).map(([key, child]) => {
    if (/prompt|message|input|result|output|argument|token|secret|error/i.test(key)) {
      return [key, '[redacted]']
    }

    return [key, redactValue(child)]
  }))
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === '/' ? '/index.html' : pathname
  const filePath = normalize(join(root, decodeURIComponent(requestedPath)))

  if (!filePath.startsWith(root)) {
    response.writeHead(403)
    response.end('Forbidden')
    return
  }

  try {
    const body = await readFile(filePath)
    response.writeHead(200, {
      'content-type': contentTypeFor(filePath),
      'cache-control': filePath.includes('/assets/') ? 'public, max-age=31536000, immutable' : 'no-store',
    })
    response.end(body)
  } catch {
    const fallback = await readFile(resolve(root, 'index.html'))
    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    })
    response.end(fallback)
  }
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  response.end(JSON.stringify(body))
}

function contentTypeFor(filePath) {
  switch (extname(filePath)) {
    case '.css':
      return 'text/css; charset=utf-8'
    case '.html':
      return 'text/html; charset=utf-8'
    case '.js':
      return 'text/javascript; charset=utf-8'
    case '.json':
      return 'application/json; charset=utf-8'
    case '.svg':
      return 'image/svg+xml'
    default:
      return 'application/octet-stream'
  }
}
