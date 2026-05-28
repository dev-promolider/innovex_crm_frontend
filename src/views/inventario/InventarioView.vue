<template>
  <AppShell :notification-count="solicitudesPendientes">
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Control</strong></span>
    </template>

    <div class="page-body">

        <div v-if="errorMsg" class="alert-error">{{ errorMsg }}<button @click="errorMsg=''" class="alert-close">✕</button></div>
        <div v-if="successMsg" class="alert-success">{{ successMsg }}<button @click="successMsg=''" class="alert-close">✕</button></div>

        <div class="page-header">
          <div>
            <h1 class="page-title">Inventario Central</h1>
            <p class="page-subtitle">Administración de solicitudes de kits y stock</p>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-val kpi-blue-txt">{{ kpis.stockAlmacen }}</span>
              <div class="kpi-icon blue"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg></div>
            </div>
            <span class="kpi-label">Stock en Almacén</span>
            <span class="kpi-sub">Unidades disponibles</span>
          </div>
          <div class="kpi-card">
            <div class="kpi-top">
              <span class="kpi-val kpi-teal-txt">{{ kpis.stockDistribuido }}</span>
              <div class="kpi-icon teal"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg></div>
            </div>
            <span class="kpi-label">Stock Distribuido</span>
            <span class="kpi-sub">Unidades comprometidas</span>
          </div>
          <div class="kpi-card kpi-warn">
            <div class="kpi-top">
              <span class="kpi-val kpi-orange-txt">{{ kpis.stockBajo }}</span>
              <div class="kpi-icon orange"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg></div>
            </div>
            <span class="kpi-label">Kits con Stock Bajo</span>
            <span class="kpi-sub">Unidades disponibles</span>
          </div>
          <div class="kpi-card kpi-danger">
            <div class="kpi-top">
              <span class="kpi-val kpi-red-txt">{{ kpis.merma }}</span>
              <div class="kpi-icon red"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg></div>
            </div>
            <span class="kpi-label">Merma/Pérdidas</span>
            <span class="kpi-sub">Unidades disponibles</span>
          </div>
        </div>

        <!-- Estado de Stock por Kit -->
        <div class="stock-section card" v-if="kits.length > 0">
          <h3 class="section-title">Estado de Stock por Kit</h3>
          <div class="stock-grid">
            <div v-for="kit in kits" :key="kit.id" class="stock-item" :class="{ 'stock-low': stockDisponible(kit) < 20 }">
              <span class="stock-kit-name">{{ kit.nombre }}</span>
              <span class="stock-val" :class="{ 'val-red': stockDisponible(kit) < 20 }">{{ stockDisponible(kit) }}</span>
              <span class="stock-unit">unidades</span>
              <div class="stock-bar">
                <div class="stock-fill" :style="{ width: Math.min(100, (stockDisponible(kit) / (kit.stock_central || 1)) * 100) + '%', background: stockDisponible(kit) < 20 ? '#ef4444' : '#3b82f6' }"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="tabs-bar">
          <button class="tab-btn" :class="{ active: tabActivo === 'solicitudes' }" @click="tabActivo = 'solicitudes'">
            Solicitudes de Kits
            <span v-if="solicitudesPendientes > 0" class="tab-badge">{{ solicitudesPendientes }}</span>
          </button>
          <button class="tab-btn" :class="{ active: tabActivo === 'movimientos' }" @click="tabActivo = 'movimientos'">
            Movimientos de Inventario
          </button>
        </div>

        <!-- TAB: Solicitudes -->
        <div v-if="tabActivo === 'solicitudes'" class="card">
          <div class="table-filters">
            <div class="search-box search-wide">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input type="text" v-model="busquedaSol" placeholder="Buscar distribuidor, rango, kit o contrato..." class="search-input" />
            </div>
            <select v-model="filtroEstadoSol" class="select-filter">
              <option value="todos">Todos los estados</option>
              <option value="pendiente">Pendiente</option>
              <option value="aprobada">Aprobada</option>
              <option value="rechazada">Rechazada</option>
            </select>
            <select v-model="filtroOrigenSol" class="select-filter" @change="cargarSolicitudes(1)">
              <option value="todos">Todos los origenes</option>
              <option value="empresa">Origen empresa</option>
              <option value="patrocinador">Origen patrocinador</option>
            </select>
          </div>

          <div v-if="cargandoSol" class="loading-state">
            <div class="spinner"></div><span>Cargando solicitudes...</span>
          </div>

          <div v-else class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Distribuidor</th>
                  <th>Rango</th>
                  <th>Kit</th>
                  <th>Origen</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Contrato</th>
                  <th>Confianza</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="solicitudesFiltradas.length === 0">
                  <td colspan="10" class="empty-state">No hay solicitudes con este filtro.</td>
                </tr>
                <tr
                  v-for="s in solicitudesFiltradas"
                  :key="s.solicitud_id"
                  :class="{ 'inventory-row-selected': solicitudSeleccionada?.solicitud_id === s.solicitud_id }"
                  @click="seleccionarSolicitud(s.solicitud_id)"
                >
                  <td>
                    <div class="lider-info">
                      <div class="lider-avatar">{{ inicialesDistribuidor(s) }}</div>
                      <div class="lider-name">{{ nombreDistribuidor(s) }}</div>
                    </div>
                  </td>
                  <td class="td-lider">{{ s.distribuidor?.rango ?? '—' }}</td>
                  <td class="td-kit">{{ s.kit?.nombre ?? '—' }}</td>
                  <td><span class="badge" :class="'sol-' + origenSolicitud(s)">{{ labelOrigenSolicitud(s) }}</span></td>
                  <td class="td-center">{{ s.cantidad ?? '—' }}</td>
                  <td class="td-monto">{{ formatCurrency(s.monto_total) }}</td>
                  <td class="td-kit">{{ s.contrato?.numero_contrato ?? 'Sin contrato' }}</td>
                  <td class="td-center">{{ s.distribuidor?.nivel_confianza ?? '—' }}</td>
                  <td>
                    <span class="badge" :class="'sol-' + estadoUiSolicitud(s.estado)">{{ labelEstadoSol(s.estado) }}</span>
                  </td>
                  <td>
                    <div class="acciones" v-if="puedeGestionarseSolicitud(s)">
                      <button class="btn-aprobar" @click.stop="aprobarSolicitud(s)" :disabled="procesando === s.solicitud_id">
                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
                        {{ procesando === s.solicitud_id ? '...' : 'Aprobar' }}
                      </button>
                      <button class="btn-rechazar" @click.stop="abrirModalRechazar(s)">
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

          <div v-if="metaSol.last_page > 1" class="table-footer">
            <span class="table-count">Página {{ metaSol.current_page }} de {{ metaSol.last_page }}</span>
            <div class="pagination">
              <button class="page-btn" :disabled="metaSol.current_page === 1" @click="cambiarPaginaSol(metaSol.current_page - 1)">Anterior</button>
              <button class="page-btn active">{{ metaSol.current_page }}</button>
              <button class="page-btn" :disabled="metaSol.current_page === metaSol.last_page" @click="cambiarPaginaSol(metaSol.current_page + 1)">Siguiente</button>
            </div>
          </div>

          <div class="request-detail-card">
            <div class="section-header">
              <div>
                <h3 class="section-title">Detalle de solicitud</h3>
                <p class="section-sub">Contrato, evidencias de firma e historial crediticio del distribuidor.</p>
              </div>
              <button
                v-if="detalleSolicitud?.contrato?.id"
                class="btn-contract-view"
                :disabled="abriendoContratoId === detalleSolicitud?.contrato?.id"
                @click="verContrato(detalleSolicitud)"
              >
                {{ abriendoContratoId === detalleSolicitud?.contrato?.id ? 'Abriendo contrato...' : 'Ver contrato' }}
              </button>
            </div>

            <div v-if="cargandoDetalle" class="loading-state detail-state">
              <div class="spinner"></div><span>Cargando detalle...</span>
            </div>

            <div v-else-if="!detalleSolicitud" class="empty-state detail-state">
              Selecciona una solicitud para revisar el expediente administrativo.
            </div>

            <div v-else class="request-detail-layout">
              <div class="request-summary-grid">
                <div class="detail-metric-card">
                  <span class="detail-metric-label">Distribuidor</span>
                  <strong>{{ detalleSolicitud.distribuidor?.nombre ?? '—' }}</strong>
                  <small>{{ detalleSolicitud.distribuidor?.rango ?? 'Sin rango' }}</small>
                </div>
                <div class="detail-metric-card">
                  <span class="detail-metric-label">Monto total</span>
                  <strong>{{ formatCurrency(detalleSolicitud.monto_total) }}</strong>
                  <small>{{ detalleSolicitud.cantidad ?? 0 }} kits solicitados</small>
                </div>
                <div class="detail-metric-card">
                  <span class="detail-metric-label">Contrato</span>
                  <strong>{{ detalleSolicitud.contrato?.numero_contrato ?? 'Sin contrato' }}</strong>
                  <small>{{ detalleSolicitud.contrato?.estado ?? 'pendiente' }}</small>
                </div>
                <div class="detail-metric-card">
                  <span class="detail-metric-label">Crédito histórico</span>
                  <strong>{{ detalleSolicitud.historial_credito?.deudas_activas ?? 0 }} activas</strong>
                  <small>{{ formatCurrency(detalleSolicitud.historial_credito?.monto_pendiente_total) }} pendientes</small>
                </div>
              </div>

              <div class="request-panels-grid">
                <section class="request-panel-block">
                  <h4 class="request-panel-title">Integridad contractual</h4>
                  <dl class="request-definition-list">
                    <div>
                      <dt>Huella PDF</dt>
                      <dd>{{ detalleSolicitud.contrato?.huella_pdf ?? 'No disponible' }}</dd>
                    </div>
                    <div>
                      <dt>Huella firma combinada</dt>
                      <dd>{{ detalleSolicitud.contrato?.huella_firma_combinada ?? 'No disponible' }}</dd>
                    </div>
                    <div>
                      <dt>Firmado</dt>
                      <dd>{{ formatFecha(detalleSolicitud.contrato?.firmado_at) }}</dd>
                    </div>
                    <div>
                      <dt>IP firma</dt>
                      <dd>{{ detalleSolicitud.contrato?.ip_firma ?? 'No registrada' }}</dd>
                    </div>
                  </dl>
                </section>

                <section class="request-panel-block">
                  <h4 class="request-panel-title">Riesgo y contexto</h4>
                  <dl class="request-definition-list">
                    <div>
                      <dt>Nivel confianza</dt>
                      <dd>{{ detalleSolicitud.distribuidor?.nivel_confianza ?? '—' }}</dd>
                    </div>
                    <div>
                      <dt>Total deudas</dt>
                      <dd>{{ detalleSolicitud.historial_credito?.total_deudas ?? 0 }}</dd>
                    </div>
                    <div>
                      <dt>Deudas pagadas</dt>
                      <dd>{{ detalleSolicitud.historial_credito?.deudas_pagadas ?? 0 }}</dd>
                    </div>
                    <div>
                      <dt>GPS firma</dt>
                      <dd>{{ gpsFirma(detalleSolicitud) }}</dd>
                    </div>
                  </dl>
                </section>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB: Movimientos -->
        <div v-if="tabActivo === 'movimientos'" class="card">
          <InventoryMovementsPanel />
        </div>

      </div>

    <!-- Modal Rechazar -->
    <div v-if="modalRechazar" class="modal-overlay" @click.self="modalRechazar = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Rechazar Solicitud</h2>
          <button class="modal-close" @click="modalRechazar = false">✕</button>
        </div>
        <div class="modal-body">
          <p>Solicitud de <strong>{{ nombreDistribuidor(solicitudSeleccionada) }}</strong></p>
          <p>Kit: <strong>{{ solicitudSeleccionada?.kit?.nombre }}</strong> x{{ solicitudSeleccionada?.cantidad ?? 0 }}</p>
          <div class="form-group" style="margin-top:14px">
            <label>Motivo del rechazo *</label>
            <textarea v-model="motivoRechazo" placeholder="Escribe el motivo..." class="form-input form-textarea"></textarea>
            <span v-if="errorMotivo" class="form-error">{{ errorMotivo }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalRechazar = false">Cancelar</button>
          <button class="btn-danger" @click="rechazarSolicitud" :disabled="procesando !== null">
            {{ procesando !== null ? 'Procesando...' : 'Confirmar Rechazo' }}
          </button>
        </div>
      </div>
    </div>

  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { API_BASE_URL } from '@/app/apiClient'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import AppShell from '../../components/layout/AppShell.vue'
import InventoryMovementsPanel from '@/features/inventario/components/InventoryMovementsPanel.vue'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'

const API_BASE = API_BASE_URL
const { authHeaders, logout: cerrarSesion } = useAuthenticatedSession()
const { ensureCurrencyLoaded, formatCurrency } = useWorkspaceCurrency()

const hdrs = () => authHeaders({ 'Content-Type': 'application/json' })

// ── State ──
const errorMsg   = ref('')
const successMsg = ref('')
const tabActivo  = ref('solicitudes')

// KPIs
const kpis = ref({ stockAlmacen: 0, stockDistribuido: 0, stockBajo: 0, merma: 3 })
const kits = ref<any[]>([])

// Solicitudes
const solicitudes           = ref<any[]>([])
const cargandoSol           = ref(false)
const cargandoDetalle       = ref(false)
const procesando            = ref<number | null>(null)
const busquedaSol           = ref('')
const filtroEstadoSol       = ref('todos')
const filtroOrigenSol       = ref('todos')
const solicitudesPendientes = ref(0)
const metaSol = ref({ total: 0, current_page: 1, last_page: 1 })
const detalleSolicitud      = ref<any>(null)
const abriendoContratoId    = ref<number | null>(null)

// Modal rechazar
const modalRechazar         = ref(false)
const solicitudSeleccionada = ref<any>(null)
const motivoRechazo         = ref('')
const errorMotivo           = ref('')

// ── Helpers ──
const formatFecha = (f: string) => {
  if (!f) return '—'
  const d = new Date(f)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

const nombreDistribuidor = (s: any) => s?.distribuidor?.nombre ?? '—'
const inicialesDistribuidor = (s: any) => {
  const nombre = s?.distribuidor?.nombre?.trim?.() ?? ''
  if (!nombre) return '?'
  return nombre.split(' ').slice(0, 2).map((segment: string) => segment[0]?.toUpperCase?.() ?? '').join('')
}
const estadoUiSolicitud = (estado?: string) => {
  if (estado === 'pendiente_aprobacion') return 'pendiente'
  return estado ?? 'pendiente'
}
const puedeGestionarseSolicitud = (solicitud: any) => estadoUiSolicitud(solicitud?.estado) === 'pendiente'
const labelEstadoSol = (estado?: string) => ({ pendiente: 'Pendiente', aprobada: 'Aprobada', rechazada: 'Rechazada' }[estadoUiSolicitud(estado)] ?? 'Pendiente')
const origenSolicitud = (solicitud: any) => solicitud?.origen_abastecimiento === 'patrocinador' ? 'patrocinador' : 'empresa'
const labelOrigenSolicitud = (solicitud: any) => origenSolicitud(solicitud) === 'patrocinador' ? 'Patrocinador' : 'Empresa'
const stockDisponible = (k: any) => (k.stock_central ?? 0) - (k.stock_comprometido ?? 0)
const gpsFirma = (detalle: any) => {
  const lat = detalle?.contrato?.gps_latitud
  const lng = detalle?.contrato?.gps_longitud
  if (lat == null || lng == null) return 'No registrado'
  return `${lat}, ${lng}`
}

// ── Filtrados ──
const solicitudesFiltradas = computed(() =>
  solicitudes.value.filter(s => {
    const matchEstado = filtroEstadoSol.value === 'todos' || estadoUiSolicitud(s.estado) === filtroEstadoSol.value
    const term = busquedaSol.value.toLowerCase()
    const matchBusq   = !busquedaSol.value
      || nombreDistribuidor(s).toLowerCase().includes(term)
      || (s.distribuidor?.rango ?? '').toLowerCase().includes(term)
      || (s.kit?.nombre ?? '').toLowerCase().includes(term)
      || (s.contrato?.numero_contrato ?? '').toLowerCase().includes(term)
    return matchEstado && matchBusq
  })
)

// ── API ──
const cargarKits = async () => {
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/kits`, { headers: hdrs() })
    if (!res.ok) return
    const json = await res.json()
    if (json.status === 'success') {
      kits.value = json.data.data ?? json.data
      const stockAlmacen     = kits.value.reduce((a: number, k: any) => a + (k.stock_central ?? 0), 0)
      const stockDistribuido = kits.value.reduce((a: number, k: any) => a + (k.stock_comprometido ?? 0), 0)
      const stockBajo        = kits.value.filter((k: any) => stockDisponible(k) < 20).length
      kpis.value = { ...kpis.value, stockAlmacen, stockDistribuido, stockBajo }
    }
  } catch { /* silencioso */ }
}

const cargarSolicitudes = async (pagina = 1) => {
  cargandoSol.value = true
  errorMsg.value    = ''
  try {
    const params = new URLSearchParams({
      page: String(pagina),
      origen_abastecimiento: filtroOrigenSol.value,
    })
    const res  = await fetch(`${API_BASE}/workspace/admin/solicitudes/pendientes?${params.toString()}`, { headers: hdrs() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (json.status === 'success') {
      solicitudes.value           = json.data.data ?? json.data
      solicitudesPendientes.value = solicitudes.value.length
      metaSol.value = {
        total:        json.data.total        ?? solicitudes.value.length,
        current_page: json.data.current_page ?? 1,
        last_page:    json.data.last_page    ?? 1,
      }

      if (solicitudes.value.length > 0) {
        const alreadySelected = solicitudes.value.find((item: any) => item.solicitud_id === detalleSolicitud.value?.solicitud_id)
        await seleccionarSolicitud((alreadySelected ?? solicitudes.value[0]).solicitud_id)
      } else {
        detalleSolicitud.value = null
      }
    } else {
      errorMsg.value = json.message ?? 'Error al cargar solicitudes.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar con el servidor.'
  } finally {
    cargandoSol.value = false
  }
}

const seleccionarSolicitud = async (solicitudId: number) => {
  cargandoDetalle.value = true
  try {
    const res = await fetch(`${API_BASE}/workspace/admin/solicitudes/${solicitudId}`, { headers: hdrs() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (json.status === 'success') {
      detalleSolicitud.value = json.data
    } else {
      errorMsg.value = json.message ?? 'No se pudo cargar el detalle de la solicitud.'
    }
  } catch {
    errorMsg.value = 'No se pudo cargar el detalle de la solicitud.'
  } finally {
    cargandoDetalle.value = false
  }
}

const verContrato = async (solicitud: any) => {
  const contratoId = solicitud?.contrato?.id

  if (!contratoId) {
    errorMsg.value = 'Esta solicitud no tiene contrato disponible.'
    return
  }

  abriendoContratoId.value = contratoId
  errorMsg.value = ''

  try {
    const res = await fetch(`${API_BASE}/workspace/admin/contratos/${contratoId}`, { headers: hdrs() })
    if (res.status === 401) { cerrarSesion(); return }

    const json = await res.json()
    if (json.status !== 'success') {
      errorMsg.value = json.message ?? 'No se pudo abrir el contrato.'
      return
    }

    const pdfUrl = json.data?.pdf_url
    if (!pdfUrl) {
      errorMsg.value = 'El PDF del contrato no está disponible en este momento.'
      return
    }

    const pdfRes = await fetch(pdfUrl, {
      headers: authHeaders(),
    })

    if (pdfRes.status === 401) { cerrarSesion(); return }
    if (!pdfRes.ok) {
      errorMsg.value = 'No se pudo descargar el PDF del contrato.'
      return
    }

    const pdfBlob = await pdfRes.blob()
    const objectUrl = URL.createObjectURL(pdfBlob)
    window.open(objectUrl, '_blank', 'noopener,noreferrer')
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000)
  } catch {
    errorMsg.value = 'No se pudo abrir el contrato.'
  } finally {
    abriendoContratoId.value = null
  }
}

const aprobarSolicitud = async (s: any) => {
  procesando.value = s.solicitud_id
  errorMsg.value   = ''
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/solicitudes/${s.solicitud_id}/aprobar`, { method: 'POST', headers: hdrs() })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      successMsg.value = `✅ Solicitud aprobada. Contrato: ${json.data?.numero_contrato ?? ''}`
      setTimeout(() => { successMsg.value = '' }, 4000)
      await cargarSolicitudes(metaSol.value.current_page)
      await cargarKits()
    } else {
      errorMsg.value = json.message ?? 'Error al aprobar.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar.'
  } finally {
    procesando.value = null
  }
}

