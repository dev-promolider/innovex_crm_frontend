<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { useAnalyticsApi } from '@/features/analytics/composables/useAnalyticsApi'
import { formatDate as formatLocalizedDate } from '@/utils/formatters'
import type {
  AnalyticsSummary,
  DistributorRankingItem,
  LeaderNetworkHealth,
  SalesByCampaign,
  SalesByPeriod,
} from '@/features/analytics/composables/useAnalyticsApi'

const analyticsApi = useAnalyticsApi()
const { ensureCurrencyLoaded, formatCurrency } = useWorkspaceCurrency()
const isLoading = shallowRef(false)
const errorMessage = shallowRef('')
const summary = shallowRef<AnalyticsSummary | null>(null)
const salesByCampaign = shallowRef<SalesByCampaign[]>([])
const salesByPeriod = shallowRef<SalesByPeriod[]>([])
const distributorRanking = shallowRef<DistributorRankingItem[]>([])
const leaderHealth = shallowRef<LeaderNetworkHealth[]>([])
const filters = reactive({ desde: '', hasta: '', granularidad: 'day' as 'day' | 'week' })

const maxPeriodAmount = computed(() => Math.max(...salesByPeriod.value.map((item) => item.monto), 1))
const maxCampaignAmount = computed(() => Math.max(...salesByCampaign.value.map((item) => item.monto), 1))
const currentRangeLabel = computed(() => {
  if (filters.desde || filters.hasta) {
    return `${filters.desde || 'Inicio abierto'} - ${filters.hasta || 'Hoy'}`
  }

  return 'Período operativo completo'
})

const summaryCards = computed(() => {
  if (!summary.value) {
    return []
  }

  const approvedAmount = summary.value.ventas.aprobadas_monto
  const approvedCount = summary.value.ventas.aprobadas_cantidad
  const pendingAmount = summary.value.ventas.pendientes_monto
  const rejectedAmount = summary.value.ventas.rechazadas_monto
  const totalTracked = approvedAmount + pendingAmount + rejectedAmount
  const approvalRate = totalTracked > 0 ? approvedAmount / totalTracked : 0

  return [
    {
      title: 'Ventas aprobadas',
      value: formatCurrency(approvedAmount),
      detail: `${approvedCount} operaciones cerradas`,
      tone: 'success',
    },
    {
      title: 'Pendiente por validar',
      value: formatCurrency(pendingAmount),
      detail: `${summary.value.ventas.pendientes_cantidad} operaciones en cola`,
      tone: 'warning',
    },
    {
      title: 'Deuda activa',
      value: formatCurrency(summary.value.finanzas.deuda_activa_monto),
      detail: 'Exposición financiera vigente',
      tone: 'danger',
    },
    {
      title: 'Distribuidores activos',
      value: String(summary.value.distribuidores.activos),
      detail: 'Base comercial con actividad',
      tone: 'info',
    },
    {
      title: 'Canjes marketplace',
      value: String(summary.value.marketplace.canjes_cantidad),
      detail: `${summary.value.marketplace.puntos_utilizados} puntos usados`,
      tone: 'neutral',
    },
    {
      title: 'Tasa de aprobación',
      value: formatPercent(approvalRate),
      detail: 'Peso de ventas aprobadas sobre monto trazado',
      tone: 'success',
    },
  ]
})

const topCampaign = computed(() => salesByCampaign.value[0] ?? null)
const topDistributor = computed(() => distributorRanking.value[0] ?? null)
const healthiestLeader = computed(() => {
  return [...leaderHealth.value]
    .sort((left, right) => (right.valor_salud_red ?? -1) - (left.valor_salud_red ?? -1))[0] ?? null
})
const periodHighlights = computed(() => {
  if (!summary.value) {
    return []
  }

  return [
    {
      label: 'Periodo consultado',
      value: `${summary.value.periodo.desde || 'N/D'} - ${summary.value.periodo.hasta || 'N/D'}`,
    },
    {
      label: 'Campaña líder',
      value: topCampaign.value ? `${topCampaign.value.campana_nombre} · ${formatCurrency(topCampaign.value.monto)}` : 'Sin ventas aprobadas',
    },
    {
      label: 'Distribuidor líder',
      value: topDistributor.value ? `${topDistributor.value.nombre || `Membresía ${topDistributor.value.membresia_id}`} · ${formatCurrency(topDistributor.value.monto)}` : 'Sin ranking disponible',
    },
    {
      label: 'Mejor salud de red',
      value: healthiestLeader.value ? `${healthiestLeader.value.nombre || `Membresía ${healthiestLeader.value.membresia_id}`} · ${formatPercent(healthiestLeader.value.valor_salud_red)}` : 'Sin evaluación',
    },
  ]
})

