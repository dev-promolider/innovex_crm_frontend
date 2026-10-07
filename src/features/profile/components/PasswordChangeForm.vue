<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/shared/AppButton.vue'
import type { UpdateUserPasswordPayload } from '../types'

const props = defineProps<{
  saving: boolean
  errorMessage?: string
  successMessage?: string
  resetCounter?: number
  fieldErrors?: Record<string, string>
}>()

const emit = defineEmits<{
  submit: [payload: UpdateUserPasswordPayload]
}>()

const { t } = useI18n()

const form = reactive({
  currentPassword: '',
  password: '',
  passwordConfirmation: '',
})
const showCurrentPassword = reactive({ value: false })
const showNewPassword = reactive({ value: false })

const hasMinimumLength = computed(() => form.password.length >= 8)
const hasLetter = computed(() => /[a-zA-Z]/.test(form.password))
const hasNumber = computed(() => /\d/.test(form.password))
const passwordsMatch = computed(() => form.password.length > 0
  && form.passwordConfirmation.length > 0
  && form.password === form.passwordConfirmation)
const strength = computed(() => [hasMinimumLength.value, hasLetter.value, hasNumber.value]
  .filter(Boolean).length)
const canSubmit = computed(() => form.currentPassword.length > 0
  && strength.value === 3
  && passwordsMatch.value
  && !props.saving)

watch(
  () => props.resetCounter,
  () => {
    form.currentPassword = ''
    form.password = ''
    form.passwordConfirmation = ''
  },
)

const handleSubmit = () => {
  if (!canSubmit.value) return

  emit('submit', {
    password: form.password,
    password_confirmation: form.passwordConfirmation,
  })
}
</script>

<template>
  <section class="password-card">
    <div class="password-card__header">
      <div>
        <p class="password-card__eyebrow">{{ t('profile.securityEyebrow') }}</p>
        <h2 class="password-card__title">{{ t('profile.securityTitle') }}</h2>
        <p class="password-card__subtitle">{{ t('profile.securitySubtitle') }}</p>
      </div>
      <div class="password-card__badge"><ShieldCheck class="size-4" />{{ t('profile.securityBadge') }}</div>
    </div>

    <form class="password-form" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="password-feedback password-feedback--error" role="alert">
        {{ errorMessage }}
      </div>
      <div v-else-if="successMessage" class="password-feedback password-feedback--success" role="status">
        {{ successMessage }}
      </div>

      <p class="password-notice">{{ t('profile.currentPasswordNotice') }}</p>

      <div class="password-field">
        <label class="password-field__label" for="profile-current-password">{{ t('profile.passwordCurrent') }}</label>
        <div class="password-input-wrap">
          <input
            id="profile-current-password"
            v-model="form.currentPassword"
            class="password-input"
            :type="showCurrentPassword.value ? 'text' : 'password'"
            autocomplete="current-password"
            required
            :aria-invalid="Boolean(fieldErrors?.current_password)"
          />
          <button
            class="password-toggle"
            type="button"
            :aria-label="showCurrentPassword.value ? t('profile.hidePassword') : t('profile.showPassword')"
            @click="showCurrentPassword.value = !showCurrentPassword.value"
          >
            <EyeOff v-if="showCurrentPassword.value" class="size-4" />
            <Eye v-else class="size-4" />
          </button>
        </div>
        <span v-if="fieldErrors?.current_password" class="password-field__error">
          {{ fieldErrors.current_password }}
        </span>
      </div>

      <div class="password-field">
        <label class="password-field__label" for="profile-new-password">{{ t('profile.passwordNew') }}</label>
        <div class="password-input-wrap">
          <input
            id="profile-new-password"
            v-model="form.password"
            class="password-input"
            :type="showNewPassword.value ? 'text' : 'password'"
            minlength="8"
            maxlength="72"
            autocomplete="new-password"
            required
            :aria-invalid="Boolean(fieldErrors?.password)"
          />
          <button
            class="password-toggle"
            type="button"
            :aria-label="showNewPassword.value ? t('profile.hidePassword') : t('profile.showPassword')"
            @click="showNewPassword.value = !showNewPassword.value"
          >
            <EyeOff v-if="showNewPassword.value" class="size-4" />
            <Eye v-else class="size-4" />
          </button>
        </div>
        <div class="password-strength" :aria-label="t('profile.passwordStrength')">
          <span
            v-for="index in 3"
            :key="index"
            class="password-strength__segment"
            :class="{ 'password-strength__segment--active': strength >= index }"
          />
          <span class="password-strength__label">{{ t(`profile.strength.${strength}`) }}</span>
        </div>
        <ul class="password-checklist">
          <li :class="{ 'password-checklist__item--valid': hasMinimumLength }">
            {{ t('profile.passwordRules.minimum') }}
          </li>
          <li :class="{ 'password-checklist__item--valid': hasLetter }">{{ t('profile.passwordRules.letter') }}</li>
          <li :class="{ 'password-checklist__item--valid': hasNumber }">{{ t('profile.passwordRules.number') }}</li>
        </ul>
        <span v-if="fieldErrors?.password" class="password-field__error">{{ fieldErrors.password }}</span>
      </div>

      <div class="password-field">
        <label class="password-field__label" for="profile-confirm-password">{{ t('profile.passwordConfirm') }}</label>
        <input
          id="profile-confirm-password"
          v-model="form.passwordConfirmation"
          class="password-input"
          type="password"
          minlength="8"
          maxlength="72"
          autocomplete="new-password"
          required
          :aria-invalid="Boolean(fieldErrors?.password_confirmation || (form.passwordConfirmation && !passwordsMatch))"
        />
        <span
          class="password-checklist__item"
          :class="{ 'password-checklist__item--valid': passwordsMatch }"
        >
          {{ t('profile.passwordRules.match') }}
        </span>
        <span v-if="fieldErrors?.password_confirmation" class="password-field__error">
          {{ fieldErrors.password_confirmation }}
        </span>
      </div>

      <div class="password-form__actions">
        <AppButton type="submit" variant="secondary" :disabled="!canSubmit">
          <template #leading>
            <span v-if="saving" class="password-spinner" aria-hidden="true" />
            <LockKeyhole v-else class="size-4" />
          </template>
          {{ saving ? t('profile.passwordUpdating') : t('profile.passwordUpdate') }}
        </AppButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.password-card {
  border-radius: 20px;
  border: 1px solid rgba(24, 42, 67, 0.1);
  background: linear-gradient(180deg, #17263f, #111c30);
  box-shadow: 0 20px 44px rgba(11, 20, 37, 0.14);
  color: #eff5fb;
  padding: 24px;
}

.password-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
}

