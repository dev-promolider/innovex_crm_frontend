<template>
  <div class="dashboard-layout">

    <!-- ── Sidebar ── -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <img :src="logo" alt="Innovex" class="sidebar-logo-img" />
        
      </div>

      <nav class="sidebar-nav">
        <a href="#" class="nav-item active" title="Dashboard">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
        </a>
        <a href="#" class="nav-item" title="Productos">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
          </svg>
        </a>
        <a href="#" class="nav-item" title="Líderes">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        </a>
        <a href="#" class="nav-item" title="Tareas">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 11 12 14 22 4"/>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
        </a>
        <a href="#" class="nav-item" title="Reportes">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </a>
        <a href="#" class="nav-item" title="Pagos">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
            <line x1="1" y1="10" x2="23" y2="10"/>
          </svg>
        </a>
        <a href="#" class="nav-item" title="Kits">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
          </svg>
        </a>
        <a href="#" class="nav-item" title="Inventario">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
            <line x1="8" y1="18" x2="21" y2="18"/>
            <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
            <line x1="3" y1="18" x2="3.01" y2="18"/>
          </svg>
        </a>
      </nav>

      <div class="sidebar-bottom">
        <a href="#" class="nav-item" title="Configuración">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M19.07 4.93A10 10 0 1 1 4.93 19.07"/>
          </svg>
        </a>
        <a href="#" class="nav-item nav-logout" title="Cerrar Sesión" @click.prevent="cerrarSesion">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16 17 21 12 16 7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
        </a>
      </div>
    </aside>

    <!-- ── Contenido principal ── -->
    <main class="main-content">

      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left">
          <span class="breadcrumb">Inicio › <strong>Dashboard</strong></span>
        </div>
        <div class="topbar-center">
          <div class="search-box">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" placeholder="Buscar..." class="search-input" />
          </div>
        </div>
        <div class="topbar-right">
          <div class="user-info">
            <div class="user-avatar">A</div>
            <div class="user-details">
              <span class="user-name">Admin</span>
              <span class="user-email">maria9.l@gmail.com</span>
            </div>
          </div>
          <button class="notif-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            </svg>
            <span class="notif-badge">1</span>
          </button>
        </div>
      </header>

      <!-- Página -->
      <div class="page-body">

        <!-- Encabezado -->
        <div class="page-header">
          <div>
            <h1 class="page-title">Dashboard Principal</h1>
            <p class="page-subtitle">Resumen ejecutivo — Febrero 2025</p>
          </div>
          <div class="page-actions">
            <button class="btn-outline">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/>
              </svg>
              Actualizar
            </button>
            <button class="btn-primary">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Exportar
            </button>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-blue">
            <div class="kpi-info">
              <span class="kpi-label">Ventas Validadas del Mes</span>
              <span class="kpi-value">$ 48,300</span>
            </div>
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
          </div>
          <div class="kpi-card kpi-orange">
            <div class="kpi-info">
              <span class="kpi-label">Ventas Pendientes Validación</span>
              <span class="kpi-value">23 ventas</span>
            </div>
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
          </div>
          <div class="kpi-card kpi-red">
            <div class="kpi-info">
              <span class="kpi-label">Deuda Total de Líderes</span>
              <span class="kpi-value">$ 15,600</span>
            </div>
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
                <polyline points="17 18 23 18 23 12"/>
              </svg>
            </div>
          </div>
          <div class="kpi-card kpi-dark">
            <div class="kpi-info">
              <span class="kpi-label">Líderes Activos</span>
              <span class="kpi-value">7 líderes</span>
            </div>
            <div class="kpi-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
          </div>
        </div>

        <!-- Charts row -->
        <div class="charts-row">
          <!-- Evolución de ventas -->
          <div class="chart-card chart-main">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Evolución de Ventas</h3>
                <p class="chart-subtitle">Validadas vs Pendientes — últimos 6 meses</p>
              </div>
              <div class="chart-filters">
                <button class="filter-btn">3m</button>
                <button class="filter-btn">6m</button>
                <button class="filter-btn active">12m</button>
              </div>
            </div>
            <div class="chart-area">
              <svg viewBox="0 0 520 180" width="100%" height="180" xmlns="http://www.w3.org/2000/svg">
                <!-- Grid lines -->
                <line x1="40" y1="20" x2="510" y2="20" stroke="#eee" stroke-width="1"/>
                <line x1="40" y1="55" x2="510" y2="55" stroke="#eee" stroke-width="1"/>
                <line x1="40" y1="90" x2="510" y2="90" stroke="#eee" stroke-width="1"/>
                <line x1="40" y1="125" x2="510" y2="125" stroke="#eee" stroke-width="1"/>
                <line x1="40" y1="160" x2="510" y2="160" stroke="#eee" stroke-width="1"/>
                <!-- Y labels -->
                <text x="35" y="24" text-anchor="end" font-size="10" fill="#aaa">60,000</text>
                <text x="35" y="59" text-anchor="end" font-size="10" fill="#aaa">50,000</text>
                <text x="35" y="94" text-anchor="end" font-size="10" fill="#aaa">40,000</text>
                <text x="35" y="129" text-anchor="end" font-size="10" fill="#aaa">20,000</text>
                <text x="35" y="164" text-anchor="end" font-size="10" fill="#aaa">0</text>
                <!-- Line chart -->
                <polyline
                  points="60,110 135,92 210,99 285,83 360,70 435,61 510,31"
                  fill="none" stroke="#2563eb" stroke-width="2.5" stroke-linejoin="round"/>
                <!-- Area fill -->
                <polygon
                  points="60,110 135,92 210,99 285,83 360,70 435,61 510,31 510,155 60,155"
                  fill="url(#blueGrad)" opacity="0.15"/>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#2563eb" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#2563eb" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <!-- Dots -->
                <circle cx="60"  cy="110" r="4" fill="white" stroke="#2563eb" stroke-width="2"/>
                <circle cx="135" cy="92" r="4" fill="white" stroke="#2563eb" stroke-width="2"/>
                <circle cx="210" cy="99" r="4" fill="white" stroke="#2563eb" stroke-width="2"/>
                <circle cx="285" cy="83"  r="4" fill="white" stroke="#2563eb" stroke-width="2"/>
                <circle cx="360" cy="70" r="4" fill="white" stroke="#2563eb" stroke-width="2"/>
                <circle cx="435" cy="61"  r="4" fill="white" stroke="#2563eb" stroke-width="2"/>
                <circle cx="510" cy="31"  r="4" fill="#2563eb" stroke="#2563eb" stroke-width="2"/>
                <!-- X labels -->
                <text x="60"  y="175" text-anchor="middle" font-size="10" fill="#aaa">Sep</text>
                <text x="135" y="175" text-anchor="middle" font-size="10" fill="#aaa">Oct</text>
                <text x="210" y="175" text-anchor="middle" font-size="10" fill="#aaa">Nov</text>
                <text x="285" y="175" text-anchor="middle" font-size="10" fill="#aaa">Dic</text>
                <text x="360" y="175" text-anchor="middle" font-size="10" fill="#aaa">Ene</text>
                <text x="435" y="175" text-anchor="middle" font-size="10" fill="#aaa">Feb</text>
              </svg>
            </div>
          </div>

          <!-- Por Campaña -->
          <div class="chart-card chart-side">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Por Campaña</h3>
                <p class="chart-subtitle">Top 5 campañas activas</p>
              </div>
            </div>
            <div class="donut-wrap">
              <svg viewBox="0 0 140 140" width="130" height="130">
                <!-- Donut segments -->
                <circle cx="70" cy="70" r="50" fill="none" stroke="#e8f0fe" stroke-width="22"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#93c5fd" stroke-width="22"
                  stroke-dasharray="94.2 220" stroke-dashoffset="0" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#60a5fa" stroke-width="22"
                  stroke-dasharray="34.6 220" stroke-dashoffset="-94.2" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#3b82f6" stroke-width="22"
                  stroke-dasharray="59.7 220" stroke-dashoffset="-128.8" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#1d4ed8" stroke-width="22"
                  stroke-dasharray="44.0 220" stroke-dashoffset="-188.5" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#1e3a8a" stroke-width="22"
                  stroke-dasharray="78.5 220" stroke-dashoffset="-232.5" transform="rotate(-90 70 70)"/>
                <text x="70" y="74" text-anchor="middle" font-size="11" font-weight="700" fill="#333">100%</text>
              </svg>
            </div>
            <div class="legend">
              <div class="legend-item"><span class="legend-dot" style="background:#93c5fd"></span><span class="legend-label">Bienestar Total</span><span class="legend-pct">30%</span></div>
              <div class="legend-item"><span class="legend-dot" style="background:#60a5fa"></span><span class="legend-label">Belleza Esencial</span><span class="legend-pct">11%</span></div>
              <div class="legend-item"><span class="legend-dot" style="background:#3b82f6"></span><span class="legend-label">Verano Premium</span><span class="legend-pct">19%</span></div>
              <div class="legend-item"><span class="legend-dot" style="background:#1d4ed8"></span><span class="legend-label">Fuerza Natural</span><span class="legend-pct">14%</span></div>
              <div class="legend-item"><span class="legend-dot" style="background:#1e3a8a"></span><span class="legend-label">Primavera 2024</span><span class="legend-pct">25%</span></div>
            </div>
          </div>
        </div>

        <!-- Actividad Reciente -->
        <div class="table-card">
          <div class="table-header">
            <div>
              <h3 class="chart-title">Actividad Reciente</h3>
              <p class="chart-subtitle">Últimos 10 eventos del sistema</p>
            </div>
            <button class="btn-outline">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              Filtrar
            </button>
          </div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Líder</th>
                  <th>Acción</th>
                  <th>Descripción</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in tableData" :key="row.id">
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
            <span class="table-count">Mostrando 1 a 10 de 158 resultados</span>
            <div class="pagination">
              <button class="page-btn">Anterior</button>
              <button class="page-btn active">1</button>
              <button class="page-btn">2</button>
              <button class="page-btn">3</button>
              <button class="page-btn">Siguiente</button>
            </div>
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const logo   = new URL('../../assets/logo-innovex.png', import.meta.url).href
const router = useRouter()