const formatPercent = (value: number | null | undefined) =>
  value == null ? 'Sin evaluar' : `${Math.round(Number(value) * 100)}%`

const formatDate = (value: string | null | undefined) =>
  formatLocalizedDate(value)

const loadAnalytics = async () => {
  isLoading.value = true
  errorMessage.value = ''
  const baseFilters = {
    desde: filters.desde || undefined,
    hasta: filters.hasta || undefined,
  }

  try {
    const [summaryData, campaignData, periodData, distributorsData, healthData] = await Promise.all([
      analyticsApi.fetchSummary(baseFilters),
      analyticsApi.fetchSalesByCampaign(baseFilters),
      analyticsApi.fetchSalesByPeriod({ ...baseFilters, granularidad: filters.granularidad }),
      analyticsApi.fetchDistributorRanking({ ...baseFilters, limit: 10 }),
      analyticsApi.fetchLeaderNetworkHealth(baseFilters),
    ])

    summary.value = summaryData
    salesByCampaign.value = campaignData
    salesByPeriod.value = periodData
    distributorRanking.value = distributorsData
    leaderHealth.value = healthData
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar métricas.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void Promise.all([ensureCurrencyLoaded(), loadAnalytics()])
})
</script>

<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Métricas</strong></span>
    </template>

    <div class="page-body metrics-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Análisis y métricas</h1>
          <p class="page-subtitle">Vista ejecutiva alineada: filtros claros, KPIs comparables y paneles con jerarquía real para período, campañas, distribuidores y red.</p>
        </div>
        <button class="btn-primary" type="button" :disabled="isLoading" @click="loadAnalytics">
          {{ isLoading ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </header>

      <div class="analytics-layout">
        <aside class="filters-panel">
          <h3 class="filters-title">Control del tablero</h3>
          <p class="filters-subtitle">Rango actual: {{ currentRangeLabel }}</p>

          <div class="filter-section">
            <label class="filter-label">
              Desde
              <input v-model="filters.desde" type="date" class="form-control" />
            </label>
          </div>

          <div class="filter-section">
            <label class="filter-label">
              Hasta
              <input v-model="filters.hasta" type="date" class="form-control" />
            </label>
          </div>

          <div class="filter-section">
            <label class="filter-label">
              Granularidad
              <select v-model="filters.granularidad" class="form-control">
                <option value="day">Día</option>
                <option value="week">Semana</option>
              </select>
            </label>
          </div>

          <div class="filter-actions">
            <button class="btn-primary btn-block" type="button" :disabled="isLoading" @click="loadAnalytics">Aplicar análisis</button>
          </div>

          <div class="summary-panel">
            <h4 class="summary-title">Lectura rápida</h4>
            <div v-for="item in periodHighlights" :key="item.label" class="summary-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </aside>

        <div class="analytics-content">
          <div v-if="errorMessage" class="alert-error">{{ errorMessage }}</div>

          <section v-if="summaryCards.length" class="metrics-kpis">
            <article v-for="card in summaryCards" :key="card.title" class="metric-card" :class="`metric-card--${card.tone}`">
              <span class="metric-label">{{ card.title }}</span>
              <strong>{{ card.value }}</strong>
              <span class="metric-detail">{{ card.detail }}</span>
            </article>
          </section>

          <section class="metrics-grid metrics-grid--charts">
            <article class="metrics-panel">
              <div class="panel-header">
                <div>
                  <h3>Ventas por período</h3>
                  <p class="panel-subtitle">Comparación por {{ filters.granularidad === 'day' ? 'día' : 'semana' }} con monto y cantidad.</p>
                </div>
              </div>
              <div v-if="salesByPeriod.length === 0" class="empty-state">Sin ventas aprobadas en el período.</div>
              <div v-else class="bars-list">
                <div v-for="item in salesByPeriod" :key="item.periodo" class="bar-row">
                  <div class="bar-labels">
                    <span class="bar-title">{{ item.periodo }}</span>
                    <small>{{ item.ventas }} ventas</small>
                  </div>
                  <div class="bar-track"><div class="bar-fill" :style="{ width: `${Math.max(4, (item.monto / maxPeriodAmount) * 100)}%` }" /></div>
                  <strong class="bar-value">{{ formatCurrency(item.monto) }}</strong>
                </div>
              </div>
            </article>

            <article class="metrics-panel">
              <div class="panel-header">
                <div>
                  <h3>Ventas por campaña</h3>
                  <p class="panel-subtitle">Peso comercial por campaña activa o histórica.</p>
                </div>
              </div>
              <div v-if="salesByCampaign.length === 0" class="empty-state">Sin campañas con ventas aprobadas.</div>
              <div v-else class="bars-list">
                <div v-for="item in salesByCampaign" :key="item.campana_id ?? item.campana_nombre" class="bar-row">
                  <div class="bar-labels">
                    <span class="bar-title">{{ item.campana_nombre }}</span>
                    <small>{{ item.ventas }} ventas · ticket {{ formatCurrency(item.ticket_promedio) }}</small>
                  </div>
                  <div class="bar-track"><div class="bar-fill bar-fill--green" :style="{ width: `${Math.max(4, (item.monto / maxCampaignAmount) * 100)}%` }" /></div>
                  <strong class="bar-value">{{ formatCurrency(item.monto) }}</strong>
                </div>
              </div>
            </article>
          </section>

          <section class="metrics-grid metrics-grid--tables">
            <article class="metrics-panel">
              <div class="panel-header">
                <div>
                  <h3>Top distribuidores</h3>
                  <p class="panel-subtitle">Ranking por monto aprobado y nivel de confianza.</p>
                </div>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Distribuidor</th><th>Rango</th><th>Ventas</th><th>Monto</th><th>Confianza</th></tr></thead>
                  <tbody>
                    <tr v-if="distributorRanking.length === 0"><td colspan="5" class="empty-state">Sin ranking disponible.</td></tr>
                    <tr v-for="item in distributorRanking" :key="item.membresia_id">
                      <td>
                        <div class="table-title">{{ item.nombre || `Membresía ${item.membresia_id}` }}</div>
                        <div class="table-subtitle">ID {{ item.membresia_id }}</div>
                      </td>
                      <td>{{ item.rango || 'Sin rango' }}</td>
                      <td>{{ item.ventas }}</td>
                      <td>{{ formatCurrency(item.monto) }}</td>
                      <td>{{ item.nivel_confianza ?? '—' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>

            <article class="metrics-panel">
              <div class="panel-header">
                <div>
                  <h3>Salud de red por líder</h3>
                  <p class="panel-subtitle">Equipo directo, score de salud y última lectura registrada.</p>
                </div>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Líder</th><th>Rango</th><th>Equipo</th><th>Salud</th><th>Última evaluación</th></tr></thead>
                  <tbody>
                    <tr v-if="leaderHealth.length === 0"><td colspan="5" class="empty-state">Sin líderes evaluados.</td></tr>
                    <tr v-for="item in leaderHealth" :key="item.membresia_id">
                      <td>
                        <div class="table-title">{{ item.nombre || `Membresía ${item.membresia_id}` }}</div>
                        <div class="table-subtitle">Score final {{ item.score_final_calculado ?? '—' }}</div>
                      </td>
                      <td>{{ item.rango || 'Sin rango' }}</td>
                      <td>{{ item.tamano_equipo_directo }}</td>
                      <td>{{ formatPercent(item.valor_salud_red) }}</td>
                      <td>{{ formatDate(item.evaluado_at) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.metrics-page,
.analytics-content,
.metrics-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.page-title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  color: #111827;
}

.page-subtitle {
  margin: 8px 0 0;
  max-width: 840px;
  color: #6b7280;
}

.analytics-layout,
.metrics-kpis,
.metrics-grid {
  display: grid;
  gap: 18px;
}

.analytics-layout {
  grid-template-columns: 300px minmax(0, 1fr);
  align-items: start;
}

.filters-panel,
.metric-card,
.metrics-panel {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  box-shadow: 0 18px 40px -28px rgba(15, 23, 42, 0.35);
}

.filters-panel,
.metrics-panel {
  padding: 22px;
}

.filters-title,
.summary-title,
.metrics-panel h3 {
  margin: 0;
  color: #111827;
  font-weight: 800;
}

.filters-title,
.metrics-panel h3 {
  font-size: 18px;
}

.filters-subtitle,
.panel-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.filter-section + .filter-section,
.summary-panel {
  margin-top: 16px;
}

.filter-label {
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.form-control {
  min-height: 42px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  padding: 0 14px;
  color: #111827;
  background: #fff;
}

.filter-actions {
  margin-top: 18px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border: 1px solid #111827;
  background: #111827;
  color: #fff;
  border-radius: 14px;
  padding: 0 16px;
  font-weight: 700;
}

.btn-block {
  width: 100%;
}

.summary-panel {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 16px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.summary-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 0;
  border-bottom: 1px solid #edf2f7;
}

.summary-row:last-child {
  border-bottom: 0;
}

.summary-row span {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: #6b7280;
}

.summary-row strong {
  color: #111827;
}

.alert-error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 18px;
  padding: 14px 16px;
}

.metrics-kpis {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.metric-card {
  padding: 18px;
}

.metric-label {
  display: block;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}

.metric-card strong {
  display: block;
  margin-top: 12px;
  color: #111827;
  font-size: 28px;
  line-height: 1.1;
}

.metric-detail {
  display: block;
  margin-top: 10px;
  color: #64748b;
}

.metric-card--success {
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}

.metric-card--warning {
  background: linear-gradient(180deg, #ffffff 0%, #fffbeb 100%);
}

.metric-card--danger {
  background: linear-gradient(180deg, #ffffff 0%, #fef2f2 100%);
}

.metric-card--info {
  background: linear-gradient(180deg, #ffffff 0%, #eff6ff 100%);
}

.metric-card--neutral {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.metrics-grid--charts {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metrics-grid--tables {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.bars-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bar-row {
  display: grid;
  grid-template-columns: minmax(140px, 180px) minmax(120px, 1fr) minmax(100px, 130px);
  gap: 12px;
  align-items: center;
  font-size: 13px;
}

.bar-labels {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.bar-title {
  font-weight: 700;
  color: #111827;
}

.bar-labels small {
  color: #6b7280;
}

.bar-track {
  height: 12px;
  border-radius: 999px;
  background: #eef2f7;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #2563eb, #60a5fa);
}

.bar-fill--green {
  background: linear-gradient(90deg, #059669, #34d399);
}

.bar-value {
  text-align: right;
  color: #111827;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  padding: 12px 10px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #6b7280;
}

.data-table td {
  padding: 14px 10px;
  border-bottom: 1px solid #f1f5f9;
  color: #111827;
  vertical-align: top;
}

.table-title {
  font-weight: 700;
  color: #111827;
}

.table-subtitle {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.empty-state {
  padding: 24px 12px;
  text-align: center;
  color: #6b7280;
}

@media (max-width: 1180px) {
  .analytics-layout,
  .metrics-grid--charts,
  .metrics-grid--tables {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .bar-row {
    grid-template-columns: 1fr;
  }

  .bar-value {
    text-align: left;
  }

  .page-title {
    font-size: 26px;
  }

  .filters-panel,
  .metrics-panel,
  .metric-card {
    padding: 18px;
  }
}
</style>
