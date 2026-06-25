export type DashboardRunStatus =
  | 'queued'
  | 'running'
  | 'completed'
  | 'failed'
  | 'canceled'
  | 'unknown'

export type DashboardEventCategory =
  | 'lifecycle'
  | 'operation'
  | 'model'
  | 'tool'
  | 'task'
  | 'compaction'
  | 'log'
  | 'error'
  | 'unknown'

export type DashboardLogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface DashboardUsageSummary {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  costUsd: number | null
  models: string[]
}

export interface PayloadPreview {
  kind: 'empty' | 'primitive' | 'array' | 'object'
  label: string
  redacted: boolean
  truncated: boolean
  value?: unknown
  entries?: Record<string, unknown>
}

export interface DashboardRunSummary {
  id: string
  workflowName: string
  status: DashboardRunStatus
  startedAt: string | null
  endedAt: string | null
  durationMs: number | null
  eventCount: number
  errorCount: number
  warningCount: number
  usage: DashboardUsageSummary
}

export interface DashboardRunRecord extends DashboardRunSummary {
  metadata: Record<string, unknown>
  input: PayloadPreview
  result: PayloadPreview
}

export interface DashboardEventRecord {
  id: string
  type: string
  category: DashboardEventCategory
  level: DashboardLogLevel | null
  timestamp: string | null
  message: string | null
  status: DashboardRunStatus
  durationMs: number | null
  operationId: string | null
  turnId: string | null
  toolCallId: string | null
  taskId: string | null
  session: string | null
  parentSession: string | null
  usage: DashboardUsageSummary
  payload: PayloadPreview
  redacted: Record<string, unknown>
}

export interface DashboardRunEventsResponse {
  runId: string
  events: DashboardEventRecord[]
  summary: Pick<DashboardRunSummary, 'status' | 'eventCount' | 'errorCount' | 'warningCount' | 'usage'>
}

export interface DashboardHealthResponse {
  ok: true
  runtime: {
    configured: boolean
  }
}
