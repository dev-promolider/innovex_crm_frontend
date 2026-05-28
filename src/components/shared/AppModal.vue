<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl'

interface Props {
  open: boolean
  title: string
  description?: string
  size?: ModalSize
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  size: 'md',
})

const emit = defineEmits<{
  close: []
}>()

const modalClass = computed(() => ['modal', `modal-${props.size}`])

const requestClose = () => {
  emit('close')
}

const handleKeydown = (event: KeyboardEvent) => {
  if (props.open && event.key === 'Escape') {
    requestClose()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div v-if="open" class="modal-overlay" @click.self="requestClose">
    <div :class="modalClass">
      <div class="modal-header">
        <div class="modal-header-copy">
          <h2 class="modal-title">{{ title }}</h2>
          <p v-if="description" class="modal-description">{{ description }}</p>
        </div>

        <button type="button" class="modal-close" @click="requestClose">✕</button>
      </div>

      <div class="modal-body">
        <slot />
      </div>

      <div v-if="$slots.footer" class="modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.46);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 220;
  padding: 18px;
}

.modal {
  width: 560px;
  max-width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 24px 80px rgba(15, 23, 42, 0.24);
}

.modal-sm {
  width: 440px;
}

.modal-md {
  width: 560px;
}

.modal-lg {
  width: 760px;
}

.modal-xl {
  width: min(1040px, calc(100vw - 36px));
}

.modal-xl .modal-body {
  padding-top: 16px;
}

.modal-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 22px 24px 0;
}

.modal-header-copy {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #172033;
}

.modal-description {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: #64748b;
}

.modal-close {
  border: none;
  background: transparent;
  padding: 4px;
  font-size: 18px;
  line-height: 1;
  color: #94a3b8;
  cursor: pointer;
}

.modal-body {
  padding: 20px 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 24px 22px;
}

@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
    align-items: flex-end;
  }

  .modal,
  .modal-sm,
  .modal-md,
  .modal-lg,
  .modal-xl {
    width: 100%;
    max-height: 94vh;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .modal-header,
  .modal-body,
  .modal-footer {
    padding-left: 18px;
    padding-right: 18px;
  }

  .modal-footer {
    flex-direction: column-reverse;
  }
}
</style>