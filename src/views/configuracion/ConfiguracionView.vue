<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Configuración</strong></span>
    </template>

    <div class="page-body">
        <div class="page-header">
          <div><h1 class="page-title">Configuración Global</h1><p class="page-subtitle">Ajustes generales del sistema</p></div>
        </div>

        <!-- Tabs -->
        <div class="tabs-bar">
          <button v-for="tab in tabs" :key="tab" class="tab-btn" :class="{ active: tabActivo === tab }" @click="tabActivo = tab">{{ tab }}</button>
        </div>

        <div class="config-grid">
          <!-- Datos fiscales -->
          <div class="card">
            <h3 class="section-title">Datos Fiscales</h3>
            <div class="form-list">
              <div class="form-group">
                <label class="form-label">Razón Social</label>
                <input type="text" v-model="form.razonSocial" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">RUC / NIT</label>
                <input type="text" v-model="form.ruc" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Dirección Fiscal</label>
                <input type="text" v-model="form.direccion" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Teléfono Empresa</label>
                <input type="text" v-model="form.telefono" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Email Corporativo</label>
                <input type="text" v-model="form.email" class="form-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Sitio Web</label>
                <input type="text" v-model="form.web" class="form-input" />
              </div>
              <button class="btn-guardar">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                Guardar Cambios
              </button>
            </div>
          </div>

          <!-- Marca y apariencia -->
          <div class="right-col">
            <div class="card dark-card">
              <h3 class="section-title white">Marca y Apariencia</h3>
              <label class="form-label-white">Logo de la Empresa</label>
              <div class="logo-upload">
                <div class="logo-preview">EC</div>
                <div class="upload-info">
                  <button class="upload-btn">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Subir Logo
                  </button>
                  <span class="upload-hint">PNG, JPG, Max 2MB. 200x200px recomendado</span>
                </div>
              </div>
              <label class="form-label-white" style="margin-top:16px">Color Primario de Marca</label>
              <div class="color-row">
                <div class="color-picker-box">
                  <div class="color-swatch" :style="{ background: colorPrimario }"></div>
                  <span class="color-hex">{{ colorPrimario }}</span>
                  <input type="color" v-model="colorPrimario" class="color-input" />
                </div>
                <div class="preset-colors">
                  <div v-for="c in presetColors" :key="c" class="preset-dot" :style="{ background: c }" @click="colorPrimario = c"></div>
                </div>
              </div>
            </div>

            <!-- Vista Previa -->
            <div class="card">
              <h3 class="section-title">Vista Previa</h3>
              <div class="preview-box" :style="{ background: colorPrimario }">
                <div class="preview-header">
                  <span class="preview-logo-box">EC</span>
                  <span class="preview-empresa">Empresa Corp - Admin Panel</span>
                </div>
                <button class="preview-btn" :style="{ background: colorPrimario }">Botón Primario</button>
                <p class="preview-hint">Así se verá el color en la interfaz</p>
              </div>
            </div>
          </div>
        </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import AppShell from '../../components/layout/AppShell.vue'
const tabs    = ['Empresa', 'Cuentas Bancarias', 'Biometría']
const tabActivo = ref('Empresa')
const colorPrimario = ref('#4ab8e5')
const presetColors  = ['#4ab8e5','#6366f1','#22c55e','#ef4444','#f59e0b','#000000']
const form = ref({
  razonSocial: 'Admin Panel',
  ruc:         '20123456789',
  direccion:   'Av. Principal 1234, Lima, Perú',
  telefono:    '+51 1 234-5678',
  email:       'contacto@empresa.com',
  web:         'https://www.empresa.com',
})
</script>

