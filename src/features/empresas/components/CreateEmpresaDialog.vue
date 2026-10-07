<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import PhoneInput from '@/components/shared/PhoneInput.vue'
import { useWorkspaceCurrency } from '@/composables/useWorkspaceCurrency'
import { countries } from '@/utils/countries'
import type { CreateEmpresaPayload, CreateEmpresaResult } from '../types'

interface Props {
  open: boolean
  submitting: boolean
  serverErrors?: Record<string, string>
  successResult?: CreateEmpresaResult | null
}

const props = withDefaults(defineProps<Props>(), {
  serverErrors: () => ({}),
  successResult: null,
})

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: CreateEmpresaPayload]
}>()

const { formatCurrency } = useWorkspaceCurrency()

const form = reactive({
  nombre: '',
  nombre_comercial: '',
  ruc_nit: '',
  color_primario: '#0c1727',
  color_secundario: '#4590ff',
  moneda_iso: 'USD',
  zona_horaria: 'America/Lima',
  email_contacto: '',
  telefono_contacto: '',
  sitio_web: '',
  plan_saas: 'growth',
  max_distribuidores: '',
  admin_nombre: '',
  admin_apellido: '',
  admin_email: '',
  admin_telefono: '',
  admin_tipo_documento: 'dni',
  admin_numero_documento: '',
  admin_direccion: '',
})

const logo = ref<File | null>(null)
const logoPreviewUrl = ref<string | null>(null)
const isDragOver = ref(false)
const fileInputRef = ref<HTMLInputElement | null>(null)

const localError = shallowRef('')
const fieldErrors = reactive<Record<string, string>>({})
const submitted = ref(false)
const copiedPassword = ref(false)
const copyError = ref('')
const adminEmailModel = computed({
  get: () => form.admin_email,
  set: (value: string) => {
    form.admin_email = value.toLowerCase()
  },
})

const planDescriptions: Record<string, string> = {
  starter: 'Funciones esenciales para comenzar a operar.',
  growth: 'Herramientas ampliadas para equipos en crecimiento.',
  enterprise: 'Capacidad y soporte para operaciones empresariales.',
}

const planDescription = computed(() => planDescriptions[form.plan_saas] ?? '')
const phoneDefaultCountry = computed(() =>
  form.moneda_iso === 'VES' || form.zona_horaria === 'America/Caracas' ? 'VE' : 'PE',
)

const emailIsValid = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)

const getNationalPhoneDigits = (value: string) => {
  const digits = value.replace(/\D/g, '')
  const matchingCountry = [...countries]
    .filter((country) => value.startsWith(country.prefijo))
    .sort((first, second) => second.prefijo.length - first.prefijo.length)[0]

  return matchingCountry ? digits.slice(matchingCountry.prefijo.length - 1) : digits
}

const validateField = (field: string) => {
  const value = String(form[field as keyof typeof form] ?? '').trim()
  let message = ''

  switch (field) {
    case 'nombre':
      if (value.length < 3) message = 'El nombre debe tener al menos 3 caracteres.'
      break
    case 'ruc_nit':
      if (value && !/^[A-Za-z0-9-]{1,20}$/.test(value)) message = 'Usa solo letras, números o guiones (máximo 20 caracteres).'
      break
    case 'email_contacto':
      if (value && !emailIsValid(value)) message = 'Escribe un correo electrónico válido.'
      break
    case 'telefono_contacto':
    case 'admin_telefono': {
      const phoneDigits = getNationalPhoneDigits(value)
      if (field === 'admin_telefono' && !value) {
        message = 'El teléfono del administrador es obligatorio.'
      } else if (value && (phoneDigits.length < 6 || phoneDigits.length > 12)) {
        message = 'El teléfono debe tener entre 6 y 12 dígitos.'
      }
      break
    }
    case 'max_distribuidores':
      if (value && (!/^\d+$/.test(value) || Number(value) < 1 || !Number.isSafeInteger(Number(value)))) {
        message = 'Ingresa un entero positivo o deja el campo vacío para indicar sin límite.'
      }
      break
    case 'admin_nombre':
      if (!value) message = 'El nombre del administrador es obligatorio.'
      break
    case 'admin_apellido':
      if (!value) message = 'El apellido del administrador es obligatorio.'
      break
    case 'admin_email':
      if (!value) message = 'El correo del administrador es obligatorio.'
      else if (!emailIsValid(value)) message = 'Escribe un correo electrónico válido.'
      break
    case 'admin_tipo_documento':
      if (!value) message = 'Selecciona un tipo de documento.'
      break
    case 'admin_numero_documento':
      if (!value) {
        message = 'El número de documento es obligatorio.'
      } else if (form.admin_tipo_documento === 'dni' && !/^\d{8}$/.test(value)) {
        message = 'El DNI debe tener exactamente 8 dígitos.'
      } else if (form.admin_tipo_documento === 'cedula' && !/^\d{6,10}$/.test(value)) {
        message = 'La cédula debe tener entre 6 y 10 dígitos.'
      } else if (form.admin_tipo_documento !== 'dni' && form.admin_tipo_documento !== 'cedula' && !/^[A-Za-z0-9]{5,20}$/.test(value)) {
        message = 'Usa entre 5 y 20 letras o números.'
      }
      break
  }

  if (message) fieldErrors[field] = message
  else delete fieldErrors[field]
}

