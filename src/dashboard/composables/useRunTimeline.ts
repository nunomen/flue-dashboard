import { computed, type Ref } from 'vue'

import type { DashboardEventRecord } from '@shared/types'

export function useRunTimeline(events: Readonly<Ref<readonly DashboardEventRecord[]>>) {
  return computed(() => [...events.value].sort((first, second) => {
    const firstTime = first.timestamp ? Date.parse(first.timestamp) : Number.MAX_SAFE_INTEGER
    const secondTime = second.timestamp ? Date.parse(second.timestamp) : Number.MAX_SAFE_INTEGER

    if (firstTime === secondTime) {
      return first.id.localeCompare(second.id)
    }

    return firstTime - secondTime
  }))
}
