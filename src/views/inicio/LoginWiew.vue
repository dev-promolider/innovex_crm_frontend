<template>
  <div class="login-bg">
    <div class="login-card">

      <!-- Logo -->
      <div class="logo-section">
        <svg viewBox="0 0 52 52" width="46" height="46" xmlns="http://www.w3.org/2000/svg">
          <circle cx="26" cy="26" r="25" fill="#1c1c2e" stroke="#4a9fd4" stroke-width="2"/>
          <polyline points="13,36 26,14 39,36" fill="none" stroke="white" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round"/>
          <polyline points="19,29 26,17 33,29" fill="white" opacity="0.5"/>
        </svg>
        <span class="logo-text">INNO<strong>VEX</strong></span>
      </div>

      <h2 class="welcome-title">¡Bienvenido a Promolider!</h2>
      <p class="welcome-subtitle">Inicia sesión con tu cuenta y comience la aventura</p>

      <form @submit.prevent="handleLogin" class="login-form">

        <!-- Usuario -->
        <div class="field-group">
          <label class="field-label">Usuario:</label>
          <input v-model="username" type="text" class="field-input" autocomplete="username" />
        </div>

        <!-- Contraseña -->
        <div class="field-group">
          <label class="field-label">Contraseña:</label>
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click.prevent.stop="showPassword = !showPassword"
              tabindex="-1"
            >
              <svg v-if="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <path d="M14.12 14.12a3 3 0 0 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Recuérdame + Olvidé contraseña -->
        <div class="options-row">
          <label class="remember-label">
            <input type="checkbox" v-model="rememberMe" class="remember-check" />
            Recuérdame
          </label>
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <!-- reCAPTCHA -->
        <div class="recaptcha-box">
          <div class="recaptcha-left">
            <div class="recaptcha-checkbox-wrapper" @click="captchaChecked = !captchaChecked">
              <div class="recaptcha-check-box" :class="{ checked: captchaChecked }">
                <svg v-if="captchaChecked" viewBox="0 0 14 14" width="12" height="12">
                  <polyline points="2,7 6,11 12,3" fill="none" stroke="white" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
            <span class="recaptcha-text">No soy un robot</span>
          </div>
          <div class="recaptcha-right">
            <!-- Logo reCAPTCHA: flecha azul grande + flecha gris pequeña -->
            <svg viewBox="0 0 90 90" width="50" height="50" xmlns="http://www.w3.org/2000/svg">
              <!-- Flecha azul grande (arco derecho, horario) -->
              <path
                d="M45 7 A38 38 0 1 1 11 64"
                fill="none"
                stroke="#4A7FC1"
                stroke-width="12"
                stroke-linecap="round"
              />
              <!-- Punta flecha azul -->
              <polygon points="1,54 14,75 26,58" fill="#4A7FC1"/>
              <!-- Flecha gris pequeña (arco izquierdo, cierra ciclo) -->
              <path
                d="M11 64 A38 38 0 0 1 45 7"
                fill="none"
                stroke="#C0C0C0"
                stroke-width="9"
                stroke-linecap="round"
              />
              <!-- Punta flecha gris -->
              <polygon points="45,0 57,15 35,17" fill="#C0C0C0"/>
            </svg>
            <span class="recaptcha-name">reCAPTCHA</span>
            <span class="recaptcha-sub">Privacidad - Condiciones</span>
          </div>
        </div>

        <!-- Botón submit -->
        <button type="submit" class="submit-btn">Iniciar Sesión</button>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const captchaChecked = ref(false)

const handleLogin = () => {
  if (!captchaChecked.value) {
    alert('Por favor, confirma que no eres un robot.')
    return
  }
  console.log('Login:', { username: username.value, rememberMe: rememberMe.value })
}
</script>

<style>
/* Reset global para que no interfiera App.vue ni el body */
html, body, #app {
  margin: 0 !important;
  padding: 0 !important;
  min-height: 100vh !important;
  background: transparent !important;
}
</style>

