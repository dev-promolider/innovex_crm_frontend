<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import AppModal from '@/components/shared/AppModal.vue'
import ApiErrorState from '@/components/shared/ApiErrorState.vue'
import DistributorOnlyNotice from '@/components/shared/DistributorOnlyNotice.vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import {
  catalogoErrorMessage,
  useCatalogoDistribuidor,
  type EstadoPedido,
  type PedidoCatalogo,
} from '@/composables/useCatalogoDistribuidor'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { formatDateTime } from '@/utils/formatters'
import { sanitizeText } from '@/utils/fieldRules'

const { isActiveDistributor } = useAuthenticatedSession()
const { listarPedidos, obtenerPedido, accionPedido, refrescarPendientes } = useCatalogoDistribuidor()
const { ensureCurrencyLoaded, formatCurrency } = useWorkspaceCurrency()

const estados: { value: EstadoPedido | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'solicitado', label: 'Solicitado' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]
const estadoLabel = (estado: EstadoPedido) => estados.find((e) => e.value === estado)?.label ?? estado

const filtro = ref<EstadoPedido | ''>('')
const page = ref(1)
const lastPage = ref(1)
const pedidos = ref<PedidoCatalogo[]>([])
const loading = ref(true)
const loadError = ref('')
const actionError = ref('')
const successMsg = ref('')

const selected = ref<PedidoCatalogo | null>(null)
const detailLoading = ref(false)
const detailError = ref('')
const busy = ref(false)
const confirmDeliver = ref(false)
const cancelOpen = ref(false)
const motivo = ref('')
const motivoError = ref('')

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const result = await listarPedidos(filtro.value, page.value)
    pedidos.value = result.data
    lastPage.value = result.meta?.last_page ?? 1
  } catch (error) {
    loadError.value = catalogoErrorMessage(error)
  } finally {
    loading.value = false
  }
}

watch(filtro, () => {
  page.value = 1
  void load()
})

const goTo = (next: number) => {
  page.value = next
  void load()
}

const openDetail = async (pedido: PedidoCatalogo) => {
  selected.value = pedido
  detailError.value = ''
  detailLoading.value = true
  try {
    selected.value = await obtenerPedido(pedido.id)
  } catch (error) {
    detailError.value = catalogoErrorMessage(error)
  } finally {
    detailLoading.value = false
  }
}

const closeDetail = () => {
  selected.value = null
  confirmDeliver.value = false
  cancelOpen.value = false
}

const digits = (phone: string) => phone.replace(/\D/g, '')
const whatsappHref = computed(() => {
  const phone = selected.value?.comprador?.telefono
  return phone ? `https://wa.me/${digits(phone)}` : ''
})
const telHref = computed(() => {
  const phone = selected.value?.comprador?.telefono
  return phone ? `tel:+${digits(phone)}` : ''
})

const runAction = async (accion: 'confirmar' | 'entregar' | 'cancelar') => {
  if (!selected.value) return
  if (accion === 'cancelar') {
    const text = motivo.value.trim()
    if (text.length < 3) {
      motivoError.value = 'El motivo debe tener al menos 3 caracteres.'
      return
    }
  }

  busy.value = true
  actionError.value = ''
  try {
    const result = await accionPedido(selected.value.id, accion, accion === 'cancelar' ? motivo.value.trim() : undefined)
    successMsg.value = result.message ?? 'Pedido actualizado.'
    closeDetail()
    motivo.value = ''
    await load()
  } catch (error) {
    actionError.value = catalogoErrorMessage(error)
    confirmDeliver.value = false
    cancelOpen.value = false
    void refrescarPendientes()
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  if (!isActiveDistributor.value) {
    loading.value = false
    return
  }
  void ensureCurrencyLoaded()
  void load()
})
</script>

