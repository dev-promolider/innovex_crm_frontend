<template>
  <div class="login-page">
    <!-- Panel de marca (solo escritorio) -->
    <aside class="brand-panel">
      <div class="brand-glow"></div>
      <div class="brand-content">
        <div class="brand-logo">
          <img :src="logoInnovex" alt="Logo Innovex" class="brand-logo-img" />
          <span class="brand-name"><span class="brand-name-hl">INNO</span>VEX</span>
        </div>

        <h1 class="brand-title">Gestiona tu red de distribuidores en un solo lugar</h1>
        <p class="brand-subtitle">
          Campañas, ventas, pagos y reportes de tu empresa, con control total y en tiempo real.
        </p>

        <ul class="benefits">
          <li class="benefit">
            <span class="benefit-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="9" cy="8" r="3.2" />
                <path d="M2.5 20c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" />
                <path d="M16 4.6a3.2 3.2 0 0 1 0 6.2M18 14.4c2.2.6 3.5 2.4 3.5 5.6" />
              </svg>
            </span>
            <span>Red de distribuidores y niveles siempre organizada</span>
          </li>
          <li class="benefit">
            <span class="benefit-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
                <path d="M2.5 10h19M6.5 15h4" />
              </svg>
            </span>
            <span>Control de ventas, deudas y pagos</span>
          </li>
          <li class="benefit">
            <span class="benefit-icon">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3.5 20.5h17" />
                <path d="M6 16.5v-5M12 16.5V7M18 16.5v-8" />
              </svg>
            </span>
            <span>Métricas y reportes para decidir mejor</span>
          </li>
        </ul>
      </div>
    </aside>

    <!-- Formulario -->
    <main class="form-panel">
      <div class="form-wrap">
        <div class="mobile-logo">
          <img :src="logoInnovex" alt="Logo Innovex" class="mobile-logo-img" />
          <span class="brand-name"><span class="brand-name-hl">INNO</span>VEX</span>
        </div>

        <h2 class="welcome-title">¡Bienvenido a Innovex!</h2>
        <p class="welcome-subtitle">Inicia sesión con tu cuenta y comienza la aventura</p>

        <form @submit.prevent="handleLogin" class="login-form" novalidate>
          <div class="field-group">
            <label class="field-label" for="login-user">Usuario</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5" />
                </svg>
              </span>
              <input
                id="login-user"
                v-model="username"
                type="text"
                class="field-input"
                autocomplete="username"
                placeholder="Introduce tu usuario o correo"
              />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label" for="login-pass">Contraseña</label>
            <div class="input-wrap">
              <span class="input-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="4" y="10.5" width="16" height="10" rx="2.5" />
                  <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
                </svg>
              </span>
              <input
                id="login-pass"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="field-input field-input--pass"
                autocomplete="current-password"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
                aria-label="Mostrar/Ocultar contraseña"
              >
                <svg v-if="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              </button>
            </div>
          </div>

          <div class="options-row">
            <label class="remember-label">
              <span
                class="custom-check"
                :class="{ checked: rememberMe }"
                @click="rememberMe = !rememberMe"
              ></span>
              Recuérdame
            </label>
            <router-link to="/forgot-password" class="forgot-link">¿Olvidaste tu contraseña?</router-link>
          </div>

          <div v-if="recaptchaSiteKey" class="recaptcha-box">
            <div ref="recaptchaContainer" class="recaptcha-widget"></div>
          </div>

          <div v-if="errorMsg" class="error-banner" role="alert">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="9.5" />
              <path d="M12 7.5v5.5M12 16.5h.01" />
            </svg>
            <span>{{ errorMsg }}</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="spinner" aria-hidden="true"></span>
            <span>{{ loading ? "Ingresando..." : "Iniciar Sesión" }}</span>
          </button>
        </form>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { API_BASE_URL } from "@/app/apiClient";
import { hydrateAuthenticatedSession, setWorkspaceContext, setWorkspaceLogo } from "@/composables/useAuthenticatedSession";

import logoInnovexUrl from "../../assets/logo-innovex.png";

const logoInnovex = logoInnovexUrl;

