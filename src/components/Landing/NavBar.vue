<template>
  <div class="navbar">
    <div class="navbar-container">
      <!-- Logo -->
      <div class="navbar-brand">
        <div class="logo">
          <img src="../../assets/icons/logo.png" class="logo-icon">
          <div class="logo-text">
            <span class="club-name">Club Atlético</span>
            <span class="club-subname">Deportivo Acarigua</span>
          </div>
        </div>
      </div>

      <!-- Menú de navegación -->
      <div class="navbar-menu">
        <nav class="nav-links">
          <a href="#inicio" class="nav-link">Inicio</a>
          <a href="#nosotros" class="nav-link">Nosotros</a>
          <a href="#contacto" class="nav-link">Contacto</a>
        </nav>
      </div>

      <!-- Botón de acción -->
      <div class="navbar-actions">
        <el-button class="login-btn" @click="goToLogin">Acceder</el-button>

        <!-- Menú móvil -->
        <div class="mobile-menu" @click="toggleMobileMenu">
          <i class="el-icon-menu"></i>
        </div>
      </div>
    </div>

    <!-- Menú móvil desplegable -->
    <div v-show="mobileMenuOpen" class="mobile-nav">
      <a href="#inicio" class="mobile-nav-link" @click="closeMobileMenu">Inicio</a>
      <a href="#nosotros" class="mobile-nav-link" @click="closeMobileMenu">Nosotros</a>
      <a href="#contacto" class="mobile-nav-link" @click="closeMobileMenu">Contacto</a>
      <div class="mobile-actions">
        <el-button class="mobile-login-btn" @click="goToLogin">Acceder</el-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LandingNavBar',
  data() {
    return {
      mobileMenuOpen: false
    }
  },
  methods: {
    goToLogin() {
      this.$router.push('/login')
    },
    toggleMobileMenu() {
      this.mobileMenuOpen = !this.mobileMenuOpen
    },
    closeMobileMenu() {
      this.mobileMenuOpen = false
    }
  },
  mounted() {
    window.addEventListener('resize', this.closeMobileMenu)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.closeMobileMenu)
  }
}
</script>

<style scoped>
.navbar {
  background: var(--color-background);
  border-bottom: 1px solid var(--color-text-light);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  padding: 1rem 0;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

/* Logo y marca */
.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.logo-icon {
  height: 50px;
  width: auto;
}

.logo-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.club-name {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-text-dark);
}

.club-subname {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--color-text-dark);
  opacity: 0.8;
}

/* Menú de navegación */
.navbar-menu {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  color: var(--color-text-dark);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  transition: color 0.3s ease;
  position: relative;
}

.nav-link:hover {
  color: var(--color-primary);
}

.nav-link::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--color-primary);
  transition: width 0.3s ease;
}

.nav-link:hover::after {
  width: 100%;
}

/* Botones de acción */
.navbar-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.login-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 500;
}

.login-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-background);
}

/* Menú móvil */
.mobile-menu {
  display: none;
  font-size: 1.5rem;
  color: var(--color-text-dark);
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-nav {
  display: none;
  background: var(--color-background);
  border-top: 1px solid var(--color-text-light);
  padding: 1rem 2rem;
  flex-direction: column;
  gap: 1rem;
}

.mobile-nav-link {
  color: var(--color-text-dark);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--color-text-light);
  transition: color 0.3s ease;
}

.mobile-nav-link:hover {
  color: var(--color-primary);
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-text-light);
}

.mobile-login-btn {
  border-color: var(--color-primary);
  color: var(--color-primary);
  font-weight: 500;
}

.mobile-login-btn:hover {
  background-color: var(--color-primary);
  color: var(--color-background);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-container {
    padding: 0 1rem;
  }

  .navbar-menu {
    display: none;
  }

  .navbar-actions .login-btn {
    display: none;
  }

  .mobile-menu {
    display: block;
  }

  .mobile-nav {
    display: flex;
  }

  .logo-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .navbar-container {
    padding: 0.75rem 1rem;
  }

  .logo-icon {
    height: 40px;
  }
}
</style>