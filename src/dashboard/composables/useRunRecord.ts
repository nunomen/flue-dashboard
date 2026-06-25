import { readonly, shallowRef, type Ref, type ShallowRef, watch } from 'vue'

import type { DashboardRunRecord } from '@shared/types'
import { apiGet } from './api'

interface RunResponse {
  run: DashboardRunRecord
}

export function useRunRecord(runId: Readonly<Ref<string | null>>) {
  const run = shallowRef<DashboardRunRecord | null>(null)
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)

  watch(
    runId,
    (id, _previous, onCleanup) => {
      if (!id) {
        run.value = null
        return
      }

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
      const response = await apiGet<RunResponse>(`/api/runs/${encodeURIComponent(id)}`, signal)
      run.value = response.run
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        error.value = err instanceof Error ? err.message : 'Failed to load run details.'
      }
    } finally {
      loading.value = false
    }
  }

  return {
    run: readonly(run) as unknown as Readonly<ShallowRef<DashboardRunRecord | null>>,
    loading: readonly(loading) as unknown as Readonly<ShallowRef<boolean>>,
    error: readonly(error) as unknown as Readonly<ShallowRef<string | null>>,
    reload: () => runId.value ? load(runId.value) : Promise.resolve(),
  }
}
