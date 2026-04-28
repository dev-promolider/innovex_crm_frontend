<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import ConfiguracionWorkspacePage from '@/features/configuracion/components/ConfiguracionWorkspacePage.vue'
</script>

<template>
  <AppShell :show-search="false">
    <template #breadcrumb>
      <span class="breadcrumb">Inicio · <strong>Configuracion del Workspace</strong></span>
    </template>

    <ConfiguracionWorkspacePage />
  </AppShell>
</template>