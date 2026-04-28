<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { Building2, Landmark, RefreshCw, Waypoints } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import { useWorkspaceConfiguracionApi } from '../composables/useWorkspaceConfiguracionApi'
import type { UpdateWorkspaceProfilePayload } from '../types'
import WorkspaceBankAccountsSection from './WorkspaceBankAccountsSection.vue'
import WorkspaceBrandingPanel from './WorkspaceBrandingPanel.vue'
import WorkspaceNetworkSection from './WorkspaceNetworkSection.vue'
import WorkspaceProfileForm from './WorkspaceProfileForm.vue'

const props = withDefaults(defineProps<{
  empresaId?: number
  contextLabel?: string
  title?: string
  subtitle?: string
  compact?: boolean
}>(), {
  empresaId: undefined,
  contextLabel: 'Workspace module 1',
  title: 'Configuracion estructural del workspace',
  subtitle: 'Esta primera interfaz aterriza el backend ya completado para perfil de empresa, branding y control operativo.',
  compact: false,
})

const {
  profile,
  logoPreview,
  isLoading,
  isSaving,
  isUploadingLogo,
  isConfirmingLogo,
  errorMessage,
  successMessage,
  clearMessages,
  clearLogoPreview,
  fetchProfile,
  updateProfile,
  uploadLogoPreview,
  confirmLogo,
} = useWorkspaceConfiguracionApi({ empresaId: props.empresaId })

const activeTab = shallowRef<'empresa' | 'bancos' | 'red'>('empresa')

const tabs = [
  {
    id: 'empresa',
    label: 'Empresa',
    note: 'Perfil, logo y estado operativo',
    icon: Building2,
  },
  {
    id: 'bancos',
    label: 'Cuentas bancarias',
    note: 'Alias, instrucciones y visibilidad movil',
    icon: Landmark,
  },
  {
    id: 'red',
    label: 'Rangos y red',
    note: 'Profundidad, cascada y simulador',
    icon: Waypoints,
  },
] as const

const currentStatusTone = computed(() => {
  switch (profile.value?.estado_operativo) {
    case 'activa':
      return 'workspace-banner--success'
    case 'mantenimiento':
      return 'workspace-banner--warning'
    case 'suspendida':
      return 'workspace-banner--danger'
    default:
      return 'workspace-banner--neutral'
  }
})

const refreshProfile = async () => {
  clearMessages()
  await fetchProfile()
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

onMounted(async () => {
  await fetchProfile()
})
</script>

<template>
  <div class="config-page" :class="{ 'config-page--compact': props.compact }">
    <header class="config-page__header">
      <div>
        <p class="config-page__eyebrow">{{ props.contextLabel }}</p>
        <h1 class="config-page__title">{{ props.title }}</h1>
        <p class="config-page__subtitle">{{ props.subtitle }}</p>
      </div>

      <div class="config-page__header-actions">
        <AppButton variant="ghost" size="sm" class="config-page__refresh-btn" :disabled="isLoading" @click="refreshProfile">
          <template #leading>
            <RefreshCw class="size-4" />
          </template>
          {{ isLoading ? 'Sincronizando...' : 'Sincronizar' }}
        </AppButton>
      </div>
    </header>

    <section class="config-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        type="button"
        class="config-tabs__item"
        :class="{
          'config-tabs__item--active': activeTab === tab.id,
        }"
        @click="activeTab = tab.id"
      >
        <span class="config-tabs__icon" aria-hidden="true">
          <component :is="tab.icon" class="size-4" />
        </span>
        <span class="config-tabs__label">{{ tab.label }}</span>
        <span class="config-tabs__note">{{ tab.note }}</span>
      </button>
    </section>

    <section v-if="profile" class="workspace-banner" :class="currentStatusTone">
      <div>
        <strong class="workspace-banner__title">{{ profile.nombre_visible }}</strong>
        <p class="workspace-banner__copy">
          Estado actual: {{ profile.estado_operativo }}
          <span v-if="profile.mensaje_estado_operativo">· {{ profile.mensaje_estado_operativo }}</span>
        </p>
      </div>
      <span class="workspace-banner__meta">Moneda {{ profile.moneda_iso ?? 'sin definir' }}</span>
    </section>

    <div v-if="errorMessage" class="workspace-alert workspace-alert--error">
      <span>{{ errorMessage }}</span>
      <AppButton type="button" variant="quiet" size="sm" class="workspace-alert__close" @click="clearMessages">
        Cerrar
      </AppButton>
    </div>

    <div v-if="successMessage" class="workspace-alert workspace-alert--success">
      <span>{{ successMessage }}</span>
      <AppButton type="button" variant="quiet" size="sm" class="workspace-alert__close" @click="clearMessages">
        Cerrar
      </AppButton>
    </div>

    <div v-if="activeTab === 'empresa'" class="config-layout">
      <WorkspaceProfileForm
        :profile="profile"
        :loading="isLoading"
        :saving="isSaving"
        @refresh="refreshProfile"
        @submit="handleSubmit"
      />

      <WorkspaceBrandingPanel
        :profile="profile"
        :logo-preview="logoPreview"
        :uploading="isUploadingLogo"
        :confirming="isConfirmingLogo"
        @upload="handleUploadLogo"
        @confirm="handleConfirmLogo"
        @discard-preview="clearLogoPreview"
      />
    </div>

    <WorkspaceBankAccountsSection
      v-else-if="activeTab === 'bancos' && profile"
      :company-name="profile.nombre"
      :empresa-id="props.empresaId"
    />

    <WorkspaceNetworkSection v-else-if="activeTab === 'red'" :empresa-id="props.empresaId" />

    <section v-else class="config-placeholder">
      <p class="config-placeholder__eyebrow">Siguiente entrega</p>
      <h2 class="config-placeholder__title">{{ activeTab === 'bancos' ? 'Cuentas bancarias corporativas' : 'Motor de rangos y red' }}</h2>
      <p class="config-placeholder__copy">
        La base backend ya existe. Esta pestaña queda preparada para la siguiente tanda de UI sin mezclar implementaciones a medias en una sola vista.
      </p>
    </section>
  </div>
