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
        <div class="topbar-left"><span class="breadcrumb">Inicio › <strong>Validación</strong></span></div>
        <div class="topbar-center"><div class="search-box"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="" class="search-input" /></div></div>
        <div class="topbar-right">
          <div class="user-info"><div class="user-avatar">A</div><div class="user-details"><span class="user-name">Admin</span><span class="user-email">maria9.l@gmail.com</span></div></div>
          <button class="notif-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="notif-badge">1</span></button>
        </div>
      </header>

      <div class="page-body">
        <div class="content-layout">

          <!-- Panel Filtros -->
          <aside class="filters-panel">
            <h3 class="filters-title">Filtros</h3>

            <div class="counters-row">
              <div class="counter-item counter-pendiente">
                <span class="counter-label">Pendientes</span>
                <span class="counter-val">4</span>
              </div>
              <div class="counter-item counter-validada">
                <span class="counter-label">Validadas</span>
                <span class="counter-val">3</span>
              </div>
              <div class="counter-item counter-rechazada">
                <span class="counter-label">Rechazados</span>
                <span class="counter-val">1</span>
              </div>
            </div>

            <div class="filter-section">
              <label class="filter-label">Estado</label>
              <div class="filter-options">
                <label class="filter-radio" :class="{ active: filtroEstado === 'todos' }">
                  <input type="radio" v-model="filtroEstado" value="todos" />
                  <span class="radio-dot" style="background:#4ab8f5"></span> Todos
                </label>
                <label class="filter-radio" :class="{ active: filtroEstado === 'Pendiente' }">
                  <input type="radio" v-model="filtroEstado" value="Pendiente" />
                  <span class="radio-dot" style="background:#f59e0b"></span> Pendiente
                </label>
                <label class="filter-radio" :class="{ active: filtroEstado === 'Validada' }">
                  <input type="radio" v-model="filtroEstado" value="Validada" />
                  <span class="radio-dot" style="background:#22c55e"></span> Validada
                </label>
                <label class="filter-radio" :class="{ active: filtroEstado === 'Rechazada' }">
                  <input type="radio" v-model="filtroEstado" value="Rechazada" />
                  <span class="radio-dot" style="background:#ef4444"></span> Rechazada
                </label>
              </div>
            </div>

            <div class="filter-section">
              <label class="filter-label">Rango de Fechas</label>
              <label class="date-label">Fecha Inicio</label>
              <input type="date" v-model="fechaInicio" class="date-input" />
              <label class="date-label" style="margin-top:8px">Fecha fin</label>
              <input type="date" v-model="fechaFin" class="date-input" />
            </div>
          </aside>

          <!-- Área principal -->
          <div class="main-area">
            <div class="page-header">
              <div>
                <h1 class="page-title">Validación de Ventas</h1>
                <p class="page-subtitle">6 campañas encontradas</p>
              </div>
            </div>

            <div class="search-bar">
              <div class="search-box search-wide">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" v-model="busqueda" placeholder="Buscar campaña..." class="search-input" />
              </div>
            </div>

            <div class="table-card">
              <div class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Vendedor</th>
                      <th>Líder</th>
                      <th>Kit</th>
                      <th>Monto</th>
                      <th>Banco</th>
                      <th>Comprobante</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="v in ventasFiltradas" :key="v.id">
                      <td class="td-cliente">{{ v.cliente }}</td>
                      <td class="td-fecha">{{ v.fecha }}</td>
                      <td class="td-vendedor">{{ v.vendedor }}</td>
                      <td class="td-lider">{{ v.lider }}</td>
                      <td class="td-kit">{{ v.kit }}</td>
                      <td class="td-monto">$ {{ v.monto.toFixed(2) }}</td>
                      <td class="td-banco">{{ v.banco }}</td>
                      <td>
                        <div class="comprobante">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4ab8f5" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                          <span class="comp-code">{{ v.comprobante }}</span>
                        </div>
                      </td>
                      <td><span class="badge" :class="'est-' + v.estado.toLowerCase()">{{ v.estado }}</span></td>
                      <td>
                        <button class="acc-more">
                          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#666" stroke-width="2"><circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
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

const filtroEstado = ref('todos')
const fechaInicio  = ref('')
const fechaFin     = ref('')
const busqueda     = ref('')

const ventas = ref([
  { id:1, cliente:'Patricia Vega',   fecha:'2025-02-18 09:23', vendedor:'Juan Pérez',    lider:'María González', kit:'Kit Bienestar Básico',   monto:120.00, banco:'BCP',        comprobante:'TRF-2024-001', estado:'Pendiente' },
  { id:2, cliente:'Roberto Lima',    fecha:'2025-02-18 10:15', vendedor:'Sandra Quispe', lider:'Ana Torres',     kit:'Kit Bienestar Premium',  monto:210.00, banco:'BBVA',       comprobante:'TRF-2024-002', estado:'Pendiente' },
  { id:3, cliente:'Elena Moreno',    fecha:'2025-02-17 14:42', vendedor:'Luis Castro',   lider:'Diego Herrera',  kit:'Kit Belleza Día',        monto:95.00,  banco:'Interbank',  comprobante:'TRF-2024-003', estado:'Validada'  },
  { id:4, cliente:'Miguel Sánchez',  fecha:'2025-02-17 11:08', vendedor:'Carla Rojas',   lider:'Lucía Paredes',  kit:'Kit Bienestar Elite',    monto:320.00, banco:'Scotiabank', comprobante:'TRF-2024-004', estado:'Rechazada' },
  { id:5, cliente:'Andrea Fuentes',  fecha:'2025-02-17 11:30', vendedor:'Pedro Núñez',   lider:'Eduardo Flores', kit:'Kit Bienestar Básico',   monto:120.00, banco:'BCP',        comprobante:'TRF-2024-005', estado:'Pendiente' },
  { id:6, cliente:'Fernando Chávez', fecha:'2025-02-18 09:55', vendedor:'Ana Lima',      lider:'María González', kit:'Kit Belleza Noche',      monto:115.00, banco:'BBVA',       comprobante:'TRF-2024-006', estado:'Validada'  },
  { id:7, cliente:'Carmen Díaz',     fecha:'2025-02-18 13:20', vendedor:'Jorge Mendez',  lider:'Carlos Mendoza', kit:'Kit Bienestar Premium',  monto:210.00, banco:'BCP',        comprobante:'TRF-2024-007', estado:'Validada'  },
  { id:8, cliente:'Ricardo Torres',  fecha:'2025-02-15 10:45', vendedor:'Sandra Quispe', lider:'Sofía Ríos',     kit:'Kit Bienestar Básico',   monto:120.00, banco:'BCP',        comprobante:'TRF-2024-008', estado:'Pendiente' },
])

