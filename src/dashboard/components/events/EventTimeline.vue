<script setup lang="ts">
import type { DashboardEventRecord } from '@shared/types'
import { formatDateTime } from '@/utils/format'

const props = defineProps<{
  events: readonly DashboardEventRecord[]
}>()

const emit = defineEmits<{
  inspect: [event: DashboardEventRecord]
}>()
</script>

<template>
  <section class="timeline" aria-label="Event timeline">
    <header class="section-header">
      <h2>Timeline</h2>
      <span>{{ props.events.length }} events</span>
    </header>

    <ol class="timeline-list">
      <li v-for="event in props.events" :key="event.id" class="timeline-item">
        <span class="marker" :class="`marker-${event.category}`" aria-hidden="true"></span>
        <button class="event-button" type="button" @click="emit('inspect', event)">
          <span class="event-main">
            <strong>{{ event.message ?? event.type }}</strong>
            <span>{{ event.type }}</span>
          </span>
          <time>{{ formatDateTime(event.timestamp) }}</time>
        </button>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.timeline {
  min-width: 0;
}

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

.timeline-list {
  display: grid;
  gap: 8px;
  max-height: 420px;
  margin: 0;
  padding: 0;
  overflow: auto;
  list-style: none;
}

.timeline-item {
  display: grid;
  grid-template-columns: 14px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
}

.marker {
  width: 10px;
  height: 10px;
  margin-top: 12px;
  border-radius: 50%;
  background: var(--color-text-muted);
}

.marker-lifecycle { background: var(--color-green); }
.marker-operation { background: var(--color-blue); }
.marker-model { background: var(--color-violet); }
.marker-tool { background: var(--color-amber); }
.marker-task { background: #48606f; }
.marker-compaction { background: #7c6f64; }
.marker-log { background: var(--color-text-muted); }
.marker-error { background: var(--color-red); }

.event-button {
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 9px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: inherit;
  text-align: left;
}

.event-button:hover {
  border-color: var(--color-border-strong);
  background: var(--color-surface-muted);
}

.event-main {
  display: grid;
  min-width: 0;
  overflow: hidden;
  gap: 2px;
}

.event-main strong {
  overflow: hidden;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-main span,
.event-button time {
  color: var(--color-text-muted);
  font-size: 12px;
}

.event-button time {
  white-space: nowrap;
}
</style>
