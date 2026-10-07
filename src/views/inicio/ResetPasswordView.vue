<template>
  <div class="auth-page">
    <aside class="brand-panel">
      <div class="brand-glow"></div>
      <div class="brand-content">
        <div class="brand-logo"><img :src="logoInnovex" alt="Logo Innovex" class="brand-logo-img" /><span class="brand-name"><span class="brand-name-hl">INNO</span>VEX</span></div>
        <h1 class="brand-title">Una contraseña nueva, el control de siempre</h1>
        <p class="brand-subtitle">Crea una contraseña segura para volver a tu espacio de trabajo.</p>
      </div>
    </aside>
    <main class="form-panel">
      <div class="form-wrap">
        <div class="mobile-logo"><img :src="logoInnovex" alt="Logo Innovex" class="mobile-logo-img" /><span class="brand-name"><span class="brand-name-hl">INNO</span>VEX</span></div>
        <template v-if="!succeeded">
          <h2 class="welcome-title">Restablecer contraseña</h2>
          <p class="welcome-subtitle">Elige una contraseña nueva para tu cuenta.</p>
          <form class="auth-form" @submit.prevent="handleSubmit">
            <div v-if="email" class="field-group">
              <label class="field-label" for="reset-email">Correo electrónico</label>
              <div class="input-wrap"><span class="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></span><input id="reset-email" class="field-input" type="email" :value="email" readonly /></div>
            </div>
            <div class="field-group">
              <label class="field-label" for="reset-password">Nueva contraseña</label>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg></span>
                <input id="reset-password" v-model="password" class="field-input field-input--pass" :type="showPassword ? 'text' : 'password'" autocomplete="new-password" placeholder="Mínimo 8 caracteres" required />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword" :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"><svg v-if="!showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg><svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg></button>
              </div>
            </div>
            <div class="field-group">
              <label class="field-label" for="reset-confirm-password">Confirmar contraseña</label>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="10.5" width="16" height="10" rx="2.5" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /></svg></span>
                <input id="reset-confirm-password" v-model="passwordConfirmation" class="field-input field-input--pass" :type="showConfirmation ? 'text' : 'password'" autocomplete="new-password" placeholder="Repite la contraseña" required />
                <button type="button" class="toggle-password" @click="showConfirmation = !showConfirmation" :aria-label="showConfirmation ? 'Ocultar contraseña' : 'Mostrar contraseña'"><svg v-if="!showConfirmation" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg><svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg></button>
              </div>
            </div>
            <div v-if="errorMsg" class="error-banner" role="alert"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5" /><path d="M12 7.5v5.5M12 16.5h.01" /></svg><span>{{ errorMsg }}</span></div>
            <button type="submit" class="submit-btn" :disabled="loading"><span v-if="loading" class="spinner" aria-hidden="true"></span><span>{{ loading ? "Guardando..." : "Guardar contraseña" }}</span></button>
          </form>
        </template>
        <div v-else class="success-state" role="status">
          <span class="success-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6" /></svg></span>
          <h2 class="welcome-title">Contraseña actualizada</h2>
          <p class="welcome-subtitle">Tu contraseña se cambió correctamente. Te llevaremos al inicio de sesión.</p>
        </div>
        <router-link to="/" class="back-link">Volver al inicio de sesión</router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { API_BASE_URL } from "@/app/apiClient";
import logoInnovexUrl from "../../assets/logo-innovex.png";

const logoInnovex = logoInnovexUrl;
const route = useRoute();
const router = useRouter();
const queryValue = (value: unknown) => typeof value === "string" ? value : "";
const email = ref(queryValue(route.query.email));
const token = queryValue(route.query.token);
const password = ref("");
const passwordConfirmation = ref("");
const showPassword = ref(false);
const showConfirmation = ref(false);
const loading = ref(false);
const succeeded = ref(false);
const errorMsg = ref("");
let redirectTimer: ReturnType<typeof setTimeout> | undefined;

onBeforeUnmount(() => { if (redirectTimer) clearTimeout(redirectTimer); });

