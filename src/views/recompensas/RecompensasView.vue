<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Recompensas</strong></span>
    </template>

    <div class="page-body">
      <div v-if="errorMsg" class="alert-error">{{ errorMsg }}<button @click="errorMsg=''" class="alert-close">✕</button></div>
      <div v-if="successMsg" class="alert-success">{{ successMsg }}<button @click="successMsg=''" class="alert-close">✕</button></div>

      <div class="page-header">
        <div>
          <h1 class="page-title">Recompensas</h1>
          <p class="page-subtitle">Administración de premios del marketplace</p>
        </div>
      </div>

      <div class="tabs-bar">
        <button v-for="tab in tabs" :key="tab" class="tab-btn" :class="{ active: tabActivo === tab }" @click="tabActivo = tab">{{ tab }}</button>
        <div style="flex:1"></div>
        <button class="btn-primary" @click="abrirModalNuevo">+ Nuevo Premio</button>
      </div>

      <div v-if="tabActivo === 'Market Places de Premios'" class="card">
        <div class="catalog-filters">
          <p class="section-sub">{{ recompensas.length }} premios registrados</p>
          <select v-model="filtroTipo" class="filter-select" @change="cargarRecompensas()">
            <option value="">Todos los tipos</option>
            <option value="propio">Propio</option>
            <option value="alianza_estrategica">Alianza</option>
            <option value="experiencia_vip">VIP</option>
          </select>
          <select v-model="filtroActivo" class="filter-select" @change="cargarRecompensas()">
            <option value="">Todos los estados</option>
            <option value="1">Activos</option>
            <option value="0">Inactivos</option>
          </select>
        </div>

        <div v-if="cargando" class="loading-state">
          <div class="spinner"></div><span>Cargando recompensas...</span>
        </div>

        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Premio</th>
                <th>Categoría</th>
                <th>Costo (Puntos)</th>
                <th>Stock</th>
                <th>Acciones</th>
                <th>Gestionar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="recompensas.length === 0">
                <td colspan="6" class="empty-state">No hay premios registrados. ¡Crea el primero!</td>
              </tr>
              <tr v-for="r in recompensas" :key="r.id">
                <td>
                  <div class="premio-cell">
                    <div class="premio-img" :style="{ background: colorPremio(r.tipo_premio) }">
                      {{ iconoPremio(r.tipo_premio) }}
                    </div>
                    <div>
                      <div class="premio-name">{{ r.nombre }}</div>
                      <div class="premio-desc">{{ r.descripcion ?? '' }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge" :class="'cat-' + labelCategoria(r.tipo_premio).toLowerCase()">
                    {{ labelCategoria(r.tipo_premio) }}
                  </span>
                </td>
                <td class="td-costo">{{ Number(r.costo_puntos).toLocaleString() }}</td>
                <td>
                  <span v-if="r.stock_disponible === null" class="td-stock">Ilimitado</span>
                  <span v-else-if="r.stock_disponible === 0" class="td-agotado">Agotado</span>
                  <span v-else :class="r.stock_disponible <= 3 ? 'td-agotado' : 'td-stock'">
                    {{ r.stock_disponible }} unid.
                  </span>
                </td>
                <td>
                  <button class="acc-toggle" :class="r.activo ? 'acc-activo' : 'acc-inactivo'" @click="toggleActivo(r)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    {{ r.activo ? 'Activo' : 'Inactivo' }}
                  </button>
                </td>
                <td>
                  <div class="row-actions">
                    <button class="edit-btn" @click="abrirModalEditar(r)" title="Editar">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#666" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="delete-btn" @click="abrirModalEliminar(r)" title="Eliminar">
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="tabActivo === 'Canjes Solicitados'" class="card">
        <RewardRedemptionsPanel />
      </div>

      <div v-if="tabActivo === 'Reglas de puntos'" class="card">
        <MarketplacePointsConfigPanel />
      </div>

      <div v-if="tabActivo === 'Motor Scoring'" class="card">
        <ScoringAdminPanel />
      </div>
    </div>

    <div v-if="modalPremio" class="modal-overlay" @click.self="modalPremio = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ modoEdicion ? 'Editar Premio' : '+ Nuevo Premio' }}</h2>
          <button class="modal-close" @click="modalPremio = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="formPremio.nombre" type="text" placeholder="Nombre del premio" class="form-input" />
            <span v-if="formErrors.nombre" class="form-error">{{ formErrors.nombre }}</span>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formPremio.descripcion" placeholder="Descripción opcional" class="form-input form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Categoría *</label>
              <select v-model="formPremio.tipo_premio" class="form-input">
                <option value="propio">Electrónico / Propio</option>
                <option value="alianza_estrategica">Vale / Alianza</option>
                <option value="experiencia_vip">Bienestar / VIP</option>
              </select>
            </div>
            <div class="form-group">
              <label>Costo en Puntos *</label>
              <input v-model="formPremio.costo_puntos" type="number" min="1" placeholder="0" class="form-input" />
              <span v-if="formErrors.costo_puntos" class="form-error">{{ formErrors.costo_puntos }}</span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Stock Disponible</label>
              <input v-model="formPremio.stock_disponible" type="number" min="0" placeholder="Vacío = ilimitado" class="form-input" />
            </div>
            <div class="form-group">
              <label>Puntaje Mínimo</label>
              <input v-model="formPremio.puntaje_minimo_desbloqueo" type="number" min="0" max="1000" placeholder="0" class="form-input" />
            </div>
          </div>
          <div v-if="formPremio.tipo_premio === 'alianza_estrategica'" class="form-group">
            <label>Proveedor de alianza</label>
            <input v-model="formPremio.proveedor_alianza" type="text" placeholder="Ej. Supermercado XYZ" class="form-input" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Disponible desde</label>
              <input v-model="formPremio.disponible_desde" type="datetime-local" class="form-input" />
            </div>
            <div class="form-group">
              <label>Disponible hasta</label>
              <input v-model="formPremio.disponible_hasta" type="datetime-local" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>Imagen del premio</label>
            <input type="file" accept="image/jpeg,image/png,image/webp" class="form-input" @change="onImagenSeleccionada" />
            <div v-if="imagenPreviewUrl" class="image-preview-card">
              <img :src="imagenPreviewUrl" alt="Vista previa del premio" class="image-preview" />
              <span class="form-hint">{{ imagenPremio ? 'Nueva imagen seleccionada' : 'Imagen actual del premio' }}</span>
            </div>
          </div>
          <div class="form-group">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <input type="checkbox" v-model="formPremio.activo" />
              Premio activo
            </label>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalPremio = false">Cancelar</button>
          <button class="btn-primary" @click="guardarPremio" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear Premio') }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Eliminar Premio</h2>
          <button class="modal-close" @click="modalEliminar = false">✕</button>
        </div>
        <div class="modal-body">
          <p class="confirm-text">
            ¿Deseas eliminar <strong>{{ premioAEliminar?.nombre }}</strong>? Esta acción no se puede deshacer.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
          <button class="btn-danger" @click="eliminarPremio" :disabled="guardando">
            {{ guardando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
import RewardRedemptionsPanel from '@/features/recompensas/components/RewardRedemptionsPanel.vue'
import ScoringAdminPanel from '@/features/recompensas/components/ScoringAdminPanel.vue'
import MarketplacePointsConfigPanel from '@/features/recompensas/components/MarketplacePointsConfigPanel.vue'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'

const API_BASE = 'http://localhost:8000/api'
const { authHeaders, logout: cerrarSesion } = useAuthenticatedSession()


const toIsoDateTime = (value: string) => value ? new Date(value).toISOString() : null
const toLaravelBoolean = (value: boolean) => (value ? '1' : '0')

const hdrs = () => authHeaders({ 'Content-Type': 'application/json' })

// ── State ──
const recompensas  = ref<any[]>([])
const cargando     = ref(false)
const guardando    = ref(false)
const errorMsg     = ref('')
const successMsg   = ref('')
const tabs         = ['Market Places de Premios', 'Canjes Solicitados', 'Reglas de puntos', 'Motor Scoring']
const tabActivo    = ref('Market Places de Premios')
const filtroTipo   = ref('')
const filtroActivo = ref('')

// Modal
const modalPremio  = ref(false)
const modoEdicion  = ref(false)
const premioEditando = ref<any>(null)
const modalEliminar = ref(false)
const premioAEliminar = ref<any>(null)
const formErrors   = ref<Record<string, string>>({})
const imagenPremio = ref<File | null>(null)
const imagenPreviewTemporal = ref('')
const formPremio   = ref({
  nombre: '', descripcion: '', tipo_premio: 'propio',
  proveedor_alianza: '',
  costo_puntos: '', stock_disponible: '', puntaje_minimo_desbloqueo: '0',
  disponible_desde: '', disponible_hasta: '', imagen_url: '', activo: true
})
const imagenPreviewUrl = computed(() => imagenPreviewTemporal.value || formPremio.value.imagen_url || '')

// ── Helpers ──
const labelCategoria = (tipo: string) => ({
  propio:              'Electrónico',
  alianza_estrategica: 'Vale',
  experiencia_vip:     'Bienestar',
}[tipo] ?? tipo)

const colorPremio = (tipo: string) => ({
  propio:              '#1a3a5c',
  alianza_estrategica: '#4a3000',
  experiencia_vip:     '#1a3020',
}[tipo] ?? '#1a1a2e')

const iconoPremio = (tipo: string) => ({
  propio:              '📱',
  alianza_estrategica: '🎫',
  experiencia_vip:     '🧴',
}[tipo] ?? '🎁')

const resetImagenPreviewTemporal = () => {
  if (imagenPreviewTemporal.value) {
    URL.revokeObjectURL(imagenPreviewTemporal.value)
    imagenPreviewTemporal.value = ''
  }
}

// ── API ──
const cargarRecompensas = async () => {
  cargando.value = true
  errorMsg.value = ''
  try {
    const params = new URLSearchParams()
    if (filtroTipo.value) params.set('tipo_premio', filtroTipo.value)
    if (filtroActivo.value !== '') params.set('activo', filtroActivo.value)
    const query = params.toString()
    const res  = await fetch(`${API_BASE}/workspace/admin/recompensas${query ? `?${query}` : ''}`, { headers: hdrs() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (json.status === 'success') {
      recompensas.value = json.data.data ?? json.data
    } else {
      errorMsg.value = json.message ?? 'Error al cargar recompensas.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

const abrirModalNuevo = () => {
  modoEdicion.value   = false
  premioEditando.value = null
  formErrors.value    = {}
  resetImagenPreviewTemporal()
  formPremio.value    = { nombre: '', descripcion: '', tipo_premio: 'propio', proveedor_alianza: '', costo_puntos: '', stock_disponible: '', puntaje_minimo_desbloqueo: '0', disponible_desde: '', disponible_hasta: '', imagen_url: '', activo: true }
  imagenPremio.value = null
  modalPremio.value   = true
}

const abrirModalEditar = (r: any) => {
  modoEdicion.value   = true
  premioEditando.value = r
  formErrors.value    = {}
  resetImagenPreviewTemporal()
  formPremio.value    = {
    nombre:                    r.nombre,
    descripcion:               r.descripcion ?? '',
    tipo_premio:               r.tipo_premio,
    costo_puntos:              String(r.costo_puntos),
    stock_disponible:          r.stock_disponible !== null ? String(r.stock_disponible) : '',
    proveedor_alianza:         r.proveedor_alianza ?? '',
    puntaje_minimo_desbloqueo: String(r.puntaje_minimo_desbloqueo ?? 0),
    disponible_desde:          r.disponible_desde ? r.disponible_desde.slice(0, 16) : '',
    disponible_hasta:          r.disponible_hasta ? r.disponible_hasta.slice(0, 16) : '',
    imagen_url:                r.imagen_url ?? '',
    activo:                    r.activo,
  }
  imagenPremio.value = null
  modalPremio.value = true
}

const abrirModalEliminar = (r: any) => {
  premioAEliminar.value = r
  modalEliminar.value = true
}

const guardarPremio = async () => {
  formErrors.value = {}
  if (!formPremio.value.nombre.trim())  { formErrors.value.nombre = 'El nombre es obligatorio.'; return }
  if (!formPremio.value.costo_puntos)   { formErrors.value.costo_puntos = 'El costo es obligatorio.'; return }

  guardando.value = true
  try {
    const body = {
      nombre:                    formPremio.value.nombre,
      descripcion:               formPremio.value.descripcion,
      tipo_premio:               formPremio.value.tipo_premio,
      proveedor_alianza:         formPremio.value.proveedor_alianza || null,
      costo_puntos:              Number(formPremio.value.costo_puntos),
      stock_disponible:          formPremio.value.stock_disponible !== '' ? Number(formPremio.value.stock_disponible) : null,
      puntaje_minimo_desbloqueo: Number(formPremio.value.puntaje_minimo_desbloqueo),
      disponible_desde:          toIsoDateTime(formPremio.value.disponible_desde),
      disponible_hasta:          toIsoDateTime(formPremio.value.disponible_hasta),
      activo:                    formPremio.value.activo,
    }

    const url    = modoEdicion.value ? `${API_BASE}/workspace/admin/recompensas/${premioEditando.value.id}` : `${API_BASE}/workspace/admin/recompensas`

    let res: Response
    if (imagenPremio.value) {
      const formData = new FormData()
      Object.entries(body).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, key === 'activo' ? toLaravelBoolean(Boolean(value)) : String(value))
        }
      })
      formData.append('imagen', imagenPremio.value)
      if (modoEdicion.value) {
        formData.append('_method', 'PUT')
      }
      res = await fetch(url, { method: 'POST', headers: authHeaders(), body: formData })
    } else {
      res = await fetch(url, { method: modoEdicion.value ? 'PUT' : 'POST', headers: hdrs(), body: JSON.stringify(body) })
    }
    const json   = await res.json()

    if (res.ok && json.status === 'success') {
      successMsg.value = modoEdicion.value ? '✅ Premio actualizado.' : '✅ Premio creado exitosamente.'
      modalPremio.value = false
      setTimeout(() => { successMsg.value = '' }, 3000)
      await cargarRecompensas()
    } else if (res.status === 422 && json.errors) {
      Object.keys(json.errors).forEach(k => { formErrors.value[k] = json.errors[k][0] })
    } else {
      errorMsg.value = json.message ?? 'Error al guardar.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar.'
  } finally {
    guardando.value = false
  }
}

const toggleActivo = async (r: any) => {
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/recompensas/${r.id}/toggle`, { method: 'POST', headers: hdrs() })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      r.activo = json.data.activo
      successMsg.value = r.activo ? '✅ Premio activado.' : '⏸ Premio desactivado.'
      setTimeout(() => { successMsg.value = '' }, 2000)
    } else {
      errorMsg.value = json.message ?? 'Error al cambiar estado.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar.'
  }
}

const eliminarPremio = async () => {
  if (!premioAEliminar.value) return

  guardando.value = true
  errorMsg.value = ''

  try {
    const res = await fetch(`${API_BASE}/workspace/admin/recompensas/${premioAEliminar.value.id}`, {
      method: 'DELETE',
      headers: hdrs(),
    })
    const json = await res.json()

    if (res.ok && json.status === 'success') {
      successMsg.value = json.message ?? '✅ Premio eliminado.'
      modalEliminar.value = false
      premioAEliminar.value = null
      setTimeout(() => { successMsg.value = '' }, 3000)
      await cargarRecompensas()
    } else {
      errorMsg.value = json.message ?? 'Error al eliminar.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar.'
  } finally {
    guardando.value = false
  }
}

const onImagenSeleccionada = (event: Event) => {
  const input = event.target as HTMLInputElement
  resetImagenPreviewTemporal()
  imagenPremio.value = input.files?.[0] ?? null

  if (imagenPremio.value) {
    imagenPreviewTemporal.value = URL.createObjectURL(imagenPremio.value)
  }
}

onMounted(() => cargarRecompensas())
onBeforeUnmount(() => resetImagenPreviewTemporal())
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
.tabs-bar { display:flex; align-items:center; gap:4px; border-bottom:2px solid #e2e8f0; padding-bottom:0; }
.tab-btn { padding:10px 16px; border:none; background:none; font-size:13px; font-weight:500; color:#888; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:color 0.2s,border-color 0.2s; }
.tab-btn.active { color:#1a6ab5; border-bottom-color:#1a6ab5; font-weight:600; }
.btn-primary { display:flex; align-items:center; gap:6px; padding:8px 16px; border:none; border-radius:8px; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); font-size:13px; font-weight:600; color:white; cursor:pointer; }
.btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
.card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.section-sub { font-size:12px; color:#999; margin:0 0 14px; }
.loading-state { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; color:#999; font-size:13px; }
.spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#4ab8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 14px; text-align:left; font-weight:600; font-size:12px; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table td { padding:12px 14px; vertical-align:middle; }
.premio-cell { display:flex; align-items:center; gap:10px; }
.premio-img { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px; flex-shrink:0; }
.premio-name { font-weight:600; color:#1a1a1a; font-size:13px; }
.premio-desc { font-size:11px; color:#999; margin-top:2px; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.cat-electrónico { background:#dbeafe; color:#1e40af; }
.cat-vale         { background:#fef3c7; color:#b45309; }
.cat-bienestar    { background:#dcfce7; color:#166534; }
.td-costo  { font-weight:700; color:#1a1a1a; }
.td-stock  { font-weight:600; color:#333; }
.td-agotado { font-weight:700; color:#ef4444; }
.row-actions { display:flex; align-items:center; gap:8px; }
.acc-toggle { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px; font-size:11px; font-weight:600; cursor:pointer; border:none; }
.acc-activo   { background:#dcfce7; color:#166534; }
.acc-inactivo { background:#f1f5f9; color:#64748b; }
.edit-btn { background:none; border:none; cursor:pointer; padding:4px; border-radius:4px; transition:background 0.15s; }
.edit-btn:hover { background:#f1f5f9; }
.delete-btn { background:#fff1f2; border:none; color:#be123c; cursor:pointer; padding:6px; border-radius:8px; transition:background 0.15s; }
.delete-btn:hover { background:#ffe4e6; }
.empty-state { text-align:center; color:#999; padding:40px; font-size:13px; }
.placeholder-panel { border:1px solid #e2e8f0; border-radius:16px; padding:20px; display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,1fr); gap:18px; background:linear-gradient(180deg,#ffffff 0%,#f8fbff 100%); }
.placeholder-copy h3 { margin:0 0 10px; font-size:18px; color:#162236; }
.placeholder-copy p { margin:0; font-size:13px; color:#64748b; line-height:1.6; }
.placeholder-list { display:flex; flex-direction:column; gap:12px; }
.placeholder-item { background:#fff; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:6px; }
.placeholder-item strong { font-size:13px; color:#1e293b; }
.placeholder-item span { font-size:12px; color:#64748b; line-height:1.5; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal { background:white; border-radius:12px; width:500px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; }
.modal-sm { width:460px; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-header h2 { font-size:16px; font-weight:700; color:#1a1a1a; margin:0; }
.modal-close { background:none; border:none; cursor:pointer; font-size:18px; color:#999; }
.modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
.modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
.btn-secondary { padding:9px 18px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; }
.btn-danger { padding:9px 18px; border:none; border-radius:8px; background:#dc2626; font-size:13px; font-weight:600; color:white; cursor:pointer; }
.btn-danger:disabled { opacity:0.6; cursor:not-allowed; }
.form-group { display:flex; flex-direction:column; gap:6px; flex:1; }
.form-group label { font-size:12px; font-weight:600; color:#555; }
.form-input { border:1px solid #e2e8f0; border-radius:8px; padding:9px 12px; font-size:13px; color:#333; outline:none; width:100%; box-sizing:border-box; }
.form-input:focus { border-color:#4ab8f5; }
.form-textarea { resize:vertical; min-height:70px; }
.form-row { display:flex; gap:12px; }
.form-error { font-size:11px; color:#ef4444; }
.form-hint { font-size:12px; color:#64748b; }
.image-preview-card { display:flex; flex-direction:column; gap:8px; margin-top:10px; padding:12px; border:1px solid #e2e8f0; border-radius:10px; background:#f8fafc; }
.image-preview { width:100%; max-height:180px; object-fit:contain; border-radius:8px; background:#fff; border:1px solid #e2e8f0; }
.confirm-text { margin:0; font-size:14px; color:#475569; line-height:1.6; }
</style>