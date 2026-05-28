<script setup lang="ts">
import { onMounted, shallowRef } from 'vue'
import ProfileForm from './ProfileForm.vue'
import PasswordChangeForm from './PasswordChangeForm.vue'
import ProfileLocaleSettings from './ProfileLocaleSettings.vue'
import { useProfileApi } from '../composables/useProfileApi'
import type { UpdateUserPasswordPayload, UpdateUserProfilePayload } from '../types'

const {
  profile,
  isLoading,
  isSavingProfile,
  isSavingPassword,
  profileErrorMessage,
  profileSuccessMessage,
  passwordErrorMessage,
  passwordSuccessMessage,
  fetchProfile,
  updateProfile,
  updatePassword,
} = useProfileApi()

const passwordResetCounter = shallowRef(0)

const handleRefresh = async () => {
  try {
    await fetchProfile()
  } catch {
    // Error state is already exposed by the composable.
  }
}

const handleProfileSubmit = async (payload: UpdateUserProfilePayload) => {
  try {
    await updateProfile(payload)
  } catch {
    // Error state is already exposed by the composable.
  }
}

const handlePasswordSubmit = async (payload: UpdateUserPasswordPayload) => {
  try {
    await updatePassword(payload)
    passwordResetCounter.value += 1
  } catch {
    // Error state is already exposed by the composable.
  }
}

onMounted(async () => {
  try {
    await fetchProfile()
  } catch {
    // Error state is already exposed by the composable.
  }
})
</script>

<template>
  <div class="profile-page">
    <div class="profile-page__main">
      <ProfileForm
        :profile="profile"
        :loading="isLoading"
        :saving="isSavingProfile"
        :error-message="profileErrorMessage"
        :success-message="profileSuccessMessage"
        @refresh="handleRefresh"
        @submit="handleProfileSubmit"
      />

      <ProfileLocaleSettings />
    </div>

    <PasswordChangeForm
      :saving="isSavingPassword"
      :error-message="passwordErrorMessage"
      :success-message="passwordSuccessMessage"
      :reset-counter="passwordResetCounter"
      @submit="handlePasswordSubmit"
    />
  </div>
</template>

<style scoped>
.profile-page {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(320px, 0.9fr);
  gap: 24px;
  align-items: start;
}

.profile-page__main {
  display: grid;
  gap: 24px;
}

@media (max-width: 1100px) {
  .profile-page {
    grid-template-columns: 1fr;
  }
}
</style>