const handleSubmit = async () => {
  errorMsg.value = "";
  if (!email.value || !token) { errorMsg.value = "El enlace no es válido o está incompleto."; return; }
  if (password.value.length < 8) { errorMsg.value = "La contraseña debe tener al menos 8 caracteres."; return; }
  if (password.value !== passwordConfirmation.value) { errorMsg.value = "Las contraseñas no coinciden."; return; }
  if (loading.value) return;
  loading.value = true;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email.value, token, password: password.value, password_confirmation: passwordConfirmation.value }),
    });
    const data: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const backendMessage = data && typeof data === "object" && "message" in data && typeof data.message === "string"
        ? data.message
        : "No se pudo restablecer la contraseña. Inténtalo de nuevo.";
      throw new Error(backendMessage);
    }
    succeeded.value = true;
    redirectTimer = setTimeout(() => router.push("/"), 2000);
  } catch (error: unknown) {
    errorMsg.value = error instanceof Error ? error.message : "Error al conectar con el servidor.";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page { --bg:#060913; --surface:#0b1120; --border:rgba(255,255,255,.1); --text:#f1f5f9; --muted:rgba(255,255,255,.6); --brand:#3eb5f5; --brand-dark:#1768b8; --danger:#ff6b6b; position:fixed; inset:0; display:grid; grid-template-columns:minmax(0,1.05fr) minmax(0,1fr); overflow:auto; background:var(--bg); color:var(--text); font-family:"Geist","Segoe UI",system-ui,Arial,sans-serif; }
.brand-panel { position:relative; display:flex; align-items:center; padding:64px; overflow:hidden; border-right:1px solid var(--border); background:linear-gradient(155deg,#0a1a33 0%,#071226 55%,#060913 100%); }
.brand-glow { position:absolute; top:-20%; right:-25%; width:70%; aspect-ratio:1; border-radius:50%; background:radial-gradient(circle,rgba(62,181,245,.28),transparent 65%); filter:blur(40px); pointer-events:none; }
.brand-content { position:relative; max-width:460px; }
.brand-logo,.mobile-logo { display:flex; align-items:center; gap:14px; }
.brand-logo { margin-bottom:48px; }
.brand-logo-img { width:56px; height:56px; object-fit:contain; }
.brand-name { color:var(--brand); font-size:22px; font-weight:800; letter-spacing:4px; white-space:nowrap; }
.brand-name-hl { color:#fff; }
.brand-title { margin:0 0 14px; font-size:34px; line-height:1.15; font-weight:700; }
.brand-subtitle,.welcome-subtitle { color:var(--muted); line-height:1.6; }
.brand-subtitle { margin:0; font-size:15px; }
.form-panel { display:flex; align-items:center; justify-content:center; padding:32px 24px; background:var(--surface); }
.form-wrap { width:100%; max-width:400px; animation:fadeIn .6s cubic-bezier(.16,1,.3,1) both; }
.mobile-logo { display:none; justify-content:center; margin-bottom:28px; }
.mobile-logo-img { width:52px; height:52px; object-fit:contain; }
.welcome-title { margin:0 0 6px; font-size:26px; font-weight:700; }
.welcome-subtitle { margin:0 0 24px; font-size:14px; }
.auth-form { display:flex; flex-direction:column; gap:18px; }
.field-group { display:flex; flex-direction:column; gap:8px; }
.field-label { color:rgba(255,255,255,.8); font-size:13px; font-weight:500; }
.input-wrap { position:relative; }
.input-icon { position:absolute; top:50%; left:14px; display:flex; transform:translateY(-50%); color:rgba(255,255,255,.35); pointer-events:none; }
.input-wrap:focus-within .input-icon { color:var(--brand); }
.field-input { box-sizing:border-box; width:100%; height:46px; padding:0 14px 0 42px; border:1px solid var(--border); border-radius:10px; outline:none; background:rgba(255,255,255,.04); color:#fff; font-size:14px; }
.field-input--pass { padding-right:46px; }
.field-input::placeholder { color:rgba(255,255,255,.28); }
.field-input:focus { border-color:var(--brand); box-shadow:0 0 0 3px rgba(62,181,245,.25); }
.toggle-password { position:absolute; top:50%; right:8px; display:flex; align-items:center; justify-content:center; width:34px; height:34px; padding:0; transform:translateY(-50%); border:0; border-radius:8px; background:none; color:rgba(255,255,255,.45); cursor:pointer; }
.toggle-password:hover { background:rgba(255,255,255,.05); color:var(--brand); }
.submit-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; height:48px; margin-top:4px; border:0; border-radius:10px; background:linear-gradient(135deg,var(--brand),var(--brand-dark)); color:#fff; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 6px 20px rgba(23,104,184,.35); }
.submit-btn:hover:not(:disabled) { box-shadow:0 8px 26px rgba(62,181,245,.45); }
.submit-btn:disabled { opacity:.6; cursor:not-allowed; }
.spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
.error-banner { display:flex; align-items:flex-start; gap:10px; padding:11px 14px; border:1px solid rgba(255,107,107,.3); border-radius:10px; background:rgba(255,107,107,.1); color:#ffb4b4; font-size:13px; line-height:1.4; animation:shake .4s ease-in-out; }
.error-banner svg { flex-shrink:0; margin-top:1px; color:var(--danger); }
.success-state { text-align:center; }
.success-icon { display:inline-flex; align-items:center; justify-content:center; width:48px; height:48px; margin-bottom:18px; border:1px solid rgba(62,181,245,.3); border-radius:50%; background:rgba(62,181,245,.12); color:var(--brand); }
.back-link { display:inline-block; margin-top:24px; color:var(--brand); font-size:13px; text-decoration:none; }
.back-link:hover { text-decoration:underline; }
.toggle-password:focus-visible,.submit-btn:focus-visible,.back-link:focus-visible { outline:2px solid var(--brand); outline-offset:2px; }
@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin { to { transform:rotate(360deg); } }
@keyframes shake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }
@media(max-width:900px) { .auth-page { grid-template-columns:1fr; } .brand-panel { display:none; } .mobile-logo { display:flex; } .form-panel { background:radial-gradient(circle at 50% 0%,#0b2a4a 0%,var(--bg) 60%); } }
@media(prefers-reduced-motion:reduce) { .form-wrap,.error-banner,.spinner { animation:none; } }
</style>