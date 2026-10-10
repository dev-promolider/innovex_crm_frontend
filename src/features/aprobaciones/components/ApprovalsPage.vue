<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import ApiErrorState from '@/components/shared/ApiErrorState.vue'
import ApprovalDetailDialog from './ApprovalDetailDialog.vue'
import ApprovalsTable from './ApprovalsTable.vue'
import { useWorkspaceApprovalsApi } from '../composables/useWorkspaceApprovalsApi'
import type { ApprovalQueueFilter } from '../types'

const {
  approvals,
  approvalDetail,
  activeFilter,
  isLoading,
  isDetailLoading,
  mutatingApprovalId,
  errorMessage,
  detailErrorMessage,
  successMessage,
  pagination,
  clearMessages,
  fetchApprovals,
  fetchApprovalDetail,
  approve,
  reject,
  suspend,
  reactivate,
} = useWorkspaceApprovalsApi()

const filters = reactive({
  search: '',
})

const detailDialogOpen = shallowRef(false)
const selectedApprovalId = shallowRef<number | null>(null)

const filteredApprovals = computed(() => {
  const query = filters.search.trim().toLowerCase()

  if (!query) {
    return approvals.value
  }

  return approvals.value.filter((approval) => {
    const values = [
      approval.usuario.nombre,
      approval.usuario.apellido,
      approval.usuario.email,
      approval.usuario.numero_documento,
      approval.rango?.nombre_rango ?? '',
      approval.referente?.usuario?.nombre ?? '',
      approval.referente?.usuario?.apellido ?? '',
      approval.estado_validacion,
    ]

    return values.some((value) => value.toLowerCase().includes(query))
  })
})

const pendingCount = computed(() => approvals.value.filter((approval) => approval.estado_validacion === 'revision_admin').length)
const activeCount = computed(() => approvals.value.filter((approval) => approval.estado_validacion === 'activa').length)
const suspendedCount = computed(() => approvals.value.filter((approval) => approval.estado_validacion === 'suspendida').length)

const loadPage = async (page = 1, filter: ApprovalQueueFilter = activeFilter.value) => {
  await fetchApprovals(page, filter)
}

const handleFilterChange = async (filter: ApprovalQueueFilter) => {
  if (filter === activeFilter.value && pagination.current_page === 1) {
    return
  }

  await loadPage(1, filter)
}

const openDetailDialog = async (approvalId: number) => {
  clearMessages()
  selectedApprovalId.value = approvalId
  detailDialogOpen.value = true
  await fetchApprovalDetail(approvalId)
}

const retryApprovalDetail = () => {
  if (selectedApprovalId.value !== null) void fetchApprovalDetail(selectedApprovalId.value)
}

const closeDetailDialog = () => {
  detailDialogOpen.value = false
}

const handleApprove = async (approvalId: number) => {
  try {
    await approve(approvalId)
  } catch {
    return
  }
}

const handleReject = async (approvalId: number, motivo: string) => {
  try {
    await reject(approvalId, motivo)
  } catch {
    return
  }
}

const handleSuspend = async (approvalId: number, motivo: string) => {
  try {
    await suspend(approvalId, motivo)
  } catch {
    return
  }
}

const handleReactivate = async (approvalId: number) => {
  try {
    await reactivate(approvalId)
  } catch {
    return
  }
}

onMounted(async () => {
  await loadPage()
})
</script>

