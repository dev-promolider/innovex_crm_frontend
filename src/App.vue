<template>
  <div class="app-container">
    <main class="main-content">
      <RouterView />
    </main>

    <template v-if="route.name !== 'login'">
      <FooterBar />

      <a 
        href="https://wa.me/584242335885" 
        target="_blank" 
        rel="noopener noreferrer" 
        class="whatsapp-float"
        title="Contáctanos por WhatsApp"
      >
        <svg viewBox="0 0 448 512" width="32" height="32" fill="white">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.1-3.2-5.5-.3-8.5 2.5-11.2 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.5 5.5-9.2 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.7 23.5 9.2 31.6 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
      </a>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import FooterBar from './components/Footer/FooterBar.vue'

const route = useRoute()
</script>

<style>
/* Estilos Globales */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Inter', sans-serif;
  background-color: #f4f7fe; /* Color de fondo base del dashboard */
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1; /* Esto empuja el footer hacia abajo si el contenido es poco */
  width: 100%;
}

/* WhatsApp Flotante Estilo Pro (Solo Icono) */
.whatsapp-float {
  position: fixed;
  bottom: 100px; /* Ajustado para que esté por encima del footer */
  right: 30px;
  background-color: #25d366;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  z-index: 2000;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.whatsapp-float:hover {
  transform: scale(1.1) rotate(5deg);
  background-color: #20ba5a;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}

/* Animación sutil para el botón */
@keyframes pulse-wa {
  0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.6); }
  70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
  100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
}

.whatsapp-float {
  animation: pulse-wa 2s infinite;
}
</style>