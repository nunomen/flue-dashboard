<script setup lang="ts">
const props = defineProps<{
  title: string
  detail?: string
}>()
</script>

<template>
  <div class="empty">
    <strong class="empty-title">{{ props.title }}</strong>
    <p v-if="props.detail" class="empty-detail">{{ props.detail }}</p>
  </div>
</template>

<style scoped>
.empty {
  padding: 28px;
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius);
  background: var(--color-surface);
  color: var(--color-text-muted);
  text-align: center;
}

.empty-title {
  display: block;
  color: var(--color-text);
  font-size: 14px;
}

.empty-detail {
  margin: 6px 0 0;
  font-size: 13px;
}
</style>
