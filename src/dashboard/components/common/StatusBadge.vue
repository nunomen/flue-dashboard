<script setup lang="ts">
import { computed } from 'vue'

import type { DashboardRunStatus } from '@shared/types'

const props = defineProps<{
  status: DashboardRunStatus
}>()

const badgeClass = computed(() => ({
  badge: true,
  [`badge-${props.status}`]: true,
}))
</script>

<template>
  <span :class="badgeClass">{{ props.status }}</span>
</template>

<style scoped>
.badge {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 2px 8px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.badge-running {
  border-color: rgb(36 99 167 / 35%);
  background: rgb(36 99 167 / 10%);
  color: var(--color-blue);
}

.badge-completed {
  border-color: rgb(22 115 92 / 35%);
  background: rgb(22 115 92 / 10%);
  color: var(--color-green);
}

.badge-failed {
  border-color: rgb(180 35 53 / 35%);
  background: rgb(180 35 53 / 10%);
  color: var(--color-red);
}

.badge-canceled,
.badge-queued,
.badge-unknown {
  color: var(--color-text-muted);
}
</style>
