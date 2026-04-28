<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue'
import { GitBranch, Plus, RefreshCw, Save, Sparkles, Target, X } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import { useWorkspaceNetworkApi } from '../composables/useWorkspaceNetworkApi'
import type {
    WorkspaceCommissionRule,
    WorkspaceNetworkConfigurationPayload,
} from '../types'

const props = defineProps<{
  empresaId?: number
}>()

interface EditableRank {
    localId: string
    nombre_rango: string
    nivel: number
    orden_jerarquico: number
    max_distribuidores_directos: string
    limite_kits_credito: string
    es_rango_raiz: boolean
    accesos_json: string
    reglas_comision: Array<{
        localId: string
        nivel_objetivo: string
        porcentaje_comision: string
    }>
}

  interface ReadonlyRankInput {
    readonly nombre_rango: string
    readonly nivel: number
    readonly orden_jerarquico: number
    readonly max_distribuidores_directos: number | null
    readonly limite_kits_credito: number
    readonly es_rango_raiz: boolean
    readonly accesos_json?: readonly string[] | null
    readonly reglas_comision: ReadonlyArray<{
      readonly nivel_objetivo: number
      readonly porcentaje_comision: number
    }>
  }

const {
    networkConfiguration,
    simulation,
    isLoading,
    isSaving,
    isSimulating,
    errorMessage,
    successMessage,
    clearMessages,
    fetchNetworkConfiguration,
    saveNetworkConfiguration,
    simulateCommissions,
} = useWorkspaceNetworkApi({ empresaId: props.empresaId })

const form = reactive({
    profundidad_maxima: '1',
    motivo_cambio: '',
    precio_kit: '299',
    nivel_vendedor: '1',
    rangos: [] as EditableRank[],
})

const rankCount = computed(() => form.rangos.length)

const totalRulesCount = computed(() => form.rangos.reduce((sum, rank) => sum + rank.reglas_comision.length, 0))

const canSimulate = computed(() => Number(form.precio_kit) > 0 && Number(form.nivel_vendedor) > 0)

const nextRankId = () => `rank-${Math.random().toString(36).slice(2, 10)}`
const nextRuleId = () => `rule-${Math.random().toString(36).slice(2, 10)}`

const toEditableRank = (rank: ReadonlyRankInput): EditableRank => ({
    localId: nextRankId(),
    nombre_rango: rank.nombre_rango,
    nivel: rank.nivel,
    orden_jerarquico: rank.orden_jerarquico,
    max_distribuidores_directos: rank.max_distribuidores_directos == null ? '' : String(rank.max_distribuidores_directos),
    limite_kits_credito: String(rank.limite_kits_credito),
    es_rango_raiz: rank.es_rango_raiz,
    accesos_json: Array.isArray(rank.accesos_json) ? rank.accesos_json.join(', ') : '',
    reglas_comision: rank.reglas_comision.map((rule) => ({
        localId: nextRuleId(),
        nivel_objetivo: String(rule.nivel_objetivo),
        porcentaje_comision: String(rule.porcentaje_comision),
    })),
})

const syncFormFromApi = () => {
    form.profundidad_maxima = String(networkConfiguration.value?.profundidad_maxima ?? 1)
    form.motivo_cambio = ''
    form.rangos = (networkConfiguration.value?.rangos ?? []).map(toEditableRank)
    form.nivel_vendedor = String(networkConfiguration.value?.profundidad_maxima ?? 1)
}

watch(
    () => networkConfiguration.value,
    () => {
        syncFormFromApi()
    },
    { immediate: true },
)

const addRank = () => {
    form.rangos.push({
        localId: nextRankId(),
        nombre_rango: '',
        nivel: Math.min(Number(form.profundidad_maxima) || 1, 1),
        orden_jerarquico: 1,
        max_distribuidores_directos: '',
        limite_kits_credito: '0',
        es_rango_raiz: form.rangos.length === 0,
        accesos_json: '',
        reglas_comision: [],
    })
}

