<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { RefreshCw, Save } from 'lucide-vue-next'
import AppButton from '@/components/shared/AppButton.vue'
import type { UpdateWorkspaceProfilePayload, WorkspaceProfile } from '../types'

const props = defineProps<{
  profile: WorkspaceProfile | null
  loading: boolean
  saving: boolean
}>()

const emit = defineEmits<{
  submit: [payload: UpdateWorkspaceProfilePayload]
  refresh: []
}>()

const form = reactive<UpdateWorkspaceProfilePayload>({
  nombre: '',
  nombre_comercial: '',
  moneda_iso: 'PEN',
  estado: 'activa',
  mensaje_estado_operativo: '',
})

watch(
  () => props.profile,
  (profile) => {
    if (!profile) {
      return
    }

    form.nombre = profile.nombre
    form.nombre_comercial = profile.nombre_comercial ?? ''
    form.moneda_iso = profile.moneda_iso ?? 'PEN'
    form.estado = profile.estado_operativo === 'configuracion' ? 'activa' : profile.estado_operativo
    form.mensaje_estado_operativo = profile.mensaje_estado_operativo ?? ''
  },
  { immediate: true },
)

const shouldShowOperationalMessage = computed(
  () => form.estado === 'mantenimiento' || form.estado === 'suspendida',
)

const statusOptions = [
  {
    value: 'activa',
    label: 'Activa',
    description: 'Operacion normal para ventas, validaciones y solicitudes.',
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
] as const

const handleSubmit = () => {
    emit('submit', {
      nombre: form.nombre.trim(),
      nombre_comercial: form.nombre_comercial?.trim() || null,
      moneda_iso: form.moneda_iso?.trim().toUpperCase() || null,
      estado: form.estado ?? null,
      mensaje_estado_operativo: shouldShowOperationalMessage.value
        ? form.mensaje_estado_operativo?.trim() || null
        : null,
    })
}
</script>

<template>
  <section class="workspace-card workspace-profile">
    <div class="workspace-card__header">
      <div>
        <p class="workspace-eyebrow">Perfil corporativo</p>
        <h2 class="workspace-card__title">Identidad base del workspace</h2>
        <p class="workspace-card__subtitle">
          Configura el nombre visible, la moneda operativa y el estado actual del entorno.
        </p>
      </div>

      <AppButton type="button" variant="ghost" size="sm" class="workspace-ghost-btn" :disabled="loading || saving" @click="emit('refresh')">
        <template #leading>
          <RefreshCw class="size-4" />
        </template>
        Actualizar
      </AppButton>
    </div>

    <div v-if="loading" class="workspace-loading-block">
      <span class="workspace-loading-block__pulse" />
      <span class="workspace-loading-block__text">Cargando configuracion actual...</span>
    </div>

    <form v-else class="workspace-form" @submit.prevent="handleSubmit">
      <div class="workspace-form__grid">
        <label class="workspace-field">
          <span class="workspace-field__label">Nombre legal</span>
          <input v-model="form.nombre" class="workspace-input" type="text" maxlength="100" required />
        </label>

        <label class="workspace-field">
          <span class="workspace-field__label">Nombre comercial</span>
          <input v-model="form.nombre_comercial" class="workspace-input" type="text" maxlength="100" placeholder="Opcional" />
        </label>

        <label class="workspace-field">
          <span class="workspace-field__label">Moneda base</span>
          <input
            v-model="form.moneda_iso"
            class="workspace-input workspace-input--mono"
            type="text"
            maxlength="3"
            placeholder="PEN"
            :disabled="props.profile?.moneda_bloqueada"
          />
          <span class="workspace-field__hint">
            {{ props.profile?.moneda_bloqueada ? 'Bloqueada por operaciones registradas.' : 'Usa codigo ISO de 3 letras.' }}
          </span>
        </label>

        <div class="workspace-field workspace-field--wide">
          <span class="workspace-field__label">Estado operativo</span>
          <div class="workspace-status-grid">
            <label v-for="option in statusOptions" :key="option.value" class="workspace-status-card" :class="{ 'workspace-status-card--active': form.estado === option.value }">
              <input v-model="form.estado" class="workspace-status-card__input" type="radio" :value="option.value" />
              <span class="workspace-status-card__title">{{ option.label }}</span>
              <span class="workspace-status-card__description">{{ option.description }}</span>
            </label>
          </div>
        </div>

        <label v-if="shouldShowOperationalMessage" class="workspace-field workspace-field--wide">
          <span class="workspace-field__label">Mensaje operativo</span>
          <textarea
            v-model="form.mensaje_estado_operativo"
            class="workspace-textarea"
            rows="4"
            maxlength="500"
            placeholder="Este mensaje sera visible para distribuidores cuando el workspace no este en modo activo."
          />
        </label>
      </div>

      <div class="workspace-form__actions">
        <AppButton type="submit" variant="primary" class="workspace-primary-btn" :disabled="saving">
          <template #leading>
            <Save class="size-4" />
          </template>
          {{ saving ? 'Guardando...' : 'Guardar perfil' }}
        </AppButton>
      </div>
    </form>
  </section>
</template>

<style scoped>
.workspace-card {
  border-radius: 28px;
  border: 1px solid rgba(32, 51, 79, 0.08);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(248, 250, 252, 0.92) 100%),
    #ffffff;
  box-shadow: 0 24px 60px rgba(31, 53, 84, 0.08);
}

