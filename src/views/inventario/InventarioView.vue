<template>
  <div class="dashboard-layout">
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img :src="logo" alt="Innovex" class="sidebar-logo-img" />
        <span class="sidebar-brand">INNOVEX</span>
      </div>
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
        <div class="topbar-left"><span class="breadcrumb">Inicio › <strong>Control</strong></span></div>
        <div class="topbar-center"><div class="search-box"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="" class="search-input" /></div></div>
        <div class="topbar-right">
          <div class="user-info"><div class="user-avatar">A</div><div class="user-details"><span class="user-name">Admin</span><span class="user-email">maria9.l@gmail.com</span></div></div>
          <button class="notif-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="notif-badge">1</span></button>
        </div>
      </header>

      <div class="page-body">
        <div class="page-header">
          <div>
            <h1 class="page-title">Control Inventario</h1>
            <p class="page-subtitle">Administración de empresas registradas en la plataforma</p>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-val">270</span>
              <div class="kpi-icon blue"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
            </div>
            <span class="kpi-label">Stock en Almacén</span>
            <span class="kpi-sub">Unidades disponibles</span>
          </div>
          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-val">23</span>
              <div class="kpi-icon teal"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
            </div>
            <span class="kpi-label">Stock Distribuido</span>
            <span class="kpi-sub">Unidades disponibles</span>
          </div>
          <div class="kpi-card kpi-warn">
            <div class="kpi-top">
              <span class="kpi-val">1</span>
              <div class="kpi-icon orange"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
            </div>
            <span class="kpi-label">Kits con Stock Bajo</span>
            <span class="kpi-sub">Unidades disponibles</span>
          </div>
          <div class="kpi-card kpi-danger">
            <div class="kpi-top">
              <span class="kpi-val">3</span>
              <div class="kpi-icon red"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg></div>
            </div>
            <span class="kpi-label">Merma/Pérdidas</span>
            <span class="kpi-sub">Unidades disponibles</span>
          </div>
        </div>

        <!-- Estado de Stock por Kit -->
        <div class="stock-section card">
          <h3 class="section-title">Estado de Stock por Kit</h3>
          <div class="stock-grid">
            <div v-for="kit in kits" :key="kit.nombre" class="stock-item" :class="{ 'stock-low': kit.bajo }">
              <span class="stock-kit-name">{{ kit.nombre }}</span>
              <span class="stock-val" :class="{ 'val-red': kit.bajo }">{{ kit.stock }}</span>
              <span class="stock-unit">unidades</span>
              <div class="stock-bar"><div class="stock-fill" :style="{ width: (kit.stock/100*100)+'%', background: kit.bajo ? '#ef4444' : '#3b82f6' }"></div></div>
            </div>
          </div>
        </div>

        <!-- Filtros de tabla -->
        <div class="table-filters card">
          <div class="search-box search-wide">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="busqueda" placeholder="Buscar stock, kit..." class="search-input" />
          </div>
          <span class="filter-label-inline">Filtrar por:</span>
          <select v-model="filtroTipo" class="select-filter">
            <option value="todos">Todos</option>
            <option value="Entradas">Entradas</option>
            <option value="Asignación">Asignación</option>
            <option value="Salida">Salida</option>
            <option value="Merma">Merma</option>
          </select>
          <select v-model="filtroKit" class="select-filter">
            <option value="todos">Todos</option>
            <option v-for="kit in kits" :key="kit.nombre" :value="kit.nombre">{{ kit.nombre }}</option>
          </select>
          <input type="date" v-model="fechaInicio" class="date-input-sm" />
          <input type="date" v-model="fechaFin"    class="date-input-sm" />
        </div>

        <!-- Tabla movimientos -->
        <div class="card">
          <h3 class="section-title">Movimientos de Inventario</h3>
          <p class="section-sub">7 registros</p>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Fecha/Hora</th>
                  <th>Tipo</th>
                  <th>Kit</th>
                  <th>Cantidad</th>
                  <th>Líder Destino</th>
                  <th>Admin Autorizó</th>
                  <th>Stock Resultante</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in movimientosFiltrados" :key="m.id">
                  <td class="td-fecha">{{ m.fecha }}</td>
                  <td>
                    <div class="tipo-cell">
                      <span class="dot-tipo" :style="{ background: colorTipo(m.tipo) }"></span>
                      <span class="badge" :class="'tipo-'+m.tipo.toLowerCase()">{{ m.tipo }}</span>
                    </div>
                  </td>
                  <td class="td-kit">{{ m.kit }}</td>
                  <td :class="m.cantidad > 0 ? 'td-pos' : 'td-neg'">{{ m.cantidad > 0 ? '+' : '' }}{{ m.cantidad }}</td>
                  <td class="td-lider">{{ m.lider || '—' }}</td>
                  <td class="td-admin">{{ m.admin }}</td>
                  <td class="td-stock">{{ m.stockResult }} unidades</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="table-footer">
            <span class="table-count">Mostrando 1 a 10 de 156 resultados</span>
            <div class="pagination">
              <button class="page-btn">Anterior</button>
              <button class="page-btn active">1</button>
              <button class="page-btn">Siguiente</button>
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

const busqueda   = ref('')
const filtroTipo = ref('todos')
const filtroKit  = ref('todos')
const fechaInicio = ref('')
const fechaFin    = ref('')

const kits = ref([
  { nombre:'Kit Bienestar Básico',   stock:75, bajo:false },
  { nombre:'Kit Bienestar Premium',  stock:32, bajo:false },
  { nombre:'Kit Bienestar Elite',    stock:18, bajo:true  },
  { nombre:'Kit Belleza Día',        stock:90, bajo:false },
  { nombre:'Kit Belleza Noche',      stock:55, bajo:false },
])

