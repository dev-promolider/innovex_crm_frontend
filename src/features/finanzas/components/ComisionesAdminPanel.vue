<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import apiClient from '@/app/apiClient'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { formatDateTime } from '@/utils/formatters'

interface ComisionItem {
  id: number
  estado: string
  nivel_cascada: number
  porcentaje_aplicado: number
  monto_base_calculo: number
  monto_comision: number
  created_at: string | null
  liberada_at: string | null
  beneficiario: {
    membresia_id: number | null
    nombre: string
    email: string | null
    rango: string | null
  }
  venta: {
    id: number | null
    estado: string | null
    monto_total_venta: number
    capturado_at: string | null
    campana: string | null
    kit: string | null
  }
}

interface Pagination<T> {
  data: T[]
  current_page: number
  last_page: number
  total: number
}

interface ComisionesResponse {
  status: string
  data: {
    comisiones: Pagination<ComisionItem>
    totales_por_estado: Record<string, { cantidad: number; monto: number }>
    totales_por_beneficiario: Array<{ membresia_id: number; nombre: string; cantidad: number; monto: number }>
  }
}

const { authHeaders } = useAuthenticatedSession()
const isLoading = shallowRef(false)
const errorMessage = shallowRef('')
const comisiones = shallowRef<ComisionItem[]>([])
const totalsByState = shallowRef<Record<string, { cantidad: number; monto: number }>>({})
const topBeneficiaries = shallowRef<ComisionesResponse['data']['totales_por_beneficiario']>([])
const pagination = reactive({ current_page: 1, last_page: 1, total: 0 })
const filters = reactive({
  estado: 'todos',
  desde: '',
  hasta: '',
  membresia_id: '',
  campana_id: '',
})

const { ensureCurrencyLoaded, formatCurrency: formatMoney } = useWorkspaceCurrency()

const formatDate = (value: string | null | undefined) =>
  formatDateTime(value)

const totalAmount = computed(() =>
  Object.values(totalsByState.value).reduce((acc, item) => acc + item.monto, 0),
)

const loadCommissions = async (page = 1) => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await apiClient.get<ComisionesResponse>('/workspace/admin/finanzas/comisiones', {
      headers: authHeaders(),
      params: {
        page,
        estado: filters.estado,
        desde: filters.desde || undefined,
        hasta: filters.hasta || undefined,
        membresia_id: filters.membresia_id || undefined,
        campana_id: filters.campana_id || undefined,
      },
    })

    comisiones.value = response.data.data.comisiones.data ?? []
    totalsByState.value = response.data.data.totales_por_estado ?? {}
    topBeneficiaries.value = response.data.data.totales_por_beneficiario ?? []
    pagination.current_page = response.data.data.comisiones.current_page
    pagination.last_page = response.data.data.comisiones.last_page
    pagination.total = response.data.data.comisiones.total
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'No se pudieron cargar comisiones.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void ensureCurrencyLoaded().then(() => loadCommissions())
})
</script>

