import { computed, type Ref } from 'vue'

import type { DashboardEventCategory, DashboardEventRecord } from '@shared/types'

export interface WaterfallSpan {
  id: string
  label: string
  category: DashboardEventCategory
  leftPercent: number
  widthPercent: number
  durationMs: number | null
}

export function useRunWaterfall(events: Readonly<Ref<readonly DashboardEventRecord[]>>) {
  return computed<WaterfallSpan[]>(() => {
    const timedEvents = events.value
      .map((event, index) => ({
        event,
        index,
        start: event.timestamp ? Date.parse(event.timestamp) : null,
        durationMs: event.durationMs ?? 0,
      }))

    const starts = timedEvents
      .map((item) => item.start)
      .filter((value): value is number => value != null && Number.isFinite(value))
    const minStart = starts.length > 0 ? Math.min(...starts) : null
    const maxEnd = starts.length > 0
      ? Math.max(...timedEvents.map((item) => (item.start ?? minStart ?? 0) + item.durationMs))
      : null
    const total = minStart != null && maxEnd != null ? Math.max(1, maxEnd - minStart) : Math.max(1, timedEvents.length)

    return timedEvents.map(({ event, index, start, durationMs }) => {
      const hasTiming = minStart != null && start != null
      const leftPercent = hasTiming ? ((start - minStart) / total) * 100 : (index / total) * 100
      const widthPercent = hasTiming ? Math.max(1, (Math.max(durationMs, 1) / total) * 100) : Math.max(1, 100 / total)

      return {
        id: event.id,
        label: event.message ?? event.type,
        category: event.category,
        leftPercent: Math.min(99, leftPercent),
        widthPercent: Math.min(100 - Math.min(99, leftPercent), widthPercent),
        durationMs: event.durationMs,
      }
    })
  })
}
