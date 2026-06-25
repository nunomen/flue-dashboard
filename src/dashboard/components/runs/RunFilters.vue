<script setup lang="ts">
import type { DashboardRunStatus } from '@shared/types'
import type { RunFiltersState } from '@/composables/useRuns'

const props = defineProps<{
  filters: Readonly<RunFiltersState>
  workflows: string[]
}>()

const emit = defineEmits<{
  change: [filters: Partial<RunFiltersState>]
  refresh: []
}>()

const statuses: Array<DashboardRunStatus | 'all'> = ['all', 'queued', 'running', 'completed', 'failed', 'canceled', 'unknown']

function readValue(event: Event): string {
  return (event.target as HTMLInputElement | HTMLSelectElement).value
}

function readLimit(event: Event): number {
  return Number((event.target as HTMLInputElement).value)
}
</script>

<template>
  <form class="filters" @submit.prevent="emit('refresh')">
    <label class="field">
      <span class="field-label">Status</span>
      <select
        class="control"
        :value="props.filters.status"
        @change="emit('change', { status: readValue($event) as DashboardRunStatus | 'all' })"
      >
        <option v-for="status in statuses" :key="status" :value="status">{{ status }}</option>
      </select>
    </label>

    <label class="field">
      <span class="field-label">Workflow</span>
      <select
        class="control"
        :value="props.filters.workflow"
        @change="emit('change', { workflow: readValue($event) })"
      >
        <option value="">All workflows</option>
        <option v-for="workflow in props.workflows" :key="workflow" :value="workflow">{{ workflow }}</option>
      </select>
    </label>

    <label class="field field-search">
      <span class="field-label">Search</span>
      <input
        class="control"
        type="search"
        :value="props.filters.search"
        placeholder="Run ID, workflow, status"
        @input="emit('change', { search: readValue($event) })"
      />
    </label>

    <label class="field field-limit">
      <span class="field-label">Limit</span>
      <input
        class="control"
        type="number"
        min="1"
        max="500"
        :value="props.filters.limit"
        @change="emit('change', { limit: readLimit($event) })"
      />
    </label>

    <button class="refresh-button" type="submit">Refresh</button>
  </form>
</template>

<style scoped>
.filters {
  display: grid;
  grid-template-columns: minmax(120px, 160px) minmax(150px, 220px) minmax(180px, 1fr) 90px auto;
  gap: 10px;
  align-items: end;
}

.field {
  display: grid;
  gap: 4px;
}

.field-label {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
}

.control {
  width: 100%;
  height: 34px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text);
  padding: 0 10px;
}

.control:focus {
  border-color: var(--color-blue);
  outline: 2px solid rgb(36 99 167 / 15%);
}

.refresh-button {
  height: 34px;
  border: 1px solid var(--color-blue);
  border-radius: var(--radius);
  background: var(--color-blue);
  color: white;
  font-weight: 650;
  padding: 0 14px;
}

@media (max-width: 860px) {
  .filters {
    grid-template-columns: 1fr 1fr;
  }

  .field-search {
    grid-column: 1 / -1;
  }
}

@media (max-width: 560px) {
  .filters {
    grid-template-columns: 1fr;
  }
}
</style>
