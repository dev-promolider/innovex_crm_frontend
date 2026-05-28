<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { Building2, ChevronDown, CreditCard, Eye, Pencil, Plus, RefreshCw, Trash2, Wallet } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import { useWorkspaceBankAccountsApi } from '../composables/useWorkspaceBankAccountsApi'
import type { WorkspaceBankAccount, WorkspaceBankAccountPayload } from '../types'
import WorkspaceBankAccountDialogV2 from './WorkspaceBankAccountDialogV2.vue'

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
const expandedAccountIds = reactive(new Set<number>())

const activeCount = computed(() => bankAccounts.value.filter((account) => account.activa).length)

const currencySummary = computed(() => {
  const currencies = new Set(bankAccounts.value.map((account) => account.moneda_iso))
  return [...currencies].join(' · ') || '—'
})

const isExpanded = (accountId: number) => expandedAccountIds.has(accountId)

const toggleAccountPanel = (accountId: number) => {
  if (expandedAccountIds.has(accountId)) {
    expandedAccountIds.delete(accountId)
    return
  }

  expandedAccountIds.add(accountId)
}

const ensureExpandedAccounts = () => {
  for (const id of [...expandedAccountIds]) {
    if (!bankAccounts.value.some((account) => account.id === id)) {
      expandedAccountIds.delete(id)
    }
  }

  if (expandedAccountIds.size === 0 && bankAccounts.value.length === 1) {
    const onlyAccount = bankAccounts.value[0]
    if (onlyAccount) {
      expandedAccountIds.add(onlyAccount.id)
    }
  }
}

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
    ensureExpandedAccounts()
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
    expandedAccountIds.delete(account.id)
    ensureExpandedAccounts()
  } catch {
    return
  }
}

onMounted(async () => {
  await fetchBankAccounts()
  ensureExpandedAccounts()
})
</script>

