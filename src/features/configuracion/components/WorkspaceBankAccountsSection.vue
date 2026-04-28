<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { Pencil, Plus, RefreshCw, Smartphone, Trash2, X } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import { useWorkspaceBankAccountsApi } from '../composables/useWorkspaceBankAccountsApi'
import type { WorkspaceBankAccount, WorkspaceBankAccountPayload } from '../types'
import WorkspaceBankAccountDialog from './WorkspaceBankAccountDialog.vue'

const props = defineProps<{
  companyName: string
  empresaId?: number
}>()

const {
  bankAccounts,
  isLoading,
  isSaving,
  deletingAccountId,
  errorMessage,
  successMessage,
  clearMessages,
  fetchBankAccounts,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
} = useWorkspaceBankAccountsApi({ empresaId: props.empresaId })

const dialogOpen = shallowRef(false)
const editingAccount = shallowRef<WorkspaceBankAccount | null>(null)

const activeAccountsCount = computed(() => bankAccounts.value.filter((account) => account.activa).length)

const visibleAccountsCount = computed(
  () => bankAccounts.value.filter((account) => account.mostrar_numero_completo).length,
)

const openCreateDialog = () => {
  clearMessages()
  editingAccount.value = null
  dialogOpen.value = true
}

const openEditDialog = (account: WorkspaceBankAccount) => {
  clearMessages()
  editingAccount.value = account
  dialogOpen.value = true
}

const handleSubmit = async (payload: WorkspaceBankAccountPayload) => {
  try {
    if (editingAccount.value) {
      await updateBankAccount(editingAccount.value.id, payload)
    } else {
      await createBankAccount(payload)
    }

    dialogOpen.value = false
    editingAccount.value = null
  } catch {
    return
  }
}

const handleDelete = async (account: WorkspaceBankAccount) => {
  if (!window.confirm(`Eliminar la cuenta ${account.alias_cuenta}?`)) {
    return
  }

  try {
    await deleteBankAccount(account.id)
  } catch {
    return
  }
}

onMounted(async () => {
  await fetchBankAccounts()
})
</script>

