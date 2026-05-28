<template>
  <div class="login-bg">
    <!-- Glowing background elements -->
    <div class="glowing-orb orb-1"></div>
    <div class="glowing-orb orb-2"></div>
    <div class="glowing-orb orb-3"></div>

    <div class="login-card">
      <div class="logo-section">
        <img :src="logoInnovex" alt="Logo Innovex" class="logo-img" />
        <div class="logo-text-wrapper">
          <hr class="logo-divider" />
          <p class="logo-text"><span class="logo-highlight">INNO</span>VEX</p>
        </div>
      </div>

      <h2 class="welcome-title">¡Bienvenido a Innovex!</h2>
      <p class="welcome-subtitle">
        Inicia sesión con tu cuenta y comienza la aventura
      </p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="field-group">
          <label class="field-label">Usuario</label>
          <input
            v-model="username"
            type="text"
            class="field-input"
            autocomplete="username"
            placeholder="Introduce tu usuario o correo"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Contraseña</label>
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="field-input"
              autocomplete="current-password"
              placeholder="••••••••"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              aria-label="Mostrar/Ocultar contraseña"
            >
              <svg
                v-if="!showPassword"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                />
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
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
        </div>

        <div class="recaptcha-box">
          <div class="recaptcha-left">
            <span
              class="recaptcha-custom-check"
              :class="{ checked: captchaChecked }"
              @click="captchaChecked = !captchaChecked"
            ></span>
            <span class="recaptcha-text" @click="captchaChecked = !captchaChecked">No soy un robot</span>
          </div>
          <div class="recaptcha-right">
            <img
              :src="recaptchaLogo"
              alt="reCAPTCHA"
              class="recaptcha-logo-img"
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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { hydrateAuthenticatedSession } from "@/composables/useAuthenticatedSession";

import recaptchaLogoUrl from "../../assets/RecaptchaLogo.png";
import logoInnovexUrl from "../../assets/logo-innovex.png";

const recaptchaLogo = recaptchaLogoUrl;
const logoInnovex = logoInnovexUrl;

const router = useRouter();
const username = ref("");
const password = ref("");
const showPassword = ref(false);
const rememberMe = ref(false);
const captchaChecked = ref(false);
const loading = ref(false);
const errorMsg = ref("");

const handleLogin = async () => {
  errorMsg.value = "";

  if (!username.value || !password.value) {
    errorMsg.value = "Por favor completa todos los campos.";
    return;
  }
  if (!captchaChecked.value) {
    errorMsg.value = "Por favor confirma que no eres un robot.";
    return;
  }

  loading.value = true;
  try {
    const fingerprint = btoa(
      navigator.userAgent + screen.width + screen.height + navigator.language,
    ).substring(0, 64);

    const response = await fetch("http://localhost:8000/api/auth/login", {
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
      }),
    });

    const data = await response.json();
    console.log("Respuesta login:", data);

    if (!response.ok) {
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
      localStorage.setItem("empresa_id", String(data.data.lobby[0].empresa_id));
      localStorage.setItem("workspace_role", String(panelWorkspace?.rol ?? ""));
    } else if (panelWorkspace?.empresa_id) {
      localStorage.setItem("empresa_id", String(panelWorkspace.empresa_id));
      localStorage.setItem("workspace_role", String(panelWorkspace.rol ?? ""));
    } else if (isSuperadmin) {
      localStorage.removeItem("empresa_id");
      localStorage.removeItem("workspace_role");
    } else {
      localStorage.removeItem("empresa_id");
      localStorage.removeItem("workspace_role");
      throw new Error("Tu cuenta no tiene acceso a ningun workspace del panel web.");
    }

    hydrateAuthenticatedSession();
    router.push({ name: isSuperadmin && !localStorage.getItem("empresa_id") ? "usuarios" : "dashboard" });
  } catch (error: any) {
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
.login-bg {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: "Geist", "Segoe UI", system-ui, Arial, sans-serif;
  background: #060913;
  overflow: hidden;
}

/* Glowing Mesh Orbs */
.glowing-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.45;
  pointer-events: none;
  z-index: 0;
}

.orb-1 {
  top: -10%;
  left: -10%;
  width: 50vw;
  height: 50vw;
  background: radial-gradient(circle, rgba(23, 104, 184, 0.8) 0%, rgba(23, 104, 184, 0) 70%);
  animation: float-1 25s infinite alternate ease-in-out;
}

.orb-2 {
  bottom: -15%;
  right: -10%;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(circle, rgba(46, 150, 216, 0.7) 0%, rgba(46, 150, 216, 0) 70%);
  animation: float-2 30s infinite alternate ease-in-out;
}

.orb-3 {
  top: 40%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 35vw;
  height: 35vw;
  background: radial-gradient(circle, rgba(11, 74, 152, 0.6) 0%, rgba(11, 74, 152, 0) 70%);
  opacity: 0.35;
  animation: float-3 20s infinite alternate ease-in-out;
}

@keyframes float-1 {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(10%, 8%) scale(1.15); }
}

@keyframes float-2 {
  0% { transform: translate(0, 0) scale(1.1); }
  100% { transform: translate(-8%, -10%) scale(0.9); }
}

@keyframes float-3 {
  0% { transform: translate(-50%, -50%) translate(-5%, 5%); }
  100% { transform: translate(-50%, -50%) translate(5%, -5%); }
}

/* Glassmorphism Card */
.login-card {
  background: rgba(10, 14, 26, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 36px 40px;
  width: 100%;
  max-width: 400px;
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.6),
    inset 0 1px 1px rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Logo Section */
.logo-section {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  gap: 12px;
}

.logo-img {
  width: 90px;
  height: 90px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 0 15px rgba(62, 181, 245, 0.25));
  animation: pulseLogo 4s infinite ease-in-out;
}

