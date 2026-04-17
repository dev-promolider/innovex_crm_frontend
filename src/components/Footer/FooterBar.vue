<template>
  <footer class="footer-bar">
    <div class="footer-container">
      
      <div class="footer-left">
        <div class="address-wrapper">
          <span class="geo-icon">  </span>
          <span class="address-text">Centro Empresarial Don Bosco, PH F. Los Cortijos. Caracas</span>
        </div>
      </div>

      <div class="footer-right">
        
        <div class="social-block">
          <span class="social-label">CONÉCTATE</span>
          <div class="social-icons">
            <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" class="social-item fb" title="Facebook">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" class="social-item ig" title="Instagram">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="https://www.tiktok.com/" target="_blank" rel="noopener noreferrer" class="social-item tk" title="TikTok">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/></svg>
            </a>
          </div>
        </div>

        <div class="copyright-section">
          <p class="copyright-text">© {{ anio }} INNOVEX. Todos los derechos reservados.</p>
        </div>

      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
const anio = new Date().getFullYear()
</script>

<style scoped>
.footer-bar {
  background-color: #0d1624;
  border-top: 1px solid #1e293b;
  padding: 20px 40px;
  /* El margin-left debe coincidir con el ancho de tu sidebar */
  margin-left: 200px; 
  width: calc(100% - 200px);
  box-sizing: border-box;
}

.footer-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ESTILO DIRECCIÓN */
.address-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.geo-icon {
  font-size: 18px;
}

.address-text {
  font-size: 14px;
  color: #f1f5f9; /* Color claro para que sea legible */
  font-weight: 500;
}

/* ESTILO BLOQUE DERECHO */
.footer-right {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra redes y copyright entre sí */
  gap: 12px;
}

.social-block {
  display: flex;
  flex-direction: column;
  align-items: center; /* Centra la palabra CONÉCTATE sobre los iconos */
  gap: 8px;
}

.social-label {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 2px;
}

.social-icons {
  display: flex;
  gap: 15px;
}

.social-item {
  width: 42px; /* Tamaño grande para que se visualicen bien */
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.social-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.4);
}

.fb { background-color: #1877f2; }
.ig { background: linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); }
.tk { background-color: #000000; border: 1px solid #334155; }

/* COPYRIGHT */
.copyright-text {
  font-size: 11px;
  color: #64748b;
  margin: 0;
  text-align: center;
}

/* Responsivo para pantallas pequeñas */
@media (max-width: 1024px) {
  .footer-bar {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }
  .footer-container {
    flex-direction: column;
    gap: 20px;
    text-align: center;
  }
  .footer-right {
    align-items: center;
  }
}
</style>