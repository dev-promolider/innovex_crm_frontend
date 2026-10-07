<script setup lang="ts">
import { computed, reactive, shallowRef, watch } from 'vue'
import { ArrowLeft, ArrowRight, Check, KeyRound, LockKeyhole, RefreshCw, Search, UserRoundPlus } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import PhoneInput from '@/components/shared/PhoneInput.vue'
import type {
  WorkspaceCommissionRule,
  WorkspaceFounderConfiguration,
  WorkspaceFounderCreateUserPayload,
  WorkspaceFounderRegistrationResult,
  WorkspaceFounderUserCandidate,
  WorkspaceFounderRegistrationPayload,
  WorkspaceNetworkRank,
} from '../types'
import type { ProfileDocumentType } from '@/features/profile/types'

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
  errorMessage: string
  fieldErrors: Record<string, string>
  successMessage: string
}>()

const emit = defineEmits<{
  refresh: []
  searchUsers: [query: string]
  submit: [payload: WorkspaceFounderRegistrationPayload]
  goToRanks: []
  clearFieldError: [field: string]
}>()

type FounderUserMode = 'existing' | 'new'
type FounderStep = 1 | 2 | 3

const form = reactive<WorkspaceFounderRegistrationPayload>({
  usuario_id: undefined,
  rango_id: 0,
})
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
const step = shallowRef<FounderStep>(1)
const startWizard = shallowRef(false)
const touched = reactive<Record<string, boolean>>({})

const documentTypes: Array<{ value: ProfileDocumentType; label: string }> = [
  { value: 'dni', label: 'DNI' },
  { value: 'cedula', label: 'Cédula' },
  { value: 'pasaporte', label: 'Pasaporte' },
  { value: 'ruc', label: 'RUC' },
  { value: 'otro', label: 'Otro' },
]

const availableRanks = computed(() => props.founderConfig?.rangos_disponibles ?? [])
const selectedRank = computed(() => availableRanks.value.find((rank) => rank.id === form.rango_id) ?? null)
const selectedCandidate = computed(() => props.userCandidates.find((candidate) => candidate.id === form.usuario_id) ?? null)
const hasRanks = computed(() => availableRanks.value.length > 0)
const fullNewUserName = computed(() => [newUser.nombre, newUser.apellido].map((part) => part?.trim()).filter(Boolean).join(' '))
const documentNumberError = computed(() => {
  const documentType = newUser.tipo_documento as ProfileDocumentType
  const number = (newUser.numero_documento ?? '').trim()
  if (!number) return ''

  const valid = documentType === 'dni'
    ? /^\d{8}$/.test(number)
    : documentType === 'cedula'
      ? /^\d{6,10}$/.test(number)
      : /^[a-zA-Z0-9]{5,20}$/.test(number)

  if (valid) return ''
  if (documentType === 'dni') return 'El DNI debe tener exactamente 8 dígitos.'
  if (documentType === 'cedula') return 'La cédula debe tener de 6 a 10 dígitos.'
  return 'El número debe tener de 5 a 20 caracteres alfanuméricos.'
})

const fieldError = (field: string) => {
  const rootField = field.startsWith('usuario_nuevo.') ? field.slice('usuario_nuevo.'.length) : field
  return props.fieldErrors[field] ?? props.fieldErrors[rootField] ?? ''
}
const newUserIsValid = computed(() => (
  Boolean(newUser.nombre?.trim())
  && Boolean(newUser.apellido?.trim())
  && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email?.trim() ?? '')
  && Boolean(newUser.telefono?.trim())
  && Boolean(newUser.numero_documento?.trim())
  && !documentNumberError.value
  && !Object.keys(props.fieldErrors).some((field) =>
    field.startsWith('usuario_nuevo.')
    || ['nombre', 'apellido', 'email', 'telefono', 'tipo_documento', 'numero_documento'].includes(field),
  )
))

const canContinueFromPerson = computed(() => userMode.value === 'existing'
  ? (form.usuario_id ?? 0) > 0
  : newUserIsValid.value)
