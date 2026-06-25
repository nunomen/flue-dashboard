import { shallowRef } from 'vue'
import { describe, expect, it } from 'vitest'

import { useRunEventStats } from '../../src/dashboard/composables/useRunEventStats'
import { normalizeEventRecord } from '../../src/shared'
import { fixtureRuns } from '../fixtures/runs'

describe('useRunEventStats', () => {
  it('derives category, type, slowest event, and correlation summaries', () => {
    const events = shallowRef((fixtureRuns[0]?.events ?? []).map(normalizeEventRecord))
    const stats = useRunEventStats(events)

    expect(stats.value.categoryCounts.find((item) => item.label === 'model')?.count).toBe(1)
    expect(stats.value.typeCounts[0]).toMatchObject({
      label: 'model.turn.completed',
      count: 1,
    })
    expect(stats.value.slowestEvents[0]?.id).toBe('evt-2')
    expect(stats.value.correlationSummaries.find((item) => item.field === 'operationId')).toMatchObject({
      count: 1,
      values: ['op-model-1'],
    })
  })
})
