<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useRewardRedemptionsApi } from '../composables/useRewardRedemptionsApi'
import type { RewardRedemption } from '../types'

const {
  redemptions,
  isLoading,
  isUpdating,
  errorMessage,
  successMessage,
  pagination,
  fetchRedemptions,
  fetchRedemption,
  deliverRedemption,
  cancelRedemption,
} = useRewardRedemptionsApi()

const search = shallowRef('')
const membresiaId = shallowRef('')
const selectedStatus = shallowRef('')
const selectedId = shallowRef<number | null>(null)
const selectedRedemption = shallowRef<RewardRedemption | null>(null)
const cancellationReason = shallowRef('')
const localError = shallowRef('')

const selectedStatusLabel = (status: string) => ({
  procesando: 'Procesando',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}[status] ?? status)

const canOperateSelected = computed(() => selectedRedemption.value?.estado === 'procesando')

const formatDate = (value: string | null) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const loadRedemptions = async (page = 1) => {
  const parsedMembresiaId = Number.parseInt(membresiaId.value.trim(), 10)

  await fetchRedemptions({
    page,
    estado: selectedStatus.value || undefined,
    search: search.value.trim() || undefined,
    membresia_id: Number.isFinite(parsedMembresiaId) && parsedMembresiaId > 0
      ? parsedMembresiaId
      : undefined,
  })

  if (!redemptions.value.length) {
    selectedId.value = null
    selectedRedemption.value = null
    return
  }

  const firstRedemption = redemptions.value[0]
  if (!firstRedemption) {
    selectedId.value = null
    selectedRedemption.value = null
    return
  }

  const fallback = redemptions.value.find((redemption) => redemption.id === selectedId.value) ?? firstRedemption
  await selectRedemption(fallback.id)
}

const selectRedemption = async (id: number) => {
  selectedId.value = id
  selectedRedemption.value = await fetchRedemption(id)
}

const confirmDelivery = async () => {
  if (!selectedRedemption.value) {
    return
  }

  await deliverRedemption(selectedRedemption.value.id)
  await loadRedemptions(pagination.value.current_page)
}

const confirmCancellation = async () => {
  if (!selectedRedemption.value) {
    return
  }

  if (!cancellationReason.value.trim()) {
    localError.value = 'El motivo de cancelacion es obligatorio.'
    return
  }

  localError.value = ''
  await cancelRedemption(selectedRedemption.value.id, cancellationReason.value.trim())
  cancellationReason.value = ''
  await loadRedemptions(pagination.value.current_page)
}

onMounted(() => {
  void loadRedemptions()
})
</script>

