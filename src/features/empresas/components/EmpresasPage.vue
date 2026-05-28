<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import { Plus } from 'lucide-vue-next'
import ConfiguracionWorkspacePageV2 from '@/features/configuracion/components/ConfiguracionWorkspacePageV2.vue'
import { useEmpresasApi } from '../composables/useEmpresasApi'
import type { CreateEmpresaResult, EmpresaEstado, EmpresaListItem } from '../types'
import CreateEmpresaDialog from './CreateEmpresaDialog.vue'
import EmpresasTable from './EmpresasTable.vue'
import SuspendEmpresaDialog from './SuspendEmpresaDialog.vue'
import DeleteEmpresaDialog from './DeleteEmpresaDialog.vue'

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
  deleteEmpresa,
} = useEmpresasApi()

const filters = reactive({
  search: '',
  estado: 'todos' as 'todos' | EmpresaEstado,
})

const createDialogOpen = shallowRef(false)
const suspendDialogOpen = shallowRef(false)
const deleteDialogOpen = shallowRef(false)
const configDialogOpen = shallowRef(false)
const selectedEmpresaId = shallowRef<number | null>(null)
const latestProvisioningResult = shallowRef<CreateEmpresaResult | null>(null)

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
  latestProvisioningResult.value = null
  createDialogOpen.value = true
}

const openEmpresaConfig = (empresaId: number) => {
  clearMessages()
  selectedEmpresaId.value = empresaId
  configDialogOpen.value = true
}

const closeEmpresaConfig = () => {
  configDialogOpen.value = false
}

const requestSuspend = (empresaId: number) => {
  clearMessages()
  selectedEmpresaId.value = empresaId
  suspendDialogOpen.value = true
}

const requestDelete = (empresaId: number) => {
  clearMessages()
  selectedEmpresaId.value = empresaId
  deleteDialogOpen.value = true
}

const handleDeleteEmpresa = async () => {
  if (selectedEmpresaId.value == null) {
    return
  }

  try {
    await deleteEmpresa(selectedEmpresaId.value)
    deleteDialogOpen.value = false
  } catch {
    return
  }
}

const handleCreateEmpresa = async (payload: Parameters<typeof createEmpresa>[0]) => {
  try {
    const createdEmpresa = await createEmpresa(payload)
    latestProvisioningResult.value = createdEmpresa
    createDialogOpen.value = false
  } catch {
    return
  }
}

