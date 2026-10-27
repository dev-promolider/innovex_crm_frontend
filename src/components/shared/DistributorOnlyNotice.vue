<template>
  <div class="notice" role="status">
    <p class="notice__title">Esta sección es para distribuidores activos</p>
    <p class="notice__text">Tu cuenta no tiene acceso a esta sección. Si crees que es un error, contacta al administrador de tu empresa.</p>
    <RouterLink class="notice__link" :to="{ name: 'dashboard' }">Volver al inicio</RouterLink>
  </div>
</template>

<style scoped>
.notice { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; max-width: 520px; }
.notice__title { margin: 0 0 6px; font-size: 16px; font-weight: 700; color: #1a1a1a; }
.notice__text { margin: 0 0 12px; font-size: 13px; color: #6b7280; }
.notice__link { font-size: 13px; font-weight: 600; color: #2563eb; }
</style>