const canSubmit = computed(() => Boolean(
  props.founderConfig?.puede_registrar
  && selectedRank.value?.id
  && canContinueFromPerson.value,
))
const deliveryCredentials = computed(() => props.registrationResult?.credenciales_entrega ?? null)
const founderRecord = computed(() => props.founderConfig?.fundador ?? props.registrationResult ?? null)
const founderRegistered = computed(() => founderRecord.value !== null)
const founderName = computed(() => {
  const founder = founderRecord.value?.usuario
  return [founder?.nombre, founder?.apellido].filter(Boolean).join(' ') || 'Fundador'
})
const founderInitials = computed(() => founderName.value.split(/\s+/).filter(Boolean).slice(0, 2)
  .map((part) => part.charAt(0).toLocaleUpperCase()).join(''))
const ranksByLevel = computed(() => {
  const groups = new Map<number, string[]>()
  for (const rank of availableRanks.value) {
    const names = groups.get(rank.nivel) ?? []
    names.push(rank.nombre_rango)
    groups.set(rank.nivel, names)
  }
  return [...groups.entries()].sort(([first], [second]) => first - second)
})

watch(
  () => props.founderConfig,
  (nextConfig) => {
    if (!nextConfig || nextConfig.fundador) return
    form.usuario_id = undefined
    form.rango_id = nextConfig.rangos_disponibles[0]?.id ?? 0
  },
  { immediate: true },
)

const start = () => {
  startWizard.value = true
  step.value = 1
}

const searchUsers = () => emit('searchUsers', searchQuery.value.trim())

const goToNextStep = () => {
  if (step.value === 1 && canContinueFromPerson.value) step.value = 2
  else if (step.value === 2 && hasRanks.value && selectedRank.value) step.value = 3
}

const goToPreviousStep = () => {
  if (step.value > 1) step.value = (step.value - 1) as FounderStep
}

const markTouched = (field: string) => {
  touched[field] = true
}

const clearFieldError = (field: string) => emit('clearFieldError', field)

const handleSubmit = () => {
  if (!canSubmit.value) return

  const payload: WorkspaceFounderRegistrationPayload = {
    rango_id: form.rango_id,
  }

  if (userMode.value === 'new') {
    payload.usuario_nuevo = {
      nombre: newUser.nombre?.trim() ?? '',
      apellido: newUser.apellido?.trim() ?? '',
      email: newUser.email?.trim() ?? '',
      telefono: newUser.telefono?.trim() || null,
      tipo_documento: newUser.tipo_documento?.trim() || null,
      numero_documento: newUser.numero_documento?.trim() || null,
      direccion: newUser.direccion?.trim() || null,
      password_temporal: newUser.password_temporal?.trim() || null,
    }
  } else {
    payload.usuario_id = form.usuario_id
  }

  emit('submit', payload)
}
</script>

