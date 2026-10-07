<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Check, ChevronDown, Plus, RefreshCw, Save } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import { useWorkspaceNetworkApi } from '../composables/useWorkspaceNetworkApi'
import type { WorkspaceCommissionRule, WorkspaceNetworkConfigurationPayload } from '../types'

const props = withDefaults(defineProps<{
  empresaId?: number
  compact?: boolean
}>(), {
  compact: false,
})

const emit = defineEmits<{
  completionLoaded: [hasRanks: boolean]
  dirtyChange: [isDirty: boolean]
}>()

interface EditableRank {
  localId: string
  nombre_rango: string
  nivel: number
  orden_jerarquico: number
  max_distribuidores_directos: string | number
  limite_kits_credito: string | number
  es_rango_ingreso: boolean
  accesos_json: string[]
  reglas_comision: Array<{
    localId: string
    nivel_objetivo: string
    porcentaje_comision: string
  }>
}

interface AccessOption {
  slug: string
  label: string
  description: string
  badge: string
}

interface ReadonlyRankInput {
  readonly nombre_rango: string
  readonly nivel: number
  readonly orden_jerarquico: number
  readonly max_distribuidores_directos: number | null
  readonly limite_kits_credito: number
  readonly es_rango_ingreso: boolean
  readonly accesos_json?: readonly string[] | null
  readonly reglas_comision: ReadonlyArray<{
    readonly nivel_objetivo: number
    readonly porcentaje_comision: number
  }>
}

const {
  networkConfiguration,
  isLoading,
  isSaving,
  errorMessage,
  successMessage,
  validationErrors,
  clearMessages,
  fetchNetworkConfiguration,
  saveNetworkConfiguration,
} = useWorkspaceNetworkApi({ empresaId: props.empresaId })

const form = reactive({
  motivo_cambio: '',
  rangos: [] as EditableRank[],
})
const savedSnapshot = ref('')

const expandedRankIds = reactive(new Set<string>())
const accessPanelOpenIds = reactive(new Set<string>())

const accessOptions: readonly AccessOption[] = [
  {
    slug: 'solicitar_kits_empresa',
    label: 'Solicitar kits empresa',
    description: 'Habilita solicitud directa de kits al workspace cuando el nivel puede abastecerse desde empresa.',
    badge: 'Inventario',
  },
  {
    slug: 'asignar_stock_equipo',
    label: 'Asignar stock equipo',
    description: 'Permite abastecer distribuidores directos y gestionar stock descendente dentro de la red.',
    badge: 'Red',
  },
  {
    slug: 'registrar_ventas_consumidor_final',
    label: 'Registrar ventas',
    description: 'Mantiene activo el registro comercial móvil con evidencia y flujo de validación.',
    badge: 'Ventas',
  },
  {
    slug: 'acceso_reportes_equipo',
    label: 'Ver equipo y reportes',
    description: 'Expone métricas del equipo, miembros directos y vistas operativas ligadas a red comercial.',
    badge: 'Analítica',
  },
  {
    slug: 'acceso_promociones_exclusivas',
    label: 'Promociones exclusivas',
    description: 'Reserva beneficios premium y experiencias especiales cuando el nivel lo habilita.',
    badge: 'Premium',
  },
] as const

const accessOptionMap = new Map(accessOptions.map((option) => [option.slug, option]))

const nextRankId = () => `rank-${Math.random().toString(36).slice(2, 10)}`
const nextRuleId = () => `rule-${Math.random().toString(36).slice(2, 10)}`

const totalLevels = computed(() => form.rangos.length)
const normalizedDepth = computed(() => Math.max(1, totalLevels.value))

const sortedRanks = computed(() =>
  [...form.rangos].sort((left, right) => left.nivel - right.nivel),
)

const validationMessagesFor = (field: string): readonly string[] =>
  validationErrors.value[field] ?? []

const rankFieldMessages = (rank: EditableRank, field: string): readonly string[] => {
  const rankIndex = sortedRanks.value.indexOf(rank)
  return rankIndex < 0 ? [] : validationMessagesFor(`rangos.${rankIndex}.${field}`)
}

