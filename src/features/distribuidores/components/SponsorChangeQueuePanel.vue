<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSponsorChangeApi } from '../composables/useSponsorChangeApi'
import { formatDateTime } from '@/utils/formatters'
import type { SponsorChangeFilter, SponsorChangeRequest } from '../types'

const emit = defineEmits<{
  updated: []
}>()

const {
  requests,
  activeFilter,
  isLoading,
  mutatingRequestId,
  errorMessage,
  successMessage,
  pagination,
  fetchRequests,
  approveRequest,
  rejectRequest,
} = useSponsorChangeApi()

const rejectModalOpen = ref(false)
const rejectMotivo = ref('')
const selectedRequest = ref<SponsorChangeRequest | null>(null)

const fullName = (user?: { nombre?: string | null; apellido?: string | null } | null) => {
  if (!user) {
    return '—'
  }

  return `${user.nombre ?? ''} ${user.apellido ?? ''}`.trim() || '—'
}

const membershipName = (membership?: { usuario?: { nombre?: string | null; apellido?: string | null } | null } | null) =>
  fullName(membership?.usuario ?? null)

const labelEstado = (estado: string) =>
  ({
    pendiente: 'Pendiente',
    aprobada: 'Aprobada',
    rechazada: 'Rechazada',
    cancelada: 'Cancelada',
  })[estado] ?? estado

const formatFecha = (value?: string | null) =>
  formatDateTime(value)

const cambiarFiltro = (filtro: SponsorChangeFilter) => {
  activeFilter.value = filtro
  fetchRequests(1, filtro)
}

const cambiarPagina = (page: number) => {
  fetchRequests(page, activeFilter.value)
}

const abrirRechazo = (request: SponsorChangeRequest) => {
  selectedRequest.value = request
  rejectMotivo.value = ''
  rejectModalOpen.value = true
}

const confirmarRechazo = async () => {
  if (!selectedRequest.value || rejectMotivo.value.trim().length < 5) {
    return
  }

  const ok = await rejectRequest(selectedRequest.value.id, rejectMotivo.value.trim())
  if (ok) {
    rejectModalOpen.value = false
    selectedRequest.value = null
    emit('updated')
  }
}

const aprobarSolicitud = async (requestId: number) => {
  const ok = await approveRequest(requestId)
  if (ok) {
    emit('updated')
  }
}

onMounted(() => {
  fetchRequests()
})
</script>

<template>
  <div class="sponsor-queue">
    <div v-if="errorMessage" class="alert-error">{{ errorMessage }}</div>
    <div v-if="successMessage" class="alert-success">{{ successMessage }}</div>

    <div class="filters-bar">
      <button
        type="button"
        class="view-tab"
        :class="{ active: activeFilter === 'pendientes' }"
        @click="cambiarFiltro('pendientes')"
      >
        Pendientes
      </button>
      <button
        type="button"
        class="view-tab"
        :class="{ active: activeFilter === 'historico' }"
        @click="cambiarFiltro('historico')"
      >
        Historial
      </button>
      <span class="result-count">{{ pagination.total }} solicitudes</span>
    </div>

    <div class="table-card">
      <div v-if="isLoading" class="loading-state">
        <div class="spinner" />
        <span>Cargando solicitudes...</span>
      </div>

      <div v-else class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Distribuidor</th>
              <th>Patrocinador actual</th>
              <th>Patrocinador propuesto</th>
              <th>Origen</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th v-if="activeFilter === 'pendientes'">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="requests.length === 0">
              <td :colspan="activeFilter === 'pendientes' ? 7 : 6" class="empty-state">
                No hay solicitudes en esta cola.
              </td>
            </tr>
            <tr v-for="request in requests" :key="request.id">
              <td>
                <strong>{{ membershipName(request.membresia) }}</strong>
                <div class="subtle">{{ request.membresia?.usuario?.email ?? '—' }}</div>
              </td>
              <td>{{ membershipName(request.referente_anterior) }}</td>
              <td>{{ membershipName(request.referente_propuesto) }}</td>
              <td>{{ request.origen }}</td>
              <td>{{ formatFecha(request.created_at) }}</td>
              <td>
                <span class="status-pill" :class="request.estado">{{ labelEstado(request.estado) }}</span>
              </td>
              <td v-if="activeFilter === 'pendientes'" class="actions-cell">
                <button
                  type="button"
                  class="btn-secondary btn-sm"
                  :disabled="mutatingRequestId === request.id"
                  @click="aprobarSolicitud(request.id)"
                >
                  Aprobar
                </button>
                <button
                  type="button"
                  class="btn-danger btn-sm"
                  :disabled="mutatingRequestId === request.id"
                  @click="abrirRechazo(request)"
                >
                  Rechazar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.last_page > 1" class="pagination-bar">
        <button
          type="button"
          class="btn-secondary btn-sm"
          :disabled="pagination.current_page <= 1 || isLoading"
          @click="cambiarPagina(pagination.current_page - 1)"
        >
          Anterior
        </button>
        <span>Página {{ pagination.current_page }} de {{ pagination.last_page }}</span>
        <button
          type="button"
          class="btn-secondary btn-sm"
          :disabled="pagination.current_page >= pagination.last_page || isLoading"
          @click="cambiarPagina(pagination.current_page + 1)"
        >
          Siguiente
        </button>
      </div>
    </div>

    <div v-if="rejectModalOpen" class="modal-overlay" @click.self="rejectModalOpen = false">
      <div class="modal-card" role="dialog" aria-modal="true">
        <h3>Rechazar cambio de patrocinador</h3>
        <p class="modal-copy">
          {{ membershipName(selectedRequest?.membresia) }} →
          {{ membershipName(selectedRequest?.referente_propuesto) }}
        </p>
        <textarea
          v-model="rejectMotivo"
          class="form-input"
          rows="4"
          placeholder="Motivo del rechazo (obligatorio)"
        />
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="rejectModalOpen = false">Cancelar</button>
          <button
            type="button"
            class="btn-danger"
            :disabled="rejectMotivo.trim().length < 5 || mutatingRequestId != null"
            @click="confirmarRechazo"
          >
            Confirmar rechazo
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sponsor-queue {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.subtle {
  font-size: 12px;
  color: #666;
}

.status-pill {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-pill.pendiente {
  background: #fff7ed;
  color: #c2410c;
}

.status-pill.aprobada {
  background: #ecfdf5;
  color: #047857;
}

.status-pill.rechazada {
  background: #fef2f2;
  color: #b91c1c;
}

.actions-cell {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
  border: none;
  border-radius: 8px;
  cursor: pointer;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  padding: 24px;
}

.modal-card {
  width: min(480px, 100%);
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-copy {
  margin: 0;
  color: #555;
  font-size: 14px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
