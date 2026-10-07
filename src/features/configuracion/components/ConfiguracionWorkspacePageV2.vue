<script setup lang="ts">
import axios from 'axios'
import { computed, reactive, ref, shallowRef, watch } from 'vue'
import { Building2, Check, Circle, Landmark, RefreshCw, UserRoundPlus, Wallet, Waypoints } from 'lucide-vue-next'
import AppModal from '@/components/shared/AppModal.vue'
import AppButton from '@/components/shared/AppButton.vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { useWorkspaceConfiguracionApi } from '../composables/useWorkspaceConfiguracionApi'
import type { UpdateWorkspaceProfilePayload, WorkspaceFounderRegistrationPayload } from '../types'
import WorkspaceBankAccountsSectionV2 from './WorkspaceBankAccountsSectionV2.vue'
import WorkspaceCompanySectionV2 from './WorkspaceCompanySectionV2.vue'
import WorkspaceFounderSectionV2 from './WorkspaceFounderSectionV2.vue'
import WorkspaceNetworkSection from './WorkspaceNetworkSection.vue'
import WorkspacePaymentPoliciesSection from './WorkspacePaymentPoliciesSection.vue'

const props = withDefaults(defineProps<{
  open?: boolean
  empresaId?: number
  contextLabel?: string
  title?: string
  subtitle?: string
  surface?: 'modal' | 'page'
  showHeader?: boolean
}>(), {
  open: true,
  empresaId: undefined,
  contextLabel: 'Superadmin company control v2',
  title: 'Configuración del workspace',
  subtitle: 'Versión V2 del módulo de configuración con una capa propia para el detalle de empresa.',
  surface: 'modal',
  showHeader: true,
})

const emit = defineEmits<{
  close: []
}>()

type WorkspaceConfigTabId = 'empresa' | 'fundador' | 'bancos' | 'red' | 'finanzas'

interface WorkspaceConfigTab {
  id: WorkspaceConfigTabId
  label: string
  note: string
  icon: typeof Building2
}

const { isWorkspaceAdmin } = useAuthenticatedSession()

const {
  profile,
  logoPreview,
  founderConfig,
  founderUserCandidates,
  founderRegistrationResult,
  isLoading,
  isSaving,
  isUploadingLogo,
  isConfirmingLogo,
  isFounderLoading,
  isFounderSaving,
  isFounderUsersLoading,
  errorMessage,
  successMessage,
  clearMessages,
  clearLogoPreview,
  fetchProfile,
  fetchFounderConfig,
  searchFounderUsers,
  registerFounder,
  updateProfile,
  uploadLogoPreview,
  confirmLogo,
} = useWorkspaceConfiguracionApi({ empresaId: props.empresaId })

const activeTab = reactive({ value: 'empresa' as WorkspaceConfigTabId })
const bankAccountsComplete = ref<boolean | null>(null)
const networkComplete = ref<boolean | null>(null)
const companyHasUnsavedChanges = ref(false)
const networkHasUnsavedChanges = ref(false)
const financeHasUnsavedChanges = ref(false)
const founderError = shallowRef('')
const founderSuccess = shallowRef('')
const founderFieldErrors = shallowRef<Record<string, string>>({})
const isPageSurface = computed(() => props.surface === 'page')
const isModalSurface = computed(() => props.surface === 'modal')
const isCompactLayout = computed(() => isModalSurface.value)
const showFounderTab = computed(() => {
  if (typeof props.empresaId === 'number' && props.empresaId > 0) {
    return true
  }

  return isWorkspaceAdmin.value
})

const profileComplete = computed(() => profile.value
  ? Boolean(profile.value.nombre.trim() && profile.value.moneda_iso)
  : null)

const tabCompletion = (tabId: WorkspaceConfigTabId): boolean | null => {
  switch (tabId) {
    case 'empresa': return profileComplete.value
    case 'fundador': return founderConfig.value ? Boolean(founderConfig.value.fundador) : null
    case 'bancos': return bankAccountsComplete.value
    case 'red': return networkComplete.value
    case 'finanzas': return null
  }
}

const hasUnsavedChanges = computed(() => companyHasUnsavedChanges.value
  || networkHasUnsavedChanges.value
  || financeHasUnsavedChanges.value
  || logoPreview.value !== null)