const serverFieldNames: Record<string, string[]> = {
  nombre: ['nombre'],
  nombre_comercial: ['nombre_comercial'],
  ruc_nit: ['ruc_nit'],
  logo: ['logo'],
  color_primario: ['color_primario'],
  color_secundario: ['color_secundario'],
  moneda_iso: ['moneda_iso'],
  zona_horaria: ['zona_horaria'],
  email_contacto: ['email_contacto'],
  telefono_contacto: ['telefono_contacto'],
  sitio_web: ['sitio_web'],
  plan_saas: ['plan_saas'],
  max_distribuidores: ['max_distribuidores'],
  admin_nombre: ['primer_admin.nombre', 'primer_admin[nombre]'],
  admin_apellido: ['primer_admin.apellido', 'primer_admin[apellido]'],
  admin_email: ['primer_admin.email', 'primer_admin[email]'],
  admin_telefono: ['primer_admin.telefono', 'primer_admin[telefono]'],
  admin_tipo_documento: ['primer_admin.tipo_documento', 'primer_admin[tipo_documento]'],
  admin_numero_documento: ['primer_admin.numero_documento', 'primer_admin[numero_documento]'],
  admin_direccion: ['primer_admin.direccion', 'primer_admin[direccion]'],
}

const applyServerErrors = (errors: Record<string, string>) => {
  for (const field of Object.keys(serverFieldNames)) {
    delete fieldErrors[field]
    if (submitted.value) validateField(field)
  }

  for (const [field, aliases] of Object.entries(serverFieldNames)) {
    const matchingKey = Object.keys(errors).find((key) => aliases.includes(key))
    const message = matchingKey ? errors[matchingKey] : undefined
    if (message) fieldErrors[field] = message
  }
}

watch(
  () => props.serverErrors,
  async (errors) => {
    applyServerErrors(errors)
    if (Object.keys(errors).length > 0 && props.open) await focusFirstInvalidField()
  },
  { deep: true, immediate: true },
)

const handleFieldInput = (field: string) => {
  delete fieldErrors[field]
  if (submitted.value) validateField(field)
}

const fieldError = (field: string) => fieldErrors[field] ?? ''

const focusFirstInvalidField = async () => {
  await nextTick()
  document.querySelector<HTMLElement>('.create-empresa [aria-invalid="true"], .create-empresa .phone-input.is-invalid input')?.focus()
}

const revokeLogoPreview = () => {
  if (!logoPreviewUrl.value) {
    return
  }

  URL.revokeObjectURL(logoPreviewUrl.value)
  logoPreviewUrl.value = null
}

const resetForm = () => {
  form.nombre = ''
  form.nombre_comercial = ''
  form.ruc_nit = ''
  form.color_primario = '#0c1727'
  form.color_secundario = '#4590ff'
  form.moneda_iso = 'USD'
  form.zona_horaria = 'America/Lima'
  form.email_contacto = ''
  form.telefono_contacto = ''
  form.sitio_web = ''
  form.plan_saas = 'growth'
  form.max_distribuidores = ''
  form.admin_nombre = ''
  form.admin_apellido = ''
  form.admin_email = ''
  form.admin_telefono = ''
  form.admin_tipo_documento = 'dni'
  form.admin_numero_documento = ''
  form.admin_direccion = ''
  for (const field of Object.keys(fieldErrors)) delete fieldErrors[field]
  submitted.value = false
  copiedPassword.value = false
  copyError.value = ''
  revokeLogoPreview()
  logo.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  localError.value = ''
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) {
      resetForm()
    }
  },
)

onBeforeUnmount(() => {
  revokeLogoPreview()
})

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const handleFile = (file: File) => {
  const extension = file.name.split('.').pop()?.toLowerCase()
  const allowedTypes: Record<string, string[]> = {
    png: ['image/png'],
    jpg: ['image/jpeg', 'image/jpg'],
    jpeg: ['image/jpeg', 'image/jpg'],
    svg: ['image/svg+xml'],
  }
  const mimeTypes = extension ? allowedTypes[extension] : undefined
  if (!mimeTypes || (file.type !== '' && !mimeTypes.includes(file.type.toLowerCase()))) {
    fieldErrors.logo = 'El logo debe ser un archivo PNG, JPG, JPEG o SVG.'
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    fieldErrors.logo = 'El logo no puede superar los 5 MB.'
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  delete fieldErrors.logo
  revokeLogoPreview()

  logo.value = file
  logoPreviewUrl.value = URL.createObjectURL(file)
}

const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    handleFile(target.files[0])
  }
}

