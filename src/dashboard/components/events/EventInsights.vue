<script setup lang="ts">
import type { RunEventStats } from '@/composables/useRunEventStats'
import { formatDuration, formatNumber } from '@/utils/format'

const props = defineProps<{
  stats: RunEventStats
}>()
</script>

<template>
  <section class="insights" aria-label="Event insights">
    <header class="section-header">
      <h2>Event data</h2>
      <span>{{ props.stats.typeCounts.length }} event types</span>
    </header>

    <div class="insight-grid">
      <div class="insight-group">
        <h3>Categories</h3>
        <dl class="count-list">
          <div v-for="item in props.stats.categoryCounts" :key="item.label" class="count-item">
            <dt>{{ item.label }}</dt>
            <dd>{{ formatNumber(item.count) }}</dd>
          </div>
        </dl>
      </div>

      <div class="insight-group">
        <h3>Levels</h3>
        <dl class="count-list">
          <div v-for="item in props.stats.levelCounts" :key="item.label" class="count-item">
            <dt>{{ item.label }}</dt>
            <dd>{{ formatNumber(item.count) }}</dd>
          </div>
        </dl>
      </div>

      <div class="insight-group insight-group-wide">
        <h3>Types</h3>
        <dl class="type-list">
          <div v-for="item in props.stats.typeCounts" :key="item.label" class="type-item">
            <dt>{{ item.label }}</dt>
            <dd>{{ formatNumber(item.count) }}</dd>
          </div>
        </dl>
      </div>

      <div class="insight-group insight-group-wide">
        <h3>Slowest events</h3>
        <ol class="slow-list">
          <li v-for="event in props.stats.slowestEvents" :key="event.id">
            <span>{{ event.message ?? event.type }}</span>
            <strong>{{ formatDuration(event.durationMs) }}</strong>
          </li>
        </ol>
        <p v-if="props.stats.slowestEvents.length === 0" class="empty-text">No event durations recorded</p>
      </div>

      <div class="insight-group insight-group-wide">
        <h3>Correlation keys</h3>
        <dl class="correlation-list">
          <div v-for="item in props.stats.correlationSummaries" :key="item.field" class="correlation-item">
            <dt>{{ item.field }}</dt>
            <dd>
              <span>{{ formatNumber(item.count) }}</span>
              <small>{{ item.values.length > 0 ? item.values.join(', ') : 'No values' }}</small>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.insights {
  min-width: 0;
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

.insight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.insight-group {
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
}

.insight-group-wide {
  grid-column: 1 / -1;
}

.insight-group h3 {
  margin: 0 0 10px;
  font-size: 13px;
}

.count-list,
.type-list,
.correlation-list {
  display: grid;
  gap: 7px;
  margin: 0;
}

.count-item,
.type-item,
.correlation-item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  min-width: 0;
}

.count-item dt,
.type-item dt,
.correlation-item dt {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count-item dd,
.type-item dd,
.correlation-item dd {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
}

.correlation-item dd {
  display: grid;
  justify-items: end;
  min-width: 0;
}

.correlation-item small {
  overflow: hidden;
  max-width: 280px;
  color: var(--color-text-muted);
  font-weight: 400;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slow-list {
  display: grid;
  gap: 7px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.slow-list li {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
}

.slow-list span {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.slow-list strong {
  font-size: 12px;
}

.empty-text {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 12px;
}

@media (max-width: 640px) {
  .insight-grid {
    grid-template-columns: 1fr;
  }

  .insight-group-wide {
    grid-column: auto;
  }
}
</style>