interface GoogleRecaptcha {
  ready(callback: () => void): void;
  render(
    container: HTMLElement,
    parameters: {
      sitekey: string;
      theme: "dark";
      size: "normal";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ): number;
  reset(widgetId?: number): void;
}

declare global {
  interface Window {
    grecaptcha?: GoogleRecaptcha;
    __innovexRecaptchaScriptPromise?: Promise<GoogleRecaptcha>;
  }
}

const recaptchaScriptUrl = "https://www.google.com/recaptcha/api.js?render=explicit";

const loadRecaptchaScript = (): Promise<GoogleRecaptcha> => {
  if (window.grecaptcha) {
    return Promise.resolve(window.grecaptcha);
  }

  if (window.__innovexRecaptchaScriptPromise) {
    return window.__innovexRecaptchaScriptPromise;
  }

  const scriptPromise = new Promise<GoogleRecaptcha>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${recaptchaScriptUrl}"]`,
    );
    const script = existingScript ?? document.createElement("script");

    script.addEventListener("load", () => {
      if (window.grecaptcha) {
        resolve(window.grecaptcha);
      } else {
        reject(new Error("reCAPTCHA no está disponible."));
      }
    }, { once: true });
    script.addEventListener("error", () => reject(new Error("No se pudo cargar reCAPTCHA.")), {
      once: true,
    });

    if (!existingScript) {
      script.src = recaptchaScriptUrl;
      script.async = true;
      script.defer = true;
      document.head.append(script);
    }
  });

  window.__innovexRecaptchaScriptPromise = scriptPromise;
  void scriptPromise.catch(() => {
    window.__innovexRecaptchaScriptPromise = undefined;
  });

  return scriptPromise;
};

const router = useRouter();
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const loading = ref(false);
const errorMsg = ref("");
const recaptchaSiteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY?.trim() ?? "";
const recaptchaContainer = ref<HTMLDivElement | null>(null);
const recaptchaToken = ref("");
const recaptchaApi = ref<GoogleRecaptcha | null>(null);
const recaptchaWidgetId = ref<number | null>(null);

const resetRecaptcha = () => {
  recaptchaToken.value = "";
  if (recaptchaApi.value && recaptchaWidgetId.value !== null) {
    recaptchaApi.value.reset(recaptchaWidgetId.value);
  }
};

onMounted(() => {
  if (!recaptchaSiteKey || !recaptchaContainer.value) {
    return;
  }

  void loadRecaptchaScript()
    .then((api) => {
      recaptchaApi.value = api;
      api.ready(() => {
        if (!recaptchaContainer.value) {
          return;
        }

        try {
          recaptchaWidgetId.value = api.render(recaptchaContainer.value, {
            sitekey: recaptchaSiteKey,
            theme: "dark",
            size: "normal",
            callback: (token) => {
              recaptchaToken.value = token;
            },
            "expired-callback": () => {
              recaptchaToken.value = "";
            },
            "error-callback": () => {
              recaptchaToken.value = "";
            },
          });
        } catch {
          errorMsg.value = "No se pudo cargar la verificación. Inténtalo de nuevo.";
        }
      });
    })
    .catch(() => {
      errorMsg.value = "No se pudo cargar la verificación. Inténtalo de nuevo.";
    });
});

onBeforeUnmount(() => {
  resetRecaptcha();
});

