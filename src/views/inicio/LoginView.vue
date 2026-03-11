<template>
  <div class="login-bg">
    <div class="login-card">

      <div class="logo-section">
        <img :src="logoAzul" alt="Logo Azul" class="logo-img" />
        <div class="logo-text-wrapper">
          <hr class="logo-divider" />
          <p class="logo-text"><span class="logo-highlight">INNO</span>VEX</p>
        </div>
      </div>

      <h2 class="welcome-title">¡Bienvenido a Promolider!</h2>
      <p class="welcome-subtitle">Inicia sesión con tu cuenta y comienza la aventura</p>

      <form @submit.prevent="handleLogin" class="login-form">

        <div class="field-group">
          <label class="field-label">Usuario:</label>
          <input v-model="username" type="text" class="field-input" autocomplete="username" />
        </div>

        <div class="field-group">
          <label class="field-label">Contraseña:</label>
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              autocomplete="current-password"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <svg v-if="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#777" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#777" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <div class="options-row">
          <label class="remember-label">
            <span class="custom-check" :class="{ checked: rememberMe }" @click="rememberMe = !rememberMe"></span>
            Recuérdame
          </label>
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- reCAPTCHA -->
        <div class="recaptcha-box">
          <div class="recaptcha-left">
            <span class="recaptcha-custom-check" :class="{ checked: captchaChecked }" @click="captchaChecked = !captchaChecked"></span>
            <span class="recaptcha-text">No soy un robot</span>
          </div>
          <div class="recaptcha-right">
            <img
              :src="recaptchaLogo"
              alt="reCAPTCHA"
              style="width: 50px; height: 50px; object-fit: contain;"
            />
            <div class="recaptcha-brand">
              <span class="recaptcha-sub">Privacidad · Condiciones</span>
            </div>
          </div>
        </div>

        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="!loading">Iniciar Sesión</span>
          <span v-else>Cargando...</span>
        </button>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const recaptchaLogo = new URL('../../assets/RecaptchaLogo.png', import.meta.url).href
const logoAzul      = new URL('../../assets/logo-azul.png',     import.meta.url).href

const router         = useRouter()
const username       = ref('')
const password       = ref('')
const showPassword   = ref(false)
const rememberMe     = ref(false)
const captchaChecked = ref(false)
const loading        = ref(false)
const errorMsg       = ref('')

const handleLogin = async () => {
  errorMsg.value = ''

  if (!username.value || !password.value) {
    errorMsg.value = 'Por favor completa todos los campos.'
    return
  }
  if (!captchaChecked.value) {
    errorMsg.value = 'Por favor confirma que no eres un robot.'
    return
  }

  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 800))
    localStorage.setItem('token', 'token-simulado')
    router.push({ name: 'dashboard' })
  } catch (error) {
    errorMsg.value = 'Usuario o contraseña incorrectos.'
  } finally {
    loading.value = false
  }
}
</script>

<style>
html, body, #app {
  margin: 0 !important;
  padding: 0 !important;
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
}
</style>

<style scoped>
.login-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Arial', 'Helvetica Neue', sans-serif;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='turbulence' baseFrequency='0.62' numOctaves='5' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='0.30'/%3E%3C/svg%3E"),
    radial-gradient(ellipse 85% 65% at 20% 20%, rgba(120, 195, 250, 0.65) 0%, transparent 58%),
    radial-gradient(ellipse 75% 75% at 80% 80%, rgba(8, 55, 125, 0.70) 0%, transparent 58%),
    linear-gradient(150deg, #2e96d8 0%, #1768b8 45%, #0b4a98 100%);
  background-size: 400px 400px, cover, cover, cover;
  background-blend-mode: overlay, screen, multiply, normal;
}

.login-card {
  background: #0d0d0d;
  border-radius: 18px;
  padding: 28px 32px 32px;
  width: 100%;
  max-width: 340px;
  box-shadow:
    0 32px 100px rgba(0, 0, 0, 0.85),
    0 0 0 1px rgba(255, 255, 255, 0.05);
  position: relative;
  z-index: 1;
}