const openLatestCreatedWorkspace = async () => {
  const empresaId = latestProvisioningResult.value?.empresa.id

  if (!empresaId) {
    return
  }

  openEmpresaConfig(empresaId)
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
  <div class="page-body admin-list-page empresas-page">
    <div class="admin-list-page__header">
      <div>
        <h1 class="admin-list-page__title">Gestion de empresas</h1>
        <p class="admin-list-page__subtitle">
          Administra los workspaces, controla el readiness operativo y ejecuta altas o cambios de estado.
        </p>
      </div>

      <div class="admin-list-page__actions">
        <button class="admin-btn admin-btn--outline" @click="loadPage(pagination.current_page)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          Actualizar
        </button>
        <button type="button" class="admin-btn admin-btn--primary" @click="openCreateDialog">
          <Plus class="size-4" />
          Nueva empresa
        </button>
      </div>
    </div>

    <section class="admin-kpi-grid">
      <div class="admin-kpi-card">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--blue">{{ activeCount }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Empresas activas</span>
        <span class="admin-kpi-card__sub">{{ pagination.total }} registros totales.</span>
      </div>

      <div class="admin-kpi-card admin-kpi-card--warn">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--orange">{{ configurationCount }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--orange">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">En configuracion</span>
        <span class="admin-kpi-card__sub">Pendientes de completar rangos para activacion.</span>
      </div>

      <div class="admin-kpi-card admin-kpi-card--danger">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--red">{{ suspendedCount }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--red">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Suspendidas</span>
        <span class="admin-kpi-card__sub">Empresas fuera de operacion desde el panel.</span>
      </div>

      <div class="admin-kpi-card admin-kpi-card--accent">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--teal">{{ totalActiveMembers }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--teal">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Membresias activas</span>
        <span class="admin-kpi-card__sub">Usuarios operativos bajo supervision actual.</span>
      </div>
    </section>

    <div v-if="errorMessage" class="admin-alert admin-alert--error">
      {{ errorMessage }}
      <button class="admin-alert__close" @click="clearMessages">✕</button>
    </div>

    <div v-if="successMessage" class="admin-alert admin-alert--success">
      {{ successMessage }}
      <button class="admin-alert__close" @click="clearMessages">✕</button>
    </div>

    <section v-if="latestProvisioningResult" class="provisioning-card">
      <div>
        <p class="provisioning-card__eyebrow">Primer acceso listo</p>
        <h3 class="provisioning-card__title">
          {{ latestProvisioningResult.primer_admin.nombre }} {{ latestProvisioningResult.primer_admin.apellido }} ya puede entrar al panel.
        </h3>
        <p class="provisioning-card__copy">
          <template v-if="latestProvisioningResult.primer_admin.password_temporal">
            Guarda estas credenciales temporales antes de cerrar esta vista. Luego continua con la configuracion inicial del workspace.
          </template>
          <template v-else>
            Se reutilizo cuenta global existente. No se genero password temporal nuevo.
          </template>
        </p>
      </div>

      <div class="provisioning-card__credentials">
        <p><strong>Empresa:</strong> {{ latestProvisioningResult.empresa.nombre }}</p>
        <p><strong>Correo:</strong> {{ latestProvisioningResult.primer_admin.email }}</p>
        <p>
          <strong>Password temporal:</strong>
          {{ latestProvisioningResult.primer_admin.password_temporal ?? 'Cuenta existente reutilizada' }}
        </p>
      </div>

      <div class="provisioning-card__actions">
        <button type="button" class="admin-btn admin-btn--outline" @click="latestProvisioningResult = null">Ocultar</button>
        <button type="button" class="admin-btn admin-btn--primary" @click="openLatestCreatedWorkspace">Configurar workspace</button>
      </div>
    </section>

      <div class="admin-surface-card empresas-card">
        <div class="admin-section-header">
          <div>
            <h3 class="admin-section-title">Empresas</h3>
            <p class="admin-section-sub">
              {{ filteredEmpresas.length }} resultados visibles en esta pagina · {{ pagination.total }} registros totales cargados.
            </p>
          </div>
        </div>

        <div class="admin-table-filters empresas-filters">
          <div class="admin-search-box admin-search-box--wide empresas-search">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="filters.search" type="text" placeholder="Buscar por nombre, RUC, alias o contacto" class="admin-search-input" />
          </div>

          <select v-model="filters.estado" class="admin-select-filter">
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
          @configure="openEmpresaConfig"
          @activate="handleActivateEmpresa"
          @suspend="requestSuspend"
          @delete="requestDelete"
        />

        <div class="admin-table-footer">
          <span class="admin-table-count empresas-count">
              Pagina {{ pagination.current_page }} de {{ pagination.last_page }} · {{ pagination.per_page }} por pagina
          </span>

          <div class="admin-pagination">
              <button
                class="admin-page-btn"
                :disabled="pagination.current_page <= 1 || isLoading"
                @click="loadPage(pagination.current_page - 1)"
              >
                Anterior
              </button>
              <button
                class="admin-page-btn"
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

      <DeleteEmpresaDialog
        v-model:open="deleteDialogOpen"
        :empresa-nombre="selectedEmpresa?.nombre ?? 'empresa seleccionada'"
        :submitting="isMutatingSelectedEmpresa"
        @submit="handleDeleteEmpresa"
      />

      <ConfiguracionWorkspacePageV2
        v-if="configDialogOpen && selectedEmpresaId != null"
        :key="selectedEmpresaId"
        :open="configDialogOpen"
        :empresa-id="selectedEmpresaId"
        context-label="Superadmin company control"
        title="Configuracion del workspace"
        subtitle="Ajusta perfil, marca, banca y estructura comercial sin salir del listado."
        @close="closeEmpresaConfig"
      />
  </div>
</template>

<style scoped>
.provisioning-card {
  display: grid;
  gap: 14px;
  padding: 18px;
  border-radius: 16px;
  border: 1px solid rgba(21, 101, 192, 0.18);
  background: linear-gradient(135deg, rgba(229, 241, 255, 0.92), rgba(245, 250, 255, 0.98));
}

.provisioning-card__eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.provisioning-card__title {
  margin: 0;
  font-size: 18px;
  color: #10233f;
}

.provisioning-card__copy {
  margin: 6px 0 0;
  font-size: 13px;
  color: #4b5d78;
}

.provisioning-card__credentials {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(148, 163, 184, 0.24);
  font-size: 13px;
  color: #12243f;
}

.provisioning-card__credentials p {
  margin: 0;
}

.provisioning-card__actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.empresas-search {
  width: 320px;
  max-width: 100%;
}

@media (max-width: 480px) {
  .empresas-search {
    width: 100%;
  }
}
</style>