const movimientos = ref([
  { id:1, fecha:'2025-02-18 08:00', tipo:'Entradas',  kit:'Kit Bienestar Básico',  cantidad:+100, lider:'',              admin:'Admin Principal', stockResult:175 },
  { id:2, fecha:'2025-02-17 14:30', tipo:'Asignación',kit:'Kit Bienestar Premium', cantidad:-5,   lider:'Ana Torres',    admin:'Admin Principal', stockResult:37  },
  { id:3, fecha:'2025-02-17 10:15', tipo:'Asignación',kit:'Kit Belleza Día',       cantidad:-8,   lider:'María González', admin:'Supervisor 1',   stockResult:90  },
  { id:4, fecha:'2025-02-16 16:45', tipo:'Salida',    kit:'Kit Bienestar Elite',   cantidad:-2,   lider:'Diego Herrera', admin:'Admin Principal', stockResult:18  },
  { id:5, fecha:'2025-02-16 09:00', tipo:'Entradas',  kit:'Kit Belleza Noche',     cantidad:+50,  lider:'',              admin:'Almacén',         stockResult:55  },
  { id:6, fecha:'2025-02-15 11:30', tipo:'Merma',     kit:'Kit Bienestar Básico',  cantidad:-3,   lider:'',              admin:'Almacén',         stockResult:72  },
  { id:7, fecha:'2025-02-14 15:00', tipo:'Asignación',kit:'Kit Bienestar Básico',  cantidad:-10,  lider:'Eduardo Flores',admin:'Supervisor 1',    stockResult:75  },
])

const colorTipo = (tipo: string) => {
  const map: Record<string,string> = { Entradas:'#22c55e', Asignación:'#3b82f6', Salida:'#ef4444', Merma:'#f59e0b' }
  return map[tipo] || '#94a3b8'
}

const movimientosFiltrados = computed(() => movimientos.value.filter(m => {
  const matchTipo = filtroTipo.value === 'todos' || m.tipo === filtroTipo.value
  const matchKit  = filtroKit.value  === 'todos' || m.kit  === filtroKit.value
  const matchBusc = m.kit.toLowerCase().includes(busqueda.value.toLowerCase())
  return matchTipo && matchKit && matchBusc
}))
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
.card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }

/* KPI */
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.kpi-card { background:white; border-radius:12px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1.5px solid #e2e8f0; display:flex; flex-direction:column; gap:4px; }
.kpi-card.kpi-warn  { border-color:#fde68a; }
.kpi-card.kpi-danger { border-color:#fca5a5; }
.kpi-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
.kpi-val { font-size:28px; font-weight:700; color:#1a1a1a; }
.kpi-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
.kpi-icon.blue   { background:#dbeafe; color:#2563eb; }
.kpi-icon.teal   { background:#d1fae5; color:#059669; }
.kpi-icon.orange { background:#fef3c7; color:#d97706; }
.kpi-icon.red    { background:#fee2e2; color:#dc2626; }
.kpi-label { font-size:13px; font-weight:600; color:#333; }
.kpi-sub   { font-size:11px; color:#999; }

/* Stock por Kit */
.section-title { font-size:15px; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
.section-sub   { font-size:12px; color:#999; margin:0 0 16px; }
.stock-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; }
.stock-item { background:#0f1b2d; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.stock-item.stock-low { background:#1a0a0a; border:1px solid #ef4444; }
.stock-kit-name { font-size:11px; color:#7eb8e8; font-weight:600; }
.stock-val  { font-size:26px; font-weight:700; color:white; }
.val-red    { color:#ef4444 !important; }
.stock-unit { font-size:10px; color:#4a6080; margin-bottom:6px; }
.stock-bar  { height:4px; background:#1a2d45; border-radius:4px; overflow:hidden; }
.stock-fill { height:100%; border-radius:4px; }

/* Filtros tabla */
.table-filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.search-wide { width:240px; }
.filter-label-inline { font-size:13px; color:#888; font-weight:600; white-space:nowrap; }
.select-filter { border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; font-size:13px; color:#444; outline:none; background:white; cursor:pointer; }
.date-input-sm { border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; font-size:12px; color:#444; outline:none; }

/* Tabla */
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 14px; text-align:left; font-weight:600; font-size:12px; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table td { padding:10px 14px; vertical-align:middle; }
.td-fecha { color:#888; font-size:12px; white-space:nowrap; }
.td-kit   { font-weight:600; color:#333; }
.td-pos   { color:#22c55e; font-weight:700; }
.td-neg   { color:#ef4444; font-weight:700; }
.td-lider { color:#555; }
.td-admin { color:#666; font-size:12px; }
.td-stock { font-weight:600; color:#1a1a1a; }
.tipo-cell { display:flex; align-items:center; gap:6px; }
.dot-tipo  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.tipo-entradas  { background:#dcfce7; color:#166534; }
.tipo-asignación{ background:#dbeafe; color:#1e40af; }
.tipo-salida    { background:#fee2e2; color:#991b1b; }
.tipo-merma     { background:#fef3c7; color:#b45309; }
.table-footer { display:flex; align-items:center; justify-content:space-between; margin-top:16px; padding-top:14px; border-top:1px solid #f0f0f0; }
.table-count { font-size:12px; color:#999; }
.pagination { display:flex; gap:6px; }
.page-btn { padding:5px 12px; border:1px solid #ddd; border-radius:6px; background:white; font-size:12px; cursor:pointer; color:#555; }
.page-btn.active { background:#1a6ab5; color:white; border-color:#1a6ab5; }
</style>