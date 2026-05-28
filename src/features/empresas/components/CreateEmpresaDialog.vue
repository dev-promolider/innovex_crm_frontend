<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import type { CreateEmpresaPayload } from '../types'

interface Props {
  open: boolean
  submitting: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  submit: [payload: CreateEmpresaPayload]
}>()

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
  if (!file.type.match('image.*')) {
    localError.value = 'El archivo seleccionado debe ser una imagen (PNG, JPG, JPEG o SVG).'
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    localError.value = 'El archivo supera el límite de tamaño de 5MB.'
    if (fileInputRef.value) {
      fileInputRef.value.value = ''
    }
    return
  }

  localError.value = ''
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
  localError.value = ''
}

const onDragOver = () => {
  isDragOver.value = true
}

const onDragLeave = () => {
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

const handleSubmit = () => {
  const nombre = form.nombre.trim()
  const adminNombre = form.admin_nombre.trim()
  const adminApellido = form.admin_apellido.trim()
  const adminEmail = form.admin_email.trim()
  const maxDistribuidores = String(form.max_distribuidores ?? '').trim()

  if (!nombre) {
    localError.value = 'El nombre de la empresa es obligatorio.'
    return
  }

  if (!adminNombre || !adminApellido || !adminEmail) {
    localError.value = 'Debes completar nombre, apellido y correo del primer administrador.'
    return
  }

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
      email: adminEmail,
      telefono: form.admin_telefono.trim() || undefined,
      tipo_documento: form.admin_tipo_documento.trim() || undefined,
      numero_documento: form.admin_numero_documento.trim() || undefined,
      direccion: form.admin_direccion.trim() || undefined,
    },
  }

  localError.value = ''
  emit('submit', payload)
}
</script>