const requirements = computed(() => [
  { label: 'Perfil', complete: profileComplete.value },
  { label: 'Al menos un rango', complete: networkComplete.value },
  { label: 'Cuenta bancaria', complete: bankAccountsComplete.value },
  { label: 'Fundador', complete: founderConfig.value ? Boolean(founderConfig.value.fundador) : null },
])

const tabs = computed(() => {
  const nextTabs: WorkspaceConfigTab[] = [
    {
      id: 'empresa',
      label: 'Empresa',
      note: 'Perfil, logo y estado operativo',
      icon: Building2,
    },
    ...(showFounderTab.value
      ? [{
          id: 'fundador',
          label: 'Fundador',
          note: founderConfig.value?.fundador
            ? 'Nodo inicial ya configurado'
            : 'Registro manual antes de activar',
          icon: UserRoundPlus,
        } satisfies WorkspaceConfigTab]
      : []),
    {
      id: 'bancos',
      label: 'Cuentas bancarias',
      note: 'Recaudación y visibilidad móvil',
      icon: Landmark,
    },
    {
      id: 'red',
      label: 'Rangos y red',
      note: 'Jerarquía, cascada y simulación',
      icon: Waypoints,
    },
  ]

  if (props.empresaId == null) {
    nextTabs.push({
      id: 'finanzas',
      label: 'Políticas de pago',
      note: 'Modelos, cuotas e historial',
      icon: Wallet,
    })
  }

  return nextTabs
})


const refreshProfile = async () => {
  clearMessages()
  await fetchProfile()
}

const setBankAccountsCompletion = (hasAccounts: boolean) => {
  bankAccountsComplete.value = hasAccounts
}

const setNetworkCompletion = (hasRanks: boolean) => {
  networkComplete.value = hasRanks
}

const requestClose = () => {
  if (hasUnsavedChanges.value && !window.confirm('¿Descartar los cambios?')) {
    return
  }

  clearLogoPreview()
  companyHasUnsavedChanges.value = false
  networkHasUnsavedChanges.value = false
  financeHasUnsavedChanges.value = false
  emit('close')
}

const refreshFounder = async () => {
  if (!showFounderTab.value) {
    return
  }

  founderError.value = ''
  founderSuccess.value = ''
  founderFieldErrors.value = {}
  clearMessages()

  try {
    await fetchFounderConfig()
  } catch {
    clearMessages()
    founderError.value = 'No pudimos cargar el fundador'
  }
}

const handleSubmit = async (payload: UpdateWorkspaceProfilePayload) => {
  try {
    await updateProfile(payload)
  } catch {
    return
  }
}

const handleUploadLogo = async (file: File) => {
  try {
    await uploadLogoPreview(file)
  } catch {
    return
  }
}

const handleConfirmLogo = async () => {
  try {
    await confirmLogo()
  } catch {
    return
  }
}

const handleFounderSearch = async (query: string) => {
  founderError.value = ''
  try {
    await searchFounderUsers(query)
  } catch {
    clearMessages()
    founderError.value = 'No pudimos buscar usuarios. Inténtalo nuevamente.'
  }
}

const getFounderFieldErrors = (error: unknown) => {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) return {}

  const errors = error.response.data?.errors
  if (!errors || typeof errors !== 'object') return {}

  return Object.fromEntries(
    Object.entries(errors).flatMap(([field, messages]) => {
      const message = Array.isArray(messages) ? messages[0] : undefined
      return typeof message === 'string' ? [[field, message]] : []
    }),
  )
}

const clearFounderFieldError = (field: string) => {
  const nextErrors = { ...founderFieldErrors.value }
  delete nextErrors[field]
  if (field.startsWith('usuario_nuevo.')) {
    delete nextErrors[field.slice('usuario_nuevo.'.length)]
  }
  founderFieldErrors.value = nextErrors
  founderError.value = ''
}

