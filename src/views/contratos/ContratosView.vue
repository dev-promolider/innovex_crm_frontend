<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import AppShell from '@/components/layout/AppShell.vue'
import ApiErrorState from '@/components/shared/ApiErrorState.vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { getApiErrorMessage } from '@/utils/apiErrorMessage'
import { formatDateTime } from '@/utils/formatters'

interface ContractItem {
  id: number
  numero_contrato: string
  estado: string
  version_contrato: number
  huella_pdf: string | null
  huella_firma_combinada: string | null
  firmado_at: string | null
  ip_firma: string | null
  gps_latitud_firma: string | null
  gps_longitud_firma: string | null
  created_at: string | null
  pdf_url?: string | null
  distribuidor: {
    membresia_id: number | null
    nombre: string
    email: string | null
    documento: string | null
  }
  kit: {
    id: number | null
    nombre: string | null
    precio_unitario: number
    cantidad: number | null
  }
  campana: {
    id: number | null
    nombre: string | null
  }
  dispositivo_firma?: {
    nombre_dispositivo: string | null
    plataforma: string | null
    fingerprint: string | null
  }
}

interface Pagination<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

interface SuccessResponse<T> {
  status: string
  data: T
}

const { authHeaders } = useAuthenticatedSession()
const isLoading = shallowRef(false)
const isDetailLoading = shallowRef(false)
const contractsError = shallowRef('')
const detailError = shallowRef('')
const templateError = shallowRef('')
const contracts = shallowRef<ContractItem[]>([])
const selectedContract = shallowRef<ContractItem | null>(null)
const selectedContractId = shallowRef<number | null>(null)
const templateClauses = shallowRef<string[]>([])
const filters = reactive({ search: '', estado: 'todos' })
const pagination = reactive({ current_page: 1, last_page: 1, total: 0 })

const selectedGps = computed(() => {
  if (!selectedContract.value?.gps_latitud_firma || !selectedContract.value?.gps_longitud_firma) {
    return 'No registrado'
  }

  return `${selectedContract.value.gps_latitud_firma}, ${selectedContract.value.gps_longitud_firma}`
})

const contractMetrics = computed(() => {
  const total = contracts.value.length
  const signed = contracts.value.filter((contract) => contract.estado === 'firmado').length
  const pending = contracts.value.filter((contract) => ['generado', 'presentado'].includes(contract.estado)).length
  const rejected = contracts.value.filter((contract) => ['rechazado_por_usuario', 'anulado'].includes(contract.estado)).length
  const withPdfFingerprint = contracts.value.filter((contract) => Boolean(contract.huella_pdf)).length

  return { total, signed, pending, rejected, withPdfFingerprint }
})

const selectedIntegrity = computed(() => {
  if (!selectedContract.value) {
    return []
  }

  return [
    {
      label: 'PDF sellado',
      value: selectedContract.value.huella_pdf ? 'Sí' : 'No',
      tone: selectedContract.value.huella_pdf ? 'success' : 'muted',
    },
    {
      label: 'Firma combinada',
      value: selectedContract.value.huella_firma_combinada ? 'Sí' : 'No',
      tone: selectedContract.value.huella_firma_combinada ? 'success' : 'muted',
    },
    {
      label: 'Dispositivo',
      value: selectedContract.value.dispositivo_firma?.nombre_dispositivo ? 'Registrado' : 'Pendiente',
      tone: selectedContract.value.dispositivo_firma?.nombre_dispositivo ? 'info' : 'muted',
    },
  ]
})

const statusOptions = [
  { value: 'todos', label: 'Todos', tone: 'neutral' },
  { value: 'generado', label: 'Generado', tone: 'neutral' },
  { value: 'presentado', label: 'Presentado', tone: 'warning' },
  { value: 'firmado', label: 'Firmado', tone: 'success' },
  { value: 'rechazado_por_usuario', label: 'Rechazado', tone: 'danger' },
  { value: 'anulado', label: 'Anulado', tone: 'danger' },
] as const

const formatDate = (value: string | null | undefined) =>
  formatDateTime(value)

