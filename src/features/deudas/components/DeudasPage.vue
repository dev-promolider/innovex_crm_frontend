<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import AppDialog from '@/components/shared/AppDialog.vue'
import DeudaLedgerPanel from './DeudaLedgerPanel.vue'
import { useDeudasApi } from '../composables/useDeudasApi'
import AjustesAdminPanel from '@/features/finanzas/components/AjustesAdminPanel.vue'
import ComisionesAdminPanel from '@/features/finanzas/components/ComisionesAdminPanel.vue'
import RetencionesAdminPanel from '@/features/finanzas/components/RetencionesAdminPanel.vue'
import ReversarTransaccionDialog from '@/features/finanzas/components/ReversarTransaccionDialog.vue'
import { useFinanzasLedgerApi } from '@/features/finanzas/composables/useFinanzasLedgerApi'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { formatDate as formatLocalizedDate } from '@/utils/formatters'
import type { DebtListItem, LedgerMovement } from '../types'

const {
  debtDetail,
  accountStatement,
  debts,
  errorMessage,
  filteredDebts,
  filters,
  isAccountStatementLoading,
  isDetailLoading,
  isLoading,
  pagination,
  selectedDebtId,
  totalPending,
  totalOverdue,
  activeDebtsCount,
  overdueInstallments,
  fetchDebts,
  selectDebt,
  abrirDisputa,
  resolverDisputa,
} = useDeudasApi()

const {
  isSubmitting: isReversing,
  errorMessage: reversalError,
  reversarTransaccion,
} = useFinanzasLedgerApi()

const { ensureCurrencyLoaded, formatCurrency: formatMoney } = useWorkspaceCurrency()

type FinanceTab = 'cartera' | 'ajustes' | 'retenciones' | 'comisiones'

const activeTab = shallowRef<FinanceTab>('cartera')
const selectedMovement = shallowRef<LedgerMovement | null>(null)
const showReversalDialog = shallowRef(false)
const showDisputeDialog = shallowRef(false)
const disputeMode = shallowRef<'open' | 'resolve'>('open')
const disputeForm = reactive({
  debtId: null as number | null,
  motivo: '',
})

const formatDate = (value: string | null | undefined) =>
  formatLocalizedDate(value)

const stateLabel = (state: string | null | undefined) => ({
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  pagada: 'Pagada',
  vencida: 'Vencida',
  en_disputa: 'En disputa',
}[state ?? ''] ?? 'Sin estado')

const selectedDebt = computed(() =>
  debts.value.find((debt) => debt.id === selectedDebtId.value) ?? null,
)

const selectedMembresiaId = computed(() => selectedDebt.value?.distribuidor.membresia_id ?? null)

const changePage = async (page: number) => {
  await fetchDebts(page)
}

const handleSelectDebt = async (debtId: number) => {
  await selectDebt(debtId)
}

const openReversalDialog = (movement: LedgerMovement) => {
  selectedMovement.value = movement
  showReversalDialog.value = true
}

const handleReverseMovement = async (payload: { movementId: number; motivo: string }) => {
  await reversarTransaccion(payload.movementId, payload.motivo)
  showReversalDialog.value = false

  if (selectedDebtId.value) {
    await selectDebt(selectedDebtId.value)
  }
}

const openDisputeDialog = (debtId: number) => {
  disputeMode.value = 'open'
  disputeForm.debtId = debtId
  disputeForm.motivo = ''
  showDisputeDialog.value = true
}

const openResolveDisputeDialog = (debtId: number) => {
  disputeMode.value = 'resolve'
  disputeForm.debtId = debtId
  disputeForm.motivo = ''
  showDisputeDialog.value = true
}

const submitDispute = async () => {
  if (!disputeForm.debtId || !disputeForm.motivo.trim()) {
    return
  }

  if (disputeMode.value === 'open') {
    await abrirDisputa(disputeForm.debtId, disputeForm.motivo.trim())
  } else {
    await resolverDisputa(disputeForm.debtId, disputeForm.motivo.trim())
  }

  showDisputeDialog.value = false
}

const rowClass = (debt: DebtListItem) => ({
  'portfolio-row-selected': selectedDebtId.value === debt.id,
})

onMounted(async () => {
  await ensureCurrencyLoaded()
  await fetchDebts()
})
</script>

