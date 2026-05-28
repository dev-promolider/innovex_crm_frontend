<script setup lang="ts">
import { shallowRef, watch } from 'vue'
import AppDialog from '@/components/shared/AppDialog.vue'
import type { LedgerMovement } from '@/features/deudas/types'

const props = defineProps<{
  open: boolean
  movement: LedgerMovement | null
  submitting: boolean
  errorMessage?: string
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: { movementId: number; motivo: string }]
}>()

const motivo = shallowRef('')

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      motivo.value = ''
    }
  },
)

const submit = () => {
  if (!props.movement || motivo.value.trim().length === 0) {
    return
  }

  emit('submit', {
    movementId: props.movement.id,
    motivo: motivo.value.trim(),
  })
}
</script>

<template>
  <AppDialog
    :open="props.open"
    title="Reversar movimiento"
    description="La reversa crea una nueva transacción enlazada. El movimiento original no se modifica."
    width="md"
    @update:open="emit('update:open', $event)"
  >
    <div v-if="props.movement" class="reversal-summary">
      <strong>#{{ props.movement.id }} · {{ props.movement.tipo.replace(/_/g, ' ') }}</strong>
      <span>{{ props.movement.descripcion ?? 'Sin descripción' }}</span>
    </div>

    <label class="finance-field">
      <span>Motivo obligatorio</span>
      <textarea v-model="motivo" maxlength="500" rows="4" placeholder="Explica por qué se reversa este movimiento." />
    </label>

    <p v-if="props.errorMessage" class="finance-error">{{ props.errorMessage }}</p>

    <template #footer>
      <button class="admin-btn admin-btn--outline" type="button" @click="emit('update:open', false)">Cancelar</button>
      <button class="admin-btn admin-btn--danger" type="button" :disabled="props.submitting || !motivo.trim()" @click="submit">
        {{ props.submitting ? 'Reversando...' : 'Crear reversa' }}
      </button>
    </template>
  </AppDialog>
</template>

<style scoped>
.reversal-summary,
.finance-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reversal-summary {
  background: #f8fafc;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  padding: 12px;
}

.reversal-summary span,
.finance-field span {
  color: #64748b;
  font-size: 12px;
}

.finance-field textarea {
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 14px;
  padding: 10px 12px;
  resize: vertical;
}

.finance-error {
  color: #b91c1c;
  font-size: 13px;
  margin: 0;
}
</style>