const handleFounderSubmit = async (payload: WorkspaceFounderRegistrationPayload) => {
  founderError.value = ''
  founderSuccess.value = ''
  founderFieldErrors.value = {}
  try {
    await registerFounder(payload)
    founderSuccess.value = 'Fundador registrado correctamente.'
    clearMessages()
  } catch (error) {
    founderFieldErrors.value = getFounderFieldErrors(error)
    clearMessages()
    if (founderRegistrationResult.value) {
      founderError.value = 'No pudimos actualizar los datos del fundador. Reintenta la carga.'
    } else {
      founderError.value = 'No pudimos registrar el fundador. Revisa los datos e inténtalo nuevamente.'
    }
  }
}

watch(
  () => showFounderTab.value,
  (visible) => {
    if (!visible && activeTab.value === 'fundador') {
      activeTab.value = 'empresa'
    }
  },
  { immediate: true },
)

watch(
  () => activeTab.value,
  async (nextTab) => {
    if (nextTab !== 'fundador' || !showFounderTab.value) {
      return
    }

    await refreshFounder()
  },
  { immediate: true },
)

void fetchProfile()
</script>

<template>
  <component
    :is="props.surface === 'modal' ? AppModal : 'section'"
    class="config-v2-modal"
    v-bind="props.surface === 'modal'
      ? { open: props.open, size: 'xl', title: props.title, description: props.subtitle }
      : { class: 'config-v2-page' }"
    @close="requestClose"
  >
    <div class="config-v2" :class="{ 'config-v2--modal': isModalSurface, 'config-v2--page': isPageSurface }">
      <header v-if="props.showHeader && (isPageSurface || isModalSurface)" class="config-v2__header">
        <div class="config-v2__header-copy">
          <p v-if="isPageSurface" class="config-v2__eyebrow">{{ props.contextLabel }}</p>
          <template v-if="isPageSurface">
            <h1 class="config-v2__title">{{ props.title }}</h1>
            <p class="config-v2__subtitle">{{ props.subtitle }}</p>
          </template>
        </div>

        <AppButton variant="ghost" size="sm" class="config-v2__refresh-btn" :disabled="isLoading" @click="refreshProfile">
          <template #leading>
            <RefreshCw class="size-4" />
          </template>
          {{ isLoading ? 'Sincronizando...' : 'Sincronizar' }}
        </AppButton>
      </header>

      <aside class="config-v2__requirements" aria-label="Requisitos para activar la empresa">
        <strong>Para activar la empresa</strong>
        <ul>
          <li v-for="requirement in requirements" :key="requirement.label">
            <span
              class="config-v2__requirement-status"
              :class="requirement.complete === null ? 'is-unknown' : requirement.complete ? 'is-complete' : 'is-pending'"
              role="img"
              :aria-label="requirement.complete === null ? 'Se verifica al abrir la pestaña' : requirement.complete ? 'Completo' : 'Pendiente'"
              :title="requirement.complete === null ? 'Se verifica al abrir la pestaña' : undefined"
            >
              <Check v-if="requirement.complete" aria-hidden="true" />
              <Circle v-else aria-hidden="true" />
            </span>
            <span>{{ requirement.label }}</span>
          </li>
        </ul>
      </aside>

      <nav class="config-v2__tabs" aria-label="Secciones de configuración">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          class="config-v2__tab"
          :class="{ 'config-v2__tab--active': activeTab.value === tab.id }"
          :aria-current="activeTab.value === tab.id ? 'page' : undefined"
          @click="activeTab.value = tab.id"
        >
          <component :is="tab.icon" class="config-v2__tab-icon" aria-hidden="true" />
          <span class="config-v2__tab-copy">
            <span class="config-v2__tab-label">{{ tab.label }}</span>
            <span class="config-v2__tab-note">{{ tab.note }}</span>
          </span>
          <span
            v-if="tabCompletion(tab.id) !== null"
            class="config-v2__tab-status"
            :class="tabCompletion(tab.id) ? 'is-complete' : 'is-pending'"
            role="img"
            :aria-label="tabCompletion(tab.id) ? 'Completo' : 'Pendiente'"
          >
            <Check v-if="tabCompletion(tab.id)" aria-hidden="true" />
            <Circle v-else aria-hidden="true" />
          </span>
        </button>
      </nav>

      <section class="config-v2__panel">

      <div v-if="errorMessage" class="admin-alert admin-alert--error">
        {{ errorMessage }}
        <button class="admin-alert__close" @click="clearMessages">✕</button>
      </div>

      <div v-if="successMessage" class="admin-alert admin-alert--success">
        {{ successMessage }}
        <button class="admin-alert__close" @click="clearMessages">✕</button>
      </div>

      <p v-if="isLoading && activeTab.value !== 'empresa'" class="config-v2__loading-state">Cargando configuración...</p>

      <WorkspaceCompanySectionV2
        v-if="activeTab.value === 'empresa'"
        :profile="profile"
        :logo-preview="logoPreview"
        :loading="isLoading"
        :saving="isSaving"
        :uploading-logo="isUploadingLogo"
        :confirming-logo="isConfirmingLogo"
        :has-configured-ranges="networkComplete"
        @refresh="refreshProfile"
        @submit="handleSubmit"
        @dirty-change="companyHasUnsavedChanges = $event"
        @upload-logo="handleUploadLogo"
        @confirm-logo="handleConfirmLogo"
        @discard-logo-preview="clearLogoPreview"
      />

      <WorkspaceFounderSectionV2
        v-else-if="activeTab.value === 'fundador' && showFounderTab"
        :founder-config="founderConfig"
        :user-candidates="founderUserCandidates"
        :registration-result="founderRegistrationResult"
        :loading="isFounderLoading"
        :searching-users="isFounderUsersLoading"
        :saving="isFounderSaving"
        :error-message="founderError"
        :field-errors="founderFieldErrors"
        :success-message="founderSuccess"
        @refresh="refreshFounder"
        @search-users="handleFounderSearch"
        @submit="handleFounderSubmit"
        @go-to-ranks="activeTab.value = 'red'"
        @clear-field-error="clearFounderFieldError"
      />

      <WorkspaceBankAccountsSectionV2
        v-else-if="activeTab.value === 'bancos' && profile"
        :company-name="profile.nombre"
        :empresa-id="props.empresaId"
        @completion-loaded="setBankAccountsCompletion"
      />

      <WorkspaceNetworkSection
        v-if="activeTab.value === 'red'"
        :empresa-id="props.empresaId"
        :compact="isCompactLayout"
        @completion-loaded="setNetworkCompletion"
        @dirty-change="networkHasUnsavedChanges = $event"
      />

      <WorkspacePaymentPoliciesSection
        v-if="activeTab.value === 'finanzas' && props.empresaId == null"
        @dirty-change="financeHasUnsavedChanges = $event"
      />

      <p
        v-else-if="activeTab.value === 'bancos' && !profile"
        class="config-v2__loading-state"
      >
        Cargando perfil de empresa...
      </p>
      </section>
    </div>
  </component>
