<script setup lang="ts">
import { computed } from 'vue'

import type { PayloadPreview } from '@shared/types'
import JsonBlock from '../common/JsonBlock.vue'

const props = defineProps<{
  title: string
  preview: PayloadPreview
}>()

const flags = computed(() => [
  props.preview.kind,
  props.preview.redacted ? 'redacted' : null,
  props.preview.truncated ? 'truncated' : null,
].filter(Boolean))

const payloadValue = computed(() => props.preview.entries ?? props.preview.value ?? null)
</script>

<template>
  <section class="payload-panel" :aria-label="props.title">
    <header class="panel-header">
      <div>
        <h2>{{ props.title }}</h2>
        <p>{{ props.preview.label }}</p>
      </div>
      <span class="flag-list">{{ flags.join(' / ') }}</span>
    </header>

    <details class="details">
      <summary>Redacted preview</summary>
      <JsonBlock :value="payloadValue" empty-label="No payload fields" />
    </details>
  </section>
</template>

<style scoped>
.payload-panel {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.panel-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.panel-header h2 {
  margin: 0 0 3px;
  font-size: 13px;
}

.panel-header p,
.flag-list {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
}

.flag-list {
  white-space: nowrap;
}

.details summary {
  color: var(--color-blue);
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}
</style>