const formatStateLabel = (value: string) => {
  const labels: Record<string, string> = {
    generado: 'Generado',
    presentado: 'Presentado',
    firmado: 'Firmado',
    rechazado_por_usuario: 'Rechazado',
    anulado: 'Anulado',
  }

  return labels[value] ?? value
}

const stateBadgeClass = (value: string) => ({
  'contract-badge--success': value === 'firmado',
  'contract-badge--warning': value === 'presentado',
  'contract-badge--danger': ['rechazado_por_usuario', 'anulado'].includes(value),
  'contract-badge--neutral': !['firmado', 'presentado', 'rechazado_por_usuario', 'anulado'].includes(value),
})

const loadContracts = async (page = 1) => {
  isLoading.value = true
  contractsError.value = ''

  try {
    const response = await apiClient.get<SuccessResponse<Pagination<ContractItem>>>('/workspace/admin/contratos', {
      headers: authHeaders(),
      params: {
        page,
        search: filters.search || undefined,
        estado: filters.estado,
      },
    })

    contracts.value = response.data.data.data ?? []
    pagination.current_page = response.data.data.current_page
    pagination.last_page = response.data.data.last_page
    pagination.total = response.data.data.total

    const currentSelection = selectedContract.value
      ? contracts.value.find((contract) => contract.id === selectedContract.value?.id)
      : null
    const contractToSelect = currentSelection ?? contracts.value[0]

    if (contractToSelect) {
      await selectContract(contractToSelect.id)
    } else {
      selectedContract.value = null
      selectedContractId.value = null
    }
  } catch (error) {
    contracts.value = []
    selectedContract.value = null
    selectedContractId.value = null
    pagination.current_page = 1
    pagination.last_page = 1
    pagination.total = 0
    contractsError.value = getApiErrorMessage(error)
  } finally {
    isLoading.value = false
  }
}

const loadTemplate = async () => {
  templateError.value = ''
  try {
    const response = await apiClient.get<SuccessResponse<{ clausulas: string[] }>>('/workspace/admin/contratos/plantilla', {
      headers: authHeaders(),
    })
    templateClauses.value = response.data.data.clausulas ?? []
  } catch (error) {
    templateClauses.value = []
    templateError.value = getApiErrorMessage(error)
  }
}

const selectContract = async (contractId: number) => {
  selectedContractId.value = contractId
  isDetailLoading.value = true
  detailError.value = ''
  try {
    const response = await apiClient.get<SuccessResponse<ContractItem>>(`/workspace/admin/contratos/${contractId}`, {
      headers: authHeaders(),
    })
    selectedContract.value = response.data.data
  } catch (error) {
    selectedContract.value = null
    detailError.value = getApiErrorMessage(error)
  } finally {
    isDetailLoading.value = false
  }
}

const retrySelectedContract = () => {
  if (selectedContractId.value !== null) void selectContract(selectedContractId.value)
}

onMounted(async () => {
  await Promise.all([loadContracts(), loadTemplate()])
})
</script>

