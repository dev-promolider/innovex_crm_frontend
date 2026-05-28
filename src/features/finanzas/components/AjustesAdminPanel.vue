<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import AppDialog from '@/components/shared/AppDialog.vue'
import { useFinanzasAjustesApi } from '../composables/useFinanzasAjustesApi'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import type { AjusteFinanciero } from '../types'

const props = defineProps<{
  selectedMembresiaId: number | null
}>()

const { ajustes, isLoading, isSubmitting, errorMessage, pagination, fetchAjustes, solicitarAjuste, aprobarAjuste, rechazarAjuste } = useFinanzasAjustesApi()

const estado = shallowRef('pendiente_aprobacion')
const showCreateDialog = shallowRef(false)
const showRejectDialog = shallowRef(false)
const selectedAjuste = shallowRef<AjusteFinanciero | null>(null)
const localMessage = shallowRef('')
const form = reactive({
  membresia_id: '',
  tipo: 'credito' as 'credito' | 'debito',
  monto: '',
  descripcion: '',
  motivo_rechazo: '',
})

const activeError = computed(() => errorMessage.value || localMessage.value)

const { ensureCurrencyLoaded, formatCurrency: formatMoney } = useWorkspaceCurrency()

const userName = (ajuste: AjusteFinanciero) => {
  const user = ajuste.membresia?.usuario
  return user ? `${user.nombre ?? ''} ${user.apellido ?? ''}`.trim() : `Membresía #${ajuste.membresia_id}`
}

const openCreate = () => {
  form.membresia_id = props.selectedMembresiaId ? String(props.selectedMembresiaId) : ''
  form.tipo = 'credito'
  form.monto = ''
  form.descripcion = ''
  localMessage.value = ''
  showCreateDialog.value = true
}

const createAjuste = async () => {
  localMessage.value = ''
  await solicitarAjuste({
    membresia_id: Number(form.membresia_id),
    tipo: form.tipo,
    monto: Number(form.monto),
    descripcion: form.descripcion.trim(),
  })
  showCreateDialog.value = false
  await fetchAjustes(pagination.current_page, estado.value)
}

const approve = async (ajuste: AjusteFinanciero) => {
  await aprobarAjuste(ajuste.id)
  await fetchAjustes(pagination.current_page, estado.value)
}

const openReject = (ajuste: AjusteFinanciero) => {
  selectedAjuste.value = ajuste
  form.motivo_rechazo = ''
  showRejectDialog.value = true
}

const reject = async () => {
  if (!selectedAjuste.value) return
  await rechazarAjuste(selectedAjuste.value.id, form.motivo_rechazo.trim())
  showRejectDialog.value = false
  await fetchAjustes(pagination.current_page, estado.value)
}

onMounted(async () => {
  await ensureCurrencyLoaded()
  await fetchAjustes(1, estado.value)
})
</script>