const removeRank = (localId: string) => {
    form.rangos = form.rangos.filter((rank) => rank.localId !== localId)
}

const addRule = (rank: EditableRank) => {
    rank.reglas_comision.push({
        localId: nextRuleId(),
        nivel_objetivo: '1',
        porcentaje_comision: '0',
    })
}

const removeRule = (rank: EditableRank, localId: string) => {
    rank.reglas_comision = rank.reglas_comision.filter((rule) => rule.localId !== localId)
}

const normalizePayload = (): WorkspaceNetworkConfigurationPayload => ({
    profundidad_maxima: Math.max(1, Number(form.profundidad_maxima) || 1),
    motivo_cambio: form.motivo_cambio.trim() || null,
    rangos: form.rangos.map((rank) => ({
        nombre_rango: rank.nombre_rango.trim(),
        nivel: Math.max(1, Number(rank.nivel) || 1),
        orden_jerarquico: Math.max(1, Number(rank.orden_jerarquico) || 1),
        max_distribuidores_directos: rank.max_distribuidores_directos.trim().length > 0
            ? Math.max(1, Number(rank.max_distribuidores_directos) || 1)
            : null,
        limite_kits_credito: Math.max(0, Number(rank.limite_kits_credito) || 0),
        es_rango_raiz: rank.es_rango_raiz,
        accesos_json: rank.accesos_json
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        reglas_comision: rank.reglas_comision.map((rule): WorkspaceCommissionRule => ({
            nivel_objetivo: Math.max(1, Number(rule.nivel_objetivo) || 1),
            porcentaje_comision: Math.max(0, Number(rule.porcentaje_comision) || 0),
        })),
    })),
})

const handleSave = async () => {
    try {
        await saveNetworkConfiguration(normalizePayload())
    } catch {
        return
    }
}

const handleSimulate = async () => {
    try {
        await simulateCommissions(Number(form.precio_kit), Number(form.nivel_vendedor))
    } catch {
        return
    }
}

onMounted(async () => {
    await fetchNetworkConfiguration()
})
</script>