<style scoped>
/* ── FONDO AZUL TEXTURIZADO ─────────────────── */
.login-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Segoe UI', Arial, sans-serif;
  background:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.20'/%3E%3C/svg%3E"),
    radial-gradient(ellipse 75% 55% at 18% 18%, rgba(190,230,255,0.55) 0%, transparent 65%),
    radial-gradient(ellipse 65% 65% at 82% 82%, rgba(8,55,120,0.65) 0%, transparent 65%),
    linear-gradient(160deg, #3098d8 0%, #1568b0 55%, #0d4a8a 100%);
  background-size: 300px 300px, cover, cover, cover;
  background-blend-mode: overlay, screen, multiply, normal;
}

/* ── TARJETA NEGRA ──────────────────────────── */
.login-card {
  background: #0d0d0d;
  border-radius: 14px;
  padding: 32px 34px 36px;
  width: 100%;
  max-width: 330px;
  box-shadow: 0 28px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.05);
}

/* ── LOGO ───────────────────────────────────── */
.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 16px;
}
.logo-text {
  font-size: 23px;
  color: #fff;
  letter-spacing: 3px;
  font-weight: 300;
}
.logo-text strong {
  font-weight: 900;
  color: #5bbcf0;
}

/* ── TÍTULOS ────────────────────────────────── */
.welcome-title {
  color: #3aabf0;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 5px;
}
.welcome-subtitle {
  color: #888;
  font-size: 11px;
  text-align: center;
  margin: 0 0 18px;
}

/* ── FORMULARIO ─────────────────────────────── */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.field-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.field-label {
  color: #3aabf0;
  font-size: 12px;
  font-weight: 600;
}
.field-input {
  background: #fff;
  border: none;
  border-radius: 3px;
  padding: 7px 10px;
  font-size: 13px;
  color: #111;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  height: 32px;
}
.field-input:focus {
  box-shadow: 0 0 0 2px #3aabf0;
}

/* ── CONTRASEÑA ─────────────────────────────── */
.password-wrapper {
  position: relative;
}
.password-wrapper .field-input {
  padding-right: 36px;
}
.toggle-password {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}
.toggle-password:focus { outline: none; }

/* ── OPCIONES ───────────────────────────────── */
.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.remember-label {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ccc;
  font-size: 11px;
  cursor: pointer;
}
.remember-check {
  width: 13px;
  height: 13px;
  accent-color: #3aabf0;
  cursor: pointer;
}
.forgot-link {
  color: #888;
  font-size: 11px;
  text-decoration: none;
}
.forgot-link:hover { color: #3aabf0; }

/* ── reCAPTCHA ──────────────────────────────── */
.recaptcha-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #f9f9f9;
  border-radius: 4px;
  padding: 10px 12px;
  border: 1px solid #d3d3d3;
  min-height: 64px;
}
.recaptcha-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.recaptcha-checkbox-wrapper {
  cursor: pointer;
  display: flex;
  align-items: center;
}
.recaptcha-check-box {
  width: 20px;
  height: 20px;
  border: 2px solid #c1c1c1;
  border-radius: 2px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, border-color 0.15s;
  flex-shrink: 0;
}
.recaptcha-check-box.checked {
  background: #4A90D9;
  border-color: #4A90D9;
}
.recaptcha-text {
  font-size: 13px;
  color: #333;
  user-select: none;
}
.recaptcha-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
}
.recaptcha-name {
  font-size: 10px;
  font-weight: 700;
  color: #555;
  letter-spacing: 0.2px;
}
.recaptcha-sub {
  font-size: 7px;
  color: #999;
  white-space: nowrap;
}

/* ── BOTÓN ──────────────────────────────────── */
.submit-btn {
  background: linear-gradient(180deg, #45b8f8 0%, #2090d8 100%);
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  width: 100%;
  margin-top: 2px;
  transition: opacity 0.2s, transform 0.1s;
}
.submit-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}
.submit-btn:active { transform: translateY(0); }
</style>