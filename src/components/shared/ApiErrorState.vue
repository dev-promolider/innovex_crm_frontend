<script setup lang="ts">
withDefaults(defineProps<{
  message: string
  retrying?: boolean
}>(), {
  retrying: false,
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div class="api-error-state" role="alert">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4m0 4h.01" />
    </svg>
    <span>{{ message }}</span>
    <button type="button" :disabled="retrying" @click="emit('retry')">
      {{ retrying ? 'Reintentando...' : 'Reintentar' }}
    </button>
  </div>
</template>

<style scoped>
.api-error-state {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid #f2d7d5;
  border-radius: 10px;
  background: #fff8f7;
  color: #8f3a35;
  font-size: 13px;
  line-height: 1.45;
}

.api-error-state svg {
  flex: 0 0 auto;
  color: #c9827c;
}

.api-error-state span {
  flex: 1;
}

.api-error-state button {
  flex: 0 0 auto;
  border: 1px solid #e8c2bf;
  border-radius: 8px;
  padding: 7px 10px;
  background: #fff;
  color: #8f3a35;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.api-error-state button:disabled {
  cursor: wait;
  opacity: 0.65;
}

@media (max-width: 480px) {
  .api-error-state {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .api-error-state span {
    flex-basis: calc(100% - 36px);
  }

  .api-error-state button {
    margin-left: 32px;
  }
}
</style>
