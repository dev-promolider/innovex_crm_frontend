<script setup lang="ts">
import { computed, onMounted, reactive, shallowRef } from 'vue'
import AppDialog from '@/components/shared/AppDialog.vue'
import { useFinanzasRetencionesApi } from '../composables/useFinanzasRetencionesApi'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import type { RetencionComision } from '../types'

const props = defineProps<{
  selectedMembresiaId: number | null
}>()

const { retenciones, isLoading, isSubmitting, errorMessage, pagination, fetchRetenciones, aplicarRetencion, liberarRetencion } = useFinanzasRetencionesApi()

const estado = shallowRef('activa')
const soloSeleccionado = shallowRef(false)
const showApplyDialog = shallowRef(false)
const showReleaseDialog = shallowRef(false)
const selectedRetencion = shallowRef<RetencionComision | null>(null)
const form = reactive({
  membresia_id: '',
  porcentaje: '10',
  monto_fijo: '',
  justificacion: '',
  motivo_liberacion: '',
})

const membresiaFilter = computed(() => (soloSeleccionado.value ? props.selectedMembresiaId : null))

const { ensureCurrencyLoaded, formatCurrency: formatMoney } = useWorkspaceCurrency()

const userName = (retencion: RetencionComision) => {
  const user = retencion.membresia?.usuario
  return user ? `${user.nombre ?? ''} ${user.apellido ?? ''}`.trim() : `Membresía #${retencion.membresia_id}`
}

const refresh = (page = pagination.current_page) => fetchRetenciones(page, estado.value, membresiaFilter.value)

const openApply = () => {
  form.membresia_id = props.selectedMembresiaId ? String(props.selectedMembresiaId) : ''
  form.porcentaje = '10'
  form.monto_fijo = ''
  form.justificacion = ''
  showApplyDialog.value = true
}

const apply = async () => {
  await aplicarRetencion({
    membresia_id: Number(form.membresia_id),
    porcentaje: Number(form.porcentaje),
    justificacion: form.justificacion.trim(),
    monto_fijo: form.monto_fijo ? Number(form.monto_fijo) : null,
  })
  showApplyDialog.value = false
  await refresh(1)
}

const openRelease = (retencion: RetencionComision) => {
  selectedRetencion.value = retencion
  form.motivo_liberacion = ''
  showReleaseDialog.value = true
}

const release = async () => {
  if (!selectedRetencion.value) return
  await liberarRetencion(selectedRetencion.value.id, form.motivo_liberacion.trim())
  showReleaseDialog.value = false
  await refresh()
}

onMounted(async () => {
  await ensureCurrencyLoaded()
  await refresh(1)
})
</script>