<template>
  <div class="network-section">
    <header class="network-section__header">
      <div>
        <p class="network-section__eyebrow">Motor de red</p>
        <h2 class="network-section__title">Rangos, profundidad y comisiones</h2>
        <p class="network-section__subtitle">
          Configura una version completa del arbol comercial con cobertura por niveles, reglas de cascada y simulacion previa.
        </p>
      </div>

      <div class="network-section__header-actions">
        <AppButton variant="ghost" size="sm" class="network-section__ghost-btn" :disabled="isLoading" @click="fetchNetworkConfiguration">
          <template #leading>
            <RefreshCw class="size-4" />
          </template>
          {{ isLoading ? 'Cargando...' : 'Actualizar' }}
        </AppButton>
        <AppButton variant="primary" class="network-section__primary-btn" :disabled="isSaving" @click="handleSave">
          <template #leading>
            <Save class="size-4" />
          </template>
          {{ isSaving ? 'Guardando...' : 'Guardar version' }}
        </AppButton>
      </div>
    </header>

    <div class="network-kpis">
      <article class="network-kpi-card">
        <GitBranch class="size-5" />
        <div>
          <span>Version vigente</span>
          <strong>{{ networkConfiguration?.version_configuracion ?? 0 }}</strong>
        </div>
      </article>
      <article class="network-kpi-card network-kpi-card--accent">
        <Target class="size-5" />
        <div>
          <span>Profundidad maxima</span>
          <strong>{{ form.profundidad_maxima }}</strong>
        </div>
      </article>
      <article class="network-kpi-card network-kpi-card--warm">
        <Sparkles class="size-5" />
        <div>
          <span>Rangos / reglas</span>
          <strong>{{ rankCount }} / {{ totalRulesCount }}</strong>
        </div>
      </article>
    </div>

    <div v-if="errorMessage" class="network-alert network-alert--error">
      <span>{{ errorMessage }}</span>
      <AppButton type="button" variant="quiet" size="sm" class="network-alert__close" @click="clearMessages">
        <template #leading>
          <X class="size-4" />
        </template>
        Cerrar
      </AppButton>
    </div>

    <div v-if="successMessage" class="network-alert network-alert--success">
      <span>{{ successMessage }}</span>
      <AppButton type="button" variant="quiet" size="sm" class="network-alert__close" @click="clearMessages">
        <template #leading>
          <X class="size-4" />
        </template>
        Cerrar
      </AppButton>
    </div>

    <div class="network-layout">
      <section class="network-editor-card">
        <div class="network-editor-card__meta-grid">
          <label class="network-field">
            <span class="network-field__label">Profundidad maxima</span>
            <input v-model="form.profundidad_maxima" class="network-input" type="number" min="1" />
          </label>

          <label class="network-field network-field--wide">
            <span class="network-field__label">Motivo del cambio</span>
            <input v-model="form.motivo_cambio" class="network-input" type="text" maxlength="500" placeholder="Ej. Ajuste del plan de compensacion para el cierre de mes" />
          </label>
        </div>

        <div class="network-editor-card__tree-preview">
          <div class="network-tree">
            <div v-for="level in networkConfiguration?.preview_niveles ?? []" :key="level.nivel" class="network-tree__level">
              <span class="network-tree__badge">Nivel {{ level.nivel }}</span>
              <div class="network-tree__chips">
                <span v-for="rank in level.rangos" :key="rank" class="network-tree__chip">{{ rank }}</span>
                <span v-if="level.rangos.length === 0" class="network-tree__chip network-tree__chip--empty">Sin rango</span>
              </div>
            </div>
          </div>
        </div>

        <div class="network-ranks">
          <div class="network-ranks__header">
            <div>
              <h3>Rangos configurables</h3>
              <p>Un nivel puede tener mas de un rango y cada rango puede tener multiples reglas de comision.</p>
            </div>
            <AppButton type="button" variant="ghost" size="sm" class="network-section__ghost-btn" @click="addRank">
              <template #leading>
                <Plus class="size-4" />
              </template>
              Agregar rango
            </AppButton>
          </div>

          <div v-if="form.rangos.length === 0" class="network-empty-state">
            Crea el primer rango raiz y luego agrega los niveles siguientes.
          </div>

          <article v-for="rank in form.rangos" :key="rank.localId" class="network-rank-card">
            <div class="network-rank-card__top">
              <strong>{{ rank.nombre_rango || 'Nuevo rango' }}</strong>
              <button type="button" class="network-rank-card__remove" @click="removeRank(rank.localId)">Eliminar</button>
            </div>

            <div class="network-rank-card__grid">
              <label class="network-field network-field--wide">
                <span class="network-field__label">Nombre del rango</span>
                <input v-model="rank.nombre_rango" class="network-input" type="text" maxlength="80" placeholder="Supervisor" />
              </label>

              <label class="network-field">
                <span class="network-field__label">Nivel</span>
                <input v-model="rank.nivel" class="network-input" type="number" min="1" />
              </label>

              <label class="network-field">
                <span class="network-field__label">Orden jerarquico</span>
                <input v-model="rank.orden_jerarquico" class="network-input" type="number" min="1" />
              </label>

              <label class="network-field">
                <span class="network-field__label">Max. hijos directos</span>
                <input v-model="rank.max_distribuidores_directos" class="network-input" type="number" min="1" placeholder="Opcional" />
              </label>

              <label class="network-field">
                <span class="network-field__label">Limite kits credito</span>
                <input v-model="rank.limite_kits_credito" class="network-input" type="number" min="0" />
              </label>

              <label class="network-field network-field--wide">
                <span class="network-field__label">Accesos JSON</span>
                <input v-model="rank.accesos_json" class="network-input" type="text" placeholder="ventas, reportes, dashboard" />
              </label>

              <label class="network-toggle network-field--wide">
                <input v-model="rank.es_rango_raiz" type="checkbox" />
                <span>Marcar como rango raiz</span>
              </label>
            </div>

            <div class="network-rules">
              <div class="network-rules__header">
                <strong>Reglas de comision</strong>
                <AppButton type="button" variant="ghost" size="sm" class="network-section__ghost-btn" @click="addRule(rank)">
                  <template #leading>
                    <Plus class="size-4" />
                  </template>
                  Agregar regla
                </AppButton>
              </div>

              <div v-if="rank.reglas_comision.length === 0" class="network-empty-state network-empty-state--compact">
                Este rango aun no gana sobre ningun nivel objetivo.
              </div>

              <div v-else class="network-rule-list">
                <div v-for="rule in rank.reglas_comision" :key="rule.localId" class="network-rule-row">
                  <label class="network-field">
                    <span class="network-field__label">Nivel objetivo</span>
                    <input v-model="rule.nivel_objetivo" class="network-input" type="number" min="1" />
                  </label>

                  <label class="network-field">
                    <span class="network-field__label">% Comision</span>
                    <input v-model="rule.porcentaje_comision" class="network-input" type="number" min="0" max="100" step="0.01" />
                  </label>

                  <button type="button" class="network-rank-card__remove network-rank-card__remove--rule" @click="removeRule(rank, rule.localId)">
                    Quitar
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <aside class="network-side-panel">
        <section class="network-side-card">
          <p class="network-side-card__eyebrow">Simulador</p>
          <h3 class="network-side-card__title">Impacto de comisiones</h3>
          <p class="network-side-card__copy">
            Prueba cuanto recibiria cada patrocinador segun el nivel del vendedor y el precio del kit.
          </p>

          <div class="network-side-card__form">
            <label class="network-field">
              <span class="network-field__label">Precio del kit</span>
              <input v-model="form.precio_kit" class="network-input" type="number" min="0.01" step="0.01" />
            </label>

            <label class="network-field">
              <span class="network-field__label">Nivel del vendedor</span>
              <input v-model="form.nivel_vendedor" class="network-input" type="number" min="1" />
            </label>

            <AppButton variant="secondary" block class="network-section__primary-btn" :disabled="!canSimulate || isSimulating" @click="handleSimulate">
              <template #leading>
                <Target class="size-4" />
              </template>
              {{ isSimulating ? 'Simulando...' : 'Simular escenario' }}
            </AppButton>
          </div>

          <div v-if="simulation" class="network-simulation-result">
            <div class="network-simulation-result__summary">
              <span>Total distribuido</span>
              <strong>{{ simulation.total_comisiones.toFixed(2) }}</strong>
            </div>

            <div v-if="simulation.distribucion.length === 0" class="network-empty-state network-empty-state--compact">
              No existen reglas para ese nivel objetivo.
            </div>

            <div v-else class="network-simulation-result__rows">
              <div v-for="row in simulation.distribucion" :key="`${row.rango_patrocinador}-${row.nivel_patrocinador}`" class="network-simulation-result__row">
                <div>
                  <strong>{{ row.rango_patrocinador }}</strong>
                  <small>Nivel {{ row.nivel_patrocinador }}</small>
                </div>
                <div class="network-simulation-result__metrics">
                  <span>{{ row.porcentaje_comision }}%</span>
                  <strong>{{ row.monto_a_recibir.toFixed(2) }}</strong>
                </div>
              </div>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.network-section {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.network-section__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-end;
}