const removeLogo = () => {
  revokeLogoPreview()
  logo.value = null
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  delete fieldErrors.logo
}

const onDragOver = (event: DragEvent) => {
  event.preventDefault()
  isDragOver.value = true
}

const onDragLeave = (event: DragEvent) => {
  if (event.currentTarget instanceof HTMLElement && event.currentTarget.contains(event.relatedTarget as Node | null)) return
  isDragOver.value = false
}

const onDrop = (event: DragEvent) => {
  isDragOver.value = false
  if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
    handleFile(event.dataTransfer.files[0])
  }
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const validateForm = () => {
  for (const field of [
    'nombre', 'ruc_nit', 'email_contacto', 'max_distribuidores',
    'admin_nombre', 'admin_apellido', 'admin_email', 'admin_telefono',
    'admin_tipo_documento', 'admin_numero_documento',
  ]) validateField(field)
}

const handleSubmit = async () => {
  submitted.value = true
  validateForm()

  if (Object.keys(fieldErrors).length > 0) {
    await focusFirstInvalidField()
    return
  }

  const nombre = form.nombre.trim()
  const adminNombre = form.admin_nombre.trim()
  const adminApellido = form.admin_apellido.trim()
  const adminEmail = form.admin_email.trim()
  const maxDistribuidores = String(form.max_distribuidores ?? '').trim()

  const payload: CreateEmpresaPayload = {
    nombre,
    nombre_comercial: form.nombre_comercial.trim() || undefined,
    ruc_nit: form.ruc_nit.trim() || undefined,
    logo: logo.value || undefined,
    color_primario: form.color_primario || undefined,
    color_secundario: form.color_secundario || undefined,
    moneda_iso: form.moneda_iso || undefined,
    zona_horaria: form.zona_horaria.trim() || undefined,
    email_contacto: form.email_contacto.trim() || undefined,
    telefono_contacto: form.telefono_contacto.trim() || undefined,
    sitio_web: form.sitio_web.trim() || undefined,
    plan_saas: form.plan_saas.trim() || undefined,
    max_distribuidores:
      maxDistribuidores.length > 0
        ? Number(maxDistribuidores)
        : undefined,
    primer_admin: {
      nombre: adminNombre,
      apellido: adminApellido,
      email: adminEmail.toLowerCase(),
      telefono: form.admin_telefono.trim(),
      tipo_documento: form.admin_tipo_documento.trim(),
      numero_documento: form.admin_numero_documento.trim(),
      direccion: form.admin_direccion.trim() || undefined,
    },
  }

  localError.value = ''
  emit('submit', payload)
}

const copyTemporaryPassword = async () => {
  const password = props.successResult?.primer_admin.password_temporal
  if (!password) return

  try {
    await navigator.clipboard.writeText(password)
    copiedPassword.value = true
    copyError.value = ''
  } catch {
    copyError.value = 'No se pudo copiar automáticamente. Selecciona la contraseña para copiarla.'
  }
}
</script>

