<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Globe,
  Layers3,
  Mail,
  MapPinned,
  Phone,
  RefreshCw,
  ShieldCheck,
  Users,
} from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import ConfiguracionWorkspacePageV2 from '@/features/configuracion/components/ConfiguracionWorkspacePageV2.vue'
import { useEmpresasApi } from '@/features/empresas/composables/useEmpresasApi'
import type { EmpresaEstado } from '@/features/empresas/types'

const route = useRoute()

const empresaId = computed(() => Number(route.params.empresaId))

const {
  empresaDetail,
  isDetailLoading,
  errorMessage,
  clearMessages,
  fetchEmpresaDetail,
} = useEmpresasApi()

const statusLabel: Record<EmpresaEstado, string> = {
  configuracion: 'En configuracion',
  activa: 'Activa',
  suspendida: 'Suspendida',
  inactiva: 'Inactiva',
}

const statusClass = (estado: EmpresaEstado) => {
  if (estado === 'activa') {
    return 'company-badge company-badge--active'
  }

  if (estado === 'configuracion') {
    return 'company-badge company-badge--config'
  }

  if (estado === 'suspendida') {
    return 'company-badge company-badge--danger'
  }

  return 'company-badge company-badge--neutral'
}

const companyInitial = computed(() => empresaDetail.value?.nombre?.slice(0, 1).toUpperCase() ?? 'E')