/* ── Logo section: logo grande, texto centrado verticalmente ── */
.logo-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;   /* centra verticalmente logo y texto */
  margin-bottom: 18px;
  gap: 8px;
}

.logo-img {
  width: 110px;          /* logo grande independiente */
  height: 110px;
  object-fit: contain;
  flex-shrink: 0;
}

/* El texto se centra solo en la altura del logo */
.logo-text-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;  /* centra verticalmente dentro del espacio del logo */
  gap: 6px;
  height: 110px;            /* misma altura que el logo para centrar perfectamente */
}

.logo-divider {
  border: none;
  border-top: 1px solid #555555;
  margin: 0;
  width: 100%;
}

.logo-text {
  color: #3eb5f5;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 3px;
  margin: 0;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

.logo-highlight {
  color: #ffffff;
}

/* ── Títulos ── */
.welcome-title {
  color: #3eb5f5;
  font-size: 16px;
  font-weight: 700;
  text-align: left;
  margin: 0 0 6px;
}

.welcome-subtitle {
  color: #999;
  font-size: 12px;
  text-align: left;
  margin: 0 0 20px;
  font-weight: 400;
}

/* ── Formulario ── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.field-label {
  color: #3eb5f5;
  font-size: 13px;
  font-weight: 600;
  text-align: left;
}

.field-input {
  background: #ffffff;
  border: none;
  border-radius: 4px;
  padding: 10px 12px;
  font-size: 14px;
  color: #111;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  height: 38px;
}

.field-input:focus {
  box-shadow: 0 0 0 2px #3eb5f5;
}

/* ── Password ── */
.password-wrapper {
  position: relative;
  width: 100%;
}

.password-wrapper .field-input {
  padding-right: 40px;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  outline: none;
  box-shadow: none;
  -webkit-tap-highlight-color: transparent;
}

.toggle-password:focus,
.toggle-password:focus-visible,
.toggle-password:active {
  outline: none !important;
  box-shadow: none !important;
  border: none !important;
}

/* ── Opciones ── */
.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #ccc;
  font-size: 12px;
  cursor: pointer;
  user-select: none;
}

.custom-check {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #666;
  border-radius: 2px;
  background: transparent;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s, background 0.2s;
}

.custom-check.checked {
  background: #3eb5f5;
  border-color: #3eb5f5;
}

.custom-check.checked::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0px;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.forgot-link {
  color: #888;
  font-size: 12px;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #3eb5f5;
}

/* ── reCAPTCHA ── */
.recaptcha-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9f9f9;
  border-radius: 4px;
  padding: 12px 14px;
  border: 1px solid #d0d0d0;
  min-height: 56px;
}

.recaptcha-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.recaptcha-custom-check {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 2px solid #999;
  border-radius: 2px;
  background: white;
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  transition: border-color 0.2s, background 0.2s;
}

.recaptcha-custom-check.checked {
  background: #3eb5f5;
  border-color: #3eb5f5;
}

.recaptcha-custom-check.checked::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 1px;
  width: 7px;
  height: 12px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.recaptcha-text {
  font-size: 14px;
  color: #333;
}

.recaptcha-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.recaptcha-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recaptcha-sub {
  font-size: 8px;
  color: #aaa;
  white-space: nowrap;
}

/* ── Error ── */
.error-msg {
  color: #ff5c5c;
  font-size: 12px;
  text-align: center;
  margin: 0;
}

/* ── Botón ── */
.submit-btn {
  background: linear-gradient(180deg, #4dc0fc 0%, #2296e0 100%);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 12px;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.4px;
  cursor: pointer;
  width: 100%;
  margin-top: 2px;
  transition: opacity 0.2s, transform 0.1s;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.submit-btn:not(:disabled):hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.submit-btn:not(:disabled):active {
  transform: translateY(0);
}
</style>