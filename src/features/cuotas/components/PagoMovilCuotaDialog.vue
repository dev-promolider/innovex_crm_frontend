<script setup lang="ts">
import axios from 'axios'
import { computed, onBeforeUnmount, reactive, shallowRef, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import PhoneInput from '@/components/shared/PhoneInput.vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import { isValidPositiveDecimal, sanitizeDecimal, sanitizeDocument, sanitizeInteger, validateDocument, validatePhoneDigits } from '@/utils/fieldRules'
import { usePagoMovilApi, type PagoConfirmado, type PagoIniciado } from '../composables/usePagoMovilApi'
import { formatVencimiento } from '../utils'

interface CuotaToPay {
  id: number
  numero: number
  total_cuotas: number
  monto: number
  saldo: number
  moneda: string
  fecha_vencimiento: string
}

const MAX_INTENTOS = 3
const CODE_LENGTH = 6

const props = defineProps<{ open: boolean; cuota: CuotaToPay | null }>()
const emit = defineEmits<{ close: []; paid: [] }>()

type Step = 'datos' | 'codigo' | 'exito'

const { formatCurrency } = useWorkspaceCurrency()
const { bancos, isLoadingBancos, bancosError, fetchBancos, iniciarPago, confirmarPago } = usePagoMovilApi()

const step = shallowRef<Step>('datos')
const form = reactive({ banco: '', cedulaTipo: 'V', cedula: '', telefono: '', monto: '' })
const touched = reactive({ banco: false, cedula: false, telefono: false, monto: false })
const codigo = shallowRef('')
const submitting = shallowRef(false)
const errorMessage = shallowRef('')
const notice = shallowRef('')
const iniciado = shallowRef<PagoIniciado | null>(null)
const confirmado = shallowRef<PagoConfirmado | null>(null)
const intentos = shallowRef(MAX_INTENTOS)
const now = shallowRef(Date.now())
const phoneKey = shallowRef(0)
let timer: ReturnType<typeof setInterval> | undefined

const stopTimer = () => {
  clearInterval(timer)
  timer = undefined
}

const secondsLeft = computed(() =>
  iniciado.value ? Math.max(0, Math.ceil((new Date(iniciado.value.expira_en).getTime() - now.value) / 1000)) : 0,
)
const countdown = computed(() => {
  const minutes = Math.floor(secondsLeft.value / 60)
  return `${minutes}:${String(secondsLeft.value % 60).padStart(2, '0')}`
})

const montoError = computed(() => {
  if (!props.cuota) return ''
  if (!isValidPositiveDecimal(form.monto)) return 'Escribe un monto mayor a cero (máximo 2 decimales).'
  if (Number(form.monto) > props.cuota.saldo) return `El monto no puede superar el saldo de ${formatCurrency(props.cuota.saldo, props.cuota.moneda)}.`
  return ''
})
const bancoError = computed(() => (form.banco ? '' : 'Elige tu banco.'))
const cedulaError = computed(() => validateDocument(form.cedula, 'cedula'))
const telefonoNational = computed(() => form.telefono.replace(/^\+58/, ''))
const telefonoError = computed(() => {
  if (!form.telefono.startsWith('+58')) return 'Usa un teléfono venezolano (+58).'
  return validatePhoneDigits(telefonoNational.value, 'VE').replace('dígitos nacionales', 'dígitos después del +58')
})

const resetAll = () => {
  stopTimer()
  step.value = 'datos'
  form.banco = ''
  form.cedulaTipo = 'V'
  form.cedula = ''
  form.telefono = ''
  form.monto = props.cuota ? String(props.cuota.saldo) : ''
  Object.assign(touched, { banco: false, cedula: false, telefono: false, monto: false })
  codigo.value = ''
  errorMessage.value = ''
  notice.value = ''
  iniciado.value = null
  confirmado.value = null
  intentos.value = MAX_INTENTOS
  phoneKey.value += 1
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      stopTimer()
      return
    }
    resetAll()
    void fetchBancos()
  },
)

