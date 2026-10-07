<template>
  <AppShell :notification-count="ventasPendientes">
    <template #breadcrumb>
      <span class="breadcrumb">Inicio · <strong>Dashboard</strong></span>
    </template>

    <div class="page-body">

        <!-- Mensajes -->
        <div v-if="errorMsg" class="alert-error">
          {{ errorMsg }}<button @click="errorMsg=''" class="alert-close">✕</button>
        </div>

        <div class="page-header">
          <div>
            <h1 class="page-title">Dashboard Principal</h1>
            <p class="page-subtitle">Resumen operativo real — {{ fechaHoy }}</p>
          </div>
          <div class="page-actions">
            <button class="btn-outline" @click="actualizar" :disabled="cargando">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" :class="{ 'spin': cargando }"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
              {{ cargando ? 'Actualizando...' : 'Actualizar' }}
            </button>
            <button class="btn-primary" @click="exportarCSV">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar actividad
            </button>
          </div>
        </div>

        <!-- KPI -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-blue">
            <div class="kpi-info">
              <span class="kpi-label">Monto en cola de validación</span>
              <span class="kpi-value">{{ formatCurrency(ventasValidadas) }}</span>
            </div>
            <div class="kpi-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
          </div>
          <div class="kpi-card" :class="ventasPendientes > 0 ? 'kpi-orange' : 'kpi-neutral'">
            <div class="kpi-info">
              <span class="kpi-label">Ventas Pendientes Validación</span>
              <span class="kpi-value">{{ ventasPendientes }} <small>ventas</small></span>
            </div>
            <div class="kpi-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          </div>
          <div class="kpi-card" :class="deudaTotal > 0 ? 'kpi-red' : 'kpi-neutral'">
            <div class="kpi-info">
              <span class="kpi-label">Cartera pendiente registrada</span>
              <span class="kpi-value">{{ formatCurrency(deudaTotal) }}</span>
            </div>
            <div class="kpi-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg></div>
          </div>
          <div class="kpi-card" :class="lideresActivos > 0 ? 'kpi-green' : 'kpi-neutral'">
            <div class="kpi-info">
              <span class="kpi-label">Distribuidores activos</span>
              <span class="kpi-value">{{ lideresActivos }} <small>distribuidores</small></span>
            </div>
            <div class="kpi-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-row">
          <div class="chart-card chart-main">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Cobertura analítica actual</h3>
                <p class="chart-subtitle">Señales reales que hoy sí entrega el backend administrativo.</p>
              </div>
            </div>
            <div class="insight-grid">
              <div class="insight-item">
                <span class="insight-kicker">Validación</span>
                <strong>{{ ventasPendientes }} ventas pendientes</strong>
                <p>La cola operativa y la tabla de actividad salen del backend real de ventas pendientes.</p>
              </div>
              <div class="insight-item">
                <span class="insight-kicker">Finanzas</span>
                <strong>{{ formatCurrency(deudaTotal) }} en cartera</strong>
                <p>El total se consolida desde la cartera administrativa registrada en deudas.</p>
              </div>
              <div class="insight-item">
                <span class="insight-kicker">Red</span>
                <strong>{{ lideresActivos }} distribuidores activos</strong>
                <p>La cifra se calcula recorriendo toda la paginación del listado administrativo.</p>
              </div>
            </div>
          </div>
          <div class="chart-card chart-side">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Pendientes analíticos</h3>
                <p class="chart-subtitle">Aún no hay datos para este período.</p>
              </div>
            </div>
            <div class="pending-list">
              <div class="pending-item">
                <span class="pending-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3v18h18"/><path d="m7 14 4-4 4 3 5-7"/></svg></span>
                <strong>Series históricas</strong>
                <span>Aún no hay datos para este período.</span>
              </div>
              <div class="pending-item">
                <span class="pending-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span>
                <strong>Rendimiento por campaña</strong>
                <span>Aún no hay datos para este período.</span>
              </div>
              <div class="pending-item">
                <span class="pending-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/></svg></span>
                <strong>Exportación consolidada</strong>
                <span>Aún no hay datos para este período.</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabla Actividad Reciente -->
        <div class="table-card">
          <div class="table-header">
            <div>
              <h3 class="chart-title">Actividad Reciente</h3>
              <p class="chart-subtitle">Ventas pendientes visibles desde la cola administrativa actual</p>
            </div>
            <!-- Filtros -->
            <div class="filtros-row">
              <select v-model="filtroAccion" class="select-filter">
                <option value="todos">Todos</option>
                <option value="venta">Venta</option>
              </select>
              <button class="btn-outline" @click="mostrarFiltros = !mostrarFiltros">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filtrar
              </button>
            </div>
          </div>

          <!-- Panel filtros avanzados -->
          <div v-if="mostrarFiltros" class="filtros-panel">
            <div class="filtros-grid">
              <div class="filtro-group">
                <label>Líder</label>
                <input v-model="filtroLider" type="text" placeholder="Nombre del líder..." class="filtro-input" />
              </div>
              <div class="filtro-group">
                <DatePicker
                  id="dashboard-date-from"
                  v-model="filtroFechaDesde"
                  label="Fecha desde"
                  :range-start="filtroFechaDesde"
                  :range-end="filtroFechaHasta"
                />
              </div>
              <div class="filtro-group">
                <DatePicker
                  id="dashboard-date-to"
                  v-model="filtroFechaHasta"
                  label="Fecha hasta"
                  :min="filtroFechaDesde"
                  :range-start="filtroFechaDesde"
                  :range-end="filtroFechaHasta"
                />
              </div>
              <div class="filtro-group" style="align-self:flex-end">
                <button class="btn-outline" @click="limpiarFiltros">Limpiar</button>
              </div>
            </div>
          </div>

          <div v-if="cargandoTabla" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando actividad...</span>
          </div>

          <div v-else class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Timestamp</th><th>Líder</th><th>Acción</th><th>Descripción</th><th>Estado</th></tr>
              </thead>
              <tbody>
                <tr v-if="tablaFiltrada.length === 0">
                  <td colspan="5" class="empty-state">
                    <div class="empty-state-content">
                      <span class="empty-state-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg></span>
                      <span>No hay actividad reciente.</span>
                    </div>
                  </td>
                </tr>
                <tr v-for="row in tablaFiltrada.slice((paginaActual-1)*porPagina, paginaActual*porPagina)" :key="row.id">
                  <td class="td-time">{{ row.time }}</td>
                  <td class="td-leader">{{ row.leader }}</td>
                  <td><span class="badge" :class="'badge-' + row.actionType">{{ row.action }}</span></td>
                  <td class="td-desc">{{ row.description }}</td>
                  <td><span class="badge" :class="'badge-' + row.statusType">{{ row.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <span class="table-count">
              Mostrando {{ Math.min((paginaActual-1)*porPagina+1, tablaFiltrada.length) }}
              a {{ Math.min(paginaActual*porPagina, tablaFiltrada.length) }}
              de {{ tablaFiltrada.length }} resultados
            </span>
            <div class="pagination">
              <button class="page-btn" :disabled="paginaActual === 1" @click="paginaActual--">Anterior</button>
              <button v-for="p in totalPaginas" :key="p"
                class="page-btn" :class="{ active: paginaActual === p }"
                @click="paginaActual = p">{{ p }}</button>
              <button class="page-btn" :disabled="paginaActual === totalPaginas" @click="paginaActual++">Siguiente</button>
            </div>
          </div>
        </div>

    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { API_BASE_URL } from '@/app/apiClient'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import AppShell from '../../components/layout/AppShell.vue'
import DatePicker from '../../components/shared/DatePicker.vue'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'

const API_BASE = API_BASE_URL
const { authHeaders } = useAuthenticatedSession()
const { ensureCurrencyLoaded, formatCurrency } = useWorkspaceCurrency()

const hdrs = () => authHeaders()

// ── KPI State ──
const cargando        = ref(false)
const cargandoTabla   = ref(false)
const errorMsg        = ref('')
const ventasValidadas = ref(0)
const ventasPendientes = ref(0)
const deudaTotal      = ref(0)
const lideresActivos  = ref(0)

// ── Tabla state ──
const tableData       = ref<any[]>([])
const filtroAccion    = ref('todos')
const filtroLider     = ref('')
const filtroFechaDesde = ref('')
const filtroFechaHasta = ref('')
watch(filtroFechaDesde, (desde) => {
  if (desde && filtroFechaHasta.value && filtroFechaHasta.value < desde) {
    filtroFechaHasta.value = ''
  }
})
const mostrarFiltros  = ref(false)
const paginaActual    = ref(1)
const porPagina       = 10

// ── Fecha ──
const fechaHoy = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long' })

// ── Filtrado tabla ──
const tablaFiltrada = computed(() =>
  tableData.value.filter(row => {
    const matchAccion = filtroAccion.value === 'todos' || row.actionType === filtroAccion.value
    const matchLider  = !filtroLider.value || row.leader.toLowerCase().includes(filtroLider.value.toLowerCase())
    const rowDate = row.rawDate ? new Date(row.rawDate) : null
    const fromDate = filtroFechaDesde.value ? new Date(`${filtroFechaDesde.value}T00:00:00`) : null
    const toDate = filtroFechaHasta.value ? new Date(`${filtroFechaHasta.value}T23:59:59`) : null
    const matchDesde = !fromDate || !rowDate || rowDate >= fromDate
    const matchHasta = !toDate || !rowDate || rowDate <= toDate
    return matchAccion && matchLider && matchDesde && matchHasta
  })
)

const totalPaginas = computed(() => Math.max(1, Math.ceil(tablaFiltrada.value.length / porPagina)))

const limpiarFiltros = () => {
  filtroAccion.value    = 'todos'
  filtroLider.value     = ''
  filtroFechaDesde.value = ''
  filtroFechaHasta.value = ''
  paginaActual.value    = 1
}

// ── API ──
const cargarKPIs = async () => {
  try {
    const res = await fetch(`${API_BASE}/workspace/admin/analytics/resumen`, { headers: hdrs() })
    if (!res.ok) return
    const json = await res.json()
    if (json.status !== 'success') return

    ventasPendientes.value = Number(json.data?.ventas?.pendientes_cantidad ?? 0)
    ventasValidadas.value = Number(json.data?.ventas?.pendientes_monto ?? 0)
    lideresActivos.value = Number(json.data?.distribuidores?.activos ?? 0)
    deudaTotal.value = Number(json.data?.finanzas?.deuda_activa_monto ?? 0)
  } catch { /* silencioso */ }
}

const cargarTabla = async () => {
  cargandoTabla.value = true
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/ventas/pendientes`, { headers: hdrs() })
    if (res.ok) {
      const json = await res.json()
      const lista = json.data?.data ?? json.data ?? []
      tableData.value = lista.map((v: any) => ({
        id:         v.id,
        rawDate:    v.capturado_at ?? null,
        time:       v.capturado_at ? new Date(v.capturado_at).toLocaleString('es-PE') : '—',
        leader:     v.vendedor?.usuario ? `${v.vendedor.usuario.nombre} ${v.vendedor.usuario.apellido}` : '—',
        action:     'Venta',
        actionType: 'venta',
        description:`${v.kit?.nombre ?? '—'} - ${formatCurrency(v.monto_total_venta)}`,
        status:     v.estado ?? 'pendiente',
        statusType: v.estado ?? 'pendiente',
      }))
    }
  } catch { /* silencioso */ }
  finally { cargandoTabla.value = false }
}

const actualizar = async () => {
  cargando.value = true
  errorMsg.value = ''
  await Promise.all([ensureCurrencyLoaded(), cargarKPIs(), cargarTabla()])
  cargando.value = false
}

// ── Exportar CSV ──
const exportarCSV = () => {
  const headers = ['Timestamp', 'Líder', 'Acción', 'Descripción', 'Estado']
  const rows = tablaFiltrada.value.map(r =>
    [r.time, r.leader, r.action, r.description, r.status].join(',')
  )
  const csv = [headers.join(','), ...rows].join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `dashboard_${new Date().toISOString().slice(0,10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

onMounted(() => {
  void actualizar()
})
</script>

<style scoped>
.dashboard-layout { display:flex; width:100%; min-height:100vh; background:#f0f2f5; overflow-x:hidden; }
.sidebar { width:145px; min-width:145px; background:#000000; display:flex; flex-direction:column; position:fixed; top:0; left:0; height:100vh; z-index:300; overflow-y:auto; overflow-x:hidden; transition:transform 0.25s ease; scrollbar-width:none; }
.sidebar::-webkit-scrollbar { display:none; }
.sidebar-logo { display:flex; flex-direction:column; align-items:center; padding:20px 10px 16px; border-bottom:1px solid #000; gap:8px; }
.sidebar-logo-img { width:90px; height:90px; object-fit:contain; display:block; }
.sidebar-section-label { font-size:9px; font-weight:700; color:#a4b4bc; letter-spacing:1.5px; text-transform:uppercase; padding:12px 12px 4px; }
.ajustes-label { margin-top:auto; }
.sidebar-nav { display:flex; flex-direction:column; gap:1px; padding:4px 6px; }
.sidebar-bottom { display:flex; flex-direction:column; gap:1px; padding:4px 6px 16px; }
.nav-item { display:flex; align-items:center; gap:8px; padding:8px 8px; border-radius:7px; color:#a4b4bc; text-decoration:none; font-size:11px; font-weight:500; transition:background 0.15s,color 0.15s; white-space:normal; line-height:1.3; overflow:hidden; }
.nav-item svg { flex-shrink:0; }
.nav-item:hover { background:#16253a; color:#9ab8d8; }
.nav-item.active { background:#1a3a5c; color:#4ab8f5; font-weight:600; }
.nav-item.nav-logout { color:#ef4444; }
.nav-item.nav-logout:hover { background:#2a1010; color:#f87171; }
.sidebar-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55); z-index:200; }
.sidebar-overlay.active { display:block; }
.main-content { flex:1; margin-left:145px; width:calc(100% - 145px); min-width:0; display:flex; flex-direction:column; overflow-x:hidden; }
.topbar { background:#fff; height:62px; display:flex; align-items:center; padding:0 18px; gap:10px; border-bottom:1px solid #e8eaed; position:sticky; top:0; z-index:100; width:100%; box-sizing:border-box; }
.menu-btn { display:none; background:none; border:none; cursor:pointer; color:#555; padding:4px; flex-shrink:0; }
.topbar-left { display:flex; align-items:center; gap:8px; flex-shrink:0; }
.breadcrumb { font-size:12px; color:#526579; white-space:nowrap; }
.breadcrumb strong { color:#333; }
.topbar-center { flex:1; display:flex; justify-content:center; min-width:0; }
.search-box { display:flex; align-items:center; gap:7px; background:#f5f6f8; border-radius:18px; padding:5px 14px; width:100%; max-width:340px; border:1px solid #e8eaed; }
.search-input { border:none; background:transparent; outline:none; font-size:12px; color:#333; width:100%; }
.topbar-right { display:flex; align-items:center; gap:10px; flex-shrink:0; }
.user-info { display:flex; align-items:center; gap:8px; }
.user-avatar { width:36px; height:36px; border-radius:50%; overflow:hidden; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); flex-shrink:0; border:2px solid #e0e0e0; }
.user-details { display:flex; flex-direction:column; }
.user-name { font-size:12px; font-weight:600; color:#222; line-height:1.3; }
.user-email { font-size:10px; color:#999; line-height:1.3; }
.notif-btn { position:relative; background:none; border:none; cursor:pointer; color:#666; padding:5px; flex-shrink:0; }
.notif-badge { position:absolute; top:1px; right:1px; background:#ef4444; color:white; font-size:8px; width:13px; height:13px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; }
.page-body { padding:24px 24px 168px; display:flex; flex-direction:column; gap:16px; width:100%; box-sizing:border-box; }
.page-header { display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:16px; }
.page-title { font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 2px; }
.page-subtitle { font-size:12px; color:#64748b; margin:0; }
.page-actions { display:flex; gap:8px; }
.btn-outline { display:flex; align-items:center; gap:5px; padding:7px 14px; border:1.5px solid #ddd; border-radius:8px; background:white; font-size:12px; font-weight:600; color:#555; cursor:pointer; white-space:nowrap; }
.btn-outline:hover { border-color:#4ab8f5; color:#4ab8f5; }
.btn-outline:disabled { opacity:0.5; cursor:not-allowed; }
.btn-primary { display:flex; align-items:center; gap:5px; padding:7px 14px; border:none; border-radius:8px; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); font-size:12px; font-weight:600; color:white; cursor:pointer; white-space:nowrap; }
.alert-error { background:#fef2f2; border:1px solid #fecaca; color:#991b1b; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-close { background:none; border:none; cursor:pointer; font-size:16px; }
.kpi-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:16px; width:100%; }
.kpi-card { position:relative; overflow:hidden; border:1px solid #e2e8f0; border-radius:16px; padding:20px; display:flex; align-items:center; justify-content:space-between; color:#172b40; background:#fff; box-shadow:0 2px 8px rgba(15,23,42,0.06); min-width:0; min-height:104px; }
.kpi-card::before { content:""; position:absolute; inset:0 0 auto; height:3px; background:var(--kpi-accent); }
.kpi-blue { --kpi-accent:#2563eb; --kpi-icon-background:#eff6ff; }
.kpi-orange { --kpi-accent:#a85b08; --kpi-icon-background:#fff7ed; }
.kpi-red { --kpi-accent:#b42318; --kpi-icon-background:#fef2f2; }
.kpi-green { --kpi-accent:#15803d; --kpi-icon-background:#f0fdf4; }
.kpi-neutral { --kpi-accent:#64748b; --kpi-icon-background:#f1f5f9; }
.kpi-info { min-width:0; }
.kpi-label { display:block; margin-bottom:8px; color:#526579; font-size:11px; line-height:1.4; }
.kpi-value { display:block; color:#142337; font-size:30px; font-weight:700; line-height:1.15; font-variant-numeric:tabular-nums; overflow-wrap:anywhere; }
.kpi-value small { color:#526579; font-size:13px; font-weight:600; }
.kpi-icon { display:grid; place-items:center; width:48px; height:48px; margin-left:16px; flex:0 0 48px; border-radius:50%; color:var(--kpi-accent); background:var(--kpi-icon-background); }
.charts-row { display:grid; grid-template-columns:minmax(0,1.7fr) minmax(280px,0.9fr); gap:16px; width:100%; }
.chart-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; box-shadow:0 2px 8px rgba(15,23,42,0.05); min-width:0; overflow:hidden; }
.chart-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; gap:8px; flex-wrap:wrap; }
.chart-title { font-size:16px; font-weight:700; color:#172b40; margin:0 0 4px; }
.chart-subtitle { font-size:12px; line-height:1.5; color:#526579; margin:0; }
.insight-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.insight-item { border:1px solid #e5edf6; border-radius:16px; padding:16px; background:#fbfdff; }
.insight-kicker { display:block; font-size:10px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#1d4ed8; margin-bottom:8px; }
.insight-item strong { display:block; font-size:15px; color:#0f172a; margin-bottom:6px; }
.insight-item p { margin:0; font-size:12px; color:#64748b; line-height:1.5; }
.pending-list { display:flex; flex-direction:column; gap:10px; }
.pending-item { display:grid; grid-template-columns:40px minmax(0,1fr); column-gap:12px; row-gap:4px; border:1px solid #e2e8f0; border-radius:14px; padding:16px; background:#f8fafc; }
.pending-item strong { grid-column:2; grid-row:1; display:block; font-size:13px; color:#172b40; }
.pending-item > span:last-child { grid-column:2; grid-row:2; font-size:12px; color:#526579; line-height:1.5; }
.pending-icon { grid-column:1; grid-row:1 / span 2; display:grid; place-items:center; width:40px; height:40px; border-radius:50%; color:#456b8c; background:#eaf2f8; }
.table-card { background:#fff; border:1px solid #e2e8f0; border-radius:16px; padding:24px; box-shadow:0 2px 8px rgba(15,23,42,0.05); width:100%; overflow:hidden; box-sizing:border-box; }
.table-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px; }
.filtros-row { display:flex; align-items:center; gap:8px; }
.select-filter { border:1px solid #e2e8f0; border-radius:8px; padding:5px 10px; font-size:12px; color:#444; outline:none; background:white; cursor:pointer; }
.filtros-panel { background:#f8fafc; border-radius:8px; padding:14px; margin-bottom:14px; border:1px solid #e2e8f0; }
.filtros-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.filtro-group { display:flex; flex-direction:column; gap:4px; }
.filtro-group label { font-size:11px; font-weight:600; color:#666; }
.filtro-input { border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; font-size:12px; color:#333; outline:none; }
.loading-state { display:flex; align-items:center; justify-content:center; gap:12px; padding:40px; color:#526579; font-size:13px; }
.spinner { width:18px; height:18px; border:2px solid #e2e8f0; border-top-color:#4ab8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
.spin { animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.table-wrap { overflow-x:auto; width:100%; }
.data-table { width:100%; border-collapse:collapse; font-size:12px; }
.data-table thead tr { background:#111827; color:white; }
.data-table th { padding:10px 12px; text-align:left; font-weight:600; font-size:11px; white-space:nowrap; }
.data-table tbody tr { border-bottom:1px solid #f3f4f6; transition:background 0.15s; }
.data-table tbody tr:hover { background:#f9fafb; }
.data-table td { padding:10px 12px; vertical-align:middle; }
.td-time { color:#526579; font-size:11px; white-space:nowrap; }
.td-leader { font-weight:600; color:#111; white-space:nowrap; }
.td-desc { color:#666; font-size:11px; }
.empty-state { color:#526579; padding:16px !important; font-size:13px; }
.empty-state-content { display:grid; justify-items:center; align-content:center; gap:12px; min-height:136px; text-align:center; }
.empty-state-icon { display:grid; place-items:center; width:48px; height:48px; border-radius:50%; color:#456b8c; background:#edf4fa; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:10px; font-weight:600; white-space:nowrap; }
.badge-venta      { background:#dbeafe; color:#1d4ed8; }
.badge-pago       { background:#fef9c3; color:#92400e; }
.badge-kit        { background:#dcfce7; color:#166534; }
.badge-aprobado   { background:#dcfce7; color:#166534; }
.badge-validado   { background:#e0f2fe; color:#0369a1; }
.badge-confirmado { background:#dbeafe; color:#1e40af; }
.badge-pendiente  { background:#fef3c7; color:#b45309; }
.table-footer { display:flex; align-items:center; justify-content:space-between; margin-top:14px; padding-top:12px; border-top:1px solid #f3f4f6; flex-wrap:wrap; gap:8px; }
.table-count { font-size:11px; color:#526579; }
.pagination { display:flex; gap:5px; flex-wrap:wrap; }
.page-btn { padding:4px 11px; border:1px solid #e0e0e0; border-radius:5px; background:white; font-size:11px; cursor:pointer; color:#555; }
.page-btn:hover { border-color:#2563eb; color:#1d4ed8; }
.page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.page-btn.active { background:#1a6ab5; color:white; border-color:#1a6ab5; }
.page-body :focus-visible,
:deep(.app-topbar :focus-visible) { outline:3px solid #1d4ed8; outline-offset:3px; }
:deep(.app-topbar) { min-height:68px; margin-top:8px; padding:12px 16px; border-radius:16px; box-shadow:0 4px 14px rgba(15,23,42,0.06); }
.btn-outline, .btn-primary, .select-filter, .filtro-input, .page-btn { min-height:40px; }
.btn-outline, .btn-primary { border-radius:8px; }
.select-filter:focus-visible, .filtro-input:focus-visible { border-color:#1d4ed8; }
@media (prefers-reduced-motion: reduce) {
  .page-body *, .page-body *::before, .page-body *::after,
  :deep(.app-topbar), :deep(.app-topbar *) {
    animation-duration:0.01ms !important;
    animation-iteration-count:1 !important;
    scroll-behavior:auto !important;
    transition-duration:0.01ms !important;
  }
}
@media (max-width:1100px) { .kpi-grid { grid-template-columns:repeat(2,1fr); } .charts-row { grid-template-columns:1fr; } .insight-grid { grid-template-columns:1fr; } .filtros-grid { grid-template-columns:repeat(2,1fr); } }
@media (max-width:768px) { .sidebar { transform:translateX(-100%); } .sidebar.sidebar-open { transform:translateX(0); box-shadow:4px 0 24px rgba(0,0,0,0.5); } .main-content { margin-left:0; width:100%; } .menu-btn { display:flex; } .user-details { display:none; } .breadcrumb { display:none; } .page-body { padding:16px 16px 168px; gap:16px; } .page-title { font-size:18px; } .kpi-grid { grid-template-columns:1fr 1fr; gap:16px; } .kpi-card { padding:16px; } .kpi-value { font-size:28px; } .chart-card, .table-card { padding:16px; } :deep(.app-topbar) { min-height:64px; padding:12px; } }
@media (max-width:480px) { .kpi-grid { grid-template-columns:1fr; } .topbar-center { display:none; } .page-header { flex-direction:column; align-items:flex-start; } .page-actions { width:100%; flex-wrap:wrap; } .filtros-grid { grid-template-columns:1fr; } }
</style>