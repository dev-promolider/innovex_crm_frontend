<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { RefreshCw, Save, X } from 'lucide-vue-next'
import { useI18n } from 'vue-i18n'
import AppButton from '@/components/shared/AppButton.vue'
import PhoneInput from '@/components/shared/PhoneInput.vue'
import type { ProfileDocumentType, UpdateUserProfilePayload, UserProfile } from '../types'

const props = defineProps<{
  profile: UserProfile
  saving: boolean
  errorMessage?: string
  successMessage?: string
  fieldErrors?: Record<string, string>
  isSuperadmin: boolean
  isWorkspaceAdmin: boolean
  roleLabel: string
  workspaceName: string
  workspaceLogo: string
}>()

const emit = defineEmits<{
  submit: [payload: UpdateUserProfilePayload]
  refresh: []
  dirtyChange: [dirty: boolean]
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

const originalForm = reactive({ ...form })
const touched = reactive<Record<string, boolean>>({})

const documentOptions: Array<{ value: ProfileDocumentType; labelKey: string }> = [
  { value: 'dni', labelKey: 'profile.documents.dni' },
  { value: 'cedula', labelKey: 'profile.documents.nationalId' },
  { value: 'pasaporte', labelKey: 'profile.documents.passport' },
  { value: 'ruc', labelKey: 'profile.documents.ruc' },
  { value: 'otro', labelKey: 'profile.documents.other' },
]

const fullName = computed(() => [props.profile.nombre, props.profile.apellido].filter(Boolean).join(' ').trim())
const initials = computed(() => fullName.value
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part.charAt(0).toLocaleUpperCase())
  .join(''))

const documentError = computed(() => {
  const number = form.numero_documento.trim()
  if (!number) return ''

  const valid = form.tipo_documento === 'dni'
    ? /^\d{8}$/.test(number)
    : form.tipo_documento === 'cedula'
      ? /^\d{6,10}$/.test(number)
      : /^[a-zA-Z0-9]{5,20}$/.test(number)

  return valid ? '' : t(`profile.documentValidation.${form.tipo_documento}`)
})

const isDirty = computed(() => Object.keys(originalForm).some((key) => {
  const field = key as keyof UpdateUserProfilePayload
  return (form[field] ?? '') !== (originalForm[field] ?? '')
}))

watch(
  () => props.profile,
  (profile) => {
    form.nombre = profile.nombre ?? ''
    form.apellido = profile.apellido ?? ''
    form.tipo_documento = profile.tipo_documento
    form.numero_documento = profile.numero_documento ?? ''
    form.email = profile.email ?? ''
    form.telefono = profile.telefono ?? ''
    form.direccion = profile.direccion ?? ''

    Object.assign(originalForm, form)
    Object.keys(touched).forEach((key) => delete touched[key])
  },
  { immediate: true },
)

watch(isDirty, (dirty) => emit('dirtyChange', dirty), { immediate: true })

const markTouched = (field: string) => {
  touched[field] = true
}

const fieldError = (field: string) => {
  const formField = field as keyof UpdateUserProfilePayload
  if (formField in originalForm && form[formField] !== originalForm[formField]) return ''
  return props.fieldErrors?.[field] ?? ''
}

const discardChanges = () => {
  Object.assign(form, originalForm)
  Object.keys(touched).forEach((key) => delete touched[key])
}