watch(secondsLeft, (seconds) => {
  if (step.value === 'codigo' && seconds <= 0) {
    stopTimer()
    backToData('El código venció. Solicita uno nuevo para continuar con tu pago.')
  }
})

onBeforeUnmount(stopTimer)

function backToData(message = '') {
  stopTimer()
  step.value = 'datos'
  codigo.value = ''
  errorMessage.value = ''
  notice.value = message
}

const requestError = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 429) return 'Hiciste demasiados intentos. Espera unos minutos antes de intentarlo otra vez.'
    if (error.response?.status === 404) return fallback
  }
  return getApiErrorMessage(error, { forbiddenMessage: 'No tienes permiso para pagar esta cuota.' })
}

const submitDatos = async () => {
  if (!props.cuota || submitting.value) return
  Object.assign(touched, { banco: true, cedula: true, telefono: true, monto: true })
  if (bancoError.value || cedulaError.value || telefonoError.value || montoError.value) return

  submitting.value = true
  errorMessage.value = ''
  notice.value = ''
  try {
    iniciado.value = await iniciarPago({
      cuota_id: props.cuota.id,
      banco_codigo: form.banco,
      cedula: `${form.cedulaTipo}${form.cedula}`,
      telefono: form.telefono,
      monto: Number(form.monto),
    })
    if (iniciado.value.payment_url) {
      window.location.href = iniciado.value.payment_url
      return
    }
    intentos.value = MAX_INTENTOS
    codigo.value = ''
    now.value = Date.now()
    step.value = 'codigo'
    stopTimer()
    timer = setInterval(() => { now.value = Date.now() }, 1000)
  } catch (error) {
    errorMessage.value = requestError(error, 'No pudimos iniciar el pago. Revisa los datos e inténtalo de nuevo.')
  } finally {
    submitting.value = false
  }
}

const submitCodigo = async () => {
  if (!iniciado.value || submitting.value) return
  if (codigo.value.length !== CODE_LENGTH) {
    errorMessage.value = `Escribe el código de ${CODE_LENGTH} dígitos.`
    return
  }

  submitting.value = true
  errorMessage.value = ''
  try {
    confirmado.value = await confirmarPago(iniciado.value.pago_id, codigo.value)
    stopTimer()
    step.value = 'exito'
  } catch (error) {
    const tooMany = axios.isAxiosError(error) && error.response?.status === 429
    intentos.value = tooMany ? 0 : Math.max(0, intentos.value - 1)
    codigo.value = ''
    if (intentos.value <= 0) {
      backToData(tooMany
        ? 'Hiciste demasiados intentos. Espera unos minutos antes de intentarlo otra vez.'
        : 'Agotaste los intentos con este código. Inicia el pago de nuevo.')
    } else {
      errorMessage.value = requestError(error, 'No encontramos este pago. Inicia el proceso de nuevo.')
    }
  } finally {
    submitting.value = false
  }
}

const closeDialog = () => {
  if (submitting.value) return
  const wasPaid = step.value === 'exito'
  emit('close')
  if (wasPaid) emit('paid')
}

const title = computed(() => ({ datos: 'Pagar cuota con pago móvil', codigo: 'Confirma tu pago', exito: 'Pago confirmado' })[step.value])
const description = computed(() => (props.cuota && step.value === 'datos'
  ? `Cuota ${props.cuota.numero} de ${props.cuota.total_cuotas}`
  : ''))

const sanitizeCodigo = () => { codigo.value = sanitizeInteger(codigo.value, CODE_LENGTH) }
const sanitizeCedula = () => { form.cedula = sanitizeDocument(form.cedula, 'cedula') }
const sanitizeMonto = () => { form.monto = sanitizeDecimal(form.monto) }
</script>

