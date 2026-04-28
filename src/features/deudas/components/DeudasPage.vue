<script setup lang="ts">
import { computed, onMounted } from 'vue'
import DeudaLedgerPanel from './DeudaLedgerPanel.vue'
import { useDeudasApi } from '../composables/useDeudasApi'
import type { DebtListItem } from '../types'

const {
  debtDetail,
  debts,
  errorMessage,
  filteredDebts,
  filters,
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
} = useDeudasApi()

const formatMoney = (value: number | null | undefined) =>
  new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0))

const formatDate = (value: string | null | undefined) =>
  value ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value)) : '—'

const stateLabel = (state: string | null | undefined) => ({
  pendiente: 'Pendiente',
  en_curso: 'En curso',
  pagada: 'Pagada',
  vencida: 'Vencida',
  en_disputa: 'En disputa',
}[state ?? ''] ?? 'Sin estado')

const summaryCards = computed(() => [
  {
    label: 'Saldo por cobrar',
    value: formatMoney(totalPending.value),
    tone: 'cyan',
    caption: `${pagination.total} registros en cartera`,
  },
  {
    label: 'Exposición vencida',
    value: formatMoney(totalOverdue.value),
    tone: 'coral',
    caption: `${overdueInstallments.value} cuotas vencidas`,
  },
  {
    label: 'Seguimiento activo',
    value: String(activeDebtsCount.value),
    tone: 'amber',
    caption: 'Deudas en curso o pendientes',
  },
])

const selectedDebt = computed(() =>
  debts.value.find((debt) => debt.id === selectedDebtId.value) ?? null,
)

const changePage = async (page: number) => {
  await fetchDebts(page)
}

const handleSelectDebt = async (debtId: number) => {
  await selectDebt(debtId)
}

const rowClass = (debt: DebtListItem) => ({
  'portfolio-row-selected': selectedDebtId.value === debt.id,
})

onMounted(async () => {
  await fetchDebts()
})
</script>

<template>
  <section class="deudas-page">
    <header class="hero">
      <div>
        <p class="hero-kicker">Panel admin</p>
        <h1 class="hero-title">Deudas y cobranzas</h1>
        <p class="hero-subtitle">
          Vista operativa de la cartera activa, con foco en vencimientos, cuotas y trazabilidad por contrato.
        </p>
      </div>

      <div class="hero-filters">
        <input v-model="filters.search" class="hero-search" placeholder="Buscar distribuidor, campaña o contrato" type="search" />
        <select v-model="filters.estado" class="hero-select" @change="fetchDebts()">
          <option value="todos">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_curso">En curso</option>
          <option value="vencida">Vencida</option>
          <option value="pagada">Pagada</option>
        </select>
        <select v-model="filters.modeloPago" class="hero-select" @change="fetchDebts()">
          <option value="todos">Todos los modelos</option>
          <option value="bullet">Bullet</option>
          <option value="fraccionado">Fraccionado</option>
        </select>
      </div>
    </header>

    <div v-if="errorMessage" class="alert-error">
      {{ errorMessage }}
    </div>

    <section class="summary-grid">
      <article v-for="card in summaryCards" :key="card.label" class="summary-card" :class="`summary-card-${card.tone}`">
        <p class="summary-label">{{ card.label }}</p>
        <strong class="summary-value">{{ card.value }}</strong>
        <span class="summary-caption">{{ card.caption }}</span>
      </article>
    </section>

    <section class="workspace-grid">
      <div class="portfolio-panel">
        <div class="panel-head">
          <div>
            <h2 class="panel-title">Cartera administrativa</h2>
            <p class="panel-subtitle">Lista priorizada por vencimiento y saldo pendiente.</p>
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

        <footer v-if="pagination.last_page > 1" class="pagination">
          <button class="page-button" :disabled="pagination.current_page === 1" type="button" @click="changePage(pagination.current_page - 1)">
            Anterior
          </button>
          <span>Página {{ pagination.current_page }} de {{ pagination.last_page }}</span>
          <button class="page-button" :disabled="pagination.current_page === pagination.last_page" type="button" @click="changePage(pagination.current_page + 1)">
            Siguiente
          </button>
        </footer>
      </div>

      <DeudaLedgerPanel
        :debt-detail="debtDetail"
        :debts="filteredDebts"
        :is-loading="isDetailLoading && !selectedDebt"
        :selected-debt-id="selectedDebtId"
        @select="handleSelectDebt"
      />
    </section>
  </section>
</template>

<style scoped>
.deudas-page {
  --surface-1: #fffaf2;
  --surface-2: #ffffff;
  --stroke-soft: rgba(15, 23, 42, 0.08);
  --ink-main: #162033;
  --ink-muted: #5f6b7c;
  --cyan: #006466;
  --coral: #c2410c;
  --amber: #a16207;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero {
  align-items: end;
  background:
    radial-gradient(circle at top right, rgba(0, 100, 102, 0.14), transparent 30%),
    linear-gradient(135deg, #fff9ef 0%, #ffffff 100%);
  border: 1px solid var(--stroke-soft);
  border-radius: 28px;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
  padding: 24px;
}

.hero-kicker {
  color: var(--cyan);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.16em;
  margin: 0 0 8px;
  text-transform: uppercase;
}

.hero-title {
  color: var(--ink-main);
  font-size: 34px;
  line-height: 1;
  margin: 0 0 10px;
}

.hero-subtitle {
  color: var(--ink-muted);
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  max-width: 62ch;
}

.hero-filters {
  display: grid;
  gap: 10px;
}

.hero-search,
.hero-select {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  color: var(--ink-main);
  font: inherit;
  min-height: 46px;
  padding: 0 14px;
}

.alert-error {
  background: #fff1f2;
  border: 1px solid #fecdd3;
  border-radius: 18px;
  color: #be123c;
  padding: 14px 16px;
}

.summary-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-card {
  border-radius: 22px;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 150px;
  overflow: hidden;
  padding: 20px;
  position: relative;
}

.summary-card::after {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  content: '';
  height: 120px;
  position: absolute;
  right: -24px;
  top: -24px;
  width: 120px;
}

.summary-card-cyan {
  background: linear-gradient(135deg, #0f766e, #006466);
}

.summary-card-coral {
  background: linear-gradient(135deg, #ea580c, #9a3412);
}

.summary-card-amber {
  background: linear-gradient(135deg, #ca8a04, #854d0e);
}

.summary-label,
.summary-caption {
  margin: 0;
  position: relative;
  z-index: 1;
}

.summary-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  opacity: 0.78;
  text-transform: uppercase;
}

.summary-value {
  font-size: 32px;
  line-height: 1;
  position: relative;
  z-index: 1;
}

.summary-caption {
  font-size: 13px;
  opacity: 0.88;
}

.workspace-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 420px);
}

.portfolio-panel {
  background: var(--surface-2);
  border: 1px solid var(--stroke-soft);
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px;
}

.panel-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.panel-title {
  color: var(--ink-main);
  font-size: 20px;
  margin: 0 0 4px;
}

.panel-subtitle {
  color: var(--ink-muted);
  font-size: 13px;
  margin: 0;
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

.pagination {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.page-button {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 999px;
  color: var(--ink-main);
  cursor: pointer;
  min-height: 38px;
  padding: 0 14px;
}

.page-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (max-width: 1180px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 900px) {
  .hero,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
