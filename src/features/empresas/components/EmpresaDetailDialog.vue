<script setup lang="ts">
import { computed } from 'vue'
import AppModal from '@/components/shared/AppModal.vue'
import { Activity, Building2, CreditCard } from 'lucide-vue-next'
import type { EmpresaDetail, EmpresaEstado } from '../types'

interface Props {
  open: boolean
  empresa: EmpresaDetail | null
  loading: boolean
  mutating: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  activate: [empresaId: number]
  suspend: [empresaId: number]
}>()

const statusLabel: Record<EmpresaEstado, string> = {
  configuracion: 'En configuracion',
  activa: 'Activa',
  suspendida: 'Suspendida',
  inactiva: 'Inactiva',
}

const canActivate = computed(
  () => props.empresa?.estado === 'configuracion' || props.empresa?.estado === 'inactiva',
)

const canSuspend = computed(() => props.empresa?.estado === 'activa')

const statusClass = (status: EmpresaEstado) => {
  if (status === 'activa') {
    return 'badge badge-success'
  }

  if (status === 'suspendida') {
    return 'badge badge-danger'
  }

  if (status === 'configuracion') {
    return 'badge badge-warning'
  }

  return 'badge badge-muted'
}
</script>

<template>
  <AppModal
    :open="open"
    size="xl"
    title="Detalle de empresa"
    description="Revisa el estado operativo, la configuracion base y el readiness del workspace."
    @close="emit('update:open', false)"
  >
    <div v-if="loading" class="detail-loading">
      <div class="loading-block loading-block-lg" />
      <div class="loading-grid">
        <div class="loading-block" />
        <div class="loading-block" />
      </div>
    </div>

    <div v-else-if="empresa" class="detail-layout">
      <section class="detail-hero detail-card">
        <div class="detail-badges">
          <span :class="statusClass(empresa.estado)">{{ statusLabel[empresa.estado] }}</span>
          <span class="badge badge-outline">{{ empresa.moneda_iso ?? 'USD' }}</span>
          <span class="badge badge-outline">{{ empresa.plan_saas ?? 'Sin plan' }}</span>
        </div>

        <div class="detail-headline">
          <h3 class="detail-name">{{ empresa.nombre }}</h3>
          <p class="detail-alias">{{ empresa.nombre_comercial ?? empresa.ruc_nit ?? 'Sin alias comercial registrado' }}</p>
        </div>

        <div class="detail-stats">
          <div class="stat-card">
            <span class="stat-label">Membresias activas</span>
            <strong class="stat-value">{{ empresa.membresias_activas.length }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">Rangos activos</span>
            <strong class="stat-value">{{ empresa.configuracion_rangos.length }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">Zona horaria</span>
            <strong class="stat-text">{{ empresa.zona_horaria ?? 'No definida' }}</strong>
          </div>
          <div class="stat-card">
            <span class="stat-label">Max. distribuidores</span>
            <strong class="stat-text">{{ empresa.max_distribuidores ?? 'Sin limite' }}</strong>
          </div>
        </div>
      </section>

      <div v-if="empresa.estado === 'configuracion'" class="inline-alert inline-alert-info">
        <strong>Activacion condicionada</strong>
        <span>El backend exige al menos un rango activo antes de activar la empresa.</span>
      </div>

      <section class="detail-info-grid">
        <article class="detail-card info-card">
          <div class="info-card-header">
            <span class="info-card-kicker"><Building2 class="info-icon" /> Empresa</span>
            <h4 class="info-card-title">{{ empresa.nombre }}</h4>
          </div>
          <div class="info-card-list">
            <p><strong>RUC/NIT:</strong> {{ empresa.ruc_nit ?? 'No registrado' }}</p>
            <p><strong>Nombre comercial:</strong> {{ empresa.nombre_comercial ?? 'No registrado' }}</p>
            <p><strong>Email:</strong> {{ empresa.email_contacto ?? 'No registrado' }}</p>
            <p><strong>Telefono:</strong> {{ empresa.telefono_contacto ?? 'No registrado' }}</p>
          </div>
        </article>

        <article class="detail-card info-card">
          <div class="info-card-header">
            <span class="info-card-kicker"><Activity class="info-icon" /> Operacion</span>
            <h4 class="info-card-title">Capacidad y adopcion</h4>
          </div>
          <div class="info-card-list">
            <p><strong>Membresias activas:</strong> {{ empresa.membresias_activas.length }}</p>
            <p><strong>Max. distribuidores:</strong> {{ empresa.max_distribuidores ?? 'Sin limite' }}</p>
            <p><strong>Zona horaria:</strong> {{ empresa.zona_horaria ?? 'No definida' }}</p>
            <p><strong>URL logo:</strong> {{ empresa.logo_url ?? 'No registrada' }}</p>
          </div>
        </article>

        <article class="detail-card info-card">
          <div class="info-card-header">
            <span class="info-card-kicker"><CreditCard class="info-icon" /> Pagos</span>
            <h4 class="info-card-title">{{ empresa.configuracion_pagos?.modelo_pago ?? 'Sin configuracion' }}</h4>
          </div>
          <div class="info-card-list">
            <p><strong>Dias bullet:</strong> {{ empresa.configuracion_pagos?.dias_plazo_bullet ?? 'N/A' }}</p>
            <p><strong>Cuotas:</strong> {{ empresa.configuracion_pagos?.numero_cuotas ?? 'N/A' }}</p>
            <p><strong>Periodicidad:</strong> {{ empresa.configuracion_pagos?.periodicidad_dias ?? 'N/A' }}</p>
            <p><strong>Gracia recepcion:</strong> {{ empresa.configuracion_pagos?.dias_gracia_recepcion ?? 'N/A' }}</p>
          </div>
        </article>
      </section>

      <section class="detail-secondary-grid">
        <article class="detail-card section-card">
          <div class="section-card-header">
            <h4 class="section-card-title">Rangos activos</h4>
            <p class="section-card-copy">{{ empresa.configuracion_rangos.length }} configuraciones activas para la empresa.</p>
          </div>

          <div v-if="empresa.configuracion_rangos.length === 0" class="empty-state">
            Esta empresa aun no tiene rangos configurados.
          </div>

          <div v-else class="range-list">
            <div v-for="rango in empresa.configuracion_rangos" :key="rango.id" class="range-item">
              <div class="range-top">
                <div>
                  <p class="range-name">{{ rango.nombre_rango }}</p>
                  <p class="range-level">Nivel {{ rango.nivel }}</p>
                </div>
                <span class="badge badge-outline">{{ rango.porcentaje_comision_cascada }}%</span>
              </div>
              <p class="range-copy">
                Limite de kits a credito: {{ rango.limite_kits_credito }} · Directos: {{ rango.max_distribuidores_directos ?? 'Sin limite' }}
              </p>
            </div>
          </div>
        </article>

        <article class="detail-card section-card">
          <div class="section-card-header">
            <h4 class="section-card-title">Notas operativas</h4>
            <p class="section-card-copy">Restricciones observadas en el backend actual.</p>
          </div>

          <div class="notes-list">
            <p>La suspension actualmente no tiene endpoint de reactivacion para superadmin.</p>
            <p>La edicion completa de datos de empresa todavia no esta expuesta por API.</p>
            <p>La configuracion de rangos vive hoy en el contexto tenant de workspace, no en el panel superadmin.</p>
          </div>
        </article>
      </section>
    </div>

    <template #footer>
      <button type="button" class="btn-secondary footer-left" @click="emit('update:open', false)">Cerrar</button>

      <div class="footer-actions">
        <button
          v-if="canActivate && empresa"
          type="button"
          class="btn-primary"
          :disabled="mutating"
          @click="emit('activate', empresa.id)"
        >
          {{ mutating ? 'Procesando...' : 'Activar empresa' }}
        </button>

        <button
          v-if="canSuspend && empresa"
          type="button"
          class="btn-danger"
          :disabled="mutating"
          @click="emit('suspend', empresa.id)"
        >
          {{ mutating ? 'Procesando...' : 'Suspender empresa' }}
        </button>
      </div>
    </template>
  </AppModal>
</template>

<style scoped>
.detail-layout,
.detail-loading {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.detail-card {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(245, 249, 255, 0.96));
  border: 1px solid rgba(26, 43, 71, 0.1);
  border-radius: 18px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.06);
}

.detail-hero {
  padding: 18px;
  background:
    radial-gradient(circle at top right, rgba(55, 111, 200, 0.14), transparent 28%),
    linear-gradient(135deg, rgba(245, 248, 252, 0.98), rgba(239, 246, 255, 0.98));
}

.detail-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}