<template>
  <section class="admin-list-page deudas-page">
    <header class="admin-list-page__header">
      <div>
        <h1 class="admin-list-page__title">Deudas y cobranzas</h1>
        <p class="admin-list-page__subtitle">
          Vista operativa de la cartera activa, con foco en vencimientos, cuotas y trazabilidad por contrato.
        </p>
      </div>

      <div class="admin-list-page__actions">
        <button class="admin-btn admin-btn--outline" :disabled="isLoading" @click="fetchDebts(pagination.current_page)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          {{ isLoading ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </header>

    <nav class="finance-tabs" aria-label="Secciones financieras">
      <button class="finance-tabs__item" :class="{ 'finance-tabs__item--active': activeTab === 'cartera' }" type="button" @click="activeTab = 'cartera'">
        Cartera
      </button>
      <button class="finance-tabs__item" :class="{ 'finance-tabs__item--active': activeTab === 'ajustes' }" type="button" @click="activeTab = 'ajustes'">
        Ajustes
      </button>
      <button class="finance-tabs__item" :class="{ 'finance-tabs__item--active': activeTab === 'retenciones' }" type="button" @click="activeTab = 'retenciones'">
        Retenciones
      </button>
      <button class="finance-tabs__item" :class="{ 'finance-tabs__item--active': activeTab === 'comisiones' }" type="button" @click="activeTab = 'comisiones'">
        Comisiones
      </button>
    </nav>

    <template v-if="activeTab === 'cartera'">
    <div class="admin-table-filters deudas-filters">
      <div class="admin-search-box admin-search-box--wide debt-search">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        <input v-model="filters.search" class="admin-search-input" placeholder="Buscar distribuidor, campaña o contrato" type="search" />
      </div>

      <select v-model="filters.estado" class="admin-select-filter" @change="fetchDebts()">
        <option value="todos">Todos los estados</option>
        <option value="pendiente">Pendiente</option>
        <option value="en_curso">En curso</option>
        <option value="vencida">Vencida</option>
        <option value="en_disputa">En disputa</option>
        <option value="pagada">Pagada</option>
      </select>

      <select v-model="filters.modeloPago" class="admin-select-filter" @change="fetchDebts()">
        <option value="todos">Todos los modelos</option>
        <option value="bullet">Bullet</option>
        <option value="fraccionado">Fraccionado</option>
      </select>
    </div>

    <div v-if="errorMessage" class="admin-alert admin-alert--error">
      {{ errorMessage }}
    </div>

    <section class="admin-kpi-grid">
      <article class="admin-kpi-card">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--blue">{{ formatMoney(totalPending) }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14.5a3.5 3.5 0 0 1 0 7H6"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Saldo por cobrar</span>
        <span class="admin-kpi-card__sub">{{ pagination.total }} registros en cartera</span>
      </article>

      <article class="admin-kpi-card admin-kpi-card--danger">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--red">{{ formatMoney(totalOverdue) }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--red">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Exposición vencida</span>
        <span class="admin-kpi-card__sub">{{ overdueInstallments }} cuotas vencidas</span>
      </article>

      <article class="admin-kpi-card admin-kpi-card--warn">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--orange">{{ activeDebtsCount }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--orange">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Seguimiento activo</span>
        <span class="admin-kpi-card__sub">Deudas en curso o pendientes</span>
      </article>

      <article class="admin-kpi-card admin-kpi-card--accent">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--teal">{{ filteredDebts.length }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--teal">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3h18v4H3z"/><path d="M5 7v13h14V7"/><path d="M9 11h6"/><path d="M9 15h4"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Registros visibles</span>
        <span class="admin-kpi-card__sub">Filtrados en la página actual</span>
      </article>
    </section>

    <section class="workspace-grid">
      <div class="admin-surface-card portfolio-panel">
        <div class="admin-section-header">
          <div>
            <h2 class="admin-section-title">Cartera administrativa</h2>
            <p class="admin-section-sub">Lista priorizada por vencimiento y saldo pendiente.</p>
          </div>
          <div class="panel-chip">
            <span>{{ filteredDebts.length }}</span>
            <small>visibles</small>
          </div>
        </div>

        <div v-if="isLoading" class="panel-state">Cargando deudas...</div>

        <div v-else-if="filteredDebts.length === 0" class="panel-state">
          No hay registros para los filtros actuales.
        </div>

        <div v-else class="portfolio-table-wrap">
          <table class="portfolio-table">
            <thead>
              <tr>
                <th>Distribuidor</th>
                <th>Campaña</th>
                <th>Kit</th>
                <th>Modelo</th>
                <th>Saldo</th>
                <th>Próximo vencimiento</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="debt in filteredDebts"
                :key="debt.id"
                class="portfolio-row"
                :class="rowClass(debt)"
                @click="handleSelectDebt(debt.id)"
              >
                <td>
                  <strong>{{ debt.distribuidor.nombre ?? 'Sin nombre' }}</strong>
                  <p>{{ debt.contrato.numero ?? 'Sin contrato' }}</p>
                </td>
                <td>{{ debt.campana.nombre ?? '—' }}</td>
                <td>
                  <strong>{{ debt.kit.nombre ?? '—' }}</strong>
                  <p>{{ debt.kit.cantidad_recibida ?? 0 }} unidades</p>
                </td>
                <td>{{ debt.modelo_pago }}</td>
                <td>{{ formatMoney(debt.monto_pendiente) }}</td>
                <td>{{ formatDate(debt.proxima_cuota?.fecha_vencimiento ?? debt.fecha_vencimiento) }}</td>
                <td>
                  <span class="row-state" :class="`row-state-${debt.estado}`">{{ stateLabel(debt.estado) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer v-if="pagination.last_page > 1" class="admin-table-footer">
          <span class="admin-table-count">Pagina {{ pagination.current_page }} de {{ pagination.last_page }} · {{ pagination.total }} total</span>
          <div class="admin-pagination">
            <button class="admin-page-btn" :disabled="pagination.current_page === 1" type="button" @click="changePage(pagination.current_page - 1)">
              Anterior
            </button>
            <button class="admin-page-btn" :disabled="pagination.current_page === pagination.last_page" type="button" @click="changePage(pagination.current_page + 1)">
              Siguiente
            </button>
          </div>
        </footer>
      </div>

      <DeudaLedgerPanel
        :account-statement="accountStatement"
        :debt-detail="debtDetail"
        :debts="filteredDebts"
        :is-account-statement-loading="isAccountStatementLoading"
        :is-loading="isDetailLoading && !selectedDebt"
        :selected-debt-id="selectedDebtId"
        @open-dispute="openDisputeDialog"
        @resolve-dispute="openResolveDisputeDialog"
        @reverse-movement="openReversalDialog"
        @select="handleSelectDebt"
      />
    </section>
    </template>

    <AjustesAdminPanel v-else-if="activeTab === 'ajustes'" :selected-membresia-id="selectedMembresiaId" />
    <RetencionesAdminPanel v-else-if="activeTab === 'retenciones'" :selected-membresia-id="selectedMembresiaId" />
    <ComisionesAdminPanel v-else />

    <ReversarTransaccionDialog
      v-model:open="showReversalDialog"
      :error-message="reversalError"
      :movement="selectedMovement"
      :submitting="isReversing"
      @submit="handleReverseMovement"
    />

    <AppDialog
      v-model:open="showDisputeDialog"
      :title="disputeMode === 'open' ? 'Abrir disputa' : 'Resolver disputa'"
      :description="disputeMode === 'open' ? 'La deuda dejará de generar vencimientos y penalizaciones automáticas hasta resolverla.' : 'La deuda volverá a su estado operativo según saldo y vencimiento.'"
      width="md"
    >
      <label class="dispute-field">
        <span>{{ disputeMode === 'open' ? 'Motivo' : 'Resolución' }}</span>
        <textarea v-model="disputeForm.motivo" maxlength="500" rows="4" />
      </label>
      <template #footer>
        <button class="admin-btn admin-btn--outline" type="button" @click="showDisputeDialog = false">Cancelar</button>
        <button class="admin-btn admin-btn--primary" type="button" :disabled="!disputeForm.motivo.trim()" @click="submitDispute">
          {{ disputeMode === 'open' ? 'Abrir disputa' : 'Resolver' }}
        </button>
      </template>
    </AppDialog>
  </section>
</template>

<style scoped>
.deudas-page {
  --stroke-soft: rgba(15, 23, 42, 0.08);
  --ink-main: #162033;
  --ink-muted: #5f6b7c;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.deudas-filters {
  margin-top: -8px;
}

.finance-tabs {
  background: #f8fafc;
  border: 1px solid var(--stroke-soft);
  border-radius: 18px;
  display: flex;
  gap: 8px;
  padding: 6px;
  width: fit-content;
}

.finance-tabs__item {
  background: transparent;
  border: 0;
  border-radius: 14px;
  color: var(--ink-muted);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  padding: 10px 16px;
}

.finance-tabs__item--active {
  background: #fff;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  color: var(--ink-main);
}

.dispute-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dispute-field span {
  color: var(--ink-muted);
  font-size: 12px;
}

.dispute-field textarea {
  border: 1px solid rgba(15, 23, 42, 0.16);
  border-radius: 14px;
  padding: 10px 12px;
  resize: vertical;
}

.workspace-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 420px);
}

