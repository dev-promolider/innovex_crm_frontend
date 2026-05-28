<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { CheckCircle2, KeyRound, RefreshCw, Search, ShieldAlert, UserRoundPlus } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import type {
  WorkspaceCommissionRule,
  WorkspaceFounderConfiguration,
  WorkspaceFounderCreateUserPayload,
  WorkspaceFounderRegistrationResult,
  WorkspaceFounderUserCandidate,
  WorkspaceFounderRegistrationPayload,
  WorkspaceNetworkRank,
} from '../types'

type FounderRankView = Readonly<Omit<WorkspaceNetworkRank, 'accesos_json' | 'reglas_comision'>> & {
  accesos_json?: readonly string[] | null
  reglas_comision: readonly WorkspaceCommissionRule[]
}

type FounderConfigurationView = Omit<WorkspaceFounderConfiguration, 'rangos_disponibles'> & {
  rangos_disponibles: readonly FounderRankView[]
}

const props = defineProps<{
  founderConfig: FounderConfigurationView | null
  userCandidates: readonly WorkspaceFounderUserCandidate[]
  registrationResult: WorkspaceFounderRegistrationResult | null
  loading: boolean
  searchingUsers: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  refresh: []
  searchUsers: [query: string]
  submit: [payload: WorkspaceFounderRegistrationPayload]
}>()

const form = reactive<WorkspaceFounderRegistrationPayload>({
  usuario_id: undefined,
  rango_id: 0,
})

type FounderUserMode = 'existing' | 'new'

const userMode = shallowRef<FounderUserMode>('existing')
const newUser = reactive<WorkspaceFounderCreateUserPayload>({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  tipo_documento: 'dni',
  numero_documento: '',
  direccion: '',
  password_temporal: '',
})

const searchQuery = shallowRef('')

watch(
  () => props.founderConfig,
  (nextConfig) => {
    if (!nextConfig || nextConfig.fundador) {
      return
    }

    userMode.value = 'existing'
    form.usuario_id = undefined
    form.rango_id = nextConfig.rangos_disponibles[0]?.id ?? 0
    newUser.nombre = ''
    newUser.apellido = ''
    newUser.email = ''
    newUser.telefono = ''
    newUser.tipo_documento = 'dni'
    newUser.numero_documento = ''
    newUser.direccion = ''
    newUser.password_temporal = ''
  },
  { immediate: true },
)

const selectedRankLabel = computed(() => {
  if (!props.founderConfig) {
    return 'Selecciona un rango para continuar.'
  }

  const selectedRank = props.founderConfig.rangos_disponibles.find((rank) => rank.id === form.rango_id)

  if (!selectedRank) {
    return 'Selecciona un rango para continuar.'
  }

  return `${selectedRank.nombre_rango} · Nivel ${selectedRank.nivel}`
})

const canSubmitNewUser = computed(() => (
  newUser.nombre.trim().length > 0
  && newUser.apellido.trim().length > 0
  && newUser.email.trim().length > 0
))

const canSubmit = computed(() => (
  !!props.founderConfig?.puede_registrar
  && form.rango_id > 0
  && (userMode.value === 'existing'
    ? (form.usuario_id ?? 0) > 0
    : canSubmitNewUser.value)
))

const deliveryCredentials = computed(() => props.registrationResult?.credenciales_entrega ?? null)

const founderStatusLabel = computed(() => {
  if (!props.founderConfig) {
    return 'Sincronizando configuracion del fundador...'
  }

  if (props.founderConfig.fundador) {
    return 'El patrocinador fundador ya fue registrado.'
  }

  return 'Esta empresa todavia no tiene patrocinador fundador registrado.'
})

const handleSearch = () => {
  emit('searchUsers', searchQuery.value)
}

