<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { CalendarClock, CreditCard, History, RefreshCw, Save, X } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import { formatDateTime } from '@/utils/formatters'
import { useWorkspacePaymentPoliciesApi } from '../composables/useWorkspacePaymentPoliciesApi'
import type { WorkspacePaymentModel, WorkspacePaymentPolicyPayload } from '../types'

const {
  policy,
  history,
  isLoading,
  isSaving,
  isLoadingHistory,
  errorMessage,
  successMessage,
  clearMessages,
  fetchPolicy,
  fetchHistory,
  updatePolicy,
} = useWorkspacePaymentPoliciesApi()

const form = reactive({
  modelo_pago: 'bullet' as WorkspacePaymentModel,
  dias_plazo_bullet: '7',
  numero_cuotas: '4',
  periodicidad_dias: '7',
  dias_gracia_recepcion: '0',
  tolerancia_pago_horas: '24',
  motivo_cambio: '',
})

const isBulletModel = computed(() => form.modelo_pago === 'bullet')

const syncFormFromPolicy = () => {
  form.modelo_pago = policy.value?.modelo_pago ?? 'bullet'
  form.dias_plazo_bullet = String(policy.value?.dias_plazo_bullet ?? 7)
  form.numero_cuotas = String(policy.value?.numero_cuotas ?? 4)
  form.periodicidad_dias = String(policy.value?.periodicidad_dias ?? 7)
  form.dias_gracia_recepcion = String(policy.value?.dias_gracia_recepcion ?? 0)
  form.tolerancia_pago_horas = String(policy.value?.tolerancia_pago_horas ?? 24)
  form.motivo_cambio = ''
}

watch(
  () => policy.value,
  () => {
    syncFormFromPolicy()
  },
  { immediate: true },
)

const normalizePayload = (): WorkspacePaymentPolicyPayload => ({
  modelo_pago: form.modelo_pago,
  dias_plazo_bullet: isBulletModel.value ? Math.max(1, Number(form.dias_plazo_bullet) || 1) : null,
  numero_cuotas: isBulletModel.value ? null : Math.max(1, Number(form.numero_cuotas) || 1),
  periodicidad_dias: isBulletModel.value ? null : Math.max(1, Number(form.periodicidad_dias) || 1),
  dias_gracia_recepcion: Math.max(0, Number(form.dias_gracia_recepcion) || 0),
  tolerancia_pago_horas: Math.max(0, Number(form.tolerancia_pago_horas) || 0),
  motivo_cambio: form.motivo_cambio.trim() || null,
})

const handleSave = async () => {
  try {
    await updatePolicy(normalizePayload())
  } catch {
    return
  }
}

const refreshAll = async () => {
  clearMessages()
  await Promise.all([fetchPolicy(), fetchHistory()])
}

const formatDate = (value: string | null) => {
  if (!value) return 'Sin fecha'
  return formatDateTime(value)
}

onMounted(async () => {
  await refreshAll()
})
</script>

