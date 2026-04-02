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
        <div class="topbar-left"><span class="breadcrumb">Inicio › <strong>Gestión de Líderes</strong></span></div>
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

        <div v-if="errorMsg" class="alert-error">
          {{ errorMsg }}
          <button @click="errorMsg = ''" class="alert-close">✕</button>
        </div>

        <div class="page-header">
          <div>
            <h1 class="page-title">Gestión de Líderes</h1>
            <p class="page-subtitle">
              <span v-if="cargando">Cargando...</span>
              <span v-else>{{ meta.total }} líderes registrados</span>
            </p>
          </div>
          <button class="btn-primary">Invitar Líder (Generar PIN)</button>
        </div>

        <!-- Filtros -->
        <div class="filters-bar">
          <div class="search-box search-wide">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="busqueda" placeholder="Razón social, Ruc..." class="search-input" />
          </div>
          <span class="filter-label-inline">Filtros:</span>
          <select v-model="filtroEstado" class="select-filter">
            <option value="todos">Todos</option>
            <option value="activa">Activo</option>
            <option value="suspendida">Suspendida</option>
            <option value="pre_registro">Pre-registro</option>
          </select>
          <select v-model="filtroConfianza" class="select-filter">
            <option value="todos">Todos</option>
            <option value="2">Alto</option>
            <option value="1">Medio</option>
            <option value="0">Bajo</option>
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
          <div v-if="cargando" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando líderes...</span>
          </div>

          <div v-else class="table-wrap">
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
                <tr v-if="lideresFiltrados.length === 0">
                  <td colspan="9" class="empty-state">No se encontraron líderes.</td>
                </tr>
                <tr v-for="m in lideresFiltrados" :key="m.id">
                  <td>
                    <div class="lider-info">
                      <div class="lider-avatar" :style="{ background: colorAvatar(m) }">{{ iniciales(m) }}</div>
                      <div>
                        <div class="lider-name">{{ nombreCompleto(m) }}</div>
                        <div class="lider-email">{{ m.usuario?.email ?? '—' }}</div>
                      </div>
                    </div>
                  </td>
                  <td class="td-dni">{{ m.usuario?.numero_documento ?? '—' }}</td>
                  <td>
                    <div class="confianza">
                      <span class="dot" :class="colorConfianza(m.nivel_confianza)"></span>
                      {{ labelConfianza(m.nivel_confianza) }}
                    </div>
                  </td>
                  <td>
                    <span class="badge" :class="'bio-' + (m.insignia ?? 'nuevo').toLowerCase()">
                      {{ labelBiometria(m.insignia) }}
                    </span>
                  </td>
                  <td class="td-center">{{ m.kits_count ?? '—' }}</td>
                  <td class="td-ventas">{{ m.ventas_mes ? '$ ' + Number(m.ventas_mes).toLocaleString() : '—' }}</td>
                  <td class="td-deuda" :class="{ 'deuda-alta': (m.deuda_pendiente ?? 0) > 3000 }">
                    {{ m.deuda_pendiente ? '$ ' + Number(m.deuda_pendiente).toLocaleString() : '—' }}
                  </td>
                  <td>
                    <span class="badge" :class="'est-' + m.estado_validacion">
                      {{ labelEstado(m.estado_validacion) }}
                    </span>
                  </td>
                  <td>
                    <div class="acciones">
                      <button class="acc-btn" title="Ver detalle" @click="verDetalle(m)">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#4ab8f5" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <button class="acc-btn" title="Documentos">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#64748b" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </button>
                      <button class="acc-btn" title="Bloquear">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ef4444" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <span class="table-count">Mostrando 1 a {{ lideresFiltrados.length }} de {{ meta.total }} resultados</span>
            <div class="pagination">
              <button class="page-btn" :disabled="meta.current_page === 1" @click="cambiarPagina(meta.current_page - 1)">Anterior</button>
              <button class="page-btn active">{{ meta.current_page }}</button>
              <button class="page-btn" :disabled="meta.current_page === meta.last_page" @click="cambiarPagina(meta.current_page + 1)">Siguiente</button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal Ver Detalle -->
    <div v-if="modalDetalle" class="modal-overlay" @click.self="modalDetalle = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>👤 {{ nombreCompleto(liderSeleccionado) }}</h2>
          <button class="modal-close" @click="modalDetalle = false">✕</button>
        </div>
        <div class="modal-body" v-if="liderSeleccionado">
          <div class="detalle-grid">
            <div class="detalle-item"><span class="detalle-label">Email</span><span>{{ liderSeleccionado.usuario?.email ?? '—' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">DNI</span><span>{{ liderSeleccionado.usuario?.numero_documento ?? '—' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Rango</span><span>{{ liderSeleccionado.rango?.nombre ?? 'Sin rango' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Nivel en Red</span><span>Nivel {{ liderSeleccionado.nivel_en_arbol }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Estado</span><span>{{ labelEstado(liderSeleccionado.estado_validacion) }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Confianza</span><span>{{ labelConfianza(liderSeleccionado.nivel_confianza) }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Insignia</span><span>{{ liderSeleccionado.insignia ?? '—' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Puntos Marketplace</span><span>{{ liderSeleccionado.puntos_marketplace ?? 0 }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Perfil Web</span><span>{{ liderSeleccionado.perfil_web_activo ? 'Activo' : 'Inactivo' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Miembro desde</span><span>{{ formatFecha(liderSeleccionado.created_at) }}</span></div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalDetalle = false">Cerrar</button>
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
  'Accept':        'application/json',
  'Authorization': `Bearer ${token}`,
  'X-Empresa-Id':  empresaId,
})