<template>
  <AppShell :show-search="false">
    <div v-if="!isActiveDistributor" class="page-body"><DistributorOnlyNotice /></div>
    <div v-else class="page-body">
      <div class="head">
        <div>
          <h1 class="page-title">Pedidos de compradores</h1>
          <p class="page-subtitle">Solicitudes recibidas desde tu catálogo compartible.</p>
        </div>
        <label class="filter">
          <span>Estado</span>
          <select v-model="filtro">
            <option v-for="estado in estados" :key="estado.value" :value="estado.value">{{ estado.label }}</option>
          </select>
        </label>
      </div>

      <div v-if="successMsg" class="alert alert-success" role="status">{{ successMsg }}<button type="button" aria-label="Cerrar" @click="successMsg = ''">✕</button></div>
      <div v-if="actionError" class="alert alert-error" role="alert">{{ actionError }}<button type="button" aria-label="Cerrar" @click="actionError = ''">✕</button></div>

      <p v-if="loading" class="muted" role="status">Cargando pedidos…</p>
      <ApiErrorState v-else-if="loadError" :message="loadError" @retry="load" />
      <p v-else-if="pedidos.length === 0" class="card muted">No hay pedidos para mostrar.</p>

      <div v-else class="card table-wrap">
        <table>
          <thead>
            <tr><th>Código</th><th>Comprador</th><th>Fecha</th><th>Total ref.</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            <tr v-for="pedido in pedidos" :key="pedido.id">
              <td><strong>{{ pedido.codigo }}</strong></td>
              <td>{{ pedido.comprador ? `${pedido.comprador.nombres} ${pedido.comprador.apellidos}` : '—' }}</td>
              <td>{{ formatDateTime(pedido.creado_en) }}</td>
              <td>{{ formatCurrency(pedido.total_referencial) }}</td>
              <td><span class="badge" :class="`badge-${pedido.estado}`">{{ estadoLabel(pedido.estado) }}</span></td>
              <td><button type="button" class="btn btn-sm" @click="openDetail(pedido)">Ver detalle</button></td>
            </tr>
          </tbody>
        </table>

        <div v-if="lastPage > 1" class="pager">
          <button type="button" class="btn btn-sm" :disabled="page <= 1" @click="goTo(page - 1)">Anterior</button>
          <span>Página {{ page }} de {{ lastPage }}</span>
          <button type="button" class="btn btn-sm" :disabled="page >= lastPage" @click="goTo(page + 1)">Siguiente</button>
        </div>
      </div>
    </div>

    <AppModal :open="!!selected && !confirmDeliver && !cancelOpen" :title="selected ? `Pedido ${selected.codigo}` : ''" size="lg" @close="closeDetail">
      <template v-if="selected">
        <p v-if="detailLoading" class="muted">Cargando detalle…</p>
        <p v-if="detailError" class="alert alert-error" role="alert">{{ detailError }}</p>

        <span class="badge" :class="`badge-${selected.estado}`">{{ estadoLabel(selected.estado) }}</span>

        <section v-if="selected.comprador" class="block">
          <h3>Comprador</h3>
          <p>{{ selected.comprador.nombres }} {{ selected.comprador.apellidos }}</p>
          <p>{{ selected.comprador.telefono }} · {{ selected.comprador.email }}</p>
          <p v-if="selected.comprador.documento">Documento: {{ selected.comprador.documento }}</p>
          <div class="actions">
            <a class="btn btn-whatsapp btn-sm" :href="whatsappHref" target="_blank" rel="noopener noreferrer">WhatsApp</a>
            <a class="btn btn-sm" :href="telHref">Llamar</a>
          </div>
        </section>

        <section class="block">
          <h3>Productos</h3>
          <table>
            <thead><tr><th>Kit</th><th>Cant.</th><th>Precio ref.</th><th>Subtotal</th></tr></thead>
            <tbody>
              <tr v-for="item in selected.items" :key="item.kit_id">
                <td>{{ item.nombre ?? `Kit #${item.kit_id}` }}</td>
                <td>{{ item.cantidad }}</td>
                <td>{{ formatCurrency(item.precio_referencial) }}</td>
                <td>{{ formatCurrency(item.subtotal) }}</td>
              </tr>
            </tbody>
            <tfoot><tr><td colspan="3"><strong>Total referencial</strong></td><td><strong>{{ formatCurrency(selected.total_referencial) }}</strong></td></tr></tfoot>
          </table>
        </section>

        <p v-if="selected.notas" class="muted">Notas: {{ selected.notas }}</p>
        <p v-if="selected.motivo_cancelacion" class="muted">Motivo de cancelación: {{ selected.motivo_cancelacion }}</p>
      </template>

      <template #footer>
        <button type="button" class="btn" @click="closeDetail">Cerrar</button>
        <template v-if="selected && ['solicitado', 'confirmado'].includes(selected.estado)">
          <button type="button" class="btn btn-danger" :disabled="busy" @click="motivo = ''; motivoError = ''; cancelOpen = true">Cancelar pedido</button>
        </template>
        <button v-if="selected?.estado === 'solicitado'" type="button" class="btn btn-primary" :disabled="busy" @click="runAction('confirmar')">
          {{ busy ? 'Procesando…' : 'Confirmar' }}
        </button>
        <button v-if="selected?.estado === 'confirmado'" type="button" class="btn btn-primary" :disabled="busy" @click="confirmDeliver = true">Marcar entregado</button>
      </template>
    </AppModal>

    <AppModal :open="confirmDeliver" title="Marcar como entregado" size="sm" @close="confirmDeliver = false">
      <p class="modal-text">Al marcar este pedido como entregado se descontará del inventario el stock de los productos entregados. ¿Deseas continuar?</p>
      <template #footer>
        <button type="button" class="btn" :disabled="busy" @click="confirmDeliver = false">Volver</button>
        <button type="button" class="btn btn-primary" :disabled="busy" @click="runAction('entregar')">{{ busy ? 'Procesando…' : 'Sí, marcar entregado' }}</button>
      </template>
    </AppModal>

    <AppModal :open="cancelOpen" title="Cancelar pedido" size="sm" @close="cancelOpen = false">
      <label class="field">
        <span>Motivo de la cancelación</span>
        <textarea v-model="motivo" rows="3" maxlength="500" @input="motivo = sanitizeText(motivo, 500)"></textarea>
        <small v-if="motivoError" class="error">{{ motivoError }}</small>
      </label>
      <template #footer>
        <button type="button" class="btn" :disabled="busy" @click="cancelOpen = false">Volver</button>
        <button type="button" class="btn btn-danger" :disabled="busy" @click="runAction('cancelar')">{{ busy ? 'Procesando…' : 'Cancelar pedido' }}</button>
      </template>
    </AppModal>
  </AppShell>
