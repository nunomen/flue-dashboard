import type { DashboardRuntimeSource } from '../../src/server'

export const fixtureRuns = [
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

export const fixtureRuntime: DashboardRuntimeSource = {
  async listRuns() {
    return { runs: fixtureRuns }
  },

  async getRun(runId: string) {
    return fixtureRuns.find((run) => run.id === runId) ?? null
  },

  async listRunEvents(runId: string) {
    const run = fixtureRuns.find((candidate) => candidate.id === runId)
    return { events: run?.events ?? [] }
  },
}
