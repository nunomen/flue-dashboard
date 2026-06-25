<script setup lang="ts">
import type { WaterfallSpan } from '@/composables/useRunWaterfall'
import { formatDuration } from '@/utils/format'

const props = defineProps<{
  spans: readonly WaterfallSpan[]
}>()
</script>

<template>
  <section class="waterfall" aria-label="Event waterfall">
    <header class="section-header">
      <h2>Waterfall</h2>
      <span>Span timing</span>
    </header>

    <div class="waterfall-grid">
      <div v-for="span in props.spans" :key="span.id" class="span-row">
        <span class="span-label">{{ span.label }}</span>
        <div class="track">
          <div
            class="bar"
            :class="`bar-${span.category}`"
            :style="{ left: `${span.leftPercent}%`, width: `${span.widthPercent}%` }"
          >
            <span class="bar-label">{{ formatDuration(span.durationMs) }}</span>
          </div>
        </div>
      </div>
    </div>
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

.waterfall-grid {
  display: grid;
  gap: 8px;
}

.span-row {
  display: grid;
  grid-template-columns: minmax(110px, 180px) minmax(160px, 1fr);
  gap: 10px;
  align-items: center;
}

.span-label {
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.track {
  position: relative;
  height: 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface-muted);
}

.bar {
  position: absolute;
  top: 3px;
  bottom: 3px;
  min-width: 8px;
  border-radius: 4px;
  background: var(--color-text-muted);
}

.bar-label {
  position: absolute;
  left: 6px;
  top: 1px;
  overflow: hidden;
  max-width: calc(100% - 8px);
  color: white;
  font-size: 11px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bar-lifecycle { background: var(--color-green); }
.bar-operation { background: var(--color-blue); }
.bar-model { background: var(--color-violet); }
.bar-tool { background: var(--color-amber); }
.bar-task { background: #48606f; }
.bar-compaction { background: #7c6f64; }
.bar-log { background: var(--color-text-muted); }
.bar-error { background: var(--color-red); }

@media (max-width: 640px) {
  .span-row {
    grid-template-columns: 1fr;
  }
}
</style>
