import { readonly, shallowRef, type Ref, type ShallowRef, watch } from 'vue'

import type { DashboardEventRecord, DashboardRunEventsResponse } from '@shared/types'
import { apiGet } from './api'

export function useRunEvents(runId: Readonly<Ref<string | null>>) {
  const events = shallowRef<DashboardEventRecord[]>([])
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  watch(
    runId,
    (id, _previous, onCleanup) => {
      events.value = []

      if (!id) return

      const controller = new AbortController()
      onCleanup(() => controller.abort())
      void load(id, controller.signal)
    },
    { immediate: true },
  )

  async function load(id: string, signal?: AbortSignal) {
    loading.value = true
    error.value = null

    try {
      const response = await apiGet<DashboardRunEventsResponse>(`/api/runs/${encodeURIComponent(id)}/events`, signal)
      events.value = response.events
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        error.value = err instanceof Error ? err.message : 'Failed to load run events.'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    events: readonly(events) as unknown as Readonly<ShallowRef<DashboardEventRecord[]>>,
    loading: readonly(loading) as unknown as Readonly<ShallowRef<boolean>>,
    error: readonly(error) as unknown as Readonly<ShallowRef<string | null>>,
    reload: () => runId.value ? load(runId.value) : Promise.resolve(),
  }
}