<template>
  <div class="founder">
    <header class="founder__header">
      <div>
        <p class="founder__eyebrow">Fundador</p>
        <h3 class="founder__title">Fundador de la empresa</h3>
        <p class="founder__subtitle">Gestiona el primer patrocinador de la red y su rango inicial.</p>
      </div>
      <AppButton type="button" variant="ghost" size="sm" :disabled="loading" @click="emit('refresh')">
        <template #leading><RefreshCw class="size-4" /></template>
        Recargar
      </AppButton>
    </header>

    <section v-if="loading && !founderConfig" class="founder__loading" role="status" aria-live="polite">
      <span class="founder__skeleton founder__skeleton--title" />
      <span class="founder__skeleton founder__skeleton--line" />
      <span class="founder__skeleton founder__skeleton--line founder__skeleton--short" />
    </section>

    <section v-else-if="errorMessage && !founderConfig" class="founder__error" role="alert">
      <p>No pudimos cargar el fundador</p>
      <AppButton type="button" variant="ghost" :disabled="loading" @click="emit('refresh')">
        <template #leading><RefreshCw class="size-4" /></template>
        Reintentar
      </AppButton>
    </section>

    <template v-else-if="founderConfig">
      <div v-if="errorMessage" class="founder__alert founder__alert--error" role="alert">{{ errorMessage }}</div>
      <div v-if="successMessage" class="founder__alert founder__alert--success" role="status">{{ successMessage }}</div>

      <template v-if="founderRegistered">
        <article class="founder-card">
          <div class="founder-card__top">
            <div class="founder-card__avatar" aria-hidden="true">{{ founderInitials }}</div>
            <div class="founder-card__person">
              <p class="founder__eyebrow">Fundador registrado</p>
              <h4>{{ founderName }}</h4>
              <span>{{ founderRecord?.usuario.email || 'Correo no disponible' }}</span>
            </div>
          </div>

          <div class="founder-card__details">
            <div class="founder-card__detail">
              <span>Documento</span>
              <strong>{{ founderRecord?.usuario.numero_documento || 'No disponible' }}</strong>
            </div>
            <div class="founder-card__detail">
              <span>Cargo</span>
              <strong>{{ founderRecord?.rango.nombre_rango || 'No disponible' }}</strong>
              <small v-if="founderRecord?.rango.nivel !== null">
                Nivel {{ founderRecord?.rango.nivel }}
              </small>
            </div>
            <div class="founder-card__detail">
              <span>Fecha de registro</span>
              <strong>No disponible</strong>
            </div>
          </div>

          <p class="founder-card__lock">
            <LockKeyhole class="size-4" />
            Solo puede existir un fundador por empresa
          </p>
          <p v-if="registrationResult && !founderConfig.fundador" class="founder__help">
            El registro se completó; vuelve a cargar para sincronizar los datos.
          </p>
        </article>

        <section v-if="ranksByLevel.length" class="network-levels">
          <h4>Rangos de la red por nivel</h4>
          <ol>
            <li
              v-for="[level, ranks] in ranksByLevel"
              :key="level"
              :class="{ 'network-levels__item--founder': level === founderRecord?.rango.nivel }"
            >
              <span class="network-levels__number">{{ level }}</span>
              <div>
                <strong>Nivel {{ level }}</strong>
                <span>{{ ranks.join(' · ') }}</span>
              </div>
              <Check
                v-if="level === founderRecord?.rango.nivel"
                class="network-levels__check size-4"
                aria-label="Nivel del fundador"
              />
            </li>
          </ol>
        </section>
      </template>

      <template v-else>
        <section class="founder__explanation">
          <div class="founder__explanation-icon"><UserRoundPlus class="size-5" /></div>
          <div>
            <h4>Agrega el fundador de la empresa</h4>
            <p>El fundador es el primer patrocinador de la red y no tiene patrocinador directo. Solo puede existir uno por empresa.</p>
          </div>
          <AppButton
            v-if="!startWizard"
            type="button"
            variant="primary"
            :disabled="!founderConfig.puede_registrar"
            @click="start"
          >
            <template #leading><UserRoundPlus class="size-4" /></template>
            Agregar fundador
          </AppButton>
          <p v-if="!founderConfig.puede_registrar" class="founder__cannot-register">
            Esta empresa no permite registrar un fundador en este momento.
          </p>
        </section>

        <section v-if="startWizard" class="wizard">
          <ol class="wizard__steps" aria-label="Pasos para registrar el fundador">
            <li v-for="(label, index) in ['Persona', 'Cargo', 'Confirmación']" :key="label">
              <span :class="{ 'wizard__step--active': step === index + 1, 'wizard__step--complete': step > index + 1 }">
                {{ index + 1 }}
              </span>
              <strong>{{ label }}</strong>
            </li>
          </ol>

          <section v-if="step === 1" class="founder__panel">
            <h4>Persona</h4>
            <div class="founder__mode-switch" role="group" aria-label="Tipo de persona">
              <button
                type="button"
                class="founder__mode"
                :class="{ 'founder__mode--active': userMode === 'existing' }"
                @click="userMode = 'existing'"
              >
                Usuario existente
              </button>
              <button
                type="button"
                class="founder__mode"
                :class="{ 'founder__mode--active': userMode === 'new' }"
                @click="userMode = 'new'"
              >
                Crear nuevo
              </button>
            </div>

            <template v-if="userMode === 'existing'">
              <p class="founder__help">Busca por DNI, correo o nombre y selecciona una persona.</p>
              <div class="founder__search">
                <label class="visually-hidden" for="founder-user-search">Buscar por DNI, correo o nombre</label>
                <Search class="size-4" aria-hidden="true" />
                <input
                  id="founder-user-search"
                  v-model="searchQuery"
                  type="search"
                  placeholder="DNI, correo o nombre"
                  @keydown.enter.prevent="searchUsers"
                />
                <AppButton type="button" variant="ghost" size="sm" :disabled="searchingUsers" @click="searchUsers">
                  {{ searchingUsers ? 'Buscando…' : 'Buscar' }}
                </AppButton>
              </div>
              <div v-if="userCandidates.length" class="founder__candidate-list">
                <label
                  v-for="candidate in userCandidates"
                  :key="candidate.id"
                  class="founder__candidate"
                  :class="{ 'founder__candidate--active': form.usuario_id === candidate.id }"
                >
                  <input v-model="form.usuario_id" type="radio" name="founder-user" :value="candidate.id" @change="clearFieldError('usuario_id')" />
                  <span>
                    <strong>{{ candidate.nombre_completo }}</strong>
                    <small>{{ candidate.numero_documento }} · {{ candidate.email }}</small>
                  </span>
                </label>
              </div>
              <p v-else-if="!searchingUsers" class="founder__help">No hay usuarios para mostrar. Busca o crea un usuario nuevo.</p>
              <p v-if="fieldError('usuario_id')" class="founder__field-error">{{ fieldError('usuario_id') }}</p>
            </template>

            <div v-else class="founder__form-grid">
              <label class="founder__field">
                <span>Nombre</span>
                <input v-model="newUser.nombre" type="text" autocomplete="given-name" required @input="clearFieldError('usuario_nuevo.nombre')" @blur="markTouched('usuario_nuevo.nombre')" />
                <small v-if="fieldError('usuario_nuevo.nombre')" class="founder__field-error">{{ fieldError('usuario_nuevo.nombre') }}</small>
              </label>
              <label class="founder__field">
                <span>Apellido</span>
                <input v-model="newUser.apellido" type="text" autocomplete="family-name" required @input="clearFieldError('usuario_nuevo.apellido')" @blur="markTouched('usuario_nuevo.apellido')" />
                <small v-if="fieldError('usuario_nuevo.apellido')" class="founder__field-error">{{ fieldError('usuario_nuevo.apellido') }}</small>
              </label>
              <label class="founder__field">
                <span>Tipo de documento</span>
                <select v-model="newUser.tipo_documento" required @change="clearFieldError('usuario_nuevo.tipo_documento')">
                  <option v-for="option in documentTypes" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
                <small v-if="fieldError('usuario_nuevo.tipo_documento')" class="founder__field-error">{{ fieldError('usuario_nuevo.tipo_documento') }}</small>
              </label>
              <label class="founder__field">
                <span>Número de documento</span>
                <input
                  v-model="newUser.numero_documento"
                  type="text"
                  autocomplete="off"
                  required
                  :aria-invalid="Boolean(fieldError('usuario_nuevo.numero_documento') || (touched['usuario_nuevo.numero_documento'] && documentNumberError))"
                  @input="clearFieldError('usuario_nuevo.numero_documento')"
                  @blur="markTouched('usuario_nuevo.numero_documento')"
                />
                <small v-if="fieldError('usuario_nuevo.numero_documento')" class="founder__field-error">{{ fieldError('usuario_nuevo.numero_documento') }}</small>
                <small v-else-if="touched['usuario_nuevo.numero_documento'] && documentNumberError" class="founder__field-error">{{ documentNumberError }}</small>
              </label>
              <label class="founder__field founder__field--wide">
                <span>Correo</span>
                <input
                  v-model="newUser.email"
                  type="email"
                  autocomplete="email"
                  required
                  :aria-invalid="Boolean(fieldError('usuario_nuevo.email'))"
                  @input="clearFieldError('usuario_nuevo.email')"
                  @blur="markTouched('usuario_nuevo.email')"
                />
                <small v-if="fieldError('usuario_nuevo.email')" class="founder__field-error">{{ fieldError('usuario_nuevo.email') }}</small>
              </label>
              <div class="founder__field founder__field--wide">
                <label for="founder-phone">Teléfono</label>
                <PhoneInput
                  id="founder-phone"
                  :model-value="newUser.telefono ?? ''"
                  :required="true"
                  :invalid="Boolean(fieldError('usuario_nuevo.telefono'))"
                  @update:model-value="newUser.telefono = $event; clearFieldError('usuario_nuevo.telefono')"
                />
                <small v-if="fieldError('usuario_nuevo.telefono')" class="founder__field-error">{{ fieldError('usuario_nuevo.telefono') }}</small>
              </div>
              <label class="founder__field founder__field--wide">
                <span>Dirección <small>(opcional)</small></span>
                <input v-model="newUser.direccion" type="text" autocomplete="street-address" @input="clearFieldError('usuario_nuevo.direccion')" />
                <small v-if="fieldError('usuario_nuevo.direccion')" class="founder__field-error">{{ fieldError('usuario_nuevo.direccion') }}</small>
              </label>
              <label class="founder__field founder__field--wide">
                <span>Clave temporal <small>(opcional)</small></span>
                <input v-model="newUser.password_temporal" type="password" autocomplete="new-password" @input="clearFieldError('usuario_nuevo.password_temporal')" />
                <small v-if="fieldError('usuario_nuevo.password_temporal')" class="founder__field-error">{{ fieldError('usuario_nuevo.password_temporal') }}</small>
              </label>
            </div>
          </section>

          <section v-else-if="step === 2" class="founder__panel">
            <h4>Cargo</h4>
            <template v-if="hasRanks">
              <p class="founder__help">Selecciona un rango configurado para asignar el cargo del fundador.</p>
              <div class="founder__rank-list">
                <label
                  v-for="rank in availableRanks"
                  :key="rank.id"
                  class="founder__rank"
                  :class="{ 'founder__rank--active': form.rango_id === rank.id }"
                >
                  <input v-model="form.rango_id" type="radio" name="founder-rank" :value="rank.id" @change="clearFieldError('rango_id')" />
                  <span><strong>{{ rank.nombre_rango }}</strong><small>Nivel {{ rank.nivel }}</small></span>
                </label>
              </div>
              <p v-if="fieldError('rango_id')" class="founder__field-error">{{ fieldError('rango_id') }}</p>
            </template>
            <div v-else class="founder__no-ranks">
              <p>Configura al menos un rango para asignar un cargo</p>
              <AppButton type="button" variant="ghost" @click="emit('goToRanks')">
                Configurar Rangos y red
              </AppButton>
            </div>
          </section>

          <section v-else class="founder__panel">
            <h4>Confirmación</h4>
            <dl class="founder__review">
              <div>
                <dt>Persona</dt>
                <dd>{{ userMode === 'existing' ? selectedCandidate?.nombre_completo : fullNewUserName }}</dd>
              </div>
              <div>
                <dt>Documento</dt>
                <dd>{{ userMode === 'existing' ? selectedCandidate?.numero_documento : newUser.numero_documento }}</dd>
              </div>
              <div>
                <dt>Correo</dt>
                <dd>{{ userMode === 'existing' ? selectedCandidate?.email : newUser.email }}</dd>
              </div>
              <div>
                <dt>Cargo</dt>
                <dd>{{ selectedRank?.nombre_rango }} · Nivel {{ selectedRank?.nivel }}</dd>
              </div>
            </dl>
          </section>

          <footer class="founder__wizard-actions">
            <AppButton v-if="step > 1" type="button" variant="ghost" @click="goToPreviousStep">
              <template #leading><ArrowLeft class="size-4" /></template>
              Anterior
            </AppButton>
            <span class="founder__action-spacer" />
            <AppButton v-if="step < 3" type="button" variant="primary" :disabled="step === 1 ? !canContinueFromPerson : !hasRanks || !selectedRank" @click="goToNextStep">
              Siguiente
              <template #trailing><ArrowRight class="size-4" /></template>
            </AppButton>
            <AppButton v-else type="button" variant="primary" :disabled="!canSubmit || saving" @click="handleSubmit">
              <template #leading>
                <span v-if="saving" class="founder__spinner" aria-hidden="true" />
                <UserRoundPlus v-else class="size-4" />
              </template>
              {{ saving ? 'Registrando…' : 'Registrar fundador' }}
            </AppButton>
          </footer>
        </section>
      </template>

      <section v-if="deliveryCredentials" class="founder__credentials">
        <KeyRound class="size-5" />
        <div>
          <h4>Credenciales temporales</h4>
          <p>Guarda estos datos y compártelos de forma segura con el fundador.</p>
          <strong>{{ deliveryCredentials.email }}</strong>
          <code>{{ deliveryCredentials.password_temporal }}</code>
        </div>
      </section>
    </template>
  </div>
