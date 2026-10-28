<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import AppModal from '@/components/shared/AppModal.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { useClientesApi } from '@/features/clientes/composables/useClientesApi'
import { estadosPedido, type ClienteListItem, type EstadoPedido } from '@/features/clientes/types'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/formatters'

const {
  clientes,
  detalle,
  distribuidores,
  isLoading,
  isDetailLoading,
  isDistributorsLoading,
  isExporting,
  errorMessage,
  exportErrorMessage,
  detailError,
  distributorsError,
  pagination,
  filters,
  fetchClientes,
  fetchDetalle,
  fetchDistribuidores,
  exportarClientes,
} = useClientesApi()
const { isSuperadmin, isWorkspaceAdmin, isFinancialAdmin } = useAuthenticatedSession()

const canFilterDistributor = computed(
  () => isSuperadmin.value || isWorkspaceAdmin.value || isFinancialAdmin.value,
)
const searchInput = ref('')
const detailOpen = ref(false)
const selectedClienteName = ref('')
const dateRangeError = computed(
  () => filters.desde && filters.hasta && filters.desde > filters.hasta,
)
const hasActiveFilters = computed(
  () => Boolean(filters.search || filters.estado || filters.desde || filters.hasta || filters.distribuidor_id),
)

let searchTimer: ReturnType<typeof setTimeout> | undefined

const fetchCurrentPage = () => {
  if (!dateRangeError.value) void fetchClientes(1)
}

watch(searchInput, (value) => {
  if (searchTimer) clearTimeout(searchTimer)
  if (value.trim() === filters.search) return
  searchTimer = setTimeout(() => {
    filters.search = value.trim()
    fetchCurrentPage()
  }, 300)
})

watch(
  () => [filters.estado, filters.desde, filters.hasta, filters.distribuidor_id],
  fetchCurrentPage,
)

const clearFilters = () => {
  const hasOtherFilters = Boolean(filters.estado || filters.desde || filters.hasta || filters.distribuidor_id)
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = undefined
  searchInput.value = ''
  filters.search = ''
  filters.estado = ''
  filters.desde = ''
  filters.hasta = ''
  filters.distribuidor_id = null
  if (!hasOtherFilters) void fetchClientes(1)
}

const applyFilters = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = undefined
  filters.search = searchInput.value.trim()
  fetchCurrentPage()
}

const handleExport = () => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = undefined
  filters.search = searchInput.value.trim()
  void exportarClientes()
}

const openDetail = (cliente: ClienteListItem) => {
  selectedClienteName.value = `${cliente.nombres} ${cliente.apellidos}`.trim()
  detailOpen.value = true
  void fetchDetalle(cliente.id)
}

const estadoLabel = (estado: EstadoPedido | null) =>
  estadosPedido.find((item) => item.value === estado)?.label ?? 'Sin pedidos'

const formatMoney = (amount: number, currency: string) => formatCurrency(amount, currency)

const changePage = (page: number) => {
  if (page >= 1 && page <= pagination.last_page) void fetchClientes(page)
}

onMounted(() => {
  void fetchClientes()
  if (canFilterDistributor.value) void fetchDistribuidores()
})

onBeforeUnmount(() => {
  if (searchTimer) clearTimeout(searchTimer)
})
</script>

