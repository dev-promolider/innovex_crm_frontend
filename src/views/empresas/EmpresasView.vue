<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import EmpresasPage from '@/features/empresas/components/EmpresasPage.vue'
</script>

<template>
  <AppShell :show-search="false">
    <template #breadcrumb>
      <span class="breadcrumb">Inicio · <strong>Gestion de Empresas</strong></span>
    </template>

    <EmpresasPage />
  </AppShell>
</template>