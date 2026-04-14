<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'

interface Props {
  open: boolean
  empresaNombre: string
  submitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [motivo: string]
}>()

const motivo = shallowRef('')
const localError = shallowRef('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      motivo.value = ''
      localError.value = ''
    }
  },
)

const canSubmit = computed(() => motivo.value.trim().length >= 6 && !props.submitting)

const handleSubmit = () => {
  if (!canSubmit.value) {
    localError.value = 'Ingresa un motivo de al menos 6 caracteres.'
    return
  }

  localError.value = ''
  emit('submit', motivo.value.trim())
}
</script>

<template>
  <AppModal
    :open="open"
    size="sm"
    title="Suspender empresa"
    :description="`Esta accion revocara la operacion del workspace ${empresaNombre}.`"
    @close="emit('update:open', false)"
  >
    <div class="suspend-dialog">
      <div class="inline-alert inline-alert-danger">
        <strong>Alto impacto</strong>
        <span>El workspace dejara de operar y no existe un flujo expuesto de reactivacion desde este panel.</span>
      </div>

      <div v-if="localError" class="inline-alert inline-alert-danger">
        <strong>No se pudo continuar</strong>
        <span>{{ localError }}</span>
      </div>

      <div class="form-group">
        <label class="form-label" for="empresa-suspension-motivo">Motivo</label>
        <textarea
          id="empresa-suspension-motivo"
          v-model="motivo"
          class="form-textarea"
          placeholder="Ejemplo: incumplimiento operativo o bloqueo temporal por auditoria."
        />
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn-secondary" @click="emit('update:open', false)">Cancelar</button>
      <button type="button" class="btn-danger" :disabled="!canSubmit" @click="handleSubmit">
        {{ submitting ? 'Suspendiendo...' : 'Confirmar suspension' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.suspend-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inline-alert {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
}

.inline-alert-danger {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.form-textarea {
  width: 100%;
  min-height: 132px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.form-textarea:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.btn-secondary,
.btn-danger {
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}

.btn-secondary {
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #475569;
}

.btn-danger {
  border: none;
  background: #dc2626;
  color: #fff;
}

.btn-danger:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}
</style>
