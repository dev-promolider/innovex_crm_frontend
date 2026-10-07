<script setup lang="ts">
import { computed, reactive, useTemplateRef, watch } from 'vue'
import { Check, ImageUp, LoaderCircle, Save, X } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import type { UpdateWorkspaceProfilePayload, WorkspaceLogoPreview, WorkspaceOperationalStatus, WorkspaceProfile } from '../types'

const props = defineProps<{
  profile: WorkspaceProfile | null
  logoPreview: WorkspaceLogoPreview | null
  loading: boolean
  saving: boolean
  uploadingLogo: boolean
  confirmingLogo: boolean
  hasConfiguredRanges: boolean | null
}>()

const emit = defineEmits<{
  refresh: []
  submit: [payload: UpdateWorkspaceProfilePayload]
  uploadLogo: [file: File]
  confirmLogo: []
  discardLogoPreview: []
  dirtyChange: [isDirty: boolean]
}>()

const fileInputRef = useTemplateRef<HTMLInputElement>('fileInput')

const form = reactive<Omit<UpdateWorkspaceProfilePayload, 'estado'> & { estado: WorkspaceOperationalStatus }>({
  nombre: '',
  nombre_comercial: '',
  moneda_iso: 'VES',
  estado: 'configuracion',
  mensaje_estado_operativo: '',
})

const statusOptions = [
  {
    value: 'activa',
    label: 'Activa',
    description: 'Operación normal para ventas, validaciones y solicitudes.',
  },
  {
    value: 'mantenimiento',
    label: 'En mantenimiento',
    description: 'Solo lectura para distribuidores; bloquea nuevas operaciones.',
  },
  {
    value: 'suspendida',
    label: 'Suspendida',
    description: 'Bloquea acceso no administrativo y exige un mensaje visible.',
  },
  {
    value: 'configuracion',
    label: 'Configuración',
    description: 'Perfil en preparación antes de la activación.',
  },
] as const

watch(
  () => props.profile,
  (nextProfile) => {
    if (!nextProfile) {
      return
    }

    form.nombre = nextProfile.nombre
    form.nombre_comercial = nextProfile.nombre_comercial ?? ''
    form.moneda_iso = nextProfile.moneda_iso ?? 'VES'
    form.estado = nextProfile.estado_operativo
    form.mensaje_estado_operativo = nextProfile.mensaje_estado_operativo ?? ''
  },
  { immediate: true },
)

const shouldShowOperationalMessage = computed(
  () => form.estado === 'mantenimiento' || form.estado === 'suspendida',
)

const activationBlocked = computed(() =>
  props.profile?.estado_operativo === 'configuracion' && props.hasConfiguredRanges === false,
)

const isDirty = computed(() => {
  const profile = props.profile
  if (!profile) return false

  return form.nombre !== profile.nombre
    || form.nombre_comercial !== (profile.nombre_comercial ?? '')
    || form.moneda_iso !== (profile.moneda_iso ?? 'VES')
    || form.estado !== profile.estado_operativo
    || form.mensaje_estado_operativo !== (profile.mensaje_estado_operativo ?? '')
})

watch(isDirty, (value) => emit('dirtyChange', value), { immediate: true })

const effectiveLogoUrl = computed(
  () => props.logoPreview?.logo_url ?? props.profile?.logo_url ?? props.profile?.logo_variantes?.lobby_card ?? null,
)

const initials = computed(() => {
  const source = props.profile?.nombre_visible || props.profile?.nombre || 'WS'

  return source
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((chunk) => chunk.charAt(0).toUpperCase())
    .join('')
})

const handleSubmit = () => {
  emit('submit', {
    nombre: form.nombre.trim(),
    nombre_comercial: form.nombre_comercial?.trim() || null,
    moneda_iso: form.moneda_iso?.trim().toUpperCase() || null,
    ...(form.estado === 'configuracion' ? {} : { estado: form.estado as Exclude<WorkspaceOperationalStatus, 'configuracion'> }),
    mensaje_estado_operativo: shouldShowOperationalMessage.value
      ? form.mensaje_estado_operativo?.trim() || null
      : null,
  })
}

const triggerFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  emit('uploadLogo', file)
  input.value = ''
}
</script>

