<script setup lang="ts">
import AppModal from '@/components/shared/AppModal.vue'

interface Props {
  open: boolean
  loading: boolean
  userName: string
  temporaryPassword: string
}

defineProps<Props>()

const emit = defineEmits<{
  close: []
  confirm: []
}>()
</script>

<template>
  <AppModal
    :open="open"
    title="Reset de contrasena"
    :description="temporaryPassword
      ? 'Entrega esta contrasena temporal por un canal seguro. Las sesiones activas del usuario ya fueron revocadas.'
      : `Se generara una contrasena temporal para ${userName} y se cerraran sus sesiones activas.`"
    size="md"
    @close="emit('close')"
  >
    <div v-if="temporaryPassword" class="password-result">
      <span class="password-label">Contrasena temporal</span>
      <code class="password-value">{{ temporaryPassword }}</code>
      <p class="password-help">Muestrala solo una vez y evita enviarla por canales inseguros.</p>
    </div>

    <div v-else class="password-warning">
      <p>
        Esta accion invalida las sesiones actuales y reemplaza la contrasena del usuario por una temporal.
      </p>
    </div>

    <template #footer>
      <button type="button" class="btn-outline" @click="emit('close')">Cerrar</button>
      <button v-if="!temporaryPassword" type="button" class="btn-danger" :disabled="loading" @click="emit('confirm')">
        {{ loading ? 'Generando...' : 'Generar contrasena temporal' }}
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.password-warning,
.password-result {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.password-warning p,
.password-help {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #475569;
}

.password-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #475569;
}

.password-value {
  display: block;
  padding: 14px 16px;
  border-radius: 12px;
  background: #0f172a;
  color: #f8fafc;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.btn-outline,
.btn-danger {
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 700;
}

.btn-outline {
  border: 1px solid #d7dee8;
  background: #fff;
  color: #334155;
}

.btn-danger {
  border: none;
  background: #b91c1c;
  color: #fff;
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>