<template>
  <div class="reward-panel">
    <div class="panel-toolbar">
      <div>
        <h3 class="section-title">Canjes Solicitados</h3>
        <p class="section-sub">Cola administrativa real para entregar o cancelar canjes de puntos.</p>
      </div>

      <div class="toolbar-filters">
        <input v-model="search" type="text" class="filter-input" placeholder="Buscar distribuidor o premio..." @keyup.enter="loadRedemptions()">
        <input
          v-model="membresiaId"
          type="number"
          min="1"
          class="filter-input filter-input-narrow"
          placeholder="ID membresia"
          @keyup.enter="loadRedemptions()"
        >
        <select v-model="selectedStatus" class="filter-select" @change="loadRedemptions()">
          <option value="">Todos los estados</option>
          <option value="procesando">Procesando</option>
          <option value="entregado">Entregado</option>
          <option value="cancelado">Cancelado</option>
        </select>
        <button type="button" class="filter-button" @click="loadRedemptions()">Actualizar</button>
      </div>
    </div>

    <div v-if="errorMessage || localError" class="inline-error">{{ localError || errorMessage }}</div>
    <div v-if="successMessage" class="inline-success">{{ successMessage }}</div>

    <div class="panel-grid">
      <section class="panel-table">
        <div v-if="isLoading" class="panel-state">Cargando canjes...</div>
        <div v-else-if="redemptions.length === 0" class="panel-state">No hay canjes para este filtro.</div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Distribuidor</th>
                <th>Premio</th>
                <th>Puntos</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="redemption in redemptions"
                :key="redemption.id"
                :class="{ 'row-selected': selectedId === redemption.id }"
                @click="selectRedemption(redemption.id)"
              >
                <td>{{ formatDate(redemption.created_at) }}</td>
                <td>{{ redemption.distribuidor?.nombre ?? '—' }}</td>
                <td>{{ redemption.recompensa?.nombre ?? '—' }}</td>
                <td>{{ redemption.puntos_utilizados }}</td>
                <td>
                  <span class="status-badge" :class="`status-${redemption.estado}`">{{ selectedStatusLabel(redemption.estado) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.last_page > 1" class="table-footer">
          <span class="table-count">{{ pagination.total }} canjes registrados</span>
          <div class="pagination">
            <button class="page-btn" :disabled="pagination.current_page === 1" @click="loadRedemptions(pagination.current_page - 1)">Anterior</button>
            <button class="page-btn active">{{ pagination.current_page }}</button>
            <button class="page-btn" :disabled="pagination.current_page === pagination.last_page" @click="loadRedemptions(pagination.current_page + 1)">Siguiente</button>
          </div>
        </div>
      </section>

      <aside class="panel-detail">
        <div v-if="!selectedRedemption" class="panel-state">Selecciona un canje para revisar datos y operar.</div>
        <template v-else>
          <div class="detail-hero">
            <span class="detail-label">Estado actual</span>
            <strong>{{ selectedStatusLabel(selectedRedemption.estado) }}</strong>
            <small>{{ formatDate(selectedRedemption.created_at) }}</small>
          </div>

          <div class="detail-grid">
            <div class="detail-card">
              <span class="detail-label">Distribuidor</span>
              <strong>{{ selectedRedemption.distribuidor?.nombre ?? '—' }}</strong>
              <small>{{ selectedRedemption.distribuidor?.rango ?? 'Sin rango' }}</small>
            </div>
            <div class="detail-card">
              <span class="detail-label">Puntos utilizados</span>
              <strong>{{ selectedRedemption.puntos_utilizados }}</strong>
              <small>Nivel {{ selectedRedemption.distribuidor?.nivel_confianza ?? '—' }}</small>
            </div>
          </div>

          <div class="detail-block">
            <h4 class="detail-title">Premio y transaccion</h4>
            <dl class="detail-list">
              <div>
                <dt>Premio</dt>
                <dd>{{ selectedRedemption.recompensa?.nombre ?? '—' }}</dd>
              </div>
              <div>
                <dt>Tipo</dt>
                <dd>{{ selectedRedemption.recompensa?.tipo_premio ?? '—' }}</dd>
              </div>
              <div>
                <dt>Transaccion</dt>
                <dd>{{ selectedRedemption.transaccion?.tipo ?? '—' }}</dd>
              </div>
              <div>
                <dt>Descripcion ledger</dt>
                <dd>{{ selectedRedemption.transaccion?.descripcion ?? '—' }}</dd>
              </div>
            </dl>
          </div>

          <div class="detail-block">
            <h4 class="detail-title">Contacto y seguimiento</h4>
            <dl class="detail-list">
              <div>
                <dt>Email</dt>
                <dd>{{ selectedRedemption.distribuidor?.email ?? '—' }}</dd>
              </div>
              <div>
                <dt>Telefono</dt>
                <dd>{{ selectedRedemption.distribuidor?.telefono ?? '—' }}</dd>
              </div>
              <div>
                <dt>Motivo cancelacion</dt>
                <dd>{{ selectedRedemption.motivo_cancelacion ?? 'Sin cancelacion' }}</dd>
              </div>
            </dl>
          </div>

          <div v-if="canOperateSelected" class="detail-block action-block">
            <h4 class="detail-title">Acciones operativas</h4>
            <div class="action-row">
              <button class="action-button approve" :disabled="isUpdating === selectedRedemption.id" @click="confirmDelivery">
                {{ isUpdating === selectedRedemption.id ? 'Procesando...' : 'Marcar entregado' }}
              </button>
            </div>

            <textarea
              v-model="cancellationReason"
              class="action-textarea"
              placeholder="Motivo obligatorio para cancelar este canje..."
            />
            <button class="action-button danger" :disabled="isUpdating === selectedRedemption.id" @click="confirmCancellation">
              {{ isUpdating === selectedRedemption.id ? 'Procesando...' : 'Cancelar canje' }}
            </button>
          </div>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.reward-panel,
.panel-detail,
.detail-block {
  display: flex;
  flex-direction: column;
}

.reward-panel,
.panel-detail {
  gap: 18px;
}

.panel-toolbar,
.table-footer,
.pagination,
.toolbar-filters,
.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.panel-toolbar,
.table-footer {
  justify-content: space-between;
  align-items: center;
}

.panel-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.95fr);
  gap: 18px;
}

