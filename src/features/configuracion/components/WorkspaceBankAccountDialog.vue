<script setup lang="ts">
import { reactive, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import type { WorkspaceBankAccount, WorkspaceBankAccountPayload } from '../types'

const bankOptions = [
  { value: 'BCV', label: '🇻🇪 Banco Central de Venezuela' },
  { value: 'BDV', label: '🇻🇪 Banco de Venezuela' },
  { value: 'BOD', label: '🇻🇪 Banco Occidental de Descuento' },
  { value: 'BNC', label: '🇻🇪 Banco Nacional de Crédito' },
  { value: 'VENEZOLANO', label: '🇻🇪 Banco Venezolano de Crédito' },
  { value: 'PROVINCIAL', label: '🇻🇪 Banco Provincial' },
  { value: 'BANESCO', label: '🇻🇪 Banesco Banco Universal' },
  { value: 'BFC', label: '🇻🇪 Banco Fondo Común' },
  { value: 'BANDES', label: '🇻🇪 Banco de Desarrollo Económico y Social' },
  { value: 'DEL SUR', label: '🇻🇪 Banco del Sur' },
  { value: 'BCP', label: '🇵🇪 Banco de Crédito del Perú' },
  { value: 'BBVA', label: '🇵🇪 BBVA' },
  { value: 'INTERBANK', label: '🇵🇪 Interbank' },
  { value: 'SCOTIABANK', label: '🇵🇪 Scotiabank' },
  { value: 'BANBIF', label: '🇵🇪 BanBif' },
  { value: 'PICHINCHA', label: '🇵🇪 Banco Pichincha' },
] as const

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
    description="La cuenta debe pertenecer a la razon social activa del workspace y sera usada por distribuidores durante el registro de ventas."
    @close="emit('update:open', false)"
  >
    <div class="bank-dialog">
      <div class="bank-dialog__grid">
        <label class="bank-dialog__field bank-dialog__field--wide">
          <span class="bank-dialog__label">Alias de cuenta</span>
          <input v-model="form.alias_cuenta" class="bank-dialog__input" type="text" maxlength="120" placeholder="Cuenta principal BCP" />
        </label>

        <label class="bank-dialog__field">
          <span class="bank-dialog__label">Banco</span>
          <select v-model="form.banco_codigo" class="bank-dialog__input">
            <option v-for="option in bankOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
          </select>
        </label>

        <label class="bank-dialog__field">
          <span class="bank-dialog__label">Moneda</span>
          <select v-model="form.moneda_iso" class="bank-dialog__input">
            <option value="VES">VES - Bolívar Venezolano (Bs)</option>
            <option value="USD">USD - Dólar Estadounidense ($)</option>
            <option value="PEN">PEN - Sol Peruano (S/)</option>
            <option value="COP">COP - Peso Colombiano (COP$)</option>
            <option value="MXN">MXN - Peso Mexicano (MX$)</option>
          </select>
        </label>

        <label class="bank-dialog__field bank-dialog__field--wide">
          <span class="bank-dialog__label">Numero de cuenta / CCI</span>
          <input v-model="form.numero_cuenta_cci" class="bank-dialog__input bank-dialog__input--mono" type="text" maxlength="34" placeholder="191-1234567890-12" />
        </label>

        <label class="bank-dialog__field bank-dialog__field--wide">
          <span class="bank-dialog__label">Titular de la cuenta</span>
          <input v-model="form.titular_cuenta" class="bank-dialog__input" type="text" maxlength="150" :placeholder="companyName" />
          <span class="bank-dialog__hint">Debe coincidir con {{ companyName }}.</span>
        </label>

        <label class="bank-dialog__field bank-dialog__field--wide">
          <span class="bank-dialog__label">Instrucciones de pago</span>
          <textarea v-model="form.instrucciones_pago" class="bank-dialog__textarea" rows="4" maxlength="1000" placeholder="Indica referencia, concepto y observaciones para el cliente final." />
        </label>

        <label class="bank-dialog__toggle">
          <input v-model="form.mostrar_numero_completo" type="checkbox" />
          <span>Mostrar numero completo al distribuidor</span>
        </label>

        <label class="bank-dialog__toggle">
          <input v-model="form.activa" type="checkbox" />
          <span>Cuenta activa para nuevas ventas</span>
        </label>
      </div>
    </div>

    <template #footer>
      <button type="button" class="bank-dialog__secondary" @click="emit('update:open', false)">Cancelar</button>
      <button type="button" class="bank-dialog__primary" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? 'Guardando...' : account ? 'Guardar cambios' : 'Registrar cuenta' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.bank-dialog {
  display: flex;
  flex-direction: column;
}

.bank-dialog__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.bank-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-dialog__field--wide {
  grid-column: 1 / -1;
}

.bank-dialog__label {
  color: #283446;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.bank-dialog__input,
.bank-dialog__textarea {
  width: 100%;
  border: 1px solid #dbe4ef;
  border-radius: 14px;
  background: #fbfcfd;
  color: #172033;
  padding: 0.9rem 1rem;
}

.bank-dialog__input--mono {
  font-family: 'SFMono-Regular', 'Monaco', 'Cascadia Mono', monospace;
}

.bank-dialog__hint {
  color: #728096;
  font-size: 0.78rem;
}

.bank-dialog__textarea {
  resize: vertical;
  min-height: 116px;
}

.bank-dialog__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 46px;
  border-radius: 14px;
  border: 1px solid #dbe4ef;
  padding: 0.9rem 1rem;
  color: #283446;
  font-size: 0.92rem;
}

.bank-dialog__secondary,
.bank-dialog__primary {
  border-radius: 999px;
  font-weight: 700;
}

.bank-dialog__secondary {
  border: 1px solid #d4dbe4;
  background: #fff;
  color: #283446;
}

.bank-dialog__primary {
  border: 0;
  background: linear-gradient(135deg, #ba7b2f 0%, #8b4c1c 100%);
  color: #fff;
}

@media (max-width: 768px) {
  .bank-dialog__grid {
    grid-template-columns: 1fr;
  }
}
</style>