const cerrarSesion = () => {
  localStorage.removeItem('token')
  router.push({ name: 'login' })
}

const tableData = [
  { id:1,  time:'2025-02-18 10:45', leader:'María González Gómez', action:'Solicitud Kit', actionType:'kit',   description:'Kit Bienestar Básico x3',        status:'Aprobado',     statusType:'aprobado' },
  { id:2,  time:'2025-02-18 10:23', leader:'Ana Torres',           action:'Venta',        actionType:'venta',  description:'Kit Bienestar Premium - S/.210', status:'Validado',     statusType:'validado' },
  { id:3,  time:'2025-02-18 09:55', leader:'Carlos Mendoza',       action:'Pago',         actionType:'pago',   description:'Abono deuda S/.800 - BBVA',      status:'Confirmado',   statusType:'confirmado' },
  { id:4,  time:'2025-02-18 09:30', leader:'Diego Herrera',        action:'Venta',        actionType:'venta',  description:'Kit Belleza Elite - S/.330',     status:'Pendiente',    statusType:'pendiente' },
  { id:5,  time:'2025-02-17 17:15', leader:'Lucía Paredes',        action:'Solicitud Kit',actionType:'kit',    description:'Kit Belleza Noche x5',           status:'Solicitud Kit',statusType:'kit' },
  { id:6,  time:'2025-02-17 16:48', leader:'Roberto Silva',        action:'Venta',        actionType:'venta',  description:'Kit Bienestar Básico - S/.120',  status:'Venta',        statusType:'venta' },
  { id:7,  time:'2025-02-17 15:22', leader:'Eduardo Flores',       action:'Pago',         actionType:'pago',   description:'Abono deuda S/.3600 - Scotiabank',status:'Pago',        statusType:'pago' },
  { id:8,  time:'2025-02-17 14:10', leader:'Sofía Ríos',           action:'Solicitud Kit',actionType:'kit',    description:'Kit Bienestar Básico x2',        status:'Solicitud Kit',statusType:'kit' },
  { id:9,  time:'2025-02-17 13:05', leader:'Ana Torres',           action:'Venta',        actionType:'venta',  description:'Kit Bienestar Básico - S/.120',  status:'Venta',        statusType:'venta' },
  { id:10, time:'2025-02-17 11:30', leader:'María González',       action:'Venta',        actionType:'venta',  description:'Kit Belleza Día - S/.95',        status:'Venta',        statusType:'venta' },
]
</script>