.password-card__eyebrow {
  margin: 0 0 8px;
  color: #8dc5ff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.password-card__title {
  margin: 0;
  font-size: 1.4rem;
}

.password-card__subtitle {
  margin: 8px 0 0;
  color: #cfdaea;
  font-size: 0.92rem;
  line-height: 1.5;
}

.password-card__badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  align-self: flex-start;
  gap: 8px;
  min-height: 36px;
  padding: 0 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #cfe3fb;
  font-size: 0.82rem;
  font-weight: 700;
}

.password-form {
  display: grid;
  gap: 16px;
}

.password-notice {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid rgba(255, 208, 128, 0.26);
  border-radius: 10px;
  background: rgba(255, 208, 128, 0.08);
  color: #ffe3ad;
  font-size: 0.83rem;
  line-height: 1.45;
}

.password-field {
  display: grid;
  gap: 8px;
}

.password-field__label {
  color: #e7eef7;
  font-size: 0.86rem;
  font-weight: 700;
}

.password-input-wrap {
  position: relative;
}

.password-input {
  width: 100%;
  min-height: 46px;
  box-sizing: border-box;
  padding: 0 46px 0 13px;
  border-radius: 10px;
  border: 1px solid rgba(168, 190, 219, 0.3);
  background: rgba(255, 255, 255, 0.07);
  color: #f8fbff;
  font: inherit;
}

.password-field > .password-input {
  padding-right: 13px;
}

.password-input:focus-visible,
.password-toggle:focus-visible {
  outline: 3px solid #75b5ff;
  outline-offset: 2px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 8px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  transform: translateY(-50%);
  border: 0;
  border-radius: 7px;
  background: transparent;
  color: #dbeafe;
  cursor: pointer;
}

.password-strength {
  display: flex;
  align-items: center;
  gap: 7px;
}

.password-strength__segment {
  width: 36px;
  height: 5px;
  border-radius: 999px;
  background: #40506a;
}

.password-strength__segment--active {
  background: #4ade80;
}

.password-strength__label {
  margin-left: 3px;
  color: #cfdaea;
  font-size: 0.78rem;
}

.password-checklist {
  display: grid;
  gap: 5px;
  margin: 0;
  padding: 0;
  color: #c1ccdb;
  font-size: 0.8rem;
  list-style: none;
}

.password-checklist__item::before,
.password-checklist li::before {
  content: '○';
  display: inline-block;
  width: 20px;
  color: #a8b6c9;
}

.password-checklist__item--valid {
  color: #adf0c5;
}

.password-checklist__item--valid::before {
  content: '✓';
  color: #4ade80;
}

.password-field__error {
  color: #ffb4b4;
  font-size: 0.8rem;
}

.password-feedback {
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
}

.password-feedback--error {
  background: rgba(205, 92, 92, 0.16);
  color: #ffd7d7;
}

.password-feedback--success {
  background: rgba(48, 161, 112, 0.18);
  color: #d4ffeb;
}

.password-form__actions {
  display: flex;
}

.password-form__actions :deep(.app-button:disabled) {
  opacity: 1;
  background: #344158;
  color: #e5eaf1;
  border-color: #516078;
}

.password-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 600px) {
  .password-card {
    padding: 18px;
  }

  .password-card__header {
    flex-direction: column;
  }
}
</style>
