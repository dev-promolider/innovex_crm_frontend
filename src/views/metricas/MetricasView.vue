<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  AlertCircle,
  Award,
  CalendarDays,
  ChartNoAxesCombined,
  ChevronDown,
  CircleDollarSign,
  Download,
  Megaphone,
  Network,
  ReceiptText,
  RotateCcw,
  TrendingUp,
  UsersRound,
} from 'lucide-vue-next'
import AppShell from '@/components/layout/AppShell.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { useAnalyticsApi } from '@/features/analytics/composables/useAnalyticsApi'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import type {
  AnalyticsSummary,
  DistributorRankingItem,
  LeaderNetworkHealth,
  SalesByCampaign,
  SalesByPeriod,
} from '@/features/analytics/composables/useAnalyticsApi'

type PanelName = 'summary' | 'salesByPeriod' | 'salesByCampaign' | 'distributorRanking' | 'leaderHealth'
type PeriodName = 'personalizado' | 'hoy' | 'ultimos7' | 'ultimos30' | 'esteMes' | 'mesAnterior'

const analyticsApi = useAnalyticsApi()
const { ensureCurrencyLoaded, formatCurrency } = useWorkspaceCurrency()
const summary = ref<AnalyticsSummary | null>(null)
const salesByCampaign = ref<SalesByCampaign[]>([])
const salesByPeriod = ref<SalesByPeriod[]>([])
const distributorRanking = ref<DistributorRankingItem[]>([])
const leaderHealth = ref<LeaderNetworkHealth[]>([])
const panelLoading = reactive<Record<PanelName, boolean>>({
  summary: false,
  salesByPeriod: false,
  salesByCampaign: false,
  distributorRanking: false,
  leaderHealth: false,
})
const panelErrors = reactive<Record<PanelName, string>>({
  summary: '',
  salesByPeriod: '',
  salesByCampaign: '',
  distributorRanking: '',
  leaderHealth: '',
})
const selectedPeriod = ref<PeriodName>('ultimos30')
const filters = reactive({ desde: '', hasta: '', granularidad: 'day' as 'day' | 'week' })
const isRefreshing = ref(false)
const mobileFiltersOpen = ref(false)
const rangeIsInvalid = computed(() =>
  Boolean(filters.desde && filters.hasta && filters.hasta < filters.desde),
)
const maxPeriodAmount = computed(() => Math.max(...salesByPeriod.value.map((item) => item.monto), 1))
const maxDistributorAmount = computed(() =>
  Math.max(...distributorRanking.value.map((item) => item.monto), 1),
)
const totalCampaignAmount = computed(() =>
  salesByCampaign.value.reduce((total, item) => total + item.monto, 0),
)
const isAnyPanelLoading = computed(() => Object.values(panelLoading).some(Boolean))

const toDateInputValue = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const parseLocalDate = (value: string): Date | null => {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null

  const year = Number(match[1])
  const month = Number(match[2]) - 1
  const day = Number(match[3])
  const date = new Date(year, month, day)
  return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
    ? date
    : null
}

const formatRangeDate = (value: string, includeYear = true) => {
  const date = parseLocalDate(value)
  if (!date) return ''

  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    ...(includeYear ? { year: 'numeric' as const } : {}),
  }).format(date).replace('.', '')
}

const currentRangeLabel = computed(() => {
  const { desde, hasta } = filters
  if (desde && hasta) {
    const sameYear = desde.slice(0, 4) === hasta.slice(0, 4)
    return `${formatRangeDate(desde, !sameYear)} al ${formatRangeDate(hasta)}`
  }
  if (desde) return `Desde ${formatRangeDate(desde)}`
  if (hasta) return `Hasta ${formatRangeDate(hasta)}`
  return 'Selecciona un período'
})

const updatePeriod = () => {
  if (selectedPeriod.value === 'personalizado') return

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
  }

  filters.desde = toDateInputValue(start)
  filters.hasta = toDateInputValue(end)
}

updatePeriod()

const loadPanel = async <T,>(
  panel: PanelName,
  request: () => Promise<T>,
  onSuccess: (value: T) => void,
  onFailure: () => void,
) => {
  panelLoading[panel] = true
  try {
    const value = await request()
    panelErrors[panel] = ''
    onSuccess(value)
  } catch (error) {
    panelErrors[panel] = getApiErrorMessage(error)
    onFailure()
  } finally {
    panelLoading[panel] = false
  }
}