<style>
html, body, #app { margin:0!important; padding:0!important; height:100%!important; background:#f4f6f9!important; font-family:'Segoe UI',Arial,sans-serif; }
</style>
<style scoped>
.dashboard-layout { display:flex; min-height:100vh; background:#f4f6f9; }
.sidebar { width:200px; background:#0f1b2d; display:flex; flex-direction:column; padding:0; position:fixed; top:0; left:0; height:100vh; z-index:100; border-right:1px solid #1a2d45; overflow-y:auto; }
.sidebar-logo { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px 16px 16px; border-bottom:1px solid #1a2d45; gap:6px; }
.sidebar-logo-img { width:56px; height:56px; object-fit:contain; }
.sidebar-brand { font-size:13px; font-weight:800; color:#fff; letter-spacing:3px; }
.sidebar-section-label { font-size:10px; font-weight:700; color:#4a6080; letter-spacing:1.5px; text-transform:uppercase; padding:14px 18px 6px; }
.sidebar-nav { display:flex; flex-direction:column; gap:2px; padding:0 10px; }
.nav-item { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; color:#6b8aaa; text-decoration:none; font-size:13px; font-weight:500; transition:background 0.2s,color 0.2s; white-space:nowrap; }
.nav-item:hover { background:#162236; color:#a0c4e8; }
.nav-item.active { background:#1a3a5c; color:#4ab8f5; font-weight:600; }
.nav-item.nav-logout { color:#ef4444; }
.nav-item.nav-logout:hover { background:#2a1010; color:#f87171; }
.sidebar-bottom { display:flex; flex-direction:column; gap:2px; padding:0 10px 16px; }
.main-content { margin-left:200px; flex:1; display:flex; flex-direction:column; }
.topbar { background:white; height:56px; display:flex; align-items:center; padding:0 24px; gap:16px; border-bottom:1px solid #eee; position:sticky; top:0; z-index:50; }
.topbar-left { min-width:160px; }
.breadcrumb { font-size:13px; color:#999; }
.breadcrumb strong { color:#333; }
.topbar-center { flex:1; display:flex; justify-content:center; }
.search-box { display:flex; align-items:center; gap:8px; background:#f4f6f9; border-radius:20px; padding:6px 14px; width:280px; }
.search-input { border:none; background:transparent; outline:none; font-size:13px; color:#333; width:100%; }
.topbar-right { display:flex; align-items:center; gap:16px; min-width:220px; justify-content:flex-end; }
.user-info { display:flex; align-items:center; gap:10px; }
.user-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,#4ab8f5,#1a6ab5); color:white; font-weight:700; font-size:14px; display:flex; align-items:center; justify-content:center; }
.user-details { display:flex; flex-direction:column; }
.user-name { font-size:13px; font-weight:600; color:#333; }
.user-email { font-size:11px; color:#999; }
.notif-btn { position:relative; background:none; border:none; cursor:pointer; color:#666; padding:6px; }
.notif-badge { position:absolute; top:2px; right:2px; background:#ef4444; color:white; font-size:9px; width:14px; height:14px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.page-body { padding:24px 28px; display:flex; flex-direction:column; gap:20px; }
.page-header { display:flex; align-items:center; justify-content:space-between; }
.page-title { font-size:22px; font-weight:700; color:#1a1a1a; margin:0 0 4px; }
.page-subtitle { font-size:13px; color:#999; margin:0; }
.tabs-bar { display:flex; gap:4px; border-bottom:2px solid #e2e8f0; }
.tab-btn { padding:10px 16px; border:none; background:none; font-size:13px; font-weight:500; color:#888; cursor:pointer; border-bottom:2px solid transparent; margin-bottom:-2px; }
.tab-btn.active { color:#1a6ab5; border-bottom-color:#1a6ab5; font-weight:600; }
.config-grid { display:grid; grid-template-columns:1fr 320px; gap:20px; align-items:flex-start; }
.card { background:white; border-radius:12px; padding:20px; box-shadow:0 2px 8px rgba(0,0,0,0.06); }
.dark-card { background:#0f1b2d !important; }
.section-title { font-size:15px; font-weight:700; color:#1a1a1a; margin:0 0 16px; }
.section-title.white { color:white; }
.form-list { display:flex; flex-direction:column; gap:14px; }
.form-group { display:flex; flex-direction:column; gap:5px; }
.form-label { font-size:12px; font-weight:600; color:#666; }
.form-label-white { font-size:12px; font-weight:600; color:#7eb8e8; display:block; margin-bottom:8px; }
.form-input { border:1px solid #e2e8f0; border-radius:8px; padding:9px 12px; font-size:13px; color:#333; outline:none; width:100%; box-sizing:border-box; }
.form-input:focus { border-color:#4ab8f5; }
.btn-guardar { display:flex; align-items:center; gap:8px; padding:10px 20px; border:none; border-radius:8px; background:#0f1b2d; font-size:13px; font-weight:600; color:white; cursor:pointer; margin-top:4px; }
.right-col { display:flex; flex-direction:column; gap:16px; }
.logo-upload { display:flex; align-items:center; gap:12px; margin-bottom:16px; }
.logo-preview { width:56px; height:56px; border-radius:10px; background:#162236; color:#4ab8f5; font-size:18px; font-weight:700; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
.upload-info { display:flex; flex-direction:column; gap:4px; }
.upload-btn { display:flex; align-items:center; gap:6px; padding:7px 12px; border:1px solid #4ab8f5; border-radius:6px; background:transparent; color:#4ab8f5; font-size:12px; font-weight:600; cursor:pointer; }
.upload-hint { font-size:10px; color:#4a6080; }
.color-row { display:flex; align-items:center; gap:10px; }
.color-picker-box { display:flex; align-items:center; gap:8px; background:#162236; border-radius:8px; padding:8px 12px; flex:1; position:relative; }
.color-swatch { width:24px; height:24px; border-radius:4px; flex-shrink:0; }
.color-hex { font-size:12px; color:#e2e8f0; font-family:monospace; }
.color-input { position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%; }
.preset-colors { display:flex; gap:6px; }
.preset-dot { width:22px; height:22px; border-radius:50%; cursor:pointer; border:2px solid transparent; transition:border-color 0.15s; }
.preset-dot:hover { border-color:white; }
.preview-box { border-radius:10px; padding:16px; }
.preview-header { display:flex; align-items:center; gap:8px; margin-bottom:12px; }
.preview-logo-box { width:28px; height:28px; border-radius:6px; background:rgba(255,255,255,0.2); color:white; font-size:11px; font-weight:700; display:flex; align-items:center; justify-content:center; }
.preview-empresa { font-size:12px; font-weight:600; color:white; }
.preview-btn { padding:8px 16px; border:none; border-radius:6px; background:rgba(255,255,255,0.25); color:white; font-size:12px; font-weight:600; cursor:pointer; margin-bottom:8px; }
.preview-hint { font-size:11px; color:rgba(255,255,255,0.6); margin:0; }
</style>