.badge-success {
  background: rgba(226, 247, 232, 0.98);
  color: #1b6b39;
}

.badge-danger {
  background: rgba(253, 234, 234, 0.98);
  color: #983737;
}

.badge-warning {
  background: rgba(214, 234, 255, 0.88);
  color: #1f63ae;
}

.badge-muted {
  background: rgba(233, 238, 246, 0.98);
  color: #42526d;
}

.badge-outline {
  border: 1px solid rgba(151, 177, 209, 0.24);
  background: rgba(255, 255, 255, 0.82);
  color: #51657f;
}

.detail-headline {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 16px;
}

.detail-name {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #162033;
}

.detail-alias {
  margin: 0;
  font-size: 13px;
  color: #5e6d83;
}

.detail-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.stat-card {
  border: 1px solid rgba(26, 43, 71, 0.08);
  border-radius: 16px;
  padding: 14px;
  background: rgba(255, 255, 255, 0.84);
}

.stat-label {
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  color: #73839a;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #162033;
}

.stat-text {
  font-size: 13px;
  font-weight: 700;
  color: #162033;
}

.inline-alert {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 13px;
}

.inline-alert-info {
  border: 1px solid rgba(158, 187, 220, 0.24);
  background: linear-gradient(180deg, rgba(238, 245, 255, 0.94) 0%, rgba(245, 249, 255, 0.96) 100%);
  color: #1f63ae;
}

