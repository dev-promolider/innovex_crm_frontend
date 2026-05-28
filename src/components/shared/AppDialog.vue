<script setup lang="ts">
import { computed } from 'vue'
import Dialog from 'primevue/dialog'

type DialogWidth = 'sm' | 'md' | 'lg' | 'xl'
type DialogBreakpoints = Record<string, string>

interface Props {
  open: boolean
  title: string
  description?: string
  width?: DialogWidth
  customWidth?: string
  breakpoints?: DialogBreakpoints
  modal?: boolean
  dismissableMask?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  description: '',
  width: 'md',
  customWidth: undefined,
  breakpoints: undefined,
  modal: true,
  dismissableMask: true,
})

const emit = defineEmits<{
  close: []
  'update:open': [value: boolean]
}>()

const visible = computed({
  get: () => props.open,
  set: (value: boolean) => {
    emit('update:open', value)

    if (!value) {
      emit('close')
    }
  },
})

const dialogStyle = computed(() => {
  const widthMap: Record<DialogWidth, string> = {
    sm: '28rem',
    md: '36rem',
    lg: '48rem',
    xl: '64rem',
  }

  return { width: props.customWidth ?? widthMap[props.width] }
})
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="props.title"
    :modal="props.modal"
    :dismissable-mask="props.dismissableMask"
    :style="dialogStyle"
    :breakpoints="props.breakpoints"
  >
    <span v-if="props.description" class="app-dialog-description">
      {{ props.description }}
    </span>

    <div class="app-dialog-body">
      <slot />
    </div>

    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </Dialog>
</template>

<style scoped>
.app-dialog-description {
  display: block;
  margin-bottom: 1.25rem;
}

.app-dialog-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
