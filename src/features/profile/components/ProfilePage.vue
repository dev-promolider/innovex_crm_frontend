<script setup lang="ts">
import { computed, onMounted, shallowRef } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/shared/AppButton.vue'
import ProfileForm from './ProfileForm.vue'
import PasswordChangeForm from './PasswordChangeForm.vue'
import ProfileLocaleSettings from './ProfileLocaleSettings.vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { useWorkspaceConfiguracionApi } from '@/features/configuracion/composables/useWorkspaceConfiguracionApi'
import { useProfileApi } from '../composables/useProfileApi'
import type { UpdateUserPasswordPayload, UpdateUserProfilePayload } from '../types'

const {
  profile,
  isLoading,
  isSavingProfile,
  isSavingPassword,
  profileErrorMessage,
  profileSuccessMessage,
  profileFieldErrors,
  passwordErrorMessage,
  passwordSuccessMessage,
  passwordFieldErrors,
  fetchProfile,
  updateProfile,
  updatePassword,
} = useProfileApi()

const { isSuperadmin, workspaceRole, workspaceLogo, empresaId } = useAuthenticatedSession()
const {
  profile: workspaceProfile,
  fetchProfile: fetchWorkspaceProfile,
} = useWorkspaceConfiguracionApi()
const { t } = useI18n()

const passwordResetCounter = shallowRef(0)
const isDirty = shallowRef(false)
const workspaceLoadError = shallowRef(false)
const roleLabel = computed(() => {
  if (isSuperadmin.value) return t('profile.roles.superadmin')
  if (workspaceRole.value === 'administrador_empresa') return t('profile.roles.companyAdmin')
  if (workspaceRole.value === 'administrador_financiero') return t('profile.roles.financialAdmin')
  return t('profile.roles.unknown')
})
const workspaceName = computed(() => workspaceProfile.value?.nombre_visible ?? '')

const loadWorkspaceProfile = async () => {
  if (isSuperadmin.value || !empresaId.value) return

  workspaceLoadError.value = false
  try {
    await fetchWorkspaceProfile()
  } catch {
    workspaceLoadError.value = true
  }
}

const handleRefresh = async () => {
  try {
    await fetchProfile()
  } catch {
    // The composable exposes a safe error message for the view.
  }
}

const handleProfileSubmit = async (payload: UpdateUserProfilePayload) => {
  try {
    await updateProfile(payload)
  } catch {
    // The composable exposes validation errors and a safe error message.
  }
}

const handlePasswordSubmit = async (payload: UpdateUserPasswordPayload) => {
  try {
    await updatePassword(payload)
    passwordResetCounter.value += 1
  } catch {
    // The composable exposes a safe error message for the view.
  }
}

const confirmDiscard = () => !isDirty.value || window.confirm(t('profile.confirmDiscard'))

onBeforeRouteLeave(() => confirmDiscard())

onMounted(async () => {
  const requests: Promise<unknown>[] = [fetchProfile()]
  if (!isSuperadmin.value && empresaId.value) requests.push(loadWorkspaceProfile())

  await Promise.allSettled(requests)
})
</script>

<template>
  <div class="profile-page">
    <template v-if="profile">
      <ProfileForm
        :profile="profile"
        :saving="isSavingProfile"
        :error-message="profileErrorMessage"
        :success-message="profileSuccessMessage"
        :field-errors="profileFieldErrors"
        :is-superadmin="isSuperadmin"
        :is-workspace-admin="workspaceRole === 'administrador_empresa'"
        :role-label="roleLabel"
        :workspace-name="workspaceName"
        :workspace-logo="workspaceLogo"
        @dirty-change="isDirty = $event"
        @refresh="handleRefresh"
        @submit="handleProfileSubmit"
      />
      <p v-if="workspaceLoadError && !isSuperadmin" class="workspace-error" role="status">
        {{ t('profile.workspaceLoadError') }}
        <button type="button" class="workspace-error__retry" @click="loadWorkspaceProfile">
          {{ t('profile.retry') }}
        </button>
      </p>
    </template>

    <section v-else-if="isLoading" class="profile-skeleton" aria-label="Cargando perfil" aria-busy="true">
      <div class="skeleton-card skeleton-card--identity">
        <span class="skeleton skeleton--avatar" />
        <span class="skeleton-copy">
          <span class="skeleton skeleton--line" />
          <span class="skeleton skeleton--line skeleton--short" />
        </span>
      </div>
      <div class="skeleton-card skeleton-card--form">
        <span class="skeleton skeleton--heading" />
        <span v-for="index in 6" :key="index" class="skeleton skeleton--field" />
      </div>
    </section>

    <section v-else class="load-error" role="alert">
      <h2>{{ t('profile.loadErrorTitle') }}</h2>
      <p>{{ t('profile.loadErrorMessage') }}</p>
      <AppButton variant="ghost" :disabled="isLoading" @click="handleRefresh">
        {{ t('profile.retry') }}
      </AppButton>
    </section>

    <ProfileLocaleSettings />

    <PasswordChangeForm
      :saving="isSavingPassword"
      :error-message="passwordErrorMessage"
      :success-message="passwordSuccessMessage"
      :field-errors="passwordFieldErrors"
      :reset-counter="passwordResetCounter"
      @submit="handlePasswordSubmit"
    />
  </div>
</template>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.profile-skeleton {
  display: grid;
  gap: 16px;
}

.skeleton-card {
  display: grid;
  gap: 18px;
  padding: 24px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
}

.skeleton-card--identity {
  grid-template-columns: 68px 1fr;
  align-items: center;
}

.skeleton-copy {
  display: grid;
  gap: 10px;
}

.skeleton {
  display: block;
  border-radius: 8px;
  background: linear-gradient(90deg, #edf1f5 25%, #f8fafc 50%, #edf1f5 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s ease infinite;
}

.skeleton--avatar {
  width: 68px;
  height: 68px;
  border-radius: 50%;
}

.skeleton--line {
  width: min(280px, 80%);
  height: 16px;
}

.skeleton--short {
  width: min(180px, 55%);
}

.skeleton--heading {
  width: min(220px, 70%);
  height: 24px;
}

.skeleton--field {
  width: 100%;
  height: 44px;
}

.load-error {
  display: grid;
  justify-items: start;
  gap: 12px;
  padding: 24px;
  border: 1px solid #fee2e2;
  border-radius: 18px;
  background: #fff;
}

.load-error h2,
.load-error p {
  margin: 0;
}

.load-error h2 {
  color: #7f1d1d;
  font-size: 1.15rem;
}

.load-error p {
  color: #64748b;
}

.workspace-error {
  margin: -6px 0 0;
  color: #64748b;
  font-size: 0.85rem;
}

.workspace-error__retry {
  margin-left: 6px;
  padding: 0;
  border: 0;
  background: none;
  color: #155e9b;
  font: inherit;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
}

.workspace-error__retry:focus-visible {
  outline: 2px solid #2263e5;
  outline-offset: 2px;
}

@keyframes shimmer {
  to { background-position: -200% 0; }
}

@media (prefers-reduced-motion: reduce) {
  .skeleton {
    animation: none;
  }
}
</style>
