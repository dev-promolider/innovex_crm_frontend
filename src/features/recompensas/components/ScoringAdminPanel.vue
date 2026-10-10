<script setup lang="ts">
import { computed, onMounted, shallowRef, watch } from 'vue'
import ApiErrorState from '@/components/shared/ApiErrorState.vue'
import { useScoringAdminApi } from '../composables/useScoringAdminApi'
import type { ScoringRole, UpdateScoringConfigurationPayload } from '../types'

const { configurations, history, evaluations, isLoading, isSaving, errorMessage, successMessage, loadAll, updateConfiguration } = useScoringAdminApi()

const activeRole = shallowRef<ScoringRole>('vendedor_base')
const changeReason = shallowRef('')
const localError = shallowRef('')
const form = shallowRef<UpdateScoringConfigurationPayload>({
  peso_eficiencia: 0,
  peso_consistencia: 0,
  peso_volumen_ventas: 0,
  peso_pago_puntual: 0,
  peso_salud_red: 0,
  umbral_nivel_nuevo: 0,
  umbral_nivel_confiable: 0,
  umbral_nivel_verificado: 0,
  umbral_nivel_elite: 0,
})

const currentConfiguration = computed(() => configurations.value?.[activeRole.value] ?? null)
const filteredHistory = computed(() => history.value.filter((entry) => entry.rol_evaluado === activeRole.value))
const filteredEvaluations = computed(() => evaluations.value.filter((entry) => entry.rol_evaluado === activeRole.value))
const totalWeights = computed(() =>
  form.value.peso_eficiencia
  + form.value.peso_consistencia
  + form.value.peso_volumen_ventas
  + form.value.peso_pago_puntual
  + form.value.peso_salud_red,
)

const roleLabel = (role: ScoringRole) => role === 'vendedor_base' ? 'Distribuidor base' : 'Lider de red'