const abrirModalRechazar = (s: any) => {
  solicitudSeleccionada.value = s
  motivoRechazo.value         = ''
  errorMotivo.value           = ''
  modalRechazar.value         = true
}

const rechazarSolicitud = async () => {
  if (!motivoRechazo.value.trim()) { errorMotivo.value = 'El motivo es obligatorio.'; return }
  if (!solicitudSeleccionada.value) return
  procesando.value = solicitudSeleccionada.value.solicitud_id
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/solicitudes/${solicitudSeleccionada.value.solicitud_id}/rechazar`, {
      method: 'POST', headers: hdrs(),
      body: JSON.stringify({ motivo: motivoRechazo.value })
    })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      successMsg.value    = '❌ Solicitud rechazada.'
      modalRechazar.value = false
      setTimeout(() => { successMsg.value = '' }, 3000)
      await cargarSolicitudes(metaSol.value.current_page)
    } else {
      errorMsg.value = json.message ?? 'Error al rechazar.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar.'
  } finally {
    procesando.value = null
  }
}

const cambiarPaginaSol = (p: number) => cargarSolicitudes(p)

onMounted(async () => {
  await ensureCurrencyLoaded()
  await cargarKits()
  await cargarSolicitudes()
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
.page-body { padding:24px 28px; display:flex; flex-direction:column; gap:20px; }
.page-header { display:flex; align-items:center; justify-content:space-between; }
.page-title { font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
.page-subtitle { font-size:13px; color:#999; margin:0; }
.alert-error { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-success { background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-close { background:none; border:none; cursor:pointer; font-size:16px; }
.kpi-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
.kpi-card { background:white; border-radius:12px; padding:18px 20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); border:1.5px solid #e2e8f0; display:flex; flex-direction:column; gap:4px; }
.kpi-card.kpi-warn   { border-color:#fde68a; }
.kpi-card.kpi-danger { border-color:#fca5a5; }
.kpi-top { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:6px; }
.kpi-val { font-size:28px; font-weight:700; }
.kpi-blue-txt   { color:#2563eb; }
.kpi-teal-txt   { color:#059669; }
.kpi-orange-txt { color:#d97706; }
.kpi-red-txt    { color:#dc2626; }
.kpi-icon { width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; }
.kpi-icon.blue   { background:#dbeafe; color:#2563eb; }
.kpi-icon.teal   { background:#d1fae5; color:#059669; }
.kpi-icon.orange { background:#fef3c7; color:#d97706; }
.kpi-icon.red    { background:#fee2e2; color:#dc2626; }
.kpi-label { font-size:13px; font-weight:600; color:#333; }
.kpi-sub   { font-size:11px; color:#999; }
.card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.section-title { font-size:15px; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
.section-sub   { font-size:12px; color:#999; margin:0 0 16px; }
.section-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; flex-wrap:wrap; gap:10px; }
.stock-section { background:#0f1b2d !important; }
.stock-section .section-title { color:white; }
.stock-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:12px; }
.stock-item { background:#162236; border-radius:10px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.stock-item.stock-low { background:#1a0a0a; border:1px solid #ef4444; }
.stock-kit-name { font-size:11px; color:#7eb8e8; font-weight:600; }
.stock-val  { font-size:26px; font-weight:700; color:white; }
.val-red    { color:#ef4444 !important; }
.stock-unit { font-size:10px; color:#4a6080; margin-bottom:6px; }
.stock-bar  { height:4px; background:#1a2d45; border-radius:4px; overflow:hidden; }
.stock-fill { height:100%; border-radius:4px; }
.tabs-bar { display:flex; gap:4px; border-bottom:2px solid #e2e8f0; }
.tab-btn { display:flex; align-items:center; gap:6px; padding:10px 16px; border:none; background:none; font-size:13px; font-weight:500; color:#888; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; transition:color 0.2s,border-color 0.2s; }
.tab-btn.active { color:#1a6ab5; border-bottom-color:#1a6ab5; font-weight:600; }
.tab-badge { background:#ef4444; color:white; font-size:10px; padding:1px 6px; border-radius:10px; font-weight:700; }
.table-filters { display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:14px; }
.search-wide { width:240px; }
.select-filter { border:1px solid #e2e8f0; border-radius:8px; padding:6px 12px; font-size:13px; color:#444; outline:none; background:white; cursor:pointer; }
.date-input-sm { border:1px solid #e2e8f0; border-radius:8px; padding:6px 10px; font-size:12px; color:#444; outline:none; }
.loading-state { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; color:#999; font-size:13px; }
.spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#4ab8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 14px; text-align:left; font-weight:600; font-size:12px; white-space:nowrap; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
.data-table tbody tr:hover { background:#f8fafc; }
.inventory-row-selected { background:#eff6ff; }
.data-table td { padding:10px 14px; vertical-align:middle; }
.td-fecha { color:#888; font-size:11px; white-space:nowrap; }
.td-kit   { font-weight:600; color:#333; }
.td-center { text-align:center; font-weight:600; color:#333; }
.td-monto { font-weight:700; color:#1a1a1a; }
.td-pos   { color:#22c55e; font-weight:700; text-align:center; }
.td-neg   { color:#ef4444; font-weight:700; text-align:center; }
.td-lider { color:#555; font-size:12px; }
.td-admin { color:#666; font-size:12px; }
.td-stock { font-weight:600; color:#1a1a1a; }
.lider-info { display:flex; align-items:center; gap:8px; }
.lider-avatar { width:30px; height:30px; border-radius:50%; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); color:white; font-weight:700; font-size:10px; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.lider-name { font-weight:600; color:#1a1a1a; font-size:12px; }
.tipo-cell { display:flex; align-items:center; gap:6px; }
.dot-tipo  { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
.badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:11px; font-weight:600; }
.sol-pendiente  { background:#fef3c7; color:#b45309; }
.sol-aprobada   { background:#dcfce7; color:#166534; }
.sol-rechazada  { background:#fee2e2; color:#991b1b; }
.tipo-entradas   { background:#dcfce7; color:#166534; }
.tipo-asignación { background:#dbeafe; color:#1e40af; }
.tipo-salida     { background:#fee2e2; color:#991b1b; }
.tipo-merma      { background:#fef3c7; color:#b45309; }
.text-muted { color:#999; font-size:12px; }
.acciones { display:flex; gap:6px; }
.btn-aprobar { display:flex; align-items:center; gap:4px; padding:5px 12px; border:none; border-radius:6px; background:#dcfce7; color:#166534; font-size:12px; font-weight:600; cursor:pointer; }
.btn-aprobar:hover { background:#bbf7d0; }
.btn-aprobar:disabled { opacity:0.5; cursor:not-allowed; }
.btn-rechazar { display:flex; align-items:center; gap:4px; padding:5px 12px; border:none; border-radius:6px; background:#fee2e2; color:#991b1b; font-size:12px; font-weight:600; cursor:pointer; }
.btn-rechazar:hover { background:#fecaca; }
.btn-contract-view { display:inline-flex; align-items:center; justify-content:center; padding:9px 14px; border:none; border-radius:8px; background:#162236; color:#fff; font-size:12px; font-weight:700; cursor:pointer; white-space:nowrap; }
.btn-contract-view:hover { background:#1f3350; }
.btn-contract-view:disabled { opacity:0.6; cursor:not-allowed; }
.empty-state { text-align:center; color:#999; padding:40px; font-size:13px; }
.table-footer { display:flex; align-items:center; justify-content:space-between; margin-top:16px; padding-top:14px; border-top:1px solid #f0f0f0; }
.request-detail-card { margin-top:20px; padding-top:20px; border-top:1px solid #e2e8f0; }
.request-detail-layout { display:flex; flex-direction:column; gap:16px; }
.request-summary-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
.detail-metric-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; flex-direction:column; gap:4px; }
.detail-metric-label { font-size:11px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:0.08em; }
.detail-metric-card strong { color:#162033; font-size:15px; }
.detail-metric-card small { color:#64748b; font-size:12px; }
.request-panels-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:14px; }
.request-panel-block { background:#fffaf2; border:1px solid #f1e1c1; border-radius:14px; padding:16px; }
.request-panel-title { margin:0 0 12px; font-size:14px; font-weight:700; color:#162033; }
.request-definition-list { display:flex; flex-direction:column; gap:12px; margin:0; }
.request-definition-list div { display:flex; flex-direction:column; gap:4px; }
.request-definition-list dt { font-size:11px; font-weight:700; color:#8c5f2c; text-transform:uppercase; letter-spacing:0.08em; }
.request-definition-list dd { margin:0; font-size:12px; color:#374151; word-break:break-word; }
.detail-state { padding:24px 0; }
.inventory-placeholder { min-height:260px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:10px; text-align:center; color:#64748b; background:linear-gradient(135deg,#fffaf2,#ffffff); border:1px dashed #e2c78f; border-radius:16px; padding:24px; }
.inventory-placeholder__icon { width:52px; height:52px; border-radius:50%; display:flex; align-items:center; justify-content:center; background:#fff1d6; color:#8c5f2c; font-size:24px; font-weight:700; }
.inventory-placeholder__title { margin:0; font-size:16px; color:#162033; }
.inventory-placeholder__copy { margin:0; max-width:52ch; font-size:13px; line-height:1.6; }
.table-count { font-size:12px; color:#999; }
.pagination { display:flex; gap:6px; }
.page-btn { padding:5px 12px; border:1px solid #ddd; border-radius:6px; background:white; font-size:12px; cursor:pointer; color:#555; }
.page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.page-btn.active { background:#1a6ab5; color:white; border-color:#1a6ab5; }
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
@media (max-width: 1100px) {
  .request-summary-grid,
  .request-panels-grid,
  .kpi-grid,
  .stock-grid { grid-template-columns:repeat(2,1fr); }
}
@media (max-width: 720px) {
  .request-summary-grid,
  .request-panels-grid,
  .kpi-grid,
  .stock-grid { grid-template-columns:1fr; }
}
</style>