<template>
  <div class="bank-v2">
    <header class="bank-v2__toolbar">
      <div class="bank-v2__toolbar-copy">
        <p class="bank-v2__eyebrow">Cuentas bancarias</p>
        <h3 class="bank-v2__title">Recaudacion y depositos</h3>
      </div>

      <div class="bank-v2__toolbar-actions">
        <AppButton variant="ghost" size="sm" :disabled="isLoading" @click="fetchBankAccounts">
          <template #leading>
            <RefreshCw class="size-4" />
          </template>
          {{ isLoading ? 'Cargando...' : 'Actualizar' }}
        </AppButton>
        <AppButton variant="primary" size="sm" @click="openCreateDialog">
          <template #leading>
            <Plus class="size-4" />
          </template>
          Nueva cuenta
        </AppButton>
      </div>
    </header>

    <div class="bank-v2__stats">
      <span class="bank-v2__stat">
        <Wallet class="bank-v2__stat-icon" />
        <span class="bank-v2__stat-label">Cuentas</span>
        <strong>{{ bankAccounts.length }}</strong>
      </span>
      <span class="bank-v2__stat">
        <CreditCard class="bank-v2__stat-icon" />
        <span class="bank-v2__stat-label">Activas</span>
        <strong>{{ activeCount }}</strong>
      </span>
      <span class="bank-v2__stat">
        <Building2 class="bank-v2__stat-icon" />
        <span class="bank-v2__stat-label">Monedas</span>
        <strong>{{ currencySummary }}</strong>
      </span>
    </div>

    <div v-if="errorMessage" class="admin-alert admin-alert--error">
      {{ errorMessage }}
      <button type="button" class="admin-alert__close" @click="clearMessages">✕</button>
    </div>

    <div v-if="successMessage" class="admin-alert admin-alert--success">
      {{ successMessage }}
      <button type="button" class="admin-alert__close" @click="clearMessages">✕</button>
    </div>

    <section class="bank-v2__panel">
      <div class="bank-v2__panel-head">
        <div>
          <h4 class="bank-v2__panel-title">Cuentas registradas</h4>
          <p class="bank-v2__panel-desc">
            Alias, numeros de cuenta, visibilidad movil e instrucciones de pago para {{ companyName }}.
          </p>
        </div>
      </div>

      <div v-if="isLoading" class="bank-v2__empty">Cargando cuentas bancarias...</div>

      <div v-else-if="bankAccounts.length === 0" class="bank-v2__empty">
        <p>No hay cuentas registradas.</p>
        <AppButton variant="primary" size="sm" @click="openCreateDialog">
          <template #leading>
            <Plus class="size-4" />
          </template>
          Crear primera cuenta
        </AppButton>
      </div>

      <div v-else class="bank-v2__account-list">
        <article
          v-for="(account, index) in bankAccounts"
          :key="account.id"
          class="bank-v2__account"
          :class="{ 'bank-v2__account--open': isExpanded(account.id) }"
        >
          <button
            type="button"
            class="bank-v2__account-toggle"
            :aria-expanded="isExpanded(account.id)"
            @click="toggleAccountPanel(account.id)"
          >
            <span class="bank-v2__account-index">{{ index + 1 }}</span>

            <span class="bank-v2__bank-mark" aria-hidden="true">{{ account.banco_codigo.slice(0, 3) }}</span>

            <span class="bank-v2__account-summary">
              <strong>{{ account.alias_cuenta }}</strong>
              <span>{{ account.banco_nombre }} · Titular: {{ account.titular_cuenta }}</span>
            </span>

            <span class="bank-v2__account-badges">
              <span class="bank-v2__tag">{{ account.moneda_iso }}</span>
              <span class="bank-v2__tag" :class="account.activa ? 'bank-v2__tag--active' : 'bank-v2__tag--inactive'">
                {{ account.activa ? 'Activa' : 'Inactiva' }}
              </span>
              <span class="bank-v2__tag bank-v2__tag--muted">
                <Eye class="bank-v2__tag-icon" />
                {{ account.mostrar_numero_completo ? 'Completo' : 'Enmascarado' }}
              </span>
            </span>

            <span class="bank-v2__account-actions" @click.stop>
              <AppButton type="button" variant="ghost" size="sm" icon-only aria-label="Editar cuenta" @click="openEditDialog(account)">
                <template #leading>
                  <Pencil class="size-4" />
                </template>
              </AppButton>
              <AppButton
                type="button"
                variant="danger"
                size="sm"
                icon-only
                aria-label="Eliminar cuenta"
                :disabled="deletingAccountId === account.id"
                @click="handleDelete(account)"
              >
                <template #leading>
                  <Trash2 class="size-4" />
                </template>
              </AppButton>
            </span>

            <ChevronDown class="bank-v2__chevron" />
          </button>

          <div v-show="isExpanded(account.id)" class="bank-v2__account-body">
            <div class="bank-v2__detail-grid">
              <div class="bank-v2__detail-item">
                <span class="bank-v2__detail-label">Cuenta admin (CCI)</span>
                <strong class="bank-v2__detail-value bank-v2__detail-value--mono">{{ account.numero_cuenta_cci }}</strong>
              </div>
              <div class="bank-v2__detail-item">
                <span class="bank-v2__detail-label">Cuenta visible distribuidor</span>
                <strong class="bank-v2__detail-value bank-v2__detail-value--mono">{{ account.numero_cuenta_visible }}</strong>
              </div>
              <div class="bank-v2__detail-item">
                <span class="bank-v2__detail-label">Banco</span>
                <strong class="bank-v2__detail-value">{{ account.banco_nombre }} ({{ account.banco_codigo }})</strong>
              </div>
              <div class="bank-v2__detail-item">
                <span class="bank-v2__detail-label">Estado comercial</span>
                <strong class="bank-v2__detail-value">
                  {{ account.activa ? 'Disponible para nuevas ventas' : 'Fuera de operacion' }}
                </strong>
              </div>
            </div>

            <div class="bank-v2__instructions">
              <span class="bank-v2__detail-label">Instrucciones de pago</span>
              <p>{{ account.instrucciones_pago || 'Sin instrucciones personalizadas para esta cuenta.' }}</p>
            </div>
          </div>
        </article>
      </div>
    </section>

    <WorkspaceBankAccountDialogV2
      v-model:open="dialogOpen"
      :account="editingAccount"
      :company-name="companyName"
      :submitting="isSaving"
      @submit="handleSubmit"
    />
  </div>