const formatDate = (value: string | null) => {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

const syncForm = () => {
  if (!currentConfiguration.value) {
    return
  }

  form.value = {
    peso_eficiencia: currentConfiguration.value.peso_eficiencia,
    peso_consistencia: currentConfiguration.value.peso_consistencia,
    peso_volumen_ventas: currentConfiguration.value.peso_volumen_ventas,
    peso_pago_puntual: currentConfiguration.value.peso_pago_puntual,
    peso_salud_red: currentConfiguration.value.peso_salud_red,
    umbral_nivel_nuevo: currentConfiguration.value.umbral_nivel_nuevo,
    umbral_nivel_confiable: currentConfiguration.value.umbral_nivel_confiable,
    umbral_nivel_verificado: currentConfiguration.value.umbral_nivel_verificado,
    umbral_nivel_elite: currentConfiguration.value.umbral_nivel_elite,
  }
}

watch(activeRole, () => {
  localError.value = ''
  changeReason.value = ''
  syncForm()
})

watch(currentConfiguration, () => {
  syncForm()
})

const saveConfiguration = async () => {
  if (Math.abs(totalWeights.value - 1) > 0.0001) {
    localError.value = 'La suma de pesos debe ser exactamente 1.00.'
    return
  }

  if (activeRole.value === 'vendedor_base' && form.value.peso_salud_red !== 0) {
    localError.value = 'El vendedor base debe mantener salud de red en 0.'
    return
  }

  if (activeRole.value === 'lider_red' && form.value.peso_salud_red <= 0) {
    localError.value = 'El lider de red requiere un peso de salud de red mayor a 0.'
    return
  }

  localError.value = ''
  await updateConfiguration(activeRole.value, {
    ...form.value,
    motivo_cambio: changeReason.value.trim() || undefined,
  })
  changeReason.value = ''
}

onMounted(async () => {
  await loadAll()
  syncForm()
})
</script>

<template>
  <div class="scoring-panel">
    <div class="panel-toolbar">
      <div>
        <h3 class="section-title">Motor Scoring</h3>
        <p class="section-sub">Configuracion vigente, historial auditado y evaluaciones recientes por rol.</p>
      </div>

      <div class="role-switcher">
        <button type="button" class="role-button" :class="{ active: activeRole === 'vendedor_base' }" @click="activeRole = 'vendedor_base'">Distribuidor base</button>
        <button type="button" class="role-button" :class="{ active: activeRole === 'lider_red' }" @click="activeRole = 'lider_red'">Lider de red</button>
      </div>
    </div>

    <div v-if="localError && !errorMessage" class="inline-error">{{ localError }}</div>
    <div v-if="successMessage" class="inline-success">{{ successMessage }}</div>
    <div v-if="isLoading" class="panel-state">Cargando configuracion y evaluaciones...</div>
    <ApiErrorState v-else-if="errorMessage" :message="errorMessage" :retrying="isLoading" @retry="loadAll" />

    <template v-else-if="currentConfiguration">
      <div class="summary-grid">
        <article class="summary-card">
          <span class="summary-label">Rol evaluado</span>
          <strong>{{ roleLabel(activeRole) }}</strong>
          <small>{{ currentConfiguration.persisted ? 'Configuracion persistida' : 'Base sugerida inicial' }}</small>
        </article>
        <article class="summary-card">
          <span class="summary-label">Suma de pesos</span>
          <strong>{{ totalWeights.toFixed(2) }}</strong>
          <small>{{ currentConfiguration.pesos_validos ? 'Balance correcto' : 'Revisar formula' }}</small>
        </article>
        <article class="summary-card">
          <span class="summary-label">Vigente desde</span>
          <strong>{{ formatDate(currentConfiguration.vigente_desde) }}</strong>
          <small>Ultima version operativa</small>
        </article>
      </div>

      <div class="panel-grid">
        <section class="config-card">
          <h4 class="detail-title">Formula activa</h4>
          <div class="form-grid">
            <label class="field-block">
              <span>Peso eficiencia</span>
              <input v-model.number="form.peso_eficiencia" type="number" min="0" max="1" step="0.01" class="field-input">
            </label>
            <label class="field-block">
              <span>Peso consistencia</span>
              <input v-model.number="form.peso_consistencia" type="number" min="0" max="1" step="0.01" class="field-input">
            </label>
            <label class="field-block">
              <span>Peso volumen ventas</span>
              <input v-model.number="form.peso_volumen_ventas" type="number" min="0" max="1" step="0.01" class="field-input">
            </label>
            <label class="field-block">
              <span>Peso pago puntual</span>
              <input v-model.number="form.peso_pago_puntual" type="number" min="0" max="1" step="0.01" class="field-input">
            </label>
            <label class="field-block">
              <span>Peso salud red</span>
              <input v-model.number="form.peso_salud_red" type="number" min="0" max="1" step="0.01" class="field-input">
            </label>
          </div>

          <div class="threshold-grid">
            <label class="field-block">
              <span>Umbral nuevo</span>
              <input v-model.number="form.umbral_nivel_nuevo" type="number" min="0" max="1000" class="field-input">
            </label>
            <label class="field-block">
              <span>Umbral confiable</span>
              <input v-model.number="form.umbral_nivel_confiable" type="number" min="0" max="1000" class="field-input">
            </label>
            <label class="field-block">
              <span>Umbral verificado</span>
              <input v-model.number="form.umbral_nivel_verificado" type="number" min="0" max="1000" class="field-input">
            </label>
            <label class="field-block">
              <span>Umbral elite</span>
              <input v-model.number="form.umbral_nivel_elite" type="number" min="0" max="1000" class="field-input">
            </label>
          </div>

          <label class="field-block full-width">
            <span>Motivo del cambio</span>
            <textarea v-model="changeReason" class="field-textarea" placeholder="Justificacion operativa del ajuste..."></textarea>
          </label>

          <div class="action-row">
            <button type="button" class="save-button" :disabled="isSaving" @click="saveConfiguration">
              {{ isSaving ? 'Guardando...' : 'Guardar configuracion' }}
            </button>
          </div>
        </section>

        <section class="side-column">
          <article class="detail-block">
            <h4 class="detail-title">Historial reciente</h4>
            <div v-if="filteredHistory.length === 0" class="panel-state compact">Sin historial registrado para este rol.</div>
            <div v-else class="timeline-list">
              <div v-for="entry in filteredHistory" :key="entry.id" class="timeline-item">
                <strong>{{ formatDate(entry.vigente_desde) }}</strong>
                <span>{{ entry.motivo_cambio ?? 'Sin motivo' }}</span>
                <small>{{ entry.cambiado_por ?? 'Sistema' }}</small>
              </div>
            </div>
          </article>

          <article class="detail-block">
            <h4 class="detail-title">Evaluaciones recientes</h4>
            <div v-if="filteredEvaluations.length === 0" class="panel-state compact">Sin evaluaciones registradas para este rol.</div>
            <div v-else class="evaluation-list">
              <div v-for="evaluation in filteredEvaluations" :key="evaluation.id" class="evaluation-item">
                <div>
                  <strong>{{ evaluation.distribuidor?.nombre ?? 'Distribuidor' }}</strong>
                  <span>{{ evaluation.distribuidor?.rango ?? 'Sin rango' }}</span>
                </div>
                <div class="evaluation-metrics">
                  <strong>{{ evaluation.nivel_confianza_resultante }}</strong>
                  <small :class="{ positive: evaluation.delta >= 0, negative: evaluation.delta < 0 }">{{ evaluation.delta >= 0 ? '+' : '' }}{{ evaluation.delta }}</small>
                </div>
              </div>
            </div>
          </article>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.scoring-panel,
.side-column,
.detail-block {
  display: flex;
  flex-direction: column;
}

.scoring-panel,
.side-column {
  gap: 18px;
}

.panel-toolbar,
.role-switcher,
.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.panel-toolbar {
  justify-content: space-between;
  align-items: center;
}

.role-button,
.save-button {
  min-height: 40px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
}

.role-button {
  border: 1px solid #d7deea;
  background: #fff;
  cursor: pointer;
}

.role-button.active {
  background: #e8f1fb;
  color: #1a6ab5;
  border-color: #bfd7f0;
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

.panel-state.compact {
  padding: 12px;
}

.summary-grid,
.panel-grid,
.form-grid,
.threshold-grid {
  display: grid;
  gap: 16px;
}

.summary-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.summary-card,
.config-card,
.detail-block {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  background: #fff;
}

.summary-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-label,
.field-block span,
.timeline-item span,
.timeline-item small,
.evaluation-item span,
.evaluation-item small {
  font-size: 12px;
  color: #64748b;
}

.panel-grid {
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.9fr);
}

.form-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.threshold-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 16px;
}

.field-block {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-input,
.field-textarea {
  border: 1px solid #d7deea;
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 13px;
  color: #243043;
}

.field-textarea {
  min-height: 84px;
  resize: vertical;
}

.full-width {
  margin-top: 16px;
}

.save-button {
  border: none;
  background: #1a6ab5;
  color: #fff;
  cursor: pointer;
}

.save-button:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.detail-title {
  margin: 0 0 12px;
  color: #1e293b;
  font-size: 14px;
}

.timeline-list,
.evaluation-list {
  display: grid;
  gap: 12px;
}

.timeline-item,
.evaluation-item {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  background: #f8fbff;
}

.timeline-item {
  flex-direction: column;
}

.evaluation-item {
  align-items: center;
}

.evaluation-metrics {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.positive {
  color: #166534;
}

.negative {
  color: #b91c1c;
}

@media (max-width: 1024px) {
  .summary-grid,
  .panel-grid,
  .form-grid,
  .threshold-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .role-button,
  .save-button {
    width: 100%;
  }
}
</style>