.portfolio-panel {
  border: 1px solid var(--stroke-soft);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
}

.panel-chip {
  align-items: center;
  background: #f8fafc;
  border: 1px solid var(--stroke-soft);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 56px;
  min-width: 72px;
  padding: 8px 12px;
}

.panel-chip span {
  color: var(--ink-main);
  font-size: 18px;
  font-weight: 700;
}

.panel-chip small,
.portfolio-table td p {
  color: var(--ink-muted);
  font-size: 12px;
  margin: 0;
}

.panel-state {
  color: var(--ink-muted);
  padding: 24px 0;
}

.portfolio-table-wrap {
  overflow-x: auto;
}

.portfolio-table {
  border-collapse: collapse;
  width: 100%;
}

.portfolio-table th,
.portfolio-table td {
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  font-size: 13px;
  padding: 14px 12px;
  text-align: left;
  vertical-align: middle;
}

.portfolio-table th {
  color: var(--ink-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.portfolio-row {
  cursor: pointer;
}

.portfolio-row-selected,
.portfolio-row:hover {
  background: #f8fafc;
}

.row-state {
  border-radius: 999px;
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
}

.row-state-pagada {
  background: #dcfce7;
  color: #166534;
}

.row-state-vencida {
  background: #fee2e2;
  color: #991b1b;
}

.row-state-en_curso,
.row-state-pendiente {
  background: #dbeafe;
  color: #1d4ed8;
}

.row-state-en_disputa {
  background: #f3e8ff;
  color: #7c3aed;
}

.debt-search {
  width: 320px;
  max-width: 100%;
}

@media (max-width: 1180px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .debt-search {
    width: 100%;
  }
}
</style>
