<template>
  <div class="auth-page">
    <aside class="brand-panel">
      <div class="brand-glow"></div>
      <div class="brand-content">
        <div class="brand-logo"><img :src="logoInnovex" alt="Logo Innovex" class="brand-logo-img" /><span class="brand-name"><span class="brand-name-hl">INNO</span>VEX</span></div>
        <h1 class="brand-title">Recupera el acceso a tu cuenta</h1>
        <p class="brand-subtitle">Te ayudaremos a volver a gestionar tu red, tus campañas y tus reportes.</p>
      </div>
    </aside>
    <main class="form-panel">
      <div class="form-wrap">
        <div class="mobile-logo"><img :src="logoInnovex" alt="Logo Innovex" class="mobile-logo-img" /><span class="brand-name"><span class="brand-name-hl">INNO</span>VEX</span></div>
        <template v-if="!submitted">
          <h2 class="welcome-title">¿Olvidaste tu contraseña?</h2>
          <p class="welcome-subtitle">Escribe el correo asociado a tu cuenta y te enviaremos un enlace.</p>
          <form class="auth-form" @submit.prevent="handleSubmit">
            <div class="field-group">
              <label class="field-label" for="forgot-email">Correo electrónico</label>
              <div class="input-wrap">
                <span class="input-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></span>
                <input id="forgot-email" v-model.trim="email" class="field-input" type="email" autocomplete="email" placeholder="nombre@empresa.com" required />
              </div>
            </div>
            <button type="submit" class="submit-btn" :disabled="loading"><span v-if="loading" class="spinner" aria-hidden="true"></span><span>{{ loading ? "Enviando..." : "Enviar enlace" }}</span></button>
          </form>
        </template>
        <div v-else class="success-state" role="status">
          <span class="success-icon" aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 4 4L19 6" /></svg></span>
          <h2 class="welcome-title">Revisa tu correo</h2>
          <p class="welcome-subtitle">Si el correo existe, te enviamos un enlace para restablecer tu contraseña</p>
        </div>
        <router-link to="/" class="back-link">Volver al inicio de sesión</router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { API_BASE_URL } from "@/app/apiClient";
import logoInnovexUrl from "../../assets/logo-innovex.png";

const logoInnovex = logoInnovexUrl;
const email = ref("");
const loading = ref(false);
const submitted = ref(false);

const handleSubmit = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email: email.value }),
    });
  } catch {
    // La respuesta genérica evita revelar si el correo está registrado.
  } finally {
    submitted.value = true;
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-page { --bg:#060913; --surface:#0b1120; --border:rgba(255,255,255,.1); --text:#f1f5f9; --muted:rgba(255,255,255,.6); --brand:#3eb5f5; --brand-dark:#1768b8; position:fixed; inset:0; display:grid; grid-template-columns:minmax(0,1.05fr) minmax(0,1fr); overflow:auto; background:var(--bg); color:var(--text); font-family:"Geist","Segoe UI",system-ui,Arial,sans-serif; }
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
.welcome-subtitle { margin:0 0 28px; font-size:14px; }
.auth-form { display:flex; flex-direction:column; gap:18px; }
.field-group { display:flex; flex-direction:column; gap:8px; }
.field-label { color:rgba(255,255,255,.8); font-size:13px; font-weight:500; }
.input-wrap { position:relative; }
.input-icon { position:absolute; top:50%; left:14px; display:flex; transform:translateY(-50%); color:rgba(255,255,255,.35); pointer-events:none; }
.input-wrap:focus-within .input-icon { color:var(--brand); }
.field-input { box-sizing:border-box; width:100%; height:46px; padding:0 14px 0 42px; border:1px solid var(--border); border-radius:10px; outline:none; background:rgba(255,255,255,.04); color:#fff; font-size:14px; }
.field-input::placeholder { color:rgba(255,255,255,.28); }
.field-input:focus { border-color:var(--brand); box-shadow:0 0 0 3px rgba(62,181,245,.25); }
.submit-btn { display:flex; align-items:center; justify-content:center; gap:10px; width:100%; height:48px; margin-top:4px; border:0; border-radius:10px; background:linear-gradient(135deg,var(--brand),var(--brand-dark)); color:#fff; font-size:15px; font-weight:600; cursor:pointer; box-shadow:0 6px 20px rgba(23,104,184,.35); }
.submit-btn:hover:not(:disabled) { box-shadow:0 8px 26px rgba(62,181,245,.45); }
.submit-btn:disabled { opacity:.6; cursor:not-allowed; }
.spinner { width:16px; height:16px; border:2px solid rgba(255,255,255,.35); border-top-color:#fff; border-radius:50%; animation:spin .7s linear infinite; }
.success-state { text-align:center; }
.success-icon { display:inline-flex; align-items:center; justify-content:center; width:48px; height:48px; margin-bottom:18px; border:1px solid rgba(62,181,245,.3); border-radius:50%; background:rgba(62,181,245,.12); color:var(--brand); }
.back-link { display:inline-block; margin-top:24px; color:var(--brand); font-size:13px; text-decoration:none; }
.back-link:hover { text-decoration:underline; }
.back-link:focus-visible,.submit-btn:focus-visible { outline:2px solid var(--brand); outline-offset:2px; }
@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
@keyframes spin { to { transform:rotate(360deg); } }
@media(max-width:900px) { .auth-page { grid-template-columns:1fr; } .brand-panel { display:none; } .mobile-logo { display:flex; } .form-panel { background:radial-gradient(circle at 50% 0%,#0b2a4a 0%,var(--bg) 60%); } }
@media(prefers-reduced-motion:reduce) { .form-wrap,.spinner { animation:none; } }
</style>