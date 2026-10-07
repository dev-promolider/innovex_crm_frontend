<script setup lang="ts">
import { reactive, watch, computed } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import AppButton from '@/components/shared/AppButton.vue'
import type { WorkspaceBankAccount, WorkspaceBankAccountPayload } from '../types'

const bankOptions = [
  { value: 'BDV', label: 'Banco de Venezuela', country: 'VE' },
  { value: 'BANESCO', label: 'Banesco', country: 'VE' },
  { value: 'MERCANTIL', label: 'Mercantil', country: 'VE' },
  { value: 'PROVINCIAL', label: 'BBVA Provincial', country: 'VE' },
  { value: 'BNC', label: 'BNC', country: 'VE' },
  { value: 'BANCAMIGA', label: 'Bancamiga', country: 'VE' },
  { value: 'TESORO', label: 'Banco del Tesoro', country: 'VE' },
  { value: 'BICENTENARIO', label: 'Bicentenario', country: 'VE' },
  { value: 'BANCARIBE', label: 'Bancaribe', country: 'VE' },
  { value: 'EXTERIOR', label: 'Exterior', country: 'VE' },
  { value: 'BANPLUS', label: 'Banplus', country: 'VE' },
  { value: 'BOD', label: 'BOD', country: 'VE' },
  { value: 'ACTIVO', label: 'Banco Activo', country: 'VE' },
  { value: 'BFC', label: 'BFC', country: 'VE' },
  { value: 'VENEZOLANO', label: 'Venezolano de Crédito', country: 'VE' },
  { value: 'PLAZA', label: 'Plaza', country: 'VE' },
  { value: 'SOFITASA', label: 'Sofitasa', country: 'VE' },
  { value: 'MI BANCO', label: 'Mi Banco', country: 'VE' },
  { value: 'BANGENTE', label: 'Bangente', country: 'VE' },
  { value: '100 BANCO', label: '100% Banco', country: 'VE' },
  { value: 'CARONI', label: 'Banco Caroní', country: 'VE' },
  { value: 'DEL SUR', label: 'Del Sur', country: 'VE' },
  { value: 'BANFANB', label: 'Banfanb', country: 'VE' },
  { value: 'BCP', label: 'Banco de Crédito del Perú', country: 'PE' },
  { value: 'BBVA', label: 'BBVA', country: 'PE' },
  { value: 'INTERBANK', label: 'Interbank', country: 'PE' },
  { value: 'SCOTIABANK', label: 'Scotiabank', country: 'PE' },
  { value: 'BANBIF', label: 'BanBif', country: 'PE' },
  { value: 'PICHINCHA', label: 'Banco Pichincha', country: 'PE' },
] as const

const currencyOptions = [
  { value: 'VES', label: 'VES - Bolívar Venezolano (Bs.)', symbol: 'Bs.' },
  { value: 'USD', label: 'USD - Dólar Estadounidense', symbol: '$' },
  { value: 'PEN', label: 'PEN - Sol Peruano', symbol: 'S/' },
  { value: 'COP', label: 'COP - Peso Colombiano', symbol: 'COP$' },
  { value: 'MXN', label: 'MXN - Peso Mexicano', symbol: 'MX$' },
]

const props = defineProps<{
  open: boolean
  account: WorkspaceBankAccount | null
  companyName: string
  submitting: boolean
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: WorkspaceBankAccountPayload]
}>()

const form = reactive<WorkspaceBankAccountPayload>({
  alias_cuenta: '',
  banco_codigo: 'BDV',
  numero_cuenta_cci: '',
  titular_cuenta: '',
  moneda_iso: 'VES',
  instrucciones_pago: '',
  mostrar_numero_completo: false,
  activa: true,
})

const selectedCurrencySymbol = computed(() => {
  const found = currencyOptions.find((c) => c.value === form.moneda_iso)
  return found?.symbol ?? '$'
})

const availableBanks = computed(() =>
  bankOptions.filter((bank) => bank.country === (form.moneda_iso === 'VES' ? 'VE' : 'PE')),
)

watch(
  () => form.moneda_iso,
  () => {
    if (!availableBanks.value.some((bank) => bank.value === form.banco_codigo)) {
      form.banco_codigo = availableBanks.value[0]?.value ?? ''
    }
  },
)

const resetForm = () => {
  form.alias_cuenta = ''
  form.banco_codigo = 'BDV'
  form.numero_cuenta_cci = ''
  form.titular_cuenta = props.companyName
  form.moneda_iso = 'VES'
  form.instrucciones_pago = ''
  form.mostrar_numero_completo = false
  form.activa = true
}

