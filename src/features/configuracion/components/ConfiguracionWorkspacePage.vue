<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { Building2, Landmark, RefreshCw, Wallet, Waypoints } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import { useWorkspaceConfiguracionApi } from '../composables/useWorkspaceConfiguracionApi'
import type { UpdateWorkspaceProfilePayload } from '../types'
import WorkspaceBankAccountsSection from './WorkspaceBankAccountsSection.vue'
import WorkspaceBrandingPanel from './WorkspaceBrandingPanel.vue'
import WorkspaceNetworkSection from './WorkspaceNetworkSection.vue'
import WorkspacePaymentPoliciesSection from './WorkspacePaymentPoliciesSection.vue'
import WorkspaceProfileForm from './WorkspaceProfileForm.vue'

const props = withDefaults(defineProps<{
  empresaId?: number
  contextLabel?: string
  title?: string
  subtitle?: string
  compact?: boolean
  appearance?: 'default' | 'admin'
}>(), {
  empresaId: undefined,
  contextLabel: 'Workspace module 1',
  title: 'Configuracion estructural del workspace',
  subtitle: 'Esta primera interfaz aterriza el backend ya completado para perfil de empresa, branding y control operativo.',
  compact: false,
  appearance: 'default',
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

type WorkspaceConfigTabId = 'empresa' | 'bancos' | 'red' | 'finanzas'

interface WorkspaceConfigTab {
  id: WorkspaceConfigTabId
  label: string
  note: string
  icon: typeof Building2
}

const activeTab = shallowRef<WorkspaceConfigTabId>('empresa')

const tabs = computed(() => {
  const nextTabs: WorkspaceConfigTab[] = [
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
  ]

  if (props.empresaId == null) {
    nextTabs.push({
      id: 'finanzas',
      label: 'Politicas de pago',
      note: 'Modelo bullet, cuotas e historial',
      icon: Wallet,
    })
  }

  return nextTabs
})

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
  <div
    class="config-page"
    :class="{
      'config-page--compact': props.compact,
      'config-page--admin': props.appearance === 'admin',
    }"
  >
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
        :class="{ 'workspace-profile-form--admin': props.appearance === 'admin' }"
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

    <WorkspacePaymentPoliciesSection v-else-if="activeTab === 'finanzas' && props.empresaId == null" />

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

.config-page--admin {
  padding: 0;
  gap: 18px;
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

.config-page--admin .config-page__eyebrow,
.config-page--admin .config-placeholder__eyebrow {
  color: #5e7898;
}

.config-page--admin .config-page__title {
  margin-top: 4px;
  font-size: clamp(1.45rem, 2vw, 1.9rem);
  line-height: 1.04;
  color: #17314f;
}

.config-page--admin .config-page__subtitle,
.config-page--admin .config-placeholder__copy {
  margin-top: 8px;
  max-width: 64ch;
  color: #51657f;
  font-size: 0.92rem;
  line-height: 1.55;
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

.config-page--admin .config-page__refresh-btn {
  border-radius: 10px;
  border-color: #dbe3ef;
  background: #fff;
  color: #475569;
  box-shadow: none;
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

.config-page--admin .config-tabs {
  gap: 10px;
  padding-bottom: 0;
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

.config-page--admin .config-tabs__item {
  min-width: 188px;
  border-radius: 14px;
  border-color: #e2e8f0;
  background: #fff;
  padding: 14px 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.config-tabs__item--active {
  border-color: rgba(186, 123, 47, 0.3);
  background: linear-gradient(180deg, rgba(255, 247, 235, 0.92) 0%, rgba(255, 250, 244, 0.98) 100%);
  box-shadow: 0 16px 32px rgba(139, 76, 28, 0.08);
}

.config-page--admin .config-tabs__item--active {
  border-color: rgba(31, 122, 224, 0.18);
  background: linear-gradient(135deg, rgba(229, 241, 255, 0.92), rgba(245, 250, 255, 0.98));
  box-shadow: 0 10px 24px rgba(31, 122, 224, 0.08);
}

.config-tabs__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.1rem;
  height: 1.1rem;
  color: #8c5f2c;
}

.config-page--admin .config-tabs__icon {
  color: #1a6ab5;
}

.config-tabs__item--disabled {
  opacity: 0.8;
}

.config-tabs__label {
  color: #162033;
  font-size: 1rem;
  font-weight: 700;
}

.config-page--admin .config-tabs__label {
  color: #17314f;
}

.config-page--compact .config-tabs__label {
  font-size: 0.92rem;
}

.config-tabs__note {
  color: #617086;
  font-size: 0.83rem;
}

.config-page--admin .config-tabs__note {
  color: #60758d;
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

.config-page--admin .config-layout {
  gap: 18px;
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

.config-page--admin .workspace-banner {
  border-radius: 14px;
  padding: 16px 18px;
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

.config-page--admin .workspace-banner--neutral {
  background: #fff;
  border-color: #e2e8f0;
}

.config-page--admin .workspace-banner--success {
  background: rgba(224, 245, 232, 0.9);
  border-color: rgba(19, 114, 67, 0.14);
}

.config-page--admin .workspace-banner--warning {
  background: rgba(214, 234, 255, 0.88);
  border-color: rgba(31, 99, 174, 0.16);
}

.config-page--admin .workspace-banner--danger {
  background: rgba(255, 229, 229, 0.92);
  border-color: rgba(176, 61, 61, 0.16);
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

.config-page--admin .workspace-banner__title {
  color: #17314f;
}

.config-page--admin .workspace-banner__copy,
.config-page--admin .workspace-banner__meta {
  color: #60758d;
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

.config-page--admin .workspace-alert {
  border-radius: 14px;
  border: 1px solid transparent;
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

.config-page--admin .workspace-alert--error {
  border-color: rgba(185, 28, 28, 0.18);
  background: #fff4f4;
  color: #9f1d1d;
}

.config-page--admin .workspace-alert--success {
  border-color: rgba(22, 101, 52, 0.16);
  background: #effcf2;
  color: #166534;
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

.config-page--admin .config-placeholder {
  border-radius: 14px;
  border-color: #cbd5e1;
  background: #fff;
}

.config-placeholder__title {
  margin-top: 8px;
  color: #162033;
  font-size: 1.4rem;
}

.config-page--admin .config-placeholder__title {
  color: #17314f;
  font-size: 1.2rem;
}

.config-page--admin :deep(.workspace-card),
.config-page--admin :deep(.branding-panel__insight-card),
.config-page--admin :deep(.bank-section__main),
.config-page--admin :deep(.bank-preview-panel),
.config-page--admin :deep(.network-kpi-card),
.config-page--admin :deep(.network-editor-card),
.config-page--admin :deep(.network-side-card),
.config-page--admin :deep(.payments-editor-card),
.config-page--admin :deep(.payments-history-card) {
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.config-page--admin :deep(.workspace-profile) {
  padding: 20px;
}

.config-page--admin :deep(.workspace-card__header) {
  margin-bottom: 16px;
  gap: 12px;
  align-items: flex-start;
}

.config-page--admin :deep(.workspace-card__title) {
  font-size: 1.15rem;
  line-height: 1.15;
}

.config-page--admin :deep(.workspace-card__subtitle) {
  margin-top: 6px;
  max-width: 46ch;
  font-size: 0.88rem;
  line-height: 1.45;
}

.config-page--admin :deep(.workspace-form) {
  gap: 16px;
}

.config-page--admin :deep(.workspace-form__grid) {
  gap: 14px;
}

.config-page--admin :deep(.workspace-field) {
  gap: 6px;
}

.config-page--admin :deep(.workspace-field__label) {
  font-size: 0.76rem;
}

.config-page--admin :deep(.workspace-field__hint) {
  font-size: 0.74rem;
}

.config-page--admin :deep(.workspace-input),
.config-page--admin :deep(.workspace-textarea) {
  border-radius: 12px;
  padding: 0.78rem 0.9rem;
  font-size: 0.92rem;
}

.config-page--admin :deep(.workspace-textarea) {
  min-height: 96px;
}

.config-page--admin :deep(.workspace-status-grid) {
  gap: 10px;
}

.config-page--admin :deep(.workspace-status-card) {
  border-radius: 14px;
  padding: 14px;
  gap: 4px;
}

.config-page--admin :deep(.workspace-status-card__title) {
  font-size: 0.95rem;
}

.config-page--admin :deep(.workspace-status-card__description) {
  font-size: 0.8rem;
  line-height: 1.4;
}

.config-page--admin :deep(.workspace-form__actions) {
  margin-top: 2px;
}

.config-page--admin :deep(.workspace-ghost-btn),
.config-page--admin :deep(.workspace-primary-btn) {
  min-height: 36px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 0.82rem;
  gap: 0.45rem;
}

.config-page--admin :deep(.workspace-ghost-btn) {
  align-self: flex-start;
}

.config-page--admin :deep(.workspace-primary-btn) {
  min-height: 40px;
}

.config-page--admin :deep(.workspace-eyebrow),
.config-page--admin :deep(.branding-panel__insight-label),
.config-page--admin :deep(.bank-section__eyebrow),
.config-page--admin :deep(.bank-preview-panel__eyebrow),
.config-page--admin :deep(.network-section__eyebrow),
.config-page--admin :deep(.network-side-card__eyebrow),
.config-page--admin :deep(.payments-section__eyebrow) {
  color: #5e7898;
}

.config-page--admin :deep(.workspace-card__title),
.config-page--admin :deep(.branding-panel__title),
.config-page--admin :deep(.bank-section__title),
.config-page--admin :deep(.bank-preview-panel__title),
.config-page--admin :deep(.network-section__title),
.config-page--admin :deep(.network-side-card__title),
.config-page--admin :deep(.network-ranks__header h3),
.config-page--admin :deep(.payments-section__title),
.config-page--admin :deep(.payments-history-card__title) {
  color: #17314f;
}

.config-page--admin :deep(.workspace-card__subtitle),
.config-page--admin :deep(.bank-section__subtitle),
.config-page--admin :deep(.bank-preview-panel__copy),
.config-page--admin :deep(.network-section__subtitle),
.config-page--admin :deep(.network-side-card__copy),
.config-page--admin :deep(.network-ranks__header p),
.config-page--admin :deep(.payments-section__subtitle) {
  color: #51657f;
}

.config-page--admin :deep(.workspace-input:focus),
.config-page--admin :deep(.workspace-textarea:focus) {
  border-color: rgba(31, 122, 224, 0.42);
  box-shadow: 0 0 0 4px rgba(31, 122, 224, 0.1);
}

.config-page--admin :deep(.workspace-status-card--active) {
  border-color: rgba(31, 122, 224, 0.18);
  background: linear-gradient(135deg, rgba(229, 241, 255, 0.92), rgba(245, 250, 255, 0.98));
}

.config-page--admin :deep(.workspace-loading-block__pulse) {
  background: #1a6ab5;
  box-shadow: 0 0 0 0 rgba(26, 106, 181, 0.28);
}

.config-page--admin :deep(.branding-panel__hero) {
  border-radius: 14px;
  background: linear-gradient(180deg, #1d2a3d 0%, #152033 100%);
  box-shadow: 0 14px 30px rgba(22, 39, 63, 0.18);
}

.config-page--admin :deep(.branding-panel__eyebrow),
.config-page--admin :deep(.branding-panel__label) {
  color: rgba(214, 234, 255, 0.7);
}

.config-page--admin :deep(.branding-panel__confirm-btn),
.config-page--admin :deep(.network-section__primary-btn) {
  background: linear-gradient(135deg, #1f7ae0, #145fbe);
  color: #fff;
}

.config-page--admin :deep(.bank-kpi-card--accent),
.config-page--admin :deep(.network-kpi-card--accent),
.config-page--admin :deep(.payments-kpi-card--accent) {
  background: rgba(238, 245, 255, 0.94);
}

.config-page--admin :deep(.bank-kpi-card--warm),
.config-page--admin :deep(.network-kpi-card--warm),
.config-page--admin :deep(.payments-kpi-card--warm) {
  background: rgba(238, 245, 255, 0.94);
}

.config-page--admin :deep(.network-tree__badge) {
  color: #1f63ae;
}

.config-page--admin :deep(.network-tree__chip) {
  background: rgba(214, 234, 255, 0.88);
  color: #1f63ae;
}

.config-page--admin :deep(.bank-empty-state),
.config-page--admin :deep(.network-empty-state),
.config-page--admin :deep(.payments-empty-state) {
  border-color: #cbd5e1;
  color: #60758d;
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