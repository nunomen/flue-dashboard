<script setup lang="ts">
import { computed } from 'vue'

import { redactValue } from '@shared/redaction'
import type { DashboardRunRecord } from '@shared/types'
import { formatDateTime, formatDuration, formatNumber } from '@/utils/format'
import JsonBlock from '../common/JsonBlock.vue'
import StatusBadge from '../common/StatusBadge.vue'

const props = defineProps<{
  run: DashboardRunRecord
}>()

const facts = computed(() => [
  { label: 'Run ID', value: props.run.id },
  { label: 'Workflow', value: props.run.workflowName },
  { label: 'Status', value: props.run.status },
  { label: 'Started', value: formatDateTime(props.run.startedAt) },
  { label: 'Ended', value: formatDateTime(props.run.endedAt) },
  { label: 'Duration', value: formatDuration(props.run.durationMs) },
  { label: 'Events', value: formatNumber(props.run.eventCount) },
  { label: 'Errors', value: formatNumber(props.run.errorCount) },
  { label: 'Warnings', value: formatNumber(props.run.warningCount) },
])

const redactedMetadata = computed(() => redactValue(props.run.metadata))
</script>

<template>
  <section class="facts-panel" aria-label="Run facts and metadata">
    <header class="section-header">
      <h2>Run facts</h2>
      <StatusBadge :status="props.run.status" />
    </header>

    <dl class="fact-list">
      <div v-for="fact in facts" :key="fact.label" class="fact-item">
        <dt>{{ fact.label }}</dt>
        <dd>{{ fact.value }}</dd>
      </div>
    </dl>

    <details class="metadata">
      <summary>Metadata</summary>
      <JsonBlock :value="redactedMetadata" empty-label="No metadata returned" />
    </details>
  </section>
</template>

<style scoped>
.facts-panel {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.section-header h2 {
  margin: 0;
  font-size: 15px;
}

.fact-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin: 0 0 12px;
}

.fact-item {
  min-width: 0;
}

.fact-item dt {
  margin-bottom: 2px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.fact-item dd {
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.metadata summary {
  color: var(--color-blue);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>