<template>
  <div class="page-body admin-list-page approvals-page">
    <div class="admin-list-page__header">
      <div>
        <h1 class="admin-list-page__title">Aprobaciones de membresia</h1>
        <p class="admin-list-page__subtitle">
          Revisa solicitudes de ingreso, evidencia de identidad y estados operativos antes de habilitar a cada distribuidor.
        </p>
      </div>

      <div class="admin-list-page__actions">
        <button class="admin-btn admin-btn--outline" @click="loadPage(pagination.current_page)">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.5"/></svg>
          Actualizar
        </button>
      </div>
    </div>

    <section class="admin-kpi-grid">
      <div class="admin-kpi-card">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--blue">{{ pendingCount }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--blue">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Pendientes de revision</span>
        <span class="admin-kpi-card__sub">Solicitudes en la cola administrativa actual.</span>
      </div>

      <div class="admin-kpi-card admin-kpi-card--accent">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--teal">{{ activeCount }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--teal">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Activas en la muestra</span>
        <span class="admin-kpi-card__sub">Membresias ya habilitadas dentro de esta cola cargada.</span>
      </div>

      <div class="admin-kpi-card admin-kpi-card--danger">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--red">{{ suspendedCount }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--red">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="8" y1="8" x2="16" y2="16"/><line x1="16" y1="8" x2="8" y2="16"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Suspendidas en la muestra</span>
        <span class="admin-kpi-card__sub">Casos que requieren reactivacion manual.</span>
      </div>

      <div class="admin-kpi-card admin-kpi-card--warn">
        <div class="admin-kpi-card__top">
          <span class="admin-kpi-card__value admin-kpi-card__value--orange">{{ pagination.total }}</span>
          <div class="admin-kpi-card__icon admin-kpi-card__icon--orange">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/></svg>
          </div>
        </div>
        <span class="admin-kpi-card__label">Total paginado</span>
        <span class="admin-kpi-card__sub">Registros devueltos por el filtro actual.</span>
      </div>
    </section>

    <div v-if="successMessage" class="admin-alert admin-alert--success">
      {{ successMessage }}
      <button class="admin-alert__close" @click="clearMessages">✕</button>
    </div>

    <div class="admin-surface-card approvals-card">
      <div class="admin-section-header">
        <div>
          <h3 class="admin-section-title">Aprobaciones</h3>
          <p class="admin-section-sub">
            {{ filteredApprovals.length }} resultados visibles en esta pagina · {{ pagination.total }} registros totales del filtro actual.
          </p>
        </div>

        <div class="queue-toggle" role="tablist" aria-label="Filtro de cola de aprobaciones">
          <button
            type="button"
            class="queue-toggle__button"
            :class="{ 'queue-toggle__button--active': activeFilter === 'pendientes' }"
            @click="handleFilterChange('pendientes')"
          >
            Pendientes
          </button>
          <button
            type="button"
            class="queue-toggle__button"
            :class="{ 'queue-toggle__button--active': activeFilter === 'historico' }"
            @click="handleFilterChange('historico')"
          >
            Historico
          </button>
        </div>
      </div>

      <div class="admin-table-filters approvals-filters">
        <div class="admin-search-box admin-search-box--wide approvals-search">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Buscar por nombre, correo, documento o patrocinador"
            class="admin-search-input"
          />
        </div>
      </div>

      <ApiErrorState
        v-if="errorMessage"
        :message="errorMessage"
        :retrying="isLoading"
        @retry="loadPage(pagination.current_page)"
      />

      <ApprovalsTable
        v-if="!errorMessage"
        :approvals="filteredApprovals"
        :loading="isLoading"
        :active-filter="activeFilter"
        @review="openDetailDialog"
      />

      <div v-if="!errorMessage" class="admin-table-footer">
        <span class="admin-table-count">
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

    <ApprovalDetailDialog
      :open="detailDialogOpen"
      :detail="approvalDetail"
      :loading="isDetailLoading"
      :error-message="detailErrorMessage"
      :mutating-approval-id="mutatingApprovalId"
      @close="closeDetailDialog"
      @retry="retryApprovalDetail"
      @approve="handleApprove"
      @reject="handleReject"
      @suspend="handleSuspend"
      @reactivate="handleReactivate"
    />
  </div>
</template>

<style scoped>
.queue-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #f8fafc;
}

.queue-toggle__button {
  border: none;
  background: transparent;
  color: #64748b;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.queue-toggle__button--active {
  background: white;
  color: #145fbe;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}

.approvals-search {
  width: 320px;
  max-width: 100%;
}

@media (max-width: 768px) {
  .admin-section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .approvals-search {
    width: 100%;
  }
}
</style>