const handleSubmit = () => {
  if (!isDirty.value || documentError.value) return

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
  <section class="profile-content">
    <article class="identity-card">
      <div class="identity-card__avatar" aria-hidden="true">{{ initials }}</div>
      <div class="identity-card__details">
        <p class="identity-card__eyebrow">{{ t('profile.accountLabel') }}</p>
        <h2 class="identity-card__name">{{ fullName }}</h2>
        <p class="identity-card__email">{{ profile.email }}</p>
      </div>
      <span class="identity-card__role">{{ roleLabel }}</span>
    </article>

    <article v-if="isSuperadmin" class="global-access">
      <span class="global-access__dot" aria-hidden="true" />
      <p>{{ t('profile.globalAccess') }}</p>
    </article>

    <article v-else class="workspace-card">
      <div class="workspace-card__identity">
        <div class="workspace-card__logo">
          <img v-if="workspaceLogo" :src="workspaceLogo" :alt="workspaceName" />
          <span v-else>{{ workspaceName.charAt(0).toLocaleUpperCase() || 'E' }}</span>
        </div>
        <div class="workspace-card__details">
          <p class="workspace-card__eyebrow">{{ t('profile.workspaceTitle') }}</p>
          <h2 class="workspace-card__name">{{ workspaceName || t('profile.workspaceUnavailable') }}</h2>
          <span class="workspace-card__role">{{ roleLabel }}</span>
        </div>
      </div>
      <RouterLink
        v-if="isWorkspaceAdmin"
        class="workspace-card__link"
        :to="{ name: 'configuracion' }"
      >
        {{ t('profile.workspaceSettings') }}
      </RouterLink>
    </article>

    <section class="details-card">
      <header class="details-card__header">
        <div>
          <p class="details-card__eyebrow">{{ t('profile.globalEyebrow') }}</p>
          <h2 class="details-card__title">{{ t('profile.title') }}</h2>
        </div>
        <AppButton type="button" variant="ghost" size="sm" :disabled="saving || isDirty" @click="emit('refresh')">
          <template #leading><RefreshCw class="size-4" /></template>
          {{ t('profile.refresh') }}
        </AppButton>
      </header>

      <form class="profile-form" @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="feedback feedback--error" role="alert">{{ errorMessage }}</div>
        <div v-else-if="successMessage" class="feedback feedback--success" role="status">{{ successMessage }}</div>

        <fieldset class="form-block">
          <legend>{{ t('profile.identityBlock') }}</legend>
          <div class="form-grid">
            <label class="field">
              <span class="field__label">{{ t('profile.fields.firstName') }}</span>
              <input
                v-model="form.nombre"
                class="field__control"
                type="text"
                maxlength="100"
                autocomplete="given-name"
                required
                :aria-invalid="Boolean(fieldError('nombre'))"
                @blur="markTouched('nombre')"
              />
              <span v-if="fieldError('nombre')" class="field__error">{{ fieldError('nombre') }}</span>
            </label>

            <label class="field">
              <span class="field__label">{{ t('profile.fields.lastName') }}</span>
              <input
                v-model="form.apellido"
                class="field__control"
                type="text"
                maxlength="100"
                autocomplete="family-name"
                required
                :aria-invalid="Boolean(fieldError('apellido'))"
                @blur="markTouched('apellido')"
              />
              <span v-if="fieldError('apellido')" class="field__error">{{ fieldError('apellido') }}</span>
            </label>

            <label class="field">
              <span class="field__label">{{ t('profile.fields.documentType') }}</span>
              <select v-model="form.tipo_documento" class="field__control" @blur="markTouched('tipo_documento')">
                <option v-for="option in documentOptions" :key="option.value" :value="option.value">
                  {{ t(option.labelKey) }}
                </option>
              </select>
              <span v-if="fieldError('tipo_documento')" class="field__error">{{ fieldError('tipo_documento') }}</span>
            </label>

            <label class="field">
              <span class="field__label">{{ t('profile.fields.documentNumber') }}</span>
              <input
                v-model="form.numero_documento"
                class="field__control"
                type="text"
                maxlength="20"
                autocomplete="off"
                required
                :aria-invalid="Boolean(fieldError('numero_documento') || (touched.numero_documento && documentError))"
                @blur="markTouched('numero_documento')"
              />
              <span v-if="fieldError('numero_documento')" class="field__error">{{ fieldError('numero_documento') }}</span>
              <span v-else-if="touched.numero_documento && documentError" class="field__error">{{ documentError }}</span>
            </label>
          </div>
        </fieldset>

        <fieldset class="form-block">
          <legend>{{ t('profile.contactBlock') }}</legend>
          <div class="form-grid">
            <label class="field">
              <span class="field__label">{{ t('profile.fields.email') }}</span>
              <input
                :value="form.email"
                class="field__control field__control--readonly"
                type="email"
                readonly
                autocomplete="email"
                aria-readonly="true"
              />
            </label>

            <div class="field">
              <label class="field__label" for="profile-phone">{{ t('profile.fields.phone') }}</label>
              <PhoneInput
                id="profile-phone"
                v-model="form.telefono"
                class="field__phone"
                :required="true"
                :invalid="Boolean(fieldError('telefono'))"
              />
              <span v-if="fieldError('telefono')" class="field__error">{{ fieldError('telefono') }}</span>
            </div>

            <label class="field field--wide">
              <span class="field__label">{{ t('profile.fields.address') }}</span>
              <textarea
                v-model="form.direccion"
                class="field__control field__control--textarea"
                rows="3"
                maxlength="255"
                autocomplete="street-address"
                :placeholder="t('common.optional')"
              />
              <span v-if="fieldError('direccion')" class="field__error">{{ fieldError('direccion') }}</span>
            </label>
          </div>
        </fieldset>

        <div class="save-bar">
          <AppButton type="button" variant="ghost" :disabled="saving || !isDirty" @click="discardChanges">
            <template #leading><X class="size-4" /></template>
            {{ t('profile.discard') }}
          </AppButton>
          <AppButton type="submit" variant="primary" :disabled="saving || !isDirty || Boolean(documentError)">
            <template #leading>
              <span v-if="saving" class="save-spinner" aria-hidden="true" />
              <Save v-else class="size-4" />
            </template>
            {{ saving ? t('common.saving') : t('profile.saveChanges') }}
          </AppButton>
        </div>
      </form>
    </section>
  </section>
</template>

<style scoped>
.profile-content {
  display: grid;
  gap: 16px;
}

.identity-card,
.workspace-card,
.details-card {
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 12px 28px rgba(31, 53, 84, 0.06);
}

.identity-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 24px;
}

