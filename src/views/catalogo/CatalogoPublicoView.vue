<script setup lang="ts">
import axios from 'axios'
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import apiClient from '@/app/apiClient'
import PhoneInput from '@/components/shared/PhoneInput.vue'
import { formatCurrency } from '@/utils/formatters'
import {
  FIELD_LIMITS,
  isValidEmail,
  sanitizeEmail,
  sanitizePersonName,
  sanitizeText,
} from '@/utils/fieldRules'
import logoInnovexUrl from '../../assets/logo-innovex.png'

interface CatalogoKit {
  kit_id: number
  nombre: string
  descripcion: string | null
  contenido: string | null
  precio: number
  imagen_url: string | null
  stock_disponible: number
  disponible: boolean
}

interface CatalogoCampana {
  nombre: string
  descripcion: string | null
  imagen_url: string | null
  fecha_fin: string | null
  kits: CatalogoKit[]
}

interface CatalogoPublico {
  distribuidor: string
  empresa: { nombre: string; logo_url: string | null }
  campanas: CatalogoCampana[]
}

interface PedidoCreado {
  codigo: string
  estado: string
}

interface GoogleRecaptcha {
  ready(callback: () => void): void
  render(
    container: HTMLElement,
    parameters: {
      sitekey: string
      theme: 'dark'
      size: 'normal'
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    },
  ): number
  reset(widgetId?: number): void
}

type RecaptchaWindow = Window & {
  grecaptcha?: GoogleRecaptcha
  __innovexRecaptchaScriptPromise?: Promise<GoogleRecaptcha>
}

const recaptchaWindow = window as RecaptchaWindow
const recaptchaScriptUrl = 'https://www.google.com/recaptcha/api.js?render=explicit'

const loadRecaptchaScript = (): Promise<GoogleRecaptcha> => {
  if (recaptchaWindow.grecaptcha) return Promise.resolve(recaptchaWindow.grecaptcha)
  if (recaptchaWindow.__innovexRecaptchaScriptPromise) return recaptchaWindow.__innovexRecaptchaScriptPromise

  const scriptPromise = new Promise<GoogleRecaptcha>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${recaptchaScriptUrl}"]`)
    const script = existingScript ?? document.createElement('script')

    script.addEventListener('load', () => {
      if (recaptchaWindow.grecaptcha) resolve(recaptchaWindow.grecaptcha)
      else reject(new Error('reCAPTCHA no está disponible.'))
    }, { once: true })
    script.addEventListener('error', () => reject(new Error('No se pudo cargar reCAPTCHA.')), { once: true })

    if (!existingScript) {
      script.src = recaptchaScriptUrl
      script.async = true
      script.defer = true
      document.head.append(script)
    }
  })

  recaptchaWindow.__innovexRecaptchaScriptPromise = scriptPromise
  void scriptPromise.catch(() => {
    recaptchaWindow.__innovexRecaptchaScriptPromise = undefined
  })

  return scriptPromise
}

const route = useRoute()
const slug = computed(() => String(route.params.slug ?? ''))

type LoadState = 'loading' | 'ready' | 'invalid' | 'error'
const loadState = ref<LoadState>('loading')
const catalogo = ref<CatalogoPublico | null>(null)
const cantidades = reactive<Record<number, number>>({})

const form = reactive({ nombres: '', apellidos: '', telefono: '', email: '', documento: '' })
const errors = reactive<Record<string, string>>({})
const submitError = ref('')
const submitting = ref(false)
const pedido = ref<PedidoCreado | null>(null)
const formRef = ref<HTMLElement | null>(null)

const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? ''
const recaptchaContainer = ref<HTMLDivElement | null>(null)
const recaptchaToken = ref('')
const recaptchaApi = ref<GoogleRecaptcha | null>(null)
const recaptchaWidgetId = ref<number | null>(null)

const resetRecaptcha = () => {
  recaptchaToken.value = ''
  if (recaptchaApi.value && recaptchaWidgetId.value !== null) {
    recaptchaApi.value.reset(recaptchaWidgetId.value)
  }
}