<template>
  <AppModal
    :open="open"
    size="xl"
    title="Crear empresa"
    description="Registra un nuevo workspace en estado de configuracion y deja definidos sus datos base antes del onboarding."
    @close="emit('update:open', false)"
  >
    <div class="create-empresa">
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
                <label class="form-label" for="empresa-nombre">Nombre</label>
                <input id="empresa-nombre" v-model="form.nombre" class="form-input" type="text" placeholder="Innovex Peru" />
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-nombre-comercial">Nombre comercial</label>
                <input id="empresa-nombre-comercial" v-model="form.nombre_comercial" class="form-input" type="text" placeholder="Innovex" />
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-ruc">RUC / NIT</label>
                <input id="empresa-ruc" v-model="form.ruc_nit" class="form-input" type="text" placeholder="20123456789" />
              </div>

              <div class="form-group form-group-full">
                <label class="form-label">Logo de la empresa</label>

                <div v-if="logoPreviewUrl" class="logo-preview-container">
                  <div class="logo-preview-card">
                    <img :src="logoPreviewUrl" alt="Vista previa del logo" class="logo-preview-image" />
                    <div class="logo-preview-info">
                      <span class="logo-filename">{{ logo?.name }}</span>
                      <span class="logo-filesize">{{ formatBytes(logo?.size || 0) }}</span>
                    </div>
                    <button type="button" class="btn-remove-logo" aria-label="Eliminar logo" @click="removeLogo">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </div>
                </div>

                <div v-else class="logo-upload-dropzone" :class="{ 'is-dragover': isDragOver }" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @drop.prevent="onDrop" @click="triggerFileInput">
                  <input id="empresa-logo-file" ref="fileInputRef" type="file" accept="image/png, image/jpeg, image/jpg, image/svg+xml" class="logo-file-input" @change="onFileSelected" />
                  <div class="dropzone-content">
                    <svg class="upload-icon" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    <span class="upload-title">Haz clic para subir o arrastra aquí</span>
                    <span class="upload-subtitle">PNG, JPG, JPEG o SVG (Max. 5MB)</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section class="form-section">
            <div class="section-copy">
              <h3 class="section-heading">Operacion</h3>
              <p class="section-description">Configuracion inicial de plan, contacto y capacidad operativa.</p>
            </div>

            <div class="form-grid form-grid-two">
              <div class="form-group">
                <label class="form-label" for="empresa-plan">Plan SaaS</label>
                <select id="empresa-plan" v-model="form.plan_saas" class="form-input form-select">
                  <option value="starter">Starter</option>
                  <option value="growth">Growth</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-email">Email de contacto</label>
                <input id="empresa-email" v-model="form.email_contacto" class="form-input" type="email" placeholder="operaciones@innovex.com" />
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-telefono">Telefono</label>
                <input id="empresa-telefono" v-model="form.telefono_contacto" class="form-input" type="text" placeholder="+51 999 999 999" />
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-web">Sitio web</label>
                <input id="empresa-web" v-model="form.sitio_web" class="form-input" type="url" placeholder="https://empresa.com" />
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-moneda">Moneda</label>
                <select id="empresa-moneda" v-model="form.moneda_iso" class="form-input form-select">
                  <option value="USD">USD</option>
                  <option value="PEN">PEN</option>
                  <option value="COP">COP</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-zona">Zona horaria</label>
                <select id="empresa-zona" v-model="form.zona_horaria" class="form-input form-select">
                  <option value="America/Lima">America/Lima</option>
                  <option value="America/Bogota">America/Bogota</option>
                  <option value="America/Mexico_City">America/Mexico_City</option>
                </select>
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="empresa-max-distribuidores">Max. distribuidores</label>
                <input id="empresa-max-distribuidores" v-model="form.max_distribuidores" class="form-input" inputmode="numeric" type="number" min="1" placeholder="1500" />
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
                  <input id="empresa-color-primario" v-model="form.color_primario" class="color-picker" type="color" />
                  <input v-model="form.color_primario" class="form-input form-input-mono" type="text" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label" for="empresa-color-secundario">Color secundario</label>
                <div class="color-field">
                  <input id="empresa-color-secundario" v-model="form.color_secundario" class="color-picker" type="color" />
                  <input v-model="form.color_secundario" class="form-input form-input-mono" type="text" />
                </div>
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
                <label class="form-label" for="admin-nombre">Nombre</label>
                <input id="admin-nombre" v-model="form.admin_nombre" class="form-input" type="text" placeholder="Ana" />
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-apellido">Apellido</label>
                <input id="admin-apellido" v-model="form.admin_apellido" class="form-input" type="text" placeholder="Quispe" />
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="admin-email">Correo de acceso</label>
                <input id="admin-email" v-model="form.admin_email" class="form-input" type="email" placeholder="admin.empresa@innovex.com" />
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-telefono">Telefono</label>
                <input id="admin-telefono" v-model="form.admin_telefono" class="form-input" type="text" placeholder="+51 999 999 111" />
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-tipo-documento">Tipo de documento</label>
                <select id="admin-tipo-documento" v-model="form.admin_tipo_documento" class="form-input form-select">
                  <option value="dni">DNI</option>
                  <option value="ce">CE</option>
                  <option value="pasaporte">Pasaporte</option>
                  <option value="nit">NIT</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="admin-numero-documento">Numero de documento</label>
                <input id="admin-numero-documento" v-model="form.admin_numero_documento" class="form-input" type="text" placeholder="76543210" />
              </div>

              <div class="form-group form-group-full">
                <label class="form-label" for="admin-direccion">Direccion</label>
                <input id="admin-direccion" v-model="form.admin_direccion" class="form-input" type="text" placeholder="Av. Principal 123" />
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
            </div>
          </div>

          <div class="summary-list">
            <p>Plan: {{ form.plan_saas }}</p>
            <p>Moneda: {{ form.moneda_iso }}</p>
            <p>Zona horaria: {{ form.zona_horaria }}</p>
            <p>Email: {{ form.email_contacto || 'No definido' }}</p>
            <p>Telefono: {{ form.telefono_contacto || 'No definido' }}</p>
            <p>Max. distribuidores: {{ form.max_distribuidores || 'Sin limite definido' }}</p>
          </div>

          <div class="summary-block summary-block-admin">
            <p class="summary-name">{{ form.admin_nombre.trim() || 'Primer administrador pendiente' }}</p>
            <p class="summary-muted">{{ form.admin_email.trim() || 'Sin correo de acceso' }}</p>
          </div>

          <div class="palette-preview">
            <span class="palette-swatch" :style="{ backgroundColor: form.color_primario }" />
            <span class="palette-swatch" :style="{ backgroundColor: form.color_secundario }" />
          </div>
        </aside>
      </div>
    </div>

    <template #footer>
      <button type="button" class="btn-secondary" @click="emit('update:open', false)">Cancelar</button>
      <button type="button" class="btn-primary" :disabled="submitting" @click="handleSubmit">
        {{ submitting ? 'Creando...' : 'Crear empresa' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.create-empresa {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.inline-alert {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
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
  gap: 20px;
}

.form-column {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-section,
.summary-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 18px;
}

.section-copy,
.summary-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
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
  gap: 14px;
}

.form-grid-two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group-full {
  grid-column: 1 / -1;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.form-input {
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

.form-input:focus,
.form-select:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.form-select {
  appearance: none;
}

.form-input-mono {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
}

.color-field {
  display: flex;
  align-items: center;
  gap: 10px;
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
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
}

.summary-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 14px;
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
  gap: 6px;
}

.palette-preview {
  display: flex;
  gap: 10px;
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
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
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
  color: #475569;
}

@media (max-width: 960px) {
  .create-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    align-self: stretch;
  }
}

@media (max-width: 640px) {
  .form-grid-two {
    grid-template-columns: 1fr;
  }
}

/* Nuevos estilos del Logo Upload */
.logo-preview-container {
  margin-top: 4px;
}

.logo-preview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  position: relative;
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
  width: 28px;
  height: 28px;
  border-radius: 50%;
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
  gap: 6px;
  pointer-events: none;
}

.upload-icon {
  color: #94a3b8;
  margin-bottom: 2px;
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
  gap: 12px;
  margin-bottom: 14px;
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
