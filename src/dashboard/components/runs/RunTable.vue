<script setup lang="ts">
import type { DashboardRunSummary } from '@shared/types'
import { formatDateTime, formatDuration, formatNumber } from '@/utils/format'
import EmptyState from '../common/EmptyState.vue'
import LoadingState from '../common/LoadingState.vue'
import StatusBadge from '../common/StatusBadge.vue'

const props = defineProps<{
  runs: readonly DashboardRunSummary[]
  selectedRunId: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  select: [runId: string]
}>()
</script>

<template>
  <section class="table-panel" aria-label="Workflow runs">
    <div v-if="props.loading" class="state-row">
      <LoadingState label="Loading runs" />
    </div>

    <EmptyState
      v-else-if="props.runs.length === 0"
      title="No workflow runs"
      detail="Runs will appear here once the configured Flue runtime returns them."
    />

    <div v-else class="table-scroll">
      <table class="run-table">
        <thead>
          <tr>
            <th>Run</th>
            <th>Workflow</th>
            <th>Status</th>
            <th>Started</th>
            <th>Ended</th>
            <th>Duration</th>
            <th>Events</th>
            <th>Errors</th>
            <th>Warnings</th>
            <th>Tokens</th>
            <th>Cost</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="run in props.runs"
            :key="run.id"
            class="run-row"
            :class="{ 'run-row-selected': run.id === props.selectedRunId }"
            @click="emit('select', run.id)"
          >
            <td class="run-id">{{ run.id }}</td>
            <td>{{ run.workflowName }}</td>
            <td><StatusBadge :status="run.status" /></td>
            <td>{{ formatDateTime(run.startedAt) }}</td>
            <td>{{ formatDateTime(run.endedAt) }}</td>
            <td>{{ formatDuration(run.durationMs) }}</td>
            <td>{{ formatNumber(run.eventCount) }}</td>
            <td>{{ formatNumber(run.errorCount) }}</td>
            <td>{{ formatNumber(run.warningCount) }}</td>
            <td>{{ formatNumber(run.usage.totalTokens) }}</td>
            <td>{{ run.usage.costUsd == null ? 'Not available' : `$${run.usage.costUsd.toFixed(4)}` }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.table-panel {
  min-height: 220px;
}

.state-row {
  padding: 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.table-scroll {
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.run-table {
  width: 100%;
  min-width: 1160px;
  border-collapse: collapse;
}

.run-table th,
.run-table td {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  white-space: nowrap;
}

.run-table th {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.run-row {
  cursor: pointer;
}

.run-row:hover {
  background: rgb(36 99 167 / 6%);
}

.run-row-selected {
  background: rgb(36 99 167 / 10%);
}

.run-id {
  max-width: 180px;
  overflow: hidden;
  color: var(--color-blue);
  font-family: var(--font-mono);
  text-overflow: ellipsis;
}
</style>
