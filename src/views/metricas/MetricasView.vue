<script setup lang="ts">
import { computed, onMounted, reactive, ref, shallowRef, watch } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { useAnalyticsApi } from '@/features/analytics/composables/useAnalyticsApi'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
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
const summary = shallowRef<AnalyticsSummary | null>(null)
const salesByCampaign = shallowRef<SalesByCampaign[]>([])
const salesByPeriod = shallowRef<SalesByPeriod[]>([])
const distributorRanking = shallowRef<DistributorRankingItem[]>([])
const leaderHealth = shallowRef<LeaderNetworkHealth[]>([])
const panelErrors = reactive({
  summary: '',
  salesByPeriod: '',
  salesByCampaign: '',
  distributorRanking: '',
  leaderHealth: '',
})
const selectedPeriod = ref<'personalizado' | 'hoy' | 'ultimos7' | 'ultimos30' | 'esteMes' | 'mesAnterior'>('personalizado')
const filters = reactive({ desde: '', hasta: '', granularidad: 'day' as 'day' | 'week' })
watch(() => filters.desde, (desde) => {
  if (desde && filters.hasta && filters.hasta < desde) {
    filters.hasta = ''
  }
})

const maxPeriodAmount = computed(() => Math.max(...salesByPeriod.value.map((item) => item.monto), 1))
const maxCampaignAmount = computed(() => Math.max(...salesByCampaign.value.map((item) => item.monto), 1))
const rangeIsInvalid = computed(() => Boolean(filters.desde && filters.hasta && filters.hasta < filters.desde))
const currentRangeLabel = computed(() => {
  if (!filters.desde && !filters.hasta) return 'Todo el período disponible'
  if (!filters.desde) return `Hasta ${formatLocalizedDate(`${filters.hasta}T00:00:00`)}`
  if (!filters.hasta) return `Desde ${formatLocalizedDate(`${filters.desde}T00:00:00`)}`
  return `${formatLocalizedDate(`${filters.desde}T00:00:00`)} – ${formatLocalizedDate(`${filters.hasta}T00:00:00`)}`
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

const toDateInputValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const updatePeriod = () => {
  const today = new Date()
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const start = new Date(end)

  switch (selectedPeriod.value) {
    case 'hoy':
      break
    case 'ultimos7':
      start.setDate(start.getDate() - 6)
      break
    case 'ultimos30':
      start.setDate(start.getDate() - 29)
      break
    case 'esteMes':
      start.setDate(1)
      break
    case 'mesAnterior':
      start.setMonth(start.getMonth() - 1, 1)
      end.setDate(0)
      break
    case 'personalizado':
      return
  }

  filters.desde = toDateInputValue(start)
  filters.hasta = toDateInputValue(end)
}

const loadPanel = async <T,>(
  request: () => Promise<T>,
  panel: keyof typeof panelErrors,
  onSuccess: (value: T) => void,
  onFailure: () => void,
): Promise<void> => {
  try {
    const value = await request()
    panelErrors[panel] = ''
    onSuccess(value)
  } catch (error) {
    panelErrors[panel] = getApiErrorMessage(error)
    onFailure()
  }
}

const loadAnalytics = async () => {
  isLoading.value = true
  const baseFilters = {
    desde: filters.desde || undefined,
    hasta: filters.hasta || undefined,
  }

  try {
    await Promise.allSettled([
      loadPanel(
        () => analyticsApi.fetchSalesByPeriod({ ...baseFilters, granularidad: filters.granularidad }),
        'salesByPeriod',
        (value) => { salesByPeriod.value = value },
        () => { salesByPeriod.value = [] },
      ),
      loadPanel(
        () => analyticsApi.fetchSalesByCampaign(baseFilters),
        'salesByCampaign',
        (value) => { salesByCampaign.value = value },
        () => { salesByCampaign.value = [] },
      ),
      loadPanel(
        () => analyticsApi.fetchDistributorRanking({ ...baseFilters, limit: 10 }),
        'distributorRanking',
        (value) => { distributorRanking.value = value },
        () => { distributorRanking.value = [] },
      ),
      loadPanel(
        () => analyticsApi.fetchLeaderNetworkHealth(baseFilters),
        'leaderHealth',
        (value) => { leaderHealth.value = value },
        () => { leaderHealth.value = [] },
      ),
      loadPanel(
        () => analyticsApi.fetchSummary(baseFilters),
        'summary',
        (value) => { summary.value = value },
        () => { summary.value = null },
      ),
    ])
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
          <p class="filters-subtitle">Período elegido: {{ currentRangeLabel }}</p>

          <div class="filter-section">
            <label class="filter-label" for="metrics-period">
              Período
              <select id="metrics-period" v-model="selectedPeriod" class="form-control" @change="updatePeriod">
                <option value="hoy">Hoy</option>
                <option value="ultimos7">Últimos 7 días</option>
                <option value="ultimos30">Últimos 30 días</option>
                <option value="esteMes">Este mes</option>
                <option value="mesAnterior">Mes anterior</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </label>
          </div>

          <div v-if="selectedPeriod === 'personalizado'" class="custom-range">
            <div class="filter-section">
              <DatePicker
                id="metrics-date-from"
                v-model="filters.desde"
                label="Desde"
                :range-start="filters.desde"
                :range-end="filters.hasta"
              />
            </div>

            <div class="filter-section">
              <DatePicker
                id="metrics-date-to"
                v-model="filters.hasta"
                label="Hasta"
                :min="filters.desde"
                :invalid="rangeIsInvalid"
                error-message="La fecha Hasta no puede ser anterior a Desde."
                :range-start="filters.desde"
                :range-end="filters.hasta"
              />
            </div>
          </div>

          <div class="filter-section">
            <label class="filter-label" for="metrics-granularity">
              Granularidad
              <select id="metrics-granularity" v-model="filters.granularidad" class="form-control">
                <option value="day">Día</option>
                <option value="week">Semana</option>
              </select>
            </label>
          </div>

          <div class="filter-actions">
            <button class="btn-primary btn-block" type="button" :disabled="isLoading || rangeIsInvalid" @click="loadAnalytics">Aplicar análisis</button>
          </div>

          <div class="summary-panel">
            <h4 class="summary-title">Lectura rápida</h4>
            <div v-if="panelErrors.summary" class="panel-error" role="alert">{{ panelErrors.summary }}</div>
            <div v-else-if="!summary && isLoading" class="panel-message">Cargando resumen…</div>
            <div v-else-if="!summary" class="panel-empty panel-empty--compact">
              <span class="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5m0 14h16"/><path d="m7 15 4-4 3 3 5-6"/></svg>
              </span>
              <strong>Resumen no disponible</strong>
              <span>Intenta actualizar el análisis para consultar estos indicadores.</span>
            </div>
            <div v-for="item in periodHighlights" v-else :key="item.label" class="summary-row">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </div>
          </div>
        </aside>

        <div class="analytics-content">
          <section v-if="panelErrors.summary" class="metrics-panel panel-error-state" role="alert">
            <div class="panel-empty">
              <span class="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
              </span>
              <strong>No se pudo cargar el resumen</strong>
              <span>{{ panelErrors.summary }}</span>
            </div>
          </section>
          <section v-else-if="summaryCards.length" class="metrics-kpis">
            <article v-for="card in summaryCards" :key="card.title" class="metric-card" :class="`metric-card--${card.tone}`">
              <span class="metric-label">{{ card.title }}</span>
              <strong>{{ card.value }}</strong>
              <span class="metric-detail">{{ card.detail }}</span>
            </article>
          </section>
          <section v-else-if="!isLoading" class="metrics-panel">
            <div class="panel-empty">
              <span class="empty-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5m0 14h16"/><path d="m7 15 4-4 3 3 5-6"/></svg>
              </span>
              <strong>Resumen sin datos</strong>
              <span>Cuando haya actividad en el período, aquí verás los indicadores principales.</span>
            </div>
          </section>

          <section class="metrics-grid metrics-grid--charts">
            <article class="metrics-panel">
              <div class="panel-header">
                <div>
                  <h3>Ventas por período</h3>
                  <p class="panel-subtitle">Comparación por {{ filters.granularidad === 'day' ? 'día' : 'semana' }} con monto y cantidad.</p>
                </div>
              </div>
              <div v-if="panelErrors.salesByPeriod" class="panel-empty" role="alert">
                <span class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
                </span>
                <strong>No se pudieron cargar las ventas por período</strong>
                <span>{{ panelErrors.salesByPeriod }}</span>
              </div>
              <div v-else-if="salesByPeriod.length === 0 && isLoading" class="panel-message">Cargando ventas por período…</div>
              <div v-else-if="salesByPeriod.length === 0" class="panel-empty">
                <span class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5m0 14h16"/><path d="M8 15v-3m4 3V8m4 7v-5"/></svg>
                </span>
                <strong>Sin ventas en este período</strong>
                <span>Prueba otro rango de fechas para consultar ventas aprobadas.</span>
              </div>
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
              <div v-if="panelErrors.salesByCampaign" class="panel-empty" role="alert">
                <span class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
                </span>
                <strong>No se pudieron cargar las ventas por campaña</strong>
                <span>{{ panelErrors.salesByCampaign }}</span>
              </div>
              <div v-else-if="salesByCampaign.length === 0 && isLoading" class="panel-message">Cargando ventas por campaña…</div>
              <div v-else-if="salesByCampaign.length === 0" class="panel-empty">
                <span class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 19V5m0 14h16"/><path d="M7 9h10M7 13h7"/></svg>
                </span>
                <strong>Sin campañas con ventas</strong>
                <span>Las campañas con ventas aprobadas aparecerán aquí.</span>
              </div>
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
              <div v-if="panelErrors.distributorRanking" class="panel-empty" role="alert">
                <span class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
                </span>
                <strong>No se pudo cargar el ranking</strong>
                <span>{{ panelErrors.distributorRanking }}</span>
              </div>
              <div v-else-if="distributorRanking.length === 0 && isLoading" class="panel-message">Cargando distribuidores…</div>
              <div v-else-if="distributorRanking.length === 0" class="panel-empty">
                <span class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3"/><path d="M3 20v-1a6 6 0 0 1 12 0v1m2-8a3 3 0 1 0 0-6m1 8a5 5 0 0 1 3 4v1"/></svg>
                </span>
                <strong>Aún no hay ranking</strong>
                <span>El ranking aparecerá cuando haya ventas aprobadas de distribuidores.</span>
              </div>
              <div v-else class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Distribuidor</th><th>Rango</th><th>Ventas</th><th>Monto</th><th>Confianza</th></tr></thead>
                  <tbody>
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
              <div v-if="panelErrors.leaderHealth" class="panel-empty" role="alert">
                <span class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 9v4m0 4h.01"/><path d="M10.3 3.9 2.7 17.2A2 2 0 0 0 4.4 20h15.2a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>
                </span>
                <strong>No se pudo cargar la salud de red</strong>
                <span>{{ panelErrors.leaderHealth }}</span>
              </div>
              <div v-else-if="leaderHealth.length === 0 && isLoading" class="panel-message">Cargando salud de red…</div>
              <div v-else-if="leaderHealth.length === 0" class="panel-empty">
                <span class="empty-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>
                </span>
                <strong>Sin evaluaciones de red</strong>
                <span>Cuando se evalúe a los líderes, sus indicadores estarán disponibles aquí.</span>
              </div>
              <div v-else class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Líder</th><th>Rango</th><th>Equipo</th><th>Salud</th><th>Última evaluación</th></tr></thead>
                  <tbody>
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
  gap: 16px;
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
  gap: 16px;
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
  padding: 24px;
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
  margin: 8px 0 0;
  color: #6b7280;
  font-size: 13px;
}

.filter-section + .filter-section,
.summary-panel {
  margin-top: 16px;
}

.custom-range {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-range .filter-section + .filter-section {
  margin-top: 0;
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
  margin-top: 16px;
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

.range-error,
.panel-error {
  margin: 8px 0 0;
  color: #b91c1c;
  font-size: 13px;
  line-height: 1.5;
}

.panel-error-state {
  border-color: #fecaca;
  background: #fffafa;
}

.panel-message {
  padding: 16px 8px;
  color: #64748b;
  font-size: 14px;
  text-align: center;
}

.panel-empty {
  display: flex;
  align-items: center;
  flex-direction: column;
  gap: 8px;
  padding: 24px 16px;
  color: #64748b;
  line-height: 1.5;
  text-align: center;
}

.panel-empty strong {
  color: #334155;
  font-size: 15px;
}

.panel-empty > span:last-child {
  max-width: 34rem;
  font-size: 13px;
}

.empty-icon {
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
}

.empty-icon svg {
  width: 21px;
  height: 21px;
}

.panel-empty--compact {
  padding: 16px 4px 4px;
}

.panel-empty--compact .empty-icon {
  width: 32px;
  height: 32px;
}

.panel-empty--compact strong {
  font-size: 13px;
}

.panel-empty--compact > span:last-child {
  font-size: 12px;
}

.summary-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 0;
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

.metrics-kpis {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.metric-card {
  padding: 24px;
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
  margin-top: 16px;
  color: #111827;
  font-size: 28px;
  line-height: 1.1;
}

.metric-detail {
  display: block;
  margin-top: 8px;
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
  gap: 16px;
}

.bar-row {
  display: grid;
  grid-template-columns: minmax(140px, 180px) minmax(120px, 1fr) minmax(100px, 130px);
  gap: 16px;
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

.metrics-page :focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.form-control[aria-invalid='true'] {
  border-color: #dc2626;
}

.btn-primary:disabled {
  cursor: not-allowed;
  opacity: 0.55;
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
    padding: 16px;
  }

  .filters-panel {
    min-width: 0;
  }

  .analytics-layout,
  .metrics-grid--charts,
  .metrics-grid--tables {
    grid-template-columns: minmax(0, 1fr);
  }

  .metrics-kpis {
    grid-template-columns: minmax(0, 1fr);
  }

  .bar-row {
    gap: 8px;
  }

  .summary-panel {
    padding: 16px;
  }
}
</style>