watch(
  () => [props.open, props.account, props.companyName] as const,
  ([isOpen, account]) => {
    if (!isOpen) {
      resetForm()
      return
    }

    if (account) {
      form.alias_cuenta = account.alias_cuenta
      form.banco_codigo = account.banco_codigo
      form.numero_cuenta_cci = account.numero_cuenta_cci
      form.titular_cuenta = account.titular_cuenta
      form.moneda_iso = account.moneda_iso
      form.instrucciones_pago = account.instrucciones_pago ?? ''
      form.mostrar_numero_completo = account.mostrar_numero_completo
      form.activa = account.activa
      return
    }

    resetForm()
  },
  { immediate: true },
)

const handleSubmit = () => {
  emit('submit', {
    alias_cuenta: form.alias_cuenta.trim(),
    banco_codigo: form.banco_codigo,
    numero_cuenta_cci: form.numero_cuenta_cci.trim(),
    titular_cuenta: form.titular_cuenta.trim(),
    moneda_iso: form.moneda_iso.trim().toUpperCase(),
    instrucciones_pago: form.instrucciones_pago?.trim() || null,
    mostrar_numero_completo: !!form.mostrar_numero_completo,
    activa: !!form.activa,
  })
}
</script>

<template>
  <AppModal
    :open="open"
    size="lg"
    :title="account ? 'Editar cuenta bancaria' : 'Nueva cuenta bancaria'"
    description="Configura la cuenta bancaria para recibir pagos de los distribuidores."
    @close="emit('update:open', false)"
  >
    <div class="bank-dialog-v2">
      <section class="bank-dialog-v2__section">
        <div class="bank-dialog-v2__section-head">
          <div class="bank-dialog-v2__section-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v3"></path><path d="M12 14v3"></path><path d="M16 14v3"></path></svg>
          </div>
          <div class="bank-dialog-v2__section-copy">
            <h3 class="bank-dialog-v2__section-title">Identidad bancaria</h3>
            <p class="bank-dialog-v2__section-description">Define el alias visible y los datos base de la cuenta.</p>
          </div>
        </div>

        <div class="bank-dialog-v2__grid">
          <label class="bank-dialog-v2__field bank-dialog-v2__field--wide">
            <span class="bank-dialog-v2__label">Alias de cuenta</span>
            <input v-model="form.alias_cuenta" class="bank-dialog-v2__input" type="text" maxlength="120" placeholder="Ej: Cuenta principal Bs - Banco de Venezuela" />
          </label>

          <label class="bank-dialog-v2__field">
            <span class="bank-dialog-v2__label">Banco</span>
            <select v-model="form.banco_codigo" class="bank-dialog-v2__input bank-dialog-v2__select">
              <option v-for="option in availableBanks" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>

          <label class="bank-dialog-v2__field">
            <span class="bank-dialog-v2__label">Moneda</span>
            <select v-model="form.moneda_iso" class="bank-dialog-v2__input bank-dialog-v2__select">
              <option v-for="opt in currencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
            <p class="bank-dialog-v2__hint">
              Símbolo: <strong>{{ selectedCurrencySymbol }}</strong>
            </p>
          </label>

          <label class="bank-dialog-v2__field bank-dialog-v2__field--wide">
            <span class="bank-dialog-v2__label">Número de cuenta / CCI</span>
            <input v-model="form.numero_cuenta_cci" class="bank-dialog-v2__input bank-dialog-v2__input--mono" type="text" maxlength="34" placeholder="Ej: 01020123456789012345" />
          </label>

          <label class="bank-dialog-v2__field bank-dialog-v2__field--wide">
            <span class="bank-dialog-v2__label">Titular de la cuenta</span>
            <input v-model="form.titular_cuenta" class="bank-dialog-v2__input" type="text" maxlength="150" :placeholder="companyName" />
            <p class="bank-dialog-v2__hint">Debe coincidir con la razón social o nombre del titular registrado en el banco.</p>
          </label>
        </div>
      </section>

      <section class="bank-dialog-v2__section">
        <div class="bank-dialog-v2__section-head">
          <div class="bank-dialog-v2__section-icon bank-dialog-v2__section-icon--green">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
          </div>
          <div class="bank-dialog-v2__section-copy">
            <h3 class="bank-dialog-v2__section-title">Operación</h3>
            <p class="bank-dialog-v2__section-description">Controla instrucciones y visibilidad para el flujo comercial.</p>
          </div>
        </div>

        <div class="bank-dialog-v2__grid">
          <label class="bank-dialog-v2__field bank-dialog-v2__field--wide">
            <span class="bank-dialog-v2__label">Instrucciones de pago</span>
            <textarea v-model="form.instrucciones_pago" class="bank-dialog-v2__textarea" rows="4" maxlength="1000" placeholder="Indica referencia, concepto, nombre del beneficiario y observaciones para el cliente final."></textarea>
          </label>

          <label class="bank-dialog-v2__toggle">
            <div class="bank-dialog-v2__toggle-input">
              <input v-model="form.mostrar_numero_completo" type="checkbox" />
            </div>
            <div class="bank-dialog-v2__toggle-content">
              <span class="bank-dialog-v2__toggle-title">Mostrar número completo</span>
              <span class="bank-dialog-v2__toggle-desc">Visualiza el número de cuenta completo al distribuidor durante la validación.</span>
            </div>
          </label>

          <label class="bank-dialog-v2__toggle bank-dialog-v2__toggle--active">
            <div class="bank-dialog-v2__toggle-input">
              <input v-model="form.activa" type="checkbox" />
            </div>
            <div class="bank-dialog-v2__toggle-content">
              <span class="bank-dialog-v2__toggle-title">Cuenta activa</span>
              <span class="bank-dialog-v2__toggle-desc">Habilita esta cuenta para nuevas ventas y validaciones de pago.</span>
            </div>
          </label>
        </div>
      </section>
    </div>

    <template #footer>
      <AppButton type="button" variant="ghost" size="sm" @click="emit('update:open', false)">Cancelar</AppButton>
      <AppButton type="button" variant="primary" size="sm" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? 'Guardando...' : account ? 'Guardar cambios' : 'Registrar cuenta' }}
      </AppButton>
    </template>
  </AppModal>
