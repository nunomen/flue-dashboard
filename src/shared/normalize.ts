import { createPayloadPreview, redactValue } from './redaction'
import type {
  DashboardEventCategory,
  DashboardEventRecord,
  DashboardHealthResponse,
  DashboardLogLevel,
  DashboardRunEventsResponse,
  DashboardRunRecord,
  DashboardRunStatus,
  DashboardRunSummary,
  DashboardUsageSummary,
} from './types'

const EMPTY_USAGE: DashboardUsageSummary = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  costUsd: null,
  models: [],
}

export function normalizeRunSummary(raw: unknown): DashboardRunSummary {
  const record = asRecord(raw)
  const id = readString(record, ['id', 'runId', 'workflowRunId']) ?? 'unknown-run'
  const startedAt = normalizeDate(readValue(record, ['startedAt', 'startTime', 'createdAt', 'created']))
  const endedAt = normalizeDate(readValue(record, ['endedAt', 'endTime', 'completedAt', 'finishedAt']))
  const durationMs = readNumber(record, ['durationMs', 'duration', 'elapsedMs']) ?? inferDuration(startedAt, endedAt)
  const events = readArray(record, ['events'])
  const normalizedEvents = events.map(normalizeEventRecord)
  const explicitErrorCount = readNumber(record, ['errorCount', 'errors'])
  const explicitWarningCount = readNumber(record, ['warningCount', 'warnings'])

  return {
    id,
    workflowName: readString(record, ['workflowName', 'workflow', 'name']) ?? 'Workflow run',
    status: normalizeStatus(readString(record, ['status', 'state']) ?? inferStatus(normalizedEvents)),
    startedAt,
    endedAt,
    durationMs,
    eventCount: readNumber(record, ['eventCount']) ?? normalizedEvents.length,
    errorCount: explicitErrorCount ?? normalizedEvents.filter((event) => event.category === 'error' || event.level === 'error').length,
    warningCount: explicitWarningCount ?? normalizedEvents.filter((event) => event.level === 'warn').length,
    usage: mergeUsage([readUsage(record), ...normalizedEvents.map((event) => event.usage)]),
  }
}

export function normalizeRunRecord(raw: unknown): DashboardRunRecord {
  const record = asRecord(raw)
  const summary = normalizeRunSummary(raw)

  return {
    ...summary,
    metadata: readRecord(record, ['metadata', 'meta']) ?? {},
    input: createPayloadPreview(readValue(record, ['input', 'workflowInput'])),
    result: createPayloadPreview(readValue(record, ['result', 'output', 'workflowResult'])),
  }
}

export function normalizeEventRecord(raw: unknown, index = 0): DashboardEventRecord {
  const record = asRecord(raw)
  const type = readString(record, ['type', 'eventType', 'name']) ?? 'unknown'
  const timestamp = normalizeDate(readValue(record, ['timestamp', 'time', 'createdAt', 'created']))
  const category = categorizeEvent(type, record)

  return {
    id: readString(record, ['id', 'eventId']) ?? `${timestamp ?? 'event'}-${index}`,
    type,
    category,
    level: normalizeLevel(readString(record, ['level', 'severity'])) ?? (category === 'error' ? 'error' : null),
    timestamp,
    message: readString(record, ['message', 'text', 'summary']) ?? null,
    status: normalizeStatus(readString(record, ['status', 'state'])),
    durationMs: readNumber(record, ['durationMs', 'duration', 'elapsedMs']),
    operationId: readString(record, ['operationId', 'operation_id']) ?? null,
    turnId: readString(record, ['turnId', 'turn_id']) ?? null,
    toolCallId: readString(record, ['toolCallId', 'tool_call_id']) ?? null,
    taskId: readString(record, ['taskId', 'task_id']) ?? null,
    session: readString(record, ['session', 'sessionId', 'session_id']) ?? null,
    parentSession: readString(record, ['parentSession', 'parentSessionId', 'parent_session']) ?? null,
    usage: readUsage(record),
    payload: createPayloadPreview(raw),
    redacted: redactValue(raw) as Record<string, unknown>,
  }
}

export function normalizeRunEvents(runId: string, rawEvents: unknown[]): DashboardRunEventsResponse {
  const events = rawEvents.map(normalizeEventRecord)

  return {
    runId,
    events,
    summary: {
      status: normalizeStatus(inferStatus(events)),
      eventCount: events.length,
      errorCount: events.filter((event) => event.category === 'error' || event.level === 'error').length,
      warningCount: events.filter((event) => event.level === 'warn').length,
      usage: mergeUsage(events.map((event) => event.usage)),
    },
  }
}

export function createHealthResponse(configured: boolean): DashboardHealthResponse {
  return {
    ok: true,
    runtime: {
      configured,
    },
  }
}