const handleLogin = async () => {
  errorMsg.value = "";

  if (!username.value || !password.value) {
    errorMsg.value = "Por favor completa todos los campos.";
    return;
  }
  if (recaptchaSiteKey && !recaptchaToken.value) {
    errorMsg.value = "Por favor confirma que no eres un robot.";
    return;
  }

  loading.value = true;
  try {
    const fingerprint = btoa(
      navigator.userAgent + screen.width + screen.height + navigator.language,
    ).substring(0, 64);

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        email: username.value,
        password: password.value,
        device_name: "vue_web_client",
        fingerprint: fingerprint,
        plataforma: "web",
        ...(recaptchaSiteKey ? { captcha_token: recaptchaToken.value } : {}),
      }),
    });

    const data = await response.json();
    console.log("Respuesta login:", data);

    if (!response.ok) {
      const captchaError = response.status === 422
        ? data?.errors?.captcha_token
        : undefined;
      const captchaErrorMessage = Array.isArray(captchaError)
        ? captchaError.find((message: unknown) => typeof message === "string")
        : typeof captchaError === "string"
          ? captchaError
          : undefined;
      if (captchaErrorMessage) {
        throw new Error(captchaErrorMessage);
      }
      throw new Error(data.message || "Usuario o contraseña incorrectos.");
    }

    localStorage.setItem("token", data.data.token);
    localStorage.setItem("user_nombre", data.data.user.nombre);
    localStorage.setItem("user_apellido", data.data.user.apellido);
    localStorage.setItem("user_email", username.value.trim());
    localStorage.setItem("user_uuid", data.data.user.uuid);
    localStorage.setItem(
      "user_es_superadmin",
      String(Boolean(data.data.user.es_superadmin)),
    );

    const panelWorkspace = Array.isArray(data.data.panel_workspaces)
      ? data.data.panel_workspaces[0]
      : null;
    const isSuperadmin = Boolean(data.data.user.es_superadmin);

    if (data.data.lobby && data.data.lobby.length > 0) {
      setWorkspaceContext(String(data.data.lobby[0].empresa_id), String(panelWorkspace?.rol ?? "") as "administrador_empresa" | "administrador_financiero" | "");
      setWorkspaceLogo(typeof panelWorkspace?.logo === "string" ? panelWorkspace.logo : null);
    } else if (panelWorkspace?.empresa_id) {
      setWorkspaceContext(String(panelWorkspace.empresa_id), String(panelWorkspace.rol ?? "") as "administrador_empresa" | "administrador_financiero" | "");
      setWorkspaceLogo(typeof panelWorkspace.logo === "string" ? panelWorkspace.logo : null);
    } else if (isSuperadmin) {
      setWorkspaceContext(null);
      setWorkspaceLogo(null);
    } else {
      setWorkspaceContext(null);
      setWorkspaceLogo(null);
      throw new Error("Tu cuenta no tiene acceso a ningun workspace del panel web.");
    }

    hydrateAuthenticatedSession();
    router.push({ name: isSuperadmin && !localStorage.getItem("empresa_id") ? "usuarios" : "dashboard" });
  } catch (error: any) {
    resetRecaptcha();
    errorMsg.value = error.message || "Error al conectar con el servidor.";
  } finally {
    loading.value = false;
  }
};
</script>

<style>
html,
body,
#app {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
}
</style>

<style scoped>
.login-page {
  --bg: #060913;
  --surface: #0b1120;
  --border: rgba(255, 255, 255, 0.1);
  --text: #f1f5f9;
  --muted: rgba(255, 255, 255, 0.6);
  --brand: #3eb5f5;
  --brand-dark: #1768b8;
  --danger: #ff6b6b;

  position: fixed;
  inset: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
  background: var(--bg);
  color: var(--text);
  font-family: "Geist", "Segoe UI", system-ui, Arial, sans-serif;
  overflow: auto;
}

/* ── Panel de marca ── */
.brand-panel {
  position: relative;
  display: flex;
  align-items: center;
  padding: 64px;
  background: linear-gradient(155deg, #0a1a33 0%, #071226 55%, #060913 100%);
  border-right: 1px solid var(--border);
  overflow: hidden;
}

.brand-glow {
  position: absolute;
  top: -20%;
  right: -25%;
  width: 70%;
  aspect-ratio: 1;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(62, 181, 245, 0.28) 0%, rgba(62, 181, 245, 0) 65%);
  filter: blur(40px);
  pointer-events: none;
}

.brand-content {
  position: relative;
  max-width: 460px;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 48px;
}

.brand-logo-img {
  width: 56px;
  height: 56px;
  object-fit: contain;
}

.brand-name {
  color: var(--brand);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: 4px;
  white-space: nowrap;
}

.brand-name-hl {
  color: #fff;
}

.brand-title {
  margin: 0 0 14px;
  font-size: 34px;
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.brand-subtitle {
  margin: 0 0 36px;
  color: var(--muted);
  font-size: 15px;
  line-height: 1.6;
}

.benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 14px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 14px;
}