const handleSubmit = () => {
  if (!canSubmit.value) {
    return
  }

  if (userMode.value === 'new') {
    emit('submit', {
      rango_id: form.rango_id,
      usuario_nuevo: {
        nombre: newUser.nombre.trim(),
        apellido: newUser.apellido.trim(),
        email: newUser.email.trim(),
        telefono: newUser.telefono?.trim() || null,
        tipo_documento: newUser.tipo_documento?.trim() || null,
        numero_documento: newUser.numero_documento?.trim() || null,
        direccion: newUser.direccion?.trim() || null,
        password_temporal: newUser.password_temporal?.trim() || null,
      },
    })

    return
  }

  emit('submit', {
    usuario_id: form.usuario_id,
    rango_id: form.rango_id,
  })
}
</script>

<template>
  <div class="founder-v2">
    <header class="founder-v2__toolbar">
      <div>
        <p class="founder-v2__eyebrow">Fundador</p>
        <h3 class="founder-v2__title">Patrocinador fundador del arbol</h3>
        <p class="founder-v2__subtitle">Define manualmente el primer patrocinador de la red. Solo puede existir un fundador inicial por empresa.</p>
      </div>

      <AppButton variant="ghost" size="sm" :disabled="loading" @click="emit('refresh')">
        <template #leading>
          <RefreshCw class="size-4" />
        </template>
        {{ loading ? 'Cargando...' : 'Actualizar' }}
      </AppButton>
    </header>

    <section class="founder-v2__status" :class="{ 'founder-v2__status--ready': founderConfig?.fundador }">
      <component :is="founderConfig?.fundador ? CheckCircle2 : ShieldAlert" class="founder-v2__status-icon" />
      <div>
        <strong>{{ founderStatusLabel }}</strong>
        <p>
          <template v-if="founderConfig?.fundador">
            {{ founderConfig.fundador.usuario.nombre }} {{ founderConfig.fundador.usuario.apellido }} opera como raiz con {{ founderConfig.fundador.rango.nombre_rango }}.
          </template>
          <template v-else>
            Puedes registrarlo aunque la empresa ya este activa, siempre que todavia no exista un fundador inicial. Queda sin patrocinador directo.
          </template>
        </p>
      </div>
    </section>

    <section v-if="deliveryCredentials" class="founder-v2__panel founder-v2__panel--credentials">
      <div class="founder-v2__panel-head founder-v2__panel-head--compact">
        <div>
          <h4 class="founder-v2__panel-title">Credenciales para entregar</h4>
          <p class="founder-v2__panel-desc">Este usuario fue creado desde esta pantalla. Comparte estas credenciales iniciales con el patrocinador fundador.</p>
        </div>
        <KeyRound class="founder-v2__credential-icon" />
      </div>

      <div class="founder-v2__summary-grid founder-v2__summary-grid--credentials">
        <div class="founder-v2__summary-item">
          <span class="founder-v2__summary-label">Correo de acceso</span>
          <strong>{{ deliveryCredentials.email }}</strong>
        </div>
        <div class="founder-v2__summary-item">
          <span class="founder-v2__summary-label">Clave temporal</span>
          <strong>{{ deliveryCredentials.password_temporal }}</strong>
        </div>
      </div>
    </section>

    <section v-if="founderConfig?.fundador" class="founder-v2__panel founder-v2__panel--summary">
      <div class="founder-v2__summary-grid">
        <div class="founder-v2__summary-item">
          <span class="founder-v2__summary-label">Usuario</span>
          <strong>{{ founderConfig.fundador.usuario.nombre }} {{ founderConfig.fundador.usuario.apellido }}</strong>
          <span>{{ founderConfig.fundador.usuario.email || 'Correo no disponible' }}</span>
        </div>
        <div class="founder-v2__summary-item">
          <span class="founder-v2__summary-label">Rango elegido</span>
          <strong>{{ founderConfig.fundador.rango.nombre_rango }}</strong>
          <span>Nivel {{ founderConfig.fundador.rango.nivel }}</span>
        </div>
        <div class="founder-v2__summary-item">
          <span class="founder-v2__summary-label">Estado</span>
          <strong>{{ founderConfig.fundador.estado_validacion }}</strong>
          <span>Nodo raiz · nivel en arbol {{ founderConfig.fundador.nivel_en_arbol }}</span>
        </div>
      </div>
    </section>

    <form v-else-if="founderConfig?.puede_registrar" class="founder-v2__form" @submit.prevent="handleSubmit">
      <section class="founder-v2__panel">
        <div class="founder-v2__panel-head">
          <h4 class="founder-v2__panel-title">Origen del fundador</h4>
          <p class="founder-v2__panel-desc">Puedes asignar un usuario existente o crear al patrocinador inicial directamente desde esta configuracion.</p>
        </div>

        <div class="founder-v2__mode-switch" role="tablist" aria-label="Modo de registro del fundador">
          <button
            type="button"
            class="founder-v2__mode-btn"
            :class="{ 'founder-v2__mode-btn--active': userMode === 'existing' }"
            @click="userMode = 'existing'"
          >
            Asignar usuario existente
          </button>
          <button
            type="button"
            class="founder-v2__mode-btn"
            :class="{ 'founder-v2__mode-btn--active': userMode === 'new' }"
            @click="userMode = 'new'"
          >
            Crear usuario nuevo
          </button>
        </div>

        <template v-if="userMode === 'existing'">
          <div class="founder-v2__panel-head founder-v2__panel-head--compact">
            <div>
              <h4 class="founder-v2__panel-title">Buscar usuario</h4>
              <p class="founder-v2__panel-desc">Busca por nombre, correo o documento y luego selecciona quien iniciara la red comercial.</p>
            </div>
          </div>

          <div class="founder-v2__search-row">
            <div class="founder-v2__search-box">
              <Search class="founder-v2__search-icon" />
              <input v-model="searchQuery" class="founder-v2__search-input" type="text" placeholder="Buscar usuario por nombre, correo o documento" />
            </div>

            <AppButton type="button" variant="ghost" size="sm" :disabled="searchingUsers" @click="handleSearch">
              {{ searchingUsers ? 'Buscando...' : 'Buscar' }}
            </AppButton>
          </div>

          <div class="founder-v2__candidate-list">
            <label
              v-for="candidate in userCandidates"
              :key="candidate.id"
              class="founder-v2__candidate"
              :class="{ 'founder-v2__candidate--active': form.usuario_id === candidate.id }"
            >
              <input v-model="form.usuario_id" class="founder-v2__candidate-input" type="radio" name="founder-user" :value="candidate.id" />
              <div class="founder-v2__candidate-copy">
                <strong>{{ candidate.nombre_completo }}</strong>
                <span>{{ candidate.email }}</span>
                <small>Documento {{ candidate.numero_documento }} · {{ candidate.membresias_activas_count }} membresias activas</small>
              </div>
            </label>

            <div v-if="!searchingUsers && userCandidates.length === 0" class="founder-v2__empty">
              No hay usuarios para mostrar. Ejecuta una busqueda o crea primero la cuenta del operador.
            </div>
          </div>
        </template>

        <div v-else class="founder-v2__form-grid founder-v2__form-grid--two">
          <label class="founder-v2__form-group">
            <span class="founder-v2__form-label">Nombre</span>
            <input v-model="newUser.nombre" class="founder-v2__form-input" type="text" placeholder="Nombre del fundador" />
          </label>
          <label class="founder-v2__form-group">
            <span class="founder-v2__form-label">Apellido</span>
            <input v-model="newUser.apellido" class="founder-v2__form-input" type="text" placeholder="Apellido del fundador" />
          </label>
          <label class="founder-v2__form-group founder-v2__form-group--full">
            <span class="founder-v2__form-label">Correo</span>
            <input v-model="newUser.email" class="founder-v2__form-input" type="email" placeholder="correo@empresa.com" />
          </label>
          <label class="founder-v2__form-group">
            <span class="founder-v2__form-label">Telefono</span>
            <input v-model="newUser.telefono" class="founder-v2__form-input" type="text" placeholder="Telefono de contacto" />
          </label>
          <label class="founder-v2__form-group">
            <span class="founder-v2__form-label">Tipo de documento</span>
            <input v-model="newUser.tipo_documento" class="founder-v2__form-input" type="text" placeholder="dni" />
          </label>
          <label class="founder-v2__form-group">
            <span class="founder-v2__form-label">Numero de documento</span>
            <input v-model="newUser.numero_documento" class="founder-v2__form-input" type="text" placeholder="Documento" />
          </label>
          <label class="founder-v2__form-group">
            <span class="founder-v2__form-label">Clave temporal</span>
            <input v-model="newUser.password_temporal" class="founder-v2__form-input" type="text" placeholder="Si lo dejas vacio, se genera una" />
          </label>
          <label class="founder-v2__form-group founder-v2__form-group--full">
            <span class="founder-v2__form-label">Direccion</span>
            <input v-model="newUser.direccion" class="founder-v2__form-input" type="text" placeholder="Direccion del fundador" />
          </label>
        </div>
      </section>

      <section class="founder-v2__panel">
        <div class="founder-v2__panel-head">
          <h4 class="founder-v2__panel-title">Rango inicial</h4>
          <p class="founder-v2__panel-desc">Elige el rango y nivel de negocio con el que operara el fundador desde el primer dia.</p>
        </div>

        <div class="founder-v2__rank-grid">
          <label
            v-for="rank in founderConfig.rangos_disponibles"
            :key="rank.id"
            class="founder-v2__rank-card"
            :class="{ 'founder-v2__rank-card--active': form.rango_id === rank.id }"
          >
            <input v-model="form.rango_id" class="founder-v2__candidate-input" type="radio" name="founder-rank" :value="rank.id" />
            <strong>{{ rank.nombre_rango }}</strong>
            <span>Nivel {{ rank.nivel }}</span>
            <small>{{ rank.limite_kits_credito }} kits de credito</small>
          </label>
        </div>

        <p class="founder-v2__selection-note">{{ selectedRankLabel }}</p>
      </section>

      <div class="founder-v2__footer">
        <AppButton type="submit" variant="primary" :disabled="!canSubmit || saving">
          <template #leading>
            <UserRoundPlus class="size-4" />
          </template>
          {{ saving ? 'Registrando...' : 'Registrar fundador' }}
        </AppButton>
      </div>
    </form>
  </div>