const renderRecaptcha = () => {
  if (!recaptchaSiteKey || !recaptchaContainer.value || recaptchaWidgetId.value !== null) return

  void loadRecaptchaScript()
    .then((api) => {
      recaptchaApi.value = api
      api.ready(() => {
        if (!recaptchaContainer.value || recaptchaWidgetId.value !== null) return
        try {
          recaptchaWidgetId.value = api.render(recaptchaContainer.value, {
            sitekey: recaptchaSiteKey,
            theme: 'dark',
            size: 'normal',
            callback: (token) => { recaptchaToken.value = token },
            'expired-callback': () => { recaptchaToken.value = '' },
            'error-callback': () => { recaptchaToken.value = '' },
          })
        } catch {
          submitError.value = 'No se pudo cargar la verificación. Inténtalo de nuevo.'
        }
      })
    })
    .catch(() => {
      submitError.value = 'No se pudo cargar la verificación. Inténtalo de nuevo.'
    })
}

const loadCatalogo = async () => {
  if (!catalogo.value) loadState.value = 'loading'
  try {
    const { data } = await apiClient.get<{ data: CatalogoPublico }>(
      `/public/catalogo/${encodeURIComponent(slug.value)}`,
    )
    catalogo.value = data.data
    loadState.value = 'ready'
    await nextTick()
    renderRecaptcha()
  } catch (error) {
    if (catalogo.value) return
    loadState.value = axios.isAxiosError(error) && error.response?.status === 404 ? 'invalid' : 'error'
  }
}

onMounted(loadCatalogo)
onBeforeUnmount(resetRecaptcha)

const hasKits = computed(() => catalogo.value?.campanas.some((c) => c.kits.length > 0) ?? false)

const items = computed(() =>
  Object.entries(cantidades)
    .map(([kitId, cantidad]) => ({ kit_id: Number(kitId), cantidad }))
    .filter((item) => item.cantidad > 0),
)
const totalUnidades = computed(() => items.value.reduce((sum, item) => sum + item.cantidad, 0))

const setCantidad = (kit: CatalogoKit, value: number) => {
  const safe = Number.isFinite(value) ? Math.floor(value) : 0
  cantidades[kit.kit_id] = Math.max(0, Math.min(kit.stock_disponible, safe))
}

const onCantidadInput = (kit: CatalogoKit, event: Event) => {
  const target = event.target as HTMLInputElement
  setCantidad(kit, Number(target.value.replace(/\D/g, '')))
  target.value = String(cantidades[kit.kit_id] ?? 0)
}

const clearErrors = () => {
  Object.keys(errors).forEach((key) => delete errors[key])
}

const validate = (): boolean => {
  clearErrors()
  if (!form.nombres.trim()) errors.nombres = 'Tus nombres son obligatorios.'
  if (!form.apellidos.trim()) errors.apellidos = 'Tus apellidos son obligatorios.'
  const phoneDigits = form.telefono.replace(/\D/g, '')
  if (!form.telefono) errors.telefono = 'Tu teléfono es obligatorio.'
  else if (phoneDigits.length < 6 || phoneDigits.length > 15) errors.telefono = 'El teléfono no tiene un formato válido.'
  if (!form.email.trim()) errors.email = 'Tu correo electrónico es obligatorio.'
  else if (!isValidEmail(form.email.trim())) errors.email = 'El correo electrónico no tiene un formato válido.'
  if (items.value.length === 0) errors.items = 'Selecciona al menos un producto.'
  if (recaptchaSiteKey && !recaptchaToken.value) errors.captcha = 'Por favor confirma que no eres un robot.'
  return Object.keys(errors).length === 0
}

const errorMessageFor = (error: unknown): string => {
  if (!axios.isAxiosError(error) || !error.response) {
    return 'No pudimos enviar tu pedido. Revisa tu conexión e inténtalo de nuevo.'
  }
  const { status, data } = error.response as {
    status: number
    data?: { message?: string; errors?: Record<string, string[]> }
  }
  const apiMessage = typeof data?.message === 'string' ? data.message : ''
  const firstField = data?.errors ? Object.values(data.errors).flat()[0] : ''

  if (status === 404) return 'Este catálogo ya no está disponible. Verifica el enlace con tu distribuidor.'
  if (status === 409) return apiMessage || 'No hay suficiente stock de alguno de los productos seleccionados.'
  if (status === 429) return 'Has enviado muchas solicitudes. Espera un momento e inténtalo de nuevo.'
  if (status === 422) return firstField || apiMessage || 'Revisa los datos ingresados e inténtalo de nuevo.'
  return 'No pudimos enviar tu pedido. Inténtalo de nuevo en unos minutos.'
}

