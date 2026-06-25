import { computed, onMounted, reactive, readonly, shallowRef, type ShallowRef } from 'vue'

import type { DashboardRunSummary, DashboardRunStatus } from '@shared/types'
import { apiGet } from './api'

export interface RunFiltersState {
  status: DashboardRunStatus | 'all'
  workflow: string
  search: string
  limit: number
}

interface RunsResponse {
  runs: DashboardRunSummary[]
}

export function useRuns() {
  const runs = shallowRef<DashboardRunSummary[]>([])
  const loading = shallowRef(false)
  const error = shallowRef<string | null>(null)
  const filters = reactive<RunFiltersState>({
    status: 'all',
    workflow: '',
    search: '',
    limit: 100,
  })

  const workflows = computed(() => {
    const names = new Set(runs.value.map((run) => run.workflowName).filter(Boolean))
    return [...names].sort()
  })

  const visibleRuns = computed(() => {
    const search = filters.search.trim().toLowerCase()

    return runs.value
      .filter((run) => filters.status === 'all' || run.status === filters.status)
      .filter((run) => !filters.workflow || run.workflowName === filters.workflow)
      .filter((run) => {
        if (!search) return true
        return `${run.id} ${run.workflowName} ${run.status}`.toLowerCase().includes(search)
      })
      .slice(0, filters.limit)
  })

  function updateFilters(next: Partial<RunFiltersState>) {
    Object.assign(filters, next)
  }

  async function refresh(signal?: AbortSignal) {
    loading.value = true
    error.value = null

    try {
      const response = await apiGet<RunsResponse>(`/api/runs?limit=${filters.limit}`, signal)
      runs.value = response.runs
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        error.value = err instanceof Error ? err.message : 'Failed to load workflow runs.'
      }
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    void refresh()
  })

  return {
    runs: readonly(runs) as unknown as Readonly<ShallowRef<DashboardRunSummary[]>>,
    visibleRuns,
    workflows,
    filters: readonly(filters),
    loading: readonly(loading) as unknown as Readonly<ShallowRef<boolean>>,
    error: readonly(error) as unknown as Readonly<ShallowRef<string | null>>,
    refresh,
    updateFilters,
  }
}