.benefit-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 10px;
  color: var(--brand);
  background: rgba(62, 181, 245, 0.1);
  border: 1px solid rgba(62, 181, 245, 0.2);
}

/* ── Panel del formulario ── */
.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  background: var(--surface);
}

.form-wrap {
  width: 100%;
  max-width: 400px;
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

.mobile-logo {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 28px;
}

.mobile-logo-img {
  width: 52px;
  height: 52px;
  object-fit: contain;
}

.welcome-title {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  margin: 0 0 28px;
  color: var(--muted);
  font-size: 14px;
  line-height: 1.5;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
}

.input-wrap {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  color: rgba(255, 255, 255, 0.35);
  pointer-events: none;
  transition: color 0.2s ease;
}

.input-wrap:focus-within .input-icon {
  color: var(--brand);
}

.field-input {
  width: 100%;
  height: 46px;
  box-sizing: border-box;
  padding: 0 14px 0 42px;
  font-size: 14px;
  color: #fff;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
}

.field-input--pass {
  padding-right: 46px;
}

.field-input::placeholder {
  color: rgba(255, 255, 255, 0.28);
}

.field-input:hover {
  border-color: rgba(255, 255, 255, 0.2);
}

.field-input:focus {
  background: rgba(255, 255, 255, 0.06);
  border-color: var(--brand);
  box-shadow: 0 0 0 3px rgba(62, 181, 245, 0.25);
}

.toggle-password {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  padding: 0;
  background: none;
  border: none;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.45);
  cursor: pointer;
  transition: color 0.2s ease, background 0.2s ease;
}

.toggle-password:hover {
  color: var(--brand);
  background: rgba(255, 255, 255, 0.05);
}

.toggle-password:focus-visible,
.submit-btn:focus-visible,
.forgot-link:focus-visible {
  outline: 2px solid var(--brand);
  outline-offset: 2px;
}

/* ── Opciones ── */
.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--muted);
  font-size: 13px;
  cursor: pointer;
  user-select: none;
}

.custom-check {
  position: relative;
  display: inline-block;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.25);
  transition: all 0.2s ease;
}

.remember-label:hover .custom-check {
  border-color: var(--brand);
}

.custom-check.checked {
  background: var(--brand);
  border-color: var(--brand);
}

.custom-check.checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: 2px solid #fff;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.forgot-link {
  color: var(--brand);
  font-size: 13px;
  text-decoration: none;
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.forgot-link:hover {
  opacity: 1;
  text-decoration: underline;
}

/* ── Captcha ── */
.recaptcha-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.recaptcha-widget {
  display: flex;
  justify-content: center;
  width: 304px;
  max-width: 100%;
}

@media (max-width: 352px) {
  .recaptcha-widget {
    transform: scale(0.9);
    transform-origin: top center;
    margin-bottom: -8px;
  }
}

@media (max-width: 320px) {
  .recaptcha-widget {
    transform: scale(0.75);
    margin-bottom: -20px;
  }
}

@media (max-width: 280px) {
  .recaptcha-widget {
    transform: scale(0.65);
    margin-bottom: -28px;
  }
}

/* ── Error ── */
.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 11px 14px;
  color: #ffb4b4;
  font-size: 13px;
  line-height: 1.4;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.3);
  border-radius: 10px;
  animation: shake 0.4s ease-in-out;
}

.error-banner svg {
  flex-shrink: 0;
  margin-top: 1px;
  color: var(--danger);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* ── Botón ── */
.submit-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  height: 48px;
  margin-top: 4px;
  color: #fff;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.3px;
  background: linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(23, 104, 184, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.submit-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 26px rgba(62, 181, 245, 0.45);
}

.submit-btn:not(:disabled):active {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .login-page {
    grid-template-columns: 1fr;
  }

  .brand-panel {
    display: none;
  }

  .mobile-logo {
    display: flex;
  }

  .form-panel {
    background: radial-gradient(circle at 50% 0%, #0b2a4a 0%, var(--bg) 60%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .form-wrap,
  .error-banner,
  .spinner {
    animation: none;
  }

  .submit-btn,
  .field-input {
    transition: none;
  }
}
</style>