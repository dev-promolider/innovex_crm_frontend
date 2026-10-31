<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import ApiErrorState from '@/components/shared/ApiErrorState.vue'
import DistributorOnlyNotice from '@/components/shared/DistributorOnlyNotice.vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import CuotaEstadoBadge from '@/features/cuotas/components/CuotaEstadoBadge.vue'
import PagoMovilCuotaDialog from '@/features/cuotas/components/PagoMovilCuotaDialog.vue'
import { useCuotasApi } from '@/features/cuotas/composables/useCuotasApi'
import { usePagoMovilApi } from '@/features/cuotas/composables/usePagoMovilApi'
import { estadosCuota, type MiCuota } from '@/features/cuotas/types'
import { diasLabel, formatVencimiento } from '@/features/cuotas/utils'

const { isActiveDistributor } = useAuthenticatedSession()
const { formatCurrency, ensureCurrencyLoaded } = useWorkspaceCurrency()
const {
  misCuotas, resumen, misCuotasFilterEstado, misCuotasPagination, isLoadingMisCuotas, misCuotasError,
  fetchMisCuotas,
} = useCuotasApi()

const { consultarPago } = usePagoMovilApi()

const selected = shallowRef<MiCuota | null>(null)
const dialogOpen = shallowRef(false)
const successMsg = shallowRef('')

const hasOverdue = computed(() => (resumen.value?.total_vencido ?? 0) > 0)
const proxima = computed(() => resumen.value?.proxima_cuota ?? null)
const showBanner = computed(() => hasOverdue.value || (proxima.value !== null && proxima.value.dias_restantes <= 5))
const moneda = computed(() => resumen.value?.moneda)

const openPago = (cuota: MiCuota) => {
  selected.value = cuota
  dialogOpen.value = true
}

const onPaid = async () => {
  successMsg.value = '¡Tu pago fue confirmado!'
  await fetchMisCuotas(misCuotasPagination.current_page)
}

watch(misCuotasFilterEstado, () => void fetchMisCuotas(1))

const POLL_MS = 3000
const POLL_MAX = 10
const pagoResult = shallowRef<'' | 'confirmado' | 'pendiente' | 'fallido' | 'verificando'>('')
let pollTimer: ReturnType<typeof setTimeout> | undefined

const clasificarEstado = (estado: string) => {
  const value = estado.toLowerCase()
  if (['confirmado', 'pagado', 'pagada', 'aprobado', 'completado', 'exitoso'].includes(value)) return 'confirmado'
  if (['fallido', 'rechazado', 'cancelado', 'expirado', 'error'].includes(value)) return 'fallido'
  return 'pendiente'
}

const pollPago = (pagoId: string, attempt = 1) => {
  pagoResult.value = 'verificando'
  pollTimer = setTimeout(async () => {
    let resultado: 'confirmado' | 'pendiente' | 'fallido' = 'pendiente'
    try {
      resultado = clasificarEstado((await consultarPago(pagoId)).estado ?? '')
    } catch {
      resultado = 'pendiente'
    }
    if (resultado === 'confirmado') {
      pagoResult.value = 'confirmado'
      await fetchMisCuotas(misCuotasPagination.current_page)
    } else if (resultado === 'fallido') {
      pagoResult.value = 'fallido'
    } else if (attempt >= POLL_MAX) {
      pagoResult.value = 'pendiente'
    } else {
      pollPago(pagoId, attempt + 1)
    }
  }, POLL_MS)
}

onMounted(() => {
  if (!isActiveDistributor.value) return
  void ensureCurrencyLoaded()
  void fetchMisCuotas(1)
  const pagoId = new URLSearchParams(window.location.search).get('pago')
  if (pagoId) pollPago(pagoId)
})

onBeforeUnmount(() => clearTimeout(pollTimer))
</script>