<template>
  <div class="payments-section">
    <header class="payments-section__header">
      <div>
        <p class="payments-section__eyebrow">Politica financiera</p>
        <h2 class="payments-section__title">Modelo de pagos del workspace</h2>
        <p class="payments-section__subtitle">
          Administra la modalidad bullet o fraccionada que alimenta la originacion de deuda y conserva trazabilidad de cambios.
        </p>
      </div>

      <div class="payments-section__actions">
        <AppButton variant="ghost" size="sm" class="payments-section__ghost-btn" :disabled="isLoading || isLoadingHistory" @click="refreshAll">
          <template #leading>
            <RefreshCw class="size-4" />
          </template>
          {{ isLoading || isLoadingHistory ? 'Sincronizando...' : 'Actualizar' }}
        </AppButton>
        <AppButton variant="primary" class="payments-section__primary-btn" :disabled="isSaving" @click="handleSave">
          <template #leading>
            <Save class="size-4" />
          </template>
          {{ isSaving ? 'Guardando...' : 'Guardar politica' }}
        </AppButton>
      </div>
    </header>

    <div class="payments-kpis">
      <article class="payments-kpi-card">
        <CreditCard class="size-5" />
        <div>
          <span>Modelo vigente</span>
          <strong>{{ policy?.modelo_pago ?? 'Sin configurar' }}</strong>
        </div>
      </article>
      <article class="payments-kpi-card payments-kpi-card--accent">
        <CalendarClock class="size-5" />
        <div>
          <span>Gracia / tolerancia</span>
          <strong>{{ policy?.dias_gracia_recepcion ?? 0 }} d / {{ policy?.tolerancia_pago_horas ?? 0 }} h</strong>
        </div>
      </article>
      <article class="payments-kpi-card payments-kpi-card--warm">
        <History class="size-5" />
        <div>
          <span>Cambios auditados</span>
          <strong>{{ history.length }}</strong>
        </div>
      </article>
    </div>

    <div v-if="errorMessage" class="payments-alert payments-alert--error">
      <span>{{ errorMessage }}</span>
      <AppButton type="button" variant="quiet" size="sm" class="payments-alert__close" @click="clearMessages">
        <template #leading>
          <X class="size-4" />
        </template>
        Cerrar
      </AppButton>
    </div>

    <div v-if="successMessage" class="payments-alert payments-alert--success">
      <span>{{ successMessage }}</span>
      <AppButton type="button" variant="quiet" size="sm" class="payments-alert__close" @click="clearMessages">
        <template #leading>
          <X class="size-4" />
        </template>
        Cerrar
      </AppButton>
    </div>

    <div class="payments-layout">
      <section class="payments-editor-card">
        <div class="payments-model-toggle">
          <button type="button" class="payments-model-toggle__item" :class="{ 'payments-model-toggle__item--active': form.modelo_pago === 'bullet' }" @click="form.modelo_pago = 'bullet'">
            Pago bullet
          </button>
          <button type="button" class="payments-model-toggle__item" :class="{ 'payments-model-toggle__item--active': form.modelo_pago === 'fraccionado' }" @click="form.modelo_pago = 'fraccionado'">
            Pago fraccionado
          </button>
        </div>

        <div class="payments-editor-card__grid">
          <label v-if="isBulletModel" class="payments-field payments-field--wide">
            <span class="payments-field__label">Dias plazo bullet</span>
            <input v-model="form.dias_plazo_bullet" class="payments-input" type="number" min="1" />
          </label>

          <template v-else>
            <label class="payments-field">
              <span class="payments-field__label">Numero de cuotas</span>
              <input v-model="form.numero_cuotas" class="payments-input" type="number" min="1" />
            </label>

            <label class="payments-field">
              <span class="payments-field__label">Periodicidad en dias</span>
              <input v-model="form.periodicidad_dias" class="payments-input" type="number" min="1" />
            </label>
          </template>

          <label class="payments-field">
            <span class="payments-field__label">Dias de gracia recepcion</span>
            <input v-model="form.dias_gracia_recepcion" class="payments-input" type="number" min="0" />
          </label>

          <label class="payments-field">
            <span class="payments-field__label">Tolerancia pago (horas)</span>
            <input v-model="form.tolerancia_pago_horas" class="payments-input" type="number" min="0" />
          </label>

          <label class="payments-field payments-field--wide">
            <span class="payments-field__label">Motivo del cambio</span>
            <textarea v-model="form.motivo_cambio" class="payments-input payments-input--textarea" maxlength="500" placeholder="Deja trazabilidad del ajuste operativo que estas realizando." />
          </label>
        </div>
      </section>

      <aside class="payments-history-card">
        <div class="payments-history-card__header">
          <div>
            <p class="payments-section__eyebrow">Auditoria</p>
            <h3 class="payments-history-card__title">Historial de configuraciones</h3>
          </div>
          <span class="payments-history-card__meta">{{ isLoadingHistory ? 'Cargando...' : `${history.length} cambios` }}</span>
        </div>

        <div v-if="history.length === 0" class="payments-empty-state">
          Aun no hay cambios auditados en las politicas de pago.
        </div>

        <div v-else class="payments-history-list">
          <article v-for="entry in history" :key="entry.id" class="payments-history-item">
            <div class="payments-history-item__top">
              <strong>{{ entry.snapshot?.modelo_pago ?? 'Modelo no disponible' }}</strong>
              <span>{{ formatDate(entry.vigente_hasta) }}</span>
            </div>
            <p>{{ entry.motivo_cambio || 'Sin motivo registrado.' }}</p>
            <div class="payments-history-item__meta">
              <span>Por: {{ entry.cambiado_por || 'Sistema' }}</span>
              <span v-if="entry.snapshot">
                {{ entry.snapshot.modelo_pago === 'bullet'
                  ? `${entry.snapshot.dias_plazo_bullet ?? 0} dias`
                  : `${entry.snapshot.numero_cuotas ?? 0} cuotas / ${entry.snapshot.periodicidad_dias ?? 0} dias` }}
              </span>
            </div>
          </article>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.payments-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.payments-section__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.payments-section__eyebrow {
  margin-bottom: 8px;
  color: #8c5f2c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.payments-section__title {
  color: #162033;
  font-size: 1.5rem;
  line-height: 1.1;
}