<template>
  <div class="bank-section">
    <div class="bank-section__grid">
      <section class="bank-section__main">
        <header class="bank-section__header">
          <div>
            <p class="bank-section__eyebrow">Recaudacion B2B2C</p>
            <h2 class="bank-section__title">Cuentas bancarias corporativas</h2>
            <p class="bank-section__subtitle">
              Administra las cuentas que el distribuidor mostrara al cliente final al registrar ventas y pagos.
            </p>
          </div>

          <div class="bank-section__header-actions">
            <AppButton variant="ghost" size="sm" class="bank-section__ghost-btn" :disabled="isLoading" @click="fetchBankAccounts">
              <template #leading>
                <RefreshCw class="size-4" />
              </template>
              {{ isLoading ? 'Cargando...' : 'Actualizar' }}
            </AppButton>
            <AppButton variant="primary" class="bank-section__primary-btn" @click="openCreateDialog">
              <template #leading>
                <Plus class="size-4" />
              </template>
              Nueva cuenta
            </AppButton>
          </div>
        </header>

        <div class="bank-kpis">
          <article class="bank-kpi-card">
            <span class="bank-kpi-card__label">Cuentas registradas</span>
            <strong class="bank-kpi-card__value">{{ bankAccounts.length }}</strong>
          </article>
          <article class="bank-kpi-card bank-kpi-card--success">
            <span class="bank-kpi-card__label">Activas</span>
            <strong class="bank-kpi-card__value">{{ activeAccountsCount }}</strong>
          </article>
          <article class="bank-kpi-card bank-kpi-card--accent">
            <span class="bank-kpi-card__label">Con numero completo visible</span>
            <strong class="bank-kpi-card__value">{{ visibleAccountsCount }}</strong>
          </article>
        </div>

        <div v-if="errorMessage" class="bank-alert bank-alert--error">
          <span>{{ errorMessage }}</span>
          <AppButton type="button" variant="quiet" size="sm" class="bank-alert__close" @click="clearMessages">
            <template #leading>
              <X class="size-4" />
            </template>
            Cerrar
          </AppButton>
        </div>

        <div v-if="successMessage" class="bank-alert bank-alert--success">
          <span>{{ successMessage }}</span>
          <AppButton type="button" variant="quiet" size="sm" class="bank-alert__close" @click="clearMessages">
            <template #leading>
              <X class="size-4" />
            </template>
            Cerrar
          </AppButton>
        </div>

        <div v-if="isLoading" class="bank-empty-state">
          <p>Cargando cuentas bancarias...</p>
        </div>

        <div v-else-if="bankAccounts.length === 0" class="bank-empty-state">
          <strong>Aun no hay cuentas registradas.</strong>
          <p>Empieza creando la cuenta principal que veran los distribuidores al registrar ventas.</p>
        </div>

        <div v-else class="bank-account-list">
          <article v-for="account in bankAccounts" :key="account.id" class="bank-account-card">
            <div class="bank-account-card__top">
              <div>
                <div class="bank-account-card__title-row">
                  <h3 class="bank-account-card__title">{{ account.alias_cuenta }}</h3>
                  <span class="bank-account-card__status" :data-active="String(account.activa)">
                    {{ account.activa ? 'Activa' : 'Inactiva' }}
                  </span>
                </div>
                <p class="bank-account-card__bank">{{ account.banco_nombre }} · {{ account.moneda_iso }}</p>
              </div>

              <div class="bank-account-card__actions">
                <AppButton type="button" variant="ghost" size="sm" icon-only class="bank-account-card__action" aria-label="Editar cuenta" @click="openEditDialog(account)">
                  <template #leading>
                    <Pencil class="size-4" />
                  </template>
                </AppButton>
                <AppButton type="button" variant="danger" size="sm" icon-only class="bank-account-card__action bank-account-card__action--danger" :disabled="deletingAccountId === account.id" aria-label="Eliminar cuenta" @click="handleDelete(account)">
                  <template #leading>
                    <Trash2 class="size-4" />
                  </template>
                </AppButton>
              </div>
            </div>

            <div class="bank-account-card__body">
              <div class="bank-account-card__meta-grid">
                <div>
                  <span class="bank-account-card__meta-label">Titular</span>
                  <strong class="bank-account-card__meta-value">{{ account.titular_cuenta }}</strong>
                </div>
                <div>
                  <span class="bank-account-card__meta-label">Admin</span>
                  <strong class="bank-account-card__meta-value bank-account-card__meta-value--mono">{{ account.numero_cuenta_cci }}</strong>
                </div>
                <div>
                  <span class="bank-account-card__meta-label">Distribuidor</span>
                  <strong class="bank-account-card__meta-value bank-account-card__meta-value--mono">{{ account.numero_cuenta_visible }}</strong>
                </div>
                <div>
                  <span class="bank-account-card__meta-label">Visibilidad</span>
                  <strong class="bank-account-card__meta-value">{{ account.mostrar_numero_completo ? 'Numero completo' : 'Numero enmascarado' }}</strong>
                </div>
              </div>

              <div class="bank-account-card__instructions">
                <span class="bank-account-card__meta-label">Instrucciones de pago</span>
                <p>{{ account.instrucciones_pago || 'Sin instrucciones personalizadas para esta cuenta.' }}</p>
              </div>
            </div>
          </article>
        </div>
      </section>

      <aside class="bank-preview-panel">
        <p class="bank-preview-panel__eyebrow">Vista distribuidor</p>
        <h3 class="bank-preview-panel__title">Payload movil esperado</h3>
        <p class="bank-preview-panel__copy">
          Esta maqueta replica lo esencial que llega desde `/workspace/mobile/empresa/datos-bancarios` para que el equipo administrativo valide el contenido mostrado.
        </p>

        <div class="bank-preview-panel__phone">
          <div class="bank-preview-panel__phone-top">
            <Smartphone class="size-4" />
            <span>{{ companyName }}</span>
          </div>

          <div v-if="bankAccounts.length === 0" class="bank-preview-panel__empty">
            No hay cuentas para mostrar.
          </div>

          <div v-else class="bank-preview-panel__list">
            <article v-for="account in bankAccounts.filter((item) => item.activa)" :key="account.id" class="bank-preview-panel__item">
              <strong>{{ account.alias_cuenta }}</strong>
              <span>{{ account.banco_nombre }}</span>
              <code>{{ account.numero_cuenta_visible }}</code>
              <small>{{ account.instrucciones_pago || 'Sin instrucciones.' }}</small>
            </article>
          </div>
        </div>
      </aside>
    </div>

    <WorkspaceBankAccountDialog
      v-model:open="dialogOpen"
      :account="editingAccount"
      :company-name="companyName"
      :submitting="isSaving"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.bank-section {
  display: flex;
  flex-direction: column;
}

