<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import Button from 'primevue/button'
import AppDialog from '@/components/shared/AppDialog.vue'

interface Props {
  open: boolean
  empresaNombre: string
  submitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: []
}>()

const confirmName = shallowRef('')
const localError = shallowRef('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      confirmName.value = ''
      localError.value = ''
    }
  },
)

const canSubmit = computed(() => {
  return confirmName.value.trim() === props.empresaNombre.trim() && !props.submitting
})

const handleSubmit = () => {
  if (!canSubmit.value) {
    localError.value = 'El nombre ingresado no coincide con el de la empresa.'
    return
  }

  localError.value = ''
  emit('submit')
}
</script>

<template>
  <AppDialog
    :open="open"
    width="sm"
    title="Eliminar Empresa Permanentemente"
    :description="`Esta accion borrara de forma irreversible el workspace '${empresaNombre}'.`"
    @close="emit('update:open', false)"
  >
    <div class="delete-dialog">
      <div class="inline-alert inline-alert-danger">
        <div class="inline-alert__header">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <strong>Peligro - Operación Crítica</strong>
        </div>
        <p class="alert-body">
          Esta acción eliminará completamente la empresa, todas sus membresías de distribuidores, contratos digitales firmados, transacciones financieras, historial de rangos y todos los archivos del almacenamiento. <strong>Esta acción NO se puede deshacer.</strong>
        </p>
      </div>

      <div v-if="localError" class="inline-alert inline-alert-error">
        <strong>Error de confirmación</strong>
        <span>{{ localError }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="empresa-delete-confirm">
          Para confirmar, escribe <strong class="select-none text-red-700">"{{ empresaNombre }}"</strong> a continuación:
        </label>
        <input
          id="empresa-delete-confirm"
          v-model="confirmName"
          type="text"
          class="form-input"
          :placeholder="`Escribe ${empresaNombre}`"
          autocomplete="off"
          @keyup.enter="handleSubmit"
        />
      </div>
    </div>

    <template #footer>
      <Button type="button" label="Cancelar" severity="secondary" outlined @click="emit('update:open', false)" />
      <Button
        type="button"
        :label="submitting ? 'Eliminando...' : 'Eliminar Permanentemente'"
        severity="danger"
        :disabled="!canSubmit"
        @click="handleSubmit"
      />
    </template>
  </AppDialog>
</template>

<style scoped>
.delete-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inline-alert {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.5;
}

.inline-alert-danger {
  border: 1px solid #fee2e2;
  background: #fdf2f2;
  color: #991b1b;
}

.inline-alert-error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.inline-alert__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.alert-icon {
  flex-shrink: 0;
}

.alert-body {
  margin: 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: #475569;
  line-height: 1.4;
}

.form-input {
  width: 100%;
  height: 38px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #fff;
  padding: 0 12px;
  font-size: 13px;
  color: #1e293b;
  outline: none;
  transition: all 0.2s;
}

.form-input:focus {
  border-color: #f87171;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
}

.select-none {
  user-select: none;
}
</style>
