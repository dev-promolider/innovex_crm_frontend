<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import { formatDateTime } from '@/utils/formatters'
import type { ApprovalDetail } from '../types'

interface Props {
  open: boolean
  detail: ApprovalDetail | null
  loading: boolean
  mutatingApprovalId: number | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  close: []
  approve: [approvalId: number]
  reject: [approvalId: number, motivo: string]
  suspend: [approvalId: number, motivo: string]
  reactivate: [approvalId: number]
}>()

const actionForm = reactive({
  rechazoMotivo: '',
  suspensionMotivo: '',
})

watch(
  () => props.detail?.id,
  () => {
    actionForm.rechazoMotivo = ''
    actionForm.suspensionMotivo = ''
  },
  { immediate: true },
)

const fullName = computed(() => {
  if (!props.detail) {
    return 'Solicitud de membresia'
  }

  return `${props.detail.usuario.nombre} ${props.detail.usuario.apellido}`.trim()
})

const isPending = computed(() => props.detail?.estado_validacion === 'revision_admin')
const isActive = computed(() => props.detail?.estado_validacion === 'activa')
const isSuspended = computed(() => props.detail?.estado_validacion === 'suspendida')
const isMutating = computed(() => props.detail != null && props.mutatingApprovalId === props.detail.id)

const formatDate = (value: string | null | undefined) => {
  if (!value) {
    return 'Sin dato'
  }

  return formatDateTime(value)
}

const yesNo = (value: boolean) => value ? 'Sí' : 'No'
</script>

