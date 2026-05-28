<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { LockKeyhole, ShieldCheck } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/shared/AppButton.vue'
import type { UpdateUserPasswordPayload } from '../types'

const props = defineProps<{
  saving: boolean
  errorMessage?: string
  successMessage?: string
  resetCounter?: number
}>()

const emit = defineEmits<{
  submit: [payload: UpdateUserPasswordPayload]
}>()

const { t } = useI18n()

const form = reactive({
  password: '',
  passwordConfirmation: '',
})

const mismatchMessage = computed(() => {
  if (form.password.length === 0 || form.passwordConfirmation.length === 0) {
    return ''
  }

  return form.password === form.passwordConfirmation ? '' : t('profile.passwordMismatch')
})

watch(
  () => props.resetCounter,
  () => {
    form.password = ''
    form.passwordConfirmation = ''
  },
)

const handleSubmit = () => {
  if (form.password.length < 8) {
    return
  }

  if (mismatchMessage.value.length > 0) {
    return
  }

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
        <p class="password-card__subtitle">
          {{ t('profile.securitySubtitle') }}
        </p>
      </div>

      <div class="password-card__badge">
        <ShieldCheck class="size-4" />
        {{ t('profile.securityBadge') }}
      </div>
    </div>

    <form class="password-form" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="password-feedback password-feedback--error">{{ errorMessage }}</div>
      <div v-else-if="successMessage" class="password-feedback password-feedback--success">{{ successMessage }}</div>

      <div class="password-form__grid">
        <label class="password-field">
          <span class="password-field__label">{{ t('profile.passwordNew') }}</span>
          <input
            v-model="form.password"
            class="password-input"
            type="password"
            minlength="8"
            maxlength="72"
            autocomplete="new-password"
            required
          />
          <span class="password-field__hint">{{ t('profile.passwordHint') }}</span>
        </label>

        <label class="password-field">
          <span class="password-field__label">{{ t('profile.passwordConfirm') }}</span>
          <input
            v-model="form.passwordConfirmation"
            class="password-input"
            type="password"
            minlength="8"
            maxlength="72"
            autocomplete="new-password"
            required
          />
          <span v-if="mismatchMessage" class="password-field__hint password-field__hint--error">
            {{ mismatchMessage }}
          </span>
        </label>
      </div>

      <div class="password-form__actions">
        <AppButton
          type="submit"
          variant="secondary"
          :disabled="saving || form.password.length < 8 || mismatchMessage.length > 0"
        >
          <template #leading>
            <LockKeyhole class="size-4" />
          </template>
          {{ saving ? t('profile.passwordUpdating') : t('profile.passwordUpdate') }}
        </AppButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.password-card {
  border-radius: 28px;
  border: 1px solid rgba(24, 42, 67, 0.1);
  background:
    radial-gradient(circle at top right, rgba(31, 122, 224, 0.08), transparent 30%),
    linear-gradient(180deg, rgba(19, 33, 54, 0.98), rgba(15, 24, 40, 0.96));
  box-shadow: 0 26px 60px rgba(11, 20, 37, 0.18);
  color: #eff5fb;
  padding: 28px;
}

.password-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.password-card__eyebrow {
  margin: 0 0 8px;
  color: #8dc5ff;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.password-card__title {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 700;
}

.password-card__subtitle {
  margin: 8px 0 0;
  max-width: 44ch;
  color: rgba(225, 234, 245, 0.8);
  font-size: 0.95rem;
  line-height: 1.6;
}

.password-card__badge {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #cfe3fb;
  font-size: 0.82rem;
  font-weight: 700;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.password-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.password-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.password-field__label {
  font-size: 0.86rem;
  font-weight: 700;
  color: #e7eef7;
}

.password-field__hint {
  color: rgba(206, 220, 236, 0.75);
  font-size: 0.78rem;
}

.password-field__hint--error {
  color: #ffb4b4;
}

.password-input {
  min-height: 48px;
  padding: 0 14px;
  border-radius: 16px;
  border: 1px solid rgba(168, 190, 219, 0.18);
  background: rgba(255, 255, 255, 0.06);
  color: #f8fbff;
  font: inherit;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.password-input:focus {
  outline: none;
  border-color: rgba(115, 180, 255, 0.5);
  box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.16);
  background: rgba(255, 255, 255, 0.08);
}

.password-feedback {
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 0.92rem;
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
  justify-content: flex-start;
}

@media (max-width: 768px) {
  .password-card {
    padding: 20px;
    border-radius: 24px;
  }

  .password-card__header {
    flex-direction: column;
  }

  .password-form__grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }
}
</style>
