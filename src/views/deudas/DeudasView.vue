<script setup lang="ts">
import AppShell from '../../components/layout/AppShell.vue'
import DeudasPage from '../../features/deudas/components/DeudasPage.vue'
</script>

<template>
  <AppShell>
    <template #breadcrumb>
      <span class="breadcrumb">Inicio › <strong>Deudas</strong></span>
    </template>

    <DeudasPage />
  </AppShell>
</template>

<style scoped>
.breadcrumb {
  color: #64748b;
  font-size: 13px;
}

.breadcrumb strong {
  color: #162033;
}
</style>