<template>
  <footer class="footer">
    <div class="footer-content">
      <!-- Sección Principal -->
      <div class="footer-main">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="../../assets/icons/logo.png" class="logo-icon">
            <div class="logo-text">
              <span class="club-name">Club Atlético</span>
              <span class="club-subname">Deportivo Acarigua</span>
            </div>
          </div>
          <p class="footer-description">
            "La Armadura de Dios"<br>
            Asociación Civil - RIF: J-503114630<br>
            Afiliada a la Asociación de Fútbol de Portuguesa
          </p>
          <div class="social-links">
            <a href="mailto:clubatleticodeportivoacarigua@gmail.com" class="social-link" aria-label="Email">
              <img src="../../assets/icons/email-icon.png" alt="Email" class="custom-icon">
            </a>
            <a href="https://www.facebook.com/profile.php?id=100086449924024" class="social-link" aria-label="Facebook" target="_blank" rel="noopener">
              <img src="../../assets/icons/facebook-icon.png" alt="Facebook" class="custom-icon">
            </a>
            <a href="https://instagram.com/Deportivoacarigua_oficial" class="social-link" aria-label="Instagram" target="_blank" rel="noopener">
              <img src="../../assets/icons/instagram-icon.png" alt="Instagram" class="custom-icon">
            </a>
            <a href="https://www.google.com/maps/place/Universidad+Polit%C3%A9cnica+Territorial+de+Puerto+Cabello/@10.4578943,-68.0537897,17z/data=!4m6!3m5!1s0x8e8054018566d7a3:0x70a7d25b77dc46ff!8m2!3d10.4577097!4d-68.0527812!16s%2Fg%2F1hc63v0bq?entry=ttu&g_ep=EgoyMDI1MTExMi4wIKXMDSoASAFQAw%3D%3D" 
              class="social-link" 
              aria-label="Google Maps" 
              target="_blank" 
              rel="noopener">
              <img src="../../assets/icons/maps-icon.png" alt="Google Maps" class="custom-icon">
            </a>
          </div>
        </div>

        <!-- Enlaces Rápidos -->
        <div class="footer-links">
          <div class="link-group">
            <h3 class="link-group-title">Enlaces</h3>
            <ul class="link-list">
              <li><a href="#inicio" class="footer-link">Inicio</a></li>
              <li><a href="#nosotros" class="footer-link">Nosotros</a></li>
              <li><a href="#contacto" class="footer-link">Contacto</a></li>
            </ul>
          </div>

          <div class="link-group">
            <h3 class="link-group-title">Contacto</h3>
            <ul class="link-list">
              <li class="contact-item">
                <img src="../../assets/icons/maps-icon.png" alt="Ubicación" class="contact-icon">
                <span>U.P.T.P Juan de Jesús Montilla<br>Acarigua, Portuguesa</span>
              </li>
              <li class="contact-item">
                <img src="../../assets/icons/whatsapp-icon.png" alt="Whatsapp" class="contact-icon">
                <span>+58 255-123-4567</span>
              </li>
              <li class="contact-item">
                <img src="../../assets/icons/email-icon.png" alt="Email" class="contact-icon">
                <span>Clubatleticodeportivoacarigua@gmail.com</span>
              </li>
              <li class="contact-item">
                <img src="../../assets/icons/facebook-icon.png" alt="Facebook" class="contact-icon">
                <span>Club Atlético Deportivo Acarigua</span>
              </li>
              <li class="contact-item">
                <img src="../../assets/icons/instagram-icon.png" alt="Instagram" class="contact-icon">
                <span>@Deportivoacarigua_oficial</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Línea Separadora -->
      <div class="footer-divider"></div>

      <!-- Pie Inferior -->
      <div class="footer-bottom">
        <div class="footer-copyright">
          <p>&copy; 2024 Club Atlético Deportivo Acarigua. Todos los derechos reservados.</p>
          <p class="legal-info">Inscrito en el Ministerio del Poder Popular del Deporte</p>
        </div>

        <div class="footer-legal">
          <a href="#privacidad" class="legal-link">Política de Privacidad</a>
          <a href="#terminos" class="legal-link">Términos de Servicio</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'LandingFooter'
}
</script>

<style scoped>
.footer {
  background: var(--color-text-dark);
  color: var(--color-background);
  padding: 3rem 0 2rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Sección Principal */
.footer-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  margin-bottom: 2rem;
}

/* Brand Section */
.footer-brand {
  max-width: 300px;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.footer-logo .logo-icon {
  height: 50px;
  width: auto;
}

.footer-logo .logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.footer-logo .club-name {
  font-size: 1.2rem;
  font-weight: 700;
}

.footer-logo .club-subname {
  font-size: 0.9rem;
  font-weight: 500;
  opacity: 0.9;
}

.footer-description {
  line-height: 1.6;
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.social-link:hover {
  background: var(--color-primary);
  transform: translateY(-2px);
}

.custom-icon {
  width: 40px;
  height: 40px;
  object-fit: contain;
  filter: brightness(0) invert(1);
  transition: all 0.3s ease;
}

.social-link:hover .custom-icon {
  filter: brightness(0) invert(1);
}

/* Links Section */
.footer-links {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.link-group-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--color-primary);
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.link-list li {
  margin-bottom: 0.75rem;
}

.footer-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-link:hover {
  color: var(--color-primary);
}

.contact-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.contact-icon {
  width: 18px;
  height: 18px;
  object-fit: contain;
  margin-top: 0.2rem;
  flex-shrink: 0;
  filter: brightness(0) invert(1);
  opacity: 0.8;
  transition: all 0.3s ease;
}

.contact-item span {
  margin-top: 0.2rem;
}

.contact-item:hover .contact-icon {
  opacity: 1;
  filter: brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(320deg);
}

/* Footer Bottom */
.footer-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.2);
  margin: 2rem 0;
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.footer-copyright {
  opacity: 0.7;
  font-size: 0.9rem;
}

.legal-info {
  font-size: 0.8rem;
  opacity: 0.6;
  margin-top: 0.5rem;
}

.footer-legal {
  display: flex;
  gap: 2rem;
}

.legal-link {
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.legal-link:hover {
  color: var(--color-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .footer-content {
    padding: 0 1rem;
  }

  .footer-main {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .footer-brand {
    max-width: 100%;
    text-align: center;
  }

  .footer-logo {
    justify-content: center;
  }

  .social-links {
    justify-content: center;
    gap: 0.75rem;
  }

  .social-link {
    width: 35px;
    height: 35px;
  }

  .custom-icon {
    width: 18px;
    height: 18px;
  }

  .footer-links {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .contact-item {
    gap: 0.75rem;
  }

  .contact-icon {
    width: 16px;
    height: 16px;
  }

  .footer-bottom {
    flex-direction: column;
    text-align: center;
  }

  .footer-legal {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .footer {
    padding: 2rem 0 1.5rem;
  }

  .footer-logo .logo-text {
    display: none;
  }

  .social-links {
    gap: 0.5rem;
  }

  .social-link {
    width: 32px;
    height: 32px;
  }

  .custom-icon {
    width: 16px;
    height: 16px;
  }

  .contact-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
    text-align: left;
  }

  .contact-icon {
    margin-top: 0;
  }
}

@media (max-width: 360px) {
  .footer-content {
    padding: 0 0.75rem;
  }

  .social-links {
    flex-wrap: wrap;
    justify-content: center;
  }

  .link-group-title {
    font-size: 1rem;
  }

  .footer-link,
  .contact-item span {
    font-size: 0.85rem;
  }
}
</style>