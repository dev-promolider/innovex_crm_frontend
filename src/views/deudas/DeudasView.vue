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
        <div class="topbar-left"><span class="breadcrumb">Inicio › <strong>Deudas</strong></span></div>
        <div class="topbar-center"><div class="search-box"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="" class="search-input" /></div></div>
        <div class="topbar-right">
          <div class="user-info"><div class="user-avatar">A</div><div class="user-details"><span class="user-name">Admin</span><span class="user-email">maria9.l@gmail.com</span></div></div>
          <button class="notif-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="notif-badge">1</span></button>
        </div>
      </header>

      <div class="page-body">
        <div class="page-header">
          <div><h1 class="page-title">Deudas y Finanzas</h1><p class="page-subtitle">Vista general del sistema y métricas consolidadas</p></div>
        </div>

        <div class="main-grid">
          <div class="left-col">
            <!-- KPI Cards -->
            <div class="kpi-row">
              <div class="kpi-dark kpi-card-d">
                <div class="kpi-d-icon red"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg></div>
                <span class="kpi-d-val">$ 16,050</span>
                <span class="kpi-d-label">Total Pendiente</span>
                <span class="kpi-d-sub">7 líderes con deuda</span>
              </div>
              <div class="kpi-dark kpi-card-d">
                <div class="kpi-d-icon orange"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg></div>
                <span class="kpi-d-val">$ 9,650</span>
                <span class="kpi-d-label">Deuda Vencida</span>
                <span class="kpi-d-sub">Supera el 80% del límite</span>
              </div>
              <div class="kpi-dark kpi-card-d">
                <div class="kpi-d-icon green"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
                <span class="kpi-d-val">$ 16,050</span>
                <span class="kpi-d-label">Pagos del Mes</span>
                <span class="kpi-d-sub">4 pagos confirmados</span>
              </div>
            </div>

            <!-- Gráfica -->
            <div class="card">
              <h3 class="section-title">Evolución Deuda vs. Recaudación</h3>
              <p class="section-sub">Últimos 12 meses</p>
              <svg viewBox="0 0 480 160" width="100%" height="160">
                <line x1="40" y1="20"  x2="460" y2="20"  stroke="#f0f0f0" stroke-width="1"/>
                <line x1="40" y1="60"  x2="460" y2="60"  stroke="#f0f0f0" stroke-width="1"/>
                <line x1="40" y1="100" x2="460" y2="100" stroke="#f0f0f0" stroke-width="1"/>
                <line x1="40" y1="140" x2="460" y2="140" stroke="#f0f0f0" stroke-width="1"/>
                <text x="35" y="23"  text-anchor="end" font-size="9" fill="#bbb">40,000</text>
                <text x="35" y="63"  text-anchor="end" font-size="9" fill="#bbb">30,000</text>
                <text x="35" y="103" text-anchor="end" font-size="9" fill="#bbb">20,000</text>
                <text x="35" y="143" text-anchor="end" font-size="9" fill="#bbb">10,000</text>
                <!-- Deuda line (red) -->
                <polygon points="50,100 100,80 150,60 200,50 250,70 300,90 350,85 400,75 450,100 450,140 50,140" fill="rgba(239,68,68,0.1)"/>
                <polyline points="50,100 100,80 150,60 200,50 250,70 300,90 350,85 400,75 450,100" fill="none" stroke="#ef4444" stroke-width="2" stroke-linejoin="round"/>
                <!-- Recaudación line (blue) -->
                <polygon points="50,120 100,100 150,85 200,70 250,90 300,110 350,100 400,90 450,120 450,140 50,140" fill="rgba(59,130,246,0.1)"/>
                <polyline points="50,120 100,100 150,85 200,70 250,90 300,110 350,100 400,90 450,120" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round"/>
                <!-- X labels -->
                <text x="50"  y="158" text-anchor="middle" font-size="9" fill="#bbb">Mar</text>
                <text x="100" y="158" text-anchor="middle" font-size="9" fill="#bbb">Abr</text>
                <text x="150" y="158" text-anchor="middle" font-size="9" fill="#bbb">May</text>
                <text x="200" y="158" text-anchor="middle" font-size="9" fill="#bbb">Jun</text>
                <text x="250" y="158" text-anchor="middle" font-size="9" fill="#bbb">Ago</text>
                <text x="300" y="158" text-anchor="middle" font-size="9" fill="#bbb">Sep</text>
                <text x="350" y="158" text-anchor="middle" font-size="9" fill="#bbb">Nov</text>
                <text x="400" y="158" text-anchor="middle" font-size="9" fill="#bbb">Ene</text>
                <text x="450" y="158" text-anchor="middle" font-size="9" fill="#bbb">Feb</text>
              </svg>
            </div>

            <!-- Tabla pagos -->
            <div class="card">
              <div class="table-header-row">
                <h3 class="section-title">Pagos Recientes de Líderes</h3>
                <button class="btn-primary">+ Registro Pago Manual</button>
              </div>
              <div class="table-wrap">
                <table class="data-table">
                  <thead><tr><th>Líder</th><th>Fecha pago</th><th>Monto</th><th>Referencia</th><th>Banco</th><th>Estado</th></tr></thead>
                  <tbody>
                    <tr v-for="p in pagos" :key="p.id">
                      <td class="td-lider">{{ p.lider }}</td>
                      <td class="td-fecha">{{ p.fecha }}</td>
                      <td class="td-monto">$ {{ p.monto.toLocaleString() }}.00</td>
                      <td class="td-ref">{{ p.referencia }}</td>
                      <td class="td-banco">{{ p.banco }}</td>
                      <td><span class="badge" :class="'est-'+p.estado.toLowerCase()">{{ p.estado }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Ledger panel -->
          <div class="ledger-panel card">
            <h3 class="section-title">Estado de Cuenta — Ledger</h3>
            <div class="ledger-search">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" placeholder="Buscar líder" class="search-input" />
            </div>
            <div class="ledger-list">
              <div v-for="l in ledger" :key="l.nombre" class="ledger-item" :class="{ 'ledger-selected': ledgerSelected === l.nombre }" @click="ledgerSelected = l.nombre">
                <div class="ledger-avatar" :style="{ background: l.color }">{{ l.iniciales }}</div>
                <div class="ledger-info">
                  <span class="ledger-name">{{ l.nombre }}</span>
                  <span class="ledger-deuda" :class="l.deuda > 3000 ? 'deuda-alta' : ''">$ {{ l.deuda.toLocaleString() }}</span>
                </div>
              </div>
            </div>
            <div class="ledger-hint">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p>Selecciona un líder para ver su ledger</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const logo   = new URL('../../assets/logo-innovex.png', import.meta.url).href
const router = useRouter()
const cerrarSesion = () => { localStorage.removeItem('token'); router.push({ name: 'login' }) }
const ledgerSelected = ref('')
const pagos = ref([
  { id:1, lider:'Maria González',  fecha:'2025-02-15', monto:1500, referencia:'PAGO-MG-001', banco:'BCP',        estado:'Confirmado' },
  { id:2, lider:'Carlos Mendoza',  fecha:'2025-02-12', monto:800,  referencia:'PAGO-CM-002', banco:'BBVA',       estado:'Confirmado' },
  { id:3, lider:'Ana Torres',      fecha:'2025-02-18', monto:2000, referencia:'PAGO-AT-003', banco:'Interbank',  estado:'Pendiente'  },
  { id:4, lider:'Lucia Paredes',   fecha:'2025-02-10', monto:1200, referencia:'PAGO-LP-004', banco:'BCP',        estado:'Confirmado' },
  { id:5, lider:'Eduardo Flores',  fecha:'2025-02-17', monto:3500, referencia:'PAGO-EF-005', banco:'Scotiabank', estado:'Confirmado' },
])
const ledger = ref([
  { nombre:'Maria Gonzales',  iniciales:'MG', color:'#3b82f6', deuda:1200 },
  { nombre:'Carlos Mendoza',  iniciales:'CM', color:'#8b5cf6', deuda:3450 },
  { nombre:'Ana Torres',      iniciales:'AT', color:'#06b6d4', deuda:850  },
  { nombre:'Roberto Silva',   iniciales:'RS', color:'#8b5cf6', deuda:6209 },
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
.main-grid { display:grid; grid-template-columns:1fr 260px; gap:20px; align-items:flex-start; }
.left-col { display:flex; flex-direction:column; gap:20px; }
.kpi-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.kpi-card-d { background:#0f1b2d; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:6px; }
.kpi-d-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
.kpi-d-icon.red   { background:rgba(239,68,68,0.2); color:#ef4444; }
.kpi-d-icon.orange{ background:rgba(245,158,11,0.2); color:#f59e0b; }
.kpi-d-icon.green { background:rgba(34,197,94,0.2); color:#22c55e; }
.kpi-d-val   { font-size:22px; font-weight:700; color:white; }
.kpi-d-label { font-size:13px; font-weight:600; color:#7eb8e8; }
.kpi-d-sub   { font-size:11px; color:#4a6080; }
.card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.section-title { font-size:15px; font-weight:700; color:#1a1a1a; margin:0 0 3px; }
.section-sub   { font-size:11px; color:#999; margin:0 0 12px; }
.table-header-row { display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; }
.btn-primary { display:flex; align-items:center; gap:6px; padding:8px 14px; border:none; border-radius:8px; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); font-size:12px; font-weight:600; color:white; cursor:pointer; }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 14px; text-align:left; font-weight:600; font-size:12px; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table td { padding:10px 14px; vertical-align:middle; }
.td-lider { font-weight:600; color:#1a1a1a; }
.td-fecha { color:#888; font-size:12px; }
.td-monto { font-weight:700; color:#1a1a1a; }
.td-ref   { color:#4ab8f5; font-size:12px; }
.td-banco { font-weight:600; color:#333; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.est-confirmado { background:#dcfce7; color:#166534; }
.est-pendiente  { background:#fef3c7; color:#b45309; }
.ledger-panel { display:flex; flex-direction:column; gap:12px; }
.ledger-search { display:flex; align-items:center; gap:8px; background:#f4f6f9; border-radius:8px; padding:7px 12px; }
.ledger-list { display:flex; flex-direction:column; gap:8px; }
.ledger-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; cursor:pointer; transition:background 0.15s; border:1.5px solid transparent; }
.ledger-item:hover { background:#f8fafc; }
.ledger-item.ledger-selected { background:#eff6ff; border-color:#4ab8f5; }
.ledger-avatar { width:36px; height:36px; border-radius:50%; color:white; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ledger-info { display:flex; flex-direction:column; }
.ledger-name  { font-size:13px; font-weight:600; color:#1a1a1a; }
.ledger-deuda { font-size:12px; color:#f59e0b; font-weight:600; }
.deuda-alta   { color:#ef4444 !important; }
.ledger-hint  { display:flex; flex-direction:column; align-items:center; gap:6px; padding:20px 0; opacity:0.5; }
.ledger-hint p { font-size:12px; color:#888; text-align:center; margin:0; }
</style>