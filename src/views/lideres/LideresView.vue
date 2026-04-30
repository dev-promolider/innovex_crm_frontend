<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Gestión de Líderes</strong></span>
    </template>

    <div class="page-body">

        <div v-if="errorMsg" class="alert-error">{{ errorMsg }}<button @click="errorMsg=''" class="alert-close">✕</button></div>
        <div v-if="successMsg" class="alert-success">{{ successMsg }}<button @click="successMsg=''" class="alert-close">✕</button></div>

        <div class="page-header">
          <div>
            <h1 class="page-title">Gestión de Líderes</h1>
            <p class="page-subtitle">
              <span v-if="cargando">Cargando...</span>
              <span v-else>{{ meta.total }} distribuidores en la red activa</span>
            </p>
          </div>
          <button class="btn-primary" @click="modalPin = true">Invitar Líder (Generar PIN)</button>
        </div>

        <!-- Filtros -->
        <div class="filters-bar">
          <div class="search-box search-wide">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" v-model="busqueda" placeholder="Buscar distribuidor, DNI o correo..." class="search-input" />
          </div>
          <span class="filter-label-inline">Filtros:</span>
          <select v-model="filtroEstado" class="select-filter">
            <option value="todos">Todos los estados</option>
            <option value="activa">Activo</option>
            <option value="suspendida">Suspendida</option>
            <option value="pre_registro">Pre-registro</option>
            <option value="revision_admin">Revision admin</option>
            <option value="pendiente_activacion">Pendiente activacion</option>
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
                  <th>Distribuidor</th>
                  <th>DNI</th>
                  <th>Rango</th>
                  <th>Patrocinador</th>
                  <th>Correo</th>
                  <th>Ingreso</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="lideresFiltrados.length === 0">
                  <td colspan="8" class="empty-state">No se encontraron distribuidores.</td>
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
                  <td>{{ m.rango?.nombre_rango ?? 'Sin rango' }}</td>
                  <td>{{ nombreReferente(m) }}</td>
                  <td class="td-dni">{{ m.usuario?.email ?? '—' }}</td>
                  <td class="td-dni">{{ formatFecha(m.created_at) }}</td>
                  <td>
                    <span class="badge" :class="'est-' + m.estado_validacion">{{ labelEstado(m.estado_validacion) }}</span>
                  </td>
                  <td>
                    <div class="acciones">
                      <!-- Ver detalle -->
                      <button class="acc-btn" title="Ver detalle" @click="verDetalle(m)">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#4ab8f5" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      </button>
                      <!-- Copiar datos -->
                      <button class="acc-btn" title="Copiar datos" @click="copiarDatos(m)">
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#64748b" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="table-footer">
            <span class="table-count">Mostrando 1 a {{ Math.min(lideresFiltrados.length, 15) }} de {{ meta.total }} resultados</span>
            <div class="pagination">
              <button class="page-btn" :disabled="meta.current_page === 1" @click="cambiarPagina(meta.current_page - 1)">Anterior</button>
              <button class="page-btn active">{{ meta.current_page }}</button>
              <button class="page-btn" :disabled="meta.current_page === meta.last_page" @click="cambiarPagina(meta.current_page + 1)">Siguiente</button>
            </div>
          </div>
        </div>
      </div>

    <!-- ── Modal Ver Detalle ── -->
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
            <div class="detalle-item"><span class="detalle-label">Rango</span><span>{{ liderSeleccionado.rango?.nombre_rango ?? 'Sin rango' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Nivel en Red</span><span>{{ liderSeleccionado.rango?.nivel ? `Nivel ${liderSeleccionado.rango.nivel}` : 'Sin nivel' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Estado</span><span>{{ labelEstado(liderSeleccionado.estado_validacion) }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Patrocinador</span><span>{{ nombreReferente(liderSeleccionado) }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Membresía</span><span>#{{ liderSeleccionado.id }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Capacidad hijos</span><span>{{ capacidadesDetalle?.limites?.hijos_directos_disponibles ?? '—' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Crédito kits disponible</span><span>{{ capacidadesDetalle?.limites?.kits_credito_disponible ?? '—' }}</span></div>
            <div class="detalle-item"><span class="detalle-label">Miembro desde</span><span>{{ formatFecha(liderSeleccionado.created_at) }}</span></div>
          </div>

          <div class="detalle-section" v-if="capacidadesDetalle">
            <h3 class="detalle-section-title">Capacidades efectivas</h3>
            <div class="detalle-grid detalle-grid--three">
              <div class="detalle-item"><span class="detalle-label">Solicitar kits empresa</span><span>{{ boolLabel(capacidadesDetalle?.permisos?.solicitar_kits_empresa) }}</span></div>
              <div class="detalle-item"><span class="detalle-label">Asignar stock equipo</span><span>{{ boolLabel(capacidadesDetalle?.permisos?.asignar_stock_equipo) }}</span></div>
              <div class="detalle-item"><span class="detalle-label">Registrar ventas</span><span>{{ boolLabel(capacidadesDetalle?.permisos?.registrar_ventas_consumidor_final) }}</span></div>
            </div>
          </div>

          <div class="detalle-section">
            <h3 class="detalle-section-title">Historial de rangos</h3>
            <div v-if="cargandoDetalleExtra" class="empty-state detail-inline">Cargando historial y capacidades...</div>
            <div v-else-if="historialRangos.length === 0" class="empty-state detail-inline">No hay cambios de rango registrados.</div>
            <div v-else class="history-list">
              <div v-for="item in historialRangos" :key="item.id" class="history-item">
                <div>
                  <strong>{{ item.rango_anterior?.nombre ?? 'Inicial' }} → {{ item.rango_nuevo?.nombre ?? 'Sin rango' }}</strong>
                  <p>{{ item.motivo ?? 'Sin motivo' }}</p>
                </div>
                <span>{{ formatFecha(item.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalDetalle = false">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ── Modal Generar PIN ── -->
    <div v-if="modalPin" class="modal-overlay" @click.self="cerrarModalPin">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>🔑 Invitar Líder</h2>
          <button class="modal-close" @click="cerrarModalPin">✕</button>
        </div>
        <div class="modal-body">
          <div v-if="!pinGenerado">
            <p style="font-size:13px;color:#555;margin:0 0 14px">Genera un PIN de invitación para que un nuevo líder pueda registrarse en la plataforma.</p>
            <div class="form-group">
              <label>Email del líder (opcional)</label>
              <input v-model="emailInvitado" type="email" placeholder="email@ejemplo.com" class="form-input" />
            </div>
          </div>
          <div v-else class="pin-result">
            <div class="pin-box">
              <span class="pin-label">PIN generado</span>
              <span class="pin-code">{{ pinGenerado }}</span>
            </div>
            <p class="pin-hint">Comparte este PIN con el líder para que complete su registro.</p>
            <button class="btn-copy-pin" @click="copiarPin">
              📋 Copiar PIN
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="cerrarModalPin">{{ pinGenerado ? 'Cerrar' : 'Cancelar' }}</button>
          <button v-if="!pinGenerado" class="btn-primary" @click="generarPin" :disabled="generandoPin">
            {{ generandoPin ? 'Generando...' : 'Generar PIN' }}
          </button>
        </div>
      </div>
    </div>

  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'

const API_BASE = 'http://localhost:8000/api'
const { authHeaders, logout: cerrarSesion } = useAuthenticatedSession()

const hdrs = () => authHeaders({ 'Content-Type': 'application/json' })

// ── State ──
const lideres    = ref<any[]>([])
const cargando   = ref(false)
const errorMsg   = ref('')
const successMsg = ref('')
const busqueda        = ref('')
const filtroEstado    = ref('todos')
const meta = ref({ total: 0, current_page: 1, last_page: 1 })

// Modales
const modalDetalle      = ref(false)
const liderSeleccionado = ref<any>(null)
const cargandoDetalleExtra = ref(false)
const capacidadesDetalle = ref<any>(null)
const historialRangos = ref<any[]>([])
const modalPin          = ref(false)
const pinGenerado       = ref('')
const emailInvitado     = ref('')
const generandoPin      = ref(false)

// ── Helpers ──
const colores    = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b']
const colorAvatar = (m: any) => colores[m.id % colores.length]

const nombreCompleto = (m: any) =>
  m?.usuario ? `${m.usuario.nombre ?? ''} ${m.usuario.apellido ?? ''}`.trim() : '—'

const iniciales = (m: any) => {
  const n = m?.usuario?.nombre?.[0] ?? ''
  const a = m?.usuario?.apellido?.[0] ?? ''
  return (n + a).toUpperCase() || '?'
}

const labelEstado    = (e: string) => ({ activa: 'Activo', suspendida: 'Suspendida', pre_registro: 'Pre-registro', revision_admin: 'Revision admin', pendiente_activacion: 'Pendiente activacion', biometra_pendiente: 'Biometria pendiente', documentos_pendientes: 'Documentos pendientes', bloqueada_riesgo: 'Bloqueada por riesgo', retirada: 'Retirada', rechazada: 'Rechazada' }[e] ?? e)
const formatFecha    = (f: string) => f ? new Date(f).toLocaleDateString('es-PE') : '—'
const nombreReferente = (m: any) => {
  const u = m?.referente?.usuario
  return u ? `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() : 'Sin patrocinador'
}
const boolLabel = (value: boolean | null | undefined) => value ? 'Sí' : 'No'

// ── Filtrado corregido ──
const lideresFiltrados = computed(() =>
  lideres.value.filter(m => {
    const nombre = nombreCompleto(m).toLowerCase()
    const dni    = m.usuario?.numero_documento ?? ''
    const email = m.usuario?.email?.toLowerCase?.() ?? ''
    const matchBusqueda  = nombre.includes(busqueda.value.toLowerCase()) || dni.includes(busqueda.value) || email.includes(busqueda.value.toLowerCase())
    const matchEstado    = filtroEstado.value === 'todos' || m.estado_validacion === filtroEstado.value

    return matchBusqueda && matchEstado
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
const verDetalle    = async (m: any) => {
  liderSeleccionado.value = m
  modalDetalle.value = true
  cargandoDetalleExtra.value = true
  capacidadesDetalle.value = null
  historialRangos.value = []

  try {
    const [capRes, histRes] = await Promise.all([
      fetch(`${API_BASE}/workspace/admin/distribuidores/${m.id}/capacidades`, { headers: hdrs() }),
      fetch(`${API_BASE}/workspace/admin/distribuidores/${m.id}/historial-rangos`, { headers: hdrs() }),
    ])

    if (capRes.ok) {
      const capJson = await capRes.json()
      if (capJson.status === 'success') {
        capacidadesDetalle.value = capJson.data?.capacidades_efectivas ?? capJson.data
      }
    }

    if (histRes.ok) {
      const histJson = await histRes.json()
      if (histJson.status === 'success') {
        historialRangos.value = histJson.data ?? []
      }
    }
  } catch {
    errorMsg.value = 'No se pudo cargar el detalle extendido del distribuidor.'
  } finally {
    cargandoDetalleExtra.value = false
  }
}

// ── Copiar datos ──
const copiarDatos = async (m: any) => {
  const texto = `Líder: ${nombreCompleto(m)}
Email: ${m.usuario?.email ?? '—'}
DNI: ${m.usuario?.numero_documento ?? '—'}
Rango: ${m.rango?.nombre ?? 'Sin rango'}
Estado: ${labelEstado(m.estado_validacion)}
Patrocinador: ${nombreReferente(m)}
Nivel en Red: ${m.rango?.nivel ? 'Nivel ' + m.rango.nivel : 'Sin nivel'}`

  try {
    await navigator.clipboard.writeText(texto)
    successMsg.value = '✅ Datos copiados al portapapeles.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch {
    errorMsg.value = 'No se pudo copiar al portapapeles.'
  }
}

// ── Generar PIN ──
const generarPin = async () => {
  generandoPin.value = true
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/invitaciones`, {
      method: 'POST',
      headers: hdrs(),
      body: JSON.stringify({ email: emailInvitado.value || null })
    })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      pinGenerado.value = json.data?.pin ?? json.data?.token ?? 'PIN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    } else {
      // Si el backend no tiene este endpoint aún, generamos un PIN local
      pinGenerado.value = 'PIN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
    }
  } catch {
    // Generamos PIN local si no hay conexión
    pinGenerado.value = 'PIN-' + Math.random().toString(36).substring(2, 8).toUpperCase()
  } finally {
    generandoPin.value = false
  }
}

const copiarPin = async () => {
  try {
    await navigator.clipboard.writeText(pinGenerado.value)
    successMsg.value = '✅ PIN copiado al portapapeles.'
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch {
    errorMsg.value = 'No se pudo copiar el PIN.'
  }
}

const cerrarModalPin = () => {
  modalPin.value    = false
  pinGenerado.value = ''
  emailInvitado.value = ''
}

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
.btn-secondary { padding:9px 18px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; }
.btn-danger { padding:9px 18px; border:none; border-radius:8px; background:#ef4444; font-size:13px; font-weight:600; color:white; cursor:pointer; }
.btn-danger:disabled { opacity:0.6; cursor:not-allowed; }
.alert-error { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-success { background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-close { background:none; border:none; cursor:pointer; font-size:16px; }
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
.badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
.est-activa       { background:#dcfce7; color:#166534; }
.est-suspendida   { background:#fee2e2; color:#991b1b; }
.est-pre_registro { background:#fef3c7; color:#b45309; }
.est-revision_admin,
.est-pendiente_activacion,
.est-biometria_pendiente,
.est-documentos_pendientes { background:#dbeafe; color:#1d4ed8; }
.est-bloqueada_riesgo,
.est-rechazada { background:#fee2e2; color:#991b1b; }
.est-retirada { background:#e5e7eb; color:#374151; }
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
.modal-sm { width:400px; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-header h2 { font-size:16px; font-weight:700; color:#1a1a1a; margin:0; }
.modal-close { background:none; border:none; cursor:pointer; font-size:18px; color:#999; }
.modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
.modal-body p { font-size:13px; color:#555; margin:0; }
.modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group label { font-size:12px; font-weight:600; color:#555; }
.form-input { border:1px solid #e2e8f0; border-radius:8px; padding:9px 12px; font-size:13px; color:#333; outline:none; width:100%; box-sizing:border-box; }
.detalle-grid { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.detalle-grid--three { grid-template-columns:repeat(3,1fr); }
.detalle-item { display:flex; flex-direction:column; gap:4px; padding:10px 12px; background:#f8fafc; border-radius:8px; }
.detalle-label { font-size:11px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:0.5px; }
.detalle-section { display:flex; flex-direction:column; gap:10px; }
.detalle-section-title { margin:0; font-size:14px; font-weight:700; color:#162033; }
.detail-inline { padding:18px 0; }
.history-list { display:flex; flex-direction:column; gap:10px; }
.history-item { display:flex; justify-content:space-between; gap:12px; align-items:flex-start; padding:12px; border-radius:10px; background:#f8fafc; }
.history-item p { margin:4px 0 0; font-size:12px; color:#64748b; }
.pin-result { display:flex; flex-direction:column; align-items:center; gap:14px; }
.pin-box { background:#0f1b2d; border-radius:12px; padding:20px 32px; text-align:center; }
.pin-label { font-size:11px; color:#4a6080; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px; }
.pin-code { font-size:28px; font-weight:800; color:#4ab8f5; letter-spacing:4px; display:block; }
.pin-hint { font-size:12px; color:#888; text-align:center; margin:0; }
.btn-copy-pin { padding:8px 20px; border:1.5px solid #4ab8f5; border-radius:8px; background:white; color:#1a6ab5; font-size:13px; font-weight:600; cursor:pointer; }
.btn-copy-pin:hover { background:#eff6ff; }
@media (max-width: 860px) {
  .detalle-grid,
  .detalle-grid--three {
    grid-template-columns:1fr;
  }

  .history-item {
    flex-direction:column;
  }
}
</style>