<template>
  <AppModal
    :open="open"
    size="xl"
    :title="successResult ? 'Empresa creada' : 'Crear empresa'"
    :description="successResult ? 'El registro de la empresa se completó correctamente.' : 'Registra un nuevo workspace y define sus datos base antes del onboarding.'"
    @close="emit('update:open', false)"
  >
    <div class="create-empresa">
      <section v-if="successResult" class="success-content" aria-live="polite">
        <div class="success-mark" aria-hidden="true">✓</div>
        <h3>Empresa creada correctamente</h3>
        <p>{{ successResult.empresa.nombre }} ya está registrada.</p>
        <template v-if="successResult.primer_admin.password_temporal">
          <p class="success-password-label">Contraseña temporal de {{ successResult.primer_admin.email }}</p>
          <code class="temporary-password">{{ successResult.primer_admin.password_temporal }}</code>
          <p class="password-warning">Guárdala ahora, no se volverá a mostrar.</p>
          <p v-if="copyError" class="field-error" role="alert">{{ copyError }}</p>
        </template>
        <p v-else class="success-note">No se generó una contraseña temporal para esta cuenta.</p>
      </section>

      <template v-else>
      <div v-if="localError" class="inline-alert inline-alert-danger">
        <strong>No se pudo continuar.</strong>
        <span>{{ localError }}</span>
      </div>

      <div class="create-grid">
        <div class="form-column">
          <section class="form-section">
            <div class="section-copy">
              <h3 class="section-heading">Identidad</h3>
              <p class="section-description">Datos visibles del workspace dentro del directorio administrativo.</p>
            </div>

            <div class="form-grid form-grid-two">
              <div class="form-group form-group-full">
                <label class="form-label" for="empresa-nombre">Nombre <span class="required-mark">*</span></label>
                <input id="empresa-nombre" v-model="form.nombre" class="form-input" :class="{ 'is-invalid': fieldError('nombre') }" type="text" placeholder="Innovex Peru" required aria-required="true" :aria-invalid="Boolean(fieldError('nombre'))" :aria-describedby="fieldError('nombre') ? 'empresa-nombre-error' : undefined" @input="handleFieldInput('nombre')" @blur="validateField('nombre')" />
                <p v-if="fieldError('nombre')" id="empresa-nombre-error" class="field-error">{{ fieldError('nombre') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-nombre-comercial">Nombre comercial</label>
                <input id="empresa-nombre-comercial" v-model="form.nombre_comercial" class="form-input" :class="{ 'is-invalid': fieldError('nombre_comercial') }" type="text" placeholder="Innovex" :aria-invalid="Boolean(fieldError('nombre_comercial'))" :aria-describedby="fieldError('nombre_comercial') ? 'empresa-nombre-comercial-error' : undefined" @input="handleFieldInput('nombre_comercial')" />
                <p v-if="fieldError('nombre_comercial')" id="empresa-nombre-comercial-error" class="field-error">{{ fieldError('nombre_comercial') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-ruc">RUC / NIT</label>
                <input id="empresa-ruc" v-model="form.ruc_nit" class="form-input" :class="{ 'is-invalid': fieldError('ruc_nit') }" type="text" maxlength="20" placeholder="20123456789 o J-12345678-9" :aria-invalid="Boolean(fieldError('ruc_nit'))" :aria-describedby="fieldError('ruc_nit') ? 'empresa-ruc-error' : undefined" @input="handleFieldInput('ruc_nit')" @blur="validateField('ruc_nit')" />
                <p v-if="fieldError('ruc_nit')" id="empresa-ruc-error" class="field-error">{{ fieldError('ruc_nit') }}</p>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="empresa-logo-file">Logo de la empresa</label>

                <div v-if="logoPreviewUrl" class="logo-preview-container" :class="{ 'is-invalid': fieldError('logo') }" tabindex="-1" :aria-invalid="Boolean(fieldError('logo'))" :aria-describedby="fieldError('logo') ? 'empresa-logo-error' : undefined">
                  <div class="logo-preview-card" :class="{ 'is-invalid': fieldError('logo') }">
                    <img :src="logoPreviewUrl" alt="Vista previa del logo" class="logo-preview-image" />
                    <div class="logo-preview-info">
                      <span class="logo-filename">{{ logo?.name }}</span>
                      <span class="logo-filesize">{{ formatBytes(logo?.size || 0) }}</span>
                    </div>
                    <button type="button" class="btn-remove-logo" @click="removeLogo">Quitar</button>
                  </div>
                </div>

                <div v-else class="logo-upload-dropzone" :class="{ 'is-dragover': isDragOver, 'is-invalid': fieldError('logo') }" role="button" tabindex="0" :aria-invalid="Boolean(fieldError('logo'))" :aria-describedby="fieldError('logo') ? 'empresa-logo-error' : undefined" @dragover="onDragOver" @dragleave="onDragLeave" @drop.prevent="onDrop" @click="triggerFileInput" @keydown.enter.prevent="triggerFileInput" @keydown.space.prevent="triggerFileInput">
                  <input id="empresa-logo-file" ref="fileInputRef" type="file" accept="image/png, image/jpeg, image/jpg, image/svg+xml" class="logo-file-input" @change="onFileSelected" />
                  <div class="dropzone-content">
                    <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <span class="upload-title">Haz clic para subir o arrastra aquí</span>
                    <span class="upload-subtitle">PNG, JPG, JPEG o SVG (máx. 5 MB)</span>
                  </div>
                </div>
                <p v-if="fieldError('logo')" id="empresa-logo-error" class="field-error">{{ fieldError('logo') }}</p>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-copy">
              <h3 class="section-heading">Operación</h3>
              <p class="section-description">Configuración inicial de plan, contacto y capacidad operativa.</p>
            </div>

            <div class="form-grid form-grid-two">
              <div class="form-group">
                <label class="form-label" for="empresa-plan">Plan SaaS</label>
                <select id="empresa-plan" v-model="form.plan_saas" class="form-input form-select" :class="{ 'is-invalid': fieldError('plan_saas') }" :aria-invalid="Boolean(fieldError('plan_saas'))" :aria-describedby="fieldError('plan_saas') ? 'empresa-plan-error' : undefined" @change="handleFieldInput('plan_saas')">
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
                <p class="field-hint">{{ planDescription }}</p>
                <p v-if="fieldError('plan_saas')" id="empresa-plan-error" class="field-error">{{ fieldError('plan_saas') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-email">Email de contacto</label>
                <input id="empresa-email" v-model="form.email_contacto" class="form-input" :class="{ 'is-invalid': fieldError('email_contacto') }" type="email" placeholder="operaciones@innovex.com" :aria-invalid="Boolean(fieldError('email_contacto'))" :aria-describedby="fieldError('email_contacto') ? 'empresa-email-error' : undefined" @input="handleFieldInput('email_contacto')" @blur="validateField('email_contacto')" />
                <p v-if="fieldError('email_contacto')" id="empresa-email-error" class="field-error">{{ fieldError('email_contacto') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-telefono">Teléfono</label>
                <PhoneInput id="empresa-telefono" v-model="form.telefono_contacto" :default-country="phoneDefaultCountry" :invalid="Boolean(fieldError('telefono_contacto'))" @update:model-value="handleFieldInput('telefono_contacto')" @focusout="validateField('telefono_contacto')" />
                <p v-if="fieldError('telefono_contacto')" id="empresa-telefono-error" class="field-error">{{ fieldError('telefono_contacto') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-web">Sitio web</label>
                <input id="empresa-web" v-model="form.sitio_web" class="form-input" :class="{ 'is-invalid': fieldError('sitio_web') }" type="url" placeholder="https://empresa.com" :aria-invalid="Boolean(fieldError('sitio_web'))" :aria-describedby="fieldError('sitio_web') ? 'empresa-web-error' : undefined" @input="handleFieldInput('sitio_web')" />
                <p v-if="fieldError('sitio_web')" id="empresa-web-error" class="field-error">{{ fieldError('sitio_web') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-moneda">Moneda</label>
                <select id="empresa-moneda" v-model="form.moneda_iso" class="form-input form-select" :class="{ 'is-invalid': fieldError('moneda_iso') }" :aria-invalid="Boolean(fieldError('moneda_iso'))" :aria-describedby="fieldError('moneda_iso') ? 'empresa-moneda-error' : undefined" @change="handleFieldInput('moneda_iso')">
                  <option value="USD">USD</option>
                  <option value="PEN">PEN</option>
                  <option value="COP">COP</option>
                  <option value="MXN">MXN</option>
                  <option value="VES">VES - Bolívar (Bs.)</option>
                </select>
                <p v-if="fieldError('moneda_iso')" id="empresa-moneda-error" class="field-error">{{ fieldError('moneda_iso') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-zona">Zona horaria</label>
                <select id="empresa-zona" v-model="form.zona_horaria" class="form-input form-select" :class="{ 'is-invalid': fieldError('zona_horaria') }" :aria-invalid="Boolean(fieldError('zona_horaria'))" :aria-describedby="fieldError('zona_horaria') ? 'empresa-zona-error' : undefined" @change="handleFieldInput('zona_horaria')">
                  <option value="America/Lima">America/Lima</option>
                  <option value="America/Bogota">America/Bogota</option>
                  <option value="America/Mexico_City">America/Mexico_City</option>
                  <option value="America/Caracas">America/Caracas (Venezuela)</option>
                </select>
                <p v-if="fieldError('zona_horaria')" id="empresa-zona-error" class="field-error">{{ fieldError('zona_horaria') }}</p>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="empresa-max-distribuidores">Máx. distribuidores</label>
                <input id="empresa-max-distribuidores" v-model="form.max_distribuidores" class="form-input" :class="{ 'is-invalid': fieldError('max_distribuidores') }" inputmode="numeric" type="text" placeholder="Sin límite" :aria-invalid="Boolean(fieldError('max_distribuidores'))" :aria-describedby="fieldError('max_distribuidores') ? 'empresa-max-error' : undefined" @input="handleFieldInput('max_distribuidores')" @blur="validateField('max_distribuidores')" />
                <p v-if="fieldError('max_distribuidores')" id="empresa-max-error" class="field-error">{{ fieldError('max_distribuidores') }}</p>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-copy">
              <h3 class="section-heading">Paleta</h3>
              <p class="section-description">Mantiene la identidad visual del workspace sin introducir un diseño distinto al sistema.</p>
            </div>

            <div class="form-grid form-grid-two">
              <div class="form-group">
                <label class="form-label" for="empresa-color-primario">Color primario</label>
                <div class="color-field">
                  <input id="empresa-color-primario" v-model="form.color_primario" class="color-picker" :class="{ 'is-invalid': fieldError('color_primario') }" type="color" :aria-invalid="Boolean(fieldError('color_primario'))" :aria-describedby="fieldError('color_primario') ? 'empresa-color-primario-error' : undefined" @input="handleFieldInput('color_primario')" />
                  <input v-model="form.color_primario" class="form-input form-input-mono" :class="{ 'is-invalid': fieldError('color_primario') }" type="text" :aria-invalid="Boolean(fieldError('color_primario'))" :aria-describedby="fieldError('color_primario') ? 'empresa-color-primario-error' : undefined" @input="handleFieldInput('color_primario')" />
                </div>
                <p v-if="fieldError('color_primario')" id="empresa-color-primario-error" class="field-error">{{ fieldError('color_primario') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-color-secundario">Color secundario</label>
                <div class="color-field">
                  <input id="empresa-color-secundario" v-model="form.color_secundario" class="color-picker" :class="{ 'is-invalid': fieldError('color_secundario') }" type="color" :aria-invalid="Boolean(fieldError('color_secundario'))" :aria-describedby="fieldError('color_secundario') ? 'empresa-color-secundario-error' : undefined" @input="handleFieldInput('color_secundario')" />
                  <input v-model="form.color_secundario" class="form-input form-input-mono" :class="{ 'is-invalid': fieldError('color_secundario') }" type="text" :aria-invalid="Boolean(fieldError('color_secundario'))" :aria-describedby="fieldError('color_secundario') ? 'empresa-color-secundario-error' : undefined" @input="handleFieldInput('color_secundario')" />
                </div>
                <p v-if="fieldError('color_secundario')" id="empresa-color-secundario-error" class="field-error">{{ fieldError('color_secundario') }}</p>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-copy">
              <h3 class="section-heading">Primer administrador</h3>
              <p class="section-description">Este usuario recibira acceso inicial al panel web administrativo de la empresa.</p>
            </div>

            <div class="form-grid form-grid-two">
              <div class="form-group">
                <label class="form-label" for="admin-nombre">Nombre <span class="required-mark">*</span></label>
                <input id="admin-nombre" v-model="form.admin_nombre" class="form-input" :class="{ 'is-invalid': fieldError('admin_nombre') }" type="text" placeholder="Ana" required aria-required="true" :aria-invalid="Boolean(fieldError('admin_nombre'))" :aria-describedby="fieldError('admin_nombre') ? 'admin-nombre-error' : undefined" @input="handleFieldInput('admin_nombre')" @blur="validateField('admin_nombre')" />
                <p v-if="fieldError('admin_nombre')" id="admin-nombre-error" class="field-error">{{ fieldError('admin_nombre') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-apellido">Apellido <span class="required-mark">*</span></label>
                <input id="admin-apellido" v-model="form.admin_apellido" class="form-input" :class="{ 'is-invalid': fieldError('admin_apellido') }" type="text" placeholder="Quispe" required aria-required="true" :aria-invalid="Boolean(fieldError('admin_apellido'))" :aria-describedby="fieldError('admin_apellido') ? 'admin-apellido-error' : undefined" @input="handleFieldInput('admin_apellido')" @blur="validateField('admin_apellido')" />
                <p v-if="fieldError('admin_apellido')" id="admin-apellido-error" class="field-error">{{ fieldError('admin_apellido') }}</p>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="admin-email">Correo de acceso <span class="required-mark">*</span></label>
                <input id="admin-email" v-model="adminEmailModel" class="form-input" :class="{ 'is-invalid': fieldError('admin_email') }" type="email" placeholder="admin.empresa@innovex.com" required aria-required="true" :aria-invalid="Boolean(fieldError('admin_email'))" :aria-describedby="fieldError('admin_email') ? 'admin-email-error' : undefined" @input="handleFieldInput('admin_email')" @blur="validateField('admin_email')" />
                <p v-if="fieldError('admin_email')" id="admin-email-error" class="field-error">{{ fieldError('admin_email') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-telefono">Teléfono <span class="required-mark">*</span></label>
                <PhoneInput id="admin-telefono" v-model="form.admin_telefono" :default-country="phoneDefaultCountry" required :invalid="Boolean(fieldError('admin_telefono'))" @update:model-value="handleFieldInput('admin_telefono')" @focusout="validateField('admin_telefono')" />
                <p v-if="fieldError('admin_telefono')" id="admin-telefono-error" class="field-error">{{ fieldError('admin_telefono') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-tipo-documento">Tipo de documento <span class="required-mark">*</span></label>
                <select id="admin-tipo-documento" v-model="form.admin_tipo_documento" class="form-input form-select" :class="{ 'is-invalid': fieldError('admin_tipo_documento') }" required aria-required="true" :aria-invalid="Boolean(fieldError('admin_tipo_documento'))" :aria-describedby="fieldError('admin_tipo_documento') ? 'admin-tipo-error' : undefined" @change="handleFieldInput('admin_numero_documento'); validateField('admin_tipo_documento'); validateField('admin_numero_documento')" @blur="validateField('admin_tipo_documento')">
                  <option value="dni">DNI</option>
                  <option value="cedula">Cédula</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="ruc">RUC</option>
                  <option value="otro">Otro</option>
                </select>
                <p v-if="fieldError('admin_tipo_documento')" id="admin-tipo-error" class="field-error">{{ fieldError('admin_tipo_documento') }}</p>
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-numero-documento">Número de documento <span class="required-mark">*</span></label>
                <input id="admin-numero-documento" v-model="form.admin_numero_documento" class="form-input" :class="{ 'is-invalid': fieldError('admin_numero_documento') }" type="text" placeholder="76543210" required aria-required="true" :aria-invalid="Boolean(fieldError('admin_numero_documento'))" :aria-describedby="fieldError('admin_numero_documento') ? 'admin-documento-error' : undefined" @input="handleFieldInput('admin_numero_documento')" @blur="validateField('admin_numero_documento')" />
                <p v-if="fieldError('admin_numero_documento')" id="admin-documento-error" class="field-error">{{ fieldError('admin_numero_documento') }}</p>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="admin-direccion">Dirección</label>
                <input id="admin-direccion" v-model="form.admin_direccion" class="form-input" :class="{ 'is-invalid': fieldError('admin_direccion') }" type="text" placeholder="Av. Principal 123" :aria-invalid="Boolean(fieldError('admin_direccion'))" :aria-describedby="fieldError('admin_direccion') ? 'admin-direccion-error' : undefined" @input="handleFieldInput('admin_direccion')" />
                <p v-if="fieldError('admin_direccion')" id="admin-direccion-error" class="field-error">{{ fieldError('admin_direccion') }}</p>
              </div>
            </div>
          </section>
        </div>

        <aside class="summary-card">
          <div class="summary-header">
            <h3 class="summary-title">Resumen</h3>
            <p class="summary-subtitle">Vista previa del registro base que se enviara al backend.</p>
          </div>

          <div class="summary-block" :class="{ 'summary-block-with-logo': logoPreviewUrl }">
            <div v-if="logoPreviewUrl" class="summary-logo-thumbnail">
              <img :src="logoPreviewUrl" alt="Logo thumbnail" />
            </div>
            <div>
              <p class="summary-name">{{ form.nombre.trim() || 'Nueva empresa' }}</p>
              <p class="summary-muted">{{ form.nombre_comercial || 'Sin nombre comercial' }}</p>
              <p class="summary-muted">RUC / NIT: {{ form.ruc_nit || 'No definido' }}</p>
            </div>
          </div>

          <div class="summary-list">
            <p>Plan: {{ form.plan_saas }}</p>
            <p>{{ planDescription }}</p>
            <p>Moneda: {{ form.moneda_iso }} · {{ formatCurrency(0, form.moneda_iso) }}</p>
            <p>Zona horaria: {{ form.zona_horaria }}</p>
            <p>Email: {{ form.email_contacto || 'No definido' }}</p>
            <p>Teléfono: {{ form.telefono_contacto || 'No definido' }}</p>
            <p>Sitio web: {{ form.sitio_web || 'No definido' }}</p>
            <p>Máx. distribuidores: {{ form.max_distribuidores || 'Sin límite' }}</p>
            <p>Paleta: {{ form.color_primario }} · {{ form.color_secundario }}</p>
          </div>

          <div class="summary-block summary-block-admin">
            <p class="summary-name">{{ [form.admin_nombre.trim(), form.admin_apellido.trim()].filter(Boolean).join(' ') || 'Primer administrador pendiente' }}</p>
            <p class="summary-muted">{{ form.admin_email.trim() || 'Sin correo de acceso' }}</p>
            <p class="summary-muted">Teléfono: {{ form.admin_telefono || 'No definido' }}</p>
            <p class="summary-muted">Documento: {{ form.admin_tipo_documento }} · {{ form.admin_numero_documento || 'No definido' }}</p>
            <p class="summary-muted">Dirección: {{ form.admin_direccion || 'No definida' }}</p>
          </div>

          <div class="palette-preview">
            <span class="palette-swatch" :style="{ backgroundColor: form.color_primario }" />
            <span class="palette-swatch" :style="{ backgroundColor: form.color_secundario }" />
          </div>
        </aside>
      </div>
      </template>
    </div>

    <template #footer>
      <template v-if="successResult">
        <button type="button" class="btn-secondary" @click="emit('update:open', false)">Cerrar</button>
        <button v-if="successResult.primer_admin.password_temporal" type="button" class="btn-primary" @click="copyTemporaryPassword">
          {{ copiedPassword ? 'Copiada' : 'Copiar' }}
        </button>
      </template>
      <template v-else>
        <button type="button" class="btn-secondary" :disabled="submitting" @click="emit('update:open', false)">Cancelar</button>
        <button type="button" class="btn-primary" :disabled="submitting" @click="handleSubmit">
          <span v-if="submitting" class="button-spinner" aria-hidden="true" />
          {{ submitting ? 'Creando...' : 'Crear empresa' }}
        </button>
      </template>
    </template>
  </AppModal>
</template>

<style scoped>
.create-empresa {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.inline-alert {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-radius: 10px;
  font-size: 13px;
}

.inline-alert-danger {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.create-grid {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(260px, 320px);
  gap: 24px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section,
.summary-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px;
}

.section-copy,
.summary-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.section-heading,
.summary-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #172033;
}

.section-description,
.summary-subtitle,
.summary-muted,
.summary-list {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-grid-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.required-mark {
  color: #b91c1c;
}

.field-error {
  margin: 0;
  color: #b91c1c;
  font-size: 12px;
  line-height: 1.4;
}

.field-hint {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.4;
}

.form-input {
  width: 100%;
  min-width: 0;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #fff;
  padding: 8px 16px;
  font-size: 13px;
  color: #334155;
  outline: none;
}

.form-input:focus,
.form-select:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.form-select {
  appearance: none;
}

.form-input:focus-visible,
.form-select:focus-visible,
.color-picker:focus-visible,
.btn-primary:focus-visible,
.btn-secondary:focus-visible,
.btn-remove-logo:focus-visible,
.logo-upload-dropzone:focus-visible {
  outline: 3px solid rgba(37, 99, 235, 0.45);
  outline-offset: 2px;
}

.form-input.is-invalid,
.color-picker.is-invalid,
.logo-preview-card.is-invalid,
.logo-upload-dropzone.is-invalid {
  border-color: #dc2626;
}

.form-input-mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.color-field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-picker {
  width: 52px;
  min-width: 52px;
  height: 42px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: #fff;
  padding: 4px;
}

.summary-card {
  align-self: start;
  position: sticky;
  top: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.summary-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.summary-name {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #172033;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.palette-preview {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.palette-swatch {
  flex: 1;
  height: 34px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #1f7ae0, #145fbe);
  color: #fff;
}

.btn-primary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.btn-secondary {
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #334155;
}

.btn-secondary:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.button-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: button-spin 0.7s linear infinite;
}

@keyframes button-spin {
  to { transform: rotate(360deg); }
}

.success-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 0;
}

.success-mark {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #dcfce7;
  color: #166534;
  font-size: 22px;
  font-weight: 700;
}

.success-content h3,
.success-content p {
  margin: 0;
}

.success-content h3 {
  color: #172033;
  font-size: 16px;
}

.success-content > p {
  color: #475569;
  font-size: 13px;
  line-height: 1.5;
}

.success-password-label {
  margin-top: 8px !important;
  font-weight: 600;
}

.temporary-password {
  display: block;
  width: 100%;
  overflow-wrap: anywhere;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  color: #172033;
  font-size: 15px;
  user-select: all;
}

.password-warning {
  color: #9a3412 !important;
  font-weight: 600;
}

@media (max-width: 960px) {
  .create-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    align-self: stretch;
    position: static;
  }
}

@media (max-width: 640px) {
  .form-grid-two {
    grid-template-columns: 1fr;
  }
}

/* Nuevos estilos del Logo Upload */
.logo-preview-container {
  margin-top: 0;
}

.logo-preview-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 16px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  position: relative;
}

.logo-preview-card.is-invalid {
  border-color: #dc2626;
}

.logo-preview-image {
  width: 48px;
  height: 48px;
  object-fit: contain;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #cbd5e1;
  padding: 2px;
}

.logo-preview-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.logo-filename {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logo-filesize {
  font-size: 11px;
  color: #64748b;
}

.btn-remove-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  background: #fff;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-remove-logo:hover {
  background: #fee2e2;
  border-color: #fca5a5;
  color: #ef4444;
}

.logo-upload-dropzone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #fff;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.logo-upload-dropzone:hover,
.logo-upload-dropzone.is-dragover {
  border-color: #3b82f6;
  background: #eff6ff;
}

.logo-file-input {
  display: none;
}

.dropzone-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  pointer-events: none;
}

.upload-icon {
  color: #94a3b8;
  margin-bottom: 0;
  transition: color 0.2s ease;
}

.logo-upload-dropzone:hover .upload-icon,
.logo-upload-dropzone.is-dragover .upload-icon {
  color: #3b82f6;
}

.upload-title {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
}

.upload-subtitle {
  font-size: 11px;
  color: #94a3b8;
}

/* Summary Logo Thumbnail */
.summary-block-with-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.summary-logo-thumbnail {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e2e8f0;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.summary-logo-thumbnail img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