</template>

<style scoped>
.config-v2-page {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
}

.config-v2 {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-v2--page {
  width: 100%;
}

.config-v2__panel {
  width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  background: #fff;
  padding: 20px 22px 22px;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
}

.config-v2--modal .config-v2__panel {
  border: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-shadow: none;
}

.config-v2__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.config-v2__header-copy {
  display: flex;
  flex-direction: column;
}

.config-v2__eyebrow,
.config-v2__section-eyebrow {
  color: #5e7898;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.config-v2__title,
.config-v2__section-title {
  margin: 6px 0 0;
  color: #17314f;
}

.config-v2__title {
  font-size: 1.5rem;
}

.config-v2__section-title {
  font-size: 1.05rem;
}

.config-v2__subtitle,
.config-v2__section-copy {
  margin: 8px 0 0;
  color: #51657f;
  line-height: 1.5;
}

@media (max-width: 720px) {
  .config-v2__header {
    align-items: stretch;
    flex-direction: column;
  }
}

.config-v2__refresh-btn {
  border-radius: 10px;
}

.config-v2-modal :deep(.modal-title) {
  max-width: 100%;
  white-space: normal;
  overflow-wrap: anywhere;
}

.config-v2__requirements {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 16px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #f8fafc;
  color: #334155;
  font-size: 12px;
}

.config-v2__requirements > strong {
  flex: 0 0 auto;
  color: #17314f;
}

.config-v2__requirements ul {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.config-v2__requirements li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.config-v2__requirement-status,
.config-v2__tab-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.config-v2__tab-status {
  margin-left: auto;
}

.config-v2__requirement-status svg,
.config-v2__tab-status svg {
  width: 14px;
  height: 14px;
}

.config-v2__requirement-status.is-complete,
.config-v2__tab-status.is-complete {
  color: #15803d;
}

.config-v2__requirement-status.is-pending,
.config-v2__tab-status.is-pending {
  color: #b45309;
}

.config-v2__requirement-status.is-unknown {
  color: #94a3b8;
}

.config-v2__tab-status.is-pending svg {
  width: 9px;
  height: 9px;
  fill: currentColor;
}

.config-v2__tab:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.45);
  outline-offset: 2px;
}

.config-v2__tabs {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 4px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
  scrollbar-width: thin;
}

.config-v2__tab {
  flex: 1 1 0;
  min-width: 148px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.config-v2__tab:hover {
  background: rgba(255, 255, 255, 0.72);
}

.config-v2__tab--active {
  border-color: rgba(31, 122, 224, 0.2);
  background: #fff;
  box-shadow: 0 6px 18px rgba(31, 122, 224, 0.08);
}

.config-v2__tab-icon {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  color: #1a6ab5;
  flex-shrink: 0;
}

.config-v2__tab-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.config-v2__tab-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #17314f;
  line-height: 1.2;
}

.config-v2__tab-note {
  font-size: 0.72rem;
  line-height: 1.35;
  color: #60758d;
}

.config-v2--modal .config-v2__tab {
  min-width: 132px;
}

.config-v2--modal .config-v2__tab-note {
  display: none;
}

.config-v2__company-form {
  width: min(100%, 980px);
}

.config-v2__form-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.config-v2__form-section {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
}

.config-v2__section-copy {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
}

.config-v2__section-heading {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #172033;
}

.config-v2__section-description,
.config-v2__form-hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}