<template>
  <div class="company-v2">
    <header class="company-v2__toolbar">
      <div class="company-v2__toolbar-copy">
        <p class="company-v2__eyebrow">Empresa</p>
        <h3 class="company-v2__title">Perfil y branding del workspace</h3>
      </div>

      <AppButton variant="secondary" size="sm" :disabled="!isDirty || saving" @click="handleSubmit">
        <template #leading>
          <LoaderCircle v-if="saving" class="size-4 animate-spin" />
          <Save v-else class="size-4" />
        </template>
        {{ saving ? 'Guardando...' : 'Guardar cambios' }}
      </AppButton>
    </header>

    <div v-if="loading && !profile" class="company-v2__empty">Cargando perfil del workspace...</div>

    <form v-else-if="profile" class="company-v2__form" @submit.prevent="handleSubmit">
      <div class="company-v2__layout">
        <div class="company-v2__main">
          <section class="company-v2__section">
            <div class="company-v2__section-head">
              <h4 class="company-v2__section-title">Identidad operativa</h4>
              <p class="company-v2__section-desc">Datos base del workspace para facturación, lobby y control operativo.</p>
            </div>

            <div class="company-v2__form-group">
              <label class="company-v2__form-label">Nombre legal</label>
              <input v-model="form.nombre" class="company-v2__form-input" type="text" maxlength="100" required />
            </div>

            <div class="company-v2__field-row">
              <div class="company-v2__form-group">
                <label class="company-v2__form-label">Nombre comercial</label>
                <input v-model="form.nombre_comercial" class="company-v2__form-input" type="text" maxlength="100" placeholder="Opcional" />
              </div>

              <div class="company-v2__form-group company-v2__form-group--currency">
                <label class="company-v2__form-label">Moneda base</label>
                <select
                  v-model="form.moneda_iso"
                  class="company-v2__form-input"
                  :disabled="profile.moneda_bloqueada"
                >
                  <option value="VES">VES - Bolívar Venezolano (Bs)</option>
                  <option value="USD">USD - Dólar Estadounidense ($)</option>
                  <option value="PEN">PEN - Sol Peruano (S/)</option>
                  <option value="EUR">EUR - Euro (€)</option>
                </select>
                <span v-if="profile.moneda_bloqueada" class="company-v2__form-hint">
                  No se puede cambiar porque ya hay ventas o transacciones registradas.
                </span>
              </div>
            </div>
          </section>

          <section class="company-v2__section">
            <div class="company-v2__section-head">
              <h4 class="company-v2__section-title">Estado comercial</h4>
              <p class="company-v2__section-desc">Controla visibilidad y mensaje operativo para distribuidores.</p>
            </div>

            <div class="company-v2__form-group">
              <label class="company-v2__form-label">Estado operativo</label>
              <div class="company-v2__status-grid">
                <label
                  v-for="option in statusOptions"
                  :key="option.value"
                  class="company-v2__status-card"
                  :class="{
                    'company-v2__status-card--active': form.estado === option.value,
                    'company-v2__status-card--disabled': option.value === 'configuracion' || (option.value === 'activa' && activationBlocked),
                  }"
                >
                  <input v-model="form.estado" class="company-v2__status-input" type="radio" :value="option.value" :disabled="option.value === 'configuracion' || (option.value === 'activa' && activationBlocked)" />
                  <span class="company-v2__status-title">{{ option.label }}</span>
                  <span class="company-v2__status-copy">{{ option.description }}</span>
                  <span v-if="option.value === 'activa' && activationBlocked" class="company-v2__status-copy company-v2__status-copy--blocked">Configura al menos un rango para activar.</span>
                </label>
              </div>
            </div>

            <div v-if="shouldShowOperationalMessage" class="company-v2__form-group">
              <label class="company-v2__form-label">Mensaje operativo</label>
              <textarea
                v-model="form.mensaje_estado_operativo"
                class="company-v2__form-input company-v2__form-textarea"
                rows="3"
                maxlength="500"
                placeholder="Este mensaje será visible para distribuidores cuando el workspace no esté en modo activo."
              />
            </div>
          </section>
        </div>

        <aside class="company-v2__aside">
          <section class="company-v2__section company-v2__section--brand">
            <div class="company-v2__section-head">
              <h4 class="company-v2__section-title">Branding</h4>
              <p class="company-v2__section-desc">Logo y presentación visual en lobby y vistas comerciales.</p>
            </div>

            <div class="company-v2__brand-preview">
              <div class="company-v2__brand-shell">
                <img v-if="effectiveLogoUrl" :src="effectiveLogoUrl" alt="Logo de empresa" class="company-v2__brand-image" />
                <span v-else class="company-v2__brand-fallback">{{ initials }}</span>
              </div>

              <div class="company-v2__brand-copy">
                <strong class="company-v2__brand-name">{{ profile.nombre_visible ?? 'Workspace activo' }}</strong>
                <span class="company-v2__brand-note">Lobby, tarjetas y superficie comercial del workspace.</span>
              </div>
            </div>

            <div class="company-v2__form-group">
              <label class="company-v2__form-label">Logo de empresa</label>
              <div class="company-v2__brand-actions">
                <input ref="fileInput" class="company-v2__file-input" type="file" accept="image/png,image/jpeg,image/svg+xml" @change="handleFileChange" />

                <AppButton type="button" variant="ghost" size="sm" :disabled="uploadingLogo || confirmingLogo" @click="triggerFilePicker">
                  <template #leading>
                    <ImageUp class="size-4" />
                  </template>
                  {{ uploadingLogo ? 'Procesando...' : 'Subir logo' }}
                </AppButton>
                <p class="company-v2__form-hint">Formatos permitidos: PNG, JPG, JPEG o SVG. Tamaño máximo: 5 MB.</p>

                <AppButton
                  type="button"
                  variant="secondary"
                  size="sm"
                  :disabled="!logoPreview || confirmingLogo || uploadingLogo"
                  @click="emit('confirmLogo')"
                >
                  <template #leading>
                    <Check class="size-4" />
                  </template>
                  {{ confirmingLogo ? 'Confirmando...' : 'Confirmar logo' }}
                </AppButton>
                <p v-if="!logoPreview" class="company-v2__form-hint">Sube una imagen para confirmar el logo.</p>
              </div>
            </div>

            <div v-if="logoPreview" class="company-v2__preview-banner">
              <div>
                <strong>Vista previa lista</strong>
                <p>Logo aún no definitivo. Confirma para publicarlo en el workspace.</p>
              </div>
              <AppButton type="button" variant="quiet" size="sm" @click="emit('discardLogoPreview')">
                <template #leading>
                  <X class="size-4" />
                </template>
                Descartar
              </AppButton>
            </div>
          </section>
        </aside>
      </div>

    </form>
  </div>