<template>
  <AppShell :show-search="false">
    <div v-if="!isActiveDistributor" class="page-body"><DistributorOnlyNotice /></div>
    <div v-else class="page-body mc">
      <div>
        <h1 class="page-title">Mis cuotas</h1>
        <p class="page-subtitle">Consulta tus cuotas, vencimientos y registra tus pagos.</p>
      </div>

      <div v-if="successMsg" class="mc-alert mc-alert--ok" role="status">{{ successMsg }}<button type="button" aria-label="Cerrar" @click="successMsg = ''">✕</button></div>

      <div v-if="pagoResult" class="mc-alert" :class="{ 'mc-alert--ok': pagoResult === 'confirmado', 'mc-alert--warn': pagoResult === 'pendiente' || pagoResult === 'verificando', 'mc-alert--bad': pagoResult === 'fallido' }" role="status">
        <template v-if="pagoResult === 'confirmado'">Pago confirmado</template>
        <template v-else-if="pagoResult === 'fallido'">Pago fallido</template>
        <template v-else-if="pagoResult === 'pendiente'">Pendiente de confirmación</template>
        <template v-else>Verificando tu pago…</template>
      </div>

      <div v-if="showBanner" class="mc-alert" :class="hasOverdue ? 'mc-alert--bad' : 'mc-alert--warn'" role="alert">
        <template v-if="hasOverdue">Tienes cuotas vencidas por {{ formatCurrency(resumen?.total_vencido ?? 0, moneda) }}. Regulariza tu pago lo antes posible.</template>
        <template v-else-if="proxima">Tu próxima cuota vence pronto: {{ diasLabel(proxima.dias_restantes).toLowerCase() }}.</template>
      </div>

      <p v-if="isLoadingMisCuotas && !misCuotas.length" class="mc-muted" role="status">Cargando tus cuotas…</p>
      <ApiErrorState v-else-if="misCuotasError" :message="misCuotasError" @retry="fetchMisCuotas(misCuotasPagination.current_page)" />
      <template v-else>
        <section v-if="resumen" class="mc-cards">
          <div class="mc-card">
            <span>Próxima cuota</span>
            <template v-if="proxima">
              <strong>{{ formatCurrency(proxima.monto, moneda) }}</strong>
              <small>{{ formatVencimiento(proxima.fecha_vencimiento) }} · {{ diasLabel(proxima.dias_restantes) }}</small>
            </template>
            <small v-else>No tienes cuotas próximas. ¡Estás al día!</small>
          </div>
          <div class="mc-card"><span>Total pendiente</span><strong class="warn">{{ formatCurrency(resumen.total_pendiente, moneda) }}</strong></div>
          <div class="mc-card"><span>Total vencido</span><strong class="bad">{{ formatCurrency(resumen.total_vencido, moneda) }}</strong></div>
        </section>

        <label class="mc-filter">
          <span>Estado</span>
          <select v-model="misCuotasFilterEstado">
            <option value="">Todas</option>
            <option v-for="estado in estadosCuota" :key="estado.value" :value="estado.value">{{ estado.label }}</option>
          </select>
        </label>

        <p v-if="!misCuotas.length" class="mc-empty">Aún no tienes cuotas{{ misCuotasFilterEstado ? ' con este estado' : '' }}. Cuando tengas un plan de pagos, aparecerá aquí.</p>
        <div v-else class="mc-table-wrap">
          <table class="mc-table">
            <thead>
              <tr><th>Cuota</th><th>Kit</th><th>Vencimiento</th><th>Monto</th><th>Saldo</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              <tr v-for="cuota in misCuotas" :key="cuota.id">
                <td>{{ cuota.numero }} de {{ cuota.total_cuotas }}</td>
                <td>{{ cuota.kit?.nombre ?? '—' }}</td>
                <td>
                  {{ formatVencimiento(cuota.fecha_vencimiento) }}
                  <small v-if="cuota.estado !== 'pagada'" class="mc-muted">{{ diasLabel(cuota.dias_restantes) }}</small>
                </td>
                <td>{{ formatCurrency(cuota.monto, cuota.moneda) }}</td>
                <td>{{ formatCurrency(cuota.saldo, cuota.moneda) }}</td>
                <td><CuotaEstadoBadge :estado="cuota.estado" /></td>
                <td><button v-if="cuota.estado !== 'pagada'" type="button" class="mc-pay" @click="openPago(cuota)">Pagar</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="misCuotasPagination.last_page > 1" class="mc-pager">
          <button type="button" :disabled="misCuotasPagination.current_page <= 1 || isLoadingMisCuotas" @click="fetchMisCuotas(misCuotasPagination.current_page - 1)">Anterior</button>
          <span>Página {{ misCuotasPagination.current_page }} de {{ misCuotasPagination.last_page }}</span>
          <button type="button" :disabled="misCuotasPagination.current_page >= misCuotasPagination.last_page || isLoadingMisCuotas" @click="fetchMisCuotas(misCuotasPagination.current_page + 1)">Siguiente</button>
        </div>
      </template>
    </div>

    <PagoMovilCuotaDialog
      :open="dialogOpen"
      :cuota="selected"
      @close="dialogOpen = false"
      @paid="onPaid"
    />
  </AppShell>
</template>

<style scoped>
.mc { display: flex; flex-direction: column; gap: 16px; }
.mc-muted { color: #64748b; }
.mc-alert { display: flex; justify-content: space-between; gap: 12px; padding: 12px 14px; border-radius: 10px; font-size: 14px; border: 1px solid; }
.mc-alert button { border: 0; background: transparent; cursor: pointer; }
.mc-alert--ok { background: #f0fdf4; border-color: #bbf7d0; color: #166534; }
.mc-alert--warn { background: #fffbeb; border-color: #fde68a; color: #92400e; }
.mc-alert--bad { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }
.mc-cards { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.mc-card { display: flex; flex-direction: column; gap: 4px; padding: 16px; border: 1px solid #dbe3ef; border-radius: 10px; background: white; }
.mc-card span { color: #64748b; font-size: 12px; }
.mc-card strong { font-size: 22px; }
.mc-card small { color: #64748b; }
.warn { color: #92400e; } .bad { color: #b91c1c; }
.mc-filter { display: flex; flex-direction: column; gap: 5px; max-width: 220px; font-size: 12px; font-weight: 600; color: #475569; }
.mc-filter select { padding: 9px 10px; border: 1px solid #dbe3ef; border-radius: 7px; background: white; font: inherit; font-weight: 400; }
.mc-empty { padding: 28px; text-align: center; color: #64748b; border: 1px dashed #dbe3ef; border-radius: 10px; }
.mc-table-wrap { overflow-x: auto; border: 1px solid #dbe3ef; border-radius: 10px; background: white; }
.mc-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.mc-table th, .mc-table td { padding: 11px 12px; text-align: left; border-bottom: 1px solid #eef2f7; white-space: nowrap; }
.mc-table th { color: #64748b; font-size: 11px; text-transform: uppercase; }
.mc-table small { display: block; }
.mc-pay { padding: 6px 14px; border: 0; border-radius: 7px; background: #1768b8; color: white; font-weight: 600; cursor: pointer; }
.mc-pager { display: flex; justify-content: center; align-items: center; gap: 12px; font-size: 13px; }
.mc-pager button { padding: 7px 14px; border: 1px solid #dbe3ef; border-radius: 8px; background: white; cursor: pointer; }
.mc-pager button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 700px) { .mc-cards { grid-template-columns: 1fr; } }
</style>
