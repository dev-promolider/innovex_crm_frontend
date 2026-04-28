<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { ArrowLeft, Building2, CircleDollarSign, Mail, Phone, Users } from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'
import AppShell from '@/components/layout/AppShell.vue'
import ConfiguracionWorkspacePage from '@/features/configuracion/components/ConfiguracionWorkspacePage.vue'
import { useEmpresasApi } from '@/features/empresas/composables/useEmpresasApi'

const route = useRoute()
const empresaId = computed(() => Number(route.params.empresaId))

const {
  empresaDetail,
  isDetailLoading,
  fetchEmpresaDetail,
} = useEmpresasApi()

const statusTone = computed(() => {
  switch (empresaDetail.value?.estado) {
    case 'activa':
      return 'empresa-detail__badge--success'
    case 'suspendida':
      return 'empresa-detail__badge--danger'
    case 'configuracion':
      return 'empresa-detail__badge--warning'
    default:
      return 'empresa-detail__badge--neutral'
  }
})

const companyInitial = computed(() => empresaDetail.value?.nombre?.slice(0, 1).toUpperCase() ?? 'E')

const detailFacts = computed(() => {
  if (!empresaDetail.value) {
    return []
  }

  return [
    {
      key: 'moneda',
      label: 'Moneda',
      value: empresaDetail.value.moneda_iso ?? 'Sin definir',
      icon: CircleDollarSign,
    },
    {
      key: 'miembros',
      label: 'Miembros activos',
      value: String(empresaDetail.value.membresias_activas_count),
      icon: Users,
    },
    {
      key: 'correo',
      label: 'Correo',
      value: empresaDetail.value.email_contacto ?? 'Sin correo',
      icon: Mail,
    },
    {
      key: 'telefono',
      label: 'Telefono',
      value: empresaDetail.value.telefono_contacto ?? 'Sin telefono',
      icon: Phone,
    },
  ]
})

const loadEmpresaDetail = async () => {
  if (!Number.isFinite(empresaId.value) || empresaId.value <= 0) {
    return
  }

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
      <span class="breadcrumb">Superadmin · <strong>Detalle y Configuracion de Empresa</strong></span>
    </template>

    <section class="empresa-detail">
      <header class="empresa-detail__hero">
        <div class="empresa-detail__hero-main">
          <RouterLink class="empresa-detail__backlink" :to="{ name: 'empresas' }">
            <ArrowLeft class="size-4" aria-hidden="true" />
            Volver a empresas
          </RouterLink>

          <div class="empresa-detail__identity">
            <div class="empresa-detail__avatar" aria-hidden="true">
              {{ companyInitial }}
            </div>

            <div class="empresa-detail__title-block">
              <div class="empresa-detail__title-row">
                <p class="empresa-detail__eyebrow">Superadmin company control</p>
                <span class="empresa-detail__badge" :class="statusTone">
                  {{ empresaDetail?.estado ?? 'cargando' }}
                </span>
              </div>

              <h1 class="empresa-detail__title">
                {{ empresaDetail?.nombre ?? 'Cargando empresa...' }}
              </h1>

              <p class="empresa-detail__subtitle">
                {{ empresaDetail?.nombre_comercial || 'Vista compacta para configurar perfil, marca, banca y estructura comercial desde superadmin.' }}
              </p>
            </div>
          </div>
        </div>

        <div class="empresa-detail__facts" :aria-busy="isDetailLoading">
          <article v-for="fact in detailFacts" :key="fact.key" class="empresa-detail__fact-card">
            <component :is="fact.icon" class="empresa-detail__fact-icon" aria-hidden="true" />
            <div>
              <span class="empresa-detail__fact-label">{{ fact.label }}</span>
              <strong class="empresa-detail__fact-value">{{ fact.value }}</strong>
            </div>
          </article>

          <article v-if="!detailFacts.length" class="empresa-detail__fact-card empresa-detail__fact-card--loading">
            <Building2 class="empresa-detail__fact-icon" aria-hidden="true" />
            <div>
              <span class="empresa-detail__fact-label">Resumen</span>
              <strong class="empresa-detail__fact-value">Cargando informacion de empresa...</strong>
            </div>
          </article>
        </div>
      </header>

      <ConfiguracionWorkspacePage
        :empresa-id="empresaId"
        context-label="Superadmin company control"
        title="Detalle operativo y configuracion"
        subtitle="Ajusta la estructura esencial del workspace desde una vista mas compacta y operativa."
        compact
      />
    </section>
  </AppShell>
</template>

<style scoped>
.empresa-detail {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 20px 24px 28px;
}

.empresa-detail__hero {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 16px;
  padding: 18px;
  border-radius: 26px;
  border: 1px solid rgba(26, 43, 71, 0.08);
  background:
    radial-gradient(circle at top left, rgba(201, 223, 255, 0.55), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.94), rgba(247, 250, 255, 0.92));
  box-shadow: 0 18px 40px rgba(30, 48, 82, 0.08);
}

.empresa-detail__hero-main {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.empresa-detail__backlink {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  color: #41526d;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
}

.empresa-detail__backlink:focus-visible {
  outline: 2px solid #2c6bed;
  outline-offset: 4px;
  border-radius: 999px;
}

.empresa-detail__identity {
  display: flex;
  gap: 14px;
  align-items: flex-start;
}

.empresa-detail__avatar {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: linear-gradient(135deg, #16335f, #376fc8);
  color: #fff;
  font-size: 1.15rem;
  font-weight: 800;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22);
}

.empresa-detail__title-block {
  min-width: 0;
}

.empresa-detail__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.empresa-detail__eyebrow {
  color: #8c5f2c;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.empresa-detail__badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: capitalize;
}

.empresa-detail__badge--success {
  background: rgba(226, 247, 232, 0.98);
  color: #1b6b39;
}

.empresa-detail__badge--warning {
  background: rgba(255, 243, 224, 0.98);
  color: #995d0f;
}

.empresa-detail__badge--danger {
  background: rgba(253, 234, 234, 0.98);
  color: #983737;
}

.empresa-detail__badge--neutral {
  background: rgba(233, 238, 246, 0.98);
  color: #42526d;
}

.empresa-detail__title {
  margin-top: 6px;
  color: #162033;
  font-size: clamp(1.55rem, 2.2vw, 2.1rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.empresa-detail__subtitle {
  margin-top: 8px;
  max-width: 64ch;
  color: #5e6d83;
  font-size: 0.94rem;
  line-height: 1.55;
}

.empresa-detail__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.empresa-detail__fact-card {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-height: 88px;
  padding: 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(26, 43, 71, 0.08);
}

.empresa-detail__fact-card--loading {
  grid-column: 1 / -1;
}

.empresa-detail__fact-icon {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  color: #376fc8;
  margin-top: 1px;
}

.empresa-detail__fact-label {
  display: block;
  color: #73839a;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.empresa-detail__fact-value {
  display: block;
  margin-top: 6px;
  color: #162033;
  font-size: 0.9rem;
  line-height: 1.4;
  word-break: break-word;
}

@media (max-width: 1080px) {
  .empresa-detail__hero {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .empresa-detail {
    padding: 16px 16px 24px;
    gap: 14px;
  }

  .empresa-detail__hero {
    padding: 14px;
    border-radius: 22px;
  }

  .empresa-detail__identity {
    align-items: flex-start;
  }

  .empresa-detail__facts {
    grid-template-columns: 1fr;
  }

  .empresa-detail__title {
    font-size: 1.5rem;
  }
}
</style>