<template>
  <AppModal :open="open" :title="title" :description="description" size="md" @close="closeDialog">
    <form v-if="step === 'datos' && cuota" id="pm-datos" class="pm-form" novalidate @submit.prevent="submitDatos">
      <dl class="pm-summary">
        <div><dt>Vencimiento</dt><dd>{{ formatVencimiento(cuota.fecha_vencimiento) }}</dd></div>
        <div><dt>Monto de la cuota</dt><dd>{{ formatCurrency(cuota.monto, cuota.moneda) }}</dd></div>
        <div><dt>Saldo pendiente</dt><dd><strong>{{ formatCurrency(cuota.saldo, cuota.moneda) }}</strong></dd></div>
      </dl>

      <p v-if="notice" class="pm-notice" role="status">{{ notice }}</p>

      <label class="pm-field">
        <span>Banco</span>
        <select v-model="form.banco" :disabled="isLoadingBancos" :aria-invalid="touched.banco && !!bancoError" @blur="touched.banco = true">
          <option value="" disabled>{{ isLoadingBancos ? 'Cargando bancos…' : 'Selecciona tu banco' }}</option>
          <option v-for="banco in bancos" :key="banco.codigo" :value="banco.codigo">{{ banco.codigo }} · {{ banco.nombre }}</option>
        </select>
        <small v-if="bancosError" class="pm-error">{{ bancosError }} <button type="button" class="pm-link" @click="fetchBancos">Reintentar</button></small>
        <small v-else-if="touched.banco && bancoError" class="pm-error">{{ bancoError }}</small>
      </label>

      <div class="pm-field">
        <label for="pm-cedula">Cédula</label>
        <div class="pm-row">
          <select v-model="form.cedulaTipo" class="pm-doc-type" aria-label="Tipo de documento">
            <option value="V">V</option>
            <option value="E">E</option>
          </select>
          <input id="pm-cedula" v-model="form.cedula" type="text" inputmode="numeric" autocomplete="off" placeholder="12345678" @input="sanitizeCedula" @blur="touched.cedula = true" />
        </div>
        <small v-if="touched.cedula && cedulaError" class="pm-error">{{ cedulaError }}</small>
      </div>

      <div class="pm-field">
        <label for="pm-telefono">Teléfono del pago móvil</label>
        <PhoneInput :key="phoneKey" id="pm-telefono" v-model="form.telefono" default-country="VE" required :invalid="touched.telefono && !!telefonoError" @focusout="touched.telefono = true" />
        <small v-if="touched.telefono && telefonoError" class="pm-error">{{ telefonoError }}</small>
      </div>

      <label class="pm-field">
        <span>Monto a pagar ({{ cuota.moneda }})</span>
        <input v-model="form.monto" type="text" inputmode="decimal" autocomplete="off" @input="sanitizeMonto" @blur="touched.monto = true" />
        <small v-if="touched.monto && montoError" class="pm-error">{{ montoError }}</small>
      </label>

      <p v-if="errorMessage" class="pm-alert" role="alert">{{ errorMessage }}</p>
    </form>

    <form v-else-if="step === 'codigo'" id="pm-codigo" class="pm-form" novalidate @submit.prevent="submitCodigo">
      <p class="pm-lead">Te enviamos un código a tu celular.</p>
      <p class="pm-muted">Escribe los {{ CODE_LENGTH }} dígitos para confirmar el pago de <strong>{{ formatCurrency(iniciado?.monto ?? 0, iniciado?.moneda) }}</strong>.</p>
      <label class="pm-field">
        <span>Código de {{ CODE_LENGTH }} dígitos</span>
        <input v-model="codigo" class="pm-code" type="text" inputmode="numeric" autocomplete="one-time-code" :maxlength="CODE_LENGTH" placeholder="••••••" autofocus @input="sanitizeCodigo" />
      </label>
      <div class="pm-meta">
        <span>El código vence en <strong>{{ countdown }}</strong></span>
        <span>Intentos restantes: <strong>{{ intentos }}</strong></span>
      </div>
      <p v-if="errorMessage" class="pm-alert" role="alert">{{ errorMessage }}</p>
    </form>

    <div v-else-if="step === 'exito'" class="pm-success" role="status">
      <div class="pm-check" aria-hidden="true">✓</div>
      <p class="pm-lead">¡Pago confirmado!</p>
      <dl class="pm-summary">
        <div><dt>Monto</dt><dd><strong>{{ formatCurrency(confirmado?.pago.monto ?? iniciado?.monto ?? 0, confirmado?.pago.moneda ?? iniciado?.moneda) }}</strong></dd></div>
        <div v-if="confirmado?.pago.referencia"><dt>Referencia</dt><dd>{{ confirmado.pago.referencia }}</dd></div>
        <div v-if="confirmado"><dt>Saldo de la cuota</dt><dd>{{ formatCurrency(confirmado.cuota.saldo, iniciado?.moneda) }}</dd></div>
      </dl>
      <p v-if="confirmado && confirmado.puntos_ganados > 0" class="pm-points">🎉 Ganaste {{ confirmado.puntos_ganados }} puntos por este pago.</p>
    </div>

    <template #footer>
      <template v-if="step === 'datos'">
        <button type="button" class="pm-btn" :disabled="submitting" @click="closeDialog">Cancelar</button>
        <button type="submit" form="pm-datos" class="pm-btn pm-btn--primary" :disabled="submitting || isLoadingBancos">{{ submitting ? 'Enviando código…' : 'Pagar' }}</button>
      </template>
      <template v-else-if="step === 'codigo'">
        <button type="button" class="pm-btn" :disabled="submitting" @click="backToData()">Volver</button>
        <button type="submit" form="pm-codigo" class="pm-btn pm-btn--primary" :disabled="submitting || codigo.length !== CODE_LENGTH">{{ submitting ? 'Confirmando…' : 'Confirmar pago' }}</button>
      </template>
      <button v-else type="button" class="pm-btn pm-btn--primary" @click="closeDialog">Cerrar</button>
    </template>
  </AppModal>
