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
        <div class="topbar-left"><span class="breadcrumb">Inicio › <strong>Deudas</strong></span></div>
        <div class="topbar-center">
          <div class="search-box">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="" class="search-input" />
          </div>
        </div>
        <div class="topbar-right">
          <div class="user-info">
            <div class="user-avatar">{{ inicialUsuario }}</div>
            <div class="user-details">
              <span class="user-name">{{ nombreUsuario }}</span>
              <span class="user-email">{{ emailUsuario }}</span>
            </div>
          </div>
          <button class="notif-btn">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span class="notif-badge">1</span>
          </button>
        </div>
      </header>

      <div class="page-body">

        <div v-if="errorMsg" class="alert-error">{{ errorMsg }}<button @click="errorMsg=''" class="alert-close">✕</button></div>
        <div v-if="successMsg" class="alert-success">{{ successMsg }}<button @click="successMsg=''" class="alert-close">✕</button></div>

        <div class="page-header">
          <div>
            <h1 class="page-title">Deudas y Cobranzas</h1>
            <p class="page-subtitle">Vista general del sistema y métricas consolidadas</p>
          </div>
        </div>

        <div class="main-grid">
          <!-- Columna izquierda -->
          <div class="left-col">

            <!-- KPI Cards -->
            <div class="kpi-row">
              <div class="kpi-dark kpi-card-d">
                <div class="kpi-d-icon red"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg></div>
                <span class="kpi-d-val">S/ {{ totalPendiente }}</span>
                <span class="kpi-d-label">Total Pendiente</span>
                <span class="kpi-d-sub">{{ deudas.length }} líderes con deuda</span>
              </div>
              <div class="kpi-dark kpi-card-d">
                <div class="kpi-d-icon orange"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg></div>
                <span class="kpi-d-val">S/ {{ totalVencido }}</span>
                <span class="kpi-d-label">Deuda Vencida</span>
                <span class="kpi-d-sub">Supera el 80% del límite</span>
              </div>
              <div class="kpi-dark kpi-card-d">
                <div class="kpi-d-icon green"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
                <span class="kpi-d-val">S/ {{ totalPagosMes }}</span>
                <span class="kpi-d-label">Pagos del Mes</span>
                <span class="kpi-d-sub">{{ pagos.filter(p => p.estado === 'Confirmado').length }} pagos confirmados</span>
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
                <polygon points="50,100 100,80 150,60 200,50 250,70 300,90 350,85 400,75 450,100 450,140 50,140" fill="rgba(239,68,68,0.1)"/>
                <polyline points="50,100 100,80 150,60 200,50 250,70 300,90 350,85 400,75 450,100" fill="none" stroke="#ef4444" stroke-width="2" stroke-linejoin="round"/>
                <polygon points="50,120 100,100 150,85 200,70 250,90 300,110 350,100 400,90 450,120 450,140 50,140" fill="rgba(59,130,246,0.1)"/>
                <polyline points="50,120 100,100 150,85 200,70 250,90 300,110 350,100 400,90 450,120" fill="none" stroke="#3b82f6" stroke-width="2" stroke-linejoin="round"/>
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
              <div class="chart-legend">
                <span class="legend-dot-line red"></span><span class="legend-txt">Deuda</span>
                <span class="legend-dot-line blue" style="margin-left:16px"></span><span class="legend-txt">Recaudación</span>
              </div>
            </div>

            <!-- Tabla Pagos -->
            <div class="card">
              <div class="table-header-row">
                <h3 class="section-title">Pagos Recientes de Líderes</h3>
                <button class="btn-primary" @click="modalPago = true">+ Registro Pago Manual</button>
              </div>
              <div v-if="cargandoPagos" class="loading-state">
                <div class="spinner"></div><span>Cargando pagos...</span>
              </div>
              <div v-else class="table-wrap">
                <table class="data-table">
                  <thead>
                    <tr><th>Líder</th><th>Fecha pago</th><th>Monto</th><th>Referencia</th><th>Banco</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    <tr v-if="pagos.length === 0">
                      <td colspan="6" class="empty-state">No hay pagos registrados.</td>
                    </tr>
                    <tr v-for="p in pagos" :key="p.id">
                      <td class="td-lider">{{ p.lider }}</td>
                      <td class="td-fecha">{{ p.fecha }}</td>
                      <td class="td-monto">S/ {{ Number(p.monto).toLocaleString() }}</td>
                      <td class="td-ref">{{ p.referencia }}</td>
                      <td class="td-banco">{{ p.banco }}</td>
                      <td><span class="badge" :class="'est-' + p.estado.toLowerCase()">{{ p.estado }}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Panel Ledger -->
          <div class="ledger-panel card">
            <h3 class="section-title">Estado de Cuenta — Ledger</h3>
            <div class="ledger-search">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" v-model="busquedaLedger" placeholder="Buscar líder" class="search-input" />
            </div>

            <div v-if="cargandoDeudas" class="loading-state" style="padding:20px">
              <div class="spinner"></div>
            </div>

            <div v-else class="ledger-list">
              <div v-if="deudasFiltradas.length === 0" class="ledger-hint">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p>No hay deudas registradas</p>
              </div>
              <div v-for="d in deudasFiltradas" :key="d.id"
                class="ledger-item" :class="{ 'ledger-selected': ledgerSelected === d.id }"
                @click="seleccionarLedger(d)">
                <div class="ledger-avatar" :style="{ background: colorLedger(d) }">{{ inicialesDeuda(d) }}</div>
                <div class="ledger-info">
                  <span class="ledger-name">{{ nombreDeuda(d) }}</span>
                  <span class="ledger-deuda" :class="Number(d.monto_pendiente) > 3000 ? 'deuda-alta' : ''">
                    S/ {{ Number(d.monto_pendiente).toLocaleString() }}
                  </span>
                </div>
                <span class="badge" :class="'est-' + (d.estado ?? 'pendiente')">{{ labelEstadoDeuda(d.estado) }}</span>
              </div>
            </div>

            <!-- Detalle ledger seleccionado -->
            <div v-if="ledgerSelected" class="ledger-detalle">
              <h4 class="ledger-detalle-title">Detalle de Deuda</h4>
              <div class="ledger-detalle-row"><span>Monto Total</span><span class="fw">S/ {{ Number(ledgerData?.monto_total ?? 0).toFixed(2) }}</span></div>
              <div class="ledger-detalle-row"><span>Monto Pagado</span><span class="fw text-green">S/ {{ Number(ledgerData?.monto_pagado ?? 0).toFixed(2) }}</span></div>
              <div class="ledger-detalle-row"><span>Monto Pendiente</span><span class="fw text-red">S/ {{ Number(ledgerData?.monto_pendiente ?? 0).toFixed(2) }}</span></div>
              <div class="ledger-detalle-row"><span>Modelo Pago</span><span class="fw">{{ ledgerData?.modelo_pago ?? '—' }}</span></div>
              <div class="ledger-detalle-row"><span>Estado</span><span class="badge" :class="'est-' + (ledgerData?.estado ?? 'pendiente')">{{ labelEstadoDeuda(ledgerData?.estado) }}</span></div>
              <div class="ledger-detalle-row" v-if="ledgerData?.fecha_vencimiento">
                <span>Vencimiento</span>
                <span class="fw">{{ formatFecha(ledgerData?.fecha_vencimiento) }}</span>
              </div>
            </div>

            <div v-else class="ledger-hint">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#ccc" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <p>Selecciona un líder para ver su ledger</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Registro Pago Manual -->
    <div v-if="modalPago" class="modal-overlay" @click.self="modalPago = false">
      <div class="modal">
        <div class="modal-header">
          <h2>+ Registro Pago Manual</h2>
          <button class="modal-close" @click="modalPago = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Líder *</label>
            <input v-model="formPago.lider" type="text" placeholder="Nombre del líder" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Monto (S/) *</label>
              <input v-model="formPago.monto" type="number" min="0" placeholder="0.00" class="form-input" />
            </div>
            <div class="form-group">
              <label>Fecha *</label>
              <input v-model="formPago.fecha" type="date" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Referencia *</label>
              <input v-model="formPago.referencia" type="text" placeholder="PAGO-XXX-001" class="form-input" />
            </div>
            <div class="form-group">
              <label>Banco *</label>
              <select v-model="formPago.banco" class="form-input">
                <option value="">Seleccionar...</option>
                <option value="BCP">BCP</option>
                <option value="BBVA">BBVA</option>
                <option value="Interbank">Interbank</option>
                <option value="Scotiabank">Scotiabank</option>
                <option value="Yape">Yape</option>
                <option value="Plin">Plin</option>
              </select>
            </div>
          </div>
          <span v-if="errorPago" class="form-error">{{ errorPago }}</span>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalPago = false">Cancelar</button>
          <button class="btn-primary" @click="registrarPago" :disabled="guardandoPago">
            {{ guardandoPago ? 'Guardando...' : 'Registrar Pago' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const API_BASE = 'http://localhost:8000/api'
const logo = new URL('../../assets/logo-innovex.png', import.meta.url).href
const router = useRouter()

const token     = localStorage.getItem('token')      ?? ''
const empresaId = localStorage.getItem('empresa_id') ?? '1'
const nombreUsuario  = ref(localStorage.getItem('user_nombre') ?? 'Admin')
const emailUsuario   = ref(localStorage.getItem('user_email')  ?? '')
const inicialUsuario = computed(() => nombreUsuario.value.charAt(0).toUpperCase())
const cerrarSesion   = () => { localStorage.clear(); router.push({ name: 'login' }) }

const hdrs = () => ({
  'Content-Type':  'application/json',
  'Accept':        'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Empresa-Id':  empresaId,
})

// ── State ──
const errorMsg   = ref('')
const successMsg = ref('')

// Deudas
const deudas         = ref<any[]>([])
const cargandoDeudas = ref(false)
const busquedaLedger = ref('')
const ledgerSelected = ref<number | null>(null)
const ledgerData     = ref<any>(null)

// Pagos (estáticos por ahora hasta que backend tenga endpoint)
const cargandoPagos = ref(false)
const pagos = ref([
  { id:1, lider:'Maria González',  fecha:'2025-02-15', monto:1500, referencia:'PAGO-MG-001', banco:'BCP',        estado:'Confirmado' },
  { id:2, lider:'Carlos Mendoza',  fecha:'2025-02-12', monto:800,  referencia:'PAGO-CM-002', banco:'BBVA',       estado:'Confirmado' },
  { id:3, lider:'Ana Torres',      fecha:'2025-02-18', monto:2000, referencia:'PAGO-AT-003', banco:'Interbank',  estado:'Pendiente'  },
  { id:4, lider:'Lucia Paredes',   fecha:'2025-02-10', monto:1200, referencia:'PAGO-LP-004', banco:'BCP',        estado:'Confirmado' },
  { id:5, lider:'Eduardo Flores',  fecha:'2025-02-17', monto:3500, referencia:'PAGO-EF-005', banco:'Scotiabank', estado:'Confirmado' },
])

// Modal pago
const modalPago   = ref(false)
const guardandoPago = ref(false)
const errorPago   = ref('')
const formPago    = ref({ lider: '', monto: '', fecha: '', referencia: '', banco: '' })

// ── KPIs calculados ──
const totalPendiente = computed(() =>
  deudas.value.reduce((a, d) => a + Number(d.monto_pendiente ?? 0), 0).toLocaleString()
)
const totalVencido = computed(() =>
  deudas.value.filter(d => d.estado === 'vencida').reduce((a, d) => a + Number(d.monto_pendiente ?? 0), 0).toLocaleString()
)
const totalPagosMes = computed(() =>
  pagos.value.filter(p => p.estado === 'Confirmado').reduce((a, p) => a + Number(p.monto), 0).toLocaleString()
)

// ── Helpers ──
const nombreDeuda = (d: any) => {
  const u = d?.membresia?.usuario
  return u ? `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() : `Líder #${d.membresia_id}`
}

const inicialesDeuda = (d: any) => {
  const u = d?.membresia?.usuario
  if (!u) return '?'
  return ((u.nombre?.[0] ?? '') + (u.apellido?.[0] ?? '')).toUpperCase()
}

const coloresLedger = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
const colorLedger   = (d: any) => coloresLedger[d.id % coloresLedger.length]

const labelEstadoDeuda = (e: string) => ({
  pendiente: 'Pendiente', en_curso: 'En Curso', pagada: 'Pagada', vencida: 'Vencida', en_disputa: 'En Disputa'
}[e] ?? e ?? 'Pendiente')

const formatFecha = (f: string) => f ? new Date(f).toLocaleDateString('es-PE') : '—'

// ── Filtrado ──
const deudasFiltradas = computed(() =>
  deudas.value.filter(d => {
    const nombre = nombreDeuda(d).toLowerCase()
    return !busquedaLedger.value || nombre.includes(busquedaLedger.value.toLowerCase())
  })
)

// ── API ──
const cargarDeudas = async () => {
  cargandoDeudas.value = true
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/deudas`, { headers: hdrs() })
    if (res.status === 401) { cerrarSesion(); return }
    if (!res.ok) return
    const json = await res.json()
    if (json.status === 'success') {
      deudas.value = json.data.data ?? json.data
    }
  } catch { /* silencioso */ }
  finally { cargandoDeudas.value = false }
}

const seleccionarLedger = (d: any) => {
  ledgerSelected.value = d.id
  ledgerData.value     = d
}

// ── Registrar Pago Manual ──
const registrarPago = () => {
  errorPago.value = ''
  if (!formPago.value.lider || !formPago.value.monto || !formPago.value.fecha || !formPago.value.referencia || !formPago.value.banco) {
    errorPago.value = 'Todos los campos son obligatorios.'
    return
  }
  guardandoPago.value = true
  // Agregar a lista local hasta que el backend tenga endpoint
  setTimeout(() => {
    pagos.value.unshift({
      id:         Date.now(),
      lider:      formPago.value.lider,
      fecha:      formPago.value.fecha,
      monto:      Number(formPago.value.monto),
      referencia: formPago.value.referencia,
      banco:      formPago.value.banco,
      estado:     'Pendiente',
    })
    guardandoPago.value = false
    modalPago.value     = false
    successMsg.value    = '✅ Pago registrado correctamente.'
    setTimeout(() => { successMsg.value = '' }, 3000)
    formPago.value = { lider: '', monto: '', fecha: '', referencia: '', banco: '' }
  }, 500)
}

onMounted(() => cargarDeudas())
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
.alert-error { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-success { background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-close { background:none; border:none; cursor:pointer; font-size:16px; }
.main-grid { display:grid; grid-template-columns:1fr 280px; gap:20px; align-items:flex-start; }
.left-col { display:flex; flex-direction:column; gap:20px; }
.kpi-row { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
.kpi-card-d { background:#0f1b2d; border-radius:12px; padding:18px; display:flex; flex-direction:column; gap:6px; }
.kpi-d-icon { width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; margin-bottom:4px; }
.kpi-d-icon.red    { background:rgba(239,68,68,0.2); color:#ef4444; }
.kpi-d-icon.orange { background:rgba(245,158,11,0.2); color:#f59e0b; }
.kpi-d-icon.green  { background:rgba(34,197,94,0.2); color:#22c55e; }
.kpi-d-val   { font-size:22px; font-weight:700; color:white; }
.kpi-d-label { font-size:13px; font-weight:600; color:#7eb8e8; }
.kpi-d-sub   { font-size:11px; color:#4a6080; }
.card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.section-title { font-size:15px; font-weight:700; color:#1a1a1a; margin:0 0 3px; }
.section-sub   { font-size:11px; color:#999; margin:0 0 12px; }
.chart-legend { display:flex; align-items:center; gap:6px; margin-top:8px; font-size:11px; color:#666; }
.legend-dot-line { display:inline-block; width:24px; height:3px; border-radius:2px; }
.legend-dot-line.red  { background:#ef4444; }
.legend-dot-line.blue { background:#3b82f6; }
.legend-txt { font-size:11px; color:#666; }
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
.est-vencida    { background:#fee2e2; color:#991b1b; }
.est-en_curso   { background:#dbeafe; color:#1e40af; }
.est-pagada     { background:#dcfce7; color:#166534; }
.est-en_disputa { background:#f3e8ff; color:#7c3aed; }
.ledger-panel { display:flex; flex-direction:column; gap:12px; }
.ledger-search { display:flex; align-items:center; gap:8px; background:#f4f6f9; border-radius:8px; padding:7px 12px; }
.ledger-list { display:flex; flex-direction:column; gap:8px; }
.ledger-item { display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; cursor:pointer; transition:background 0.15s; border:1.5px solid transparent; }
.ledger-item:hover { background:#f8fafc; }
.ledger-item.ledger-selected { background:#eff6ff; border-color:#4ab8f5; }
.ledger-avatar { width:36px; height:36px; border-radius:50%; color:white; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.ledger-info { display:flex; flex-direction:column; flex:1; }
.ledger-name  { font-size:13px; font-weight:600; color:#1a1a1a; }
.ledger-deuda { font-size:12px; color:#f59e0b; font-weight:600; }
.deuda-alta   { color:#ef4444 !important; }
.ledger-detalle { background:#f8fafc; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:8px; border:1px solid #e2e8f0; }
.ledger-detalle-title { font-size:13px; font-weight:700; color:#1a1a1a; margin:0 0 6px; }
.ledger-detalle-row { display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#666; padding:4px 0; border-bottom:1px solid #eee; }
.ledger-detalle-row:last-child { border-bottom:none; }
.fw { font-weight:700; color:#1a1a1a; }
.text-green { color:#166534 !important; }
.text-red   { color:#991b1b !important; }
.ledger-hint { display:flex; flex-direction:column; align-items:center; gap:6px; padding:20px 0; opacity:0.5; }
.ledger-hint p { font-size:12px; color:#888; text-align:center; margin:0; }
.loading-state { display:flex; align-items:center; justify-content:center; gap:12px; padding:40px; color:#999; font-size:13px; }
.spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#4ab8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.empty-state { text-align:center; color:#999; padding:40px; font-size:13px; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal { background:white; border-radius:12px; width:480px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-header h2 { font-size:16px; font-weight:700; color:#1a1a1a; margin:0; }
.modal-close { background:none; border:none; cursor:pointer; font-size:18px; color:#999; }
.modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
.modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
.btn-secondary { padding:9px 18px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; }
.form-group { display:flex; flex-direction:column; gap:6px; flex:1; }
.form-group label { font-size:12px; font-weight:600; color:#555; }
.form-input { border:1px solid #e2e8f0; border-radius:8px; padding:9px 12px; font-size:13px; color:#333; outline:none; width:100%; box-sizing:border-box; }
.form-row { display:flex; gap:12px; }
.form-error { font-size:11px; color:#ef4444; }
</style>