.config-v2__form-grid {
  display: grid;
  gap: 14px;
}

.config-v2__form-grid--two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.config-v2__form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.config-v2__form-group--full {
  grid-column: 1 / -1;
}

.config-v2__form-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.config-v2__form-input {
  width: 100%;
  min-width: 0;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #fff;
  padding: 10px 12px;
  font-size: 13px;
  color: #334155;
  outline: none;
}

.config-v2__form-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.config-v2__form-input--mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.config-v2__form-textarea {
  resize: vertical;
  min-height: 88px;
}

.config-v2__status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.config-v2__status-card {
  position: relative;
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid #dbe4ef;
  border-radius: 14px;
  background: #f8fafc;
}

.config-v2__status-card--active {
  border-color: rgba(31, 122, 224, 0.18);
  background: linear-gradient(135deg, rgba(229, 241, 255, 0.92), rgba(245, 250, 255, 0.98));
}

.config-v2__status-input {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.config-v2__status-title {
  font-size: 0.94rem;
  font-weight: 700;
  color: #1f2937;
}

.config-v2__status-copy {
  font-size: 0.79rem;
  line-height: 1.35;
  color: #617086;
}

.config-v2__form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 2px;
}

.config-v2__brand-preview {
  display: flex;
  gap: 14px;
  padding: 14px;
  border-radius: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.config-v2__brand-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: linear-gradient(135deg, #4ab8f5, #1a6ab5);
  color: #fff;
  overflow: hidden;
  flex-shrink: 0;
}

.config-v2__brand-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.config-v2__brand-fallback {
  font-size: 1.2rem;
  font-weight: 700;
}

.config-v2__brand-copy {
  display: grid;
  gap: 6px;
}

.config-v2__brand-name {
  color: #17314f;
  font-size: 1rem;
}

.config-v2__brand-note {
  color: #60758d;
  line-height: 1.45;
}

.config-v2__brand-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.config-v2__preview-banner {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.config-v2__preview-banner strong {
  display: block;
  margin-bottom: 4px;
}

.config-v2__preview-banner p {
  margin: 0;
  line-height: 1.45;
}

.config-v2__file-input {
  display: none;
}

.config-v2__loading-state {
  color: #60758d;
  font-size: 0.92rem;
}

@media (max-width: 768px) {
  .config-v2__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .config-v2__form-grid--two,
  .config-v2__status-grid {
    grid-template-columns: 1fr;
  }

  .config-v2__preview-banner,
  .config-v2__brand-preview {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>