</template>

<style scoped>
.bank-dialog-v2 {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.bank-dialog-v2__section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  transition: box-shadow 0.2s ease;
}

.bank-dialog-v2__section:hover {
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
}

.bank-dialog-v2__section-head {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 18px;
}

.bank-dialog-v2__section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
  color: #1d4ed8;
  flex-shrink: 0;
}

.bank-dialog-v2__section-icon--green {
  background: linear-gradient(135deg, #dcfce7 0%, #f0fdf4 100%);
  color: #15803d;
}

.bank-dialog-v2__section-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.bank-dialog-v2__section-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  letter-spacing: -0.01em;
}

.bank-dialog-v2__section-description {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: #64748b;
}

.bank-dialog-v2__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.bank-dialog-v2__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.bank-dialog-v2__field--wide {
  grid-column: 1 / -1;
}

.bank-dialog-v2__label {
  font-size: 12.5px;
  font-weight: 600;
  color: #334155;
}

.bank-dialog-v2__input,
.bank-dialog-v2__textarea {
  width: 100%;
  min-width: 0;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  padding: 10px 13px;
  font-size: 13.5px;
  color: #0f172a;
  outline: none;
  transition: all 0.18s ease;
}

.bank-dialog-v2__input:hover,
.bank-dialog-v2__textarea:hover {
  border-color: #cbd5e1;
  background: #ffffff;
}

.bank-dialog-v2__input:focus,
.bank-dialog-v2__textarea:focus {
  border-color: #3b82f6;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.bank-dialog-v2__input::placeholder,
.bank-dialog-v2__textarea::placeholder {
  color: #94a3b8;
}

.bank-dialog-v2__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}

.bank-dialog-v2__select optgroup {
  font-weight: 600;
  color: #475569;
  background: #f8fafc;
}

.bank-dialog-v2__select option {
  color: #0f172a;
  background: #ffffff;
}

.bank-dialog-v2__input--mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  letter-spacing: 0.02em;
}

.bank-dialog-v2__textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.55;
}

.bank-dialog-v2__hint {
  margin: 0;
  font-size: 11.5px;
  color: #64748b;
  line-height: 1.45;
}

.bank-dialog-v2__hint strong {
  color: #0f172a;
  font-weight: 700;
}

.bank-dialog-v2__toggle {
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  cursor: pointer;
  transition: all 0.18s ease;
}

.bank-dialog-v2__toggle:hover {
  border-color: #cbd5e1;
  background: #ffffff;
}

.bank-dialog-v2__toggle--active {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #eff6ff 0%, #ffffff 100%);
}

.bank-dialog-v2__toggle-input {
  padding-top: 1px;
  flex-shrink: 0;
}

.bank-dialog-v2__toggle-input input[type='checkbox'] {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
  cursor: pointer;
}

.bank-dialog-v2__toggle-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.bank-dialog-v2__toggle-title {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
}

.bank-dialog-v2__toggle-desc {
  font-size: 12px;
  line-height: 1.45;
  color: #64748b;
}

@media (max-width: 768px) {
  .bank-dialog-v2__grid {
    grid-template-columns: 1fr;
  }

  .bank-dialog-v2__section {
    padding: 16px;
  }
}
</style>