<template>
  <AppShell :show-search="false">
    <div class="clients-page">
      <header class="clients-header">
        <div>
          <h1>Clientes</h1>
          <p>Consulta compradores y el historial de pedidos de tu red.</p>
        </div>
        <button class="clients-export" type="button" :disabled="isExporting" @click="handleExport">
          {{ isExporting ? 'Preparando CSV…' : 'Exportar CSV' }}
        </button>
      </header>

      <div v-if="errorMessage" class="clients-alert" role="alert">
        {{ errorMessage }}
        <button type="button" aria-label="Cerrar" @click="errorMessage = ''">✕</button>
      </div>
      <div v-if="exportErrorMessage" class="clients-alert" role="alert">
        {{ exportErrorMessage }}
        <button type="button" aria-label="Cerrar" @click="exportErrorMessage = ''">✕</button>
      </div>
      <div v-if="distributorsError" class="clients-alert" role="alert">
        No pudimos cargar la lista de distribuidores. {{ distributorsError }}
        <button type="button" aria-label="Cerrar" @click="distributorsError = ''">✕</button>
      </div>

      <section class="clients-filters" aria-label="Filtros de clientes">
        <label class="filter-field filter-search">
          <span>Buscar</span>
          <input v-model="searchInput" type="search" placeholder="Nombre, cédula o teléfono" />
        </label>
        <label class="filter-field" :class="{ 'filter-field--wide': !canFilterDistributor }">
          <span>Estado del pedido</span>
          <select v-model="filters.estado">
            <option value="">Todos</option>
            <option v-for="estado in estadosPedido" :key="estado.value" :value="estado.value">
              {{ estado.label }}
            </option>
          </select>
        </label>
        <label v-if="canFilterDistributor" class="filter-field">
          <span>Distribuidor</span>
          <select v-model.number="filters.distribuidor_id" :disabled="isDistributorsLoading">
            <option :value="null">Todos</option>
            <option v-for="distribuidor in distribuidores" :key="distribuidor.id" :value="distribuidor.id">
              {{ distribuidor.nombre }}
            </option>
          </select>
        </label>
        <DatePicker v-model="filters.desde" label="Desde" id="clientes-desde" :max="filters.hasta || undefined" />
        <DatePicker v-model="filters.hasta" label="Hasta" id="clientes-hasta" :min="filters.desde || undefined" />
        <div class="filter-actions">
          <button class="apply-filters" type="button" @click="applyFilters">Aplicar</button>
          <button v-if="hasActiveFilters" class="clear-filters" type="button" @click="clearFilters">
            Limpiar filtros
          </button>
        </div>
      </section>

      <p v-if="dateRangeError" class="filter-error" role="alert">La fecha inicial debe ser anterior a la fecha final.</p>

      <section class="clients-table-card" aria-label="Listado de clientes">
        <div v-if="isLoading" class="clients-state" role="status">
          <span class="clients-spinner" aria-hidden="true"></span>
          <span>Cargando clientes…</span>
        </div>
        <div v-else-if="errorMessage" class="clients-state">
          <p>No pudimos cargar los clientes.</p>
          <button type="button" class="clients-retry" @click="fetchCurrentPage">Intentar de nuevo</button>
        </div>
        <div v-else-if="clientes.length === 0" class="clients-state">
          <strong>{{ hasActiveFilters ? 'No encontramos resultados' : 'Aún no hay clientes' }}</strong>
          <span>{{ hasActiveFilters ? 'Prueba ajustar o limpiar los filtros.' : 'Cuando recibas pedidos, tus clientes aparecerán aquí.' }}</span>
        </div>
        <div v-else class="clients-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Cédula</th>
                <th>Teléfono</th>
                <th>Distribuidor</th>
                <th>Pedidos</th>
                <th>Monto total</th>
                <th>Último pedido</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="cliente in clientes"
                :key="cliente.id"
                tabindex="0"
                @click="openDetail(cliente)"
                @keydown.enter="openDetail(cliente)"
                @keydown.space.prevent="openDetail(cliente)"
              >
                <td>
                  <strong>{{ cliente.nombres }} {{ cliente.apellidos }}</strong>
                  <small v-if="cliente.email">{{ cliente.email }}</small>
                </td>
                <td>{{ cliente.documento || '—' }}</td>
                <td>{{ cliente.telefono || '—' }}</td>
                <td>{{ cliente.distribuidor?.nombre ?? '—' }}</td>
                <td>{{ cliente.pedidos_count }}</td>
                <td>{{ formatMoney(cliente.monto_total, cliente.moneda) }}</td>
                <td>{{ formatDate(cliente.ultimo_pedido_en) }}</td>
                <td>
                  <span
                    class="client-status"
                    :class="cliente.estado_ultimo_pedido ? `status-${cliente.estado_ultimo_pedido}` : 'status-none'"
                  >
                    {{ estadoLabel(cliente.estado_ultimo_pedido) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <footer v-if="!isLoading && pagination.total > 0" class="clients-pagination">
          <span>{{ pagination.total }} clientes · Página {{ pagination.current_page }} de {{ pagination.last_page }}</span>
          <div>
            <button type="button" :disabled="pagination.current_page <= 1" @click="changePage(pagination.current_page - 1)">Anterior</button>
            <button type="button" :disabled="pagination.current_page >= pagination.last_page" @click="changePage(pagination.current_page + 1)">Siguiente</button>
          </div>
        </footer>
      </section>
    </div>

    <AppModal
      :open="detailOpen"
      :title="selectedClienteName"
      description="Datos del cliente y todos sus pedidos."
      size="xl"
      @close="detailOpen = false"
    >
      <div v-if="isDetailLoading" class="detail-state" role="status">Cargando el historial de pedidos…</div>
      <div v-else-if="detailError" class="detail-state detail-error" role="alert">{{ detailError }}</div>
      <template v-else-if="detalle">
        <dl class="client-contact">
          <div><dt>Cédula</dt><dd>{{ detalle.documento || '—' }}</dd></div>
          <div><dt>Teléfono</dt><dd>{{ detalle.telefono || '—' }}</dd></div>
          <div><dt>Correo</dt><dd>{{ detalle.email || '—' }}</dd></div>
          <div><dt>Distribuidor</dt><dd>{{ detalle.distribuidor?.nombre ?? '—' }}</dd></div>
        </dl>
        <div class="order-history-heading">
          <h3>Historial de pedidos</h3>
          <span>{{ detalle.pedidos.length }} pedidos</span>
        </div>
        <div v-if="detalle.pedidos.length === 0" class="detail-state">Este cliente todavía no tiene pedidos.</div>
        <ol v-else class="order-history">
          <li v-for="pedido in detalle.pedidos" :key="pedido.id" class="order-card">
            <div class="order-top">
              <div><strong>{{ pedido.codigo }}</strong><small>{{ formatDateTime(pedido.creado_en) }}</small></div>
              <span class="client-status" :class="`status-${pedido.estado}`">{{ estadoLabel(pedido.estado) }}</span>
            </div>
            <ul class="order-items">
              <li v-for="(item, index) in pedido.items" :key="`${pedido.id}-${index}`">
                <span>{{ item.nombre }} × {{ item.cantidad }}</span>
                <span>{{ formatMoney(item.precio * item.cantidad, pedido.moneda) }}</span>
              </li>
            </ul>
            <div class="order-total">
              <span>Total</span>
              <strong>{{ formatMoney(pedido.monto, pedido.moneda) }}</strong>
            </div>
          </li>
        </ol>
      </template>
    </AppModal>
  </AppShell>
</template>

<style scoped>
.clients-page { padding: 24px 28px; display: flex; flex-direction: column; gap: 18px; }
.clients-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
.clients-header h1 { margin: 0 0 5px; color: #172033; font-size: 23px; }
.clients-header p { margin: 0; color: #64748b; font-size: 14px; }
.clients-export, .clients-retry { border: 0; border-radius: 8px; padding: 10px 16px; background: #1768b8; color: white; font-weight: 600; cursor: pointer; }
.clients-export:disabled { opacity: .6; cursor: wait; }
.clients-filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); align-items: end; gap: 10px 12px; padding: 10px 16px 12px; background: white; border: 1px solid #e2e8f0; border-radius: 12px; }
.filter-field { display: flex; min-width: 0; flex-direction: column; gap: 4px; color: #475569; font-size: 12px; font-weight: 600; }
.filter-search, .filter-field--wide { grid-column: span 2; }
.filter-actions { display: flex; align-items: center; gap: 10px; grid-column: span 2; }
.apply-filters { height: 40px; padding: 0 18px; border: 0; border-radius: 8px; background: #1768b8; color: white; font-weight: 600; cursor: pointer; }
.filter-field input, .filter-field select { width: 100%; min-height: 40px; box-sizing: border-box; padding: 0 10px; border: 1px solid #dbe3ef; border-radius: 7px; color: #172033; background: white; font: inherit; font-weight: 400; }
.clear-filters { height: 40px; border: 0; background: transparent; color: #1768b8; font-weight: 600; cursor: pointer; }
.filter-error { margin: -8px 0 0; color: #b91c1c; font-size: 13px; }
.clients-alert { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 16px; border: 1px solid #fecaca; border-radius: 8px; background: #fef2f2; color: #b91c1c; font-size: 13px; }
.clients-alert button { border: 0; background: none; color: inherit; cursor: pointer; }
.clients-table-card { overflow: hidden; border: 1px solid #e2e8f0; border-radius: 12px; background: white; box-shadow: 0 2px 8px rgba(15, 23, 42, .04); }
.clients-table-wrap { overflow-x: auto; }
.clients-table-wrap table { width: 100%; border-collapse: collapse; text-align: left; font-size: 13px; }
.clients-table-wrap th { padding: 14px 12px; color: #64748b; background: #f8fafc; font-weight: 600; white-space: nowrap; }
.clients-table-wrap td { padding: 14px 12px; border-top: 1px solid #edf1f5; color: #334155; white-space: nowrap; }
.clients-table-wrap tbody tr { cursor: pointer; }
.clients-table-wrap tbody tr:hover, .clients-table-wrap tbody tr:focus { background: #f8fbff; outline: none; }
.clients-table-wrap td strong, .clients-table-wrap td small { display: block; }
.clients-table-wrap td small { margin-top: 3px; color: #94a3b8; font-size: 11px; }
.clients-state, .detail-state { display: flex; min-height: 150px; flex-direction: column; align-items: center; justify-content: center; gap: 8px; color: #64748b; text-align: center; font-size: 14px; }
.clients-state strong { color: #334155; }
.clients-state p { margin: 0; }
.clients-spinner { width: 22px; height: 22px; border: 3px solid #dbeafe; border-top-color: #1768b8; border-radius: 50%; animation: spin .8s linear infinite; }
.clients-pagination { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 18px; border-top: 1px solid #edf1f5; color: #64748b; font-size: 12px; }
.clients-pagination div { display: flex; gap: 8px; }
.clients-pagination button { padding: 7px 11px; border: 1px solid #dbe3ef; border-radius: 6px; background: white; color: #334155; cursor: pointer; }
.clients-pagination button:disabled { opacity: .5; cursor: not-allowed; }
.client-status { display: inline-flex; border-radius: 999px; padding: 4px 9px; font-size: 11px; font-weight: 700; }
.status-solicitado { background: #fef3c7; color: #92400e; }
.status-confirmado { background: #dbeafe; color: #1d4ed8; }
.status-entregado { background: #dcfce7; color: #166534; }
.status-cancelado { background: #fee2e2; color: #b91c1c; }
.status-none { background: #f1f5f9; color: #64748b; }
.client-contact { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; margin: 0 0 24px; }
.client-contact div { min-width: 0; }
.client-contact dt { color: #64748b; font-size: 12px; }
.client-contact dd { margin: 4px 0 0; color: #1e293b; font-size: 14px; font-weight: 600; overflow-wrap: anywhere; }
.order-history-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0; }
.order-history-heading h3 { margin: 0; color: #172033; font-size: 16px; }
.order-history-heading span { color: #64748b; font-size: 12px; }
.order-history { display: flex; flex-direction: column; gap: 12px; margin: 14px 0 0; padding: 0; list-style: none; }
.order-card { padding: 14px; border: 1px solid #e2e8f0; border-radius: 9px; }
.order-top, .order-top > div, .order-items li, .order-total { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.order-top > div { align-items: flex-start; flex-direction: column; gap: 4px; }
.order-top small { color: #64748b; font-size: 12px; }
.order-items { display: flex; flex-direction: column; gap: 7px; margin: 14px 0 10px; padding: 0; color: #475569; list-style: none; font-size: 13px; }
.order-total { padding-top: 10px; border-top: 1px solid #edf1f5; color: #334155; font-size: 13px; }
.detail-error { color: #b91c1c; }
@keyframes spin { to { transform: rotate(360deg); } }
@media (max-width: 1023px) {
  .clients-filters { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .filter-search, .filter-field--wide, .filter-actions { grid-column: span 2; }
}
@media (max-width: 700px) {
  .clients-filters { grid-template-columns: 1fr; }
  .filter-search, .filter-field--wide, .filter-actions { grid-column: auto; }
  .clients-page { padding: 20px 14px; }
  .clients-header { flex-direction: column; }
  .client-contact { grid-template-columns: 1fr; }
  .clients-pagination { align-items: flex-start; flex-direction: column; }
}
</style>