.network-section__eyebrow,
.network-side-card__eyebrow {
  color: #8c5f2c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.network-section__title,
.network-side-card__title,
.network-ranks__header h3 {
  color: #162033;
  font-size: 1.5rem;
  line-height: 1.1;
}

.network-section__subtitle,
.network-side-card__copy,
.network-ranks__header p {
  margin-top: 10px;
  color: #5e6c83;
  line-height: 1.65;
}

.network-section__header-actions {
  display: flex;
  gap: 10px;
}


.network-section__primary-btn {
  border: 0;
  background: linear-gradient(135deg, #ba7b2f 0%, #8b4c1c 100%);
  color: #fff;
  font-weight: 700;
}

.network-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.network-kpi-card,
.network-editor-card,
.network-side-card {
  border-radius: 28px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 24px 60px rgba(31, 53, 84, 0.08);
}

.network-kpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px;
}

.network-kpi-card--accent {
  background: rgba(240, 244, 255, 0.94);
}

.network-kpi-card--warm {
  background: rgba(255, 247, 235, 0.94);
}

.network-kpi-card span {
  display: block;
  color: #6a768a;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.network-kpi-card strong {
  display: block;
  margin-top: 7px;
  color: #162033;
  font-size: 1.65rem;
}

.network-alert {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  border-radius: 18px;
  padding: 14px 16px;
}

.network-alert--error {
  background: rgba(253, 236, 236, 0.94);
  color: #8f3333;
}

.network-alert--success {
  background: rgba(231, 248, 236, 0.94);
  color: #216b39;
}

.network-alert__close {
  border: 0;
  background: transparent;
  color: inherit;
  font-weight: 700;
  padding: 0;
}

.network-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.7fr);
  gap: 20px;
}

