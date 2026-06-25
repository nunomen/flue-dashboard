<script setup lang="ts">
import { computed, shallowRef } from 'vue'

import { useRunEventStats } from '@/composables/useRunEventStats'
import type { WaterfallSpan } from '@/composables/useRunWaterfall'
import { useDisclosureState } from '@/composables/useDisclosureState'
import type { DashboardEventRecord, DashboardRunRecord, DashboardUsageSummary } from '@shared/types'
import EmptyState from '../common/EmptyState.vue'
import ErrorPanel from '../common/ErrorPanel.vue'
import LoadingState from '../common/LoadingState.vue'
import EventInsights from '../events/EventInsights.vue'
import EventLogList from '../events/EventLogList.vue'
import EventTimeline from '../events/EventTimeline.vue'
import EventWaterfall from '../events/EventWaterfall.vue'
import RawEventDrawer from '../events/RawEventDrawer.vue'
import PayloadPreviewPanel from './PayloadPreviewPanel.vue'
import RunFactsPanel from './RunFactsPanel.vue'
import RunSummaryStrip from './RunSummaryStrip.vue'
import RunUsagePanel from './RunUsagePanel.vue'

const props = defineProps<{
  run: DashboardRunRecord | null
  events: readonly DashboardEventRecord[]
  timeline: readonly DashboardEventRecord[]
  spans: readonly WaterfallSpan[]
  usage: DashboardUsageSummary
  loading: boolean
  eventsLoading: boolean
  error: string | null
  eventsError: string | null
}>()

const selectedEvent = shallowRef<DashboardEventRecord | null>(null)
const { open: drawerOpen, show: showDrawer, hide: hideDrawer } = useDisclosureState()
const eventStats = useRunEventStats(computed(() => props.events))
const effectiveUsage = computed<DashboardUsageSummary>(() => {
  const runUsage = props.run?.usage
  const models = new Set([...(runUsage?.models ?? []), ...props.usage.models])

  return {
    inputTokens: props.usage.inputTokens || runUsage?.inputTokens || 0,
    outputTokens: props.usage.outputTokens || runUsage?.outputTokens || 0,
    totalTokens: props.usage.totalTokens || runUsage?.totalTokens || 0,
    costUsd: props.usage.costUsd ?? runUsage?.costUsd ?? null,
    models: [...models].sort(),
  }
})

function inspectEvent(event: DashboardEventRecord) {
  selectedEvent.value = event
  showDrawer()
}
</script>

<template>
  <section class="detail" aria-label="Selected run detail">
    <div v-if="props.loading" class="detail-state">
      <LoadingState label="Loading run detail" />
    </div>

    <ErrorPanel v-else-if="props.error" :message="props.error" />

    <EmptyState
      v-else-if="!props.run"
      title="Select a workflow run"
      detail="Run metadata, events, logs, usage, and raw payloads will appear here."
    />

    <div v-else class="detail-content">
      <header class="detail-header">
        <div>
          <p class="eyebrow">{{ props.run.workflowName }}</p>
          <h1>{{ props.run.id }}</h1>
        </div>
      </header>

      <RunSummaryStrip :run="props.run" :usage="effectiveUsage" />

      <section class="detail-grid" aria-label="Run details">
        <RunFactsPanel :run="props.run" />
        <RunUsagePanel :usage="effectiveUsage" />
      </section>

      <section class="payload-row" aria-label="Run payload previews">
        <PayloadPreviewPanel title="Input" :preview="props.run.input" />
        <PayloadPreviewPanel title="Result" :preview="props.run.result" />
      </section>

      <div v-if="props.eventsLoading" class="detail-state">
        <LoadingState label="Loading events" />
      </div>
      <ErrorPanel v-else-if="props.eventsError" :message="props.eventsError" />
      <div v-else class="event-grid">
        <EventInsights class="event-grid-full" :stats="eventStats" />
        <EventTimeline :events="props.timeline" @inspect="inspectEvent" />
        <EventWaterfall :spans="props.spans" />
        <EventLogList class="event-grid-full" :events="props.events" @inspect="inspectEvent" />
      </div>
    </div>

    <RawEventDrawer :open="drawerOpen" :event="selectedEvent" @close="hideDrawer" />
  </section>
</template>

<style scoped>
.detail {
  min-width: 0;
}

.detail-state {
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.detail-content {
  display: grid;
  gap: 16px;
}

.detail-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 3px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.detail-header h1 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 20px;
  line-height: 1.2;
}

.payload-row,
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.event-grid {
  display: grid;
  grid-template-columns: minmax(260px, 0.9fr) minmax(320px, 1.1fr);
  gap: 16px;
}

.event-grid-full {
  grid-column: 1 / -1;
}

@media (max-width: 980px) {
  .event-grid,
  .detail-grid,
  .payload-row {
    grid-template-columns: 1fr;
  }
}
</style>
