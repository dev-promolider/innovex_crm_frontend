<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { mediosPago, type MedioPago, type PagoCuotaPayload } from '../types'

interface CuotaToPay {
  id: number
  numero: number
  total_cuotas: number
  saldo: number
  moneda: string
}

const props = defineProps<{
  open: boolean
  cuota: CuotaToPay | null
  submitting: boolean
  errorMessage: string
}>()

const emit = defineEmits<{
  close: []
  submit: [cuotaId: number, payload: PagoCuotaPayload]
}>()

const { formatCurrency } = useWorkspaceCurrency()

const todayIso = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const form = reactive({
  monto: '',
  medio_pago: 'transferencia' as MedioPago,
  referencia: '',
  fecha: todayIso(),
  notas: '',
})
const localError = ref('')
const maxDate = computed(() => todayIso())

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen || !props.cuota) return
    form.monto = String(props.cuota.saldo)
    form.medio_pago = 'transferencia'
    form.referencia = ''
    form.fecha = todayIso()
    form.notas = ''
    localError.value = ''
  },
)

const submit = () => {
  if (!props.cuota) return
  const monto = Number(form.monto)

  if (!Number.isFinite(monto) || monto <= 0) {
    localError.value = 'Escribe un monto mayor a cero.'
    return
  }
  if (monto > props.cuota.saldo) {
    localError.value = `El monto no puede superar el saldo de ${formatCurrency(props.cuota.saldo, props.cuota.moneda)}.`
    return
  }
  if (!form.referencia.trim()) {
    localError.value = 'Escribe la referencia del pago.'
    return
  }

  localError.value = ''
  const payload: PagoCuotaPayload = {
    monto,
    medio_pago: form.medio_pago,
    referencia: form.referencia.trim(),
  }
  if (form.fecha) {
    payload.pagado_en = form.fecha === todayIso()
      ? new Date().toISOString()
      : new Date(`${form.fecha}T12:00:00`).toISOString()
  }
  if (form.notas.trim()) payload.notas = form.notas.trim()

  emit('submit', props.cuota.id, payload)
}
</script>

<template>
  <AppModal
    :open="open"
    title="Registrar pago"
    :description="cuota ? `Cuota ${cuota.numero} de ${cuota.total_cuotas} · Saldo ${formatCurrency(cuota.saldo, cuota.moneda)}` : ''"
    size="md"
    @close="emit('close')"
  >
    <form id="pago-cuota-form" class="pago-form" @submit.prevent="submit">
      <label class="pago-field">
        <span>Monto</span>
        <input v-model="form.monto" type="number" min="0" step="0.01" inputmode="decimal" required />
      </label>
      <label class="pago-field">
        <span>Medio de pago</span>
        <select v-model="form.medio_pago">
          <option v-for="medio in mediosPago" :key="medio.value" :value="medio.value">{{ medio.label }}</option>
        </select>
      </label>
      <label class="pago-field">
        <span>Referencia</span>
        <input v-model="form.referencia" type="text" maxlength="60" placeholder="Número de referencia" required />
      </label>
      <DatePicker v-model="form.fecha" label="Fecha del pago" id="pago-cuota-fecha" :max="maxDate" />
      <label class="pago-field">
        <span>Notas (opcional)</span>
        <textarea v-model="form.notas" rows="2" maxlength="300" />
      </label>
      <p v-if="localError || errorMessage" class="pago-error" role="alert">{{ localError || errorMessage }}</p>
    </form>

    <template #footer>
      <button type="button" class="pago-btn" :disabled="submitting" @click="emit('close')">Cancelar</button>
      <button type="submit" form="pago-cuota-form" class="pago-btn pago-btn--primary" :disabled="submitting">
        {{ submitting ? 'Registrando…' : 'Registrar pago' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.pago-form { display: flex; flex-direction: column; gap: 14px; }
.pago-field { display: flex; flex-direction: column; gap: 5px; color: #475569; font-size: 12px; font-weight: 600; }
.pago-field input, .pago-field select, .pago-field textarea { width: 100%; box-sizing: border-box; padding: 9px 10px; border: 1px solid #dbe3ef; border-radius: 7px; color: #172033; background: white; font: inherit; font-weight: 400; }
.pago-error { margin: 0; padding: 10px 12px; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; color: #b91c1c; font-size: 13px; }
.pago-btn { height: 40px; padding: 0 16px; border: 1px solid #dbe3ef; border-radius: 8px; background: white; color: #1a1a1a; font-weight: 600; cursor: pointer; }
.pago-btn--primary { border-color: #1768b8; background: #1768b8; color: white; }
.pago-btn:disabled { opacity: .6; cursor: not-allowed; }
</style>