<style>
html, body, #app {
  margin: 0 !important;
  padding: 0 !important;
  height: 100% !important;
  background: #f4f6f9 !important;
  font-family: 'Segoe UI', Arial, sans-serif;
}
</style>

<style scoped>
/* ── Layout ── */
.dashboard-layout {
  display: flex;
  min-height: 100vh;
  background: #f4f6f9;
}

/* ── Sidebar ── */
.sidebar {
  width: 68px;
  background: #0f1b2d;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 14px 0;
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  z-index: 100;
  border-right: 1px solid #1a2d45;
}

.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  margin-bottom: 10px;
  padding-bottom: 12px;
  border-bottom: 1px solid #1a2d45;
  width: 100%;
  justify-content: center;
}

.sidebar-logo-img {
  width: 38px;
  height: 38px;
  object-fit: contain;
}

.sidebar-brand {
  font-size: 7px;
  color: #4ab8f5;
  font-weight: 700;
  letter-spacing: 1.5px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  width: 100%;
  align-items: center;
  padding: 8px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  color: #4a6080;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
  position: relative;
}

.nav-item:hover {
  background: #162236;
  color: #7eb8e8;
}

.nav-item.active {
  background: #1a3a5c;
  color: #4ab8f5;
  box-shadow: 0 0 0 1px rgba(74,184,245,0.2);
}