@keyframes pulseLogo {
  0%, 100% { filter: drop-shadow(0 0 15px rgba(62, 181, 245, 0.2)); }
  50% { filter: drop-shadow(0 0 25px rgba(62, 181, 245, 0.45)); }
}

.logo-text-wrapper {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  gap: 8px;
  height: 90px;
}

.logo-divider {
  border: none;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15) 50%, transparent);
  margin: 0;
  width: 100%;
}

.logo-text {
  color: #3eb5f5;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: 4px;
  margin: 0;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;
}

.logo-highlight {
  color: #ffffff;
}

/* Title & Subtitle */
.welcome-title {
  color: #3eb5f5;
  font-size: 18px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px;
  letter-spacing: 0.3px;
}

.welcome-subtitle {
  color: rgba(255, 255, 255, 0.6);
  font-size: 13px;
  text-align: center;
  margin: 0 0 28px;
  font-weight: 400;
  line-height: 1.4;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  color: rgba(255, 255, 255, 0.75);
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.3px;
  text-align: left;
}

.field-input {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 14px;
  color: #ffffff;
  outline: none;
  width: 100%;
  box-sizing: border-box;
  height: 44px;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.field-input::placeholder {
  color: rgba(255, 255, 255, 0.25);
}

.field-input:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.2);
}

.field-input:focus {
  background: rgba(255, 255, 255, 0.07);
  border-color: #3eb5f5;
  box-shadow:
    0 0 16px rgba(62, 181, 245, 0.25),
    inset 0 1px 1px rgba(255, 255, 255, 0.05);
}

/* Password eye positioning */
.password-wrapper {
  position: relative;
  width: 100%;
}

.password-wrapper .field-input {
  padding-right: 44px;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: none;
  color: rgba(255, 255, 255, 0.4);
  transition: color 0.2s ease, transform 0.2s ease;
  border-radius: 4px;
}

.toggle-password:hover {
  color: #3eb5f5;
  transform: translateY(-50%) scale(1.05);
}

/* Remember me & Forgot Link */
.options-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.65);
  font-size: 13px;
  cursor: pointer;
  user-select: none;
  transition: color 0.2s ease;
}

.remember-label:hover {
  color: rgba(255, 255, 255, 0.9);
}

.remember-label:hover .custom-check {
  border-color: #3eb5f5;
}

.custom-check {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  transition: all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.custom-check.checked {
  background: #3eb5f5;
  border-color: #3eb5f5;
  box-shadow: 0 0 10px rgba(62, 181, 245, 0.4);
}

.custom-check.checked::after {
  content: "";
  position: absolute;
  left: 5px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: 2px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.forgot-link {
  color: rgba(255, 255, 255, 0.5);
  font-size: 13px;
  text-decoration: none;
  transition: color 0.2s ease, text-shadow 0.2s ease;
}

.forgot-link:hover {
  color: #3eb5f5;
  text-shadow: 0 0 8px rgba(62, 181, 245, 0.3);
}

/* Premium Dark ReCAPTCHA Box */
.recaptcha-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 10px 16px;
  min-height: 60px;
  box-sizing: border-box;
  transition: all 0.3s ease;
}

.recaptcha-box:hover {
  border-color: rgba(62, 181, 245, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.recaptcha-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.recaptcha-text {
  font-size: 13.5px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 400;
  user-select: none;
  cursor: pointer;
  transition: color 0.2s ease;
}

.recaptcha-text:hover {
  color: #ffffff;
}

.recaptcha-custom-check {
  display: inline-block;
  width: 22px;
  height: 22px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.3);
  flex-shrink: 0;
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
}

.recaptcha-custom-check:hover {
  border-color: #3eb5f5;
  box-shadow: 0 0 8px rgba(62, 181, 245, 0.35);
}

.recaptcha-custom-check.checked {
  background: #00e676;
  border-color: #00e676;
  box-shadow: 0 0 12px rgba(0, 230, 118, 0.45);
}

.recaptcha-custom-check.checked::after {
  content: "";
  position: absolute;
  left: 6px;
  top: 2px;
  width: 6px;
  height: 11px;
  border: 2.5px solid white;
  border-top: none;
  border-left: none;
  transform: rotate(45deg);
}

.recaptcha-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.recaptcha-logo-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
  opacity: 0.85;
}

.recaptcha-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.recaptcha-sub {
  font-size: 8px;
  color: rgba(255, 255, 255, 0.35);
  white-space: nowrap;
}

/* Error Message */
.error-msg {
  color: #ff5c5c;
  font-size: 13px;
  text-align: center;
  margin: 0;
  animation: shake 0.4s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

/* Submit Button */
.submit-btn {
  background: linear-gradient(135deg, #3eb5f5 0%, #1768b8 100%);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  width: 100%;
  margin-top: 6px;
  box-shadow: 0 4px 20px rgba(23, 104, 184, 0.35);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  transition: 0.5s;
}

.submit-btn:not(:disabled):hover::before {
  left: 100%;
}

.submit-btn:not(:disabled):hover {
  box-shadow: 0 6px 24px rgba(62, 181, 245, 0.5);
  transform: translateY(-2px);
}

.submit-btn:not(:disabled):active {
  transform: translateY(0);
  box-shadow: 0 2px 10px rgba(23, 104, 184, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.3);
  box-shadow: none;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .login-card {
    padding: 28px 24px;
    margin: 0 16px;
    max-width: 100%;
  }

  .logo-img {
    width: 80px;
    height: 80px;
  }

  .logo-text-wrapper {
    height: 80px;
  }

  .logo-text {
    font-size: 22px;
  }
}
</style>
