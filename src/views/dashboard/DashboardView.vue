<template>
  <div class="dashboard-layout">

    <!-- ── SIDEBAR ── -->
    <aside class="sidebar" :class="{ 'sidebar-open': sidebarOpen }">
      <div class="sidebar-logo">
        <img :src="logo" alt="Blanco" class="sidebar-logo-img" />
      </div>

      <div class="sidebar-section-label">General</div>
      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
          <span>Dashboard</span>
        </RouterLink>
        <RouterLink to="/campanas" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
          <span>Campañas y Kits</span>
        </RouterLink>
        <RouterLink to="/lideres" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <span>Aprobación de Distribuidores</span>
        </RouterLink>
        <RouterLink to="/validacion" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
          <span>Validación Ventas</span>
        </RouterLink>
        <RouterLink to="/inventario" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          <span>Inventario Central</span>
        </RouterLink>
        <RouterLink to="/deudas" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          <span>Deudas y Cobranzas</span>
        </RouterLink>
        <RouterLink to="/recompensas" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          <span>Recompensas</span>
        </RouterLink>
        <RouterLink to="/reportes" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
          <span>Reportes</span>
        </RouterLink>
        <RouterLink to="/contratos" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          <span>Contratos Digitales</span>
        </RouterLink>
      </nav>

      <div class="sidebar-section-label ajustes-label">Ajustes</div>
      <div class="sidebar-bottom">
        <RouterLink to="/configuracion" class="nav-item" active-class="active" @click="closeSidebar">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93A10 10 0 0 0 4.93 19.07M19.07 4.93A10 10 0 1 1 4.93 19.07"/></svg>
          <span>Configuración</span>
        </RouterLink>
        <a href="#" class="nav-item nav-logout" @click.prevent="cerrarSesion">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          <span>Sesión</span>
        </a>
      </div>
    </aside>

    <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeSidebar"></div>

    <!-- ── MAIN ── -->
    <main class="main-content">

      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-btn" @click="sidebarOpen = !sidebarOpen">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
          </button>
          <span class="breadcrumb">Inicio · <strong>Dashboard</strong></span>
        </div>
        <div class="topbar-center">
          <div class="search-box">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#aaa" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Buscar..." class="search-input" />
          </div>
        </div>
        <div class="topbar-right">
          <div class="user-info">
            <div class="user-avatar">
              <img :src="logo" alt="A" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
            </div>
            <div class="user-details">
              <span class="user-name">Admin</span>
              <span class="user-email">maria9.l@gmail.com</span>
            </div>
          </div>
          <button class="notif-btn">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="notif-badge">1</span>
          </button>
        </div>
      </header>

      <div class="page-body">

        <div class="page-header">
          <div>
            <h1 class="page-title">Dashboard Principal</h1>
            <p class="page-subtitle">Resumen ejecutivo — Febrero 2025</p>
          </div>
          <div class="page-actions">
            <button class="btn-outline">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
              Actualizar
            </button>
            <button class="btn-primary">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Exportar
            </button>
          </div>
        </div>

        <!-- KPI -->
        <div class="kpi-grid">
          <div class="kpi-card kpi-blue">
            <div class="kpi-info">
              <span class="kpi-label">Ventas Validadas del Mes</span>
              <span class="kpi-value">$ 48,300</span>
            </div>
            <div class="kpi-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>
          </div>
          <div class="kpi-card kpi-orange">
            <div class="kpi-info">
              <span class="kpi-label">Ventas Pendientes Validación</span>
              <span class="kpi-value">23 ventas</span>
            </div>
            <div class="kpi-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
          </div>
          <div class="kpi-card kpi-red">
            <div class="kpi-info">
              <span class="kpi-label">Deuda Total de Líderes</span>
              <span class="kpi-value">$ 15,600</span>
            </div>
            <div class="kpi-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg></div>
          </div>
          <div class="kpi-card kpi-dark">
            <div class="kpi-info">
              <span class="kpi-label">Líderes Activos</span>
              <span class="kpi-value">7 líderes</span>
            </div>
            <div class="kpi-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-row">
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
            <svg viewBox="0 0 520 180" width="100%" height="180" preserveAspectRatio="none">
              <line x1="40" y1="10"  x2="510" y2="10"  stroke="#f0f0f0" stroke-width="1"/>
              <line x1="40" y1="46"  x2="510" y2="46"  stroke="#f0f0f0" stroke-width="1"/>
              <line x1="40" y1="82"  x2="510" y2="82"  stroke="#f0f0f0" stroke-width="1"/>
              <line x1="40" y1="118" x2="510" y2="118" stroke="#f0f0f0" stroke-width="1"/>
              <line x1="40" y1="154" x2="510" y2="154" stroke="#f0f0f0" stroke-width="1"/>
              <text x="35" y="14"  text-anchor="end" font-size="9" fill="#bbb">80,000</text>
              <text x="35" y="50"  text-anchor="end" font-size="9" fill="#bbb">60,000</text>
              <text x="35" y="86"  text-anchor="end" font-size="9" fill="#bbb">40,000</text>
              <text x="35" y="122" text-anchor="end" font-size="9" fill="#bbb">20,000</text>
              <text x="35" y="158" text-anchor="end" font-size="9" fill="#bbb">0</text>
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.18"/>
                  <stop offset="100%" stop-color="#3b82f6" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <polygon points="60,130 135,110 210,118 285,95 360,78 435,60 510,20 510,154 60,154" fill="url(#chartGrad)"/>
              <polyline points="60,130 135,110 210,118 285,95 360,78 435,60 510,20" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round"/>
              <circle cx="60"  cy="130" r="3.5" fill="white" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="135" cy="110" r="3.5" fill="white" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="210" cy="118" r="3.5" fill="white" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="285" cy="95"  r="3.5" fill="white" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="360" cy="78"  r="3.5" fill="white" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="435" cy="60"  r="3.5" fill="white" stroke="#3b82f6" stroke-width="2"/>
              <circle cx="510" cy="20"  r="3.5" fill="#3b82f6" stroke="#3b82f6" stroke-width="2"/>
              <text x="60"  y="172" text-anchor="middle" font-size="9" fill="#bbb">Sep</text>
              <text x="135" y="172" text-anchor="middle" font-size="9" fill="#bbb">Oct</text>
              <text x="210" y="172" text-anchor="middle" font-size="9" fill="#bbb">Nov</text>
              <text x="285" y="172" text-anchor="middle" font-size="9" fill="#bbb">Dic</text>
              <text x="360" y="172" text-anchor="middle" font-size="9" fill="#bbb">Ene</text>
              <text x="435" y="172" text-anchor="middle" font-size="9" fill="#bbb">Feb</text>
            </svg>
          </div>

          <div class="chart-card chart-side">
            <div class="chart-header">
              <div>
                <h3 class="chart-title">Por Campaña</h3>
                <p class="chart-subtitle">Top 5 campañas activas</p>
              </div>
            </div>
            <div class="donut-wrap">
              <svg viewBox="0 0 140 140" width="120" height="120">
                <circle cx="70" cy="70" r="50" fill="none" stroke="#e8f0fe" stroke-width="20"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#93c5fd" stroke-width="20" stroke-dasharray="94.2 220" stroke-dashoffset="0" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#60a5fa" stroke-width="20" stroke-dasharray="34.6 220" stroke-dashoffset="-94.2" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#3b82f6" stroke-width="20" stroke-dasharray="59.7 220" stroke-dashoffset="-128.8" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#1d4ed8" stroke-width="20" stroke-dasharray="44.0 220" stroke-dashoffset="-188.5" transform="rotate(-90 70 70)"/>
                <circle cx="70" cy="70" r="50" fill="none" stroke="#1e3a8a" stroke-width="20" stroke-dasharray="78.5 220" stroke-dashoffset="-232.5" transform="rotate(-90 70 70)"/>
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

        <!-- Tabla -->
        <div class="table-card">
          <div class="table-header">
            <div>
              <h3 class="chart-title">Actividad Reciente</h3>
              <p class="chart-subtitle">Últimos 10 eventos del sistema</p>
            </div>
            <button class="btn-outline">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              Filtrar
            </button>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr><th>Timestamp</th><th>Líder</th><th>Acción</th><th>Descripción</th><th>Acción</th></tr>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const logo        = new URL('../../assets/logo-blanco.png', import.meta.url).href

