<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import AppModal from '@/components/shared/AppModal.vue'
import ApiErrorState from '@/components/shared/ApiErrorState.vue'
import DistributorOnlyNotice from '@/components/shared/DistributorOnlyNotice.vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import { catalogoErrorMessage, useCatalogoDistribuidor } from '@/composables/useCatalogoDistribuidor'

const { isActiveDistributor } = useAuthenticatedSession()
const { obtenerEnlace, regenerarEnlace } = useCatalogoDistribuidor()

const url = ref('')
const loading = ref(true)
const loadError = ref('')
const actionError = ref('')
const successMsg = ref('')
const copied = ref(false)
const confirmOpen = ref(false)
const regenerating = ref(false)
const qrDataUrl = ref('')
const showQr = ref(false)

const whatsappHref = computed(() => {
  const text = `Mira mi catálogo y haz tu pedido aquí: ${url.value}`
  return `https://wa.me/?text=${encodeURIComponent(text)}`
})

const load = async () => {
  loading.value = true
  loadError.value = ''
  try {
    url.value = await obtenerEnlace()
  } catch (error) {
    loadError.value = catalogoErrorMessage(error)
  } finally {
    loading.value = false
  }
}

const copy = async () => {
  try {
    await navigator.clipboard.writeText(url.value)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  } catch {
    actionError.value = 'No pudimos copiar el enlace. Selecciónalo y cópialo manualmente.'
  }
}

const buildQr = async () => {
  if (!url.value) return
  try {
    const QRCode = await import('qrcode')
    qrDataUrl.value = await QRCode.toDataURL(url.value, { width: 220, margin: 1 })
  } catch {
    qrDataUrl.value = ''
    actionError.value = 'No pudimos generar el código QR.'
  }
}

watch([showQr, url], ([visible]) => {
  if (visible) void buildQr()
})

const regenerate = async () => {
  regenerating.value = true
  actionError.value = ''
  try {
    url.value = await regenerarEnlace()
    confirmOpen.value = false
    successMsg.value = 'Generamos un nuevo enlace. El anterior dejó de funcionar.'
  } catch (error) {
    confirmOpen.value = false
    actionError.value = catalogoErrorMessage(error)
  } finally {
    regenerating.value = false
  }
}

onMounted(() => {
  if (isActiveDistributor.value) void load()
  else loading.value = false
})
</script>

<template>
  <AppShell :show-search="false">
    <div v-if="!isActiveDistributor" class="page-body"><DistributorOnlyNotice /></div>
    <div v-else class="page-body">
      <div>
        <h1 class="page-title">Mi catálogo compartible</h1>
        <p class="page-subtitle">Comparte este enlace con tus compradores para que te soliciten pedidos sin iniciar sesión.</p>
      </div>

      <div v-if="successMsg" class="alert alert-success" role="status">{{ successMsg }}<button type="button" aria-label="Cerrar" @click="successMsg = ''">✕</button></div>
      <div v-if="actionError" class="alert alert-error" role="alert">{{ actionError }}<button type="button" aria-label="Cerrar" @click="actionError = ''">✕</button></div>

      <p v-if="loading" class="muted" role="status">Cargando enlace…</p>
      <ApiErrorState v-else-if="loadError" :message="loadError" @retry="load" />

      <section v-else class="card">
        <label class="label" for="catalogo-url">Tu enlace público</label>
        <input id="catalogo-url" class="url-input" type="text" readonly :value="url" @focus="($event.target as HTMLInputElement).select()" />

        <div class="actions">
          <button type="button" class="btn btn-primary" @click="copy">{{ copied ? '¡Copiado!' : 'Copiar' }}</button>
          <a class="btn btn-whatsapp" :href="whatsappHref" target="_blank" rel="noopener noreferrer">Compartir por WhatsApp</a>
          <button type="button" class="btn" @click="showQr = !showQr">{{ showQr ? 'Ocultar QR' : 'Mostrar código QR' }}</button>
          <button type="button" class="btn btn-danger" @click="confirmOpen = true">Regenerar enlace</button>
        </div>

        <div v-if="showQr && qrDataUrl" class="qr">
          <img :src="qrDataUrl" alt="Código QR de tu catálogo" width="220" height="220" />
        </div>
      </section>
    </div>

    <AppModal :open="confirmOpen" title="¿Regenerar tu enlace?" size="sm" @close="confirmOpen = false">
      <p class="modal-text">El enlace actual dejará de funcionar y tendrás que compartir el nuevo con tus compradores.</p>
      <template #footer>
        <button type="button" class="btn" :disabled="regenerating" @click="confirmOpen = false">Cancelar</button>
        <button type="button" class="btn btn-danger" :disabled="regenerating" @click="regenerate">
          {{ regenerating ? 'Regenerando…' : 'Sí, regenerar' }}
        </button>
      </template>
    </AppModal>
  </AppShell>
</template>

<style scoped>
.page-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 16px; max-width: 760px; }
.page-title { font-size: 22px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; }
.page-subtitle, .muted { font-size: 13px; color: #6b7280; margin: 0; }
.card { background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06); display: flex; flex-direction: column; gap: 12px; }
.label { font-size: 13px; font-weight: 600; color: #333; }
.url-input { width: 100%; box-sizing: border-box; height: 42px; padding: 0 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; color: #1a1a1a; background: #f8fafc; }
.actions { display: flex; flex-wrap: wrap; gap: 8px; }
.btn { display: inline-flex; align-items: center; height: 40px; padding: 0 16px; border-radius: 8px; border: 1px solid #e2e8f0; background: #fff; color: #1a1a1a; font-size: 14px; font-weight: 600; cursor: pointer; text-decoration: none; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-primary { background: #1768b8; border-color: #1768b8; color: #fff; }
.btn-whatsapp { background: #25d366; border-color: #25d366; color: #fff; }
.btn-danger { color: #b91c1c; border-color: #fecaca; background: #fef2f2; }
.qr { display: flex; justify-content: center; padding: 8px 0; }
.alert { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; border-radius: 8px; font-size: 13px; }
.alert button { background: none; border: 0; cursor: pointer; font-size: 16px; }
.alert-error { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
.alert-success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; }
.modal-text { margin: 0; font-size: 14px; color: #374151; }
</style>
