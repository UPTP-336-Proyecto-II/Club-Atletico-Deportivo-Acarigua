<template>
  <div class="landing-container">
    <!-- NavBar Component -->
    <NavBar/>

    <!-- Banner Component -->
    <Banner/>

    <!-- Secciones de contenido -->
    <main class="main-content">
      <!-- Sección Nosotros -->
      <section id="nosotros" class="content-section">
        <div class="section-content">
          <div class="section-header">
            <h2>Nuestra Historia</h2>
            <p class="section-subtitle">De movimiento social a escuela de formación deportiva</p>
          </div>

          <div class="about-grid">
            <div class="about-card">
              <div class="card-icon">⛪</div>
              <h3>Nuestros Inicios</h3>
              <p>Fundado en junio 2019 como "Movimiento de Atletas Cristianos" por el Prof. Carlos Pérez, iniciando como proyecto social para alejar a los jóvenes de los vicios y la delincuencia durante la pandemia.</p>
            </div>

            <div class="about-card">
              <div class="card-icon">🏛️</div>
              <h3>Evolución Institucional</h3>
              <p>El 19/09/2021 se convierte en Club Atlético Deportivo Acarigua, registrándose legalmente el 15/11/2022. Hoy contamos con junta directiva, consejo de honor y asamblea de padres.</p>
            </div>

            <div class="about-card">
              <div class="card-icon">🎯</div>
              <h3>Misión</h3>
              <p>Formar atletas profesionales altamente capacitados física, motriz y cognitivamente, con principios cristianos que gerencien su desarrollo humanístico para la excelencia deportiva.</p>
            </div>

            <div class="about-card">
              <div class="card-icon">👁️</div>
              <h3>Visión</h3>
              <p>Ser una institución modelo de impacto social, constituida con fundamentos cristianos, inspirando a atletas en su desarrollo integral y validando su potencial deportivo.</p>
            </div>

            <div class="about-card">
              <div class="card-icon">🤝</div>
              <h3>Alianzas</h3>
              <p>Trabajamos en convenio con la U.P.T.P Juan de Jesús Montilla, utilizando sus instalaciones deportivas y desarrollando proyectos de mejoras continuas para beneficio de la comunidad.</p>
            </div>

            <div class="about-card">
              <div class="card-icon">📊</div>
              <h3>Impacto Social</h3>
              <p>Capacitamos mensualmente a más de 250 personas entre niños, adolescentes y adultos, fortaleciendo el núcleo familiar y desarrollando el potencial deportivo del municipio Páez.</p>
            </div>
          </div>

          <div class="stats-section">
            <div class="stat-item">
              <div class="stat-number">250+</div>
              <div class="stat-label">Personas Beneficiadas</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">2019</div>
              <div class="stat-label">Año de Fundación</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">60</div>
              <div class="stat-label">Miembros Iniciales</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Sección Contacto -->
      <section id="contacto" class="content-section contact-section">
        <div class="section-content">
          <h2>Contacto</h2>
          <div class="contact-grid">
            <div class="contact-info">
              <div class="contact-item">
                <i class="el-icon-location"></i>
                <div>
                  <h4>Ubicación</h4>
                  <p>U.P.T.P Juan de Jesús Montilla<br>Acarigua, Estado Portuguesa</p>
                </div>
              </div>
              <div class="contact-item">
                <i class="el-icon-message"></i>
                <div>
                  <h4>Email</h4>
                  <p>Clubatleticodeportivoacarigua@gmail.com</p>
                </div>
              </div>
              <div class="contact-item">
                <i class="el-icon-picture-outline"></i>
                <div>
                  <h4>Instagram</h4>
                  <p>@Deportivoacarigua_oficial</p>
                </div>
              </div>
            </div>
            
            <div class="contact-directiva">
              <h3>Directiva</h3>
              <div class="directiva-list">
                <div class="directiva-item">
                  <strong>Presidente:</strong>
                  <span>0412-1556442</span>
                </div>
                <div class="directiva-item">
                  <strong>Vicepresidente:</strong>
                  <span>0424-5832335</span>
                </div>
                <div class="directiva-item">
                  <strong>Secretaria:</strong>
                  <span>0412-2623177</span>
                </div>
                <div class="directiva-item">
                  <strong>Tesorero:</strong>
                  <span>+57 312-4157710</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer Component -->
    <Footer/>
  </div>
</template>

<script>
import NavBar from '@/components/Landing/NavBar.vue';
import Banner from '@/components/Landing/Banner.vue';
import Footer from '@/components/Landing/Footer.vue';

export default {
  name: 'LandingPage',
  components: {
    NavBar,
    Banner,
    Footer
  }
}
</script>

<style scoped>
.landing-container {
  min-height: 100vh;
}

.main-content {
  min-height: 100vh;
}

.content-section {
  padding: 5rem 2rem;
  max-width: 1200px;
  margin: 0 auto 3rem;
  border-radius: 10px;
}

.content-section:nth-child(even) {
  background: #f8f9fa;
}

.section-content {
  text-align: center;
}

.section-header {
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: var(--color-text-dark);
  font-weight: 700;
}

.section-subtitle {
  font-size: 1.2rem;
  color: var(--color-text-light);
  max-width: 600px;
  margin: 0 auto;
}

/* Estilos para la sección Nosotros */
.about-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.about-card {
  background: var(--color-background);
  padding: 2.5rem 2rem;
  border: 1px solid var(--color-text-light);
  border-radius: 10px;
  text-align: center;
  transition: all 0.3s ease;
}

.about-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border-color: var(--color-primary);
}

.card-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.about-card h3 {
  color: var(--color-primary);
  font-size: 1.3rem;
  margin-bottom: 1rem;
  font-weight: 600;
}

.about-card p {
  color: var(--color-text-dark);
  line-height: 1.7;
  opacity: 0.8;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  text-align: center;
  padding: 3rem 0;
  border-top: 1px solid var(--color-text-light);
}

.stat-item {
  padding: 1rem;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--color-text-dark);
  font-weight: 500;
  opacity: 0.8;
}

/* Estilos para la sección Contacto */
.contact-section {
  background: var(--color-text-dark) !important;
  color: var(--color-background);
}

.contact-section h2 {
  color: var(--color-background);
  margin-bottom: 3rem;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  text-align: left;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.contact-item i {
  color: var(--color-primary);
  font-size: 1.5rem;
  margin-top: 0.25rem;
}

.contact-item h4 {
  color: var(--color-primary);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.contact-item p {
  color: var(--color-text-light);
  margin: 0;
  line-height: 1.5;
}

.contact-directiva h3 {
  color: var(--color-primary);
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
}

.directiva-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.directiva-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.directiva-item strong {
  color: var(--color-background);
}

.directiva-item span {
  color: var(--color-text-light);
}

/* Responsive */
@media (max-width: 768px) {
  .content-section {
    padding: 3rem 1rem;
  }

  .section-header h2 {
    font-size: 2rem;
  }

  .about-grid {
    grid-template-columns: 1fr;
  }

  .about-card {
    padding: 2rem 1.5rem;
  }

  .stats-section {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
  }

  .stat-number {
    font-size: 2rem;
  }

  .contact-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .directiva-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .section-header h2 {
    font-size: 1.8rem;
  }

  .about-grid {
    grid-template-columns: 1fr;
  }
}
</style>