.nav-item.nav-logout {
  color: #ef4444;
}

.nav-item.nav-logout:hover {
  background: #2a1010;
  color: #f87171;
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  padding-bottom: 12px;
  width: 100%;
}

/* ── Main ── */
.main-content {
  margin-left: 68px;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* ── Topbar ── */
.topbar {
  background: white;
  height: 56px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  gap: 16px;
  border-bottom: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 50;
}

.topbar-left { min-width: 160px; }

.breadcrumb {
  font-size: 13px;
  color: #999;
}

.breadcrumb strong { color: #333; }

.topbar-center { flex: 1; display: flex; justify-content: center; }

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f6f9;
  border-radius: 20px;
  padding: 6px 14px;
  width: 280px;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #333;
  width: 100%;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 200px;
  justify-content: flex-end;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4ab8f5, #1a6ab5);
  color: white;
  font-weight: 700;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name { font-size: 13px; font-weight: 600; color: #333; }
.user-email { font-size: 11px; color: #999; }

.notif-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 6px;
}

.notif-badge {
  position: absolute;
  top: 2px; right: 2px;
  background: #ef4444;
  color: white;
  font-size: 9px;
  width: 14px; height: 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ── Page body ── */
.page-body {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.page-actions { display: flex; gap: 10px; }

.btn-outline {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: 1.5px solid #d0d0d0;
  border-radius: 8px;
  background: white;
  font-size: 13px;
  font-weight: 600;
  color: #444;
  cursor: pointer;
  transition: border-color 0.2s;
}

.btn-outline:hover { border-color: #4ab8f5; color: #4ab8f5; }

.btn-primary {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #4ab8f5, #1a6ab5);
  font-size: 13px;
  font-weight: 600;
  color: white;
  cursor: pointer;
}

/* ── KPI Cards ── */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  border-radius: 12px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
}

.kpi-blue   { background: linear-gradient(135deg, #1a6ab5, #2563eb); }
.kpi-orange { background: linear-gradient(135deg, #d97706, #f59e0b); }
.kpi-red    { background: linear-gradient(135deg, #b91c1c, #ef4444); border: 2px solid #fca5a5; }
.kpi-dark   { background: linear-gradient(135deg, #1f2937, #374151); }

.kpi-label {
  font-size: 11px;
  opacity: 0.85;
  display: block;
  margin-bottom: 8px;
}

.kpi-value {
  font-size: 22px;
  font-weight: 700;
  display: block;
}

.kpi-icon { opacity: 0.7; }

/* ── Charts ── */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 16px;
}

.chart-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 3px;
}

.chart-subtitle {
  font-size: 11px;
  color: #999;
  margin: 0;
}

.chart-filters { display: flex; gap: 4px; }

.filter-btn {
  padding: 4px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 11px;
  cursor: pointer;
  color: #666;
}

.filter-btn.active {
  background: #1a6ab5;
  color: white;
  border-color: #1a6ab5;
}

/* Donut chart */
.donut-wrap {
  display: flex;
  justify-content: center;
  margin: 10px 0;
}

.legend {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-label { flex: 1; color: #555; }
.legend-pct { font-weight: 700; color: #333; }

/* ── Table ── */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.table-wrap { overflow-x: auto; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead tr {
  background: #1a1a2e;
  color: white;
}

.data-table th {
  padding: 10px 14px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
  letter-spacing: 0.3px;
}

.data-table tbody tr {
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

.data-table tbody tr:hover { background: #f8fafc; }

.data-table td {
  padding: 10px 14px;
  vertical-align: middle;
}

.td-time  { color: #888; font-size: 12px; white-space: nowrap; }
.td-leader { font-weight: 600; color: #222; }
.td-desc  { color: #555; font-size: 12px; }

/* Badges */
.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-venta      { background: #dbeafe; color: #1d4ed8; }
.badge-pago       { background: #fef9c3; color: #92400e; }
.badge-kit        { background: #dcfce7; color: #166534; }
.badge-aprobado   { background: #dcfce7; color: #166534; }
.badge-validado   { background: #e0f2fe; color: #0369a1; }
.badge-confirmado { background: #dbeafe; color: #1e40af; }
.badge-pendiente  { background: #fef3c7; color: #b45309; }

/* Pagination */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.table-count { font-size: 12px; color: #999; }

.pagination { display: flex; gap: 6px; }

.page-btn {
  padding: 5px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  color: #555;
  transition: all 0.2s;
}

.page-btn:hover  { border-color: #4ab8f5; color: #4ab8f5; }
.page-btn.active { background: #1a6ab5; color: white; border-color: #1a6ab5; }
</style>