</template>

<style scoped>
.pm-form { display: flex; flex-direction: column; gap: 14px; }
.pm-summary { display: grid; gap: 6px; margin: 0; padding: 12px; border: 1px solid #dbe3ef; border-radius: 10px; background: #f8fafc; font-size: 13px; }
.pm-summary div { display: flex; justify-content: space-between; gap: 12px; }
.pm-summary dt { color: #64748b; }
.pm-summary dd { margin: 0; }
.pm-field { display: flex; flex-direction: column; gap: 5px; color: #475569; font-size: 12px; font-weight: 600; }
.pm-field input, .pm-field select { width: 100%; box-sizing: border-box; padding: 9px 10px; border: 1px solid #dbe3ef; border-radius: 7px; background: white; color: #172033; font: inherit; font-weight: 400; }
.pm-row { display: flex; gap: 8px; }
.pm-doc-type { width: 70px !important; flex: none; }
.pm-code { text-align: center; font-size: 22px !important; letter-spacing: .4em; }
.pm-error { color: #b91c1c; font-weight: 400; }
.pm-link { border: 0; background: none; color: #1768b8; text-decoration: underline; cursor: pointer; font: inherit; }
.pm-alert { margin: 0; padding: 10px 12px; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; color: #b91c1c; font-size: 13px; }
.pm-notice { margin: 0; padding: 10px 12px; border: 1px solid #fde68a; border-radius: 8px; background: #fffbeb; color: #92400e; font-size: 13px; }
.pm-lead { margin: 0; font-size: 16px; font-weight: 700; color: #172033; }
.pm-muted { margin: 0; color: #64748b; font-size: 13px; }
.pm-meta { display: flex; justify-content: space-between; gap: 12px; color: #64748b; font-size: 13px; }
.pm-success { display: flex; flex-direction: column; align-items: center; gap: 12px; text-align: center; }
.pm-success .pm-summary { width: 100%; box-sizing: border-box; }
.pm-check { display: grid; place-items: center; width: 52px; height: 52px; border-radius: 50%; background: #dcfce7; color: #166534; font-size: 28px; font-weight: 700; }
.pm-points { margin: 0; color: #166534; font-weight: 600; }
.pm-btn { height: 40px; padding: 0 16px; border: 1px solid #dbe3ef; border-radius: 8px; background: white; color: #1a1a1a; font-weight: 600; cursor: pointer; }
.pm-btn--primary { border-color: #1768b8; background: #1768b8; color: white; }
.pm-btn:disabled { opacity: .6; cursor: not-allowed; }
</style>
