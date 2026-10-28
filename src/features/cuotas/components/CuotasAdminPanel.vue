<script setup lang="ts">
import { onMounted, shallowRef, watch } from 'vue'
import ApiErrorState from '@/components/shared/ApiErrorState.vue'
import DatePicker from '@/components/shared/DatePicker.vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { useClientesApi } from '@/features/clientes/composables/useClientesApi'
import { useCuotasApi } from '../composables/useCuotasApi'
import { estadosCuota, type CuotaAdmin, type PagoCuotaPayload } from '../types'
import { diasLabel, formatVencimiento } from '../utils'
import CuotaEstadoBadge from './CuotaEstadoBadge.vue'
import PagoCuotaDialog from './PagoCuotaDialog.vue'

const { formatCurrency, ensureCurrencyLoaded } = useWorkspaceCurrency()
const { distribuidores, fetchDistribuidores } = useClientesApi()
const {
  cuotas, totales, cuotasPagination, filters, isLoadingCuotas, cuotasError, isPaying, pagoError,
  fetchCuotas, registrarPago,
} = useCuotasApi()

const selected = shallowRef<CuotaAdmin | null>(null)
const dialogOpen = shallowRef(false)
const successMsg = shallowRef('')

const openManual = (cuota: CuotaAdmin) => {
  selected.value = cuota
  pagoError.value = ''
  dialogOpen.value = true
}

const submitManual = async (cuotaId: number, payload: PagoCuotaPayload) => {
  const result = await registrarPago(cuotaId, payload)
  if (!result) return
  dialogOpen.value = false
  successMsg.value = 'Pago registrado correctamente.'
  await fetchCuotas(cuotasPagination.current_page)
}

let searchTimer: ReturnType<typeof setTimeout> | undefined

watch(() => filters.search, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => void fetchCuotas(1), 300)
})
watch(() => [filters.estado, filters.distribuidor_id, filters.desde, filters.hasta], () => void fetchCuotas(1))

const clearFilters = () => {
  filters.search = ''
  filters.estado = ''
  filters.distribuidor_id = null
  filters.desde = ''
  filters.hasta = ''
}

onMounted(() => {
  void ensureCurrencyLoaded()
  void fetchDistribuidores()
  void fetchCuotas(1)
})
</script>

<template>
  <section class="cuotas-panel">
    <div class="cuotas-filters">
      <label class="cf-field cf-field--wide">
        <span>Buscar</span>
        <input v-model="filters.search" type="search" placeholder="Nombre o cédula del distribuidor" />
      </label>
      <label class="cf-field">
        <span>Estado</span>
        <select v-model="filters.estado">
          <option value="">Todos</option>
          <option v-for="estado in estadosCuota" :key="estado.value" :value="estado.value">{{ estado.label }}</option>
        </select>
      </label>
      <label class="cf-field">
        <span>Distribuidor</span>
        <select v-model="filters.distribuidor_id">
          <option :value="null">Todos</option>
          <option v-for="item in distribuidores" :key="item.id" :value="item.id">{{ item.nombre }}</option>
        </select>
      </label>
      <DatePicker v-model="filters.desde" label="Vence desde" id="cuotas-desde" :max="filters.hasta || undefined" />
      <DatePicker v-model="filters.hasta" label="Vence hasta" id="cuotas-hasta" :min="filters.desde || undefined" />
      <button type="button" class="cf-clear" @click="clearFilters">Limpiar filtros</button>
    </div>

    <div v-if="successMsg" class="cuotas-ok" role="status">{{ successMsg }}<button type="button" aria-label="Cerrar" @click="successMsg = ''">✕</button></div>

    <div v-if="totales" class="cuotas-totals">
      <div><span>Monto total</span><strong>{{ formatCurrency(totales.monto, totales.moneda) }}</strong></div>
      <div><span>Pagado</span><strong class="ok">{{ formatCurrency(totales.pagado, totales.moneda) }}</strong></div>
      <div><span>Pendiente</span><strong class="warn">{{ formatCurrency(totales.pendiente, totales.moneda) }}</strong></div>
      <div><span>Vencido</span><strong class="bad">{{ formatCurrency(totales.vencido, totales.moneda) }}</strong></div>
    </div>

    <p v-if="isLoadingCuotas" class="muted" role="status">Cargando cuotas…</p>
    <ApiErrorState v-else-if="cuotasError" :message="cuotasError" @retry="fetchCuotas(cuotasPagination.current_page)" />
    <p v-else-if="!cuotas.length" class="muted cuotas-empty">No encontramos cuotas con estos filtros. Prueba ajustando o limpiando la búsqueda.</p>
    <div v-else class="cuotas-table-wrap">
      <table class="cuotas-table">
        <thead>
          <tr>
            <th>Distribuidor</th><th>Cuota</th><th>Vencimiento</th><th>Monto</th><th>Pagado</th><th>Saldo</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="cuota in cuotas" :key="cuota.id">
            <td>{{ cuota.distribuidor?.nombre ?? '—' }}</td>
            <td>{{ cuota.numero }} de {{ cuota.total_cuotas }}</td>
            <td>
              {{ formatVencimiento(cuota.fecha_vencimiento) }}
              <small v-if="cuota.estado !== 'pagada'" class="muted">{{ diasLabel(cuota.dias_restantes) }}</small>
            </td>
            <td>{{ formatCurrency(cuota.monto, cuota.moneda) }}</td>
            <td>{{ formatCurrency(cuota.monto_pagado, cuota.moneda) }}</td>
            <td>{{ formatCurrency(cuota.saldo, cuota.moneda) }}</td>
            <td><CuotaEstadoBadge :estado="cuota.estado" /></td>
            <td><button v-if="cuota.estado !== 'pagada'" type="button" class="cuotas-manual" @click="openManual(cuota)">Registrar pago manual</button></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="cuotasPagination.last_page > 1" class="cuotas-pager">
      <button type="button" :disabled="cuotasPagination.current_page <= 1 || isLoadingCuotas" @click="fetchCuotas(cuotasPagination.current_page - 1)">Anterior</button>
      <span>Página {{ cuotasPagination.current_page }} de {{ cuotasPagination.last_page }} · {{ cuotasPagination.total }} cuotas</span>
      <button type="button" :disabled="cuotasPagination.current_page >= cuotasPagination.last_page || isLoadingCuotas" @click="fetchCuotas(cuotasPagination.current_page + 1)">Siguiente</button>
    </div>

    <PagoCuotaDialog
      :open="dialogOpen"
      :cuota="selected"
      :submitting="isPaying"
      :error-message="pagoError"
      @close="dialogOpen = false"
      @submit="submitManual"
    />
  </section>