.workspace-profile {
  padding: 28px;
}

.workspace-profile-form--admin.workspace-profile {
  padding: 18px;
}

.workspace-card__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.workspace-profile-form--admin .workspace-card__header {
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}

.workspace-eyebrow {
  margin-bottom: 8px;
  color: #9a6b2f;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.workspace-card__title {
  font-size: 1.55rem;
  font-weight: 700;
  line-height: 1.1;
  color: #1d2433;
}

.workspace-profile-form--admin .workspace-card__title {
  font-size: 1.12rem;
  line-height: 1.15;
}

.workspace-card__subtitle {
  margin-top: 8px;
  max-width: 56ch;
  color: #5d697d;
  font-size: 0.95rem;
  line-height: 1.6;
}

.workspace-profile-form--admin .workspace-card__subtitle {
  margin-top: 6px;
  max-width: 42ch;
  font-size: 0.88rem;
  line-height: 1.45;
}

.workspace-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.workspace-profile-form--admin .workspace-form {
  gap: 14px;
}

.workspace-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.workspace-profile-form--admin .workspace-form__grid {
  gap: 12px;
}

.workspace-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workspace-profile-form--admin .workspace-field {
  gap: 5px;
}

.workspace-field--wide {
  grid-column: 1 / -1;
}

.workspace-field__label {
  color: #2d3748;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.workspace-profile-form--admin .workspace-field__label {
  font-size: 0.74rem;
}

.workspace-field__hint {
  color: #6c7a90;
  font-size: 0.78rem;
}

.workspace-profile-form--admin .workspace-field__hint {
  font-size: 0.72rem;
}

.workspace-input,
.workspace-textarea {
  width: 100%;
  border: 1px solid rgba(47, 62, 84, 0.14);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.94);
  color: #162033;
  font-size: 0.97rem;
  padding: 0.95rem 1rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.workspace-profile-form--admin .workspace-input,
.workspace-profile-form--admin .workspace-textarea {
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
  font-size: 0.92rem;
}

.workspace-input--mono {
  font-family: 'SFMono-Regular', 'Monaco', 'Cascadia Mono', monospace;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.workspace-input:focus,
.workspace-textarea:focus {
  border-color: rgba(186, 123, 47, 0.52);
  box-shadow: 0 0 0 4px rgba(186, 123, 47, 0.12);
}

.workspace-textarea {
  resize: vertical;
  min-height: 120px;
}

.workspace-profile-form--admin .workspace-textarea {
  min-height: 88px;
}

.workspace-status-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.workspace-profile-form--admin .workspace-status-grid {
  gap: 10px;
}

.workspace-status-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  border: 1px solid rgba(47, 62, 84, 0.14);
  border-radius: 20px;
  padding: 16px;
  background: rgba(247, 248, 250, 0.92);
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.workspace-profile-form--admin .workspace-status-card {
  border-radius: 14px;
  padding: 12px;
  gap: 4px;
}

.workspace-status-card--active {
  border-color: rgba(186, 123, 47, 0.44);
  background: linear-gradient(180deg, rgba(255, 243, 228, 0.94) 0%, rgba(255, 248, 240, 0.96) 100%);
  transform: translateY(-1px);
}

.workspace-status-card__input {
  position: absolute;
  inset: 0;
  opacity: 0;
}

.workspace-status-card__title {
  color: #1f2937;
  font-weight: 700;
}

.workspace-profile-form--admin .workspace-status-card__title {
  font-size: 0.94rem;
}

.workspace-status-card__description {
  color: #617086;
  font-size: 0.84rem;
  line-height: 1.5;
}

.workspace-profile-form--admin .workspace-status-card__description {
  font-size: 0.79rem;
  line-height: 1.35;
}

.workspace-form__actions {
  display: flex;
  justify-content: flex-end;
}

.workspace-profile-form--admin .workspace-form__actions {
  margin-top: 2px;
}

.workspace-profile-form--admin :deep(.workspace-ghost-btn) {
  min-height: 36px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 0.82rem;
}

.workspace-profile-form--admin :deep(.workspace-primary-btn) {
  min-height: 40px;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 0.82rem;
}

.workspace-loading-block {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 18px 0 6px;
}

.workspace-loading-block__pulse {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: #ba7b2f;
  box-shadow: 0 0 0 0 rgba(186, 123, 47, 0.36);
  animation: pulse 1.4s ease-in-out infinite;
}

.workspace-loading-block__text {
  color: #5d697d;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(186, 123, 47, 0.36);
  }

  70% {
    box-shadow: 0 0 0 12px rgba(186, 123, 47, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(186, 123, 47, 0);
  }
}

@media (max-width: 960px) {
  .workspace-form__grid,
  .workspace-status-grid {
    grid-template-columns: 1fr;
  }

  .workspace-card__header {
    flex-direction: column;
  }
}
</style>