const formatDate = (value: string | null) => {
  if (!value) {
    return 'No disponible'
  }

  const parsedDate = new Date(value)

  if (Number.isNaN(parsedDate.getTime())) {
    return 'No disponible'
  }

  return new Intl.DateTimeFormat('es-VE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsedDate)
}

const kpiCards = computed(() => {
  if (!empresaDetail.value) {
    return []
  }

  return [
    {
      key: 'membresias',
      label: 'Membresias activas',
      value: String(empresaDetail.value.membresias_activas.length),
      sub: 'Perfiles operativos en el workspace.',
      valueClass: 'admin-kpi-card__value--blue',
      iconClass: 'admin-kpi-card__icon--blue',
      icon: Users,
    },
    {
      key: 'rangos',
      label: 'Rangos configurados',
      value: String(empresaDetail.value.configuracion_rangos.length),
      sub: 'Estructura comercial actualmente registrada.',
      valueClass: 'admin-kpi-card__value--orange',
      iconClass: 'admin-kpi-card__icon--orange',
      icon: Layers3,
    },
    {
      key: 'moneda',
      label: 'Moneda operativa',
      value: empresaDetail.value.moneda_iso ?? 'USD',
      sub: empresaDetail.value.zona_horaria ?? 'Zona horaria pendiente.',
      valueClass: 'admin-kpi-card__value--teal',
      iconClass: 'admin-kpi-card__icon--teal',
      icon: CircleDollarSign,
    },
    {
      key: 'estado',
      label: 'Estado actual',
      value: statusLabel[empresaDetail.value.estado],
      sub: `Actualizado ${formatDate(empresaDetail.value.updated_at)}.`,
      valueClass: empresaDetail.value.estado === 'suspendida'
        ? 'admin-kpi-card__value--red'
        : 'admin-kpi-card__value--blue',
      iconClass: empresaDetail.value.estado === 'suspendida'
        ? 'admin-kpi-card__icon--red'
        : 'admin-kpi-card__icon--blue',
      icon: ShieldCheck,
    },
  ]
})

const identityItems = computed(() => {
  if (!empresaDetail.value) {
    return []
  }

  return [
    {
      label: 'Nombre comercial',
      value: empresaDetail.value.nombre_comercial ?? 'No registrado',
      icon: Building2,
    },
    {
      label: 'RUC / NIT',
      value: empresaDetail.value.ruc_nit ?? 'No registrado',
      icon: ShieldCheck,
    },
    {
      label: 'Sitio web',
      value: empresaDetail.value.sitio_web ?? 'No registrado',
      icon: Globe,
    },
    {
      label: 'Creada el',
      value: formatDate(empresaDetail.value.created_at),
      icon: CalendarDays,
    },
  ]
})

const contactItems = computed(() => {
  if (!empresaDetail.value) {
    return []
  }

  return [
    {
      label: 'Correo',
      value: empresaDetail.value.email_contacto ?? 'No registrado',
      icon: Mail,
    },
    {
      label: 'Telefono',
      value: empresaDetail.value.telefono_contacto ?? 'No registrado',
      icon: Phone,
    },
    {
      label: 'Max. distribuidores',
      value: empresaDetail.value.max_distribuidores?.toString() ?? 'Sin limite',
      icon: Users,
    },
    {
      label: 'Zona horaria',
      value: empresaDetail.value.zona_horaria ?? 'No definida',
      icon: MapPinned,
    },
  ]
})

const paymentItems = computed(() => {
  if (!empresaDetail.value?.configuracion_pagos) {
    return [
      { label: 'Modelo', value: 'Sin configuracion' },
      { label: 'Dias bullet', value: 'N/A' },
      { label: 'Cuotas', value: 'N/A' },
      { label: 'Periodicidad', value: 'N/A' },
    ]
  }

  const pagos = empresaDetail.value.configuracion_pagos

  return [
    { label: 'Modelo', value: pagos.modelo_pago },
    { label: 'Dias bullet', value: pagos.dias_plazo_bullet?.toString() ?? 'N/A' },
    { label: 'Cuotas', value: pagos.numero_cuotas?.toString() ?? 'N/A' },
    { label: 'Periodicidad', value: pagos.periodicidad_dias?.toString() ?? 'N/A' },
  ]
})

const operationalNotes = computed(() => {
  if (!empresaDetail.value) {
    return []
  }

  const notes = [
    'La suspension sigue dependiendo del flujo superadmin actual.',
    'La configuracion de rangos continua conectada al workspace tenant.',
  ]

  if (empresaDetail.value.configuracion_rangos.length === 0) {
    notes.unshift('Esta empresa aun no tiene rangos activos para operacion comercial.')
  }

  if (!empresaDetail.value.configuracion_pagos) {
    notes.unshift('La empresa no tiene una configuracion de pagos definida.')
  }

  return notes
})

const loadEmpresaDetail = async () => {
  if (!Number.isFinite(empresaId.value) || empresaId.value <= 0) {
    return
  }

  clearMessages()
  await fetchEmpresaDetail(empresaId.value)
}

watch(empresaId, async () => {
  await loadEmpresaDetail()
})

onMounted(async () => {
  await loadEmpresaDetail()
})
</script>

<template>
  <AppShell :show-search="false">
    <template #breadcrumb>
      <span class="breadcrumb">Superadmin · <strong>Detalle de Empresa V2</strong></span>
    </template>

    <section class="admin-list-page empresa-workspace-v2">
      <header class="admin-list-page__header">
        <div>
          <h1 class="admin-list-page__title">Detalle de empresa V2</h1>
          <p class="admin-list-page__subtitle">
            Vista alternativa alineada al listado de empresas, sin reemplazar la pantalla actual.
          </p>
        </div>

        <div class="admin-list-page__actions">
          <RouterLink class="admin-btn admin-btn--outline" :to="{ name: 'empresas' }">
            <ArrowLeft class="size-4" />
            Volver al listado
          </RouterLink>
          <RouterLink class="admin-btn admin-btn--outline" :to="{ name: 'empresa-workspace', params: { empresaId } }">
            Abrir vista actual
          </RouterLink>
          <button type="button" class="admin-btn admin-btn--primary" :disabled="isDetailLoading" @click="loadEmpresaDetail">
            <RefreshCw class="size-4" :class="{ 'is-spinning': isDetailLoading }" />
            {{ isDetailLoading ? 'Actualizando...' : 'Actualizar datos' }}
          </button>
        </div>
      </header>

      <div v-if="errorMessage" class="admin-alert admin-alert--error">
        {{ errorMessage }}
        <button class="admin-alert__close" @click="clearMessages">✕</button>
      </div>

      <template v-if="empresaDetail">
        <section class="admin-kpi-grid">
          <article v-for="card in kpiCards" :key="card.key" class="admin-kpi-card">
            <div class="admin-kpi-card__top">
              <span class="admin-kpi-card__value" :class="card.valueClass">{{ card.value }}</span>
              <div class="admin-kpi-card__icon" :class="card.iconClass">
                <component :is="card.icon" class="kpi-icon" />
              </div>
            </div>
            <span class="admin-kpi-card__label">{{ card.label }}</span>
            <span class="admin-kpi-card__sub">{{ card.sub }}</span>
          </article>
        </section>

        <section class="admin-surface-card company-summary-card">
          <div class="company-summary-card__top">
            <div class="company-summary-card__identity">
              <div class="company-summary-card__avatar" aria-hidden="true">{{ companyInitial }}</div>

              <div class="company-summary-card__copy">
                <div class="company-summary-card__row">
                  <span class="company-summary-card__eyebrow">Vista operativa superadmin</span>
                  <span :class="statusClass(empresaDetail.estado)">{{ statusLabel[empresaDetail.estado] }}</span>
                </div>

                <h2 class="company-summary-card__title">{{ empresaDetail.nombre }}</h2>
                <p class="company-summary-card__subtitle">
                  {{ empresaDetail.nombre_comercial ?? empresaDetail.ruc_nit ?? 'Sin alias comercial registrado.' }}
                </p>
              </div>
            </div>

            <div class="company-summary-card__meta">
              <span class="company-chip">Plan: {{ empresaDetail.plan_saas ?? 'Sin plan' }}</span>
              <span class="company-chip">Moneda: {{ empresaDetail.moneda_iso ?? 'USD' }}</span>
            </div>
          </div>

          <div class="company-detail-grid">
            <article class="detail-panel">
              <h3 class="detail-panel__title">Identidad comercial</h3>
              <div class="detail-list">
                <div v-for="item in identityItems" :key="item.label" class="detail-list__item">
                  <component :is="item.icon" class="detail-list__icon" />
                  <div>
                    <span class="detail-list__label">{{ item.label }}</span>
                    <strong class="detail-list__value">{{ item.value }}</strong>
                  </div>
                </div>
              </div>
            </article>

            <article class="detail-panel">
              <h3 class="detail-panel__title">Contacto y alcance</h3>
              <div class="detail-list">
                <div v-for="item in contactItems" :key="item.label" class="detail-list__item">
                  <component :is="item.icon" class="detail-list__icon" />
                  <div>
                    <span class="detail-list__label">{{ item.label }}</span>
                    <strong class="detail-list__value">{{ item.value }}</strong>
                  </div>
                </div>
              </div>
            </article>

            <article class="detail-panel">
              <h3 class="detail-panel__title">Configuracion de pagos</h3>
              <div class="detail-metric-grid">
                <div v-for="item in paymentItems" :key="item.label" class="detail-metric-card">
                  <span class="detail-metric-card__label">{{ item.label }}</span>
                  <strong class="detail-metric-card__value">{{ item.value }}</strong>
                </div>
              </div>
            </article>

            <article class="detail-panel">
              <h3 class="detail-panel__title">Notas operativas</h3>
              <ul class="detail-notes">
                <li v-for="note in operationalNotes" :key="note">{{ note }}</li>
              </ul>
            </article>
          </div>
        </section>

        <section class="admin-surface-card ranges-card">
          <div class="admin-section-header">
            <div>
              <h3 class="admin-section-title">Rangos configurados</h3>
              <p class="admin-section-sub">Resumen comercial visible desde la vista V2.</p>
            </div>
          </div>

          <div v-if="empresaDetail.configuracion_rangos.length === 0" class="ranges-empty-state">
            No hay rangos configurados para esta empresa.
          </div>

          <div v-else class="ranges-table-wrap">
            <table class="ranges-table">
              <thead>
                <tr>
                  <th>Rango</th>
                  <th>Nivel</th>
                  <th>Comision</th>
                  <th>Kits credito</th>
                  <th>Directos max.</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rango in empresaDetail.configuracion_rangos" :key="rango.id">
                  <td>{{ rango.nombre_rango }}</td>
                  <td>{{ rango.nivel }}</td>
                  <td>{{ rango.porcentaje_comision_cascada }}%</td>
                  <td>{{ rango.limite_kits_credito }}</td>
                  <td>{{ rango.max_distribuidores_directos ?? 'Sin limite' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>

      <section v-else class="admin-surface-card company-loading-card" :aria-busy="isDetailLoading">
        <Building2 class="company-loading-card__icon" />
        <div>
          <h3 class="company-loading-card__title">Cargando detalle de empresa</h3>
          <p class="company-loading-card__copy">Estamos consultando la informacion operativa y la configuracion base del workspace.</p>
        </div>
      </section>

      <section v-if="empresaDetail" class="admin-surface-card empresa-workspace-v2__config">
        <div class="admin-section-header">
          <div>
            <h3 class="admin-section-title">Configuracion del workspace</h3>
            <p class="admin-section-sub">
              Perfil, fundador, cuentas bancarias y estructura comercial de esta empresa.
            </p>
          </div>
        </div>

        <ConfiguracionWorkspacePageV2
          surface="page"
          :show-header="false"
          :empresa-id="empresaId"
          context-label="Superadmin company control v2"
          title="Configuracion del workspace"
          subtitle="Ajusta perfil, marca, banca y red comercial sin salir del detalle."
        />
      </section>
    </section>
  </AppShell>
</template>

<style scoped>
.empresa-workspace-v2 {
  gap: 24px;
}

.empresa-workspace-v2__config {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.empresa-workspace-v2__config :deep(.config-v2-page) {
  width: 100%;
  max-width: none;
}

.empresa-workspace-v2__config :deep(.config-v2__header) {
  padding-top: 4px;
}

.kpi-icon,
.detail-list__icon,
.company-loading-card__icon {
  width: 18px;
  height: 18px;
}

.is-spinning {
  animation: spin 0.8s linear infinite;
}

.company-summary-card {
  display: grid;
  gap: 18px;
}

.company-summary-card__top {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.company-summary-card__identity {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.company-summary-card__avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #4ab8f5, #1a6ab5);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  flex-shrink: 0;
}

.company-summary-card__copy {
  min-width: 0;
}

.company-summary-card__row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.company-summary-card__eyebrow {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #5e7898;
}

.company-summary-card__title {
  margin: 6px 0 0;
  font-size: clamp(1.5rem, 2vw, 2rem);
  line-height: 1.08;
  color: #17314f;
}

.company-summary-card__subtitle {
  margin: 8px 0 0;
  color: #51657f;
  line-height: 1.5;
}

.company-summary-card__meta {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.company-chip,
.company-badge {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.company-chip {
  background: #f8fafc;
  border: 1px solid #dbe3ef;
  color: #475569;
}

.company-badge--active {
  background: #dbeafe;
  color: #1e40af;
}

.company-badge--config {
  background: #fef3c7;
  color: #b45309;
}

.company-badge--danger {
  background: #fee2e2;
  color: #991b1b;
}

.company-badge--neutral {
  background: #e2e8f0;
  color: #475569;
}

.company-detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detail-panel {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 16px;
  background: #fff;
}

.detail-panel__title {
  margin: 0 0 14px;
  font-size: 14px;
  font-weight: 700;
  color: #17314f;
}

.detail-list {
  display: grid;
  gap: 12px;
}

.detail-list__item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.detail-list__icon {
  margin-top: 2px;
  color: #1a6ab5;
  flex-shrink: 0;
}

.detail-list__label,
.detail-metric-card__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #60758d;
}

.detail-list__value,
.detail-metric-card__value {
  display: block;
  margin-top: 4px;
  color: #17314f;
  line-height: 1.45;
}

.detail-metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-metric-card {
  border-radius: 12px;
  padding: 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
}

.detail-notes {
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
  color: #51657f;
}

.ranges-empty-state {
  padding: 34px 18px;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
  text-align: center;
  color: #64748b;
  font-size: 13px;
}

.ranges-table-wrap {
  overflow-x: auto;
}

.ranges-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.ranges-table thead tr {
  background: #1d2a3d;
  color: #fff;
}

.ranges-table th,
.ranges-table td {
  padding: 11px 14px;
  text-align: left;
  white-space: nowrap;
}

.ranges-table tbody tr {
  border-bottom: 1px solid #edf2f7;
}

.ranges-table tbody tr:hover {
  background: #f8fafc;
}

.company-loading-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 110px;
}

.company-loading-card__icon {
  color: #1a6ab5;
}

.company-loading-card__title {
  margin: 0;
  color: #17314f;
  font-size: 16px;
}

.company-loading-card__copy {
  margin: 6px 0 0;
  color: #60758d;
  line-height: 1.5;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 980px) {
  .company-detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .company-summary-card__identity {
    width: 100%;
  }

  .detail-metric-grid {
    grid-template-columns: 1fr;
  }
}
</style>