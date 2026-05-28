<template>
  <AppShell :notification-count="contarEstado('pendiente') + pendingBankCount">
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Validación</strong></span>
    </template>

    <div class="page-body admin-list-page validacion-page">

        <div v-if="errorMsg" class="admin-alert admin-alert--error">{{ errorMsg }}<button @click="errorMsg=''" class="admin-alert__close">✕</button></div>
        <div v-if="successMsg" class="admin-alert admin-alert--success">{{ successMsg }}<button @click="successMsg=''" class="admin-alert__close">✕</button></div>

        <div class="admin-list-page__header">
          <div>
            <h1 class="admin-list-page__title">Validación de Ventas</h1>
            <p class="admin-list-page__subtitle">
              <span v-if="activeTab === 'ventas' && cargando">Cargando...</span>
              <span v-else-if="activeTab === 'ventas'">{{ ventasFiltradas.length }} ventas visibles en la cola administrativa</span>
              <span v-else>{{ pendingBankCount }} ventas aprobadas esperan confirmacion bancaria</span>
            </p>
          </div>
        </div>

        <div class="view-switcher">
          <button
            type="button"
            class="view-switcher__tab"
            :class="{ 'view-switcher__tab--active': activeTab === 'ventas' }"
            @click="activeTab = 'ventas'"
          >
            Validacion administrativa
            <span class="view-switcher__count">{{ contarEstado('pendiente') }}</span>
          </button>
          <button
            type="button"
            class="view-switcher__tab"
            :class="{ 'view-switcher__tab--active': activeTab === 'banco' }"
            @click="activeTab = 'banco'"
          >
            Confirmacion bancaria
            <span class="view-switcher__count">{{ pendingBankCount }}</span>
          </button>
        </div>

        <BankValidationPanel
          v-if="activeTab === 'banco'"
          @pending-count-change="pendingBankCount = $event"
        />

        <div v-else class="content-layout">
          <!-- Panel Filtros -->
          <aside class="filters-panel">
            <h3 class="filters-title">Filtros</h3>

            <!-- Contadores por estado -->
            <div class="estado-counters">
              <div class="counter-item counter-pendiente">
                <span>Pendientes</span>
                <span class="counter-badge">{{ contarEstado('pendiente') }}</span>
              </div>
              <div class="counter-item counter-validada">
                <span>Validadas</span>
                <span class="counter-badge">{{ contarEstado('aprobada') }}</span>
              </div>
              <div class="counter-item counter-rechazada">
                <span>Rechazadas</span>
                <span class="counter-badge">{{ contarEstado('rechazada') }}</span>
              </div>
            </div>

            <div class="filter-section">
              <label class="filter-label">Estado</label>
              <div class="filter-options">
                <label v-for="op in opcionesEstado" :key="op.value"
                  class="filter-radio" :class="{ active: filtroEstado === op.value }"
                  @click="filtroEstado = op.value">
                  <input type="radio" v-model="filtroEstado" :value="op.value" />
                  <span class="radio-dot" :style="{ background: op.color }"></span>
                  {{ op.label }}
                </label>
              </div>
            </div>

            <div class="filter-section">
              <label class="filter-label">Rango de Fechas</label>
              <label class="date-label">Fecha inicio</label>
              <input type="date" v-model="fechaInicio" class="date-input" />
              <label class="date-label" style="margin-top:8px">Fecha fin</label>
              <input type="date" v-model="fechaFin" class="date-input" />
            </div>

          </aside>

          <div class="table-area">
          <div class="table-toolbar">
              <div class="admin-search-box search-wide">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" v-model="busqueda" placeholder="Buscar cliente, distribuidor o kit..." class="admin-search-input" />
              </div>
            </div>

            <div v-if="cargando" class="loading-state">
              <div class="spinner"></div>
              <span>Cargando ventas...</span>
            </div>

            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Fecha</th>
                    <th>Distribuidor</th>
                    <th>Patrocinador</th>
                    <th>Kit</th>
                    <th>Monto</th>
                    <th>Banco</th>
                    <th>Comprobante</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="ventasFiltradas.length === 0">
                    <td colspan="10" class="empty-state">✅ No hay ventas con este filtro.</td>
                  </tr>
                  <tr
                    v-for="v in ventasFiltradas"
                    :key="v.id"
                    class="tr-clickable"
                    :class="{ 'tr-clickable--active': selectedVentaId === v.id }"
                    @click="seleccionarVenta(v.id)"
                  >
                    <td>
                      <div class="cliente-info">
                        <div class="cliente-name">{{ v.consumidor_nombre ?? '—' }}</div>
                        <div class="cliente-doc">{{ v.consumidor_documento ?? '' }}</div>
                      </div>
                    </td>
                    <td class="td-fecha">{{ formatFecha(v.capturado_at) }}</td>
                    <td>
                      <div class="vendedor-info">
                        <div class="vendedor-avatar">{{ inicialesDistribuidor(v) }}</div>
                        <span class="vendedor-name">{{ nombreDistribuidor(v) }}</span>
                      </div>
                    </td>
                    <td class="td-lider">{{ nombrePatrocinador(v) }}</td>
                    <td class="td-kit">{{ v.kit?.nombre ?? '—' }}</td>
                    <td class="td-monto">{{ formatCurrency(v.monto_total_venta) }}</td>
                    <td class="td-banco">{{ v.banco ?? 'BCP' }}</td>
                    <td class="td-center">
                      <button
                        v-if="v.comprobante_foto_url"
                        type="button"
                        class="comprobante-link comprobante-link--button"
                        @click.stop="openReceiptModal(v.comprobante_foto_url, buildReceiptLabel(v))"
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        {{ v.numero_comprobante ?? 'TRF-' + String(v.id).padStart(3,'0') }}
                      </button>
                      <span v-else class="text-muted">—</span>
                    </td>
                    <td>
                      <span class="badge" :class="'est-' + (v.estado ?? 'pendiente')">
                        {{ labelEstado(v.estado) }}
                      </span>
                    </td>
                    <td>
                      <div class="acciones" v-if="v.estado === 'pendiente' || !v.estado">
                        <button class="btn-aprobar" @click.stop="aprobar(v)" :disabled="procesando === v.id">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                          {{ procesando === v.id ? '...' : 'Aprobar' }}
                        </button>
                        <button class="btn-rechazar" @click.stop="abrirModalRechazar(v)">
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Rechazar
                        </button>
                      </div>
                      <span v-else class="text-muted">—</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Paginación -->
            <div v-if="meta.last_page > 1" class="admin-table-footer">
              <span class="admin-table-count">Página {{ meta.current_page }} de {{ meta.last_page }} — {{ meta.total }} total</span>
              <div class="admin-pagination">
                <button class="admin-page-btn" :disabled="meta.current_page === 1" @click="cambiarPagina(meta.current_page - 1)">Anterior</button>
                <button class="admin-page-btn admin-page-btn--active">{{ meta.current_page }}</button>
                <button class="admin-page-btn" :disabled="meta.current_page === meta.last_page" @click="cambiarPagina(meta.current_page + 1)">Siguiente</button>
              </div>
            </div>
          </div>

          <aside class="detail-panel">
            <div class="detail-panel__header">
              <div>
                <p class="detail-panel__eyebrow">Detalle operativo</p>
                <h3 class="detail-panel__title">Venta seleccionada</h3>
              </div>
            </div>

            <div v-if="cargandoDetalle" class="detail-empty-state">
              Cargando expediente de venta...
            </div>

            <div v-else-if="!ventaDetalle" class="detail-empty-state">
              Selecciona una venta de la cola para revisar evidencia, cuenta bancaria y contexto del distribuidor.
            </div>

            <div v-else class="detail-stack">
              <section class="detail-card">
                <span class="detail-card__label">Consumidor</span>
                <strong>{{ ventaDetalle.consumidor?.nombre || 'Sin nombre' }}</strong>
                <p>{{ ventaDetalle.consumidor?.documento || 'Sin documento' }}</p>
                <p>{{ ventaDetalle.consumidor?.telefono || 'Sin telefono' }}</p>
              </section>

              <section class="detail-card">
                <span class="detail-card__label">Distribuidor</span>
                <strong>{{ ventaDetalle.distribuidor?.nombre || 'Sin distribuidor' }}</strong>
                <p>Rango: {{ ventaDetalle.distribuidor?.rango || 'Sin rango' }}</p>
                <p>Nivel de confianza: {{ ventaDetalle.distribuidor?.nivel_confianza ?? '—' }}</p>
              </section>

              <section class="detail-card">
                <span class="detail-card__label">Venta</span>
                <strong>{{ ventaDetalle.kit?.nombre || 'Kit no disponible' }}</strong>
                <p>Cantidad: {{ ventaDetalle.cantidad ?? 0 }}</p>
                <p>Monto total: {{ formatCurrency(ventaDetalle.monto_total) }}</p>
                <p>Precio unitario: {{ formatCurrency(ventaDetalle.kit?.precio_unitario) }}</p>
              </section>

              <section class="detail-card">
                <span class="detail-card__label">Cuenta bancaria usada</span>
                <strong>{{ ventaDetalle.cuenta_bancaria?.alias_cuenta || 'Sin cuenta asociada' }}</strong>
                <p>{{ ventaDetalle.cuenta_bancaria?.banco_nombre || 'Banco no disponible' }} · {{ ventaDetalle.cuenta_bancaria?.moneda_iso || '—' }}</p>
                <p>Titular: {{ ventaDetalle.cuenta_bancaria?.titular_cuenta || '—' }}</p>
                <p>{{ ventaDetalle.cuenta_bancaria?.instrucciones_pago || 'Sin instrucciones registradas.' }}</p>
              </section>

              <section class="detail-card">
                <span class="detail-card__label">Evidencia</span>
                <p>GPS: {{ formatCoordinate(ventaDetalle.evidencia?.gps_latitud) }}, {{ formatCoordinate(ventaDetalle.evidencia?.gps_longitud) }}</p>
                <p>Precision: {{ formatCoordinate(ventaDetalle.evidencia?.gps_precision_metros) }} m</p>
                <p>Huella: {{ ventaDetalle.evidencia?.huella_biometrica_ref || 'Sin referencia biometrica' }}</p>
                <div v-if="ventaDetalle.evidencia?.comprobante_foto_url" class="detail-card__actions">
                  <button
                    type="button"
                    class="detail-card__link detail-card__link--button"
                    @click="openReceiptModal(ventaDetalle.evidencia.comprobante_foto_url, buildReceiptLabel(ventaDetalle))"
                  >
                    Ver comprobante
                  </button>
                </div>
              </section>
            </div>
          </aside>
        </div>
      </div>

    <SaleReceiptModal
      :open="isReceiptModalOpen"
      :receipt-url="activeReceiptUrl"
      :receipt-label="activeReceiptLabel"
      @close="closeReceiptModal"
    />

    <!-- Modal Rechazar -->
    <div v-if="modalRechazar" class="modal-overlay" @click.self="modalRechazar = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Rechazar Venta</h2>
          <button class="modal-close" @click="modalRechazar = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Cliente: <strong>{{ ventaSeleccionada?.consumidor_nombre ?? '—' }}</strong></p>
          <p>Kit: <strong>{{ ventaSeleccionada?.kit?.nombre ?? '—' }}</strong></p>
          <p>Monto: <strong>{{ formatCurrency(ventaSeleccionada?.monto_total_venta) }}</strong></p>
          <div class="form-group" style="margin-top:14px">
            <label>Motivo del rechazo *</label>
            <textarea v-model="motivoRechazo" placeholder="Explica por qué se rechaza esta venta..." class="form-input form-textarea"></textarea>
            <span v-if="errorMotivo" class="form-error">{{ errorMotivo }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalRechazar = false">Cancelar</button>
          <button class="btn-danger" @click="rechazar" :disabled="procesando !== null">
            {{ procesando !== null ? 'Procesando...' : 'Confirmar Rechazo' }}
          </button>
        </div>
      </div>
    </div>

  </AppShell>
</template>

<script setup lang="ts">
import { shallowRef, computed, onMounted } from 'vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import AppShell from '../../components/layout/AppShell.vue'
import BankValidationPanel from '@/features/validacion/components/BankValidationPanel.vue'
import SaleReceiptModal from '@/features/validacion/components/SaleReceiptModal.vue'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'

const API_BASE = 'http://localhost:8000/api'
const { authHeaders, logout: cerrarSesion } = useAuthenticatedSession()
const { ensureCurrencyLoaded, formatCurrency } = useWorkspaceCurrency()

const hdrs = () => authHeaders({ 'Content-Type': 'application/json' })

// ── State ──
const activeTab = shallowRef<'ventas' | 'banco'>('ventas')
const pendingBankCount = shallowRef(0)
const todasVentas = shallowRef<any[]>([])
const ventas      = shallowRef<any[]>([])
const cargando    = shallowRef(false)
const procesando  = shallowRef<number | null>(null)
const errorMsg    = shallowRef('')
const successMsg  = shallowRef('')
const busqueda    = shallowRef('')
const filtroEstado   = shallowRef('todos')
const fechaInicio    = shallowRef('')
const fechaFin       = shallowRef('')
const meta = shallowRef({ total: 0, current_page: 1, last_page: 1 })

const modalRechazar     = shallowRef(false)
const ventaSeleccionada = shallowRef<any>(null)
const motivoRechazo     = shallowRef('')
const errorMotivo       = shallowRef('')
const selectedVentaId   = shallowRef<number | null>(null)
const ventaDetalle      = shallowRef<any>(null)
const cargandoDetalle   = shallowRef(false)
const isReceiptModalOpen = shallowRef(false)
const activeReceiptUrl = shallowRef('')
const activeReceiptLabel = shallowRef('Comprobante de venta')

const opcionesEstado = [
  { value: 'todos',     label: 'Todos',      color: '#4ab8f5' },
  { value: 'pendiente', label: 'Pendiente',  color: '#f59e0b' },
  { value: 'aprobada',  label: 'Validada',   color: '#22c55e' },
  { value: 'rechazada', label: 'Rechazada',  color: '#ef4444' },
]

// ── Helpers ──
const formatFecha = (f: string) => {
  if (!f) return '—'
  const d = new Date(f)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const nombreDistribuidor = (v: any) => {
  const u = v?.vendedor?.usuario
  return u ? `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() : '—'
}

const inicialesDistribuidor = (v: any) => {
  const u = v?.vendedor?.usuario
  if (!u) return '?'
  return ((u.nombre?.[0] ?? '') + (u.apellido?.[0] ?? '')).toUpperCase()
}

const nombrePatrocinador = (v: any) => {
  const ref = v?.vendedor?.referente?.usuario
  if (ref) return `${ref.nombre ?? ''} ${ref.apellido ?? ''}`.trim()
  return v?.lider_nombre ?? '—'
}

const labelEstado = (e: string) => ({
  pendiente: 'Pendiente', aprobada: 'Validada', rechazada: 'Rechazada'
}[e] ?? 'Pendiente')

const formatCoordinate = (value: string | number | null | undefined) => {
  if (value === null || value === undefined || value === '') return '—'
  return Number(value).toFixed(5)
}

const buildReceiptLabel = (venta: any) => venta?.numero_comprobante ?? `Comprobante venta #${venta?.id ?? ''}`.trim()

const hasReceipt = (receiptUrl: string | null | undefined) => typeof receiptUrl === 'string' && receiptUrl.trim().length > 0

const openReceiptModal = (receiptUrl: string | null | undefined, receiptLabel = 'Comprobante de venta') => {
  if (!hasReceipt(receiptUrl)) return
  activeReceiptUrl.value = String(receiptUrl).trim()
  activeReceiptLabel.value = receiptLabel
  isReceiptModalOpen.value = true
}

const closeReceiptModal = () => {
  isReceiptModalOpen.value = false
  activeReceiptUrl.value = ''
  activeReceiptLabel.value = 'Comprobante de venta'
}

const contarEstado = (estado: string) => todasVentas.value.filter(v => (v.estado ?? 'pendiente') === estado).length

// ── Filtrado ──
const ventasFiltradas = computed(() =>
  ventas.value.filter(v => {
    const matchEstado  = filtroEstado.value === 'todos' || (v.estado ?? 'pendiente') === filtroEstado.value
    const matchBusq    = !busqueda.value ||
      (v.consumidor_nombre ?? '').toLowerCase().includes(busqueda.value.toLowerCase()) ||
      nombreDistribuidor(v).toLowerCase().includes(busqueda.value.toLowerCase()) ||
      (v.kit?.nombre ?? '').toLowerCase().includes(busqueda.value.toLowerCase())
    const ventaDate = v.capturado_at ? new Date(v.capturado_at) : null
    const fromDate = fechaInicio.value ? new Date(`${fechaInicio.value}T00:00:00`) : null
    const toDate = fechaFin.value ? new Date(`${fechaFin.value}T23:59:59`) : null
    const matchDesde = !fromDate || !ventaDate || ventaDate >= fromDate
    const matchHasta = !toDate || !ventaDate || ventaDate <= toDate
    return matchEstado && matchBusq && matchDesde && matchHasta
  })
)

// ── API ──
const cargarVentas = async (pagina = 1) => {
  cargando.value = true
  errorMsg.value = ''
  try {
    const params = new URLSearchParams({ page: String(pagina), per_page: '20' })
    const res  = await fetch(`${API_BASE}/workspace/admin/ventas?${params.toString()}`, { headers: hdrs() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (json.status === 'success') {
      ventas.value      = json.data.data ?? json.data
      todasVentas.value = ventas.value
      meta.value = {
        total:        json.data.total        ?? ventas.value.length,
        current_page: json.data.current_page ?? 1,
        last_page:    json.data.last_page    ?? 1,
      }

      if (selectedVentaId.value != null) {
        const stillVisible = ventas.value.some((venta) => venta.id === selectedVentaId.value)
        if (!stillVisible) {
          selectedVentaId.value = null
          ventaDetalle.value = null
        }
      }

      if (selectedVentaId.value == null && ventas.value.length > 0) {
        await seleccionarVenta(ventas.value[0].id)
      }
    } else {
      errorMsg.value = json.message ?? 'Error al cargar ventas.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargando.value = false
  }
}

const seleccionarVenta = async (ventaId: number) => {
  selectedVentaId.value = ventaId
  cargandoDetalle.value = true

  try {
    const res = await fetch(`${API_BASE}/workspace/admin/ventas/${ventaId}`, { headers: hdrs() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()

    if (json.status === 'success') {
      ventaDetalle.value = json.data
    } else {
      errorMsg.value = json.message ?? 'No se pudo cargar el detalle de la venta.'
    }
  } catch {
    errorMsg.value = 'No se pudo cargar el detalle de la venta.'
  } finally {
    cargandoDetalle.value = false
  }
}

const aprobar = async (v: any) => {
  procesando.value = v.id
  errorMsg.value   = ''
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/ventas/${v.id}/aprobar`, { method: 'POST', headers: hdrs() })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      successMsg.value = '✅ Venta aprobada correctamente.'
      setTimeout(() => { successMsg.value = '' }, 3000)
      await cargarVentas(meta.value.current_page)
    } else {
      errorMsg.value = json.message ?? 'Error al aprobar.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar.'
  } finally {
    procesando.value = null
  }
}

const abrirModalRechazar = (v: any) => {
  ventaSeleccionada.value = v
  motivoRechazo.value     = ''
  errorMotivo.value       = ''
  modalRechazar.value     = true
}

const rechazar = async () => {
  if (!motivoRechazo.value.trim()) { errorMotivo.value = 'El motivo es obligatorio.'; return }
  if (!ventaSeleccionada.value) return
  procesando.value = ventaSeleccionada.value.id
  errorMsg.value   = ''
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/ventas/${ventaSeleccionada.value.id}/rechazar`, {
      method: 'POST', headers: hdrs(),
      body: JSON.stringify({ motivo: motivoRechazo.value })
    })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      successMsg.value    = '❌ Venta rechazada correctamente.'
      modalRechazar.value = false
      setTimeout(() => { successMsg.value = '' }, 3000)
      await cargarVentas(meta.value.current_page)
    } else {
      errorMsg.value = json.message ?? 'Error al rechazar.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar.'
  } finally {
    procesando.value = null
  }
}

const cambiarPagina = (p: number) => cargarVentas(p)
onMounted(() => {
  void Promise.all([ensureCurrencyLoaded(), cargarVentas()])
})
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
.view-switcher { display:flex; gap:10px; flex-wrap:wrap; }
.view-switcher__tab { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:999px; border:1px solid #dbe4f0; background:white; color:#516072; font-size:12px; font-weight:700; cursor:pointer; }
.view-switcher__tab--active { background:#1a3a5c; color:white; border-color:#1a3a5c; box-shadow:0 10px 22px rgba(26,58,92,0.18); }
.view-switcher__count { display:inline-flex; align-items:center; justify-content:center; min-width:22px; height:22px; padding:0 8px; border-radius:999px; background:rgba(74,184,245,0.12); color:inherit; font-size:11px; }
.content-layout { display:flex; gap:20px; align-items:flex-start; }
.filters-panel { width:200px; flex-shrink:0; background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.filters-title { font-size:14px; font-weight:700; color:#1a1a1a; margin:0 0 14px; }
.estado-counters { display:flex; flex-direction:column; gap:6px; margin-bottom:16px; }
.counter-item { display:flex; justify-content:space-between; align-items:center; padding:6px 10px; border-radius:6px; font-size:12px; font-weight:600; }
.counter-pendiente { background:#fef3c7; color:#b45309; }
.counter-validada  { background:#dcfce7; color:#166534; }
.counter-rechazada { background:#fee2e2; color:#991b1b; }
.counter-badge { font-size:13px; font-weight:700; }
.filter-section { margin-bottom:16px; }
.filter-label { font-size:11px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px; }
.filter-options { display:flex; flex-direction:column; gap:6px; }
.filter-radio { display:flex; align-items:center; gap:8px; font-size:13px; color:#444; cursor:pointer; padding:5px 8px; border-radius:6px; transition:background 0.15s; }
.filter-radio input { display:none; }
.filter-radio.active { background:#eff6ff; color:#1a6ab5; font-weight:600; }
.radio-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.date-label { font-size:11px; color:#888; display:block; margin-bottom:4px; }
.date-input { width:100%; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; font-size:12px; color:#333; outline:none; box-sizing:border-box; }
.table-area { flex:1; background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.detail-panel { width:320px; flex-shrink:0; background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.detail-panel__header { margin-bottom:14px; }
.detail-panel__eyebrow { color:#8c5f2c; font-size:10px; font-weight:700; letter-spacing:0.14em; text-transform:uppercase; }
.detail-panel__title { margin:6px 0 0; font-size:16px; font-weight:700; color:#1a1a1a; }
.detail-empty-state { border:1px dashed #d7dfeb; border-radius:10px; padding:18px; color:#7a8598; font-size:12px; line-height:1.6; background:#fafcff; }
.detail-stack { display:flex; flex-direction:column; gap:12px; }
.detail-card { border:1px solid #edf2f7; border-radius:12px; padding:14px; background:#fbfdff; }
.detail-card__label { display:block; margin-bottom:8px; color:#7a8598; font-size:10px; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; }
.detail-card strong { display:block; color:#172033; font-size:13px; margin-bottom:4px; }
.detail-card p { margin:4px 0 0; color:#526074; font-size:12px; line-height:1.5; }
.detail-card__actions { display:flex; gap:10px; margin-top:10px; }
.detail-card__link { display:inline-flex; margin-top:10px; color:#1a6ab5; font-size:12px; font-weight:600; text-decoration:none; }
.detail-card__link:hover { text-decoration:underline; }
.detail-card__link--button { margin-top:0; padding:0; border:none; background:none; cursor:pointer; }
.table-toolbar { margin-bottom:14px; }
.search-wide { width:100%; }
.loading-state { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; color:#999; font-size:13px; }
.spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#4ab8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:12px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 12px; text-align:left; font-weight:600; font-size:11px; white-space:nowrap; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
.data-table tbody tr:hover { background:#f8fafc; }
.tr-clickable { cursor:pointer; }
.tr-clickable--active { background:#eff6ff; }
.data-table td { padding:10px 12px; vertical-align:middle; }
.cliente-info { display:flex; flex-direction:column; }
.cliente-name { font-weight:600; color:#1a1a1a; font-size:12px; }
.cliente-doc { font-size:10px; color:#999; }
.td-fecha { color:#888; font-size:11px; white-space:nowrap; }
.td-kit { font-weight:600; color:#333; font-size:12px; }
.td-center { text-align:center; }
.td-monto { font-weight:700; color:#1a1a1a; }
.td-lider { color:#555; font-size:12px; }
.td-banco { font-weight:600; color:#1a6ab5; font-size:12px; }
.vendedor-info { display:flex; align-items:center; gap:6px; }
.vendedor-avatar { width:28px; height:28px; border-radius:50%; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); color:white; font-weight:700; font-size:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.vendedor-name { font-weight:600; color:#1a1a1a; font-size:12px; }
.comprobante-link { display:flex; align-items:center; gap:4px; color:#4ab8f5; text-decoration:none; font-size:11px; font-weight:600; }
.comprobante-link:hover { text-decoration:underline; }
.comprobante-link--button { padding:0; border:none; background:none; cursor:pointer; }
.text-muted { color:#999; font-size:12px; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; white-space:nowrap; }
.est-pendiente { background:#fef3c7; color:#b45309; }
.est-aprobada  { background:#dcfce7; color:#166534; }
.est-rechazada { background:#fee2e2; color:#991b1b; }
.acciones { display:flex; gap:4px; }
.btn-aprobar { display:flex; align-items:center; gap:3px; padding:4px 10px; border:none; border-radius:6px; background:#dcfce7; color:#166534; font-size:11px; font-weight:600; cursor:pointer; }
.btn-aprobar:hover { background:#bbf7d0; }
.btn-aprobar:disabled { opacity:0.5; cursor:not-allowed; }
.btn-rechazar { display:flex; align-items:center; gap:3px; padding:4px 10px; border:none; border-radius:6px; background:#fee2e2; color:#991b1b; font-size:11px; font-weight:600; cursor:pointer; }
.btn-rechazar:hover { background:#fecaca; }
.empty-state { text-align:center; color:#999; padding:40px; font-size:13px; }
.admin-page-btn--active { background:#1a6ab5; color:white; border-color:#1a6ab5; }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal { background:white; border-radius:12px; width:480px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; }
.modal-sm { width:420px; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-header h2 { font-size:16px; font-weight:700; color:#1a1a1a; margin:0; }
.modal-close { background:none; border:none; cursor:pointer; font-size:18px; color:#999; }
.modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:10px; }
.modal-body p { font-size:13px; color:#555; margin:0; }
.modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
.btn-secondary { padding:9px 18px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; }
.btn-danger { padding:9px 18px; border:none; border-radius:8px; background:#ef4444; font-size:13px; font-weight:600; color:white; cursor:pointer; }
.btn-danger:disabled { opacity:0.6; cursor:not-allowed; }
.form-group { display:flex; flex-direction:column; gap:6px; }
.form-group label { font-size:12px; font-weight:600; color:#555; }
.form-input { border:1px solid #e2e8f0; border-radius:8px; padding:9px 12px; font-size:13px; color:#333; outline:none; width:100%; box-sizing:border-box; }
.form-textarea { resize:vertical; min-height:80px; }
.form-error { font-size:11px; color:#ef4444; }
@media (max-width: 768px) { .validacion-page.admin-list-page { padding:14px; } }
@media (max-width: 1280px) { .content-layout { flex-direction:column; } .filters-panel, .detail-panel { width:100%; } }
</style>