<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Contratos</strong></span>
    </template>

    <div class="page-body contracts-page">
      <header class="page-header">
        <div>
          <h1 class="page-title">Contratos digitales</h1>
          <p class="page-subtitle">Mismo criterio operativo de campañas y kits: control, trazabilidad y evidencia sobre cada solicitud.</p>
        </div>
        <button class="btn-outline refresh-btn" type="button" :disabled="isLoading" @click="loadContracts(pagination.current_page)">
          {{ isLoading ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </header>

      <section class="content-layout">
        <aside class="filters-panel">
          <h3 class="filters-title">Filtros y resumen</h3>

          <div class="filter-section">
            <label class="filter-label" for="contracts-search">Buscar</label>
            <input
              id="contracts-search"
              v-model="filters.search"
              class="search-input"
              type="search"
              placeholder="Contrato, distribuidor o documento"
              @keyup.enter="loadContracts(1)"
            />
          </div>

          <div class="filter-section">
            <label class="filter-label">Estado</label>
            <div class="filter-options">
              <button
                v-for="option in statusOptions"
                :key="option.value"
                type="button"
                class="filter-pill"
                :class="[
                  `filter-pill--${option.tone}`,
                  { 'filter-pill--active': filters.estado === option.value },
                ]"
                @click="filters.estado = option.value; loadContracts(1)"
              >
                {{ option.label }}
              </button>
            </div>
          </div>

          <div class="filter-actions">
            <button class="btn-primary" type="button" @click="loadContracts(1)">Aplicar filtros</button>
          </div>

          <div class="summary-card">
            <h4 class="summary-title">Resumen visible</h4>
            <div class="summary-row"><span>Total cargados</span><strong>{{ contractMetrics.total }}</strong></div>
            <div class="summary-row"><span>Firmados</span><strong>{{ contractMetrics.signed }}</strong></div>
            <div class="summary-row"><span>Pendientes</span><strong>{{ contractMetrics.pending }}</strong></div>
            <div class="summary-row"><span>Observados</span><strong>{{ contractMetrics.rejected }}</strong></div>
            <div class="summary-row"><span>PDF con huella</span><strong>{{ contractMetrics.withPdfFingerprint }}</strong></div>
          </div>
        </aside>

        <div class="table-area">
          <div class="table-toolbar">
            <div>
              <h2 class="section-title">Bandeja contractual</h2>
              <p class="section-subtitle">{{ pagination.total }} contratos registrados en total.</p>
            </div>
          </div>

          <ApiErrorState
            v-if="contractsError"
            :message="contractsError"
            :retrying="isLoading"
            @retry="loadContracts(pagination.current_page)"
          />
          <div v-else class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Contrato</th>
                  <th>Campaña y kit</th>
                  <th>Distribuidor</th>
                  <th>Estado</th>
                  <th>Integridad</th>
                  <th>Firma</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="isLoading">
                  <td colspan="6" class="empty-state">Cargando contratos...</td>
                </tr>
                <tr v-else-if="contracts.length === 0">
                  <td colspan="6" class="empty-state">Sin contratos para estos filtros.</td>
                </tr>
                <tr
                  v-for="contract in contracts"
                  :key="contract.id"
                  class="tr-clickable"
                  :class="{ 'tr-selected': selectedContract?.id === contract.id }"
                  @click="selectContract(contract.id)"
                >
                  <td>
                    <div class="primary-cell">{{ contract.numero_contrato }}</div>
                    <div class="secondary-cell">Versión {{ contract.version_contrato }} · {{ formatDate(contract.created_at) }}</div>
                  </td>
                  <td>
                    <div class="primary-cell">{{ contract.campana.nombre || 'Sin campaña' }}</div>
                    <div class="secondary-cell">{{ contract.kit.nombre || 'Sin kit' }} · {{ contract.kit.cantidad ?? 0 }} kits</div>
                  </td>
                  <td>
                    <div class="primary-cell">{{ contract.distribuidor.nombre || 'Sin distribuidor' }}</div>
                    <div class="secondary-cell">{{ contract.distribuidor.documento || contract.distribuidor.email || 'Sin documento' }}</div>
                  </td>
                  <td>
                    <span class="contract-badge" :class="stateBadgeClass(contract.estado)">{{ formatStateLabel(contract.estado) }}</span>
                  </td>
                  <td>
                    <div class="integrity-stack">
                      <span :class="contract.huella_pdf ? 'status-dot status-dot--success' : 'status-dot status-dot--muted'">PDF</span>
                      <span :class="contract.huella_firma_combinada ? 'status-dot status-dot--info' : 'status-dot status-dot--muted'">Firma</span>
                    </div>
                  </td>
                  <td>{{ formatDate(contract.firmado_at) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="!contractsError && pagination.last_page > 1" class="pagination">
            <button class="page-btn" :disabled="pagination.current_page === 1" @click="loadContracts(pagination.current_page - 1)">‹</button>
            <span class="page-info">Página {{ pagination.current_page }} de {{ pagination.last_page }}</span>
            <button class="page-btn" :disabled="pagination.current_page === pagination.last_page" @click="loadContracts(pagination.current_page + 1)">›</button>
          </div>
        </div>
      </section>

      <section class="detail-layout">
        <article class="detail-card detail-card--primary">
          <div v-if="isDetailLoading" class="empty-state">Cargando detalle...</div>
          <ApiErrorState
            v-else-if="detailError"
            :message="detailError"
            :retrying="isDetailLoading"
            @retry="retrySelectedContract"
          />
          <template v-else-if="selectedContract">
            <div class="detail-header">
              <div>
                <h3 class="detail-title">{{ selectedContract.numero_contrato }}</h3>
                <p class="detail-subtitle">
                  {{ selectedContract.distribuidor.nombre || 'Sin distribuidor' }} · {{ selectedContract.distribuidor.documento || 'Sin documento' }}
                </p>
              </div>
              <span class="contract-badge" :class="stateBadgeClass(selectedContract.estado)">
                {{ formatStateLabel(selectedContract.estado) }}
              </span>
            </div>

            <div class="integrity-grid">
              <div v-for="item in selectedIntegrity" :key="item.label" class="integrity-card">
                <span class="integrity-label">{{ item.label }}</span>
                <strong :class="`integrity-value integrity-value--${item.tone}`">{{ item.value }}</strong>
              </div>
            </div>

            <dl class="contract-definition-list">
              <div><dt>Campaña</dt><dd>{{ selectedContract.campana.nombre || 'Sin campaña' }}</dd></div>
              <div><dt>Kit</dt><dd>{{ selectedContract.kit.nombre || 'Sin kit' }} x{{ selectedContract.kit.cantidad ?? 0 }}</dd></div>
              <div><dt>Precio unitario</dt><dd>{{ selectedContract.kit.precio_unitario || 0 }}</dd></div>
              <div><dt>Huella PDF</dt><dd>{{ selectedContract.huella_pdf || 'No registrada' }}</dd></div>
              <div><dt>Huella firma</dt><dd>{{ selectedContract.huella_firma_combinada || 'No registrada' }}</dd></div>
              <div><dt>Firmado</dt><dd>{{ formatDate(selectedContract.firmado_at) }}</dd></div>
              <div><dt>IP firma</dt><dd>{{ selectedContract.ip_firma || 'No registrada' }}</dd></div>
              <div><dt>GPS firma</dt><dd>{{ selectedGps }}</dd></div>
              <div><dt>Dispositivo</dt><dd>{{ selectedContract.dispositivo_firma?.nombre_dispositivo || 'No registrado' }}</dd></div>
              <div><dt>Plataforma</dt><dd>{{ selectedContract.dispositivo_firma?.plataforma || 'No registrada' }}</dd></div>
            </dl>

            <div class="detail-actions">
              <a v-if="selectedContract.pdf_url" class="btn-primary contract-pdf-link" :href="selectedContract.pdf_url" target="_blank" rel="noreferrer">
                Ver PDF firmado
              </a>
            </div>
          </template>
          <div v-else class="empty-state">Selecciona un contrato para revisar evidencia y trazabilidad.</div>
        </article>

        <article class="detail-card">
          <h3 class="detail-title">Plantilla vigente</h3>
          <p class="detail-subtitle">Cláusulas centralizadas desde backend. Solo lectura en esta versión.</p>
          <ApiErrorState
            v-if="templateError"
            :message="templateError"
            @retry="loadTemplate"
          />
          <ol v-else class="clauses-list">
            <li v-for="(clause, index) in templateClauses" :key="`${index}-${clause}`">{{ clause }}</li>
          </ol>
        </article>
      </section>
    </div>
  </AppShell>
</template>

<style scoped>
.contracts-page {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.page-title {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  color: #111827;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #6b7280;
  max-width: 760px;
}

.contracts-alert {
  margin: 0;
}

.content-layout,
.detail-layout {
  display: grid;
  gap: 20px;
}

.content-layout {
  grid-template-columns: 300px minmax(0, 1fr);
}

.detail-layout {
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.9fr);
}

.filters-panel,
.table-area,
.detail-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 24px;
  box-shadow: 0 18px 40px -28px rgba(15, 23, 42, 0.35);
}

.filters-panel,
.detail-card {
  padding: 22px;
}

.table-area {
  padding: 22px 22px 16px;
}

.filters-title,
.section-title,
.detail-title,
.summary-title {
  margin: 0;
  color: #111827;
}

.filters-title,
.detail-title {
  font-size: 18px;
  font-weight: 800;
}

.section-title {
  font-size: 18px;
  font-weight: 800;
}

.section-subtitle,
.detail-subtitle {
  margin: 6px 0 0;
  color: #6b7280;
}

.filter-section,
.summary-card {
  margin-top: 18px;
}

.filter-label,
.integrity-label,
.contract-definition-list dt {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #6b7280;
}

.search-input {
  width: 100%;
  min-height: 44px;
  border: 1px solid #d1d5db;
  border-radius: 14px;
  padding: 0 14px;
  margin-top: 8px;
  color: #111827;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-pill {
  border: 1px solid #dbe3ef;
  background: #f8fafc;
  color: #475569;
  border-radius: 999px;
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.18s ease;
}

.filter-pill--active {
  border-color: #0f172a;
  background: #0f172a;
  color: #fff;
}

.filter-actions {
  margin-top: 18px;
}

.summary-card {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 16px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  color: #475569;
  border-bottom: 1px solid #edf2f7;
}

.summary-row:last-child {
  border-bottom: 0;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 14px;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
  text-align: left;
  padding: 12px 14px;
  border-bottom: 1px solid #e5e7eb;
}

.data-table td {
  padding: 14px;
  color: #111827;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: top;
}

.tr-clickable {
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.tr-clickable:hover,
.tr-selected {
  background: #f8fbff;
}

.primary-cell {
  font-weight: 700;
  color: #111827;
}

.secondary-cell {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.contract-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 7px 12px;
  font-size: 12px;
  font-weight: 800;
}

.contract-badge--success {
  background: #dcfce7;
  color: #166534;
}

.contract-badge--warning {
  background: #fef3c7;
  color: #92400e;
}

.contract-badge--danger {
  background: #fee2e2;
  color: #b91c1c;
}

.contract-badge--neutral {
  background: #e5e7eb;
  color: #374151;
}

.integrity-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-dot {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 11px;
  font-weight: 700;
}

.status-dot--success {
  background: #dcfce7;
  color: #166534;
}

.status-dot--info {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-dot--muted {
  background: #f1f5f9;
  color: #64748b;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-top: 16px;
}

.page-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
  font-size: 18px;
}

.page-info,
.empty-state {
  color: #6b7280;
}

.empty-state {
  text-align: center;
  padding: 26px 12px;
}

.detail-card--primary {
  min-width: 0;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.integrity-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin: 18px 0 20px;
}

.integrity-card {
  border: 1px solid #e5e7eb;
  border-radius: 18px;
  padding: 14px;
  background: #f8fafc;
}

.integrity-value {
  display: block;
  margin-top: 8px;
  font-size: 16px;
}

.integrity-value--success {
  color: #166534;
}

.integrity-value--info {
  color: #1d4ed8;
}

.integrity-value--muted {
  color: #64748b;
}

.contract-definition-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 18px;
  margin: 0;
}

.contract-definition-list div {
  padding: 14px 0;
  border-bottom: 1px solid #edf2f7;
  min-width: 0;
}

.contract-definition-list dd {
  margin: 6px 0 0;
  color: #111827;
  overflow-wrap: anywhere;
}

.detail-actions {
  margin-top: 20px;
}

.contract-pdf-link,
.btn-primary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  border-radius: 14px;
  padding: 0 16px;
  font-weight: 700;
  text-decoration: none;
}

.btn-primary {
  border: 1px solid #111827;
  background: #111827;
  color: #fff;
}

.btn-outline {
  border: 1px solid #d1d5db;
  background: #fff;
  color: #111827;
}

.clauses-list {
  margin: 16px 0 0;
  padding-left: 18px;
  color: #334155;
}

.clauses-list li + li {
  margin-top: 10px;
}

.refresh-btn:disabled,
.btn-primary:disabled,
.btn-outline:disabled,
.page-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.alert-error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 16px;
  padding: 14px 16px;
}

@media (max-width: 1100px) {
  .content-layout,
  .detail-layout,
  .integrity-grid,
  .contract-definition-list {
    grid-template-columns: 1fr;
  }

  .page-header,
  .detail-header,
  .pagination {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 768px) {
  .table-area,
  .filters-panel,
  .detail-card {
    padding: 18px;
  }

  .page-title {
    font-size: 26px;
  }
}
</style>