const baseFilters = () => ({
  desde: filters.desde || undefined,
  hasta: filters.hasta || undefined,
})

const loadSummary = () => loadPanel(
  'summary',
  () => analyticsApi.fetchSummary(baseFilters()),
  (value) => { summary.value = value },
  () => { summary.value = null },
)

const loadSalesByPeriod = () => loadPanel(
  'salesByPeriod',
  () => analyticsApi.fetchSalesByPeriod({ ...baseFilters(), granularidad: filters.granularidad }),
  (value) => { salesByPeriod.value = value },
  () => { salesByPeriod.value = [] },
)

const loadSalesByCampaign = () => loadPanel(
  'salesByCampaign',
  () => analyticsApi.fetchSalesByCampaign(baseFilters()),
  (value) => { salesByCampaign.value = value },
  () => { salesByCampaign.value = [] },
)

const loadDistributorRanking = () => loadPanel(
  'distributorRanking',
  () => analyticsApi.fetchDistributorRanking({ ...baseFilters(), limit: 10 }),
  (value) => { distributorRanking.value = value },
  () => { distributorRanking.value = [] },
)

const loadLeaderHealth = () => loadPanel(
  'leaderHealth',
  () => analyticsApi.fetchLeaderNetworkHealth(baseFilters()),
  (value) => { leaderHealth.value = value },
  () => { leaderHealth.value = [] },
)

const loadAnalytics = async () => {
  if (rangeIsInvalid.value || isRefreshing.value) return

  isRefreshing.value = true
  try {
    await Promise.all([
      loadSummary(),
      loadSalesByPeriod(),
      loadSalesByCampaign(),
      loadDistributorRanking(),
      loadLeaderHealth(),
    ])
  } finally {
    isRefreshing.value = false
  }
}

const retryPanel = (panel: PanelName) => {
  if (panel === 'summary') return loadSummary()
  if (panel === 'salesByPeriod') return loadSalesByPeriod()
  if (panel === 'salesByCampaign') return loadSalesByCampaign()
  if (panel === 'distributorRanking') return loadDistributorRanking()
  return loadLeaderHealth()
}

const summaryCards = computed(() => {
  if (!summary.value) return []

  const approvedCount = summary.value.ventas.aprobadas_cantidad
  return [
    {
      title: 'Ventas',
      value: approvedCount.toLocaleString('es-ES'),
      detail: 'operaciones aprobadas',
      icon: TrendingUp,
      tone: 'blue',
    },
    {
      title: 'Monto aprobado',
      value: formatCurrency(summary.value.ventas.aprobadas_monto),
      detail: 'ventas aprobadas en el período',
      icon: CircleDollarSign,
      tone: 'green',
    },
    {
      title: 'Distribuidores activos',
      value: summary.value.distribuidores.activos.toLocaleString('es-ES'),
      detail: 'con actividad comercial',
      icon: UsersRound,
      tone: 'violet',
    },
    {
      title: 'Ticket promedio',
      value: approvedCount > 0
        ? formatCurrency(summary.value.ventas.aprobadas_monto / approvedCount)
        : '—',
      detail: 'monto aprobado por venta',
      icon: ReceiptText,
      tone: 'amber',
    },
  ]
})

const campaignShare = (amount: number) =>
  totalCampaignAmount.value > 0 ? (amount / totalCampaignAmount.value) * 100 : 0

const distributorInitials = (name: string, id: number) => {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('')
  return initials ? initials.toLocaleUpperCase('es-ES') : String(id).slice(-2)
}

const leaderStatus = (score: number | null) => {
  if (score == null) return { label: 'Sin evaluar', tone: 'neutral' }
  if (score >= 0.8) return { label: 'Saludable', tone: 'success' }
  if (score >= 0.6) return { label: 'Atención', tone: 'warning' }
  return { label: 'Crítica', tone: 'danger' }
}

const formatPercent = (value: number | null | undefined) =>
  value == null ? '—' : `${Math.round(value * 100)}%`

const csvCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`

const exportAnalytics = () => {
  const rows: (string | number)[][] = [
    ['Sección', 'Indicador', 'Valor', 'Detalle'],
    ...(summary.value ? [
      ['Resumen', 'Ventas aprobadas', summary.value.ventas.aprobadas_cantidad, 'operaciones'],
      ['Resumen', 'Monto aprobado', summary.value.ventas.aprobadas_monto, ''],
      ['Resumen', 'Distribuidores activos', summary.value.distribuidores.activos, ''],
    ] : []),
    ...salesByPeriod.value.map((item) => ['Ventas por período', item.periodo, item.monto, `${item.ventas} ventas`]),
    ...salesByCampaign.value.map((item) => ['Ventas por campaña', item.campana_nombre, item.monto, `${item.ventas} ventas`]),
    ...distributorRanking.value.map((item) => ['Distribuidores', item.nombre || `Membresía ${item.membresia_id}`, item.monto, `${item.ventas} ventas`]),
    ...leaderHealth.value.map((item) => ['Salud de red', item.nombre || `Membresía ${item.membresia_id}`, item.valor_salud_red ?? '', `${item.tamano_equipo_directo} personas en equipo`]),
  ]
  const content = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `metricas-${filters.desde}-a-${filters.hasta}.csv`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
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
        <div class="page-heading">
          <h1 class="page-title">Métricas</h1>
          <p class="period-caption">
            <CalendarDays :size="17" aria-hidden="true" />
            <span>Período: {{ currentRangeLabel }}</span>
          </p>
        </div>
        <div class="header-actions">
          <button
            class="button button--secondary"
            type="button"
            :disabled="isRefreshing || rangeIsInvalid"
            @click="loadAnalytics"
          >
            <RotateCcw :size="16" aria-hidden="true" />
            Actualizar
          </button>
          <button class="button button--primary" type="button" @click="exportAnalytics">
            <Download :size="16" aria-hidden="true" />
            Exportar
          </button>
        </div>
      </header>

      <div class="analytics-layout">
        <aside class="filters-panel">
          <button
            class="control-toggle"
            type="button"
            :aria-expanded="mobileFiltersOpen"
            @click="mobileFiltersOpen = !mobileFiltersOpen"
          >
            <span>Control del tablero</span>
            <ChevronDown :size="18" :class="{ 'is-rotated': mobileFiltersOpen }" aria-hidden="true" />
          </button>
          <div class="filters-content" :class="{ 'filters-content--open': mobileFiltersOpen }">
            <div class="control-heading">
              <h2>Control del tablero</h2>
              <p>Define el período y el nivel de detalle.</p>
            </div>
            <div class="filter-field">
              <label for="metrics-period">Período</label>
              <select id="metrics-period" v-model="selectedPeriod" @change="updatePeriod">
                <option value="hoy">Hoy</option>
                <option value="ultimos7">Últimos 7 días</option>
                <option value="ultimos30">Últimos 30 días</option>
                <option value="esteMes">Este mes</option>
                <option value="mesAnterior">Mes anterior</option>
                <option value="personalizado">Personalizado</option>
              </select>
            </div>
            <div v-if="selectedPeriod === 'personalizado'" class="custom-range">
              <DatePicker
                id="metrics-date-from"
                v-model="filters.desde"
                label="Desde"
                :range-start="filters.desde"
                :range-end="filters.hasta"
              />
              <DatePicker
                id="metrics-date-to"
                v-model="filters.hasta"
                label="Hasta"
                :invalid="rangeIsInvalid"
                :error-message="rangeIsInvalid ? 'La fecha Hasta no puede ser anterior a Desde.' : ''"
                :range-start="filters.desde"
                :range-end="filters.hasta"
              />
            </div>
            <div class="filter-field">
              <label for="metrics-granularity">Granularidad</label>
              <select id="metrics-granularity" v-model="filters.granularidad">
                <option value="day">Día</option>
                <option value="week">Semana</option>
              </select>
            </div>
            <button
              class="button button--primary apply-button"
              type="button"
              :disabled="isRefreshing || rangeIsInvalid"
              @click="loadAnalytics"
            >
              Aplicar análisis
            </button>
          </div>
        </aside>

        <main class="analytics-content">
          <section class="metrics-kpis" aria-label="Indicadores principales">
            <template v-if="panelLoading.summary && !summary">
              <div v-for="item in 4" :key="item" class="metric-card metric-card--skeleton" aria-hidden="true">
                <span class="skeleton-icon" />
                <span class="skeleton-line skeleton-line--short" />
                <span class="skeleton-line skeleton-line--value" />
                <span class="skeleton-line skeleton-line--detail" />
              </div>
            </template>
            <div v-else-if="panelErrors.summary" class="state-card state-card--wide" role="alert">
              <AlertCircle :size="22" aria-hidden="true" />
              <div>
                <strong>{{ panelErrors.summary }}</strong>
                <span>No se pudo cargar el resumen del período.</span>
              </div>
              <button class="retry-button" type="button" :disabled="panelLoading.summary" @click="retryPanel('summary')">
                <RotateCcw :size="15" aria-hidden="true" />
                Reintentar
              </button>
            </div>
            <div v-else-if="!summary" class="state-card state-card--wide">
              <ChartNoAxesCombined :size="22" aria-hidden="true" />
              <div>
                <strong>Aún no hay ventas en este período</strong>
                <span>Cuando haya actividad, aquí verás los indicadores principales.</span>
              </div>
            </div>
            <article
              v-for="card in summaryCards"
              v-else
              :key="card.title"
              class="metric-card"
            >
              <div class="metric-card__top">
                <span class="metric-icon" :class="`metric-icon--${card.tone}`">
                  <component :is="card.icon" :size="20" aria-hidden="true" />
                </span>
                <span class="metric-label">{{ card.title }}</span>
              </div>
              <strong class="metric-value">{{ card.value }}</strong>
              <span class="metric-detail">{{ card.detail }}</span>
            </article>
          </section>

          <section class="metrics-grid" aria-label="Paneles de métricas">
            <article class="metrics-panel">
              <header class="panel-header">
                <span class="panel-icon panel-icon--blue"><ChartNoAxesCombined :size="19" aria-hidden="true" /></span>
                <div>
                  <h2>Ventas por período</h2>
                  <p>Ventas aprobadas por {{ filters.granularidad === 'day' ? 'día' : 'semana' }}.</p>
                </div>
              </header>
              <div v-if="panelLoading.salesByPeriod" class="panel-skeleton" aria-label="Cargando ventas por período">
                <span v-for="item in 5" :key="item" class="skeleton-chart-bar" />
              </div>
              <div v-else-if="panelErrors.salesByPeriod" class="panel-state panel-state--error" role="alert">
                <AlertCircle :size="22" aria-hidden="true" />
                <strong>{{ panelErrors.salesByPeriod }}</strong>
                <button class="retry-button" type="button" :disabled="panelLoading.salesByPeriod" @click="retryPanel('salesByPeriod')">
                  <RotateCcw :size="15" aria-hidden="true" /> Reintentar
                </button>
              </div>
              <div v-else-if="!salesByPeriod.length" class="panel-state">
                <ChartNoAxesCombined :size="25" aria-hidden="true" />
                <strong>Aún no hay ventas en este período</strong>
                <span>Prueba otro rango de fechas.</span>
              </div>
              <div v-else class="period-chart" role="list" aria-label="Monto de ventas por período">
                <div v-for="item in salesByPeriod" :key="item.periodo" class="period-chart__column" role="listitem">
                  <span class="period-chart__amount">{{ formatCurrency(item.monto) }}</span>
                  <div class="period-chart__track">
                    <div
                      class="period-chart__bar"
                      :style="{ height: `${Math.max(5, (item.monto / maxPeriodAmount) * 100)}%` }"
                      :title="`${item.periodo}: ${formatCurrency(item.monto)}`"
                    />
                  </div>
                  <span class="period-chart__label">{{ item.periodo }}</span>
                  <small>{{ item.ventas }} ventas</small>
                </div>
              </div>
            </article>

            <article class="metrics-panel">
              <header class="panel-header">
                <span class="panel-icon panel-icon--violet"><Megaphone :size="19" aria-hidden="true" /></span>
                <div>
                  <h2>Ventas por campaña</h2>
                  <p>Distribución del monto aprobado por campaña.</p>
                </div>
              </header>
              <div v-if="panelLoading.salesByCampaign" class="panel-skeleton panel-skeleton--rows" aria-label="Cargando ventas por campaña">
                <span v-for="item in 4" :key="item" class="skeleton-list-row" />
              </div>
              <div v-else-if="panelErrors.salesByCampaign" class="panel-state panel-state--error" role="alert">
                <AlertCircle :size="22" aria-hidden="true" />
                <strong>{{ panelErrors.salesByCampaign }}</strong>
                <button class="retry-button" type="button" :disabled="panelLoading.salesByCampaign" @click="retryPanel('salesByCampaign')">
                  <RotateCcw :size="15" aria-hidden="true" /> Reintentar
                </button>
              </div>
              <div v-else-if="!salesByCampaign.length" class="panel-state">
                <Megaphone :size="25" aria-hidden="true" />
                <strong>Aún no hay ventas en este período</strong>
                <span>Las campañas aparecerán cuando registren ventas.</span>
              </div>
              <div v-else class="campaign-list">
                <div v-for="item in salesByCampaign" :key="item.campana_id ?? item.campana_nombre" class="campaign-item">
                  <div class="list-item-heading">
                    <strong>{{ item.campana_nombre }}</strong>
                    <span>{{ Math.round(campaignShare(item.monto)) }}%</span>
                  </div>
                  <div
                    class="progress-track"
                    role="progressbar"
                    :aria-label="`Participación de ${item.campana_nombre}`"
                    :aria-valuenow="Math.round(campaignShare(item.monto))"
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    <div class="progress-fill progress-fill--violet" :style="{ width: `${campaignShare(item.monto)}%` }" />
                  </div>
                  <div class="list-item-foot">
                    <span>{{ item.ventas }} ventas · ticket {{ formatCurrency(item.ticket_promedio) }}</span>
                    <strong>{{ formatCurrency(item.monto) }}</strong>
                  </div>
                </div>
              </div>
            </article>

            <article class="metrics-panel">
              <header class="panel-header">
                <span class="panel-icon panel-icon--green"><Award :size="19" aria-hidden="true" /></span>
                <div>
                  <h2>Top distribuidores</h2>
                  <p>Ranking por monto aprobado.</p>
                </div>
              </header>
              <div v-if="panelLoading.distributorRanking" class="panel-skeleton panel-skeleton--rows" aria-label="Cargando distribuidores">
                <span v-for="item in 5" :key="item" class="skeleton-list-row" />
              </div>
              <div v-else-if="panelErrors.distributorRanking" class="panel-state panel-state--error" role="alert">
                <AlertCircle :size="22" aria-hidden="true" />
                <strong>{{ panelErrors.distributorRanking }}</strong>
                <button class="retry-button" type="button" :disabled="panelLoading.distributorRanking" @click="retryPanel('distributorRanking')">
                  <RotateCcw :size="15" aria-hidden="true" /> Reintentar
                </button>
              </div>
              <div v-else-if="!distributorRanking.length" class="panel-state">
                <UsersRound :size="25" aria-hidden="true" />
                <strong>Aún no hay ventas en este período</strong>
                <span>El ranking aparecerá con las primeras ventas aprobadas.</span>
              </div>
              <ol v-else class="distributor-list">
                <li v-for="(item, index) in distributorRanking" :key="item.membresia_id" class="distributor-item">
                  <span class="distributor-rank">{{ index + 1 }}</span>
                  <span class="distributor-avatar" aria-hidden="true">{{ distributorInitials(item.nombre, item.membresia_id) }}</span>
                  <div class="distributor-detail">
                    <div class="list-item-heading">
                      <strong>{{ item.nombre || `Membresía ${item.membresia_id}` }}</strong>
                      <strong>{{ formatCurrency(item.monto) }}</strong>
                    </div>
                    <div
                      class="progress-track"
                      role="progressbar"
                      :aria-label="`Monto de ${item.nombre || `Membresía ${item.membresia_id}`}`"
                      :aria-valuenow="Math.round((item.monto / maxDistributorAmount) * 100)"
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      <div class="progress-fill progress-fill--green" :style="{ width: `${Math.max(3, (item.monto / maxDistributorAmount) * 100)}%` }" />
                    </div>
                    <span class="distributor-sales">{{ item.ventas }} ventas aprobadas</span>
                  </div>
                </li>
              </ol>
            </article>

            <article class="metrics-panel">
              <header class="panel-header">
                <span class="panel-icon panel-icon--amber"><Network :size="19" aria-hidden="true" /></span>
                <div>
                  <h2>Salud de red por líder</h2>
                  <p>Estado de los equipos de liderazgo.</p>
                </div>
              </header>
              <div v-if="panelLoading.leaderHealth" class="panel-skeleton panel-skeleton--rows" aria-label="Cargando salud de red">
                <span v-for="item in 4" :key="item" class="skeleton-list-row" />
              </div>
              <div v-else-if="panelErrors.leaderHealth" class="panel-state panel-state--error" role="alert">
                <AlertCircle :size="22" aria-hidden="true" />
                <strong>{{ panelErrors.leaderHealth }}</strong>
                <button class="retry-button" type="button" :disabled="panelLoading.leaderHealth" @click="retryPanel('leaderHealth')">
                  <RotateCcw :size="15" aria-hidden="true" /> Reintentar
                </button>
              </div>
              <div v-else-if="!leaderHealth.length" class="panel-state">
                <Network :size="25" aria-hidden="true" />
                <strong>Aún no hay ventas en este período</strong>
                <span>Las evaluaciones de red aparecerán cuando estén disponibles.</span>
              </div>
              <div v-else class="table-wrap">
                <table class="health-table">
                  <thead>
                    <tr><th>Líder</th><th>Equipo</th><th>Salud</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in leaderHealth" :key="item.membresia_id">
                      <td>
                        <strong>{{ item.nombre || `Membresía ${item.membresia_id}` }}</strong>
                        <span>{{ item.rango || 'Sin rango' }}</span>
                      </td>
                      <td>{{ item.tamano_equipo_directo }}</td>
                      <td>{{ formatPercent(item.valor_salud_red) }}</td>
                      <td>
                        <span class="status-badge" :class="`status-badge--${leaderStatus(item.valor_salud_red).tone}`">
                          {{ leaderStatus(item.valor_salud_red).label }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </article>
          </section>
          <p class="sr-only" aria-live="polite">
            {{ isAnyPanelLoading ? 'Actualizando paneles de métricas' : 'Paneles de métricas actualizados' }}
          </p>
        </main>
      </div>
    </div>
  </AppShell>
</template>

<style scoped>
.metrics-page {
  display: flex;
  flex-direction: column;
  gap: 24px;
  color: #172033;
}

.page-header,
.header-actions,
.page-heading,
.period-caption,
.analytics-layout,
.metrics-kpis,
.metrics-grid,
.filters-panel,
.filters-content,
.metrics-panel,
.panel-header,
.metric-card,
.metric-card__top {
  display: flex;
}

.page-header {
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.page-heading,
.filters-content,
.metrics-panel {
  flex-direction: column;
}

.page-heading {
  gap: 8px;
}

.page-title {
  margin: 0;
  color: #111827;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.period-caption {
  align-items: center;
  gap: 8px;
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.header-actions {
  flex-wrap: wrap;
  gap: 8px;
}

.button {
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 12px;
  padding: 0 16px;
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 150ms ease, border-color 150ms ease;
}

.button--primary {
  border-color: #1d4ed8;
  background: #1d4ed8;
  color: #fff;
}

.button--primary:hover:not(:disabled) {
  border-color: #1e40af;
  background: #1e40af;
}

.button--secondary {
  border-color: #dbe2ea;
  background: #fff;
  color: #334155;
}

.button--secondary:hover:not(:disabled) {
  background: #f8fafc;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.analytics-layout {
  align-items: flex-start;
  gap: 24px;
}

.filters-panel,
.metric-card,
.metrics-panel {
  border: 1px solid #e5eaf1;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 8px 24px -20px rgba(15, 23, 42, 0.32);
}

.filters-panel {
  position: sticky;
  top: 20px;
  width: 260px;
  flex: 0 0 260px;
  padding: 20px;
}

.filters-content {
  width: 100%;
  gap: 20px;
}

.control-heading h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
}

.control-heading p,
.panel-header p {
  margin: 8px 0 0;
  color: #718096;
  font-size: 13px;
  line-height: 1.5;
}

.control-toggle {
  display: none;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-field label,
.date-picker :deep(.date-picker-label) {
  color: #475569;
  font-size: 13px;
  font-weight: 700;
}

.filter-field select {
  min-height: 42px;
  width: 100%;
  border: 1px solid #d9e0e8;
  border-radius: 10px;
  padding: 0 12px;
  background: #fff;
  color: #172033;
  font: inherit;
  font-size: 14px;
}

.custom-range {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.custom-range :deep(.date-picker) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.custom-range :deep(.date-picker-control) {
  min-height: 42px;
  border-color: #d9e0e8;
  border-radius: 10px;
}

.apply-button {
  width: 100%;
}

.analytics-content {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.metrics-kpis,
.metrics-grid {
  display: grid;
  gap: 16px;
}

.metrics-kpis {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.metric-card {
  min-width: 0;
  min-height: 150px;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 20px;
}

.metric-card__top {
  align-items: center;
  gap: 12px;
}

.metric-icon,
.panel-icon,
.distributor-avatar {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.metric-icon {
  width: 40px;
  height: 40px;
}

.metric-icon--blue,
.panel-icon--blue { background: #eff6ff; color: #2563eb; }
.metric-icon--green,
.panel-icon--green { background: #ecfdf3; color: #079455; }
.metric-icon--violet,
.panel-icon--violet { background: #f4f0ff; color: #6941c6; }
.metric-icon--amber,
.panel-icon--amber { background: #fff7e6; color: #c77900; }

.metric-label {
  color: #68758a;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.metric-value {
  overflow-wrap: anywhere;
  color: #111827;
  font-size: clamp(22px, 2vw, 30px);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
}

.metric-detail {
  color: #8490a2;
  font-size: 12px;
}

.metrics-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.metrics-panel {
  min-width: 0;
  min-height: 310px;
  gap: 24px;
  padding: 22px;
}

.panel-header {
  align-items: flex-start;
  gap: 12px;
}

.panel-icon {
  width: 38px;
  height: 38px;
}

.panel-header h2 {
  margin: 0;
  color: #172033;
  font-size: 16px;
  font-weight: 800;
}

.panel-header p {
  margin-top: 4px;
}

.panel-state {
  display: flex;
  min-height: 180px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: #8490a2;
  text-align: center;
}

.panel-state strong {
  color: #475569;
  font-size: 14px;
}

.panel-state > span {
  font-size: 13px;
}

.panel-state--error {
  color: #b42318;
}

.panel-state--error strong {
  max-width: 32rem;
  color: #475569;
  font-weight: 600;
  line-height: 1.5;
}

.retry-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  border-radius: 8px;
  padding: 8px 12px;
  background: #eff6ff;
  color: #1d4ed8;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.retry-button:disabled {
  cursor: wait;
  opacity: 0.6;
}

.period-chart {
  display: flex;
  min-height: 210px;
  align-items: stretch;
  gap: 12px;
  overflow-x: auto;
  padding: 8px 0 0;
}

.period-chart__column {
  display: flex;
  min-width: 44px;
  flex: 1 0 44px;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  color: #778399;
  font-size: 11px;
  text-align: center;
}

.period-chart__amount {
  max-width: 100%;
  overflow: hidden;
  color: #617087;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.period-chart__track {
  display: flex;
  width: 100%;
  height: 132px;
  align-items: flex-end;
  justify-content: center;
  border-bottom: 1px solid #e8edf4;
  background: repeating-linear-gradient(to top, transparent 0, transparent 31px, #f0f3f7 32px);
}

.period-chart__bar {
  width: min(28px, 70%);
  min-height: 5px;
  border-radius: 6px 6px 0 0;
  background: linear-gradient(180deg, #6ea8fe, #2563eb);
  transition: height 200ms ease;
}

.period-chart__label {
  max-width: 64px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.period-chart__column small {
  color: #9aa4b2;
  font-size: 10px;
}

.campaign-list,
.distributor-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.campaign-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.list-item-heading,
.list-item-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.list-item-heading strong {
  min-width: 0;
  overflow: hidden;
  color: #263349;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.list-item-heading > span {
  color: #6941c6;
  font-size: 12px;
  font-weight: 800;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: #eef1f6;
}

.progress-fill {
  height: 100%;
  min-width: 2px;
  border-radius: inherit;
  transition: width 200ms ease;
}

.progress-fill--violet { background: #7f56d9; }
.progress-fill--green { background: #12b76a; }

.list-item-foot {
  color: #8792a3;
  font-size: 11px;
}

.list-item-foot strong {
  color: #475569;
  font-size: 12px;
}

.distributor-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.distributor-item {
  display: grid;
  grid-template-columns: 24px 36px minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}

.distributor-rank {
  color: #8a96a8;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.distributor-avatar {
  width: 36px;
  height: 36px;
  background: #eff6ff;
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
}

.distributor-detail {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 8px;
}

.distributor-sales {
  color: #8792a3;
  font-size: 11px;
}

.table-wrap {
  width: 100%;
  overflow-x: auto;
}

.health-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.health-table th {
  padding: 8px;
  border-bottom: 1px solid #e9edf3;
  color: #7a8799;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}

.health-table td {
  padding: 12px 8px;
  border-bottom: 1px solid #f0f2f6;
  color: #46536a;
  font-size: 12px;
  white-space: nowrap;
}

.health-table td:first-child {
  max-width: 150px;
  white-space: normal;
}

.health-table td:first-child strong,
.health-table td:first-child span {
  display: block;
}

.health-table td:first-child strong {
  color: #263349;
  font-size: 12px;
}

.health-table td:first-child span {
  margin-top: 4px;
  color: #8792a3;
  font-size: 11px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 5px 8px;
  font-size: 10px;
  font-weight: 800;
}

.status-badge--success { background: #ecfdf3; color: #027a48; }
.status-badge--warning { background: #fffaeb; color: #b54708; }
.status-badge--danger { background: #fef3f2; color: #b42318; }
.status-badge--neutral { background: #f2f4f7; color: #667085; }

.metric-card--skeleton {
  gap: 16px;
}

.skeleton-icon,
.skeleton-line,
.skeleton-chart-bar,
.skeleton-list-row {
  display: block;
  border-radius: 8px;
  background: linear-gradient(90deg, #edf0f4 25%, #f7f8fa 50%, #edf0f4 75%);
  background-size: 200% 100%;
  animation: skeleton-pulse 1.4s ease-in-out infinite;
}

.skeleton-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.skeleton-line {
  height: 12px;
}

.skeleton-line--short { width: 45%; }
.skeleton-line--value { width: 78%; height: 28px; }
.skeleton-line--detail { width: 65%; height: 10px; }

.panel-skeleton {
  display: flex;
  min-height: 190px;
  align-items: flex-end;
  justify-content: space-around;
  gap: 12px;
  padding: 12px;
}

.skeleton-chart-bar {
  width: 12%;
  height: 55%;
  border-radius: 6px 6px 0 0;
}

.skeleton-chart-bar:nth-child(2n) { height: 78%; }
.skeleton-chart-bar:nth-child(3n) { height: 40%; }

.panel-skeleton--rows {
  min-height: 180px;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
}

.skeleton-list-row {
  height: 34px;
  width: 100%;
}

.state-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border: 1px solid #e5eaf1;
  border-radius: 14px;
  padding: 18px;
  color: #6b7280;
}

.state-card--wide {
  grid-column: 1 / -1;
}

.state-card > div {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
}

.state-card strong {
  color: #344054;
  font-size: 14px;
}

.state-card span {
  font-size: 12px;
}

.metrics-page :focus-visible {
  outline: 3px solid #2563eb;
  outline-offset: 3px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@keyframes skeleton-pulse {
  0% { background-position: 100% 0; }
  100% { background-position: -100% 0; }
}

@media (max-width: 1200px) {
  .metrics-kpis {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 960px) {
  .analytics-layout {
    flex-direction: column;
  }

  .filters-panel {
    position: static;
    width: 100%;
    flex-basis: auto;
  }

  .filters-content {
    display: none;
    padding-top: 20px;
  }

  .filters-content--open {
    display: flex;
  }

  .control-toggle {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-between;
    border: 0;
    padding: 0;
    background: transparent;
    color: #172033;
    font: inherit;
    font-size: 16px;
    font-weight: 800;
    text-align: left;
    cursor: pointer;
  }

  .control-toggle svg {
    transition: transform 150ms ease;
  }

  .control-toggle svg.is-rotated {
    transform: rotate(180deg);
  }
}

@media (max-width: 760px) {
  .metrics-page,
  .analytics-content {
    gap: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }

  .header-actions {
    width: 100%;
  }

  .header-actions .button {
    flex: 1;
  }

  .page-title {
    font-size: 26px;
  }

  .metrics-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }

  .metrics-kpis {
    gap: 12px;
  }

  .metric-card {
    min-height: 138px;
    padding: 16px;
  }

  .metrics-panel {
    min-height: 0;
    gap: 20px;
    padding: 18px 16px;
  }

  .health-table th,
  .health-table td {
    padding-right: 6px;
    padding-left: 6px;
  }

  .retry-button {
    flex-shrink: 0;
  }
}

@media (max-width: 420px) {
  .metrics-kpis {
    grid-template-columns: minmax(0, 1fr);
  }

  .state-card--wide {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .state-card--wide .retry-button {
    margin-left: 34px;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