<template>
  <section class="finance-panel">
    <header class="finance-panel__header">
      <div>
        <h2>Retenciones de comisión</h2>
        <p>Congela saldo ganado y conserva trazabilidad de aplicación/liberación.</p>
      </div>
      <button class="admin-btn admin-btn--primary" type="button" @click="openApply">Aplicar retención</button>
    </header>

    <div class="finance-filters">
      <select v-model="estado" class="admin-select-filter" @change="refresh(1)">
        <option value="todos">Todas</option>
        <option value="activa">Activas</option>
        <option value="liberada">Liberadas</option>
        <option value="cancelada">Canceladas</option>
      </select>
      <label class="finance-check">
        <input v-model="soloSeleccionado" type="checkbox" :disabled="!props.selectedMembresiaId" @change="refresh(1)" />
        Solo distribuidor seleccionado
      </label>
      <button class="admin-btn admin-btn--outline" type="button" :disabled="isLoading" @click="refresh()">
        {{ isLoading ? 'Actualizando...' : 'Actualizar' }}
      </button>
    </div>

    <p v-if="errorMessage" class="admin-alert admin-alert--error">{{ errorMessage }}</p>

    <div v-if="isLoading" class="finance-empty">Cargando retenciones...</div>
    <div v-else-if="retenciones.length === 0" class="finance-empty">Sin retenciones para el filtro actual.</div>
    <div v-else class="finance-table-wrap">
      <table class="finance-table">
        <thead>
          <tr>
            <th>Distribuidor</th>
            <th>Monto</th>
            <th>%</th>
            <th>Estado</th>
            <th>Origen</th>
            <th>Justificación</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="retencion in retenciones" :key="retencion.id">
            <td>{{ userName(retencion) }}</td>
            <td>{{ formatMoney(retencion.monto_retenido) }}</td>
            <td>{{ Number(retencion.porcentaje_retenido).toFixed(2) }}%</td>
            <td><span class="finance-pill">{{ retencion.estado }}</span></td>
            <td>{{ retencion.origen }}<span v-if="retencion.regla_clave"> · {{ retencion.regla_clave }}</span></td>
            <td>{{ retencion.justificacion }}</td>
            <td>
              <button class="admin-btn admin-btn--outline" type="button" :disabled="retencion.estado !== 'activa' || isSubmitting" @click="openRelease(retencion)">Liberar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer v-if="pagination.last_page > 1" class="admin-table-footer">
      <span class="admin-table-count">Página {{ pagination.current_page }} de {{ pagination.last_page }}</span>
      <div class="admin-pagination">
        <button class="admin-page-btn" :disabled="pagination.current_page === 1" type="button" @click="refresh(pagination.current_page - 1)">Anterior</button>
        <button class="admin-page-btn" :disabled="pagination.current_page === pagination.last_page" type="button" @click="refresh(pagination.current_page + 1)">Siguiente</button>
      </div>
    </footer>

    <AppDialog v-model:open="showApplyDialog" title="Aplicar retención" description="La retención mueve saldo disponible a saldo retenido en el ledger." width="md">
      <label class="finance-field"><span>Membresía</span><input v-model="form.membresia_id" type="number" min="1" /></label>
      <label class="finance-field"><span>Porcentaje</span><input v-model="form.porcentaje" type="number" min="0.01" max="100" step="0.01" /></label>
      <label class="finance-field"><span>Monto fijo opcional</span><input v-model="form.monto_fijo" type="number" min="0.01" step="0.01" placeholder="Vacío usa porcentaje" /></label>
      <label class="finance-field"><span>Justificación</span><textarea v-model="form.justificacion" rows="4" maxlength="500" /></label>
      <template #footer>
        <button class="admin-btn admin-btn--outline" type="button" @click="showApplyDialog = false">Cancelar</button>
        <button class="admin-btn admin-btn--primary" type="button" :disabled="isSubmitting || !form.membresia_id || !form.porcentaje || !form.justificacion.trim()" @click="apply">Aplicar</button>
      </template>
    </AppDialog>

    <AppDialog v-model:open="showReleaseDialog" title="Liberar retención" width="sm">
      <label class="finance-field"><span>Motivo</span><textarea v-model="form.motivo_liberacion" rows="4" maxlength="500" /></label>
      <template #footer>
        <button class="admin-btn admin-btn--outline" type="button" @click="showReleaseDialog = false">Cancelar</button>
        <button class="admin-btn admin-btn--primary" type="button" :disabled="isSubmitting || !form.motivo_liberacion.trim()" @click="release">Liberar</button>
      </template>
    </AppDialog>
  </section>
</template>

<style scoped>
.finance-panel { background:#fff; border:1px solid rgba(15,23,42,.08); border-radius:24px; display:flex; flex-direction:column; gap:18px; padding:20px; }
.finance-panel__header, .finance-filters { align-items:center; display:flex; gap:12px; justify-content:space-between; }
.finance-panel__header h2 { margin:0; }
.finance-panel__header p, .finance-empty { color:#64748b; margin:4px 0 0; }
.finance-check { align-items:center; color:#475569; display:flex; font-size:13px; gap:8px; }
.finance-table-wrap { overflow-x:auto; }
.finance-table { border-collapse:collapse; width:100%; }
.finance-table th, .finance-table td { border-bottom:1px solid rgba(15,23,42,.06); font-size:13px; padding:12px; text-align:left; vertical-align:top; }
.finance-table th { color:#64748b; font-size:11px; letter-spacing:.08em; text-transform:uppercase; }
.finance-pill { background:#ecfdf5; border-radius:999px; color:#047857; display:inline-flex; font-size:11px; font-weight:700; padding:4px 9px; }
.finance-field { display:flex; flex-direction:column; gap:8px; }
.finance-field span { color:#64748b; font-size:12px; }
.finance-field input, .finance-field textarea { border:1px solid rgba(15,23,42,.16); border-radius:12px; padding:10px 12px; }
@media (max-width: 720px) { .finance-panel__header, .finance-filters { align-items:stretch; flex-direction:column; } }
</style>
