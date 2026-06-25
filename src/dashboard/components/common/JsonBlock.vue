<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  value: unknown
  emptyLabel?: string
}>()

const formatted = computed(() => JSON.stringify(props.value, null, 2))
const isEmpty = computed(() => {
  if (props.value == null) return true
  if (Array.isArray(props.value)) return props.value.length === 0
  if (typeof props.value === 'object') return Object.keys(props.value).length === 0
  return false
})
</script>

<template>
  <p v-if="isEmpty" class="json-empty">{{ props.emptyLabel ?? 'No data' }}</p>
  <pre v-else class="json-block">{{ formatted }}</pre>
</template>

<style scoped>
.json-empty {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
}

.json-block {
  max-height: 280px;
  margin: 0;
  overflow: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: #fbfcfd;
  color: #10202f;
  font-size: 12px;
  line-height: 1.5;
  padding: 10px;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
