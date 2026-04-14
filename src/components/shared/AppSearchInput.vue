<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { Search, X } from 'lucide-vue-next'

interface Props {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  class?: HTMLAttributes['class']
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  placeholder: 'Buscar...',
  disabled: false,
  class: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const updateValue = (value: string | number) => {
  emit('update:modelValue', String(value))
}

const clearValue = () => {
  emit('update:modelValue', '')
}
</script>

<template>
  <div :class="['app-search-input', props.class]">
    <Search class="app-search-icon" />

    <input
      :value="props.modelValue"
      :placeholder="props.placeholder"
      :disabled="props.disabled"
      class="app-search-field"
      type="text"
      @input="updateValue(($event.target as HTMLInputElement).value)"
    />

    <button
      v-if="props.modelValue"
      type="button"
      class="app-search-clear"
      @click="clearValue"
    >
      <X class="app-search-clear-icon" />
      <span class="sr-only">Limpiar busqueda</span>
    </button>
  </div>
</template>

<style scoped>
.app-search-input {
  position: relative;
  width: 100%;
}

.app-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  width: 16px;
  height: 16px;
  color: #94a3b8;
  transform: translateY(-50%);
  pointer-events: none;
}

.app-search-field {
  width: 100%;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #fff;
  padding: 10px 40px 10px 36px;
  font-size: 13px;
  color: #334155;
  outline: none;
}

.app-search-field:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.app-search-field:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}

.app-search-clear {
  position: absolute;
  right: 6px;
  top: 50%;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
}

.app-search-clear:hover {
  background: #eff6ff;
  color: #2563eb;
}

.app-search-clear-icon {
  width: 16px;
  height: 16px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