const router      = useRouter()
const sidebarOpen = ref(false)
const closeSidebar  = () => { sidebarOpen.value = false }
const cerrarSesion  = () => { localStorage.removeItem('token'); router.push({ name: 'login' }) }

const tableData = [
  { id:1,  time:'2025-02-18 10:45', leader:'María González Gómez', action:'Solicitud Kit', actionType:'kit',   description:'Kit Bienestar Básico x3',          status:'Aprobado',      statusType:'aprobado'   },
  { id:2,  time:'2025-02-18 10:23', leader:'Ana Torres',           action:'Venta',         actionType:'venta', description:'Kit Bienestar Premium - S/.210',   status:'Validado',      statusType:'validado'   },
  { id:3,  time:'2025-02-18 09:55', leader:'Carlos Mendoza',       action:'Pago',          actionType:'pago',  description:'Abono deuda S/.800 - BBVA',        status:'Confirmado',    statusType:'confirmado' },
  { id:4,  time:'2025-02-18 09:30', leader:'Diego Herrera',        action:'Venta',         actionType:'venta', description:'Kit Belleza Elite - S/.330',       status:'Pendiente',     statusType:'pendiente'  },
  { id:5,  time:'2025-02-17 17:15', leader:'Lucía Paredes',        action:'Solicitud Kit', actionType:'kit',   description:'Kit Belleza Noche x5',             status:'Solicitud Kit', statusType:'kit'        },
  { id:6,  time:'2025-02-17 16:48', leader:'Roberto Silva',        action:'Venta',         actionType:'venta', description:'Kit Bienestar Básico - S/.120',    status:'Venta',         statusType:'venta'      },
  { id:7,  time:'2025-02-17 15:22', leader:'Eduardo Flores',       action:'Pago',          actionType:'pago',  description:'Abono deuda S/.3600 - Scotiabank', status:'Pago',          statusType:'pago'       },
  { id:8,  time:'2025-02-17 14:10', leader:'Sofía Ríos',           action:'Solicitud Kit', actionType:'kit',   description:'Kit Bienestar Básico x2',          status:'Solicitud Kit', statusType:'kit'        },
  { id:9,  time:'2025-02-17 13:05', leader:'Ana Torres',           action:'Venta',         actionType:'venta', description:'Kit Bienestar Básico - S/.120',    status:'Venta',         statusType:'venta'      },
  { id:10, time:'2025-02-17 11:30', leader:'María González',       action:'Venta',         actionType:'venta', description:'Kit Belleza Día - S/.95',          status:'Venta',         statusType:'venta'      },
]
</script>

