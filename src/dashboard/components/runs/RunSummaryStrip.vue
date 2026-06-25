<script setup lang="ts">
import type { DashboardRunRecord, DashboardUsageSummary } from '@shared/types'
import { formatCost, formatDateTime, formatDuration, formatNumber } from '@/utils/format'
import StatusBadge from '../common/StatusBadge.vue'

const props = defineProps<{
  run: DashboardRunRecord
  usage: DashboardUsageSummary
}>()
</script>

<template>
  <dl class="summary-strip">
    <div class="summary-item">
      <dt>Status</dt>
      <dd><StatusBadge :status="props.run.status" /></dd>
    </div>
    <div class="summary-item">
      <dt>Started</dt>
      <dd>{{ formatDateTime(props.run.startedAt) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Ended</dt>
      <dd>{{ formatDateTime(props.run.endedAt) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Duration</dt>
      <dd>{{ formatDuration(props.run.durationMs) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Events</dt>
      <dd>{{ formatNumber(props.run.eventCount) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Errors</dt>
      <dd>{{ formatNumber(props.run.errorCount) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Warnings</dt>
      <dd>{{ formatNumber(props.run.warningCount) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Input tokens</dt>
      <dd>{{ formatNumber(props.usage.inputTokens || props.run.usage.inputTokens) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Output tokens</dt>
      <dd>{{ formatNumber(props.usage.outputTokens || props.run.usage.outputTokens) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Tokens</dt>
      <dd>{{ formatNumber(props.usage.totalTokens || props.run.usage.totalTokens) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Cost</dt>
      <dd>{{ formatCost(props.usage.costUsd ?? props.run.usage.costUsd) }}</dd>
    </div>
    <div class="summary-item">
      <dt>Models</dt>
      <dd>{{ props.usage.models.length > 0 ? props.usage.models.join(', ') : props.run.usage.models.join(', ') || 'Not recorded' }}</dd>
    </div>
  </dl>
</template>

<style scoped>
.summary-strip {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(118px, 1fr));
  gap: 0;
  margin: 0;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.summary-item {
  min-width: 0;
  padding: 12px;
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}

.summary-item:last-child {
  border-right: 0;
}

.summary-item dt {
  margin: 0 0 4px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.summary-item dd {
  margin: 0;
  overflow: hidden;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