</template>

<style scoped>
.founder {
  display: grid;
  gap: 16px;
  color: #17314f;
}

.founder__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.founder__eyebrow {
  margin: 0 0 8px;
  color: #5e7898;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.founder__title {
  margin: 0;
  font-size: 1.1rem;
}

.founder__subtitle,
.founder__help {
  margin: 8px 0 0;
  color: #60758d;
  font-size: 0.9rem;
  line-height: 1.5;
}

.founder__loading,
.founder__error,
.founder__explanation,
.founder__panel,
.founder-card,
.network-levels,
.founder__credentials {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
}

.founder__loading {
  display: grid;
  gap: 12px;
  padding: 20px;
}

.founder__skeleton {
  height: 14px;
  border-radius: 8px;
  background: linear-gradient(90deg, #edf1f5 25%, #f8fafc 50%, #edf1f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}

.founder__skeleton--title {
  width: 45%;
  height: 22px;
}

.founder__skeleton--line {
  width: 90%;
}

.founder__skeleton--short {
  width: 60%;
}

.founder__error {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  color: #8b2c2c;
}

.founder__error p {
  margin: 0;
  font-weight: 700;
}

.founder__alert {
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.9rem;
}

.founder__alert--error {
  background: #fff1f0;
  color: #a12b24;
}

.founder__alert--success {
  background: #eaf8f0;
  color: #17623d;
}

.founder__explanation {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f7fbff, #fff);
}

.founder__explanation-icon,
.founder-card__avatar {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  color: #fff;
  background: linear-gradient(135deg, #3eb5f5, #1768b8);
}

.founder__explanation-icon {
  width: 42px;
  height: 42px;
  border-radius: 12px;
}

.founder__explanation h4,
.founder__explanation p {
  margin: 0;
}

.founder__explanation h4 {
  font-size: 0.98rem;
}

.founder__explanation p {
  margin-top: 6px;
  color: #60758d;
  font-size: 0.86rem;
  line-height: 1.5;
}

.founder__cannot-register {
  grid-column: 2 / -1;
  color: #8b2c2c !important;
}

.founder-card {
  padding: 20px;
}

.founder-card__top {
  display: flex;
  align-items: center;
  gap: 16px;
}

.founder-card__avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  font-weight: 800;
}

.founder-card__person h4 {
  margin: 0;
  font-size: 1.1rem;
}

.founder-card__person > span {
  display: block;
  margin-top: 5px;
  color: #60758d;
}

.founder-card__person .founder__eyebrow {
  margin-bottom: 5px;
}

.founder-card__details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-top: 20px;
}

.founder-card__detail {
  display: grid;
  gap: 6px;
  padding: 14px;
  border-radius: 10px;
  background: #f8fafc;
}

.founder-card__detail span,
.founder-card__detail small {
  color: #60758d;
  font-size: 0.82rem;
}

.founder-card__lock {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 16px 0 0;
  padding-top: 14px;
  border-top: 1px solid #e7edf3;
  color: #52657a;
  font-size: 0.86rem;
}

.network-levels {
  padding: 18px;
}

.network-levels h4,
.founder__credentials h4 {
  margin: 0;
  font-size: 0.95rem;
}

.network-levels ol {
  display: grid;
  gap: 8px;
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.network-levels li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.network-levels__item--founder {
  border-color: #93c5fd !important;
  background: #eff6ff;
}

.network-levels__number {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 50%;
  background: #e2e8f0;
  font-weight: 700;
}

.network-levels li div {
  display: grid;
  gap: 3px;
}

.network-levels li div span {
  color: #60758d;
  font-size: 0.83rem;
}

.network-levels__check {
  margin-left: auto;
  color: #1768b8;
}

.wizard {
  display: grid;
  gap: 16px;
}

.wizard__steps {
  display: flex;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.wizard__steps li {
  display: flex;
  flex: 1 1 0;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.86rem;
}

.wizard__steps li span {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #cbd5e1;
  border-radius: 50%;
}

.wizard__steps li .wizard__step--active,
.wizard__steps li .wizard__step--complete {
  border-color: #1f7ae0;
  background: #1f7ae0;
  color: #fff;
}

.wizard__panel,
.founder__panel {
  padding: 20px;
}

.founder__panel h4 {
  margin: 0 0 16px;
  font-size: 1rem;
}

.founder__mode-switch {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.founder__mode {
  min-height: 40px;
  padding: 8px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  background: #fff;
  color: #35506e;
  font: inherit;
  cursor: pointer;
}

.founder__mode--active {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #155e9b;
  font-weight: 700;
}

.founder__search {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 4px 6px 4px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
}

.founder__search input {
  flex: 1;
  min-width: 0;
  min-height: 40px;
  border: 0;
  outline: 0;
  font: inherit;
}

.founder__search:focus-within {
  outline: 3px solid rgba(31, 122, 224, 0.28);
  outline-offset: 2px;
}

.founder__candidate-list,
.founder__rank-list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.founder__candidate,
.founder__rank {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #dfe7f1;
  border-radius: 10px;
  cursor: pointer;
}

.founder__candidate--active,
.founder__rank--active {
  border-color: #93c5fd;
  background: #eff6ff;
}

.founder__candidate input,
.founder__rank input {
  accent-color: #1768b8;
}

.founder__candidate span,
.founder__rank span {
  display: grid;
  gap: 4px;
}

.founder__candidate small,
.founder__rank small {
  color: #60758d;
}

.founder__form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.founder__field {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 8px;
  color: #35506e;
  font-size: 0.86rem;
  font-weight: 700;
}

.founder__field--wide {
  grid-column: 1 / -1;
}

.founder__field input,
.founder__field select {
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #fff;
  color: #17314f;
  font: inherit;
  font-weight: 400;
}

.founder__field input:focus-visible,
.founder__field select:focus-visible,
.founder__mode:focus-visible {
  outline: 3px solid rgba(31, 122, 224, 0.35);
  outline-offset: 2px;
}

.founder__field-error {
  color: #b42318;
  font-size: 0.8rem;
  font-weight: 500;
}

.founder__no-ranks {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border-radius: 10px;
  background: #fff8ed;
  color: #7c4a12;
}

.founder__no-ranks p {
  margin: 0;
}

.founder__review {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 0;
}

.founder__review div {
  min-width: 0;
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
}

.founder__review dt {
  color: #60758d;
  font-size: 0.8rem;
}

.founder__review dd {
  overflow-wrap: anywhere;
  margin: 5px 0 0;
  font-weight: 700;
}

.founder__wizard-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.founder__action-spacer {
  flex: 1;
}

.founder__spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.founder__credentials {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #eff6ff;
  color: #174f85;
}

.founder__credentials h4,
.founder__credentials p {
  margin: 0 0 8px;
}

.founder__credentials p {
  color: #52657a;
  font-size: 0.86rem;
}

.founder__credentials strong,
.founder__credentials code {
  display: block;
  margin-top: 6px;
  overflow-wrap: anywhere;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  clip-path: inset(50%);
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .founder__skeleton,
  .founder__spinner {
    animation: none;
  }
}

@media (max-width: 640px) {
  .founder__header,
  .founder__explanation,
  .founder__no-ranks,
  .founder__error {
    align-items: stretch;
    flex-direction: column;
  }

  .founder__explanation {
    display: flex;
  }

  .founder__cannot-register {
    grid-column: auto;
  }

  .founder-card__details,
  .founder__form-grid,
  .founder__review {
    grid-template-columns: 1fr;
  }

  .founder__field--wide {
    grid-column: auto;
  }

  .wizard__steps li {
    flex-direction: column;
    align-items: flex-start;
  }

  .wizard__steps li strong {
    font-size: 0.75rem;
  }

  .founder__wizard-actions {
    flex-wrap: wrap;
  }
}
</style>