const rankSectionMessages = (rank: EditableRank): string[] => {
  const rankIndex = sortedRanks.value.indexOf(rank)
  if (rankIndex < 0) {
    return []
  }

  const fieldPrefix = `rangos.${rankIndex}.`
  const inlineFields = ['nombre_rango', 'max_distribuidores_directos', 'limite_kits_credito']

  return Object.entries(validationErrors.value)
    .filter(([field]) => field.startsWith(fieldPrefix)
      && !inlineFields.includes(field.slice(fieldPrefix.length)))
    .flatMap(([, messages]) => messages)
}

const networkSectionMessages = computed(() =>
  Object.entries(validationErrors.value)
    .filter(([field]) => field !== 'motivo_cambio' && !/^rangos\.\d+\./.test(field))
    .flatMap(([, messages]) => messages),
)

const displayRanks = computed(() => [...sortedRanks.value].reverse())

const previewLevels = computed(() =>
  [...sortedRanks.value].reverse().map((rank) => ({
    nivel: rank.nivel,
    nombre: rank.nombre_rango.trim() || `Nivel ${rank.nivel}`,
    ingreso: rank.nivel === 1,
    cima: rank.nivel === normalizedDepth.value,
  })),
)

const isEntryRank = (rank: EditableRank): boolean => rank.nivel === 1
const isTopRank = (rank: EditableRank): boolean => rank.nivel === normalizedDepth.value

const maxRuleTargetForRank = (rank: EditableRank): number =>
  Math.max(0, rank.nivel - 1)

const isRankExpanded = (localId: string) => expandedRankIds.has(localId)
const isAccessPanelOpen = (localId: string) => accessPanelOpenIds.has(localId)

const toggleRankPanel = (localId: string) => {
  if (expandedRankIds.has(localId)) {
    expandedRankIds.delete(localId)
    return
  }

  expandedRankIds.add(localId)
}

const toggleAccessPanel = (localId: string) => {
  if (accessPanelOpenIds.has(localId)) {
    accessPanelOpenIds.delete(localId)
    return
  }

  accessPanelOpenIds.add(localId)
}

const normalizeAccessList = (accesses?: readonly string[] | null): string[] => {
  if (!Array.isArray(accesses)) {
    return []
  }

  return [...new Set(
    accesses
      .map((item) => item.trim())
      .filter((item) => item.length > 0 && accessOptionMap.has(item)),
  )]
}

const ensureExpandedRanks = () => {
  if (form.rangos.length === 0) {
    expandedRankIds.clear()
    return
  }

  if (expandedRankIds.size === 0) {
    const topRank = displayRanks.value[0]
    if (topRank) {
      expandedRankIds.add(topRank.localId)
    }
  }

  for (const id of [...expandedRankIds]) {
    if (!form.rangos.some((rank) => rank.localId === id)) {
      expandedRankIds.delete(id)
    }
  }
}

const resequenceRanks = () => {
  const orderedRanks = [...form.rangos].sort((left, right) => left.nivel - right.nivel)

  orderedRanks.forEach((rank, index) => {
    rank.nivel = index + 1
    rank.orden_jerarquico = index + 1
    rank.es_rango_ingreso = index === 0

    const maxTarget = Math.max(0, index)
    rank.reglas_comision.forEach((rule) => {
      const currentTarget = Math.max(1, Number(rule.nivel_objetivo) || 1)
      rule.nivel_objetivo = maxTarget === 0 ? '1' : String(Math.min(maxTarget, currentTarget))
    })
  })

  form.rangos = orderedRanks
  ensureExpandedRanks()
}

const toEditableRank = (rank: ReadonlyRankInput): EditableRank => ({
  localId: nextRankId(),
  nombre_rango: rank.nombre_rango,
  nivel: rank.nivel,
  orden_jerarquico: rank.nivel,
  max_distribuidores_directos: rank.max_distribuidores_directos == null ? '' : String(rank.max_distribuidores_directos),
  limite_kits_credito: String(rank.limite_kits_credito),
  es_rango_ingreso: Boolean(rank.es_rango_ingreso),
  accesos_json: normalizeAccessList(rank.accesos_json),
  reglas_comision: (rank.reglas_comision ?? []).map((rule) => ({
    localId: nextRuleId(),
    nivel_objetivo: String(rule.nivel_objetivo),
    porcentaje_comision: String(rule.porcentaje_comision),
  })),
})

