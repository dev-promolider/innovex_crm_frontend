<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import ApprovalsPage from '@/features/aprobaciones/components/ApprovalsPage.vue'
</script>

<template>
  <AppShell :show-search="false">
    <template #breadcrumb>
      <span class="breadcrumb">Inicio · <strong>Aprobaciones de Membresia</strong></span>
    </template>

    <ApprovalsPage />
  </AppShell>
</template>
