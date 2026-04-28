<script setup lang="ts">
import { computed, useTemplateRef } from 'vue'
import { Check, ImageUp, X } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import type { WorkspaceLogoPreview, WorkspaceProfile } from '../types'

const props = defineProps<{
  profile: WorkspaceProfile | null
  logoPreview: WorkspaceLogoPreview | null
  uploading: boolean
  confirming: boolean
}>()

const emit = defineEmits<{
  upload: [file: File]
  confirm: []
  discardPreview: []
}>()

const fileInputRef = useTemplateRef<HTMLInputElement>('fileInput')

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

const triggerFilePicker = () => {
  fileInputRef.value?.click()
}

const handleFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]

  if (!file) {
    return
  }

  emit('upload', file)
  input.value = ''
}
</script>

<template>
  <aside class="branding-panel">
    <section class="branding-panel__hero">
      <p class="branding-panel__eyebrow">Marca y lobby</p>
      <h2 class="branding-panel__title">Presencia visual del workspace</h2>
      <p class="branding-panel__copy">
        Sube una version de logo, valida la vista previa privada y confirma cuando el lobby se vea correcto.
      </p>

      <div class="branding-panel__preview-card">
        <div class="branding-panel__preview-top">
          <div class="branding-panel__logo-shell">
            <img v-if="effectiveLogoUrl" :src="effectiveLogoUrl" alt="Logo de empresa" class="branding-panel__logo-image" />
            <span v-else class="branding-panel__logo-fallback">{{ initials }}</span>
          </div>

          <div>
            <span class="branding-panel__label">Nombre visible</span>
            <strong class="branding-panel__company">{{ profile?.nombre_visible ?? 'Workspace activo' }}</strong>
          </div>
        </div>

        <div class="branding-panel__state-line">
          <span class="branding-panel__state-pill" :data-state="profile?.estado_operativo ?? 'configuracion'">
            {{ profile?.estado_operativo ?? 'configuracion' }}
          </span>
          <span class="branding-panel__state-copy">Vista de lobby y contexto operativo actual.</span>
        </div>
      </div>

      <input ref="fileInput" class="branding-panel__file-input" type="file" accept="image/png,image/jpeg,image/svg+xml" @change="handleFileChange" />

      <div class="branding-panel__actions">
        <AppButton type="button" variant="secondary" class="branding-panel__upload-btn" :disabled="uploading || confirming" @click="triggerFilePicker">
          <template #leading>
            <ImageUp class="size-4" />
          </template>
          {{ uploading ? 'Procesando...' : 'Subir nuevo logo' }}
        </AppButton>
        <AppButton
          type="button"
          variant="primary"
          class="branding-panel__confirm-btn"
          :disabled="!logoPreview || confirming || uploading"
          @click="emit('confirm')"
        >
          <template #leading>
            <Check class="size-4" />
          </template>
          {{ confirming ? 'Confirmando...' : 'Confirmar logo' }}
        </AppButton>
      </div>

      <p class="branding-panel__hint">
        Formatos aceptados: PNG, JPG y SVG. El backend genera `thumbnail`, `lobby_card` y `original`.
      </p>

      <div v-if="logoPreview" class="branding-panel__preview-banner">
        <div>
          <strong>Vista previa lista</strong>
          <p>El logo aun no es definitivo. Confirma para publicarlo en el workspace.</p>
        </div>
        <AppButton type="button" variant="quiet" size="sm" class="branding-panel__discard-btn" @click="emit('discardPreview')">
          <template #leading>
            <X class="size-4" />
          </template>
          Descartar
        </AppButton>
      </div>
    </section>

    <section class="branding-panel__insights">
      <div class="branding-panel__insight-card">
        <span class="branding-panel__insight-label">Moneda</span>
        <strong class="branding-panel__insight-value">{{ profile?.moneda_iso ?? 'Sin definir' }}</strong>
        <p class="branding-panel__insight-copy">
          {{ profile?.puede_editar_moneda ? 'Editable desde este panel.' : 'Bloqueada por transacciones existentes.' }}
        </p>
      </div>

      <div class="branding-panel__insight-card">
        <span class="branding-panel__insight-label">Mensaje operativo</span>
        <strong class="branding-panel__insight-value branding-panel__insight-value--small">
          {{ profile?.mensaje_estado_operativo || 'Sin mensaje configurado.' }}
        </strong>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.branding-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.branding-panel__hero,
