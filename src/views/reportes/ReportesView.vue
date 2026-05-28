<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Reportes</strong></span>
    </template>

    <div class="page-body">
        <div class="page-header">
          <div><h1 class="page-title">Reportes</h1><p class="page-subtitle">Mapa operativo de exportaciones administrativas disponibles y pendientes.</p></div>
        </div>

        <div class="reports-grid">
          <!-- Columna principal -->
          <div class="left-col">
            <!-- Tipo de Reporte -->
            <div class="card">
              <h3 class="section-title">Tipo de Reporte</h3>
              <div class="report-types">
                <div v-for="tipo in tiposReporte" :key="tipo.key"
                  class="report-type-item" :class="{ active: tipoSeleccionado === tipo.key }"
                  @click="tipoSeleccionado = tipo.key">
                  <div class="report-type-icon">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" v-html="tipo.icon"></svg>
                  </div>
                  <span class="report-type-label">{{ tipo.label }}</span>
                </div>
              </div>
              <div class="report-desc" v-if="tipoActual">
                <strong>{{ tipoActual.label }}:</strong> {{ tipoActual.desc }}
              </div>
            </div>

            <!-- Formato de Exportación (Filtros) -->
            <div class="card dark-card">
              <h3 class="section-title white">Formato de Exportación</h3>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Fecha Desde</label>
                  <div class="date-field"><input type="date" v-model="fechaDesde" class="date-input" /><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#7eb8e8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                </div>
                <div class="form-group">
                  <label class="form-label">Fecha Hasta</label>
                  <div class="date-field"><input type="date" v-model="fechaHasta" class="date-input" /><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#7eb8e8" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Campaña (Opcional)</label>
                  <select class="select-dark"><option>Todas las campañas</option></select>
                </div>
                <div class="form-group">
                  <label class="form-label">Líder (Opcional)</label>
                  <select class="select-dark"><option>Todos los líderes</option></select>
                </div>
              </div>
            </div>

            <!-- Formato descarga -->
            <div class="card">
              <h3 class="section-title">Estado del módulo</h3>
              <div class="format-btns">
                <button v-for="f in formatos" :key="f" class="format-btn" :class="{ active: formatoSeleccionado === f }" @click="formatoSeleccionado = f">{{ f }}</button>
              </div>
              <div class="status-banner">
                <strong>Backend conectado</strong>
                <p>
                  Los reportes CSV usan los endpoints administrativos de analítica y respetan el rango de fechas seleccionado.
                </p>
              </div>
              <button class="btn-generar" @click="generarReporte">Generar CSV</button>
            </div>

            <div class="card">
              <h3 class="section-title">Fuentes reales ya disponibles</h3>
              <div class="source-list">
                <div v-for="source in fuentesDisponibles" :key="source.label" class="source-item">
                  <div>
                    <strong>{{ source.label }}</strong>
                    <p>{{ source.desc }}</p>
                  </div>
                  <span class="source-badge">{{ source.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado por tipo -->
          <div class="right-col">
            <div class="card">
              <h3 class="section-title">Cobertura actual</h3>
              <div class="coverage-list">
                <div v-for="coverage in coberturas" :key="coverage.label" class="coverage-item">
                  <div>
                    <strong>{{ coverage.label }}</strong>
                    <p>{{ coverage.desc }}</p>
                  </div>
                  <span class="coverage-pill" :class="`coverage-pill-${coverage.tone}`">{{ coverage.level }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useAnalyticsApi } from '@/features/analytics/composables/useAnalyticsApi'

const fechaDesde = ref('')
const fechaHasta = ref('')
const formatoSeleccionado = ref('CSV')
const formatos = ['CSV', 'XLSX (Excel)', 'PDF']
const tipoSeleccionado = ref('ventas')
const analyticsApi = useAnalyticsApi()

const tiposReporte = [
  { key:'ventas',      label:'Ventas Validadas',      desc:'Reporte completo de ventas validadas con detalles de líder, vendedor, kit y monto', icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  { key:'deudas',      label:'Estado de Deudas',      desc:'Resumen de deudas activas y vencidas por líder', icon:'<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>' },
  { key:'rendimiento', label:'Rendimiento de Líderes', desc:'Análisis de rendimiento mensual por líder', icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
  { key:'stock',       label:'Auditoría de Stock',    desc:'Control y movimientos de inventario', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
  { key:'canjes',      label:'Canjes y Recompensas',  desc:'Historial de canjes de puntos y premios entregados', icon:'<path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>' },
]
const tipoActual = computed(() => tiposReporte.find(t => t.key === tipoSeleccionado.value) ?? tiposReporte[0])

const fuentesDisponibles = [
  {
    label: 'Validación de ventas',
    desc: 'La cola administrativa y la confirmación bancaria ya entregan información operativa útil para futuras exportaciones.',
    status: 'Disponible',
  },
  {
    label: 'Deudas y ledger',
    desc: 'La cartera, el estado de cuenta y los movimientos financieros ya se consultan desde el panel admin.',
    status: 'Disponible',
  },
  {
    label: 'Inventario y contratos',
    desc: 'Las solicitudes de kits y el expediente contractual ya tienen detalle, pero falta consolidar el ledger de inventario.',
    status: 'Parcial',
  },
]

const coberturas = [
  {
    label: 'Ventas validadas',
    desc: 'La data existe en panel, pero todavía no se exporta a archivo.',
    level: 'Alta',
    tone: 'good',
  },
  {
    label: 'Estado de deudas',
    desc: 'La información base ya está conectada y lista para alimentar reportes.',
    level: 'Alta',
    tone: 'good',
  },
  {
    label: 'Rendimiento de líderes',
    desc: 'La vista ya existe, pero no hay agregación/reporting consolidado.',
    level: 'Media',
    tone: 'warn',
  },
  {
    label: 'Auditoría de stock',
    desc: 'Aún falta endpoint administrativo para listar movimientos reales.',
    level: 'Baja',
    tone: 'pending',
  },
]

const toCsv = (rows: Record<string, unknown>[]) => {
  if (rows.length === 0) {
    return 'sin_datos\n'
  }

  const firstRow = rows[0]
  if (!firstRow) {
    return 'sin_datos\n'
  }

  const headers = Object.keys(firstRow)
  const body = rows.map((row) => headers.map((header) => JSON.stringify(row[header] ?? '')).join(','))

  return [headers.join(','), ...body].join('\n')
}

const downloadCsv = (filename: string, rows: Record<string, unknown>[]) => {
  const blob = new Blob([toCsv(rows)], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

const generarReporte = async () => {
  const filters = {
    desde: fechaDesde.value || undefined,
    hasta: fechaHasta.value || undefined,
  }

  if (tipoSeleccionado.value === 'ventas') {
    const rows = await analyticsApi.fetchSalesByCampaign(filters)
    downloadCsv('ventas_por_campana.csv', rows as unknown as Record<string, unknown>[])
    return
  }

  if (tipoSeleccionado.value === 'rendimiento') {
    const rows = await analyticsApi.fetchDistributorRanking({ ...filters, limit: 50 })
    downloadCsv('rendimiento_distribuidores.csv', rows as unknown as Record<string, unknown>[])
    return
  }

  if (tipoSeleccionado.value === 'canjes') {
    const resumen = await analyticsApi.fetchSummary(filters)
    downloadCsv('marketplace_resumen.csv', [
      {
        canjes_cantidad: resumen.marketplace.canjes_cantidad,
        puntos_utilizados: resumen.marketplace.puntos_utilizados,
        desde: resumen.periodo.desde,
        hasta: resumen.periodo.hasta,
      },
    ])
    return
  }

  const resumen = await analyticsApi.fetchSummary(filters)
  downloadCsv(`${tipoSeleccionado.value}_resumen.csv`, [
    {
      deuda_activa_monto: resumen.finanzas.deuda_activa_monto,
      ventas_aprobadas_monto: resumen.ventas.aprobadas_monto,
      distribuidores_activos: resumen.distribuidores.activos,
      desde: resumen.periodo.desde,
      hasta: resumen.periodo.hasta,
    },
  ])
}
</script>

<style>
html, body, #app { margin:0!important; padding:0!important; height:100%!important; background:#f4f6f9!important; font-family:'Segoe UI',Arial,sans-serif; }
</style>
<style scoped>
.dashboard-layout { display:flex; min-height:100vh; background:#f4f6f9; }
.sidebar { width:200px; background:#0f1b2d; display:flex; flex-direction:column; padding:0; position:fixed; top:0; left:0; height:100vh; z-index:100; border-right:1px solid #1a2d45; overflow-y:auto; }
.sidebar-logo { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px 16px 16px; border-bottom:1px solid #1a2d45; gap:6px; }
.sidebar-logo-img { width:56px; height:56px; object-fit:contain; }
.sidebar-brand { font-size:13px; font-weight:800; color:#fff; letter-spacing:3px; }
.sidebar-section-label { font-size:10px; font-weight:700; color:#4a6080; letter-spacing:1.5px; text-transform:uppercase; padding:14px 18px 6px; }
.sidebar-nav { display:flex; flex-direction:column; gap:2px; padding:0 10px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; color:#6b8aaa; text-decoration:none; font-size:13px; font-weight:500; transition:background 0.2s,color 0.2s; white-space:nowrap; }
.nav-item:hover { background:#162236; color:#a0c4e8; }
.nav-item.active { background:#1a3a5c; color:#4ab8f5; font-weight:600; }
.nav-item.nav-logout { color:#ef4444; }
.nav-item.nav-logout:hover { background:#2a1010; color:#f87171; }
.sidebar-bottom { display:flex; flex-direction:column; gap:2px; padding:0 10px 16px; }
.main-content { margin-left:200px; flex:1; display:flex; flex-direction:column; }
.topbar { background:white; height:56px; display:flex; align-items:center; padding:0 24px; gap:16px; border-bottom:1px solid #eee; position:sticky; top:0; z-index:50; }
.topbar-left { min-width:160px; }
.breadcrumb { font-size:13px; color:#999; }
.breadcrumb strong { color:#333; }
.topbar-center { flex:1; display:flex; justify-content:center; }
.search-box { display:flex; align-items:center; gap:8px; background:#f4f6f9; border-radius:20px; padding:6px 14px; width:280px; }
.search-input { border:none; background:transparent; outline:none; font-size:13px; color:#333; width:100%; }
.topbar-right { display:flex; align-items:center; gap:16px; min-width:220px; justify-content:flex-end; }
.user-info { display:flex; align-items:center; gap:10px; }
.user-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); color:white; font-weight:700; font-size:14px; display:flex; align-items:center; justify-content:center; }
.user-details { display:flex; flex-direction:column; }
.user-name { font-size:13px; font-weight:600; color:#333; }
.user-email { font-size:11px; color:#999; }
.notif-btn { position:relative; background:none; border:none; cursor:pointer; color:#666; padding:6px; }
.notif-badge { position:absolute; top:2px; right:2px; background:#ef4444; color:white; font-size:9px; width:14px; height:14px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.page-body { padding:24px 28px; display:flex; flex-direction:column; gap:20px; }
.page-header { display:flex; align-items:center; justify-content:space-between; }
.page-title { font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
.page-subtitle { font-size:13px; color:#999; margin:0; }
.reports-grid { display:grid; grid-template-columns:1fr 280px; gap:20px; align-items:flex-start; }
.left-col { display:flex; flex-direction:column; gap:20px; }
.card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.dark-card { background:#0f1b2d !important; }
.section-title { font-size:15px; font-weight:700; color:#1a1a1a; margin:0 0 14px; }
.section-title.white { color:white; }
.report-types { display:flex; gap:12px; margin-bottom:14px; flex-wrap:wrap; }
.report-type-item { display:flex; flex-direction:column; align-items:center; gap:6px; padding:12px 14px; border-radius:10px; border:1.5px solid #e2e8f0; cursor:pointer; transition:all 0.2s; min-width:90px; }
.report-type-item:hover { border-color:#4ab8f5; }
.report-type-item.active { border-color:#1a6ab5; background:#eff6ff; }
.report-type-icon { color:#4ab8f5; }
.report-type-label { font-size:11px; font-weight:600; color:#333; text-align:center; }
.report-desc { background:#f8fafc; border-radius:8px; padding:10px 14px; font-size:12px; color:#555; border-left:3px solid #4ab8f5; }
.form-row { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-label { font-size:11px; font-weight:600; color:#7eb8e8; letter-spacing:0.5px; }
.date-field { position:relative; }
.date-input { width:100%; border:1px solid #1a3a5c; border-radius:8px; padding:8px 32px 8px 12px; font-size:12px; color:#e2e8f0; background:#162236; outline:none; box-sizing:border-box; }
.date-field svg { position:absolute; right:10px; top:50%; transform:translateY(-50%); pointer-events:none; }
.select-dark { width:100%; border:1px solid #1a3a5c; border-radius:8px; padding:8px 12px; font-size:12px; color:#e2e8f0; background:#162236; outline:none; }
.format-btns { display:flex; gap:8px; margin-bottom:16px; }
.format-btn { padding:8px 18px; border:1.5px solid #e2e8f0; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#444; cursor:pointer; transition:all 0.2s; }
.format-btn.active { border-color:#1a6ab5; background:#eff6ff; color:#1a6ab5; }
.btn-generar { width:100%; padding:12px; border:none; border-radius:8px; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); font-size:14px; font-weight:700; color:white; cursor:pointer; }
.btn-generar:disabled { opacity:0.6; cursor:not-allowed; }
.status-banner { background:#fff8ef; border:1px solid #f1d7a8; border-radius:10px; padding:12px 14px; margin-bottom:14px; }
.status-banner strong { display:block; color:#8c5f2c; margin-bottom:6px; }
.status-banner p { margin:0; font-size:12px; color:#6b5b45; line-height:1.5; }
.source-list,
.coverage-list { display:flex; flex-direction:column; gap:12px; }
.source-item,
.coverage-item { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; padding:12px; border-radius:10px; border:1px solid #eef2f7; }
.source-item p,
.coverage-item p { margin:4px 0 0; font-size:12px; color:#64748b; line-height:1.5; }
.source-badge,
.coverage-pill { display:inline-flex; align-items:center; justify-content:center; min-width:72px; padding:4px 10px; border-radius:999px; font-size:11px; font-weight:700; }
.source-badge { background:#eff6ff; color:#1d4ed8; }
.coverage-pill-good { background:#dcfce7; color:#166534; }
.coverage-pill-warn { background:#fef3c7; color:#b45309; }
.coverage-pill-pending { background:#f1f5f9; color:#475569; }
</style>