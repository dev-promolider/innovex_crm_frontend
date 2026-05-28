<script setup lang="ts">
import { reactive, watch } from 'vue'
import { RefreshCw, Save } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/shared/AppButton.vue'
import type { UpdateUserProfilePayload, UserProfile } from '../types'

const props = defineProps<{
  profile: UserProfile | null
  loading: boolean
  saving: boolean
  errorMessage?: string
  successMessage?: string
}>()

const emit = defineEmits<{
  submit: [payload: UpdateUserProfilePayload]
  refresh: []
}>()

const { t } = useI18n()

const form = reactive<UpdateUserProfilePayload>({
  nombre: '',
  apellido: '',
  tipo_documento: 'dni',
  numero_documento: '',
  email: '',
  telefono: '',
  direccion: '',
})

watch(
  () => props.profile,
  (profile) => {
    if (!profile) {
      return
    }

    form.nombre = profile.nombre ?? ''
    form.apellido = profile.apellido ?? ''
    form.tipo_documento = profile.tipo_documento
    form.numero_documento = profile.numero_documento ?? ''
    form.email = profile.email ?? ''
    form.telefono = profile.telefono ?? ''
    form.direccion = profile.direccion ?? ''
  },
  { immediate: true },
)

const documentOptions = [
  { value: 'dni', labelKey: 'profile.documents.dni' },
  { value: 'pasaporte', labelKey: 'profile.documents.passport' },
  { value: 'cedula', labelKey: 'profile.documents.nationalId' },
  { value: 'ruc', labelKey: 'profile.documents.ruc' },
  { value: 'otro', labelKey: 'profile.documents.other' },
] as const

const handleSubmit = () => {
  emit('submit', {
    nombre: form.nombre.trim(),
    apellido: form.apellido.trim(),
    tipo_documento: form.tipo_documento,
    numero_documento: form.numero_documento.trim(),
    email: form.email.trim(),
    telefono: form.telefono.trim(),
    direccion: form.direccion?.trim() || null,
  })
}
</script>

<template>
  <section class="profile-card">
    <div class="profile-card__header">
      <div>
        <p class="profile-card__eyebrow">{{ t('profile.globalEyebrow') }}</p>
        <h2 class="profile-card__title">{{ t('profile.title') }}</h2>
        <p class="profile-card__subtitle">
          {{ t('profile.subtitle') }}
        </p>
      </div>

      <AppButton type="button" variant="ghost" size="sm" :disabled="loading || saving" @click="emit('refresh')">
        <template #leading>
          <RefreshCw class="size-4" />
        </template>
        {{ t('common.refresh') }}
      </AppButton>
    </div>

    <div v-if="loading" class="profile-card__loading">
      <span class="profile-card__pulse" />
      <span>{{ t('profile.loading') }}</span>
    </div>

    <form v-else class="profile-form" @submit.prevent="handleSubmit">
      <div v-if="errorMessage" class="profile-feedback profile-feedback--error">{{ errorMessage }}</div>
      <div v-else-if="successMessage" class="profile-feedback profile-feedback--success">{{ successMessage }}</div>

      <div class="profile-form__grid">
        <label class="profile-field">
          <span class="profile-field__label">{{ t('profile.fields.firstName') }}</span>
          <input v-model="form.nombre" class="profile-input" type="text" maxlength="100" required />
        </label>

        <label class="profile-field">
          <span class="profile-field__label">{{ t('profile.fields.lastName') }}</span>
          <input v-model="form.apellido" class="profile-input" type="text" maxlength="100" required />
        </label>

        <label class="profile-field">
          <span class="profile-field__label">{{ t('profile.fields.documentType') }}</span>
          <select v-model="form.tipo_documento" class="profile-input profile-input--select">
            <option v-for="option in documentOptions" :key="option.value" :value="option.value">
              {{ t(option.labelKey) }}
            </option>
          </select>
        </label>

        <label class="profile-field">
          <span class="profile-field__label">{{ t('profile.fields.documentNumber') }}</span>
          <input v-model="form.numero_documento" class="profile-input" type="text" maxlength="30" required />
        </label>

        <label class="profile-field">
          <span class="profile-field__label">{{ t('profile.fields.email') }}</span>
          <input v-model="form.email" class="profile-input" type="email" maxlength="180" required />
        </label>

        <label class="profile-field">
          <span class="profile-field__label">{{ t('profile.fields.phone') }}</span>
          <input v-model="form.telefono" class="profile-input" type="text" maxlength="30" required />
        </label>

        <label class="profile-field profile-field--wide">
          <span class="profile-field__label">{{ t('profile.fields.address') }}</span>
          <textarea
            v-model="form.direccion"
            class="profile-textarea"
            rows="4"
            maxlength="255"
            :placeholder="t('common.optional')"
          />
        </label>
      </div>

      <div class="profile-form__actions">
        <AppButton type="submit" variant="primary" :disabled="saving">
          <template #leading>
            <Save class="size-4" />
          </template>
          {{ saving ? t('common.saving') : t('common.save') }}
        </AppButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.profile-card {
  border-radius: 28px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(247, 250, 253, 0.92) 100%),
    #ffffff;
  box-shadow: 0 24px 60px rgba(31, 53, 84, 0.08);
  padding: 28px;
}

.profile-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.profile-card__eyebrow {
  margin: 0 0 8px;
  color: #9a6b2f;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.profile-card__title {
  margin: 0;
  font-size: 1.55rem;
  font-weight: 700;
  color: #1d2433;
}

.profile-card__subtitle {
  margin: 8px 0 0;
  max-width: 56ch;
  color: #5d697d;
  font-size: 0.95rem;
  line-height: 1.6;
}

.profile-card__loading {
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border-radius: 20px;
  background: rgba(238, 244, 250, 0.76);
  color: #526178;
  font-weight: 600;
}

.profile-card__pulse {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #1f7ae0;
  animation: pulse 1.1s ease-in-out infinite;
}

.profile-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.profile-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.profile-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.profile-field--wide {
  grid-column: 1 / -1;
}

.profile-field__label {
  color: #35506e;
  font-size: 0.86rem;
  font-weight: 700;
}

.profile-input,
.profile-textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  color: #112033;
  font: inherit;
  transition: border-color 0.16s ease, box-shadow 0.16s ease, background-color 0.16s ease;
}

.profile-input {
  min-height: 48px;
  padding: 0 14px;
}

.profile-input--select {
  appearance: none;
}

.profile-textarea {
  padding: 14px;
  resize: vertical;
}

.profile-input:focus,
.profile-textarea:focus {
  outline: none;
  border-color: rgba(31, 122, 224, 0.48);
  box-shadow: 0 0 0 4px rgba(31, 122, 224, 0.12);
}

.profile-feedback {
  border-radius: 16px;
  padding: 14px 16px;
  font-size: 0.92rem;
  font-weight: 600;
}

.profile-feedback--error {
  background: rgba(155, 38, 38, 0.1);
  color: #8b2c2c;
}

.profile-feedback--success {
  background: rgba(25, 135, 84, 0.12);
  color: #1e6b49;
}

.profile-form__actions {
  display: flex;
  justify-content: flex-end;
}

@keyframes pulse {
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1); }
}

@media (max-width: 768px) {
  .profile-card {
    padding: 20px;
    border-radius: 24px;
  }

  .profile-card__header {
    flex-direction: column;
    align-items: stretch;
  }

  .profile-form__grid {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .profile-form__actions {
    justify-content: stretch;
  }
}
</style>