</template>

<style scoped>
.page-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; }
.head { display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; }
.page-subtitle, .muted { font-size: 13px; color: #6b7280; margin: 0; }
.filter { display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #6b7280; }
.filter select { height: 38px; padding: 0 10px; border: 1px solid #e2e8f0; border-radius: 8px; background: #fff; font-size: 14px; }
.card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 13px; }
th, td { text-align: left; padding: 10px 8px; border-bottom: 1px solid #eef2f7; }
th { color: #6b7280; font-weight: 600; }
.pager { display: flex; justify-content: center; align-items: center; gap: 12px; padding-top: 14px; font-size: 13px; }
.btn { display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #1a1a1a; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }
.btn-sm { height: 32px; padding: 0 12px; font-size: 13px; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { background: #1768b8; border-color: #1768b8; color: #fff; }
.btn-whatsapp { background: #25d366; border-color: #25d366; color: #fff; }
.btn-danger { color: #b91c1c; border-color: #fecaca; background: #fef2f2; }
.badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
.badge-solicitado { background: #fef3c7; color: #92400e; }
.badge-confirmado { background: #dbeafe; color: #1e40af; }
.badge-entregado { background: #d1fae5; color: #065f46; }
.badge-cancelado { background: #fee2e2; color: #991b1b; }
.block { margin-top: 16px; }
.block h3 { margin: 0 0 6px; font-size: 14px; }
.block p { margin: 2px 0; font-size: 13px; }
.actions { display: flex; gap: 8px; margin-top: 8px; }
.alert { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 8px; font-size: 13px; margin: 0; }
.alert button { background: none; border: 0; cursor: pointer; font-size: 16px; }
.alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
.alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.modal-text { margin: 0; font-size: 14px; color: #374151; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; }
.field textarea { padding: 8px 10px; border: 1px solid #e2e8f0; border-radius: 8px; font: inherit; resize: vertical; }
.error { color: #b91c1c; }
</style>