.network-editor-card,
.network-side-card {
  padding: 24px;
}

.network-editor-card__meta-grid,
.network-rank-card__grid,
.network-side-card__form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.network-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.network-field--wide {
  grid-column: 1 / -1;
}

.network-field__label {
  color: #283446;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.network-input {
  width: 100%;
  border: 1px solid #dbe4ef;
  border-radius: 16px;
  background: #fbfcfd;
  color: #172033;
  padding: 0.9rem 1rem;
}

.network-editor-card__tree-preview {
  margin-top: 18px;
  padding: 18px;
  border-radius: 22px;
  background: #f8fafc;
}

.network-tree {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.network-tree__level {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.network-tree__badge {
  color: #8c5f2c;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.network-tree__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.network-tree__chip {
  border-radius: 999px;
  background: rgba(186, 123, 47, 0.12);
  color: #7b4e21;
  padding: 0.45rem 0.8rem;
  font-size: 0.84rem;
  font-weight: 700;
}

.network-tree__chip--empty {
  background: rgba(32, 51, 79, 0.08);
  color: #5f6d83;
}

.network-ranks {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.network-ranks__header,
.network-rules__header,
.network-rank-card__top,
.network-simulation-result__row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.network-empty-state {
  border-radius: 18px;
  border: 1px dashed rgba(32, 51, 79, 0.14);
  padding: 18px;
  color: #607088;
}

.network-empty-state--compact {
  padding: 12px 14px;
  font-size: 0.9rem;
}

.network-rank-card {
  border-radius: 24px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: linear-gradient(180deg, #fff 0%, #fbfcfd 100%);
  padding: 18px;
}

.network-rank-card__remove {
  border: 0;
  background: rgba(182, 62, 62, 0.1);
  color: #a53333;
  font-weight: 700;
}

.network-rules {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(32, 51, 79, 0.08);
}

.network-rule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}

.network-rule-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) auto;
  gap: 12px;
  align-items: end;
}

.network-rank-card__remove--rule {
  min-height: 48px;
}

.network-simulation-result {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.network-simulation-result__summary {
  border-radius: 18px;
  background: #f7f9fb;
  padding: 16px;
}

.network-simulation-result__summary span,
.network-simulation-result__row small {
  color: #6a768a;
}

.network-simulation-result__summary strong,
.network-simulation-result__metrics strong {
  display: block;
  margin-top: 6px;
  color: #162033;
  font-size: 1.4rem;
}

.network-simulation-result__rows {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.network-simulation-result__row {
  border-radius: 18px;
  background: #f8fafc;
  padding: 14px;
}

.network-simulation-result__metrics {
  text-align: right;
}

@media (max-width: 1120px) {
  .network-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .network-section__header,
  .network-kpis,
  .network-editor-card__meta-grid,
  .network-rank-card__grid,
  .network-side-card__form,
  .network-rule-row,
  .network-ranks__header,
  .network-rules__header,
  .network-rank-card__top,
  .network-simulation-result__row,
  .network-alert {
    grid-template-columns: 1fr;
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>