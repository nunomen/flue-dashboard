<script setup lang="ts">
const props = defineProps<{
  message: string
}>()
</script>

<template>
  <div class="error-panel" role="alert">
    <strong class="error-title">Request failed</strong>
    <p class="error-message">{{ props.message }}</p>
  </div>
</template>

<style scoped>
.error-panel {
  padding: 12px;
  border: 1px solid rgb(180 35 53 / 35%);
  border-radius: var(--radius);
  background: rgb(180 35 53 / 8%);
  color: var(--color-red);
}

.error-title {
  display: block;
  font-size: 13px;
}

.error-message {
  margin: 4px 0 0;
  color: var(--color-text);
  font-size: 13px;
}
</style>