.identity-card__avatar,
.workspace-card__logo {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  color: #fff;
  font-weight: 800;
}

.identity-card__avatar {
  width: 68px;
  height: 68px;
  background: linear-gradient(135deg, #3eb5f5, #1768b8);
  font-size: 1.35rem;
}

.identity-card__details,
.workspace-card__details {
  min-width: 0;
}

.identity-card__eyebrow,
.workspace-card__eyebrow,
.details-card__eyebrow {
  margin: 0 0 5px;
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.identity-card__name,
.workspace-card__name {
  overflow-wrap: anywhere;
  margin: 0;
  color: #14243a;
  font-size: 1.2rem;
}

.identity-card__email {
  overflow-wrap: anywhere;
  margin: 4px 0 0;
  color: #64748b;
}

.identity-card__role,
.workspace-card__role {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  background: #eaf4ff;
  color: #195b9b;
  font-size: 0.78rem;
  font-weight: 700;
}

.identity-card__role {
  margin-left: auto;
}

.workspace-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 24px;
}

.workspace-card__identity {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 14px;
}

.workspace-card__logo {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, #3eb5f5, #1768b8);
}

.workspace-card__logo img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.workspace-card__name {
  margin-bottom: 7px;
  font-size: 1rem;
}

.workspace-card__link {
  flex: 0 0 auto;
  padding: 8px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  color: #174f85;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
}

.workspace-card__link:hover {
  background: #f1f7fd;
}

.global-access {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 13px 16px;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  background: #f5f9ff;
  color: #345a7e;
  font-size: 0.9rem;
}

.global-access p {
  margin: 0;
}

.global-access__dot {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #3b82f6;
}

.details-card {
  padding: 24px;
}

.details-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.details-card__title {
  margin: 0;
  color: #14243a;
  font-size: 1.35rem;
}

.profile-form {
  display: grid;
  gap: 16px;
}

.form-block {
  min-width: 0;
  margin: 0;
  padding: 16px;
  border: 1px solid #e5eaf0;
  border-radius: 16px;
}

.form-block legend {
  padding: 0 8px;
  color: #203b59;
  font-weight: 750;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  min-width: 0;
  align-content: start;
  gap: 8px;
}

.field--wide {
  grid-column: 1 / -1;
}

.field__label {
  color: #334b66;
  font-size: 0.86rem;
  font-weight: 700;
}

.field__control {
  width: 100%;
  min-height: 48px;
  box-sizing: border-box;
  padding: 8px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #fff;
  color: #14243a;
  font: inherit;
}

.field__control--textarea {
  resize: vertical;
}

.field__control--readonly {
  background: #f1f5f9;
  color: #52657a;
  cursor: not-allowed;
}

.field__control:focus-visible,
.workspace-card__link:focus-visible {
  outline: 3px solid rgba(31, 122, 224, 0.55);
  outline-offset: 2px;
}

.field__phone {
  min-width: 0;
}

.field__error {
  color: #b42318;
  font-size: 0.8rem;
}

.save-bar {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 2px;
}

.save-spinner {
  width: 15px;
  height: 15px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.feedback {
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
}

.feedback--error {
  background: #fff1f0;
  color: #a12b24;
}

.feedback--success {
  background: #eaf8f0;
  color: #17623d;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 680px) {
  .identity-card {
    flex-wrap: wrap;
    padding: 16px;
  }

  .identity-card__role {
    margin-left: 84px;
  }

  .workspace-card {
    align-items: flex-start;
    flex-direction: column;
    padding: 18px;
  }

  .details-card {
    padding: 18px;
  }

  .details-card__header {
    align-items: flex-start;
  }

  .form-block {
    padding: 14px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .field--wide {
    grid-column: auto;
  }

  .save-bar {
    flex-direction: column-reverse;
  }

  .save-bar :deep(.app-button) {
    width: 100%;
  }
}
</style>