.panel-table,
.panel-detail {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
}

.filter-input,
.filter-select,
.action-textarea {
  border: 1px solid #d7deea;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  color: #243043;
}

.filter-input {
  min-width: 250px;
}

.filter-input-narrow {
  min-width: 140px;
  max-width: 160px;
}

.filter-button,
.action-button,
.page-btn {
  min-height: 40px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
}

.filter-button,
.page-btn {
  border: 1px solid #d7deea;
  background: #fff;
  padding: 0 14px;
  cursor: pointer;
}

.inline-error,
.inline-success,
.panel-state {
  border-radius: 12px;
  padding: 14px 16px;
  font-size: 13px;
}

.inline-error {
  background: #fef2f2;
  color: #b91c1c;
}

.inline-success {
  background: #f0fdf4;
  color: #166534;
}

.panel-state {
  background: #f8fafc;
  color: #64748b;
}

.table-wrap {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table thead tr {
  background: #162236;
  color: #fff;
}

.data-table th,
.data-table td {
  padding: 11px 12px;
  text-align: left;
}

.data-table tbody tr {
  border-bottom: 1px solid #eef2f7;
  cursor: pointer;
}

.data-table tbody tr:hover,
.row-selected {
  background: #f8fbff;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.status-procesando {
  background: #eff6ff;
  color: #1d4ed8;
}

.status-entregado {
  background: #dcfce7;
  color: #166534;
}

.status-cancelado {
  background: #fee2e2;
  color: #b91c1c;
}

.detail-hero,
.detail-card,
.detail-block {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  background: #f8fbff;
  gap: 6px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-label,
.detail-list dt,
.table-count,
.detail-card small,
.detail-hero small {
  color: #64748b;
  font-size: 12px;
}

.detail-title {
  margin: 0;
  color: #1e293b;
  font-size: 14px;
}

.detail-list {
  display: grid;
  gap: 12px;
  margin: 0;
}

.detail-list div {
  display: grid;
  gap: 4px;
}

.detail-list dd {
  margin: 0;
  color: #1e293b;
  font-size: 13px;
}

.action-block {
  background: #fffdf5;
}

.action-textarea {
  min-height: 88px;
  resize: vertical;
}

.action-button {
  border: none;
  padding: 0 14px;
  color: #fff;
  cursor: pointer;
}

.action-button.approve {
  background: #166534;
}

.action-button.danger {
  background: #b91c1c;
}

.page-btn.active {
  background: #e8f1fb;
  color: #1a6ab5;
  border-color: #bfd7f0;
}

.page-btn:disabled,
.action-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

@media (max-width: 1024px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .filter-input,
  .filter-select,
  .filter-button,
  .page-btn,
  .action-button {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>