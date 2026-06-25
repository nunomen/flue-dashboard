<script setup lang="ts">
import { computed } from 'vue'

import type { DashboardEventRecord } from '@shared/types'
import { formatCost, formatDateTime, formatDuration, formatNumber } from '@/utils/format'
import JsonBlock from '../common/JsonBlock.vue'
import StatusBadge from '../common/StatusBadge.vue'

const props = defineProps<{
  open: boolean
  event: DashboardEventRecord | null
}>()

const emit = defineEmits<{
  close: []
}>()

const formattedPayload = computed(() => {
  if (!props.event) return ''
  return JSON.stringify(props.event.redacted, null, 2)
})

const identityFields = computed(() => {
  if (!props.event) return []

  return [
    { label: 'Event ID', value: props.event.id },
    { label: 'Type', value: props.event.type },
    { label: 'Category', value: props.event.category },
    { label: 'Level', value: props.event.level ?? 'Not recorded' },
    { label: 'Message', value: props.event.message ?? 'Not recorded' },
  ]
})

const timingFields = computed(() => {
  if (!props.event) return []

  return [
    { label: 'Timestamp', value: formatDateTime(props.event.timestamp) },
    { label: 'Duration', value: formatDuration(props.event.durationMs) },
  ]
})

const correlationFields = computed(() => {
  if (!props.event) return []

  return [
    { label: 'Operation ID', value: props.event.operationId ?? 'Not recorded' },
    { label: 'Turn ID', value: props.event.turnId ?? 'Not recorded' },
    { label: 'Tool call ID', value: props.event.toolCallId ?? 'Not recorded' },
    { label: 'Task ID', value: props.event.taskId ?? 'Not recorded' },
    { label: 'Session', value: props.event.session ?? 'Not recorded' },
    { label: 'Parent session', value: props.event.parentSession ?? 'Not recorded' },
  ]
})

const usageFields = computed(() => {
  if (!props.event) return []

  return [
    { label: 'Input tokens', value: formatNumber(props.event.usage.inputTokens) },
    { label: 'Output tokens', value: formatNumber(props.event.usage.outputTokens) },
    { label: 'Total tokens', value: formatNumber(props.event.usage.totalTokens) },
    { label: 'Cost', value: formatCost(props.event.usage.costUsd) },
    { label: 'Models', value: props.event.usage.models.length > 0 ? props.event.usage.models.join(', ') : 'Not recorded' },
  ]
})

const payloadPreviewValue = computed(() => props.event?.payload.entries ?? props.event?.payload.value ?? null)
</script>

<template>
  <aside v-if="props.open" class="drawer" aria-label="Raw event payload">
    <div class="drawer-panel">
      <header class="drawer-header">
        <div>
          <h2>Raw event</h2>
          <p>{{ props.event?.type ?? 'No event selected' }}</p>
        </div>
        <button class="close-button" type="button" aria-label="Close raw event drawer" @click="emit('close')">Close</button>
      </header>

      <div v-if="props.event" class="drawer-content">
        <section class="drawer-section">
          <div class="section-title">
            <h3>Identity</h3>
            <StatusBadge :status="props.event.status" />
          </div>
          <dl class="field-list">
            <div v-for="field in identityFields" :key="field.label" class="field-item">
              <dt>{{ field.label }}</dt>
              <dd>{{ field.value }}</dd>
            </div>
          </dl>
        </section>

        <section class="drawer-section">
          <h3>Timing</h3>
          <dl class="field-list">
            <div v-for="field in timingFields" :key="field.label" class="field-item">
              <dt>{{ field.label }}</dt>
              <dd>{{ field.value }}</dd>
            </div>
          </dl>
        </section>

        <section class="drawer-section">
          <h3>Correlation</h3>
          <dl class="field-list">
            <div v-for="field in correlationFields" :key="field.label" class="field-item">
              <dt>{{ field.label }}</dt>
              <dd>{{ field.value }}</dd>
            </div>
          </dl>
        </section>

        <section class="drawer-section">
          <h3>Usage</h3>
          <dl class="field-list">
            <div v-for="field in usageFields" :key="field.label" class="field-item">
              <dt>{{ field.label }}</dt>
              <dd>{{ field.value }}</dd>
            </div>
          </dl>
        </section>

        <section class="drawer-section">
          <h3>Payload preview</h3>
          <dl class="field-list payload-facts">
            <div class="field-item">
              <dt>Kind</dt>
              <dd>{{ props.event.payload.kind }}</dd>
            </div>
            <div class="field-item">
              <dt>Summary</dt>
              <dd>{{ props.event.payload.label }}</dd>
            </div>
            <div class="field-item">
              <dt>Redacted</dt>
              <dd>{{ props.event.payload.redacted ? 'Yes' : 'No' }}</dd>
            </div>
            <div class="field-item">
              <dt>Truncated</dt>
              <dd>{{ props.event.payload.truncated ? 'Yes' : 'No' }}</dd>
            </div>
          </dl>
          <JsonBlock :value="payloadPreviewValue" empty-label="No payload preview fields" />
        </section>

        <section class="drawer-section">
          <h3>Redacted raw event</h3>
          <pre class="payload">{{ formattedPayload }}</pre>
        </section>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.drawer {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  background: rgb(21 32 43 / 35%);
}

.drawer-panel {
  width: min(720px, 100%);
  height: 100%;
  overflow: auto;
  border-left: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: -8px 0 30px rgb(15 23 42 / 18%);
}

.drawer-header {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.drawer-header h2 {
  margin: 0;
  font-size: 16px;
}

.drawer-header p {
  margin: 2px 0 0;
  color: var(--color-text-muted);
  font-size: 12px;
}

.close-button {
  height: 32px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface-muted);
  color: var(--color-text);
  padding: 0 12px;
}

.drawer-content {
  display: grid;
  gap: 14px;
  padding: 16px;
}

.drawer-section {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.drawer-section h3 {
  margin: 0 0 10px;
  font-size: 13px;
}

.section-title h3 {
  margin-bottom: 0;
}

.field-list {
  display: grid;
  gap: 8px;
  margin: 0;
}

.field-item {
  display: grid;
  grid-template-columns: 140px minmax(0, 1fr);
  gap: 12px;
  min-width: 0;
}

.field-item dt {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.field-item dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 12px;
  font-weight: 600;
}

.payload-facts {
  margin-bottom: 10px;
}

.payload {
  margin: 0;
  padding: 10px;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: #fbfcfd;
  color: #10202f;
  font-size: 12px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 560px) {
  .field-item {
    grid-template-columns: 1fr;
    gap: 2px;
  }
}
</style>