const ventasFiltradas = computed(() => ventas.value.filter(v => {
  const matchEstado   = filtroEstado.value === 'todos' || v.estado === filtroEstado.value
  const matchBusqueda = v.cliente.toLowerCase().includes(busqueda.value.toLowerCase()) ||
                        v.kit.toLowerCase().includes(busqueda.value.toLowerCase())
  return matchEstado && matchBusqueda
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
.sidebar-brand { font-size:13px; font-weight:800; color:#ffffff; letter-spacing:3px; }
.sidebar-section-label { font-size:10px; font-weight:700; color:#4a6080; letter-spacing:1.5px; text-transform:uppercase; padding:14px 18px 6px; }
.sidebar-nav { display:flex; flex-direction:column; gap:2px; padding:0 10px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; color:#6b8aaa; text-decoration:none; font-size:13px; font-weight:500; transition:background 0.2s,color 0.2s; white-space:nowrap; }
.nav-item:hover { background:#162236; color:#a0c4e8; }
.nav-item.active { background:#1a3a5c; color:#4ab8f5; font-weight:600; }
.nav-item.nav-logout { color:#ef4444; }
.nav-item.nav-logout:hover { background:#2a1010; color:#f87171; }
.sidebar-bottom { display:flex; flex-direction:column; gap:2px; padding:0 10px 16px; }
.main-content { margin-left:200px; flex:1; display:flex; flex-direction:column; min-height:100vh; }
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

.page-body { padding:24px 28px; }
.content-layout { display:flex; gap:20px; align-items:flex-start; }

/* Filtros */
.filters-panel { width:200px; flex-shrink:0; background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.filters-title { font-size:14px; font-weight:700; color:#1a1a1a; margin:0 0 14px; }
.counters-row { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
.counter-item { display:flex; justify-content:space-between; align-items:center; padding:6px 10px; border-radius:8px; font-size:12px; }
.counter-label { font-weight:500; }
.counter-val { font-weight:700; font-size:14px; }
.counter-pendiente { background:#fef3c7; color:#b45309; }
.counter-validada  { background:#dcfce7; color:#166534; }
.counter-rechazada { background:#fee2e2; color:#991b1b; }
.filter-section { margin-bottom:18px; }
.filter-label { font-size:11px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px; }
.filter-options { display:flex; flex-direction:column; gap:5px; }
.filter-radio { display:flex; align-items:center; gap:8px; font-size:13px; color:#444; cursor:pointer; padding:5px 8px; border-radius:6px; transition:background 0.15s; }
.filter-radio input { display:none; }
.filter-radio.active { background:#eff6ff; color:#1a6ab5; font-weight:600; }
.radio-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.date-label { font-size:11px; color:#888; display:block; margin-bottom:4px; }
.date-input { width:100%; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; font-size:12px; color:#333; outline:none; box-sizing:border-box; }

/* Main area */
.main-area { flex:1; display:flex; flex-direction:column; gap:16px; }
.page-header { display:flex; align-items:center; justify-content:space-between; }
.page-title { font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
.page-subtitle { font-size:13px; color:#999; margin:0; }
.search-bar { display:flex; }
.search-wide { width:100%; max-width:480px; }

.table-card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:12px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 12px; text-align:left; font-weight:600; font-size:11px; white-space:nowrap; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table td { padding:10px 12px; vertical-align:middle; }

.td-cliente  { font-weight:600; color:#1a1a1a; white-space:nowrap; }
.td-fecha    { color:#888; font-size:11px; white-space:nowrap; }
.td-vendedor { color:#555; white-space:nowrap; }
.td-lider    { font-weight:600; color:#333; white-space:nowrap; }
.td-kit      { color:#555; white-space:nowrap; }
.td-monto    { font-weight:700; color:#1a1a1a; white-space:nowrap; }
.td-banco    { font-weight:600; color:#333; }

.comprobante { display:flex; align-items:center; gap:4px; }
.comp-code   { color:#4ab8f5; font-size:11px; font-weight:600; white-space:nowrap; }

.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
.est-pendiente { background:#fef3c7; color:#b45309; }
.est-validada  { background:#dcfce7; color:#166534; }
.est-rechazada { background:#fee2e2; color:#991b1b; }

.acc-more { background:none; border:none; cursor:pointer; padding:4px 6px; border-radius:4px; }
.acc-more:hover { background:#f1f5f9; }
</style>