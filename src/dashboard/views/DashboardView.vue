<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'

import ErrorPanel from '@/components/common/ErrorPanel.vue'
import RunDetail from '@/components/runs/RunDetail.vue'
import RunFilters from '@/components/runs/RunFilters.vue'
import RunTable from '@/components/runs/RunTable.vue'
import { useRunEvents } from '@/composables/useRunEvents'
import { useRunRecord } from '@/composables/useRunRecord'
import { useRuns } from '@/composables/useRuns'
import { useRunTimeline } from '@/composables/useRunTimeline'
import { useRunUsage } from '@/composables/useRunUsage'
import { useRunWaterfall } from '@/composables/useRunWaterfall'

const selectedRunId = shallowRef<string | null>(null)
const {
  visibleRuns,
  workflows,
  filters,
  loading: runsLoading,
  error: runsError,
  refresh,
  updateFilters,
} = useRuns()

const {
  run,
  loading: runLoading,
  error: runError,
} = useRunRecord(selectedRunId)
const {
  events,
  loading: eventsLoading,
  error: eventsError,
} = useRunEvents(selectedRunId)

const timeline = useRunTimeline(events)
const usage = useRunUsage(events)
const spans = useRunWaterfall(events)
const selectedRunExists = computed(() => visibleRuns.value.some((runSummary) => runSummary.id === selectedRunId.value))

watch(
  visibleRuns,
  (runs) => {
    if (selectedRunExists.value) return
    selectedRunId.value = runs[0]?.id ?? null
  },
  { immediate: true },
)
</script>

<template>
  <main class="dashboard">
    <header class="dashboard-header">
      <div>
        <p class="eyebrow">Flue runtime</p>
        <h1>Workflow runs</h1>
      </div>
    </header>

    <section class="filters-panel" aria-label="Run filters">
      <RunFilters
        :filters="filters"
        :workflows="workflows"
        @change="updateFilters"
        @refresh="refresh"
      />
    </section>

    <ErrorPanel v-if="runsError" :message="runsError" />

    <div class="dashboard-grid">
      <RunTable
        :runs="visibleRuns"
        :selected-run-id="selectedRunId"
        :loading="runsLoading"
        @select="selectedRunId = $event"
      />

      <RunDetail
        :run="run"
        :events="events"
        :timeline="timeline"
        :spans="spans"
        :usage="usage"
        :loading="runLoading"
        :events-loading="eventsLoading"
        :error="runError"
        :events-error="eventsError"
      />
    </div>
  </main>
</template>

<style scoped>
.dashboard {
  display: grid;
  gap: 16px;
  min-height: 100vh;
  padding: 22px;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 2px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 750;
  text-transform: uppercase;
}

.dashboard-header h1 {
  margin: 0;
  font-size: 24px;
  line-height: 1.15;
}

.filters-panel {
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(340px, 0.85fr) minmax(460px, 1.15fr);
  gap: 16px;
  align-items: start;
}

@media (max-width: 1180px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .dashboard {
    padding: 14px;
  }

  .dashboard-header {
    display: grid;
  }

}
</style>