</template>

<style scoped>
.cuotas-ok { display: flex; justify-content: space-between; padding: 12px 14px; border: 1px solid #bbf7d0; border-radius: 10px; background: #f0fdf4; color: #166534; font-size: 14px; }
.cuotas-ok button { border: 0; background: transparent; cursor: pointer; }
.cuotas-manual { padding: 5px 10px; border: 1px solid #dbe3ef; border-radius: 7px; background: white; font-size: 12px; font-weight: 600; cursor: pointer; }
.cuotas-panel { display: flex; flex-direction: column; gap: 16px; }
.cuotas-filters { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; align-items: end; padding: 14px; border: 1px solid #dbe3ef; border-radius: 10px; background: white; }
.cf-field { display: flex; flex-direction: column; gap: 5px; color: #475569; font-size: 12px; font-weight: 600; }
.cf-field--wide { grid-column: span 2; }
.cf-field input, .cf-field select { width: 100%; box-sizing: border-box; padding: 9px 10px; border: 1px solid #dbe3ef; border-radius: 7px; font: inherit; font-weight: 400; background: white; }
.cf-clear { height: 38px; border: 1px solid #dbe3ef; border-radius: 8px; background: white; font-weight: 600; cursor: pointer; }
.cuotas-totals { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.cuotas-totals div { display: flex; flex-direction: column; gap: 4px; padding: 14px; border: 1px solid #dbe3ef; border-radius: 10px; background: white; }
.cuotas-totals span { color: #64748b; font-size: 12px; }
.cuotas-totals strong { font-size: 18px; }
.ok { color: #166534; } .warn { color: #92400e; } .bad { color: #b91c1c; }
.muted { color: #64748b; }
.cuotas-empty { padding: 28px; text-align: center; border: 1px dashed #dbe3ef; border-radius: 10px; }
.cuotas-table-wrap { overflow-x: auto; border: 1px solid #dbe3ef; border-radius: 10px; background: white; }
.cuotas-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.cuotas-table th, .cuotas-table td { padding: 11px 12px; text-align: left; border-bottom: 1px solid #eef2f7; white-space: nowrap; }
.cuotas-table th { color: #64748b; font-size: 11px; text-transform: uppercase; }
.cuotas-table small { display: block; }
.cuotas-pager { display: flex; justify-content: center; align-items: center; gap: 12px; font-size: 13px; }
.cuotas-pager button { padding: 7px 14px; border: 1px solid #dbe3ef; border-radius: 8px; background: white; cursor: pointer; }
.cuotas-pager button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 1023px) { .cuotas-filters, .cuotas-totals { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 700px) { .cuotas-filters, .cuotas-totals { grid-template-columns: 1fr; } .cf-field--wide { grid-column: auto; } }
</style>
