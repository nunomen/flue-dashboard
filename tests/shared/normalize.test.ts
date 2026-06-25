import { describe, expect, it } from 'vitest'

import { normalizeEventRecord, normalizeRunEvents, normalizeRunRecord, normalizeRunSummary } from '../../src/shared'
import { fixtureRuns } from '../fixtures/runs'

describe('normalization helpers', () => {
  it('normalizes run summaries from Flue-like records', () => {
    const summary = normalizeRunSummary(fixtureRuns[0])

    expect(summary).toMatchObject({
      id: 'run-success-1',
      workflowName: 'daily-report',
      status: 'completed',
      durationMs: 5000,
      eventCount: 3,
    })
    expect(summary.usage.totalTokens).toBe(140)
    expect(summary.usage.models).toEqual(['gpt-test'])
  })

  it('collapses sensitive run input and result fields', () => {
    const run = normalizeRunRecord(fixtureRuns[0])

    expect(run.input.redacted).toBe(true)
    expect(run.result.redacted).toBe(true)
  })

  it('categorizes event families for dashboard rendering', () => {
    const modelEvent = normalizeEventRecord(fixtureRuns[0]?.events[1])
    const errorEvent = normalizeEventRecord(fixtureRuns[1]?.events[0])

    expect(modelEvent.category).toBe('model')
    expect(errorEvent.category).toBe('error')
  })

  it('derives event response summaries', () => {
    const response = normalizeRunEvents('run-success-1', fixtureRuns[0]?.events ?? [])

    expect(response.summary).toMatchObject({
      status: 'completed',
      eventCount: 3,
      errorCount: 0,
    })
    expect(response.summary.usage.totalTokens).toBe(140)
  })
})
