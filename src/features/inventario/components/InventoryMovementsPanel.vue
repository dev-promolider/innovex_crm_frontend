<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { useInventoryMovementsApi } from '../composables/useInventoryMovementsApi'
import type { InventoryMovement } from '../types'

const { movements, isLoading, errorMessage, pagination, fetchMovements } = useInventoryMovementsApi()

const search = shallowRef('')
const selectedId = shallowRef<number | null>(null)
const selectedType = shallowRef('')

const movementTypeOptions = [
    { value: '', label: 'Todos los tipos' },
    { value: 'entrada_central', label: 'Entrada central' },
    { value: 'asignacion_distribuidor', label: 'Asignación' },
    { value: 'confirmacion_recepcion', label: 'Confirmación recepción' },
    { value: 'venta_consumidor', label: 'Venta consumidor' },
    { value: 'devolucion', label: 'Devolución' },
    { value: 'ajuste_admin', label: 'Ajuste admin' },
]

const selectedMovement = computed(() =>
    movements.value.find((movement) => movement.id === selectedId.value) ?? null,
)

const movementTypeLabel = (type: string) =>
    movementTypeOptions.find((option) => option.value === type)?.label ?? type

const formatDate = (value: string | null) => {
    if (!value) {
        return '—'
    }

    return new Intl.DateTimeFormat('es-PE', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(new Date(value))
}

const loadMovements = async (page = 1) => {
    await fetchMovements({
        page,
        search: search.value.trim() || undefined,
        tipo: selectedType.value || undefined,
    })

    if (!movements.value.length) {
        selectedId.value = null
        return
    }

    const firstMovement = movements.value[0]
    if (!firstMovement) {
      selectedId.value = null
      return
    }

    const existing = movements.value.find((movement) => movement.id === selectedId.value)
    selectedId.value = existing?.id ?? firstMovement.id
}

const selectMovement = (movement: InventoryMovement) => {
    selectedId.value = movement.id
}

onMounted(() => {
    void loadMovements()
})
</script>

<template>
  <div class="inventory-movements-panel">
    <div class="panel-toolbar">
      <div class="toolbar-copy">
        <h3 class="section-title">Movimientos de Inventario</h3>
        <p class="section-sub">Ledger administrativo real del stock central, asignaciones, recepciones y ventas.</p>
      </div>

      <div class="toolbar-filters">
        <input
          v-model="search"
          type="text"
          class="filter-input"
          placeholder="Buscar kit, origen, destino o referencia..."
          @keyup.enter="loadMovements()"
        >
        <select v-model="selectedType" class="filter-select" @change="loadMovements()">
          <option v-for="option in movementTypeOptions" :key="option.value || 'all'" :value="option.value">{{ option.label }}</option>
        </select>
        <button class="filter-button" type="button" @click="loadMovements()">Actualizar</button>
      </div>
    </div>

    <div v-if="errorMessage" class="inline-error">{{ errorMessage }}</div>

    <div class="panel-grid">
      <section class="panel-table">
        <div v-if="isLoading" class="panel-state">Cargando movimientos...</div>
        <div v-else-if="movements.length === 0" class="panel-state">No hay movimientos para este filtro.</div>
        <div v-else class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Kit</th>
                <th>Cantidad</th>
                <th>Origen</th>
                <th>Destino</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="movement in movements"
                :key="movement.id"
                :class="{ 'row-selected': selectedId === movement.id }"
                @click="selectMovement(movement)"
              >
                <td>{{ formatDate(movement.created_at) }}</td>
                <td>{{ movementTypeLabel(movement.tipo) }}</td>
                <td>{{ movement.kit?.nombre ?? '—' }}</td>
                <td>{{ movement.cantidad }}</td>
                <td>{{ movement.origen?.nombre ?? 'Central' }}</td>
                <td>{{ movement.destino?.nombre ?? 'Consumidor final' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination.last_page > 1" class="table-footer">
          <span class="table-count">{{ pagination.total }} movimientos registrados</span>
          <div class="pagination">
            <button class="page-btn" :disabled="pagination.current_page === 1" @click="loadMovements(pagination.current_page - 1)">Anterior</button>
            <button class="page-btn active">{{ pagination.current_page }}</button>
            <button class="page-btn" :disabled="pagination.current_page === pagination.last_page" @click="loadMovements(pagination.current_page + 1)">Siguiente</button>
          </div>
        </div>
      </section>

      <aside class="panel-detail">
        <div v-if="!selectedMovement" class="panel-state">Selecciona un movimiento para revisar el contexto operativo.</div>
        <template v-else>
          <div class="detail-card">
            <span class="detail-label">Tipo</span>
            <strong>{{ movementTypeLabel(selectedMovement.tipo) }}</strong>
            <small>{{ formatDate(selectedMovement.created_at) }}</small>
          </div>

          <div class="detail-grid">
            <div class="detail-card">
              <span class="detail-label">Kit</span>
              <strong>{{ selectedMovement.kit?.nombre ?? '—' }}</strong>
              <small>{{ selectedMovement.cantidad }} unidades</small>
            </div>
            <div class="detail-card">
              <span class="detail-label">Referencia</span>
              <strong>{{ selectedMovement.referencia_tipo ?? 'Sin referencia' }}</strong>
              <small>#{{ selectedMovement.referencia_id ?? '—' }}</small>
            </div>
          </div>

          <div class="detail-block">
            <h4 class="detail-title">Trazabilidad</h4>
            <dl class="detail-list">
              <div>
                <dt>Origen</dt>
                <dd>{{ selectedMovement.origen?.nombre ?? 'Central' }}</dd>
              </div>
              <div>
                <dt>Destino</dt>
                <dd>{{ selectedMovement.destino?.nombre ?? 'Consumidor final' }}</dd>
              </div>
              <div>
                <dt>Generado por</dt>
                <dd>{{ selectedMovement.generado_por?.nombre ?? 'Sistema' }}</dd>
              </div>
              <div>
                <dt>Motivo</dt>
                <dd>{{ selectedMovement.motivo ?? 'Sin motivo adicional' }}</dd>
              </div>
            </dl>
          </div>

          <div class="detail-block">
            <h4 class="detail-title">Saldos posteriores</h4>
            <dl class="detail-list">
              <div>
                <dt>Stock origen</dt>
                <dd>{{ selectedMovement.stock_resultante_origen ?? '—' }}</dd>
              </div>
              <div>
                <dt>Stock destino</dt>
                <dd>{{ selectedMovement.stock_resultante_destino ?? '—' }}</dd>
              </div>
            </dl>
          </div>
        </template>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.inventory-movements-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.toolbar-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toolbar-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.filter-input,
.filter-select {
  min-height: 40px;
  border: 1px solid #d7deea;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 13px;
  color: #243043;
  background: #fff;
}

.filter-input {
  min-width: 260px;
}

.filter-button {
  min-height: 40px;
  border: none;
  border-radius: 10px;
  padding: 0 16px;
  background: #1a6ab5;
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.inline-error,
.panel-state {
  border-radius: 12px;
  padding: 16px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
}

.inline-error {
  background: #fef2f2;
  color: #b91c1c;
}

.panel-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 0.9fr);
  gap: 18px;
}

.panel-table,
.panel-detail {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
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

.table-footer {
  margin-top: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.table-count,
.detail-label,
.detail-card small,
.detail-list dt {
  color: #64748b;
  font-size: 12px;
}

.pagination {
  display: flex;
  gap: 8px;
}

.page-btn {
  min-height: 36px;
  padding: 0 12px;
  border: 1px solid #d7deea;
  border-radius: 10px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
}

.page-btn.active {
  background: #e8f1fb;
  color: #1a6ab5;
  border-color: #bfd7f0;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.panel-detail {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-card,
.detail-block {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: #f8fbff;
}

.detail-card strong,
.detail-list dd,
.detail-title {
  color: #1e293b;
}

.detail-title {
  margin: 0;
  font-size: 14px;
}

.detail-list {
  margin: 0;
  display: grid;
  gap: 12px;
}

.detail-list div {
  display: grid;
  gap: 3px;
}

.detail-list dd {
  margin: 0;
  font-size: 13px;
}

@media (max-width: 1024px) {
  .panel-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .filter-input {
    min-width: 100%;
  }

  .detail-grid,
  .table-footer {
    grid-template-columns: 1fr;
  }
}
</style>