<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'

export interface AccessCredentials {
  personName: string
  companyName: string
  email: string
  password: string
}

const props = defineProps<{
  open: boolean
  credentials: AccessCredentials | null
}>()

const emit = defineEmits<{
  close: []
}>()

const copyAllButton = ref<HTMLButtonElement | null>(null)
const localCredentials = ref<AccessCredentials | null>(null)
const passwordVisible = ref(false)
const acknowledged = ref(false)
const copyAnnouncement = ref('')
const copyError = ref('')
const downloadText = computed(() => {
  const credentials = localCredentials.value
  if (!credentials) return ''

  return `Panel: ${window.location.origin}\nUsuario: ${credentials.email}\nContraseña: ${credentials.password}`
})

watch(
  () => [props.open, props.credentials] as const,
  async ([isOpen, credentials]) => {
    if (isOpen && credentials) {
      localCredentials.value = { ...credentials }
      passwordVisible.value = false
      acknowledged.value = false
      copyAnnouncement.value = ''
      copyError.value = ''
      await nextTick()
      copyAllButton.value?.focus()
      return
    }

    if (!isOpen) {
      localCredentials.value = null
      passwordVisible.value = false
      acknowledged.value = false
      copyAnnouncement.value = ''
      copyError.value = ''
    }
  },
  { immediate: true },
)

const close = () => {
  if (!acknowledged.value) return
  emit('close')
}

const copy = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value)
    copyAnnouncement.value = 'Copiado'
    copyError.value = ''
  } catch {
    copyAnnouncement.value = ''
    copyError.value = 'No se pudo copiar. Selecciona el dato e inténtalo de nuevo.'
  }
}

const downloadCredentials = () => {
  if (!downloadText.value) return

  const file = new Blob([downloadText.value], { type: 'text/plain;charset=utf-8' })
  const downloadUrl = URL.createObjectURL(file)
  const link = document.createElement('a')
  link.href = downloadUrl
  link.download = 'credenciales-acceso.txt'
  link.click()
  URL.revokeObjectURL(downloadUrl)
}
</script>

<template>
  <AppModal
    :open="open"
    size="md"
    title="Credenciales de acceso"
    description="Entrega estas credenciales a la persona de forma segura."
    @close="close"
  >
    <div v-if="localCredentials" class="access-credentials">
      <p class="access-credentials__warning">
        Esta contraseña se muestra una sola vez. Cópiala ahora; si se pierde, usa Restablecer acceso.
      </p>

      <div class="access-credentials__item">
        <span>Persona</span>
        <strong>{{ localCredentials.personName }}</strong>
        <button type="button" @click="copy(localCredentials.personName)">Copiar</button>
      </div>
      <div class="access-credentials__item">
        <span>Empresa</span>
        <strong>{{ localCredentials.companyName }}</strong>
        <button type="button" @click="copy(localCredentials.companyName)">Copiar</button>
      </div>
      <div class="access-credentials__item">
        <span>Correo de acceso</span>
        <strong>{{ localCredentials.email }}</strong>
        <button type="button" @click="copy(localCredentials.email)">Copiar</button>
      </div>
      <div class="access-credentials__item">
        <label for="access-temporary-password">Contraseña temporal</label>
        <input
          id="access-temporary-password"
          :type="passwordVisible ? 'text' : 'password'"
          :value="localCredentials.password"
          readonly
          autocomplete="off"
        />
        <div class="access-credentials__password-actions">
          <button type="button" @click="passwordVisible = !passwordVisible">
            {{ passwordVisible ? 'Ocultar' : 'Mostrar' }}
          </button>
          <button type="button" @click="copy(localCredentials.password)">Copiar</button>
        </div>
      </div>

      <div class="access-credentials__actions">
        <button ref="copyAllButton" type="button" class="access-credentials__copy-all" @click="copy(downloadText)">
          Copiar todo
        </button>
        <button type="button" class="access-credentials__download" @click="downloadCredentials">
          Descargar .txt
        </button>
      </div>
      <p class="access-credentials__announcement" aria-live="polite">{{ copyAnnouncement }}</p>
      <p v-if="copyError" class="access-credentials__error" role="alert">{{ copyError }}</p>

      <label class="access-credentials__acknowledgement">
        <input v-model="acknowledged" type="checkbox" />
        <span>Ya guardé estas credenciales</span>
      </label>
    </div>

    <template #footer>
      <button
        type="button"
        class="access-credentials__understood"
        :disabled="!acknowledged"
        @click="close"
      >
        Entendido
      </button>
    </template>
  </AppModal>
</template>

<style scoped>
.access-credentials {
  display: grid;
  gap: 14px;
  color: #17314f;
}

.access-credentials__warning {
  margin: 0;
  padding: 12px 14px;
  border: 1px solid #f4d28c;
  border-radius: 10px;
  background: #fff8e8;
  color: #744b08;
  font-size: 0.9rem;
  line-height: 1.45;
}

.access-credentials__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 6px 12px;
  padding: 12px;
  border: 1px solid #dce5ef;
  border-radius: 10px;
}

.access-credentials__item > span,
.access-credentials__item > label {
  grid-column: 1 / -1;
  color: #60758d;
  font-size: 0.8rem;
  font-weight: 700;
}

.access-credentials__item strong,
.access-credentials__item input {
  min-width: 0;
  overflow-wrap: anywhere;
  color: #17314f;
  font: inherit;
  font-weight: 650;
}

.access-credentials__item input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.access-credentials button {
  min-height: 38px;
  padding: 8px 12px;
  border: 1px solid #c5d3e2;
  border-radius: 8px;
  background: #fff;
  color: #174f85;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.access-credentials button:hover:not(:disabled) {
  background: #eff6ff;
}

.access-credentials button:focus-visible,
.access-credentials__acknowledgement input:focus-visible {
  outline: 3px solid rgba(31, 122, 224, 0.35);
  outline-offset: 2px;
}

.access-credentials__password-actions,
.access-credentials__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.access-credentials__password-actions {
  grid-column: 1 / -1;
}

.access-credentials__copy-all,
.access-credentials__understood {
  border-color: #1f6fb5 !important;
  background: #1f6fb5 !important;
  color: #fff !important;
}

.access-credentials__copy-all {
  flex: 1;
}

.access-credentials__understood:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.access-credentials__announcement,
.access-credentials__error {
  min-height: 1.2em;
  margin: 0;
  font-size: 0.85rem;
}

.access-credentials__announcement {
  color: #167044;
}

.access-credentials__error {
  color: #b42318;
}

.access-credentials__acknowledgement {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding-top: 4px;
  font-weight: 700;
}

.access-credentials__acknowledgement input {
  width: 18px;
  height: 18px;
  margin: 1px 0 0;
  accent-color: #1f6fb5;
}

@media (max-width: 480px) {
  .access-credentials__item {
    grid-template-columns: minmax(0, 1fr);
  }

  .access-credentials__item button {
    width: 100%;
  }

  .access-credentials__actions button {
    flex: 1 1 100%;
  }
}
</style>