<style scoped>
.dashboard-layout {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #f0f2f5;
  overflow-x: hidden;
}

/* ── SIDEBAR ── */
.sidebar {
  width: 145px;
  min-width: 145px;
  background: #000000;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0;
  height: 100vh;
  z-index: 300;
  overflow-y: auto;
  overflow-x: hidden;
  transition: transform 0.25s ease;
  scrollbar-width: none;
}
.sidebar::-webkit-scrollbar { display: none; }

.sidebar-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 10px 16px;
  border-bottom: 1px solid #000;
  gap: 8px;
}
.sidebar-logo-img { width: 90px; height: 90px; object-fit: contain; display: block; }

.sidebar-section-label {
  font-size: 9px; font-weight: 700; color:   #a4b4bc;
  letter-spacing: 1.5px; text-transform: uppercase;
  padding: 12px 12px 4px;
}
.ajustes-label { margin-top: auto; }
.sidebar-nav    { display: flex; flex-direction: column; gap: 1px; padding: 4px 6px; }
.sidebar-bottom { display: flex; flex-direction: column; gap: 1px; padding: 4px 6px 16px; }

.nav-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 8px; border-radius: 7px;
  color:  #a4b4bc ; text-decoration: none;
  font-size: 11px; font-weight: 500;
  transition: background 0.15s, color 0.15s;
  white-space: normal; line-height: 1.3;
  overflow: hidden;
}
.nav-item svg { flex-shrink: 0; }
.nav-item:hover      { background: #16253a; color: #9ab8d8; }
.nav-item.active     { background: #1a3a5c; color: #4ab8f5; font-weight: 600; }
.nav-item.nav-logout { color: #ef4444; }
.nav-item.nav-logout:hover { background: #2a1010; color: #f87171; }

.sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 200; }
.sidebar-overlay.active { display: block; }

/* ── MAIN ── */
.main-content {
  flex: 1;
  margin-left: 145px;
  width: calc(100% - 145px);
  min-width: 0;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* ── TOPBAR ── */
.topbar {
  background: #fff;
  height: 62px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  gap: 10px;
  border-bottom: 1px solid #e8eaed;
  position: sticky;
  top: 0; z-index: 100;
  width: 100%;
  box-sizing: border-box;
}
.menu-btn { display: none; background: none; border: none; cursor: pointer; color: #555; padding: 4px; flex-shrink: 0; }
.topbar-left   { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.breadcrumb    { font-size: 12px; color: #aaa; white-space: nowrap; }
.breadcrumb strong { color: #333; }
.topbar-center { flex: 1; display: flex; justify-content: center; min-width: 0; }
.search-box    { display: flex; align-items: center; gap: 7px; background: #f5f6f8; border-radius: 18px; padding: 5px 14px; width: 100%; max-width: 340px; border: 1px solid #e8eaed; }
.search-input  { border: none; background: transparent; outline: none; font-size: 12px; color: #333; width: 100%; }
.topbar-right  { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.user-info     { display: flex; align-items: center; gap: 8px; }
.user-avatar   { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: linear-gradient(135deg,#4ab8f5,#1a6ab5); flex-shrink: 0; border: 2px solid #e0e0e0; }
.user-details  { display: flex; flex-direction: column; }
.user-name     { font-size: 12px; font-weight: 600; color: #222; line-height: 1.3; }
.user-email    { font-size: 10px; color: #999; line-height: 1.3; }
.notif-btn     { position: relative; background: none; border: none; cursor: pointer; color: #666; padding: 5px; flex-shrink: 0; }
.notif-badge   { position: absolute; top: 1px; right: 1px; background: #ef4444; color: white; font-size: 8px; width: 13px; height: 13px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; }

/* ── PAGE BODY ── */
.page-body {
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  box-sizing: border-box;
}
.page-header  { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.page-title   { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 2px; }
.page-subtitle{ font-size: 12px; color: #999; margin: 0; }
.page-actions { display: flex; gap: 8px; }

.btn-outline { display:flex; align-items:center; gap:5px; padding:7px 14px; border:1.5px solid #ddd; border-radius:8px; background:white; font-size:12px; font-weight:600; color:#555; cursor:pointer; white-space:nowrap; }
.btn-outline:hover { border-color:#4ab8f5; color:#4ab8f5; }
.btn-primary { display:flex; align-items:center; gap:5px; padding:7px 14px; border:none; border-radius:8px; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); font-size:12px; font-weight:600; color:white; cursor:pointer; white-space:nowrap; }

/* ── KPI ── */
.kpi-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; width: 100%; }
.kpi-card {
  border-radius: 16px;
  padding: 18px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: white;
  min-width: 0;
  min-height: 88px;
}
.kpi-blue   { background: linear-gradient(135deg, #0d2d6b, #1250b0); }
.kpi-orange { background: linear-gradient(135deg, #7c2d00, #b84500); }
.kpi-red    { background: linear-gradient(135deg, #4a0000, #8b0000); border: 2px solid #ef4444; }
.kpi-dark   { background: linear-gradient(135deg, #0d1117, #1c2433); }
.kpi-label  { font-size: 10px; opacity: 0.85; display: block; margin-bottom: 8px; line-height: 1.3; }
.kpi-value  { font-size: 24px; font-weight: 700; display: block; }
.kpi-icon   { opacity: 0.65; flex-shrink: 0; margin-left: 8px; }

/* ── CHARTS ── */
.charts-row { display: grid; grid-template-columns: 1fr 260px; gap: 12px; width: 100%; }
.chart-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  min-width: 0;
  overflow: hidden;
}
.chart-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 8px; flex-wrap: wrap; }
.chart-title  { font-size: 14px; font-weight: 700; color: #1a1a1a; margin: 0 0 2px; }
.chart-subtitle { font-size: 10px; color: #aaa; margin: 0; }
.chart-filters { display: flex; gap: 3px; }
.filter-btn   { padding: 3px 9px; border: 1px solid #e0e0e0; border-radius: 5px; background: white; font-size: 10px; cursor: pointer; color: #777; }
.filter-btn.active { background: #1a6ab5; color: white; border-color: #1a6ab5; }
.donut-wrap   { display: flex; justify-content: center; margin: 8px 0; }
.legend       { display: flex; flex-direction: column; gap: 6px; }
.legend-item  { display: flex; align-items: center; gap: 7px; font-size: 11px; }
.legend-dot   { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.legend-label { flex: 1; color: #555; }
.legend-pct   { font-weight: 700; color: #222; }

/* ── TABLA ── */
.table-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.07);
  width: 100%;
  overflow: hidden;
  box-sizing: border-box;
}
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px; }
.table-wrap   { overflow-x: auto; width: 100%; }
.data-table   { width: 100%; border-collapse: collapse; font-size: 12px; }
.data-table thead tr { background: #111827; color: white; }
.data-table th { padding: 10px 12px; text-align: left; font-weight: 600; font-size: 11px; white-space: nowrap; }
.data-table tbody tr { border-bottom: 1px solid #f3f4f6; transition: background 0.15s; }
.data-table tbody tr:hover { background: #f9fafb; }
.data-table td { padding: 10px 12px; vertical-align: middle; }
.td-time   { color: #999; font-size: 11px; white-space: nowrap; }
.td-leader { font-weight: 600; color: #111; white-space: nowrap; }
.td-desc   { color: #666; font-size: 11px; }

.badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 600; white-space: nowrap; }
.badge-venta      { background: #dbeafe; color: #1d4ed8; }
.badge-pago       { background: #fef9c3; color: #92400e; }
.badge-kit        { background: #dcfce7; color: #166534; }
.badge-aprobado   { background: #dcfce7; color: #166534; }
.badge-validado   { background: #e0f2fe; color: #0369a1; }
.badge-confirmado { background: #dbeafe; color: #1e40af; }
.badge-pendiente  { background: #fef3c7; color: #b45309; }

.table-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; padding-top: 12px; border-top: 1px solid #f3f4f6; flex-wrap: wrap; gap: 8px; }
.table-count  { font-size: 11px; color: #aaa; }
.pagination   { display: flex; gap: 5px; flex-wrap: wrap; }
.page-btn     { padding: 4px 11px; border: 1px solid #e0e0e0; border-radius: 5px; background: white; font-size: 11px; cursor: pointer; color: #555; }
.page-btn:hover  { border-color: #4ab8f5; color: #4ab8f5; }
.page-btn.active { background: #1a6ab5; color: white; border-color: #1a6ab5; }

/* ══ RESPONSIVE ══ */
@media (max-width: 1100px) {
  .kpi-grid   { grid-template-columns: repeat(2,1fr); }
  .charts-row { grid-template-columns: 1fr; }
}
@media (max-width: 768px) {
  .sidebar { transform: translateX(-100%); }
  .sidebar.sidebar-open { transform: translateX(0); box-shadow: 4px 0 24px rgba(0,0,0,0.5); }
  .main-content { margin-left: 0; width: 100%; }
  .menu-btn { display: flex; }
  .user-details { display: none; }
  .breadcrumb { display: none; }
  .page-body { padding: 14px; gap: 12px; }
  .page-title { font-size: 18px; }
  .kpi-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .kpi-value { font-size: 20px; }
}
@media (max-width: 480px) {
  .kpi-grid { grid-template-columns: 1fr; }
  .topbar-center { display: none; }
  .page-header { flex-direction: column; align-items: flex-start; }
}
</style>