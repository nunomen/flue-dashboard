<script setup lang="ts">
import type { DashboardUsageSummary } from '@shared/types'
import { formatCost, formatNumber } from '@/utils/format'

const props = defineProps<{
  usage: DashboardUsageSummary
}>()
</script>

<template>
  <section class="usage-panel" aria-label="Model usage">
    <header class="section-header">
      <h2>Usage</h2>
      <span>{{ props.usage.models.length }} models</span>
    </header>

    <dl class="usage-list">
      <div class="usage-item">
        <dt>Input tokens</dt>
        <dd>{{ formatNumber(props.usage.inputTokens) }}</dd>
      </div>
      <div class="usage-item">
        <dt>Output tokens</dt>
        <dd>{{ formatNumber(props.usage.outputTokens) }}</dd>
      </div>
      <div class="usage-item">
        <dt>Total tokens</dt>
        <dd>{{ formatNumber(props.usage.totalTokens) }}</dd>
      </div>
      <div class="usage-item">
        <dt>Cost</dt>
        <dd>{{ formatCost(props.usage.costUsd) }}</dd>
      </div>
      <div class="usage-item usage-item-wide">
        <dt>Models</dt>
        <dd>{{ props.usage.models.length > 0 ? props.usage.models.join(', ') : 'Not recorded' }}</dd>
      </div>
    </dl>
  </section>
</template>

<style scoped>
.usage-panel {
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

.section-header span {
  color: var(--color-text-muted);
  font-size: 12px;
}

.usage-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin: 0;
}

.usage-item {
  min-width: 0;
}

.usage-item-wide {
  grid-column: 1 / -1;
}

.usage-item dt {
  margin-bottom: 2px;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.usage-item dd {
  margin: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
