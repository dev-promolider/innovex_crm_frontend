<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { Plus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { useEmpresasApi } from '../composables/useEmpresasApi'
import type { EmpresaEstado, EmpresaListItem } from '../types'
import CreateEmpresaDialog from './CreateEmpresaDialog.vue'
import EmpresasTable from './EmpresasTable.vue'
import SuspendEmpresaDialog from './SuspendEmpresaDialog.vue'

const router = useRouter()

const {
  empresas,
  isLoading,
  isCreating,
  mutatingEmpresaId,
  errorMessage,
  successMessage,
  pagination,
  clearMessages,
  fetchEmpresas,
  createEmpresa,
  activateEmpresa,
  suspendEmpresa,
} = useEmpresasApi()

const filters = reactive({
  search: '',
  estado: 'todos' as 'todos' | EmpresaEstado,
})

const createDialogOpen = shallowRef(false)
const suspendDialogOpen = shallowRef(false)
const selectedEmpresaId = shallowRef<number | null>(null)

const filteredEmpresas = computed(() => {
  const normalizedSearch = filters.search.trim().toLowerCase()

  return empresas.value.filter((empresa) => {
    const matchesStatus = filters.estado === 'todos' || empresa.estado === filters.estado
    const matchesSearch =
      normalizedSearch.length === 0
      || empresa.nombre.toLowerCase().includes(normalizedSearch)
      || empresa.nombre_comercial?.toLowerCase().includes(normalizedSearch)
      || empresa.ruc_nit?.toLowerCase().includes(normalizedSearch)
      || empresa.email_contacto?.toLowerCase().includes(normalizedSearch)

    return matchesStatus && matchesSearch
  })
})

const configurationCount = computed(
  () => empresas.value.filter((empresa) => empresa.estado === 'configuracion').length,
)

const activeCount = computed(
  () => empresas.value.filter((empresa) => empresa.estado === 'activa').length,
)

const suspendedCount = computed(
  () => empresas.value.filter((empresa) => empresa.estado === 'suspendida').length,
)

const totalActiveMembers = computed(
  () => empresas.value.reduce((total, empresa) => total + empresa.membresias_activas_count, 0),
)

const selectedEmpresa = computed<EmpresaListItem | null>(() => {
  if (selectedEmpresaId.value == null) {
    return null
  }

  return (
    empresas.value.find((empresa) => empresa.id === selectedEmpresaId.value)
    ?? null
  )
})

const isMutatingSelectedEmpresa = computed(
  () => selectedEmpresaId.value != null && mutatingEmpresaId.value === selectedEmpresaId.value,
)

const loadPage = async (page = 1) => {
  await fetchEmpresas(page)
}

const openCreateDialog = () => {
  clearMessages()
  createDialogOpen.value = true
}

const openEmpresaWorkspace = async (empresaId: number) => {
  clearMessages()
  await router.push({ name: 'empresa-workspace', params: { empresaId } })
}

const requestSuspend = (empresaId: number) => {
  clearMessages()
  selectedEmpresaId.value = empresaId
  suspendDialogOpen.value = true
}

const handleCreateEmpresa = async (payload: Parameters<typeof createEmpresa>[0]) => {
  try {
    const createdEmpresa = await createEmpresa(payload)
    createDialogOpen.value = false
    await openEmpresaWorkspace(createdEmpresa.id)
  } catch {
    return
  }
}

const handleActivateEmpresa = async (empresaId: number) => {
  try {
    await activateEmpresa(empresaId)
  } catch {
    return
  }
}

const handleSuspendEmpresa = async (motivo: string) => {
  if (selectedEmpresaId.value == null) {
    return
  }

  try {
    await suspendEmpresa(selectedEmpresaId.value, motivo)
    suspendDialogOpen.value = false
  } catch {
    return
  }
}

onMounted(async () => {
  await loadPage()
})
</script>

<template>
  <div class="page-body empresas-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Gestion de empresas</h1>
        <p class="page-subtitle">
          Administra los workspaces, controla el readiness operativo y ejecuta altas o cambios de estado.
        </p>
      </div>

      <div class="page-actions">
        <button class="btn-outline" @click="loadPage(pagination.current_page)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          Actualizar
        </button>
        <button type="button" class="btn-primary" @click="openCreateDialog">
          <Plus class="size-4" />
          Nueva empresa
        </button>
      </div>
    </div>

    <section class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-top">
          <span class="kpi-val kpi-blue-txt">{{ activeCount }}</span>
          <div class="kpi-icon blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <span class="kpi-label">Empresas activas</span>
        <span class="kpi-sub">{{ pagination.total }} registros totales.</span>
      </div>

      <div class="kpi-card kpi-warn">
        <div class="kpi-top">
          <span class="kpi-val kpi-orange-txt">{{ configurationCount }}</span>
          <div class="kpi-icon orange">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <span class="kpi-label">En configuracion</span>
        <span class="kpi-sub">Pendientes de completar rangos para activacion.</span>
      </div>

      <div class="kpi-card kpi-danger">
        <div class="kpi-top">
          <span class="kpi-val kpi-red-txt">{{ suspendedCount }}</span>
          <div class="kpi-icon red">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </div>
        <span class="kpi-label">Suspendidas</span>
        <span class="kpi-sub">Empresas fuera de operacion desde el panel.</span>
      </div>

      <div class="kpi-card kpi-accent">
        <div class="kpi-top">
          <span class="kpi-val kpi-teal-txt">{{ totalActiveMembers }}</span>
          <div class="kpi-icon teal">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        <span class="kpi-label">Membresias activas</span>
        <span class="kpi-sub">Usuarios operativos bajo supervision actual.</span>
      </div>
    </section>

    <div v-if="errorMessage" class="alert-error">
      {{ errorMessage }}
      <button class="alert-close" @click="clearMessages">✕</button>
    </div>

    <div v-if="successMessage" class="alert-success">
      {{ successMessage }}
      <button class="alert-close" @click="clearMessages">✕</button>
    </div>

      <div class="card empresas-card">
        <div class="section-header">
          <div>
            <h3 class="section-title">Empresas</h3>
            <p class="section-sub">
              {{ filteredEmpresas.length }} resultados visibles en esta pagina · {{ pagination.total }} registros totales cargados.
            </p>
          </div>
        </div>

        <div class="table-filters empresas-filters">
          <div class="search-box search-wide empresas-search">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="filters.search" type="text" placeholder="Buscar por nombre, RUC, alias o contacto" class="search-input" />
          </div>

          <select v-model="filters.estado" class="select-filter">
            <option value="todos">Todos los estados</option>
            <option value="configuracion">En configuracion</option>
            <option value="activa">Activas</option>
            <option value="suspendida">Suspendidas</option>
            <option value="inactiva">Inactivas</option>
          </select>
        </div>

        <EmpresasTable
          :empresas="filteredEmpresas"
          :loading="isLoading"
          :pending-empresa-id="mutatingEmpresaId"
          @configure="openEmpresaWorkspace"
          @activate="handleActivateEmpresa"
          @suspend="requestSuspend"
        />

        <div class="table-footer">
          <span class="table-count empresas-count">
              Pagina {{ pagination.current_page }} de {{ pagination.last_page }} · {{ pagination.per_page }} por pagina
          </span>

          <div class="pagination">
              <button
                class="page-btn"
                :disabled="pagination.current_page <= 1 || isLoading"
                @click="loadPage(pagination.current_page - 1)"
              >
                Anterior
              </button>
              <button
                class="page-btn"
                :disabled="pagination.current_page >= pagination.last_page || isLoading"
                @click="loadPage(pagination.current_page + 1)"
              >
                Siguiente
              </button>
          </div>
        </div>
      </div>

      <CreateEmpresaDialog
        v-model:open="createDialogOpen"
        :submitting="isCreating"
        @submit="handleCreateEmpresa"
      />

      <SuspendEmpresaDialog
        v-model:open="suspendDialogOpen"
        :empresa-nombre="selectedEmpresa?.nombre ?? 'empresa seleccionada'"
        :submitting="isMutatingSelectedEmpresa"
        @submit="handleSuspendEmpresa"
      />
  </div>
</template>

<style scoped>
.empresas-page {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.page-subtitle {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.btn-primary,
.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.btn-primary {
  padding: 9px 16px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #1f7ae0, #145fbe);
  color: white;
}

.btn-outline {
  padding: 9px 16px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: white;
  color: #475569;
}

.alert-error,
.alert-success {
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #166534;
}

.alert-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.kpi-card {
  background: white;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.kpi-card.kpi-warn {
  border-color: #fde68a;
}

.kpi-card.kpi-danger {
  border-color: #fca5a5;
}

.kpi-card.kpi-accent {
  border-color: #a7f3d0;
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 6px;
}

.kpi-val {
  font-size: 28px;
  font-weight: 700;
}

.kpi-blue-txt { color: #2563eb; }
.kpi-orange-txt { color: #d97706; }
.kpi-red-txt { color: #dc2626; }
.kpi-teal-txt { color: #059669; }

.kpi-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-icon.blue { background: #dbeafe; color: #2563eb; }
.kpi-icon.orange { background: #fef3c7; color: #d97706; }
.kpi-icon.red { background: #fee2e2; color: #dc2626; }
.kpi-icon.teal { background: #d1fae5; color: #059669; }

.kpi-label {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.kpi-sub {
  font-size: 11px;
  color: #999;
}

.card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 10px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 4px;
}

.section-sub {
  font-size: 12px;
  color: #999;
  margin: 0;
}

.table-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f4f6f9;
  border-radius: 20px;
  padding: 6px 14px;
}

.search-wide {
  width: 240px;
}

.empresas-search {
  width: 320px;
  max-width: 100%;
}

.search-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #333;
  width: 100%;
}

.select-filter {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: #444;
  outline: none;
  background: white;
  cursor: pointer;
}

.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #f0f0f0;
}

.table-count {
  font-size: 12px;
  color: #999;
}

.pagination {
  display: flex;
  gap: 6px;
}

.page-btn {
  padding: 5px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  color: #555;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 1100px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .empresas-page {
    padding: 14px;
    gap: 12px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .kpi-grid {
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }

  .kpi-val {
    font-size: 20px;
  }

  .table-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .empresas-search {
    width: 100%;
  }
}
</style>