<template>
  <AppModal
    :open="open"
    :title="fullName"
    size="xl"
    description="Revisa identidad, patrocinador, rango propuesto y evidencia operativa antes de aprobar la membresia."
    @close="emit('close')"
  >
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <span>Cargando expediente de aprobacion...</span>
    </div>

    <div v-else-if="detail" class="detail-layout">
      <section class="card-surface summary-card">
        <div class="summary-top">
          <div>
            <p class="eyebrow">Solicitud de ingreso</p>
            <h3>{{ fullName }}</h3>
            <p class="summary-copy">{{ detail.usuario.email }} · {{ detail.usuario.tipo_documento.toUpperCase() }} {{ detail.usuario.numero_documento }}</p>
          </div>
          <span class="badge" :class="`badge--${detail.estado_validacion}`">{{ detail.estado_validacion }}</span>
        </div>

        <div class="summary-grid">
          <div class="metric-card">
            <strong>{{ detail.rango_propuesto?.nombre_rango ?? 'Sin rango' }}</strong>
            <span>Rango propuesto</span>
          </div>
          <div class="metric-card">
            <strong>{{ detail.patrocinador_propuesto ? `${detail.patrocinador_propuesto.nombre} ${detail.patrocinador_propuesto.apellido}` : 'Sin patrocinador' }}</strong>
            <span>Patrocinador propuesto</span>
          </div>
          <div class="metric-card">
            <strong>{{ formatDate(detail.created_at) }}</strong>
            <span>Fecha de solicitud</span>
          </div>
          <div class="metric-card">
            <strong>{{ detail.nivel_confianza ?? '—' }}</strong>
            <span>Nivel de confianza previo</span>
          </div>
          <div class="metric-card">
            <strong>{{ detail.insignia || 'Sin insignia' }}</strong>
            <span>Insignia actual</span>
          </div>
        </div>
      </section>

      <section class="detail-grid">
        <article class="card-surface detail-card">
          <h4>Identidad global</h4>
          <p><strong>Telefono:</strong> {{ detail.usuario.telefono || 'Sin telefono' }}</p>
          <p><strong>Direccion:</strong> {{ detail.usuario.direccion || 'Sin direccion' }}</p>
          <p><strong>Firma registrada:</strong> {{ yesNo(detail.validacion_global.firma_identidad_registrada) }}</p>
          <p><strong>Ultimo consentimiento:</strong> {{ detail.validacion_global.consentimientos_firma_identidad[0]?.version_documento || 'Sin version' }}</p>
          <p><strong>Fecha consentimiento:</strong> {{ formatDate(detail.validacion_global.consentimientos_firma_identidad[0]?.aceptado_at) }}</p>
        </article>

        <article class="card-surface detail-card">
          <h4>Firma de identidad</h4>
          <p><strong>Tipo:</strong> {{ detail.validacion_global.firma_identidad_activa?.tipo_firma || 'Sin firma activa' }}</p>
          <p><strong>Huella:</strong> {{ detail.validacion_global.firma_identidad_activa?.huella_firma || 'Sin huella' }}</p>
          <p><strong>IP origen:</strong> {{ detail.validacion_global.firma_identidad_activa?.ip_origen || 'Sin IP' }}</p>
          <p><strong>Registrada:</strong> {{ formatDate(detail.validacion_global.firma_identidad_activa?.registrada_at) }}</p>
        </article>

        <article class="card-surface detail-card">
          <h4>Riesgo de dispositivos</h4>
          <p><strong>Total:</strong> {{ detail.riesgo_dispositivos.total_dispositivos }}</p>
          <p><strong>Confiables:</strong> {{ detail.riesgo_dispositivos.dispositivos_confiables }}</p>
          <p><strong>Bloqueados:</strong> {{ detail.riesgo_dispositivos.dispositivos_bloqueados }}</p>
          <ul class="plain-list">
            <li v-for="device in detail.riesgo_dispositivos.historial.slice(0, 3)" :key="device.id">
              {{ device.nombre_dispositivo || 'Dispositivo sin nombre' }} · {{ device.plataforma || 'Sin plataforma' }} · {{ device.estado || 'Sin estado' }}
            </li>
          </ul>
        </article>

        <article class="card-surface detail-card">
          <h4>Infracciones</h4>
          <p><strong>Total:</strong> {{ detail.infracciones_workspace.total }}</p>
          <p><strong>Alto riesgo:</strong> {{ detail.infracciones_workspace.alto_riesgo }}</p>
          <ul class="plain-list">
            <li v-if="detail.infracciones_workspace.items.length === 0">Sin incidencias registradas.</li>
            <li v-for="item in detail.infracciones_workspace.items.slice(0, 3)" :key="item.id">
              {{ item.gravedad }} · {{ item.tipo }} · {{ item.descripcion }}
            </li>
          </ul>
        </article>

        <article class="card-surface detail-card">
          <h4>Última evaluación de scoring</h4>
          <template v-if="detail.evaluacion_scoring_reciente">
            <p><strong>Score:</strong> {{ detail.evaluacion_scoring_reciente.score_final_calculado }}</p>
            <p><strong>Resultado:</strong> {{ detail.evaluacion_scoring_reciente.nivel_confianza_resultante ?? '—' }}</p>
            <p><strong>Rol:</strong> {{ detail.evaluacion_scoring_reciente.rol_evaluado ?? 'Sin rol' }}</p>
            <p><strong>Periodo:</strong> {{ formatDate(detail.evaluacion_scoring_reciente.periodo_desde) }} - {{ formatDate(detail.evaluacion_scoring_reciente.periodo_hasta) }}</p>
          </template>
          <p v-else>Sin evaluaciones registradas para esta membresía.</p>
        </article>

        <article class="card-surface detail-card">
          <h4>Historial biométrico</h4>
          <ul class="plain-list">
            <li v-if="detail.historial_biometrico.length === 0">Sin registros biométricos.</li>
            <li v-for="registro in detail.historial_biometrico" :key="registro.id">
              {{ registro.tipo_biometria }} v{{ registro.version ?? '—' }} · {{ formatDate(registro.created_at) }}
            </li>
          </ul>
        </article>
      </section>

      <section v-if="isPending" class="card-surface action-card">
        <div class="action-grid">
          <div class="action-box">
            <h4>Aprobar solicitud</h4>
            <p>La membresia quedará pendiente de activacion en la app del distribuidor.</p>
            <button
              type="button"
              class="action-button action-button--primary"
              :disabled="isMutating"
              @click="emit('approve', detail.id)"
            >
              {{ isMutating ? 'Procesando...' : 'Aprobar membresia' }}
            </button>
          </div>

          <div class="action-box action-box--danger">
            <h4>Rechazar solicitud</h4>
            <textarea v-model="actionForm.rechazoMotivo" rows="3" placeholder="Motivo obligatorio para rechazar" />
            <button
              type="button"
              class="action-button action-button--danger"
              :disabled="isMutating || actionForm.rechazoMotivo.trim().length === 0"
              @click="emit('reject', detail.id, actionForm.rechazoMotivo.trim())"
            >
              {{ isMutating ? 'Procesando...' : 'Rechazar membresia' }}
            </button>
          </div>
        </div>
      </section>

      <section v-else-if="isActive || isSuspended" class="card-surface action-card">
        <div class="action-grid">
          <div v-if="isActive" class="action-box action-box--danger">
            <h4>Suspender distribuidor</h4>
            <textarea v-model="actionForm.suspensionMotivo" rows="3" placeholder="Motivo obligatorio para suspender" />
            <button
              type="button"
              class="action-button action-button--danger"
              :disabled="isMutating || actionForm.suspensionMotivo.trim().length === 0"
              @click="emit('suspend', detail.id, actionForm.suspensionMotivo.trim())"
            >
              {{ isMutating ? 'Procesando...' : 'Suspender membresia' }}
            </button>
          </div>

          <div v-else class="action-box">
            <h4>Reactivar distribuidor</h4>
            <p>Vuelve a habilitar la operacion de esta membresia dentro del workspace.</p>
            <button
              type="button"
              class="action-button action-button--primary"
              :disabled="isMutating"
              @click="emit('reactivate', detail.id)"
            >
              {{ isMutating ? 'Procesando...' : 'Reactivar membresia' }}
            </button>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <button type="button" class="modal-secondary" @click="emit('close')">Cerrar</button>
    </template>
  </AppModal>
