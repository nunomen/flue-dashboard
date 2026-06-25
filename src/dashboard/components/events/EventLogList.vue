<script setup lang="ts">
import { computed } from 'vue'

import type { DashboardEventRecord } from '@shared/types'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{
  events: readonly DashboardEventRecord[]
}>()

const emit = defineEmits<{
  inspect: [event: DashboardEventRecord]
}>()

const logEvents = computed(() => props.events.filter((event) =>
  event.category === 'log' || event.category === 'error' || event.level === 'warn' || event.level === 'error',
))
</script>

<template>
  <section class="logs" aria-label="Logs and errors">
    <header class="section-header">
      <h2>Logs</h2>
      <span>{{ logEvents.length }} entries</span>
    </header>

    <ul class="log-list">
      <li v-for="event in logEvents" :key="event.id" class="log-item" :class="`log-${event.level ?? event.category}`">
        <button class="log-button" type="button" @click="emit('inspect', event)">
          <span class="log-meta">
            <strong>{{ event.level ?? event.category }}</strong>
            <time>{{ formatDateTime(event.timestamp) }}</time>
          </span>
          <span class="log-message">{{ event.message ?? event.type }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
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

.log-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.log-button {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 10px;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--color-border);
  border-left-width: 3px;
  border-radius: var(--radius);
  background: var(--color-surface);
  color: inherit;
  text-align: left;
}

.log-error .log-button {
  border-left-color: var(--color-red);
}

.log-warn .log-button {
  border-left-color: var(--color-amber);
}

.log-info .log-button,
.log-debug .log-button,
.log-log .log-button {
  border-left-color: var(--color-blue);
}

.log-meta {
  display: grid;
  gap: 2px;
  color: var(--color-text-muted);
  font-size: 12px;
}

.log-meta strong {
  color: var(--color-text);
  text-transform: capitalize;
}

.log-message {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 640px) {
  .log-button {
    grid-template-columns: 1fr;
  }
}
</style>
