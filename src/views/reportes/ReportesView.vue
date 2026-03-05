<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo"><img :src="logo" alt="Innovex" class="sidebar-logo-img" /><span class="sidebar-brand">INNOVEX</span></div>
      <div class="sidebar-section-label">General</div>
      <nav class="sidebar-nav">
        <RouterLink to="/dashboard"   class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg><span>Dashboard</span></RouterLink>
        <RouterLink to="/campanas"    class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg><span>Campañas y Kit</span></RouterLink>
        <RouterLink to="/lideres"     class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg><span>Gestión de Líderes</span></RouterLink>
        <RouterLink to="/validacion"  class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg><span>Validación Ventas</span></RouterLink>
        <RouterLink to="/inventario"  class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><span>Control Inventario</span></RouterLink>
        <RouterLink to="/deudas"      class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg><span>Deudas y Finanzas</span></RouterLink>
        <RouterLink to="/recompensas" class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg><span>Recompensas</span></RouterLink>
        <RouterLink to="/reportes"    class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/></svg><span>Reportes</span></RouterLink>
      </nav>
      <div class="sidebar-section-label" style="margin-top:auto">Ajustes</div>
      <div class="sidebar-bottom">
        <RouterLink to="/configuracion" class="nav-item" active-class="active"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M19.07 4.93A10 10 0 1 1 4.93 19.07"/></svg><span>Configuración</span></RouterLink>
        <a href="#" class="nav-item nav-logout" @click.prevent="cerrarSesion"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg><span>Log out</span></a>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <div class="topbar-left"><span class="breadcrumb">Inicio › <strong>Reportes</strong></span></div>
        <div class="topbar-center"><div class="search-box"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="" class="search-input" /></div></div>
        <div class="topbar-right">
          <div class="user-info"><div class="user-avatar">A</div><div class="user-details"><span class="user-name">Admin</span><span class="user-email">maria9.l@gmail.com</span></div></div>
          <button class="notif-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="notif-badge">1</span></button>
        </div>
      </header>

      <div class="page-body">
        <div class="page-header">
          <div><h1 class="page-title">Reportes</h1><p class="page-subtitle">Genera y descarga reportes personalizados</p></div>
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
              <h3 class="section-title">Formato de Exportación</h3>
              <div class="format-btns">
                <button v-for="f in formatos" :key="f" class="format-btn" :class="{ active: formatoSeleccionado === f }" @click="formatoSeleccionado = f">{{ f }}</button>
              </div>
              <button class="btn-generar">Generar y Descargas Reporte</button>
            </div>
          </div>

          <!-- Reportes Recientes -->
          <div class="right-col">
            <div class="card">
              <h3 class="section-title">Reportes Recientes</h3>
              <div class="recent-list">
                <div v-for="r in reportesRecientes" :key="r.id" class="recent-item">
                  <div class="recent-icon" :class="'icon-'+r.tipo">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  </div>
                  <div class="recent-info">
                    <span class="recent-name">{{ r.nombre }}</span>
                    <span class="recent-type">{{ r.categoria }}</span>
                    <div class="recent-meta">
                      <span class="recent-ext">{{ r.tipo.toUpperCase() }}</span>
                      <span class="recent-size">{{ r.size }}</span>
                    </div>
                    <span class="recent-date">{{ r.fecha }}</span>
                    <span class="recent-user">{{ r.usuario }}</span>
                  </div>
                  <button class="download-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#4ab8f5" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
const logo   = new URL('../../assets/logo-innovex.png', import.meta.url).href
const router = useRouter()
const cerrarSesion = () => { localStorage.removeItem('token'); router.push({ name: 'login' }) }

const fechaDesde = ref('')
const fechaHasta = ref('')
const formatoSeleccionado = ref('CSV')
const formatos = ['CSV', 'XLSX (Excel)', 'PDF']
const tipoSeleccionado = ref('ventas')

const tiposReporte = [
  { key:'ventas',      label:'Ventas Validadas',      desc:'Reporte completo de ventas validadas con detalles de líder, vendedor, kit y monto', icon:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>' },
  { key:'deudas',      label:'Estado de Deudas',      desc:'Resumen de deudas activas y vencidas por líder', icon:'<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>' },
  { key:'rendimiento', label:'Rendimiento de Líderes', desc:'Análisis de rendimiento mensual por líder', icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' },
  { key:'stock',       label:'Auditoría de Stock',    desc:'Control y movimientos de inventario', icon:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>' },
  { key:'canjes',      label:'Canjes y Recompensas',  desc:'Historial de canjes de puntos y premios entregados', icon:'<path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>' },
]
const tipoActual = computed(() => tiposReporte.find(t => t.key === tipoSeleccionado.value) ?? tiposReporte[0])

const reportesRecientes = ref([
  { id:1, nombre:'Ventas_Validadas_Feb2025',   categoria:'Ventas Validadas',       tipo:'xlsx', size:'114 KB', fecha:'2025-02-15 09:45', usuario:'Admin Principal' },
  { id:2, nombre:'Deudas_Estado_Ene2025',      categoria:'Estado de Deudas',       tipo:'pdf',  size:'87 KB',  fecha:'2025-02-15 14:00', usuario:'María Finanzas'  },
  { id:3, nombre:'Lideres_Rendimiento_Q1',     categoria:'Rendimiento de Líderes', tipo:'xlsx', size:'95 KB',  fecha:'2025-02-10 11:00', usuario:'Admin Principal' },
  { id:4, nombre:'Inventario_Audi_Feb2025',    categoria:'Auditoría de Stock',     tipo:'pdf',  size:'43 KB',  fecha:'2025-02-08 16:20', usuario:'Carlos Almacén'  },
  { id:5, nombre:'Canjes_Ene2025',             categoria:'Canjes y Recompensas',   tipo:'pdf',  size:'62 KB',  fecha:'2025-02-06 10:25', usuario:'Admin Principal' },
])
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
.recent-list { display:flex; flex-direction:column; gap:12px; }
.recent-item { display:flex; align-items:flex-start; gap:10px; padding:12px; border-radius:8px; border:1px solid #f0f0f0; transition:background 0.15s; }
.recent-item:hover { background:#f8fafc; }
.recent-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.icon-xlsx { background:#dcfce7; color:#166534; }
.icon-pdf  { background:#fee2e2; color:#991b1b; }
.recent-info { flex:1; display:flex; flex-direction:column; gap:2px; }
.recent-name { font-size:12px; font-weight:700; color:#1a1a1a; }
.recent-type { font-size:11px; color:#666; }
.recent-meta { display:flex; gap:6px; margin-top:2px; }
.recent-ext  { font-size:10px; font-weight:700; padding:1px 6px; border-radius:4px; background:#f1f5f9; color:#475569; }
.recent-size { font-size:10px; color:#999; }
.recent-date { font-size:10px; color:#999; }
.recent-user { font-size:10px; color:#888; }
.download-btn { background:none; border:none; cursor:pointer; padding:6px; border-radius:6px; flex-shrink:0; }
.download-btn:hover { background:#eff6ff; }
</style>