<template>
  <section class="finance-panel">
    <header class="finance-panel__header">
      <div>
        <h2>Ajustes administrativos</h2>
        <p>Doble aprobación para créditos o débitos manuales en saldo disponible.</p>
      </div>
      <button class="admin-btn admin-btn--primary" type="button" @click="openCreate">Solicitar ajuste</button>
    </header>

    <div class="finance-filters">
      <select v-model="estado" class="admin-select-filter" @change="fetchAjustes(1, estado)">
        <option value="todos">Todos</option>
        <option value="pendiente_aprobacion">Pendientes</option>
        <option value="aprobado">Aprobados</option>
        <option value="rechazado">Rechazados</option>
      </select>
      <button class="admin-btn admin-btn--outline" type="button" :disabled="isLoading" @click="fetchAjustes(pagination.current_page, estado)">
        {{ isLoading ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <p v-if="activeError" class="admin-alert admin-alert--error">{{ activeError }}</p>

    <div v-if="isLoading" class="finance-empty">Cargando ajustes...</div>
    <div v-else-if="ajustes.length === 0" class="finance-empty">Sin ajustes para el filtro actual.</div>
    <div v-else class="finance-table-wrap">
      <table class="finance-table">
        <thead>
          <tr>
            <th>Distribuidor</th>
            <th>Tipo</th>
            <th>Monto</th>
            <th>Estado</th>
            <th>Descripción</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ajuste in ajustes" :key="ajuste.id">
            <td>{{ userName(ajuste) }}</td>
            <td>{{ ajuste.tipo }}</td>
            <td>{{ formatMoney(ajuste.monto) }}</td>
            <td><span class="finance-pill">{{ ajuste.estado }}</span></td>
            <td>{{ ajuste.descripcion }}</td>
            <td>
              <div class="finance-actions">
                <button class="admin-btn admin-btn--outline" type="button" :disabled="ajuste.estado !== 'pendiente_aprobacion' || isSubmitting" @click="approve(ajuste)">Aprobar</button>
                <button class="admin-btn admin-btn--outline" type="button" :disabled="ajuste.estado !== 'pendiente_aprobacion' || isSubmitting" @click="openReject(ajuste)">Rechazar</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="pagination.last_page > 1" class="admin-table-footer">
      <span class="admin-table-count">Página {{ pagination.current_page }} de {{ pagination.last_page }}</span>
      <div class="admin-pagination">
        <button class="admin-page-btn" :disabled="pagination.current_page === 1" type="button" @click="fetchAjustes(pagination.current_page - 1, estado)">Anterior</button>
        <button class="admin-page-btn" :disabled="pagination.current_page === pagination.last_page" type="button" @click="fetchAjustes(pagination.current_page + 1, estado)">Siguiente</button>
      </div>
    </footer>

    <AppDialog v-model:open="showCreateDialog" title="Solicitar ajuste" description="Otro administrador deberá aprobarlo antes de aplicarse al ledger." width="md">
      <label class="finance-field"><span>Membresía</span><input v-model="form.membresia_id" type="number" min="1" /></label>
      <label class="finance-field"><span>Tipo</span><select v-model="form.tipo"><option value="credito">Crédito</option><option value="debito">Débito</option></select></label>
      <label class="finance-field"><span>Monto</span><input v-model="form.monto" type="number" min="0.01" step="0.01" /></label>
      <label class="finance-field"><span>Descripción</span><textarea v-model="form.descripcion" rows="4" maxlength="500" /></label>
      <template #footer>
        <button class="admin-btn admin-btn--outline" type="button" @click="showCreateDialog = false">Cancelar</button>
        <button class="admin-btn admin-btn--primary" type="button" :disabled="isSubmitting || !form.membresia_id || !form.monto || !form.descripcion.trim()" @click="createAjuste">Guardar</button>
      </template>
    </AppDialog>

    <AppDialog v-model:open="showRejectDialog" title="Rechazar ajuste" width="sm">
      <label class="finance-field"><span>Motivo</span><textarea v-model="form.motivo_rechazo" rows="4" maxlength="500" /></label>
      <template #footer>
        <button class="admin-btn admin-btn--outline" type="button" @click="showRejectDialog = false">Cancelar</button>
        <button class="admin-btn admin-btn--primary" type="button" :disabled="isSubmitting || !form.motivo_rechazo.trim()" @click="reject">Rechazar</button>
      </template>
    </AppDialog>
  </section>
</template>

<style scoped>
.finance-panel { background:#fff; border:1px solid rgba(15,23,42,.08); border-radius:24px; display:flex; flex-direction:column; gap:18px; padding:20px; }
.finance-panel__header, .finance-filters, .finance-actions { align-items:center; display:flex; gap:12px; justify-content:space-between; }
.finance-panel__header h2 { margin:0; }
.finance-panel__header p, .finance-empty { color:#64748b; margin:4px 0 0; }
.finance-table-wrap { overflow-x:auto; }
.finance-table { border-collapse:collapse; width:100%; }
.finance-table th, .finance-table td { border-bottom:1px solid rgba(15,23,42,.06); font-size:13px; padding:12px; text-align:left; vertical-align:top; }
.finance-table th { color:#64748b; font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
.finance-pill { background:#eef2ff; border-radius:999px; color:#3730a3; display:inline-flex; font-size:11px; font-weight:700; padding:4px 9px; }
.finance-field { display:flex; flex-direction:column; gap:8px; }
.finance-field span { color:#64748b; font-size:12px; }
.finance-field input, .finance-field select, .finance-field textarea { border:1px solid rgba(15,23,42,.16); border-radius:12px; padding:10px 12px; }
@media (max-width: 720px) { .finance-panel__header, .finance-filters { align-items:stretch; flex-direction:column; } }
</style>
