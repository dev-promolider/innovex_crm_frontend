<script setup lang="ts">
import { reactive, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import AppButton from '@/components/shared/AppButton.vue'
import type { WorkspaceBankAccount, WorkspaceBankAccountPayload } from '../types'

const bankOptions = [
  { value: 'BCP', label: 'Banco de Credito del Peru' },
  { value: 'BBVA', label: 'BBVA' },
  { value: 'INTERBANK', label: 'Interbank' },
  { value: 'SCOTIABANK', label: 'Scotiabank' },
  { value: 'BANBIF', label: 'BanBif' },
  { value: 'PICHINCHA', label: 'Banco Pichincha' },
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
  banco_codigo: 'BCP',
  numero_cuenta_cci: '',
  titular_cuenta: '',
  moneda_iso: 'PEN',
  instrucciones_pago: '',
  mostrar_numero_completo: false,
  activa: true,
})

const resetForm = () => {
  form.alias_cuenta = ''
  form.banco_codigo = 'BCP'
  form.numero_cuenta_cci = ''
  form.titular_cuenta = props.companyName
  form.moneda_iso = 'PEN'
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
    :title="account ? 'Editar cuenta bancaria V2' : 'Nueva cuenta bancaria V2'"
    description="Version alternativa del flujo bancario para la vista V2 de empresa."
    @close="emit('update:open', false)"
  >
    <div class="bank-dialog-v2">
      <section class="bank-dialog-v2__section">
        <div class="bank-dialog-v2__section-copy">
          <h3 class="bank-dialog-v2__section-title">Identidad bancaria</h3>
          <p class="bank-dialog-v2__section-description">Define el alias visible y los datos base de la cuenta.</p>
        </div>

        <div class="bank-dialog-v2__grid">
          <label class="bank-dialog-v2__field bank-dialog-v2__field--wide">
            <span class="bank-dialog-v2__label">Alias de cuenta</span>
            <input v-model="form.alias_cuenta" class="bank-dialog-v2__input" type="text" maxlength="120" placeholder="Cuenta principal BCP" />
          </label>

          <label class="bank-dialog-v2__field">
            <span class="bank-dialog-v2__label">Banco</span>
            <select v-model="form.banco_codigo" class="bank-dialog-v2__input">
              <option v-for="option in bankOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select>
          </label>

          <label class="bank-dialog-v2__field">
            <span class="bank-dialog-v2__label">Moneda</span>
            <select v-model="form.moneda_iso" class="bank-dialog-v2__input">
              <option value="PEN">PEN</option>
              <option value="USD">USD</option>
              <option value="COP">COP</option>
              <option value="MXN">MXN</option>
            </select>
          </label>

          <label class="bank-dialog-v2__field bank-dialog-v2__field--wide">
            <span class="bank-dialog-v2__label">Numero de cuenta / CCI</span>
            <input v-model="form.numero_cuenta_cci" class="bank-dialog-v2__input bank-dialog-v2__input--mono" type="text" maxlength="34" placeholder="191-1234567890-12" />
          </label>

          <label class="bank-dialog-v2__field bank-dialog-v2__field--wide">
            <span class="bank-dialog-v2__label">Titular de la cuenta</span>
            <input v-model="form.titular_cuenta" class="bank-dialog-v2__input" type="text" maxlength="150" :placeholder="companyName" />
          </label>
        </div>
      </section>

      <section class="bank-dialog-v2__section">
        <div class="bank-dialog-v2__section-copy">
          <h3 class="bank-dialog-v2__section-title">Operacion</h3>
          <p class="bank-dialog-v2__section-description">Controla instrucciones y visibilidad para el flujo comercial.</p>
        </div>

        <div class="bank-dialog-v2__grid">
          <label class="bank-dialog-v2__field bank-dialog-v2__field--wide">
            <span class="bank-dialog-v2__label">Instrucciones de pago</span>
            <textarea v-model="form.instrucciones_pago" class="bank-dialog-v2__textarea" rows="4" maxlength="1000" placeholder="Indica referencia, concepto y observaciones para el cliente final." />
          </label>

          <label class="bank-dialog-v2__toggle bank-dialog-v2__field--wide">
            <input v-model="form.mostrar_numero_completo" type="checkbox" />
            <span>Mostrar numero completo al distribuidor</span>
          </label>

          <label class="bank-dialog-v2__toggle bank-dialog-v2__field--wide">
            <input v-model="form.activa" type="checkbox" />
            <span>Cuenta activa para nuevas ventas</span>
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
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
}

.bank-dialog-v2__section-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.bank-dialog-v2__section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #172033;
}

.bank-dialog-v2__section-description {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
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
}

.bank-dialog-v2__field--wide {
  grid-column: 1 / -1;
}

.bank-dialog-v2__label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.bank-dialog-v2__input,
.bank-dialog-v2__textarea {
  width: 100%;
  min-width: 0;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;
  outline: none;
}

.bank-dialog-v2__input:focus,
.bank-dialog-v2__textarea:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.bank-dialog-v2__input--mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.bank-dialog-v2__textarea {
  min-height: 100px;
  resize: vertical;
}

.bank-dialog-v2__toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  border-radius: 10px;
  border: 1px solid #dbe3ef;
  padding: 10px 12px;
  color: #283446;
  font-size: 13px;
  background: #fff;
}

@media (max-width: 768px) {
  .bank-dialog-v2__grid {
    grid-template-columns: 1fr;
  }
}
</style>