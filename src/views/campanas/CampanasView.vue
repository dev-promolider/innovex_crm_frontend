<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">
        Inicio ›
        <span v-if="!campanaSeleccionada"><strong>Campañas</strong></span>
        <span v-else>
          <a href="#" @click.prevent="volverALista" class="breadcrumb-link">Campañas</a>
          › <strong>{{ campanaSeleccionada.nombre }}</strong>
        </span>
      </span>
    </template>

    <!-- ══════════════════════════════════════════════ -->
    <!-- VISTA 1: LISTA DE CAMPAÑAS                    -->
    <!-- ══════════════════════════════════════════════ -->
    <div v-if="!campanaSeleccionada" class="page-body">

        <div v-if="errorMsg" class="alert-error">
          {{ errorMsg }}
          <button @click="errorMsg = ''" class="alert-close">✕</button>
        </div>

        <div v-if="successMsg" class="alert-success">
          {{ successMsg }}
          <button @click="successMsg = ''" class="alert-close">✕</button>
        </div>

        <div class="page-header">
          <div>
            <h1 class="page-title">Campañas y Kits</h1>
            <p class="page-subtitle">
              <span v-if="cargando">Cargando...</span>
              <span v-else>{{ meta.total ?? campanas.length }} campañas encontradas</span>
            </p>
          </div>
          <button class="btn-primary" @click="abrirModalCampana()">+ Nueva Campaña</button>
        </div>

        <div class="content-layout">
          <!-- Panel filtros -->
          <aside class="filters-panel">
            <h3 class="filters-title">Filtros</h3>
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
            <div class="filter-section resumen-box">
              <h4 class="resumen-title">Resumen</h4>
              <div class="resumen-row"><span>Total campañas</span><span class="resumen-val">{{ meta.total ?? campanas.length }}</span></div>
              <div class="resumen-row"><span>Activas</span><span class="resumen-val">{{ contarEstado('activa') }}</span></div>
              <div class="resumen-row"><span>Kits definidos</span><span class="resumen-val">{{ totalKitsDefinidos }}</span></div>
              <div class="resumen-row"><span>Ventas validadas</span><span class="resumen-val">—</span></div>
            </div>
          </aside>

          <!-- Tabla -->
          <div class="table-area">
            <div class="table-toolbar">
              <div class="search-box">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <input type="text" v-model="busqueda" placeholder="Buscar campaña..." class="search-input" />
              </div>
            </div>

            <div v-if="cargando" class="loading-state">
              <div class="spinner"></div>
              <span>Cargando campañas...</span>
            </div>

            <div v-else class="table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Campaña</th>
                    <th>Fechas</th>
                    <th>Kits</th>
                    <th>Stock Central</th>
                    <th>Movido a Red</th>
                    <th>Colocación</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="campanasFiltradas.length === 0">
                    <td colspan="7" class="empty-state">No se encontraron campañas.</td>
                  </tr>
                  <tr v-for="c in campanasFiltradas" :key="c.id" class="tr-clickable" @click="verDetalle(c)">
                    <td>
                      <div class="camp-name">{{ c.nombre }}</div>
                      <div class="camp-desc">{{ c.descripcion ?? '—' }}</div>
                    </td>
                    <td class="td-dates">
                      <span>{{ formatFecha(c.fecha_inicio) }}</span>
                      <span>{{ formatFecha(c.fecha_fin) }}</span>
                    </td>
                    <td class="td-center">{{ kitsMeta[c.id]?.total ?? '—' }}</td>
                    <td class="td-center">{{ kitsMeta[c.id]?.stockCentral ?? '—' }}</td>
                    <td class="td-center">{{ kitsMeta[c.id]?.stockMovidoRed ?? '—' }}</td>
                    <td class="td-progress">
                      <div class="progress-bar">
                        <div class="progress-fill"
                             :style="{ width: (kitsMeta[c.id]?.progreso ?? 0) + '%',
                                       background: colorProgreso(kitsMeta[c.id]?.progreso ?? 0) }">
                        </div>
                      </div>
                      <span class="progress-pct">{{ kitsMeta[c.id]?.progreso ?? 0 }}%</span>
                    </td>
                    <td>
                      <span class="badge" :class="'estado-' + c.estado">{{ c.estado }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="meta.last_page > 1" class="pagination">
                <button :disabled="meta.current_page === 1" @click="cambiarPagina(meta.current_page - 1)" class="page-btn">‹</button>
                <span class="page-info">Página {{ meta.current_page }} de {{ meta.last_page }}</span>
                <button :disabled="meta.current_page === meta.last_page" @click="cambiarPagina(meta.current_page + 1)" class="page-btn">›</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ══════════════════════════════════════════════ -->
      <!-- VISTA 2: DETALLE DE CAMPAÑA + KITS            -->
      <!-- ══════════════════════════════════════════════ -->
      <div v-else class="page-body">

        <div v-if="errorMsg" class="alert-error">
          {{ errorMsg }}
          <button @click="errorMsg = ''" class="alert-close">✕</button>
        </div>

        <div v-if="successMsg" class="alert-success">
          {{ successMsg }}
          <button @click="successMsg = ''" class="alert-close">✕</button>
        </div>

        <div class="detalle-header">
          <button class="btn-back" @click="volverALista">← Volver</button>
          <div class="detalle-info">
            <div>
              <h1 class="page-title">{{ campanaSeleccionada.nombre }}</h1>
              <p class="page-subtitle">{{ campanaSeleccionada.descripcion ?? 'Sin descripción' }}</p>
            </div>
            <div class="detalle-meta">
              <span class="badge" :class="'estado-' + campanaSeleccionada.estado">{{ campanaSeleccionada.estado }}</span>
              <span class="meta-fechas">{{ formatFecha(campanaSeleccionada.fecha_inicio) }} — {{ formatFecha(campanaSeleccionada.fecha_fin) }}</span>
            </div>
          </div>
          <div class="detalle-acciones">
            <button
              v-if="campanaSeleccionada.estado === 'borrador'"
              class="btn-primary"
              @click="cambiarEstadoCampana('activar')"
              :disabled="guardando"
            >
              {{ guardando ? 'Procesando...' : 'Activar' }}
            </button>
            <button
              v-if="campanaSeleccionada.estado === 'activa'"
              class="btn-outline"
              @click="cambiarEstadoCampana('pausar')"
              :disabled="guardando"
            >
              {{ guardando ? 'Procesando...' : 'Pausar' }}
            </button>
            <button
              v-if="campanaSeleccionada.estado === 'pausada'"
              class="btn-primary"
              @click="cambiarEstadoCampana('activar')"
              :disabled="guardando"
            >
              {{ guardando ? 'Procesando...' : 'Reactivar' }}
            </button>
            <button
              v-if="campanaSeleccionada.estado === 'activa' || campanaSeleccionada.estado === 'pausada'"
              class="btn-danger"
              @click="cambiarEstadoCampana('finalizar')"
              :disabled="guardando"
            >
              {{ guardando ? 'Procesando...' : 'Finalizar' }}
            </button>
            <button class="btn-outline" @click="abrirModalCampana(campanaSeleccionada)">Editar campaña</button>
            <button
              v-if="campanaSeleccionada.estado === 'borrador'"
              class="btn-danger"
              @click="abrirModalEliminar(campanaSeleccionada)"
              :disabled="guardando"
            >
              Eliminar
            </button>
            <button class="btn-primary" @click="abrirModalKit()">+ Nuevo Kit</button>
          </div>
        </div>

        <div class="table-area" style="margin-top:0">
          <div class="table-toolbar">
            <h3 style="font-size:15px;font-weight:700;color:#1a1a1a;margin:0">
              Kits de esta campaña
              <span style="font-size:12px;color:#999;font-weight:400;margin-left:8px">{{ kits.length }} kits</span>
            </h3>
          </div>

          <div v-if="cargandoKits" class="loading-state">
            <div class="spinner"></div>
            <span>Cargando kits...</span>
          </div>

          <div v-else class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Kit</th>
                  <th>Precio</th>
                  <th>Stock Central</th>
                  <th>Reservado</th>
                  <th>Disp. Central</th>
                  <th>En Red</th>
                  <th>Vendidos</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="kits.length === 0">
                  <td colspan="9" class="empty-state">No hay kits en esta campaña. ¡Crea el primero!</td>
                </tr>
                <tr v-for="k in kits" :key="k.id">
                  <td>
                    <div class="camp-name">{{ k.nombre }}</div>
                    <div class="camp-desc">{{ k.descripcion ?? '—' }}</div>
                  </td>
                  <td class="td-center">{{ formatCurrency(k.precio_unitario) }}</td>
                  <td class="td-center">{{ k.stock_central }}</td>
                  <td class="td-center">{{ k.stock_comprometido }}</td>
                  <td class="td-center">
                    <span :class="stockCentralDisponible(k) > 0 ? 'stock-ok' : 'stock-agotado'">
                      {{ stockCentralDisponible(k) }}
                    </span>
                  </td>
                  <td class="td-center">{{ stockEnRed(k) }}</td>
                  <td class="td-center">{{ stockVendido(k) }}</td>
                  <td>
                    <span class="badge" :class="k.activo ? 'estado-activa' : 'estado-borrador'">
                      {{ k.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="td-actions">
                    <button class="btn-action" @click="verDetalleKit(k)">Ver detalle</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

    <!-- ── Modal Crear/Editar Campaña ── -->
    <div v-if="modalCampana" class="modal-overlay" @click.self="modalCampana = false">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ modoEdicion ? 'Editar Campaña' : 'Nueva Campaña' }}</h2>
          <button class="modal-close" @click="modalCampana = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="formCampana.nombre" type="text" placeholder="Nombre de la campaña" class="form-input" />
            <span v-if="formErrors.nombre" class="form-error">{{ formErrors.nombre }}</span>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formCampana.descripcion" placeholder="Descripción opcional" class="form-input form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Estado *</label>
              <select v-model="formCampana.estado" class="form-input">
                <option value="borrador">Borrador</option>
                <option value="activa">Activa</option>
                <option value="pausada">Pausada</option>
                <option value="finalizada">Finalizada</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Fecha Inicio</label>
              <input v-model="formCampana.fecha_inicio" type="date" class="form-input" />
            </div>
            <div class="form-group">
              <label>Fecha Fin</label>
              <input v-model="formCampana.fecha_fin" type="date" class="form-input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalCampana = false">Cancelar</button>
          <button class="btn-primary" @click="guardarCampana" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (modoEdicion ? 'Actualizar' : 'Crear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal Crear Kit ── -->
    <div v-if="modalKit" class="modal-overlay" @click.self="modalKit = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>{{ modoEdicionKit ? 'Editar Kit' : 'Nuevo Kit' }}</h2>
          <button class="modal-close" @click="modalKit = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="formKit.nombre" type="text" placeholder="Nombre del kit" class="form-input" />
            <span v-if="kitErrors.nombre" class="form-error">{{ kitErrors.nombre }}</span>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <textarea v-model="formKit.descripcion" placeholder="Descripción opcional" class="form-input form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Precio por kit ({{ currencyCode }}) *</label>
              <span class="form-help">Monto de venta de un kit completo, no de cada producto individual.</span>
              <input v-model="formKit.precio_unitario" type="number" min="0.01" step="0.01" placeholder="0.00" class="form-input" />
              <span v-if="kitErrors.precio_unitario" class="form-error">{{ kitErrors.precio_unitario }}</span>
            </div>
            <div class="form-group">
              <label>Kits disponibles al inicio *</label>
              <span class="form-help">Cantidad de kits completos que tendras listos para distribuir.</span>
              <input v-model="formKit.stock_central" type="number" min="0" placeholder="0" class="form-input" />
              <span v-if="kitErrors.stock_central" class="form-error">{{ kitErrors.stock_central }}</span>
            </div>
          </div>
          <div class="form-group">
            <label>Contenido del Kit *</label>
            <span class="form-help">Indica cuantas unidades de cada producto incluye un solo kit.</span>
            <div v-for="(prod, i) in formKit.productos" :key="i" class="producto-row">
              <input v-model="prod.nombre" type="text" placeholder="Nombre del producto" class="form-input" />
              <input v-model.number="prod.cantidad" type="number" min="1" placeholder="Unid./kit" aria-label="Unidades por kit" class="form-input form-input-sm" />
              <button class="btn-remove" @click="eliminarProducto(i)" v-if="formKit.productos.length > 1">✕</button>
            </div>
            <button class="btn-add-producto" @click="agregarProducto">+ Agregar producto</button>
            <span v-if="kitErrors.contenido_detalle" class="form-error">{{ kitErrors.contenido_detalle }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalKit = false">Cancelar</button>
          <button class="btn-primary" @click="guardarKit" :disabled="guardando">
            {{ guardando ? 'Guardando...' : (modoEdicionKit ? 'Actualizar Kit' : 'Crear Kit') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ── Modal Detalle Kit ── -->
    <div v-if="modalContenido" class="modal-overlay" @click.self="modalContenido = false">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h2>Detalle del kit</h2>
          <button class="modal-close" @click="modalContenido = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="kit-detail-header">
            <div>
              <div class="camp-name">{{ kitDetalle?.nombre }}</div>
              <div class="camp-desc">{{ kitDetalle?.descripcion ?? 'Sin descripción' }}</div>
            </div>
            <span class="badge" :class="kitDetalle?.activo ? 'estado-activa' : 'estado-borrador'">
              {{ kitDetalle?.activo ? 'Activo' : 'Inactivo' }}
            </span>
          </div>

          <div class="kit-detail-grid">
            <div class="kit-detail-card">
              <span class="kit-detail-label">Precio por kit</span>
              <strong>{{ formatCurrency(kitDetalle?.precio_unitario ?? 0) }}</strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Stock central</span>
              <strong>{{ kitDetalle?.stock_central ?? 0 }}</strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Reservado central</span>
              <strong>{{ kitDetalle?.stock_comprometido ?? 0 }}</strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Disponible central</span>
              <strong :class="stockCentralDisponible(kitDetalle) > 0 ? 'stock-ok' : 'stock-agotado'">
                {{ stockCentralDisponible(kitDetalle) }}
              </strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Stock en red</span>
              <strong>{{ stockEnRed(kitDetalle) }}</strong>
            </div>
            <div class="kit-detail-card">
              <span class="kit-detail-label">Vendidos</span>
              <strong>{{ stockVendido(kitDetalle) }}</strong>
            </div>
          </div>

          <div>
            <div class="section-title">Contenido del kit</div>
            <table class="data-table">
              <thead><tr><th>Producto</th><th>Unidades por kit</th></tr></thead>
              <tbody>
                <tr v-if="detalleProductos.length === 0">
                  <td colspan="2" class="empty-state">No hay productos configurados para este kit.</td>
                </tr>
                <tr v-for="(p, i) in detalleProductos" :key="i">
                  <td>{{ p.nombre }}</td>
                  <td class="td-center">{{ p.cantidad }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-outline" @click="editarKitDesdeDetalle" :disabled="guardando">Editar</button>
          <button class="btn-danger" @click="toggleKitActivo(kitDetalle)" :disabled="guardando">
            {{ guardando ? 'Procesando...' : (kitDetalle?.activo ? 'Desactivar' : 'Activar') }}
          </button>
          <button class="btn-secondary" @click="modalContenido = false">Cerrar</button>
        </div>
      </div>
    </div>

    <!-- ── Modal Confirmar Eliminar ── -->
    <div v-if="modalEliminar" class="modal-overlay" @click.self="modalEliminar = false">
      <div class="modal modal-sm">
        <div class="modal-header">
          <h2>Eliminar Campaña</h2>
          <button class="modal-close" @click="modalEliminar = false">✕</button>
        </div>
        <div class="modal-body">
          <p>¿Estás seguro de eliminar <strong>{{ campanaAEliminar?.nombre }}</strong>?</p>
        </div>
        <div class="modal-footer">
          <button class="btn-secondary" @click="modalEliminar = false">Cancelar</button>
          <button class="btn-danger" @click="eliminarCampana" :disabled="guardando">
            {{ guardando ? 'Eliminando...' : 'Sí, eliminar' }}
          </button>
        </div>
      </div>
    </div>

  </AppShell>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { API_BASE_URL } from '@/app/apiClient'
import AppShell from '../../components/layout/AppShell.vue'
import { useAuthenticatedSession } from '../../composables/useAuthenticatedSession'
import { useWorkspaceCurrency } from '../../composables/useWorkspaceCurrency'

const API_BASE = API_BASE_URL
const { authHeaders, logout: cerrarSesion } = useAuthenticatedSession()
const { currencyCode, ensureCurrencyLoaded, formatCurrency } = useWorkspaceCurrency()

const hdrs = () => authHeaders({ 'Content-Type': 'application/json' })

// ── Campañas state ──
const campanas     = ref<any[]>([])
const cargando     = ref(false)
const guardando    = ref(false)
const errorMsg     = ref('')
const successMsg   = ref('')
const busqueda     = ref('')
const filtroEstado = ref('todos')
const fechaInicio  = ref('')
const fechaFin     = ref('')
const meta         = ref({ total: 0, current_page: 1, last_page: 1 })
// kits metadata por campaña: { [campanaId]: { total, stockInicial, comprometido, progreso } }
const kitsMeta     = ref<Record<number, any>>({})

const modalCampana     = ref(false)
const modoEdicion      = ref(false)
const campanaEditando  = ref<any>(null)
const modalEliminar    = ref(false)
const campanaAEliminar = ref<any>(null)
const formErrors       = ref<Record<string, string>>({})
const formCampana      = ref({ nombre: '', descripcion: '', estado: 'borrador', fecha_inicio: '', fecha_fin: '' })

// ── Kits state ──
const campanaSeleccionada = ref<any>(null)
const kits                = ref<any[]>([])
const cargandoKits        = ref(false)
const modalKit            = ref(false)
const modoEdicionKit      = ref(false)
const kitEditando         = ref<any>(null)
const kitErrors           = ref<Record<string, string>>({})
const modalContenido      = ref(false)
const kitDetalle          = ref<any>(null)
const crearFormKitVacio   = () => ({ nombre: '', descripcion: '', precio_unitario: '', stock_central: '', productos: [{ nombre: '', cantidad: 1 }] })
const formKit             = ref(crearFormKitVacio())

const opcionesEstado = [
  { value: 'todos',      label: 'Todos',      color: '#4ab8f5' },
  { value: 'activa',     label: 'Activa',     color: '#22c55e' },
  { value: 'pausada',    label: 'Pausada',    color: '#f59e0b' },
  { value: 'borrador',   label: 'Borrador',   color: '#94a3b8' },
  { value: 'finalizada', label: 'Finalizada', color: '#6366f1' },
]

const formatFecha = (f: string | null) => {
  if (!f) return '—'
  const fecha = new Date(f)
  return isNaN(fecha.getTime()) ? '—' : fecha.toLocaleDateString('es-PE')
}
const toDateInputValue = (value: string | null | undefined) => {
  if (!value) return ''

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  const fecha = new Date(value)
  return isNaN(fecha.getTime()) ? '' : fecha.toISOString().slice(0, 10)
}
const limpiarMensajes = () => {
  errorMsg.value = ''
  successMsg.value = ''
}
const contarEstado    = (e: string) => campanas.value.filter(c => c.estado === e).length
const toNumber = (value: unknown) => Number(value ?? 0)
const stockCentralDisponible = (k: any) => toNumber(k?.stock_central_disponible ?? (toNumber(k?.stock_central) - toNumber(k?.stock_comprometido)))
const stockEnRed = (k: any) => toNumber(k?.stock_distribuido_disponible) + toNumber(k?.stock_distribuido_comprometido)
const stockVendido = (k: any) => toNumber(k?.stock_distribuido_vendido)
const stockMovidoRed = (k: any) => toNumber(k?.stock_distribuido_total ?? (stockEnRed(k) + stockVendido(k)))
const totalKitsDefinidos = computed(() => Object.values(kitsMeta.value).reduce((a: number, m: any) => a + (m.total ?? 0), 0))
const normalizarProductosKit = (contenidoDetalle: any) => {
  const productos = contenidoDetalle?.productos

  if (Array.isArray(productos)) {
    return productos.map((producto: any) => {
      if (typeof producto === 'string') {
        return { nombre: producto, cantidad: 1 }
      }

      return {
        nombre: producto?.nombre ?? 'Producto sin nombre',
        cantidad: Number(producto?.cantidad ?? 1),
      }
    })
  }

  if (productos && typeof productos === 'object') {
    return Object.entries(productos).map(([nombre, cantidad]) => ({
      nombre,
      cantidad: Number(cantidad ?? 1),
    }))
  }

  return []
}

const detalleProductos = computed(() => {
  return normalizarProductosKit(kitDetalle.value?.contenido_detalle)
})

const colorProgreso = (pct: number) => {
  if (pct >= 60) return '#22c55e'
  if (pct >= 30) return '#f59e0b'
  return '#ef4444'
}

const campanasFiltradas = computed(() =>
  campanas.value.filter(c => {
    const matchEstado   = filtroEstado.value === 'todos' || c.estado === filtroEstado.value
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.value.toLowerCase())
    const campaignStart = c.fecha_inicio ? new Date(`${c.fecha_inicio}T00:00:00`) : null
    const campaignEnd = c.fecha_fin ? new Date(`${c.fecha_fin}T23:59:59`) : campaignStart
    const fromDate = fechaInicio.value ? new Date(`${fechaInicio.value}T00:00:00`) : null
    const toDate = fechaFin.value ? new Date(`${fechaFin.value}T23:59:59`) : null
    const matchDesde = !fromDate || !campaignEnd || campaignEnd >= fromDate
    const matchHasta = !toDate || !campaignStart || campaignStart <= toDate
    return matchEstado && matchBusqueda && matchDesde && matchHasta
  })
)

// ── API ──
const hdrsGet = () => authHeaders({ Accept: 'application/json' })

const cargarKitsMeta = async (campanaId: number) => {
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/kits?campana_id=${campanaId}`, { headers: hdrsGet() })
    const json = await res.json()
    if (json.status === 'success') {
      const lista: any[] = json.data.data ?? json.data
      const stockCentral = lista.reduce((a: number, k: any) => a + stockCentralDisponible(k), 0)
      const stockMovidoRedTotal = lista.reduce((a: number, k: any) => a + stockMovidoRed(k), 0)
      const baseOperativa = stockCentral + stockMovidoRedTotal
      const progreso = baseOperativa > 0 ? Math.round((stockMovidoRedTotal / baseOperativa) * 100) : 0
      kitsMeta.value[campanaId] = { total: lista.length, stockCentral, stockMovidoRed: stockMovidoRedTotal, progreso }
    }
  } catch { /* silencioso */ }
}

const cargarCampanas = async (pagina = 1) => {
  cargando.value = true; errorMsg.value = ''
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/campanas?page=${pagina}`, { headers: hdrsGet() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (json.status === 'success') {
      campanas.value = json.data.data ?? json.data
      meta.value = { total: json.data.total ?? campanas.value.length, current_page: json.data.current_page ?? 1, last_page: json.data.last_page ?? 1 }
      // cargar metadatos de kits para cada campaña
      campanas.value.forEach((c: any) => cargarKitsMeta(c.id))
      if (campanaSeleccionada.value) {
        const refreshedCampaign = campanas.value.find((item: any) => item.id === campanaSeleccionada.value.id)
        if (refreshedCampaign) {
          campanaSeleccionada.value = { ...campanaSeleccionada.value, ...refreshedCampaign }
        }
      }
    } else { errorMsg.value = json.message ?? 'Error al cargar campañas.' }
  } catch { errorMsg.value = 'No se pudo conectar con el servidor.' }
  finally { cargando.value = false }
}

const cambiarPagina = (p: number) => cargarCampanas(p)

const abrirModalCampana = (campana?: any) => {
  formErrors.value = {}
  if (campana) {
    modoEdicion.value = true; campanaEditando.value = campana
    formCampana.value = {
      nombre: campana.nombre,
      descripcion: campana.descripcion ?? '',
      estado: campana.estado,
      fecha_inicio: toDateInputValue(campana.fecha_inicio),
      fecha_fin: toDateInputValue(campana.fecha_fin),
    }
  } else {
    modoEdicion.value = false; campanaEditando.value = null
    formCampana.value = { nombre: '', descripcion: '', estado: 'borrador', fecha_inicio: '', fecha_fin: '' }
  }
  modalCampana.value = true
}

const guardarCampana = async () => {
  formErrors.value = {}
  if (!formCampana.value.nombre.trim()) { formErrors.value.nombre = 'El nombre es obligatorio.'; return }
  guardando.value = true
  limpiarMensajes()
  try {
    const url    = modoEdicion.value ? `${API_BASE}/workspace/admin/campanas/${campanaEditando.value.id}` : `${API_BASE}/workspace/admin/campanas`
    const method = modoEdicion.value ? 'PUT' : 'POST'
    const res    = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(formCampana.value) })
    const json   = await res.json()
    if (res.ok && json.status === 'success') {
      modalCampana.value = false
      successMsg.value = json.message ?? 'Campaña guardada correctamente.'
      if (campanaSeleccionada.value) campanaSeleccionada.value = json.data
      await cargarCampanas(meta.value.current_page)
    }
    else if (res.status === 422 && json.errors) { Object.keys(json.errors).forEach(k => { formErrors.value[k] = json.errors[k][0] }) }
    else { errorMsg.value = json.message ?? 'Error al guardar.' }
  } catch { errorMsg.value = 'No se pudo conectar.' }
  finally { guardando.value = false }
}

const eliminarCampana = async () => {
  if (!campanaAEliminar.value) return
  guardando.value = true
  limpiarMensajes()
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/campanas/${campanaAEliminar.value.id}`, { method: 'DELETE', headers: hdrsGet() })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      successMsg.value = json.message ?? 'Campaña eliminada.'
      modalEliminar.value = false
      if (campanaSeleccionada.value?.id === campanaAEliminar.value.id) {
        volverALista()
      }
      await cargarCampanas(meta.value.current_page)
    }
    else { errorMsg.value = json.message ?? 'Error al eliminar.' }
  } catch { errorMsg.value = 'No se pudo conectar.' }
  finally { guardando.value = false }
}

const abrirModalEliminar = (campana: any) => {
  campanaAEliminar.value = campana
  modalEliminar.value = true
}

const verDetalle = async (campana: any) => {
  cargandoKits.value = true
  limpiarMensajes()
  try {
    const res = await fetch(`${API_BASE}/workspace/admin/campanas/${campana.id}`, { headers: hdrsGet() })
    if (res.status === 401) { cerrarSesion(); return }
    const json = await res.json()
    if (json.status === 'success') {
      campanaSeleccionada.value = json.data
      kits.value = json.data.kits ?? []
      await cargarKitsMeta(campana.id)
    } else {
      errorMsg.value = json.message ?? 'Error al cargar el detalle de la campaña.'
    }
  } catch {
    errorMsg.value = 'No se pudo cargar el detalle de la campaña.'
  } finally {
    cargandoKits.value = false
  }
}

const volverALista = () => { campanaSeleccionada.value = null; kits.value = [] }

const cargarKits = async (campanaId: number) => {
  cargandoKits.value = true; errorMsg.value = ''
  try {
    const res  = await fetch(`${API_BASE}/workspace/admin/kits?campana_id=${campanaId}`, { headers: hdrsGet() })
    const json = await res.json()
    if (json.status === 'success') { kits.value = json.data.data ?? json.data }
    else { errorMsg.value = json.message ?? 'Error al cargar kits.' }
  } catch { errorMsg.value = 'No se pudo conectar.' }
  finally { cargandoKits.value = false }
}

const cambiarEstadoCampana = async (accion: 'activar' | 'pausar' | 'finalizar') => {
  if (!campanaSeleccionada.value) return

  guardando.value = true
  limpiarMensajes()

  try {
    const res = await fetch(`${API_BASE}/workspace/admin/campanas/${campanaSeleccionada.value.id}/${accion}`, {
      method: 'POST',
      headers: hdrsGet(),
    })
    const json = await res.json()

    if (res.ok && json.status === 'success') {
      successMsg.value = json.message ?? 'Estado de campaña actualizado.'
      await cargarCampanas(meta.value.current_page)
      await verDetalle({ id: campanaSeleccionada.value.id })
    } else {
      errorMsg.value = json.message ?? 'No se pudo cambiar el estado de la campaña.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar para cambiar el estado de la campaña.'
  } finally {
    guardando.value = false
  }
}

const abrirModalKit = (kit?: any) => {
  kitErrors.value = {}
  if (kit) {
    modoEdicionKit.value = true
    kitEditando.value = kit
    formKit.value = {
      nombre: kit.nombre ?? '',
      descripcion: kit.descripcion ?? '',
      precio_unitario: String(kit.precio_unitario ?? ''),
      stock_central: String(kit.stock_central ?? ''),
      productos: normalizarProductosKit(kit.contenido_detalle).length > 0
        ? normalizarProductosKit(kit.contenido_detalle)
        : [{ nombre: '', cantidad: 1 }],
    }
  } else {
    modoEdicionKit.value = false
    kitEditando.value = null
    formKit.value = crearFormKitVacio()
  }
  modalKit.value = true
}

const agregarProducto  = () => formKit.value.productos.push({ nombre: '', cantidad: 1 })
const eliminarProducto = (i: number) => formKit.value.productos.splice(i, 1)

const guardarKit = async () => {
  kitErrors.value = {}
  if (!formKit.value.nombre.trim())       { kitErrors.value.nombre = 'El nombre es obligatorio.'; return }
  if (!formKit.value.precio_unitario)     { kitErrors.value.precio_unitario = 'El precio es obligatorio.'; return }
  if (formKit.value.stock_central === '') { kitErrors.value.stock_central = 'El stock es obligatorio.'; return }
  const productosValidos = formKit.value.productos.filter(p => p.nombre.trim())
  if (productosValidos.length === 0)      { kitErrors.value.contenido_detalle = 'Agrega al menos un producto.'; return }

  guardando.value = true
  limpiarMensajes()
  try {
    const body = {
      campana_id:        campanaSeleccionada.value.id,
      nombre:            formKit.value.nombre,
      descripcion:       formKit.value.descripcion,
      precio_unitario:   parseFloat(formKit.value.precio_unitario),
      stock_central:     parseInt(formKit.value.stock_central),
      contenido_detalle: { productos: productosValidos },
    }
    const url = modoEdicionKit.value
      ? `${API_BASE}/workspace/admin/kits/${kitEditando.value.id}`
      : `${API_BASE}/workspace/admin/kits`
    const method = modoEdicionKit.value ? 'PUT' : 'POST'
    const res  = await fetch(url, { method, headers: hdrs(), body: JSON.stringify(body) })
    const json = await res.json()
    if (res.ok && json.status === 'success') {
      modalKit.value = false
      successMsg.value = json.message ?? (modoEdicionKit.value ? 'Kit actualizado.' : 'Kit creado.')
      await cargarKits(campanaSeleccionada.value.id)
      await cargarKitsMeta(campanaSeleccionada.value.id)
      if (modoEdicionKit.value) {
        kitDetalle.value = json.data
        modalContenido.value = true
      }
    }
    else if (res.status === 422 && json.errors) { Object.keys(json.errors).forEach(k => { kitErrors.value[k] = json.errors[k][0] }) }
    else { errorMsg.value = json.message ?? (modoEdicionKit.value ? 'Error al actualizar kit.' : 'Error al crear kit.') }
  } catch { errorMsg.value = 'No se pudo conectar.' }
  finally { guardando.value = false }
}

const verDetalleKit = (k: any) => { kitDetalle.value = k; modalContenido.value = true }

const editarKitDesdeDetalle = () => {
  if (!kitDetalle.value) return

  modalContenido.value = false
  abrirModalKit(kitDetalle.value)
}

const toggleKitActivo = async (kit: any) => {
  if (!kit?.id || !campanaSeleccionada.value) return

  guardando.value = true
  limpiarMensajes()

  try {
    const res = await fetch(`${API_BASE}/workspace/admin/kits/${kit.id}/toggle`, {
      method: 'POST',
      headers: hdrsGet(),
    })
    const json = await res.json()

    if (res.ok && json.status === 'success') {
      successMsg.value = json.message ?? 'Estado del kit actualizado.'
      kitDetalle.value = json.data
      await cargarKits(campanaSeleccionada.value.id)
      await cargarKitsMeta(campanaSeleccionada.value.id)
    } else {
      errorMsg.value = json.message ?? 'No se pudo actualizar el estado del kit.'
    }
  } catch {
    errorMsg.value = 'No se pudo conectar para actualizar el estado del kit.'
  } finally {
    guardando.value = false
  }
}

onMounted(async () => {
  await ensureCurrencyLoaded()
  await cargarCampanas()
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
.sidebar-brand { font-size:13px; font-weight:800; color:#ffffff; letter-spacing:3px; text-align:center; }
.sidebar-section-label { font-size:10px; font-weight:700; color:#4a6080; letter-spacing:1.5px; text-transform:uppercase; padding:14px 18px 6px; }
.sidebar-nav { display:flex; flex-direction:column; gap:2px; padding:0 10px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; color:#6b8aaa; text-decoration:none; font-size:13px; font-weight:500; transition:background 0.2s,color 0.2s; white-space:nowrap; }
.nav-item:hover { background:#162236; color:#a0c4e8; }
.nav-item.active { background:#1a3a5c; color:#4ab8f5; font-weight:600; }
.nav-item.nav-logout { color:#ef4444; margin-top:2px; }
.nav-item.nav-logout:hover { background:#2a1010; color:#f87171; }
.sidebar-bottom { display:flex; flex-direction:column; gap:2px; padding:0 10px 16px; }
.main-content { margin-left:200px; flex:1; display:flex; flex-direction:column; min-height:100vh; }
.topbar { background:white; height:56px; display:flex; align-items:center; padding:0 24px; gap:16px; border-bottom:1px solid #eee; position:sticky; top:0; z-index:50; }
.topbar-left { min-width:200px; }
.breadcrumb { font-size:13px; color:#999; }
.breadcrumb strong { color:#333; }
.breadcrumb-link { color:#4ab8f5; text-decoration:none; }
.breadcrumb-link:hover { text-decoration:underline; }
.topbar-center { flex:1; display:flex; justify-content:center; }
.search-box { display:flex; align-items:center; gap:8px; background:#f4f6f9; border-radius:20px; padding:6px 14px; width:280px; }
.search-input { border:none; background:transparent; outline:none; font-size:13px; color:#333; width:100%; }
.form-help { display:block; margin:4px 0 8px; color:#64748b; font-size:12px; line-height:1.4; }
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
.detalle-header { display:flex; align-items:center; gap:16px; flex-wrap:wrap; }
.detalle-info { flex:1; }
.detalle-meta { display:flex; align-items:center; gap:12px; margin-top:6px; }
.detalle-acciones { display:flex; gap:10px; align-items:center; }
.meta-fechas { font-size:12px; color:#666; }
.btn-back { display:flex; align-items:center; gap:6px; padding:8px 14px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; white-space:nowrap; }
.btn-back:hover { background:#f4f6f9; }
.btn-primary { display:flex; align-items:center; gap:6px; padding:9px 18px; border:none; border-radius:8px; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); font-size:13px; font-weight:600; color:white; cursor:pointer; }
.btn-primary:disabled { opacity:0.6; cursor:not-allowed; }
.btn-outline { display:flex; align-items:center; gap:6px; padding:9px 18px; border:1px solid #4ab8f5; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#1a6ab5; cursor:pointer; }
.btn-outline:hover { background:#eff6ff; }
.btn-secondary { padding:9px 18px; border:1px solid #ddd; border-radius:8px; background:white; font-size:13px; font-weight:600; color:#555; cursor:pointer; }
.btn-danger { padding:9px 18px; border:none; border-radius:8px; background:#ef4444; font-size:13px; font-weight:600; color:white; cursor:pointer; }
.btn-danger:disabled { opacity:0.6; cursor:not-allowed; }
.alert-error { background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-success { background:#f0fdf4; border:1px solid #bbf7d0; color:#166534; padding:12px 16px; border-radius:8px; display:flex; justify-content:space-between; align-items:center; font-size:13px; }
.alert-close { background:none; border:none; cursor:pointer; color:#b91c1c; font-size:16px; }
.content-layout { display:flex; gap:20px; align-items:flex-start; }
.filters-panel { width:200px; flex-shrink:0; background:white; border-radius:12px; padding:18px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.filters-title { font-size:14px; font-weight:700; color:#1a1a1a; margin:0 0 16px; }
.filter-section { margin-bottom:20px; }
.filter-label { font-size:11px; font-weight:700; color:#888; text-transform:uppercase; letter-spacing:1px; display:block; margin-bottom:8px; }
.filter-options { display:flex; flex-direction:column; gap:6px; }
.filter-radio { display:flex; align-items:center; gap:8px; font-size:13px; color:#444; cursor:pointer; padding:5px 8px; border-radius:6px; transition:background 0.15s; }
.filter-radio input { display:none; }
.filter-radio.active { background:#eff6ff; color:#1a6ab5; font-weight:600; }
.radio-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
.date-label { font-size:11px; color:#888; display:block; margin-bottom:4px; }
.date-input { width:100%; border:1px solid #e2e8f0; border-radius:6px; padding:6px 10px; font-size:12px; color:#333; outline:none; box-sizing:border-box; }
.date-input:focus { border-color:#4ab8f5; }
.resumen-box { background:#f8fafc; border-radius:8px; padding:12px; }
.resumen-title { font-size:12px; font-weight:700; color:#444; margin:0 0 10px; }
.resumen-row { display:flex; justify-content:space-between; font-size:12px; color:#666; padding:3px 0; border-bottom:1px solid #eee; }
.resumen-row:last-child { border-bottom:none; }
.resumen-val { font-weight:700; color:#1a1a1a; }
.table-area { flex:1; background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.table-toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; }
.table-wrap { overflow-x:auto; }
.data-table { width:100%; border-collapse:collapse; font-size:13px; }
.data-table thead tr { background:#1a1a2e; color:white; }
.data-table th { padding:10px 14px; text-align:left; font-weight:600; font-size:12px; }
.data-table tbody tr { border-bottom:1px solid #f0f0f0; transition:background 0.15s; }
.data-table tbody tr:hover { background:#f8fafc; }
.data-table td { padding:12px 14px; vertical-align:middle; }
.tr-clickable { cursor:pointer; }
.camp-name { font-weight:600; color:#1a1a1a; font-size:13px; }
.camp-desc { font-size:11px; color:#999; margin-top:2px; }
.td-dates { font-size:12px; color:#666; display:flex; flex-direction:column; gap:2px; }
.td-center { text-align:center; font-weight:600; color:#333; }
.td-actions { display:flex; gap:6px; }
.td-progress { display:flex; align-items:center; gap:8px; }
.progress-bar { flex:1; height:6px; background:#e2e8f0; border-radius:10px; overflow:hidden; min-width:60px; }
.progress-fill { height:100%; border-radius:10px; transition:width 0.3s; }
.progress-pct { font-size:12px; font-weight:600; color:#555; min-width:32px; }
.btn-action { background:#eff6ff; border:1px solid #bfdbfe; cursor:pointer; font-size:12px; font-weight:600; color:#1d4ed8; padding:6px 10px; border-radius:6px; transition:background 0.15s,border-color 0.15s; }
.btn-action:hover { background:#dbeafe; border-color:#93c5fd; }
.empty-state { text-align:center; color:#999; padding:40px; font-size:13px; }
.stock-ok { color:#166534; font-weight:700; }
.stock-agotado { color:#b91c1c; font-weight:700; }
.badge { display:inline-block; padding:4px 12px; border-radius:20px; font-size:11px; font-weight:600; }
.estado-activa     { background:#dcfce7; color:#166534; }
.estado-finalizada { background:#e0e7ff; color:#3730a3; }
.estado-pausada    { background:#fef3c7; color:#b45309; }
.estado-borrador   { background:#f1f5f9; color:#64748b; }
.pagination { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:16px; }
.page-btn { padding:6px 14px; border:1px solid #ddd; border-radius:6px; background:white; cursor:pointer; font-size:16px; color:#555; }
.page-btn:disabled { opacity:0.4; cursor:not-allowed; }
.page-info { font-size:13px; color:#666; }
.loading-state { display:flex; align-items:center; justify-content:center; gap:12px; padding:60px; color:#999; font-size:13px; }
.spinner { width:20px; height:20px; border:2px solid #e2e8f0; border-top-color:#4ab8f5; border-radius:50%; animation:spin 0.7s linear infinite; }
@keyframes spin { to { transform:rotate(360deg); } }
.modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:200; }
.modal { background:white; border-radius:12px; width:480px; max-width:95vw; box-shadow:0 20px 60px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto; }
.modal-lg { width:560px; }
.modal-sm { width:380px; }
.modal-header { display:flex; align-items:center; justify-content:space-between; padding:20px 24px 0; }
.modal-header h2 { font-size:16px; font-weight:700; color:#1a1a1a; margin:0; }
.modal-close { background:none; border:none; cursor:pointer; font-size:18px; color:#999; }
.modal-body { padding:20px 24px; display:flex; flex-direction:column; gap:14px; }
.modal-body p { font-size:14px; color:#555; margin:0; }
.modal-footer { display:flex; justify-content:flex-end; gap:10px; padding:0 24px 20px; }
.section-title { font-size:13px; font-weight:700; color:#334155; margin-bottom:10px; }
.form-group { display:flex; flex-direction:column; gap:6px; flex:1; }
.form-group label { font-size:12px; font-weight:600; color:#555; }
.form-input { border:1px solid #e2e8f0; border-radius:8px; padding:9px 12px; font-size:13px; color:#333; outline:none; width:100%; box-sizing:border-box; }
.form-input:focus { border-color:#4ab8f5; }
.form-input-sm { width:80px !important; }
.form-textarea { resize:vertical; min-height:70px; }
.form-row { display:flex; gap:12px; }
.form-error { font-size:11px; color:#ef4444; }
.producto-row { display:flex; gap:8px; align-items:center; margin-bottom:8px; }
.btn-remove { background:none; border:none; cursor:pointer; color:#ef4444; font-size:16px; padding:4px; }
.btn-add-producto { background:none; border:1px dashed #4ab8f5; color:#1a6ab5; font-size:12px; font-weight:600; padding:7px 14px; border-radius:8px; cursor:pointer; margin-top:4px; }
.btn-add-producto:hover { background:#eff6ff; }
.kit-detail-header { display:flex; justify-content:space-between; align-items:flex-start; gap:12px; padding-bottom:4px; }
.kit-detail-grid { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px; }
.kit-detail-card { background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; display:flex; flex-direction:column; gap:4px; }
.kit-detail-label { font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.04em; color:#64748b; }
</style>