// ── State ──
const lideres  = ref<any[]>([])
const cargando = ref(false)
const errorMsg = ref('')
const busqueda        = ref('')
const filtroEstado    = ref('todos')
const filtroConfianza = ref('todos')
const filtroDeuda     = ref('todos')
const meta = ref({ total: 0, current_page: 1, last_page: 1 })
const modalDetalle      = ref(false)
const liderSeleccionado = ref<any>(null)

// Colores avatar alternados
const colores = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
const colorAvatar = (m: any) => colores[m.id % colores.length]

// ── Helpers ──
const nombreCompleto = (m: any) =>
  m?.usuario ? `${m.usuario.nombre ?? ''} ${m.usuario.apellido ?? ''}`.trim() : '—'

const iniciales = (m: any) => {
  const n = m?.usuario?.nombre?.[0] ?? ''
  const a = m?.usuario?.apellido?.[0] ?? ''
  return (n + a).toUpperCase() || '?'
}

const labelEstado = (e: string) => ({
  activa: 'Activo', suspendida: 'Suspendida', pre_registro: 'Pre-registro'
}[e] ?? e)

const labelConfianza = (n: number) => n >= 2 ? 'Alto' : n === 1 ? 'Medio' : 'Bajo'
const colorConfianza = (n: number) => n >= 2 ? 'dot-alto' : n === 1 ? 'dot-medio' : 'dot-bajo'
const formatFecha    = (f: string) => f ? new Date(f).toLocaleDateString('es-PE') : '—'

const labelBiometria = (insignia: string) => {
  const map: Record<string, string> = {
    nuevo: 'Pendiente', verificado: 'Verificado', rechazado: 'Rechazado'
  }
  return map[insignia?.toLowerCase()] ?? 'Pendiente'
}

// ── Filtrado ──
const lideresFiltrados = computed(() =>
  lideres.value.filter(m => {
    const nombre = nombreCompleto(m).toLowerCase()
    const dni    = m.usuario?.numero_documento ?? ''
    const matchBusqueda  = nombre.includes(busqueda.value.toLowerCase()) || dni.includes(busqueda.value)
    const matchEstado    = filtroEstado.value    === 'todos' || m.estado_validacion === filtroEstado.value
    const matchConfianza = filtroConfianza.value === 'todos' || String(m.nivel_confianza) === filtroConfianza.value
    const matchDeuda     = filtroDeuda.value === 'todos' ||
      (filtroDeuda.value === 'con' ? (m.deuda_pendiente ?? 0) > 0 : (m.deuda_pendiente ?? 0) === 0)
    return matchBusqueda && matchEstado && matchConfianza && matchDeuda
  })
)

