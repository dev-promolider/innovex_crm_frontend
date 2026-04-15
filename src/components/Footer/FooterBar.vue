<template>
  <footer class="footer-bar">
    <div class="footer-content">

      <!-- Dirección -->
      <div class="footer-section">
        <div class="footer-icon-row">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>Centro Empresarial Don Bosco, PH F. Los Cortijos. Caracas</span>
        </div>
      </div>

      <!-- Redes Sociales -->
      <div class="footer-section footer-center">
        <span class="footer-label">Síguenos</span>
        <div class="social-row">

          <!-- Facebook -->
          <a href="https://facebook.com" target="_blank" class="social-btn facebook" title="Facebook">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
            </svg>
          </a>

          <!-- Instagram -->
          <a href="https://instagram.com" target="_blank" class="social-btn instagram" title="Instagram">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
            </svg>
          </a>

          <!-- TikTok -->
          <a href="https://tiktok.com" target="_blank" class="social-btn tiktok" title="TikTok">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z"/>
            </svg>
          </a>
        </div>
      </div>

      <!-- Copyright -->
      <div class="footer-section footer-right">
        <span class="footer-copy">© {{ anio }} INNOVEX. Todos los derechos reservados.</span>
      </div>

    </div>
  </footer>
</template>

<script setup lang="ts">
const anio = new Date().getFullYear()
</script>

<style scoped>
.footer-bar {
  background: #0f1b2d;
  border-top: 1px solid #1a2d45;
  padding: 14px 28px;
  margin-left: 200px;
  position: relative;
  z-index: 10;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.footer-center {
  align-items: center;
}

.footer-right {
  align-items: flex-end;
}

.footer-icon-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #7eb8e8;
}

.footer-link {
  color: #4ab8f5;
  text-decoration: none;
  font-size: 12px;
}

.footer-link:hover {
  text-decoration: underline;
}

.footer-label {
  font-size: 11px;
  font-weight: 700;
  color: #4a6080;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.social-row {
  display: flex;
  gap: 10px;
}

.social-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: transform 0.2s, opacity 0.2s;
}

.social-btn:hover {
  transform: scale(1.15);
  opacity: 0.9;
}

.facebook  { background: #1877f2; color: white; }
.instagram { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); color: white; }
.tiktok    { background: #010101; color: white; }

.footer-copy {
  font-size: 11px;
  color: #4a6080;
}
</style>