<script setup lang="ts">
import AppShell from '@/components/layout/AppShell.vue'
import UsuariosPage from '@/features/usuarios/components/UsuariosPage.vue'
</script>

<template>
  <AppShell :show-search="false">
    <template #breadcrumb>
      <span class="breadcrumb">Inicio · <strong>Administracion de Usuarios</strong></span>
    </template>

    <UsuariosPage />
  </AppShell>
</template>