</template>

<style scoped>
.config-page {
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.config-page--compact {
  padding: 18px 0 0;
  gap: 16px;
}

.config-page__header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.config-page--compact .config-page__header {
  align-items: flex-start;
}

.config-page__eyebrow,
.config-placeholder__eyebrow {
  color: #8c5f2c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.config-page__title {
  margin-top: 8px;
  font-size: clamp(2rem, 3vw, 2.8rem);
  line-height: 0.98;
  letter-spacing: -0.04em;
  color: #162033;
}

.config-page--compact .config-page__title {
  margin-top: 6px;
  font-size: clamp(1.45rem, 2vw, 1.9rem);
  line-height: 1.04;
}

.config-page__subtitle,
.config-placeholder__copy {
  margin-top: 10px;
  max-width: 70ch;
  color: #5f6d83;
  line-height: 1.7;
}

.config-page--compact .config-page__subtitle {
  margin-top: 8px;
  max-width: 62ch;
  font-size: 0.92rem;
  line-height: 1.5;
}

.config-page__refresh-btn {
  border-radius: 999px;
  border: 1px solid rgba(32, 51, 79, 0.14);
  background: rgba(255, 255, 255, 0.72);
  color: #162033;
  font-size: 0.9rem;
  font-weight: 700;
}

.config-page--compact .config-page__refresh-btn {
  min-height: 40px;
  padding: 0 16px;
  font-size: 0.84rem;
}

.config-tabs {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 6px;
}

.config-page--compact .config-tabs {
  gap: 10px;
  padding-bottom: 2px;
}

.config-tabs__item {
  min-width: 230px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 5px;
  border-radius: 24px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: rgba(255, 255, 255, 0.68);
  padding: 16px 18px;
  text-align: left;
}

.config-page--compact .config-tabs__item {
  min-width: 188px;
  border-radius: 18px;
  padding: 12px 14px;
  gap: 3px;
}

.config-tabs__item--active {
  border-color: rgba(186, 123, 47, 0.3);
  background: linear-gradient(180deg, rgba(255, 247, 235, 0.92) 0%, rgba(255, 250, 244, 0.98) 100%);
  box-shadow: 0 16px 32px rgba(139, 76, 28, 0.08);
}

.config-tabs__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  color: #8c5f2c;
}

.config-tabs__item--disabled {
  opacity: 0.8;
}

.config-tabs__label {
  color: #162033;
  font-size: 1rem;
  font-weight: 700;
}

.config-page--compact .config-tabs__label {
  font-size: 0.92rem;
}

.config-tabs__note {
  color: #617086;
  font-size: 0.83rem;
}

.config-page--compact .config-tabs__note {
  font-size: 0.75rem;
  line-height: 1.35;
}

.config-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 20px;
  align-items: start;
}

.config-page--compact .config-layout {
  gap: 16px;
}

.workspace-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-radius: 24px;
  padding: 18px 22px;
  border: 1px solid transparent;
}

.config-page--compact .workspace-banner {
  border-radius: 18px;
  padding: 14px 16px;
}

.workspace-banner--neutral {
  background: rgba(255, 255, 255, 0.75);
  border-color: rgba(32, 51, 79, 0.08);
}

.workspace-banner--success {
  background: rgba(228, 247, 235, 0.94);
  border-color: rgba(43, 122, 64, 0.16);
}

.workspace-banner--warning {
  background: rgba(255, 245, 228, 0.94);
  border-color: rgba(191, 136, 52, 0.18);
}

.workspace-banner--danger {
  background: rgba(253, 236, 236, 0.94);
  border-color: rgba(190, 72, 72, 0.16);
}

.workspace-banner__title {
  display: block;
  color: #162033;
  font-size: 1.02rem;
  font-weight: 700;
}

.config-page--compact .workspace-banner__title {
  font-size: 0.94rem;
}

.workspace-banner__copy,
.workspace-banner__meta {
  color: #59677d;
  font-size: 0.9rem;
}

.config-page--compact .workspace-banner__copy,
.config-page--compact .workspace-banner__meta {
  font-size: 0.82rem;
}

.workspace-banner__copy {
  margin-top: 4px;
}

.workspace-banner__meta {
  font-weight: 700;
}

.workspace-alert {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  border-radius: 20px;
  padding: 14px 18px;
}

.config-page--compact .workspace-alert {
  border-radius: 16px;
  padding: 12px 14px;
}

.workspace-alert--error {
  background: rgba(253, 236, 236, 0.94);
  color: #8f3333;
}

.workspace-alert--success {
  background: rgba(231, 248, 236, 0.94);
  color: #216b39;
}

.workspace-alert__close {
  color: inherit;
  margin-left: auto;
}

.config-placeholder {
  border-radius: 28px;
  border: 1px dashed rgba(32, 51, 79, 0.14);
  padding: 30px;
  background: rgba(255, 255, 255, 0.52);
}

.config-placeholder__title {
  margin-top: 8px;
  color: #162033;
  font-size: 1.4rem;
}

@media (max-width: 1120px) {
  .config-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .config-page {
    padding: 20px;
  }

  .config-page--compact {
    padding: 12px 0 0;
  }

  .config-page__header,
  .workspace-banner,
  .workspace-alert {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>