</template>

<style scoped>
.founder-v2 {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.founder-v2__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.founder-v2__eyebrow {
  margin: 0;
  color: #5e7898;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.founder-v2__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #17314f;
}

.founder-v2__subtitle {
  margin: 8px 0 0;
  color: #60758d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.founder-v2__status,
.founder-v2__panel {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}

.founder-v2__status {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 12px;
  padding: 16px 18px;
  background: linear-gradient(135deg, rgba(255, 244, 228, 0.72), rgba(255, 250, 243, 0.98));
  border-color: rgba(184, 112, 33, 0.2);
}

.founder-v2__status--ready {
  background: linear-gradient(135deg, rgba(231, 248, 238, 0.88), rgba(248, 255, 251, 0.98));
  border-color: rgba(16, 143, 93, 0.18);
}

.founder-v2__status strong {
  display: block;
  color: #18324f;
}

.founder-v2__status p {
  margin: 4px 0 0;
  color: #5d7288;
  font-size: 13px;
  line-height: 1.45;
}

.founder-v2__status-icon {
  width: 18px;
  height: 18px;
  color: #ad661d;
}

.founder-v2__status--ready .founder-v2__status-icon {
  color: #11825a;
}

.founder-v2__panel {
  padding: 18px;
}

.founder-v2__panel--credentials {
  border-color: rgba(31, 122, 224, 0.16);
  background: linear-gradient(135deg, rgba(233, 244, 255, 0.95), rgba(248, 252, 255, 0.98));
}

.founder-v2__panel-head {
  margin-bottom: 14px;
}

.founder-v2__panel-head--compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.founder-v2__panel-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #172033;
}

.founder-v2__panel-desc {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}

.founder-v2__summary-grid,
.founder-v2__rank-grid {
  display: grid;
  gap: 12px;
}

.founder-v2__summary-grid--credentials {
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.founder-v2__summary-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.founder-v2__summary-item {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid rgba(148, 163, 184, 0.16);
}

.founder-v2__summary-item strong {
  color: #17314f;
}

.founder-v2__summary-item span {
  color: #60758d;
  font-size: 13px;
}

.founder-v2__summary-label {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.founder-v2__search-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.founder-v2__mode-switch {
  display: inline-flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.founder-v2__mode-btn {
  border: 1px solid #d6dfeb;
  background: #f8fafc;
  color: #35506e;
  border-radius: 999px;
  padding: 10px 14px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.founder-v2__mode-btn--active {
  border-color: rgba(31, 122, 224, 0.22);
  background: linear-gradient(135deg, rgba(229, 241, 255, 0.92), rgba(245, 250, 255, 0.98));
  color: #0f4f8f;
}

.founder-v2__search-box {
  flex: 1 1 280px;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 0 14px;
  border: 1px solid #d6dfeb;
  border-radius: 12px;
  background: #fff;
}

.founder-v2__search-icon {
  width: 14px;
  height: 14px;
  color: #7b8ca1;
}

.founder-v2__search-input {
  width: 100%;
  border: none;
  background: transparent;
  font: inherit;
  color: #17314f;
}

.founder-v2__search-input:focus {
  outline: none;
}

.founder-v2__candidate-list,
.founder-v2__rank-grid {
  margin-top: 14px;
}

.founder-v2__form-grid {
  display: grid;
  gap: 14px;
}

.founder-v2__form-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.founder-v2__form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.founder-v2__form-group--full {
  grid-column: 1 / -1;
}

.founder-v2__form-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.founder-v2__form-input {
  width: 100%;
  min-width: 0;
  border: 1px solid #d6dfeb;
  border-radius: 12px;
  background: #fff;
  padding: 10px 12px;
  font: inherit;
  color: #17314f;
}

.founder-v2__form-input:focus {
  outline: none;
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.founder-v2__candidate,
.founder-v2__rank-card {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid #dfe7f1;
  background: #fbfdff;
  cursor: pointer;
}

.founder-v2__candidate--active,
.founder-v2__rank-card--active {
  border-color: rgba(31, 122, 224, 0.22);
  background: linear-gradient(135deg, rgba(229, 241, 255, 0.92), rgba(245, 250, 255, 0.98));
  box-shadow: 0 10px 24px rgba(31, 122, 224, 0.08);
}

.founder-v2__candidate-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.founder-v2__candidate-copy,
.founder-v2__rank-card {
  color: #17314f;
}

.founder-v2__candidate-copy span,
.founder-v2__candidate-copy small,
.founder-v2__rank-card span,
.founder-v2__rank-card small,
.founder-v2__selection-note,
.founder-v2__empty {
  color: #60758d;
  font-size: 13px;
  line-height: 1.45;
}

.founder-v2__rank-grid {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}

.founder-v2__selection-note {
  margin: 14px 0 0;
}

.founder-v2__footer {
  display: flex;
  justify-content: flex-end;
}

.founder-v2__empty {
  padding: 14px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  background: #f8fafc;
}

.founder-v2__credential-icon {
  width: 18px;
  height: 18px;
  color: #1a6ab5;
}

@media (max-width: 720px) {
  .founder-v2__form-grid--two {
    grid-template-columns: 1fr;
  }

  .founder-v2__footer {
    justify-content: stretch;
  }

  .founder-v2__footer :deep(.app-button) {
    width: 100%;
  }
}
</style>
