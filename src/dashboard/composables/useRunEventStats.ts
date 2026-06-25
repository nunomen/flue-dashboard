import { computed, type Ref } from 'vue'

import type { DashboardEventCategory, DashboardEventRecord, DashboardLogLevel } from '@shared/types'

const CATEGORY_ORDER: DashboardEventCategory[] = [
  'lifecycle',
  'operation',
  'model',
  'tool',
  'task',
  'compaction',
  'log',
  'error',
  'unknown',
]

const LEVEL_ORDER: DashboardLogLevel[] = ['debug', 'info', 'warn', 'error']
const CORRELATION_FIELDS = ['operationId', 'turnId', 'toolCallId', 'taskId', 'session', 'parentSession'] as const

export interface CountItem {
  label: string
  count: number
}

export interface CorrelationSummary {
  field: typeof CORRELATION_FIELDS[number]
  count: number
  values: string[]
}

export interface RunEventStats {
  categoryCounts: CountItem[]
  typeCounts: CountItem[]
  levelCounts: CountItem[]
  slowestEvents: DashboardEventRecord[]
  correlationSummaries: CorrelationSummary[]
}

export function useRunEventStats(events: Readonly<Ref<readonly DashboardEventRecord[]>>) {
  return computed<RunEventStats>(() => {
    const categoryCounts = countOrdered(events.value.map((event) => event.category), CATEGORY_ORDER)
    const typeCounts = countValues(events.value.map((event) => event.type))
    const levelCounts = countOrdered(
      events.value.map((event) => event.level).filter((level): level is DashboardLogLevel => level != null),
      LEVEL_ORDER,
    )
    const slowestEvents = [...events.value]
      .filter((event) => event.durationMs != null)
      .sort((first, second) => (second.durationMs ?? 0) - (first.durationMs ?? 0))
      .slice(0, 5)
    const correlationSummaries = CORRELATION_FIELDS.map((field) => {
      const values = [...new Set(events.value.map((event) => event[field]).filter((value): value is string => Boolean(value)))]
      return {
        field,
        count: values.length,
        values,
      }
    })

    return {
      categoryCounts,
      typeCounts,
      levelCounts,
      slowestEvents,
      correlationSummaries,
    }
  })
}

function countOrdered<T extends string>(values: readonly T[], order: readonly T[]): CountItem[] {
  const counts = new Map<T, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))

  return order.map((label) => ({
    label,
    count: counts.get(label) ?? 0,
  }))
}

function countValues(values: readonly string[]): CountItem[] {
  const counts = new Map<string, number>()
  values.forEach((value) => counts.set(value, (counts.get(value) ?? 0) + 1))

  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((first, second) => second.count - first.count || first.label.localeCompare(second.label))
}
