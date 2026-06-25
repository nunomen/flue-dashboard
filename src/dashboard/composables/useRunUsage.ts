import { computed, type Ref } from 'vue'

import { mergeUsage } from '@shared/normalize'
import type { DashboardEventRecord } from '@shared/types'

export function useRunUsage(events: Readonly<Ref<readonly DashboardEventRecord[]>>) {
  return computed(() => mergeUsage(events.value.map((event) => event.usage)))
}