const submit = async () => {
  submitError.value = ''
  if (!validate()) {
    await nextTick()
    formRef.value?.querySelector('[aria-invalid="true"], .field-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  submitting.value = true
  try {
    const documento = form.documento.trim()
    const { data } = await apiClient.post<{ data: PedidoCreado }>(
      `/public/catalogo/${encodeURIComponent(slug.value)}/pedidos`,
      {
        comprador: {
          nombres: form.nombres.trim(),
          apellidos: form.apellidos.trim(),
          telefono: form.telefono,
          email: form.email.trim(),
          ...(documento ? { documento } : {}),
        },
        items: items.value,
        ...(recaptchaSiteKey ? { captcha_token: recaptchaToken.value } : {}),
      },
    )
    pedido.value = data.data
    window.scrollTo({ top: 0 })
  } catch (error) {
    submitError.value = errorMessageFor(error)
    resetRecaptcha()
    if (axios.isAxiosError(error) && [409, 422].includes(error.response?.status ?? 0)) {
      void loadCatalogo()
    }
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="catalogo-page">
    <header class="catalogo-header">
      <img :src="logoInnovexUrl" alt="Innovex" class="catalogo-logo" />
      <div v-if="catalogo" class="catalogo-owner">
        <img v-if="catalogo.empresa.logo_url" :src="catalogo.empresa.logo_url" alt="" class="empresa-logo" />
        <div>
          <p class="empresa-nombre">{{ catalogo.empresa.nombre }}</p>
          <p v-if="catalogo.distribuidor" class="distribuidor-nombre">Distribuidor: {{ catalogo.distribuidor }}</p>
        </div>
      </div>
    </header>

    <main class="catalogo-main">
      <p v-if="loadState === 'loading'" class="state-card" role="status">Cargando catálogo…</p>

      <div v-else-if="loadState === 'invalid'" class="state-card" role="alert">
        <h1>Enlace no válido</h1>
        <p>Este catálogo no está disponible. Verifica el enlace con tu distribuidor.</p>
      </div>

      <div v-else-if="loadState === 'error'" class="state-card" role="alert">
        <h1>No pudimos cargar el catálogo</h1>
        <p>Revisa tu conexión e inténtalo de nuevo.</p>
        <button type="button" class="btn-primary" @click="loadCatalogo">Reintentar</button>
      </div>

      <section v-else-if="pedido" class="state-card confirmation" role="status">
        <div class="check" aria-hidden="true">✓</div>
        <h1>¡Pedido recibido!</h1>
        <p class="codigo-label">Código de tu pedido</p>
        <p class="codigo">{{ pedido.codigo }}</p>
        <p>Tu distribuidor se pondrá en contacto contigo para coordinar la entrega</p>
      </section>

      <template v-else-if="catalogo">
        <div v-if="!hasKits" class="state-card" role="status">
          <h1>Sin campaña activa</h1>
          <p>Por ahora no hay productos disponibles en este catálogo. Vuelve a intentarlo más tarde.</p>
        </div>

        <form v-else ref="formRef" novalidate @submit.prevent="submit">
          <section v-for="campana in catalogo.campanas" :key="campana.nombre" class="campana">
            <h1 class="campana-title">{{ campana.nombre }}</h1>
            <p v-if="campana.descripcion" class="campana-desc">{{ campana.descripcion }}</p>
            <p v-if="campana.fecha_fin" class="campana-desc">Disponible hasta el {{ campana.fecha_fin }}</p>

            <ul class="kit-list">
              <li v-for="kit in campana.kits" :key="kit.kit_id" class="kit-card" :class="{ 'is-soldout': !kit.disponible }">
                <img
                  v-if="kit.imagen_url || campana.imagen_url"
                  :src="kit.imagen_url || campana.imagen_url || ''"
                  :alt="kit.nombre"
                  class="kit-img"
                  loading="lazy"
                />
                <div v-else class="kit-img kit-img-empty" aria-hidden="true">📦</div>
                <div class="kit-body">
                  <h2 class="kit-name">{{ kit.nombre }}</h2>
                  <p v-if="kit.descripcion" class="kit-desc">{{ kit.descripcion }}</p>
                  <p class="kit-price">{{ formatCurrency(kit.precio) }} <span>precio referencial</span></p>
                  <p class="kit-stock" :class="{ none: !kit.disponible }">
                    {{ kit.disponible ? `Stock: ${kit.stock_disponible}` : 'Sin stock' }}
                  </p>
                  <div v-if="kit.disponible" class="qty" role="group" :aria-label="`Cantidad de ${kit.nombre}`">
                    <button type="button" aria-label="Quitar uno" :disabled="(cantidades[kit.kit_id] ?? 0) <= 0" @click="setCantidad(kit, (cantidades[kit.kit_id] ?? 0) - 1)">−</button>
                    <input
                      :value="cantidades[kit.kit_id] ?? 0"
                      type="text"
                      inputmode="numeric"
                      maxlength="4"
                      aria-label="Cantidad"
                      @input="onCantidadInput(kit, $event)"
                    />
                    <button type="button" aria-label="Agregar uno" :disabled="(cantidades[kit.kit_id] ?? 0) >= kit.stock_disponible" @click="setCantidad(kit, (cantidades[kit.kit_id] ?? 0) + 1)">+</button>
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <p v-if="errors.items" class="field-error" role="alert">{{ errors.items }}</p>

          <section class="request-card">
            <h2>Solicita tu pedido</h2>
            <p class="request-sub">{{ totalUnidades }} {{ totalUnidades === 1 ? 'unidad seleccionada' : 'unidades seleccionadas' }}</p>

            <label class="field">
              <span>Nombres</span>
              <input v-model="form.nombres" type="text" autocomplete="given-name" :maxlength="FIELD_LIMITS.personName" :aria-invalid="!!errors.nombres" @input="form.nombres = sanitizePersonName(form.nombres)" />
              <small v-if="errors.nombres" class="field-error">{{ errors.nombres }}</small>
            </label>

            <label class="field">
              <span>Apellidos</span>
              <input v-model="form.apellidos" type="text" autocomplete="family-name" :maxlength="FIELD_LIMITS.personName" :aria-invalid="!!errors.apellidos" @input="form.apellidos = sanitizePersonName(form.apellidos)" />
              <small v-if="errors.apellidos" class="field-error">{{ errors.apellidos }}</small>
            </label>

            <div class="field">
              <span>Teléfono</span>
              <PhoneInput v-model="form.telefono" required :invalid="!!errors.telefono" />
              <small v-if="errors.telefono" class="field-error">{{ errors.telefono }}</small>
            </div>

            <label class="field">
              <span>Correo electrónico</span>
              <input v-model="form.email" type="email" autocomplete="email" :maxlength="FIELD_LIMITS.email" :aria-invalid="!!errors.email" @input="form.email = sanitizeEmail(form.email)" />
              <small v-if="errors.email" class="field-error">{{ errors.email }}</small>
            </label>

            <label class="field">
              <span>Documento <em>(opcional)</em></span>
              <input v-model="form.documento" type="text" maxlength="30" @input="form.documento = sanitizeText(form.documento, 30)" />
            </label>

            <div v-if="recaptchaSiteKey" class="recaptcha-box">
              <div ref="recaptchaContainer" class="recaptcha-widget"></div>
            </div>
            <small v-if="errors.captcha" class="field-error">{{ errors.captcha }}</small>

            <p v-if="submitError" class="submit-error" role="alert">{{ submitError }}</p>

            <button type="submit" class="btn-primary" :disabled="submitting">
              {{ submitting ? 'Enviando…' : 'Solicitar pedido' }}
            </button>
          </section>
        </form>
      </template>
    </main>
  </div>
</template>

<style scoped>
.catalogo-page {
  --surface: #0b1120;
  --border: rgba(255, 255, 255, 0.1);
  --text: #f1f5f9;
  --muted: rgba(255, 255, 255, 0.6);
  --brand: #3eb5f5;
  --brand-dark: #1768b8;
  --danger: #ff6b6b;
  min-height: 100vh;
  background: linear-gradient(155deg, #0a1a33 0%, #071226 55%, #060913 100%);
  color: var(--text);
}

.catalogo-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}

.catalogo-logo { height: 32px; width: auto; align-self: flex-start; object-fit: contain; }
.catalogo-owner { display: flex; align-items: center; gap: 12px; }
.empresa-logo { width: 44px; height: 44px; object-fit: contain; border-radius: 10px; background: #fff; }
.empresa-nombre { margin: 0; font-size: 18px; font-weight: 700; }
.distribuidor-nombre { margin: 2px 0 0; color: var(--muted); font-size: 14px; }

.catalogo-main { max-width: 720px; margin: 0 auto; padding: 16px 16px 48px; }

.state-card {
  margin-top: 24px;
  padding: 28px 20px;
  text-align: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  color: var(--muted);
}
.state-card h1 { margin: 0 0 8px; color: var(--text); font-size: 22px; }

.confirmation .check {
  width: 56px; height: 56px; margin: 0 auto 12px; display: grid; place-items: center;
  border-radius: 50%; font-size: 28px; color: #fff;
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
}
.codigo-label { margin: 16px 0 4px; font-size: 13px; }
.codigo { margin: 0 0 16px; color: var(--brand); font-size: 28px; font-weight: 800; letter-spacing: 2px; word-break: break-all; }

.campana-title { margin: 20px 0 6px; font-size: 22px; }
.campana-desc { margin: 0 0 6px; color: var(--muted); font-size: 14px; }

.kit-list { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 12px; }
.kit-card {
  display: flex; gap: 12px; padding: 12px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
}
.kit-card.is-soldout { opacity: 0.6; }
.kit-img { width: 88px; height: 88px; flex-shrink: 0; object-fit: cover; border-radius: 10px; background: rgba(255, 255, 255, 0.05); }
.kit-img-empty { display: grid; place-items: center; font-size: 32px; }
.kit-body { flex: 1; min-width: 0; }
.kit-name { margin: 0; font-size: 16px; font-weight: 700; }
.kit-desc { margin: 4px 0; color: var(--muted); font-size: 13px; }
.kit-price { margin: 4px 0 0; color: var(--brand); font-weight: 700; }
.kit-price span { color: var(--muted); font-size: 11px; font-weight: 400; }
.kit-stock { margin: 2px 0 8px; color: var(--muted); font-size: 12px; }
.kit-stock.none { color: var(--danger); }

.qty { display: inline-flex; align-items: center; border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
.qty button {
  width: 40px; height: 40px; border: 0; background: rgba(62, 181, 245, 0.12);
  color: var(--brand); font-size: 20px; cursor: pointer;
}
.qty button:disabled { opacity: 0.4; cursor: not-allowed; }
.qty input {
  width: 52px; height: 40px; text-align: center; border: 0;
  background: transparent; color: var(--text); font-size: 16px;
}

.request-card {
  margin-top: 24px; padding: 20px 16px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 16px;
  display: flex; flex-direction: column; gap: 14px;
}
.request-card h2 { margin: 0; font-size: 20px; }
.request-sub { margin: -8px 0 0; color: var(--muted); font-size: 13px; }

.field { display: flex; flex-direction: column; gap: 6px; font-size: 14px; }
.field > span em { color: var(--muted); font-style: normal; }
.field input {
  height: 46px; padding: 0 12px; border-radius: 10px; font-size: 16px;
  border: 1px solid var(--border); background: rgba(255, 255, 255, 0.04); color: var(--text);
}
.field input:focus-visible, .qty input:focus-visible { outline: 2px solid var(--brand); outline-offset: 1px; }
.field input[aria-invalid='true'] { border-color: var(--danger); }
.field-error { color: var(--danger); font-size: 13px; }

.submit-error {
  margin: 0; padding: 12px; border-radius: 10px; font-size: 14px;
  color: var(--danger); background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3);
}

.recaptcha-box { display: flex; justify-content: center; overflow: hidden; }
.recaptcha-widget { display: flex; justify-content: center; width: 304px; max-width: 100%; }

.btn-primary {
  height: 50px; padding: 0 20px; border: 0; border-radius: 12px; cursor: pointer;
  color: #fff; font-size: 16px; font-weight: 700;
  background: linear-gradient(135deg, var(--brand), var(--brand-dark));
}
.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.state-card .btn-primary { margin-top: 16px; }

@media (min-width: 640px) {
  .catalogo-header { flex-direction: row; align-items: center; justify-content: space-between; padding: 16px 32px; }
  .kit-img { width: 120px; height: 120px; }
}
</style>