</template>

<style scoped>
.company-v2 {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.company-v2__toolbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.company-v2__eyebrow {
  margin: 0;
  color: #5e7898;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.company-v2__title {
  margin: 4px 0 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #17314f;
}

.company-v2__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 140px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
  font-size: 12px;
  color: #64748b;
}

.company-v2__form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.company-v2__layout {
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(280px, 0.85fr);
  gap: 20px;
  align-items: start;
}

.company-v2__main,
.company-v2__aside {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.company-v2__section {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.company-v2__section + .company-v2__section {
  padding-top: 18px;
  border-top: 1px solid #eef2f7;
}

.company-v2__section--brand {
  height: 100%;
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 72%);
}

.company-v2__section-head {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.company-v2__section-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #172033;
}

.company-v2__section-desc {
  margin: 0;
  font-size: 12px;
  line-height: 1.45;
  color: #64748b;
}

.company-v2__field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  align-items: start;
}

.company-v2__form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.company-v2__form-group--currency .company-v2__form-input {
  min-height: 42px;
}

.company-v2__form-group--currency {
  grid-column: 1 / -1;
}

.company-v2__form-label {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
}

.company-v2__form-input {
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

.company-v2__form-input:focus {
  border-color: #93c5fd;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.16);
}

.company-v2__form-hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #64748b;
}

.company-v2__form-textarea {
  resize: vertical;
  min-height: 88px;
}

.company-v2__status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.company-v2__status-card {
  position: relative;
  display: grid;
  gap: 4px;
  padding: 12px;
  border: 1px solid #dbe4ef;
  border-radius: 14px;
  background: #f8fafc;
}

.company-v2__status-card--active {
  border-color: rgba(31, 122, 224, 0.18);
  background: linear-gradient(135deg, rgba(229, 241, 255, 0.92), rgba(245, 250, 255, 0.98));
}

.company-v2__status-card--disabled {
  opacity: 0.72;
}

.company-v2__status-input {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.company-v2__status-title {
  font-size: 0.94rem;
  font-weight: 700;
  color: #1f2937;
}

.company-v2__status-copy {
  font-size: 0.79rem;
  line-height: 1.35;
  color: #617086;
}

.company-v2__status-copy--blocked {
  color: #b45309;
  font-weight: 600;
}

.company-v2__brand-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.company-v2__brand-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 18px;
  background: linear-gradient(135deg, #4ab8f5, #1a6ab5);
  color: #fff;
  overflow: hidden;
  flex-shrink: 0;
}

.company-v2__brand-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.company-v2__brand-fallback {
  font-size: 1.2rem;
  font-weight: 700;
}

.company-v2__brand-copy {
  display: grid;
  gap: 6px;
}

.company-v2__brand-name {
  color: #17314f;
  font-size: 1rem;
}

.company-v2__brand-note {
  color: #60758d;
  line-height: 1.45;
}

.company-v2__brand-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
}

.company-v2__brand-actions :deep(.app-button) {
  width: 100%;
}

.company-v2__preview-banner {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  padding: 14px;
  border-radius: 12px;
  background: #eff6ff;
  border: 1px solid #bfdbfe;
  color: #1d4ed8;
}

.company-v2__preview-banner strong {
  display: block;
  margin-bottom: 4px;
}

.company-v2__preview-banner p {
  margin: 0;
  line-height: 1.45;
}

.company-v2__file-input {
  display: none;
}

.company-v2__form-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
  border-top: 1px solid #eef2f7;
}

@media (max-width: 1024px) {
  .company-v2__layout {
    grid-template-columns: 1fr;
  }

  .company-v2__section--brand {
    height: auto;
  }

  .company-v2__brand-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .company-v2__brand-actions :deep(.app-button) {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .company-v2__field-row,
  .company-v2__status-grid {
    grid-template-columns: 1fr;
  }

  .company-v2__preview-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .company-v2__brand-actions {
    grid-template-columns: 1fr;
  }
}
</style>