// ── API ──
const cargarLideres = async (pagina = 1) => {
  cargando.value = true
  errorMsg.value = ''
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/distribuidores?page=${pagina}`, { headers: hdrs() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (json.status === 'success') {
      lideres.value = json.data.data ?? json.data
      meta.value = {
        total:        json.data.total        ?? lideres.value.length,
        current_page: json.data.current_page ?? 1,
        last_page:    json.data.last_page    ?? 1,
      }
    } else {
      errorMsg.value = json.message ?? 'Error al cargar líderes.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

const cambiarPagina = (p: number) => cargarLideres(p)
const verDetalle    = (m: any)    => { liderSeleccionado.value = m; modalDetalle.value = true }

onMounted(() => cargarLideres())
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
.topbar-left { min-width:200px; }
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
.alert-error { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-close { background:none; border:none; cursor:pointer; color:#b91c1c; font-size:16px; }
.filters-bar { display:flex; align-items:center; gap:10px; background:white; border-radius:12px; padding:12px 16px; box-shadow:0 2px 8px rgba(0,0,0,0.06); flex-wrap:wrap; }
.search-wide { width:220px; }
.filter-label-inline { font-size:13px; color:#888; font-weight:600; }
.select-filter { border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; font-size:13px; color:#444; outline:none; cursor:pointer; background:white; }
.result-count { margin-left:auto; font-size:13px; color:#666; font-weight:600; }
.table-card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.loading-state { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; color:#999; font-size:13px; }
.spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#4ab8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 14px; text-align:left; font-weight:600; font-size:12px; white-space:nowrap; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table td { padding:10px 14px; vertical-align:middle; }
.lider-info { display:flex; align-items:center; gap:10px; }
.lider-avatar { width:36px; height:36px; border-radius:50%; color:white; font-weight:700; font-size:12px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.lider-name { font-weight:600; color:#1a1a1a; font-size:13px; }
.lider-email { font-size:11px; color:#999; }
.td-dni { color:#666; font-size:12px; }
.td-center { text-align:center; font-weight:600; color:#333; }
.td-ventas { font-weight:600; color:#1a1a1a; }
.td-deuda  { font-weight:600; color:#f59e0b; }
.deuda-alta { color:#ef4444 !important; }
.confianza { display:flex; align-items:center; gap:6px; font-size:13px; }
.dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.dot-alto  { background:#22c55e; }
.dot-medio { background:#f59e0b; }
.dot-bajo  { background:#ef4444; }
.badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
.bio-nuevo      { background:#fef3c7; color:#b45309; }
.bio-verificado { background:#dcfce7; color:#166534; }
.bio-rechazado  { background:#fee2e2; color:#991b1b; }
.est-activa       { background:#dcfce7; color:#166534; }
.est-suspendida   { background:#fee2e2; color:#991b1b; }
.est-pre_registro { background:#fef3c7; color:#b45309; }
.acciones { display:flex; gap:6px; }
.acc-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:4px; transition:background 0.15s; }
.acc-btn:hover { background:#f1f5f9; }
.empty-state { text-align:center; color:#999; padding:40px; font-size:13px; }
.table-footer { display:flex; align-items:center; justify-content:space-between; margin-top:16px; padding-top:14px; border-top:1px solid #f0f0f0; }
.table-count { font-size:12px; color:#999; }
.pagination { display:flex; gap:6px; }
.page-btn { padding:5px 12px; border:1px solid #ddd; border-radius:6px; background:white; font-size:12px; cursor:pointer; color:#555; }
.page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.page-btn.active { background:#1a6ab5; color:white; border-color:#1a6ab5; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal { background:white; border-radius:12px; width:480px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; }
.modal-lg { width:560px; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-header h2 { font-size:16px; font-weight:700; color:#1a1a1a; margin:0; }
.modal-close { background:none; border:none; cursor:pointer; font-size:18px; color:#999; }
.modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
.modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
.btn-secondary { padding:9px 18px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; }
.detalle-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.detalle-item { display:flex; flex-direction:column; gap:4px; padding:10px 12px; background:#f8fafc; border-radius:8px; }
.detalle-label { font-size:11px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.5px; }
</style>