<template>
  <section class="commissions-panel">
    <div class="commissions-toolbar">
      <div>
        <h3>Reporte de comisiones</h3>
        <p>Comisiones por distribuidor, campaña y estado de liberación.</p>
      </div>
      <button class="admin-btn admin-btn--outline" type="button" :disabled="isLoading" @click="loadCommissions(pagination.current_page)">
        {{ isLoading ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <div class="commission-filters">
      <select v-model="filters.estado" class="admin-select-filter" @change="loadCommissions(1)">
        <option value="todos">Todos los estados</option>
        <option value="pendiente_liberacion">Pendiente liberación</option>
        <option value="liberada">Liberada</option>
        <option value="retenida">Retenida</option>
        <option value="cancelada">Cancelada</option>
      </select>
      <input v-model="filters.desde" class="admin-input" type="date" @change="loadCommissions(1)" />
      <input v-model="filters.hasta" class="admin-input" type="date" @change="loadCommissions(1)" />
      <input v-model="filters.membresia_id" class="admin-input" type="number" min="1" placeholder="ID membresía" @change="loadCommissions(1)" />
      <input v-model="filters.campana_id" class="admin-input" type="number" min="1" placeholder="ID campaña" @change="loadCommissions(1)" />
    </div>

    <div v-if="errorMessage" class="admin-alert admin-alert--error">{{ errorMessage }}</div>

    <div class="commission-summary">
      <article class="summary-card">
        <strong>{{ formatMoney(totalAmount) }}</strong>
        <span>Total filtrado</span>
      </article>
      <article v-for="(total, state) in totalsByState" :key="state" class="summary-card">
        <strong>{{ formatMoney(total.monto) }}</strong>
        <span>{{ state }} · {{ total.cantidad }}</span>
      </article>
    </div>

    <div class="commission-layout">
      <div class="commission-table-wrap">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Beneficiario</th>
              <th>Venta</th>
              <th>Campaña</th>
              <th>Estado</th>
              <th>Monto</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="isLoading">
              <td colspan="6" class="admin-empty-state">Cargando comisiones...</td>
            </tr>
            <tr v-else-if="comisiones.length === 0">
              <td colspan="6" class="admin-empty-state">Sin comisiones para estos filtros.</td>
            </tr>
            <tr v-for="comision in comisiones" :key="comision.id">
              <td>
                <strong>{{ comision.beneficiario.nombre || 'Sin beneficiario' }}</strong>
                <small>{{ comision.beneficiario.rango || 'Sin rango' }}</small>
              </td>
              <td>#{{ comision.venta.id }} · {{ formatMoney(comision.venta.monto_total_venta) }}</td>
              <td>{{ comision.venta.campana || 'Sin campaña' }}</td>
              <td><span class="commission-badge">{{ comision.estado }}</span></td>
              <td>{{ formatMoney(comision.monto_comision) }}</td>
              <td>{{ formatDate(comision.created_at) }}</td>
            </tr>
          </tbody>
        </table>

        <div v-if="pagination.last_page > 1" class="admin-table-footer">
          <span>Página {{ pagination.current_page }} de {{ pagination.last_page }} · {{ pagination.total }} registros</span>
          <div class="admin-pagination">
            <button class="admin-page-btn" :disabled="pagination.current_page === 1" @click="loadCommissions(pagination.current_page - 1)">Anterior</button>
            <button class="admin-page-btn admin-page-btn--active">{{ pagination.current_page }}</button>
            <button class="admin-page-btn" :disabled="pagination.current_page === pagination.last_page" @click="loadCommissions(pagination.current_page + 1)">Siguiente</button>
          </div>
        </div>
      </div>

      <aside class="beneficiary-panel">
        <h4>Top beneficiarios</h4>
        <div v-if="topBeneficiaries.length === 0" class="admin-empty-state">Sin datos.</div>
        <div v-for="item in topBeneficiaries" :key="item.membresia_id" class="beneficiary-row">
          <span>{{ item.nombre || `Membresía ${item.membresia_id}` }}</span>
          <strong>{{ formatMoney(item.monto) }}</strong>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.commissions-panel,
.commission-table-wrap,
.beneficiary-panel {
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  padding: 18px;
}

.commissions-toolbar,
.commission-filters,
.commission-summary,
.commission-layout,
.admin-table-footer,
.beneficiary-row {
  display: flex;
  gap: 12px;
}

.commissions-toolbar,
.admin-table-footer,
.beneficiary-row {
  align-items: center;
  justify-content: space-between;
}

.commissions-toolbar h3,
.beneficiary-panel h4 {
  margin: 0;
  color: #0f172a;
}

.commissions-toolbar p {
  margin: 4px 0 0;
  color: #64748b;
}

.commission-filters,
.commission-summary {
  flex-wrap: wrap;
  margin-top: 16px;
}

.admin-input {
  min-height: 38px;
  border: 1px solid #d8e2ef;
  border-radius: 10px;
  padding: 0 12px;
}

.summary-card {
  min-width: 160px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.summary-card strong,
.summary-card span,
.admin-data-table small {
  display: block;
}

.summary-card span,
.admin-data-table small {
  color: #64748b;
  font-size: 12px;
}

.commission-layout {
  align-items: flex-start;
  margin-top: 16px;
}

.commission-table-wrap {
  flex: 1;
  overflow-x: auto;
}

.beneficiary-panel {
  width: 280px;
}

.beneficiary-row {
  padding: 12px 0;
  border-bottom: 1px solid #edf2f7;
}

.commission-badge {
  display: inline-flex;
  padding: 5px 8px;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 980px) {
  .commission-layout {
    flex-direction: column;
  }

  .beneficiary-panel {
    width: 100%;
  }
}
</style>
