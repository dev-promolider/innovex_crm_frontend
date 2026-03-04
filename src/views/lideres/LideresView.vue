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
        <div class="topbar-left"><span class="breadcrumb">Inicio › <strong>Gestión</strong></span></div>
        <div class="topbar-center"><div class="search-box"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg><input type="text" placeholder="" class="search-input" /></div></div>
        <div class="topbar-right">
          <div class="user-info"><div class="user-avatar">A</div><div class="user-details"><span class="user-name">Admin</span><span class="user-email">maria9.l@gmail.com</span></div></div>
          <button class="notif-btn"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg><span class="notif-badge">1</span></button>
        </div>
      </header>

      <div class="page-body">
        <div class="page-header">
          <div>
            <h1 class="page-title">Gestión de Líderes</h1>
            <p class="page-subtitle">Administración de empresas registradas en la plataforma</p>
          </div>
          <button class="btn-primary">Invitar Líder (Generar PIN)</button>
        </div>

        <!-- Barra de búsqueda y filtros -->
        <div class="filters-bar">
          <div class="search-box search-wide">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="busqueda" placeholder="Buscar líder, Ruc..." class="search-input" />
          </div>
          <span class="filter-label-inline">Filtros:</span>
          <select v-model="filtroEstado" class="select-filter">
            <option value="todos">Todos</option>
            <option value="Activo">Activo</option>
            <option value="Suspendida">Suspendida</option>
          </select>
          <select v-model="filtroConfianza" class="select-filter">
            <option value="todos">Todos</option>
            <option value="Alto">Alto</option>
            <option value="Medio">Medio</option>
            <option value="Bajo">Bajo</option>
          </select>
          <select v-model="filtroDeuda" class="select-filter">
            <option value="todos">Toda deuda</option>
            <option value="con">Con deuda</option>
            <option value="sin">Sin deuda</option>
          </select>
          <span class="result-count">{{ lideresFiltrados.length }} resultados</span>
        </div>

        <!-- Tabla -->
        <div class="table-card">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Líder</th>
                  <th>DNI</th>
                  <th>Nivel Confianza</th>
                  <th>Biometría</th>
                  <th>Kits</th>
                  <th>Ventas/Mes</th>
                  <th>Deuda Pendiente</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in lideresFiltrados" :key="l.id">
                  <td>
                    <div class="lider-info">
                      <div class="lider-avatar" :style="{ background: l.color }">{{ l.iniciales }}</div>
                      <div>
                        <div class="lider-name">{{ l.nombre }}</div>
                        <div class="lider-email">{{ l.email }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="td-dni">{{ l.dni }}</td>
                  <td>
                    <div class="confianza">
                      <span class="dot" :class="'dot-' + l.confianza.toLowerCase()"></span>
                      {{ l.confianza }}
                    </div>
                  </td>
                  <td><span class="badge" :class="'bio-' + l.biometria.toLowerCase()">{{ l.biometria }}</span></td>
                  <td class="td-center">{{ l.kits }}</td>
                  <td class="td-ventas">$ {{ l.ventas.toLocaleString() }}</td>
                  <td class="td-deuda" :class="{ 'deuda-alta': l.deuda > 3000 }">$ {{ l.deuda.toLocaleString() }}</td>
                  <td><span class="badge" :class="'est-' + l.estado.toLowerCase()">{{ l.estado }}</span></td>
                  <td>
                    <div class="acciones">
                      <button class="acc-btn" title="Ver"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#4ab8f5" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                      <button class="acc-btn" title="Documentos"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#64748b" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></button>
                      <button class="acc-btn" title="Bloquear"><svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg></button>
                    </div>
                  </td>
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

const busqueda      = ref('')
const filtroEstado  = ref('todos')
const filtroConfianza = ref('todos')
const filtroDeuda   = ref('todos')

const lideres = ref([
  { id:1, nombre:'Maria González',  email:'mariag@ejemplo.com',  iniciales:'MG', color:'#3b82f6', dni:'12345678', confianza:'Alto',  biometria:'Verificado', kits:12, ventas:8450,  deuda:1200, estado:'Activo' },
  { id:2, nombre:'Carlos Mendoza',  email:'carlosm@ejemplo.com', iniciales:'CM', color:'#8b5cf6', dni:'87654321', confianza:'Medio', biometria:'Pendiente',  kits:8,  ventas:5200,  deuda:3450, estado:'Activo' },
  { id:3, nombre:'Ana Torres',      email:'anat@ejemplo.com',    iniciales:'AT', color:'#3b82f6', dni:'11223344', confianza:'Alto',  biometria:'Verificado', kits:15, ventas:12300, deuda:850,  estado:'Activo' },
  { id:4, nombre:'Roberto Silva',   email:'robertos@ejemplo.com',iniciales:'RS', color:'#8b5cf6', dni:'55667788', confianza:'Bajo',  biometria:'Rechazado',  kits:3,  ventas:1800,  deuda:6200, estado:'Suspendida' },
  { id:5, nombre:'Lucía Paredes',   email:'luciap@ejemplo.com',  iniciales:'LP', color:'#3b82f6', dni:'99887766', confianza:'Medio', biometria:'Verificado', kits:10, ventas:7100,  deuda:2100, estado:'Activo' },
  { id:6, nombre:'Diego Herrera',   email:'diegoh@ejemplo.com',  iniciales:'DH', color:'#8b5cf6', dni:'44332211', confianza:'Alto',  biometria:'Verificado', kits:18, ventas:15600, deuda:450,  estado:'Activo' },
  { id:7, nombre:'Sofia Rios',      email:'sofiar@ejemplo.com',  iniciales:'SR', color:'#8b5cf6', dni:'22334455', confianza:'Medio', biometria:'Pendiente',  kits:6,  ventas:3900,  deuda:1800, estado:'Activo' },
  { id:8, nombre:'Eduardo Flores',  email:'eduardof@ejemplo.com',iniciales:'EF', color:'#8b5cf6', dni:'66778899', confianza:'Alto',  biometria:'Verificado', kits:14, ventas:11200, deuda:0,    estado:'Activo' },
])

const lideresFiltrados = computed(() => lideres.value.filter(l => {
  const matchBusqueda   = l.nombre.toLowerCase().includes(busqueda.value.toLowerCase()) || l.dni.includes(busqueda.value)
  const matchEstado     = filtroEstado.value === 'todos' || l.estado === filtroEstado.value
  const matchConfianza  = filtroConfianza.value === 'todos' || l.confianza === filtroConfianza.value
  const matchDeuda      = filtroDeuda.value === 'todos' || (filtroDeuda.value === 'con' ? l.deuda > 0 : l.deuda === 0)
  return matchBusqueda && matchEstado && matchConfianza && matchDeuda
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
.page-body { padding:24px 28px; display:flex; flex-direction:column; gap:20px; }
.page-header { display:flex; align-items:center; justify-content:space-between; }
.page-title { font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
.page-subtitle { font-size:13px; color:#999; margin:0; }
.btn-primary { padding:9px 18px; border:none; border-radius:8px; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); font-size:13px; font-weight:600; color:white; cursor:pointer; }

.filters-bar { display:flex; align-items:center; gap:10px; background:white; border-radius:12px; padding:12px 16px; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex-wrap:wrap; }
.search-wide { width:220px; }
.filter-label-inline { font-size:13px; color:#888; font-weight:600; }
.select-filter { border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; font-size:13px; color:#444; outline:none; cursor:pointer; background:white; }
.select-filter:focus { border-color:#4ab8f5; }
.result-count { margin-left:auto; font-size:13px; color:#666; font-weight:600; }

.table-card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 14px; text-align:left; font-weight:600; font-size:12px; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table td { padding:10px 14px; vertical-align:middle; }

.lider-info { display:flex; align-items:center; gap:10px; }
.lider-avatar { width:36px; height:36px; border-radius:50%; color:white; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.lider-name { font-weight:600; color:#1a1a1a; font-size:13px; }
.lider-email { font-size:11px; color:#999; }
.td-dni { color:#666; font-size:12px; }
.confianza { display:flex; align-items:center; gap:6px; font-size:13px; }
.dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.dot-alto  { background:#22c55e; }
.dot-medio { background:#f59e0b; }
.dot-bajo  { background:#ef4444; }
.td-center { text-align:center; font-weight:600; }
.td-ventas { font-weight:600; color:#1a1a1a; }
.td-deuda  { font-weight:600; color:#f59e0b; }
.deuda-alta { color:#ef4444 !important; }

.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.bio-verificado  { background:#dcfce7; color:#166534; }
.bio-pendiente   { background:#fef3c7; color:#b45309; }
.bio-rechazado   { background:#fee2e2; color:#991b1b; }
.est-activo      { background:#dcfce7; color:#166534; }
.est-suspendida  { background:#fee2e2; color:#991b1b; }

.acciones { display:flex; gap:6px; }
.acc-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:4px; transition:background 0.15s; }
.acc-btn:hover { background:#f1f5f9; }

.table-footer { display:flex; align-items:center; justify-content:space-between; margin-top:16px; padding-top:14px; border-top:1px solid #f0f0f0; }
.table-count { font-size:12px; color:#999; }
.pagination { display:flex; gap:6px; }
.page-btn { padding:5px 12px; border:1px solid #ddd; border-radius:6px; background:white; font-size:12px; cursor:pointer; color:#555; }
.page-btn:hover { border-color:#4ab8f5; color:#4ab8f5; }
.page-btn.active { background:#1a6ab5; color:white; border-color:#1a6ab5; }
</style>