export function mergeUsage(usages: DashboardUsageSummary[]): DashboardUsageSummary {
  const models = new Set<string>()
  let costUsd = 0
  let hasCost = false

  for (const usage of usages) {
    usage.models.forEach((model) => models.add(model))
    if (usage.costUsd != null) {
      hasCost = true
      costUsd += usage.costUsd
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

function categorizeEvent(type: string, record: Record<string, unknown>): DashboardEventCategory {
  const normalized = type.toLowerCase()
  const level = normalizeLevel(readString(record, ['level', 'severity']))

  if (level === 'error' || normalized.includes('error') || normalized.includes('exception')) return 'error'
  if (normalized.includes('log') || level === 'debug' || level === 'info' || level === 'warn') return 'log'
  if (normalized.includes('model') || normalized.includes('llm') || readString(record, ['turnId', 'turn_id'])) return 'model'
  if (normalized.includes('tool') || readString(record, ['toolCallId', 'tool_call_id'])) return 'tool'
  if (normalized.includes('task') || readString(record, ['taskId', 'task_id'])) return 'task'
  if (normalized.includes('operation') || readString(record, ['operationId', 'operation_id'])) return 'operation'
  if (normalized.includes('compact')) return 'compaction'
  if (normalized.includes('lifecycle') || normalized.includes('start') || normalized.includes('complete') || normalized.includes('finish')) return 'lifecycle'

  return 'unknown'
}

function inferStatus(events: DashboardEventRecord[]): DashboardRunStatus {
  if (events.some((event) => event.status === 'failed' || event.category === 'error')) return 'failed'
  if (events.some((event) => event.status === 'canceled')) return 'canceled'
  if (events.some((event) => event.status === 'completed')) return 'completed'
  if (events.some((event) => event.status === 'running')) return 'running'
  return 'unknown'
}

function normalizeStatus(status: string | null | undefined): DashboardRunStatus {
  switch (status?.toLowerCase()) {
    case 'queued':
    case 'pending':
      return 'queued'
    case 'running':
    case 'active':
    case 'in_progress':
      return 'running'
    case 'completed':
    case 'complete':
    case 'success':
    case 'succeeded':
      return 'completed'
    case 'failed':
    case 'failure':
    case 'errored':
      return 'failed'
    case 'canceled':
    case 'cancelled':
    case 'aborted':
      return 'canceled'
    default:
      return 'unknown'
  }
}

function normalizeLevel(level: string | null | undefined): DashboardLogLevel | null {
  switch (level?.toLowerCase()) {
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

function readUsage(record: Record<string, unknown>): DashboardUsageSummary {
  const usageRecord = asRecord(readValue(record, ['usage', 'modelUsage', 'tokenUsage']))
  const inputTokens = readNumber(usageRecord, ['inputTokens', 'promptTokens', 'input_tokens', 'prompt_tokens']) ?? 0
  const outputTokens = readNumber(usageRecord, ['outputTokens', 'completionTokens', 'output_tokens', 'completion_tokens']) ?? 0
  const totalTokens = readNumber(usageRecord, ['totalTokens', 'total_tokens']) ?? inputTokens + outputTokens
  const costUsd = readNumber(usageRecord, ['costUsd', 'costUSD', 'cost', 'usd']) ?? null
  const model = readString(record, ['model']) ?? readString(usageRecord, ['model'])

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    costUsd,
    models: model ? [model] : [],
  }
}

function inferDuration(startedAt: string | null, endedAt: string | null): number | null {
  if (!startedAt || !endedAt) return null
  const started = Date.parse(startedAt)
  const ended = Date.parse(endedAt)
  return Number.isFinite(started) && Number.isFinite(ended) ? Math.max(0, ended - started) : null
}

function normalizeDate(value: unknown): string | null {
  if (value == null) return null
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'number') return new Date(value).toISOString()
  if (typeof value !== 'string') return null

  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? new Date(parsed).toISOString() : null
}

function readArray(record: Record<string, unknown>, keys: string[]): unknown[] {
  const value = readValue(record, keys)
  return Array.isArray(value) ? value : []
}

function readRecord(record: Record<string, unknown>, keys: string[]): Record<string, unknown> | null {
  const value = readValue(record, keys)
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function readString(record: Record<string, unknown>, keys: string[]): string | null {
  const value = readValue(record, keys)
  return typeof value === 'string' && value.length > 0 ? value : null
}

function readNumber(record: Record<string, unknown>, keys: string[]): number | null {
  const value = readValue(record, keys)

  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function readValue(record: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (Object.hasOwn(record, key)) {
      return record[key]
    }
  }

  return undefined
}

function asRecord(value: unknown): Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}