const syncFormFromApi = () => {
  form.motivo_cambio = ''
  form.rangos = (networkConfiguration.value?.rangos ?? []).map(toEditableRank)
  resequenceRanks()
}

watch(
  () => networkConfiguration.value,
  () => {
    syncFormFromApi()
  },
  { immediate: true },
)

const seedBaseRank = () => {
  if (form.rangos.length > 0) {
    return
  }

  const localId = nextRankId()

  form.rangos.push({
    localId,
    nombre_rango: 'Promotor',
    nivel: 1,
    orden_jerarquico: 1,
    max_distribuidores_directos: '',
    limite_kits_credito: '10',
    es_rango_ingreso: true,
    accesos_json: ['registrar_ventas_consumidor_final'],
    reglas_comision: [],
  })

  resequenceRanks()
  expandedRankIds.add(localId)
}

const addRank = () => {
  const nextLevel = form.rangos.length + 1
  const localId = nextRankId()

  form.rangos.push({
    localId,
    nombre_rango: '',
    nivel: nextLevel,
    orden_jerarquico: nextLevel,
    max_distribuidores_directos: '',
    limite_kits_credito: '0',
    es_rango_ingreso: false,
    accesos_json: [],
    reglas_comision: [],
  })

  resequenceRanks()
  expandedRankIds.add(localId)

  void nextTick(() => {
    document.querySelector<HTMLElement>(`[data-rank-id="${localId}"]`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  })
}

const removeRank = (localId: string) => {
  const rank = form.rangos.find((item) => item.localId === localId)
  if (rank?.nivel === 1) {
    return
  }

  form.rangos = form.rangos.filter((item) => item.localId !== localId)
  expandedRankIds.delete(localId)
  accessPanelOpenIds.delete(localId)
  resequenceRanks()
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

const toggleRankAccess = (rank: EditableRank, slug: string) => {
  if (rank.accesos_json.includes(slug)) {
    rank.accesos_json = rank.accesos_json.filter((item) => item !== slug)
    return
  }

  rank.accesos_json = [...rank.accesos_json, slug]
}

const selectedAccessOptions = (rank: EditableRank): AccessOption[] =>
  rank.accesos_json
    .map((slug) => accessOptionMap.get(slug))
    .filter((option): option is AccessOption => option !== undefined)

const editableNumberText = (value: string | number | null | undefined): string =>
  String(value ?? '')

const directLimitText = (rank: EditableRank): string =>
  editableNumberText(rank.max_distribuidores_directos).trim()

const directLimitLabel = (rank: EditableRank): string => {
  const value = directLimitText(rank)
  return value.length > 0 ? `${value} directos` : 'sin limite directo'
}

const kitLimitValue = (rank: EditableRank): number =>
  Math.max(0, Number(rank.limite_kits_credito) || 0)

const setRuleLevel = (rank: EditableRank, rule: EditableRank['reglas_comision'][number], rawValue: string): void => {
  const maxTarget = maxRuleTargetForRank(rank)
  const nextLevel = Math.max(1, Math.min(maxTarget, Number(rawValue) || 1))
  rule.nivel_objetivo = String(nextLevel)
}

const normalizePayload = (): WorkspaceNetworkConfigurationPayload => ({
  profundidad_maxima: normalizedDepth.value,
  motivo_cambio: form.motivo_cambio.trim() || null,
  rangos: sortedRanks.value.map((rank, index) => ({
    nombre_rango: rank.nombre_rango.trim(),
    nivel: index + 1,
    orden_jerarquico: index + 1,
    max_distribuidores_directos: directLimitText(rank).length > 0
      ? Math.max(1, Number(rank.max_distribuidores_directos) || 1)
      : null,
    limite_kits_credito: kitLimitValue(rank),
    es_rango_ingreso: index === 0,
    accesos_json: normalizeAccessList(rank.accesos_json),
    reglas_comision: index === 0
      ? []
      : rank.reglas_comision.map((rule): WorkspaceCommissionRule => ({
        nivel_objetivo: Math.max(1, Math.min(index, Number(rule.nivel_objetivo) || 1)),
        porcentaje_comision: Math.max(0, Number(rule.porcentaje_comision) || 0),
      })),
  })),
})

const isDirty = computed(() => savedSnapshot.value !== ''
  && JSON.stringify(normalizePayload()) !== savedSnapshot.value)

watch(isDirty, (value) => emit('dirtyChange', value), { immediate: true })

const refreshNetwork = async () => {
  await fetchNetworkConfiguration()
  await nextTick()
  savedSnapshot.value = JSON.stringify(normalizePayload())
  emit('completionLoaded', (networkConfiguration.value?.rangos.length ?? 0) > 0)
}

const handleSave = async () => {
  if (totalLevels.value < 1) {
    return
  }

  try {
    const configuration = await saveNetworkConfiguration(normalizePayload())
    await nextTick()
    savedSnapshot.value = JSON.stringify(normalizePayload())
    emit('completionLoaded', configuration.rangos.length > 0)
  } catch {
    return
  }
}

onMounted(() => {
  void refreshNetwork().catch(() => undefined)
})
</script>

<template>
  <div class="network-v2" :class="{ 'network-v2--compact': props.compact }">
    <header class="network-v2__toolbar">
      <div class="network-v2__toolbar-copy">
        <p class="network-v2__eyebrow">Modelo comercial</p>
        <h3 class="network-v2__title">Niveles comerciales y árbol de patrocinio</h3>
        <p class="network-v2__lede">
          Modelo de subida: N1 es el suelo (ingreso automático) y el último nivel configurado es la cima comercial. La cascada de comisiones asciende de N hacia N+1.
        </p>
      </div>

      <div class="network-v2__toolbar-actions">
        <AppButton variant="ghost" size="sm" :disabled="isLoading" @click="refreshNetwork">
          <template #leading>
            <RefreshCw class="size-4" />
          </template>
          {{ isLoading ? 'Sincronizando...' : 'Sincronizar' }}
        </AppButton>
        <AppButton variant="primary" size="sm" :disabled="isSaving || totalLevels < 1" @click="handleSave">
          <template #leading>
            <RefreshCw v-if="isSaving" class="size-4 animate-spin" />
            <Save v-else class="size-4" />
          </template>
          {{ isSaving ? 'Guardando...' : 'Guardar' }}
        </AppButton>
        <p v-if="totalLevels < 1" class="admin-alert admin-alert--error" role="alert">
          Agrega al menos un nivel
        </p>
      </div>
    </header>

    <div v-if="errorMessage" class="admin-alert admin-alert--error">
      {{ errorMessage }}
      <button type="button" class="admin-alert__close" @click="clearMessages">✕</button>
    </div>

    <div v-if="successMessage" class="admin-alert admin-alert--success">
      {{ successMessage }}
      <button type="button" class="admin-alert__close" @click="clearMessages">✕</button>
    </div>

    <section class="network-v2__panel network-v2__panel--intro">
      <div class="network-v2__intro-copy">
        <h4 class="network-v2__panel-title">Regla unificada</h4>
        <p class="network-v2__panel-desc">
          La profundidad máxima del árbol se deduce automáticamente por la cantidad de niveles creados.
          Si configuras 4 niveles comerciales, el árbol acepta como máximo 4 niveles de patrocinio.
        </p>
      </div>

      <div class="network-v2__intro-pill">
        <strong>{{ totalLevels }}</strong>
        <span>{{ totalLevels === 1 ? 'nivel activo' : 'niveles activos' }}</span>
      </div>
    </section>

    <label class="network-v2__motivo-bar">
      <span class="network-v2__label">Motivo del cambio (auditoría)</span>
      <input
        v-model="form.motivo_cambio"
        class="network-v2__input"
        type="text"
        maxlength="500"
        placeholder="Opcional — ej. Ajuste de jerarquía comercial Q2"
        :aria-invalid="validationMessagesFor('motivo_cambio').length > 0"
      />
      <span
        v-for="(message, index) in validationMessagesFor('motivo_cambio')"
        :key="`motivo-error-${index}`"
        class="admin-alert admin-alert--error"
        role="alert"
      >
        {{ message }}
      </span>
    </label>

    <section v-if="previewLevels.length > 0" class="network-v2__panel">
      <div class="network-v2__panel-head">
        <div>
          <h4 class="network-v2__panel-title">Secuencia comercial</h4>
          <p class="network-v2__panel-desc">Un nivel por escalón, de la cima comercial (N{{ normalizedDepth }}) al suelo de ingreso (N1).</p>
        </div>
      </div>

      <div class="network-v2__preview-track network-v2__preview-track--subida">
        <article
          v-for="level in previewLevels"
          :key="level.nivel"
          class="network-v2__preview-level"
          :class="{
            'network-v2__preview-level--entry': level.ingreso,
            'network-v2__preview-level--top': level.cima,
          }"
        >
          <span class="network-v2__preview-badge">N{{ level.nivel }}</span>
          <strong>{{ level.nombre }}</strong>
          <span>{{ level.ingreso ? 'Ingreso / suelo' : level.cima ? 'Cima / máximo' : 'Escalón intermedio' }}</span>
        </article>
      </div>
    </section>

    <section class="network-v2__panel">
      <div class="network-v2__panel-head">
        <div>
          <h4 class="network-v2__panel-title">Niveles comerciales</h4>
          <p class="network-v2__panel-desc">Cada nivel controla posición en jerarquía, permisos móviles, capacidad operativa y reglas de comisión.</p>
        </div>
        <AppButton type="button" variant="ghost" size="sm" @click="addRank">
          <template #leading>
            <Plus class="size-4" />
          </template>
          Agregar nivel
        </AppButton>
      </div>

      <div v-if="networkSectionMessages.length > 0" class="admin-alert admin-alert--error" role="alert">
        <p v-for="(message, index) in networkSectionMessages" :key="`network-error-${index}`">
          {{ message }}
        </p>
      </div>

      <div v-if="form.rangos.length === 0" class="network-v2__empty">
        <p>Sin niveles configurados. Crea N1 (Promotor) como suelo de ingreso para nuevos distribuidores.</p>
        <AppButton type="button" variant="secondary" size="sm" @click="seedBaseRank">
          Crear N1 Promotor
        </AppButton>
      </div>

      <div v-else class="network-v2__rank-list network-v2__rank-list--subida">
        <article
          v-for="rank in displayRanks"
          :key="rank.localId"
          :data-rank-id="rank.localId"
          class="network-v2__rank"
          :class="{ 'network-v2__rank--open': isRankExpanded(rank.localId) }"
        >
          <button
            type="button"
            class="network-v2__rank-toggle"
            :aria-expanded="isRankExpanded(rank.localId)"
            @click="toggleRankPanel(rank.localId)"
          >
            <span class="network-v2__rank-index">N{{ rank.nivel }}</span>
            <span class="network-v2__rank-summary">
              <strong>{{ rank.nombre_rango || `Nivel ${rank.nivel}` }}</strong>
              <span>
                {{ rank.reglas_comision.length }} reglas · {{ kitLimitValue(rank) }} kits · {{ directLimitLabel(rank) }}
              </span>
            </span>
            <span class="network-v2__rank-badges">
              <span v-if="isEntryRank(rank)" class="network-v2__tag network-v2__tag--root">Ingreso</span>
              <span v-if="isTopRank(rank)" class="network-v2__tag network-v2__tag--tone">Cima</span>
            </span>
            <ChevronDown class="network-v2__rank-chevron" />
          </button>

          <div v-show="isRankExpanded(rank.localId)" class="network-v2__rank-body">
            <div class="network-v2__rank-meta">
              <span class="network-v2__meta-pill">N{{ rank.nivel }}</span>
              <span class="network-v2__meta-text">
                {{ isEntryRank(rank)
                  ? 'Suelo de carrera: todo distribuidor nuevo ingresa aquí (N1 automático).'
                  : isTopRank(rank)
                    ? 'Cima comercial: mayor rango del modelo de subida.'
                    : 'Escalón intermedio dentro de la jerarquía ascendente.' }}
              </span>
            </div>

            <div v-if="rankSectionMessages(rank).length > 0" class="admin-alert admin-alert--error" role="alert">
              <p v-for="(message, index) in rankSectionMessages(rank)" :key="`rank-${rank.localId}-error-${index}`">
                {{ message }}
              </p>
            </div>

            <div class="network-v2__field-grid network-v2__field-grid--rank">
              <label class="network-v2__field network-v2__field--span-2">
                <span class="network-v2__label">Nombre del nivel</span>
                <input
                  v-model="rank.nombre_rango"
                  class="network-v2__input"
                  type="text"
                  maxlength="80"
                  :placeholder="isEntryRank(rank) ? 'Promotor' : isTopRank(rank) ? 'Master' : 'Supervisor'"
                  :aria-invalid="rankFieldMessages(rank, 'nombre_rango').length > 0"
                />
                <span
                  v-for="(message, index) in rankFieldMessages(rank, 'nombre_rango')"
                  :key="`rank-${rank.localId}-name-error-${index}`"
                  class="admin-alert admin-alert--error"
                  role="alert"
                >
                  {{ message }}
                </span>
              </label>

              <label class="network-v2__field network-v2__field--compact">
                <span class="network-v2__label">Máx. directos</span>
                <input
                  v-model="rank.max_distribuidores_directos"
                  class="network-v2__input network-v2__input--compact"
                  type="number"
                  min="1"
                  placeholder="Sin tope"
                  :aria-invalid="rankFieldMessages(rank, 'max_distribuidores_directos').length > 0"
                />
                <span
                  v-for="(message, index) in rankFieldMessages(rank, 'max_distribuidores_directos')"
                  :key="`rank-${rank.localId}-direct-error-${index}`"
                  class="admin-alert admin-alert--error"
                  role="alert"
                >
                  {{ message }}
                </span>
              </label>

              <label class="network-v2__field network-v2__field--compact">
                <span class="network-v2__label">Límite kits</span>
                <input
                  v-model="rank.limite_kits_credito"
                  class="network-v2__input network-v2__input--compact"
                  type="number"
                  min="0"
                  :aria-invalid="rankFieldMessages(rank, 'limite_kits_credito').length > 0"
                />
                <span
                  v-for="(message, index) in rankFieldMessages(rank, 'limite_kits_credito')"
                  :key="`rank-${rank.localId}-kits-error-${index}`"
                  class="admin-alert admin-alert--error"
                  role="alert"
                >
                  {{ message }}
                </span>
              </label>

              <div class="network-v2__field network-v2__field--full">
                <button
                  type="button"
                  class="network-v2__collapse-trigger"
                  @click="toggleAccessPanel(rank.localId)"
                >
                  Permisos en app móvil ({{ rank.accesos_json.length }})
                  <ChevronDown class="size-4" :class="{ 'network-v2__chevron--open': isAccessPanelOpen(rank.localId) }" />
                </button>
                <div v-show="isAccessPanelOpen(rank.localId)" class="network-v2__access-panel">
                  <div class="network-v2__access-head">
                    <p class="network-v2__access-title">Permisos oficiales</p>
                    <span class="network-v2__access-count">{{ rank.accesos_json.length }} activo(s)</span>
                  </div>

                  <div v-if="selectedAccessOptions(rank).length > 0" class="network-v2__access-chips">
                    <span
                      v-for="access in selectedAccessOptions(rank)"
                      :key="`${rank.localId}-${access.slug}-chip`"
                      class="network-v2__chip network-v2__chip--selected"
                    >
                      {{ access.label }}
                    </span>
                  </div>

                  <div class="network-v2__access-grid">
                    <button
                      v-for="access in accessOptions"
                      :key="`${rank.localId}-${access.slug}`"
                      type="button"
                      class="network-v2__access-card"
                      :class="{ 'network-v2__access-card--active': rank.accesos_json.includes(access.slug) }"
                      :aria-pressed="rank.accesos_json.includes(access.slug)"
                      @click="toggleRankAccess(rank, access.slug)"
                    >
                      <div class="network-v2__access-card-top">
                        <div class="network-v2__access-copy-block">
                          <span class="network-v2__access-badge">{{ access.badge }}</span>
                          <strong>{{ access.label }}</strong>
                        </div>
                        <span class="network-v2__access-check">
                          <Check class="size-3.5" />
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="network-v2__rules">
              <div class="network-v2__rules-head">
                <div>
                  <h5 class="network-v2__rules-title">Comisiones en cascada</h5>
                  <p class="network-v2__hint">Cascada ascendente: N1 es el suelo. Los niveles superiores pagan comisiones sobre ventas de niveles objetivo menores (N, N+1...).</p>
                </div>
                <AppButton
                  v-if="maxRuleTargetForRank(rank) > 0"
                  type="button"
                  variant="ghost"
                  size="sm"
                  @click="addRule(rank)"
                >
                  <template #leading>
                    <Plus class="size-3.5" />
                  </template>
                  Regla
                </AppButton>
              </div>

              <div v-if="rank.reglas_comision.length === 0" class="network-v2__empty network-v2__empty--inline">
                {{ isEntryRank(rank)
                  ? 'N1 no lleva reglas: es el punto de ingreso por defecto.'
                  : 'Sin reglas. Agrega al menos una para repartir comisiones por nivel objetivo.' }}
              </div>

              <div v-else class="network-v2__rules-table-wrap">
                <table class="network-v2__rules-table">
                  <thead>
                    <tr>
                      <th>Nivel objetivo</th>
                      <th>% comisión</th>
                      <th aria-label="Acciones" />
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="rule in rank.reglas_comision" :key="rule.localId">
                      <td>
                        <input
                          :value="rule.nivel_objetivo"
                          class="network-v2__input network-v2__input--table"
                          type="number"
                          min="1"
                          :max="maxRuleTargetForRank(rank)"
                          @input="setRuleLevel(rank, rule, ($event.target as HTMLInputElement).value)"
                        />
                      </td>
                      <td>
                        <input v-model="rule.porcentaje_comision" class="network-v2__input network-v2__input--table" type="number" min="0" max="100" step="0.01" />
                      </td>
                      <td class="network-v2__rules-action">
                        <button type="button" class="network-v2__link-danger" @click="removeRule(rank, rule.localId)">
                          Quitar
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-if="!isEntryRank(rank)" class="network-v2__rank-footer">
              <button type="button" class="network-v2__link-danger" @click="removeRank(rank.localId)">
                Eliminar nivel
              </button>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.network-v2__preview-track--subida {
  align-items: stretch;
}

.network-v2__preview-level--top {
  border-color: rgba(77, 124, 15, 0.28);
  background: #f7fee7;
}

.network-v2__rank-list--subida {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.network-v2 {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.network-v2__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.network-v2__eyebrow {
  margin: 0;
  color: #5e7898;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.network-v2__title {
  margin: 2px 0 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #17314f;
}

.network-v2__lede {
  margin: 3px 0 0;
  font-size: 13px;
  color: #64748b;
  max-width: 54ch;
}

.network-v2__toolbar-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.network-v2__panel {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  padding: 12px;
}

.network-v2__panel--intro {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.network-v2__panel-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}

.network-v2__panel-title {
  margin: 0;
  font-size: 0.98rem;
  color: #17314f;
}

.network-v2__panel-desc {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.network-v2__intro-pill {
  min-width: 124px;
  padding: 10px 12px;
  border-radius: 12px;
  background: linear-gradient(135deg, #0f172a, #1e3a5f);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.network-v2__intro-pill strong {
  font-size: 1.35rem;
  line-height: 1;
}

.network-v2__intro-pill span {
  margin-top: 4px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.82);
}

.network-v2__motivo-bar {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.network-v2__label {
  font-size: 12px;
  font-weight: 700;
  color: #334155;
}

.network-v2__input {
  width: 100%;
  border: 1px solid #dbe3ee;
  border-radius: 10px;
  padding: 9px 11px;
  font-size: 13px;
  color: #0f172a;
  background: #fff;
  box-sizing: border-box;
}

.network-v2__input:focus {
  outline: none;
  border-color: #1d4ed8;
  box-shadow: 0 0 0 3px rgba(29, 78, 216, 0.12);
}

.network-v2__preview-track {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 8px;
}

.network-v2__preview-level {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 10px 11px;
  border-radius: 12px;
  border: 1px solid #dbe3ee;
  background: #f8fafc;
}

.network-v2__preview-level--entry {
  border-color: rgba(29, 78, 216, 0.24);
  background: #eff6ff;
}

.network-v2__preview-badge {
  width: fit-content;
  border-radius: 999px;
  background: #0f172a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
}

.network-v2__preview-level strong {
  color: #17314f;
  font-size: 14px;
}

.network-v2__preview-level span:last-child {
  color: #64748b;
  font-size: 12px;
  line-height: 1.35;
}

.network-v2__hierarchy-stack {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.network-v2__hierarchy-card {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px 12px;
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.network-v2__hierarchy-topline {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #64748b;
}

.network-v2__hierarchy-card strong {
  color: #17314f;
}

.network-v2__hierarchy-card span:last-child {
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.network-v2__empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.network-v2__empty p {
  margin: 0;
  color: #475569;
  line-height: 1.45;
}

.network-v2__empty--inline {
  padding: 12px;
}

.network-v2__rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.network-v2__rank {
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.network-v2__rank--open {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.network-v2__rank-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 0;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.network-v2__rank-index {
  flex-shrink: 0;
  min-width: 44px;
  padding: 6px 8px;
  border-radius: 999px;
  background: #e8f0fb;
  color: #1d4ed8;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
}

.network-v2__rank-summary {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.network-v2__rank-summary strong {
  color: #17314f;
}

.network-v2__rank-summary span {
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.network-v2__rank-badges {
  margin-left: auto;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.network-v2__tag {
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
}

.network-v2__tag--root {
  background: #dbeafe;
  color: #1d4ed8;
}

.network-v2__tag--tone {
  background: #ecfccb;
  color: #4d7c0f;
}

.network-v2__rank-chevron {
  width: 16px;
  height: 16px;
  color: #64748b;
  flex-shrink: 0;
}

.network-v2__rank-body {
  padding: 0 12px 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.network-v2__rank-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.network-v2__meta-pill {
  border-radius: 999px;
  padding: 4px 8px;
  background: #0f172a;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.network-v2__meta-text {
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.network-v2__field-grid {
  display: grid;
  gap: 10px;
}

.network-v2__field-grid--rank {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.network-v2__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.network-v2__field--span-2,
.network-v2__field--full {
  grid-column: 1 / -1;
}

.network-v2__input--compact,
.network-v2__input--table {
  padding-top: 8px;
  padding-bottom: 8px;
}

.network-v2__collapse-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 9px 11px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.network-v2__chevron--open {
  transform: rotate(180deg);
}

.network-v2__access-panel {
  margin-top: 8px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px;
  background: #f8fafc;
}

.network-v2__access-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.network-v2__access-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #17314f;
}

.network-v2__access-count {
  font-size: 12px;
  color: #64748b;
}

.network-v2__access-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 10px;
}

.network-v2__chip {
  border-radius: 999px;
  padding: 5px 9px;
  font-size: 11px;
  font-weight: 700;
}

.network-v2__chip--selected {
  background: #dbeafe;
  color: #1d4ed8;
}

.network-v2__access-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 8px;
}

.network-v2__access-card {
  border: 1px solid #dbe3ee;
  border-radius: 12px;
  padding: 10px;
  background: #fff;
  text-align: left;
  cursor: pointer;
}

.network-v2__access-card--active {
  border-color: rgba(29, 78, 216, 0.4);
  background: #eff6ff;
}

.network-v2__access-card-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.network-v2__access-copy-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.network-v2__access-badge {
  width: fit-content;
  border-radius: 999px;
  padding: 3px 8px;
  background: #e2e8f0;
  color: #475569;
  font-size: 10px;
  font-weight: 700;
}

.network-v2__access-copy-block strong {
  color: #17314f;
  font-size: 13px;
}

.network-v2__access-check {
  color: #1d4ed8;
  opacity: 0;
}

.network-v2__access-card--active .network-v2__access-check {
  opacity: 1;
}

.network-v2__rules {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.network-v2__rules-head {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.network-v2__rules-title {
  margin: 0;
  color: #17314f;
  font-size: 0.93rem;
}

.network-v2__hint {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.network-v2__rules-table-wrap {
  overflow-x: auto;
}

.network-v2__rules-table {
  width: 100%;
  border-collapse: collapse;
}

.network-v2__rules-table th,
.network-v2__rules-table td {
  padding: 8px 6px;
  border-bottom: 1px solid #e2e8f0;
  text-align: left;
  vertical-align: middle;
}

.network-v2__rules-table th {
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.network-v2__rules-action {
  width: 84px;
}

.network-v2__rank-footer {
  display: flex;
  justify-content: flex-end;
}

.network-v2__link-danger {
  border: 0;
  background: transparent;
  color: #dc2626;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 720px) {
  .network-v2__panel--intro,
  .network-v2__panel-head,
  .network-v2__toolbar,
  .network-v2__rules-head {
    flex-direction: column;
    align-items: stretch;
  }

  .network-v2__field-grid--rank {
    grid-template-columns: 1fr;
  }

  .network-v2__rank-toggle {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .network-v2__rank-badges {
    margin-left: 0;
  }
}
</style>