.payments-section__subtitle {
  margin-top: 10px;
  color: #5e6c83;
  line-height: 1.65;
}

.payments-section__actions {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.payments-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.payments-kpi-card {
  display: flex;
  gap: 12px;
  align-items: center;
  border-radius: 20px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  padding: 16px;
  background: #fbfcfd;
  color: #162033;
}

.payments-kpi-card span {
  display: block;
  color: #6a768a;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.payments-kpi-card strong {
  display: block;
  margin-top: 6px;
  font-size: 1.25rem;
}

.payments-kpi-card--accent {
  background: rgba(240, 244, 255, 0.9);
}

.payments-kpi-card--warm {
  background: rgba(255, 247, 235, 0.95);
}

.payments-alert {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 18px;
  padding: 14px 16px;
}

.payments-alert--error {
  border: 1px solid rgba(185, 28, 28, 0.18);
  background: #fff4f4;
  color: #9f1d1d;
}

.payments-alert--success {
  border: 1px solid rgba(22, 101, 52, 0.16);
  background: #effcf2;
  color: #166534;
}

.payments-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 20px;
}

.payments-editor-card,
.payments-history-card {
  border-radius: 28px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 24px 60px rgba(31, 53, 84, 0.08);
}

.payments-editor-card {
  padding: 24px;
}

.payments-model-toggle {
  display: inline-grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  padding: 6px;
  border-radius: 18px;
  background: #f4f7fb;
  margin-bottom: 18px;
}

.payments-model-toggle__item {
  border: none;
  border-radius: 14px;
  padding: 10px 16px;
  background: transparent;
  color: #5e6c83;
  font-weight: 700;
}

.payments-model-toggle__item--active {
  background: white;
  color: #162033;
  box-shadow: 0 8px 20px rgba(31, 53, 84, 0.08);
}

.payments-editor-card__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.payments-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.payments-field--wide {
  grid-column: 1 / -1;
}

.payments-field__label {
  color: #6a768a;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.payments-input {
  width: 100%;
  border-radius: 16px;
  border: 1px solid rgba(32, 51, 79, 0.12);
  background: #fbfcfd;
  padding: 12px 14px;
  color: #162033;
}

.payments-input--textarea {
  min-height: 110px;
  resize: vertical;
}

.payments-history-card {
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payments-history-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.payments-history-card__title {
  color: #162033;
  font-size: 1.2rem;
}

.payments-history-card__meta {
  color: #6a768a;
  font-size: 0.84rem;
}

.payments-empty-state {
  border-radius: 20px;
  background: #f8fafc;
  padding: 18px;
  color: #6a768a;
}

.payments-history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payments-history-item {
  border-radius: 18px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: #fcfdff;
  padding: 14px 16px;
}

.payments-history-item__top,
.payments-history-item__meta {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.payments-history-item__top strong {
  color: #162033;
  text-transform: capitalize;
}

.payments-history-item__top span,
.payments-history-item__meta {
  color: #6a768a;
  font-size: 0.82rem;
}

.payments-history-item p {
  margin: 8px 0 10px;
  color: #445168;
  line-height: 1.55;
}

@media (max-width: 1100px) {
  .payments-kpis,
  .payments-layout,
  .payments-editor-card__grid {
    grid-template-columns: 1fr;
  }

  .payments-section__header,
  .payments-alert {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
