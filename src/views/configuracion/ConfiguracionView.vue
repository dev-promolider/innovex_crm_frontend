<script setup lang="ts">
import { computed } from 'vue'
import AppShell from '@/components/layout/AppShell.vue'
import { useAuthenticatedSession } from '@/composables/useAuthenticatedSession'
import ConfiguracionWorkspacePageV2 from '@/features/configuracion/components/ConfiguracionWorkspacePageV2.vue'

const { empresaId, isSuperadmin } = useAuthenticatedSession()

const resolvedEmpresaId = computed(() => {
  if (!isSuperadmin.value) {
    return undefined
  }

  const parsedEmpresaId = Number(empresaId)

  return Number.isFinite(parsedEmpresaId) && parsedEmpresaId > 0
    ? parsedEmpresaId
    : undefined
})

</script>

<template>
  <AppShell :show-search="false">
    <template #breadcrumb>
      <span class="breadcrumb">Inicio · <strong>Configuracion del Workspace</strong></span>
    </template>

    <div class="config-view">
      <ConfiguracionWorkspacePageV2
        surface="page"
        :empresa-id="resolvedEmpresaId"
        context-label="Workspace control v2"
        title="Configuracion del workspace"
        subtitle="Parametros del workspace activo: perfil, banca, red comercial y politicas de pago."
      />
    </div>
  </AppShell>
</template>

<style scoped>
.config-view {
  width: 100%;
  padding: 24px 28px 32px;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .config-view {
    padding: 14px 14px 24px;
  }
}
</style>