.detail-info-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.info-card,
.section-card {
  padding: 18px;
}

.info-card-header,
.section-card-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.info-card-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #5e7898;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.info-icon {
  width: 15px;
  height: 15px;
}

.info-card-title,
.section-card-title {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  color: #162033;
}

.info-card-list,
.notes-list,
.section-card-copy,
.range-copy,
.range-level {
  font-size: 13px;
  line-height: 1.55;
  color: #5e6d83;
}

.info-card-list,
.notes-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-card-list p,
.notes-list p,
.range-copy,
.range-level,
.section-card-copy {
  margin: 0;
}

.info-card-list strong {
  color: #162033;
}

.detail-secondary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 16px;
}

.empty-state {
  border: 1px dashed rgba(158, 187, 220, 0.34);
  border-radius: 16px;
  padding: 28px 16px;
  text-align: center;
  font-size: 13px;
  color: #5e6d83;
  background: rgba(238, 245, 255, 0.58);
}

.range-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.range-item {
  border: 1px solid rgba(26, 43, 71, 0.08);
  border-radius: 16px;
  padding: 14px;
  background: rgba(247, 248, 250, 0.92);
}

.range-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.range-name {
  margin: 0 0 2px;
  font-size: 14px;
  font-weight: 700;
  color: #162033;
}

.loading-block {
  height: 180px;
  border-radius: 18px;
  background: linear-gradient(90deg, rgba(233, 238, 246, 0.9) 25%, rgba(238, 245, 255, 0.92) 50%, rgba(233, 238, 246, 0.9) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
}

.loading-block-lg {
  height: 120px;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.footer-left {
  margin-right: auto;
}

.footer-actions {
  display: flex;
  gap: 10px;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  padding: 10px 18px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
}

.btn-primary {
  border: none;
  background: linear-gradient(135deg, #16335f, #376fc8);
  color: #fff;
}

.btn-secondary {
  border: 1px solid rgba(26, 43, 71, 0.12);
  background: rgba(255, 255, 255, 0.9);
  color: #42526d;
}

.btn-danger {
  border: none;
  background: linear-gradient(135deg, #b54646, #983737);
  color: #fff;
}

.btn-primary:disabled,
.btn-danger:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 1024px) {
  .detail-stats,
  .detail-info-grid,
  .detail-secondary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 720px) {
  .detail-stats,
  .detail-info-grid,
  .detail-secondary-grid,
  .loading-grid {
    grid-template-columns: 1fr;
  }

  .footer-actions {
    width: 100%;
    flex-direction: column;
  }

  .footer-left {
    margin-right: 0;
  }
}
</style>
