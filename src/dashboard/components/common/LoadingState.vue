<script setup lang="ts">
const props = defineProps<{
  label?: string
}>()
</script>

<template>
  <div class="loading" role="status">
    <span class="spinner" aria-hidden="true"></span>
    <span>{{ props.label ?? 'Loading' }}</span>
  </div>
</template>

<style scoped>
.loading {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-text-muted);
  font-size: 13px;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid var(--color-border);
  border-top-color: var(--color-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