.bank-section__grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 20px;
}

.bank-section__main,
.bank-preview-panel {
  border-radius: 28px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 60px rgba(31, 53, 84, 0.08);
}

.bank-section__main {
  padding: 28px;
}

.bank-section__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
}

.bank-section__eyebrow,
.bank-preview-panel__eyebrow {
  margin-bottom: 8px;
  color: #8c5f2c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.bank-section__title,
.bank-preview-panel__title {
  color: #162033;
  font-size: 1.5rem;
  line-height: 1.1;
}

.bank-section__subtitle,
.bank-preview-panel__copy {
  margin-top: 10px;
  color: #5e6c83;
  line-height: 1.65;
}

.bank-section__header-actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.bank-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}

.bank-kpi-card {
  border-radius: 20px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  padding: 16px;
  background: #fbfcfd;
}

.bank-kpi-card--success {
  background: rgba(233, 248, 238, 0.85);
}

.bank-kpi-card--accent {
  background: rgba(240, 244, 255, 0.9);
}

.bank-kpi-card__label,
.bank-account-card__meta-label {
  display: block;
  color: #6a768a;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.bank-kpi-card__value {
  display: block;
  margin-top: 10px;
  color: #162033;
  font-size: 2rem;
}

.bank-alert {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  border-radius: 18px;
  padding: 14px 16px;
  margin-bottom: 16px;
}

.bank-alert--error {
  background: rgba(253, 236, 236, 0.94);
  color: #8f3333;
}

.bank-alert--success {
  background: rgba(231, 248, 236, 0.94);
  color: #216b39;
}

.bank-alert__close {
  border: 0;
  background: transparent;
  color: inherit;
  font-weight: 700;
  padding: 0;
}

.bank-empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  border-radius: 20px;
  border: 1px dashed rgba(32, 51, 79, 0.14);
  padding: 20px;
  color: #607088;
}

.bank-account-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bank-account-card {
  border-radius: 22px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: linear-gradient(180deg, #fff 0%, #fbfcfd 100%);
  padding: 18px;
}

.bank-account-card__top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.bank-account-card__title-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.bank-account-card__title {
  color: #162033;
  font-size: 1.08rem;
}

.bank-account-card__status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  border-radius: 999px;
  padding: 0.2rem 0.7rem;
  background: rgba(218, 225, 234, 0.6);
  color: #324257;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bank-account-card__status[data-active='true'] {
  background: rgba(39, 174, 96, 0.14);
  color: #1f7a40;
}

.bank-account-card__bank {
  margin-top: 6px;
  color: #6a768a;
}

.bank-account-card__actions {
  display: flex;
  gap: 8px;
}

.bank-account-card__action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: #fff;
  color: #324257;
}

.bank-account-card__action--danger {
  color: #b63e3e;
}

.bank-account-card__body {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bank-account-card__meta-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.bank-account-card__meta-value {
  display: block;
  margin-top: 8px;
  color: #162033;
  font-size: 0.95rem;
}

.bank-account-card__meta-value--mono,
.bank-preview-panel code {
  font-family: 'SFMono-Regular', 'Monaco', 'Cascadia Mono', monospace;
}

.bank-account-card__instructions {
  border-radius: 18px;
  background: #f7f9fb;
  padding: 14px;
}

.bank-account-card__instructions p {
  margin-top: 8px;
  color: #526076;
  line-height: 1.6;
}

.bank-preview-panel {
  padding: 24px;
  background:
    radial-gradient(circle at top right, rgba(255, 209, 147, 0.12), transparent 25%),
    linear-gradient(180deg, #fff 0%, #f8fafc 100%);
}

.bank-preview-panel__phone {
  margin-top: 18px;
  border-radius: 28px;
  background: #111827;
  padding: 18px;
  color: #f8fafc;
}

.bank-preview-panel__phone-top {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d9e2f2;
  font-size: 0.9rem;
}

.bank-preview-panel__empty {
  margin-top: 16px;
  color: #94a3b8;
}

.bank-preview-panel__list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.bank-preview-panel__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.06);
  padding: 14px;
}

.bank-preview-panel__item span,
.bank-preview-panel__item small {
  color: #c8d1df;
}

@media (max-width: 1120px) {
  .bank-section__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .bank-section__header,
  .bank-kpis,
  .bank-account-card__top,
  .bank-account-card__meta-grid,
  .bank-alert {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }

  .bank-section__main,
  .bank-preview-panel {
    padding: 20px;
  }
}
</style>