</template>

<style scoped>
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 240px;
  color: #60758d;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(82, 115, 148, 0.2);
  border-top-color: #2e7dd7;
  border-radius: 999px;
  animation: spin 0.8s linear infinite;
}

.detail-layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.card-surface {
  border: 1px solid rgba(151, 177, 209, 0.2);
  border-radius: 20px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 249, 255, 0.96));
  box-shadow: 0 14px 30px rgba(22, 39, 63, 0.08);
}

.summary-card,
.action-card,
.detail-card {
  padding: 20px;
}

.summary-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 6px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #5e7898;
}

.summary-top h3,
.detail-card h4,
.action-box h4 {
  margin: 0;
  color: #17314f;
}

.summary-copy,
.action-box p,
.detail-card p {
  margin: 8px 0 0;
  color: #51657f;
  line-height: 1.5;
}

.summary-grid,
.detail-grid,
.action-grid {
  display: grid;
  gap: 14px;
}

.summary-grid {
  margin-top: 16px;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.detail-grid {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.action-grid {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.metric-card {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(238, 245, 255, 0.92);
  border: 1px solid rgba(158, 187, 220, 0.18);
}

.metric-card strong {
  display: block;
  color: #17314f;
}

.metric-card span {
  color: #60758d;
  font-size: 13px;
}

.badge {
  padding: 8px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge--revision_admin,
.badge--pendiente_activacion,
.badge--documentos_pendientes {
  background: rgba(214, 234, 255, 0.88);
  color: #1f63ae;
}

.badge--activa {
  background: rgba(224, 245, 232, 0.9);
  color: #137243;
}

.badge--suspendida,
.badge--rechazada,
.badge--bloqueada_riesgo {
  background: rgba(255, 229, 229, 0.92);
  color: #b03d3d;
}

.plain-list {
  margin: 10px 0 0;
  padding-left: 18px;
  color: #51657f;
}

.action-box {
  padding: 18px;
  border-radius: 18px;
  background: rgba(238, 245, 255, 0.94);
  border: 1px solid rgba(158, 187, 220, 0.2);
}

.action-box--danger {
  background: rgba(255, 242, 242, 0.92);
  border-color: rgba(231, 159, 159, 0.22);
}

textarea {
  width: 100%;
  margin-top: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(154, 177, 205, 0.34);
  background: rgba(255, 255, 255, 0.98);
  font: inherit;
  color: #17314f;
  resize: vertical;
  box-sizing: border-box;
}

.action-button {
  margin-top: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 42px;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: opacity 0.18s ease;
}

.action-button:disabled,
.modal-secondary:disabled,
textarea:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.action-button--primary {
  background: linear-gradient(135deg, #1f7ae0, #145fbe);
  color: white;
}

.action-button--danger {
  background: #b91c1c;
  color: white;
}

.modal-secondary {
  padding: 9px 16px;
  border: 1px solid #dbe3ef;
  border-radius: 8px;
  background: white;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .summary-top {
    flex-direction: column;
  }
}
</style>