.branding-panel__insight-card {
  border-radius: 28px;
  overflow: hidden;
}

.branding-panel__hero {
  padding: 26px;
  color: #f7f1eb;
  background:
    radial-gradient(circle at top right, rgba(255, 209, 147, 0.26), transparent 22%),
    radial-gradient(circle at left bottom, rgba(255, 255, 255, 0.08), transparent 30%),
    linear-gradient(180deg, #1f2433 0%, #121723 100%);
  box-shadow: 0 22px 52px rgba(18, 23, 35, 0.22);
}

.branding-panel__eyebrow {
  margin-bottom: 10px;
  color: rgba(255, 220, 183, 0.72);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.branding-panel__title {
  font-size: 1.45rem;
  line-height: 1.1;
}

.branding-panel__copy {
  margin-top: 10px;
  color: rgba(246, 241, 234, 0.76);
  line-height: 1.65;
}

.branding-panel__preview-card {
  margin-top: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 18px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(10px);
}

.branding-panel__preview-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.branding-panel__logo-shell {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  height: 74px;
  border-radius: 22px;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.04));
  overflow: hidden;
}

.branding-panel__logo-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.branding-panel__logo-fallback {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.branding-panel__label {
  display: block;
  margin-bottom: 6px;
  color: rgba(255, 234, 208, 0.62);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.branding-panel__company {
  display: block;
  font-size: 1.06rem;
  color: #fff7f0;
}

.branding-panel__state-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.branding-panel__state-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  border-radius: 999px;
  padding: 0.2rem 0.8rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  background: rgba(255, 255, 255, 0.08);
}

.branding-panel__state-pill[data-state='activa'] {
  background: rgba(39, 174, 96, 0.18);
  color: #aff0c1;
}

.branding-panel__state-pill[data-state='mantenimiento'] {
  background: rgba(235, 160, 41, 0.18);
  color: #ffe1ad;
}

.branding-panel__state-pill[data-state='suspendida'] {
  background: rgba(224, 84, 84, 0.18);
  color: #ffc9c9;
}

.branding-panel__state-copy,
.branding-panel__hint,
.branding-panel__insight-copy,
.branding-panel__preview-banner p {
  color: rgba(244, 237, 230, 0.7);
  font-size: 0.86rem;
  line-height: 1.55;
}

.branding-panel__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.branding-panel__upload-btn,
.branding-panel__confirm-btn,
.branding-panel__discard-btn {
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
}

.branding-panel__upload-btn {
  border: 1px solid rgba(255, 240, 219, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #fff4e6;
}

.branding-panel__confirm-btn {
  border: 0;
  background: linear-gradient(135deg, #d4aa61 0%, #bd7d2e 100%);
  color: #1f2433;
}

.branding-panel__discard-btn {
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #fff2df;
}

.branding-panel__preview-banner {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: center;
  margin-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 16px;
}

.branding-panel__preview-banner strong {
  display: block;
  margin-bottom: 5px;
  color: #fffaf3;
}

.branding-panel__insights {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.branding-panel__insight-card {
  padding: 20px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background: rgba(255, 255, 255, 0.84);
  box-shadow: 0 18px 42px rgba(31, 53, 84, 0.08);
}

.branding-panel__insight-label {
  display: block;
  margin-bottom: 10px;
  color: #8c5f2c;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.branding-panel__insight-value {
  display: block;
  color: #162033;
  font-size: 1.2rem;
  font-weight: 700;
}

.branding-panel__insight-value--small {
  font-size: 0.96rem;
  line-height: 1.55;
}

.branding-panel__file-input {
  display: none;
}

@media (max-width: 960px) {
  .branding-panel__preview-banner,
  .branding-panel__insights {
    grid-template-columns: 1fr;
  }

  .branding-panel__preview-banner {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>