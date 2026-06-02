<script setup lang="ts">
</script>

<template>
  <div class="privacy-page">
    <section class="privacy-hero">
      <div class="privacy-container">
        <span class="privacy-kicker">Privacidad</span>
        <h1 class="privacy-title">Privacidad del usuario</h1>
        <p class="privacy-lead">
          Esta pagina explica, de forma general, como protegemos la informacion de los usuarios
          y como se usa dentro de la plataforma Innovex.
        </p>
      </div>
    </section>

    <section class="privacy-body">
      <div class="privacy-container privacy-grid">
        <article class="privacy-card">
          <h2 class="privacy-section-title">Resumen</h2>
          <p class="privacy-text">
            Solo solicitamos los datos necesarios para operar el servicio. La informacion se usa
            para autenticacion, gestion de sesiones y soporte operativo del sistema.
          </p>
        </article>

        <article class="privacy-card">
          <h2 class="privacy-section-title">Datos que recopilamos</h2>
          <ul class="privacy-list">
            <li>Datos de cuenta: nombre, correo y credenciales de acceso.</li>
            <li>Informacion de actividad: acciones realizadas dentro del panel.</li>
            <li>Datos tecnicos: dispositivo, navegador y registros de seguridad.</li>
          </ul>
        </article>

        <article class="privacy-card">
          <h2 class="privacy-section-title">Uso de la informacion</h2>
          <ul class="privacy-list">
            <li>Operar y mejorar la experiencia del servicio.</li>
            <li>Garantizar seguridad, auditoria y cumplimiento.</li>
            <li>Atender solicitudes de soporte cuando el usuario lo requiera.</li>
          </ul>
        </article>

        <article class="privacy-card">
          <h2 class="privacy-section-title">Seguridad</h2>
          <p class="privacy-text">
            Aplicamos controles tecnicos y organizativos para proteger la informacion. El acceso
            esta restringido a personal autorizado y se monitorean eventos de seguridad.
          </p>
        </article>

        <article class="privacy-card">
          <h2 class="privacy-section-title">Derechos del usuario</h2>
          <p class="privacy-text">
            Los usuarios pueden solicitar actualizacion o eliminacion de datos segun las politicas
            vigentes. Para cualquier solicitud, use el canal de soporte oficial.
          </p>
        </article>

        <article class="privacy-card">
          <h2 class="privacy-section-title">Contacto</h2>
          <p class="privacy-text">
            Si tienes preguntas sobre privacidad, escribe a
            <a class="privacy-link" href="mailto:soporte@innovex.com">soporte@innovex.com</a>.
          </p>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.privacy-page {
  min-height: 100vh;
  background: radial-gradient(circle at top, rgba(34, 99, 229, 0.08), transparent 55%),
    linear-gradient(180deg, #f6f8fb 0%, #eef3f8 100%);
}

.privacy-hero {
  padding: 72px 16px 40px;
}

.privacy-container {
  max-width: 980px;
  margin: 0 auto;
}

.privacy-kicker {
  display: inline-flex;
  align-items: center;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(34, 99, 229, 0.12);
  color: #1646b8;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.privacy-title {
  margin-top: 16px;
  font-size: clamp(2rem, 2.6vw, 2.8rem);
  color: #0f1c3b;
}

.privacy-lead {
  margin-top: 12px;
  font-size: 1.05rem;
  color: #3b4663;
  line-height: 1.6;
  max-width: 760px;
}

.privacy-body {
  padding: 24px 16px 80px;
}

.privacy-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.privacy-card {
  background: #ffffff;
  border-radius: 16px;
  padding: 22px;
  border: 1px solid rgba(15, 28, 59, 0.08);
  box-shadow: 0 16px 35px rgba(15, 28, 59, 0.08);
}

.privacy-section-title {
  font-size: 1.1rem;
  color: #0f1c3b;
  margin-bottom: 10px;
}

.privacy-text {
  color: #3b4663;
  line-height: 1.6;
  font-size: 0.98rem;
}

.privacy-list {
  margin: 0;
  padding-left: 18px;
  color: #3b4663;
  line-height: 1.6;
  font-size: 0.98rem;
}

.privacy-link {
  color: #1646b8;
  text-decoration: none;
  font-weight: 600;
}

.privacy-link:hover {
  text-decoration: underline;
}

@media (max-width: 640px) {
  .privacy-hero {
    padding-top: 56px;
  }

  .privacy-card {
    padding: 18px;
  }
}
</style>