</template>

<style scoped>
.bank-v2 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bank-v2__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.bank-v2__eyebrow {
  margin: 0;
  color: #5e7898;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.bank-v2__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #17314f;
}

.bank-v2__toolbar-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.bank-v2__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.bank-v2__stat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 12px;
  color: #64748b;
}

.bank-v2__stat-icon {
  width: 14px;
  height: 14px;
  color: #1a6ab5;
  flex-shrink: 0;
}

.bank-v2__stat-label {
  font-weight: 600;
}

.bank-v2__stat strong {
  color: #17314f;
  font-size: 13px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bank-v2__panel {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  padding: 14px;
}

.bank-v2__panel-head {
  margin-bottom: 12px;
}

.bank-v2__panel-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #172033;
}

.bank-v2__panel-desc {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.45;
  color: #64748b;
}

.bank-v2__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  font-size: 12px;
  color: #64748b;
  text-align: center;
  background: #f8fafc;
}

.bank-v2__empty p {
  margin: 0;
}

.bank-v2__account-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.bank-v2__account {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: #fafbfc;
}

.bank-v2__account--open {
  border-color: rgba(26, 106, 181, 0.22);
  background: #fff;
}

.bank-v2__account-toggle {
  width: 100%;
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr) auto auto auto;
  gap: 10px;
  align-items: center;
  padding: 10px 12px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.bank-v2__account-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  background: #e8f1ff;
  color: #1a6ab5;
  font-size: 11px;
  font-weight: 700;
}

.bank-v2__bank-mark {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  flex-shrink: 0;
  background: #e8f1ff;
  color: #1a6ab5;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.bank-v2__account-summary {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.bank-v2__account-summary strong {
  font-size: 13px;
  color: #172033;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bank-v2__account-summary span {
  font-size: 11px;
  color: #64748b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bank-v2__account-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
}

.bank-v2__tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 999px;
  background: #f1f5f9;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
}

.bank-v2__tag--active {
  background: #dcfce7;
  color: #166534;
}

.bank-v2__tag--inactive {
  background: #f1f5f9;
  color: #64748b;
}

.bank-v2__tag--muted {
  font-weight: 600;
}

.bank-v2__tag-icon {
  width: 11px;
  height: 11px;
}

.bank-v2__account-actions {
  display: flex;
  gap: 4px;
}

.bank-v2__chevron {
  width: 16px;
  height: 16px;
  color: #94a3b8;
  transition: transform 0.18s ease;
}

.bank-v2__account--open .bank-v2__chevron {
  transform: rotate(180deg);
}

.bank-v2__account-body {
  padding: 0 12px 12px;
  border-top: 1px solid #eef2f7;
}

.bank-v2__detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding-top: 12px;
}

.bank-v2__detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.bank-v2__detail-label {
  font-size: 11px;
  font-weight: 600;
  color: #64748b;
}

.bank-v2__detail-value {
  font-size: 12px;
  color: #172033;
  line-height: 1.45;
  word-break: break-all;
}

.bank-v2__detail-value--mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 11px;
}

.bank-v2__instructions {
  margin-top: 10px;
  padding: 10px 12px;
  border-radius: 8px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
}

.bank-v2__instructions p {
  margin: 4px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #475569;
}

@media (max-width: 900px) {
  .bank-v2__account-toggle {
    grid-template-columns: auto auto minmax(0, 1fr) auto auto;
  }

  .bank-v2__account-badges {
    display: none;
  }
}

@media (max-width: 640px) {
  .bank-v2__account-toggle {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .bank-v2__bank-mark {
    display: none;
  }

  .bank-v2__detail-grid {
    grid-template-columns: 1fr;
  }

  .bank-v2__account-actions {
    grid-column: 3;
    grid-row: 1;
  }

  .bank-v2__chevron {
    display: none;
  }
}
</style>
