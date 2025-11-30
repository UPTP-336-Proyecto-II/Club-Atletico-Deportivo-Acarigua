<template>
  <div class="login-container">
    <!-- Fondo con cancha de fútbol -->
    <div class="login-background">
      <div class="soccer-field" />
      <div class="gradient-overlay" />
    </div>

    <!-- Contenedor principal -->
    <div class="login-center-wrapper">
      <!-- Tarjeta de login -->
      <div class="login-card">
        <!-- Header -->
        <div class="login-header">
          <div class="logo-section">
            <div class="logo-container">
              <img src="@/assets/icons/logo.png" alt="Club Atlético Deportivo Acarigua" class="logo-image">
            </div>
            <div class="logo-text">
              <h1>Club Atlético</h1>
              <p>Deportivo Acarigua</p>
              <span class="club-motto">"La Armadura de Dios"</span>
            </div>
          </div>
          <div class="welcome-section">
            <h2>Bienvenido</h2>
            <p>Ingresa al sistema del club</p>
          </div>
        </div>

        <!-- Formulario -->
        <el-form
          ref="loginForm"
          :model="loginForm"
          :rules="loginRules"
          class="login-form"
          @submit.native.prevent="handleLogin"
        >
          <el-form-item prop="username" class="form-item-custom">
            <div class="input-group">
              <span class="input-icon" :class="{ 'input-icon-hidden': loginForm.username }">
                <i class="el-icon-user" />
              </span>
              <el-input
                ref="username"
                v-model="loginForm.username"
                placeholder="Usuario"
                size="large"
                class="mobile-input"
                @input="handleInput"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password" class="form-item-custom">
            <div class="input-group">
              <span class="input-icon" :class="{ 'input-icon-hidden': loginForm.password }">
                <i class="el-icon-lock" />
              </span>
              <el-input
                ref="password"
                v-model="loginForm.password"
                :type="passwordType"
                placeholder="Contraseña"
                size="large"
                class="mobile-input"
                @keyup.enter.native="handleLogin"
                @input="handleInput"
              />
              <button type="button" class="password-toggle" @click="showPwd">
                <i :class="passwordType === 'password' ? 'el-icon-view' : 'el-icon-hide'" />
              </button>
            </div>
          </el-form-item>

          <div class="form-options">
            <el-checkbox v-model="rememberMe" class="mobile-checkbox">
              Recordarme
            </el-checkbox>
            <a href="#forgot" class="forgot-link">¿Olvidaste tu contraseña?</a>
          </div>

          <el-button
            :loading="loading"
            type="primary"
            size="large"
            class="login-button mobile-button"
            native-type="submit"
          >
            <span v-if="!loading">Iniciar Sesión</span>
            <span v-else>Accediendo...</span>
          </el-button>
        </el-form>

        <!-- Información del Club - Comentado -->
        <!--
        <div class="club-info-section">
          <div class="info-header">
            <span class="info-title">Club Atlético Deportivo Acarigua</span>
          </div>
          <div class="info-content">
            <div class="info-item">
              <i class="el-icon-office-building"></i>
              <span>Asociación Civil RIF: J-503114630</span>
            </div>
            <div class="info-item">
              <i class="el-icon-medal"></i>
              <span>Afiliada a la Asociación de Fútbol de Portuguesa</span>
            </div>
            <div class="info-item">
              <i class="el-icon-document"></i>
              <span>Inscrita en el Ministerio del Deporte</span>
            </div>
          </div>
        </div>
        -->

        <!-- Footer sin línea superior -->
        <div class="login-footer">
          <p>¿Necesitas acceso?
            <a href="#contact" class="register-link">Contacta a la directiva</a>
          </p>
        </div>

        <!-- Copyright dentro del card -->
        <div class="login-copyright-card">
          <p>&copy; 2024 Club Atlético Deportivo Acarigua - Todos los derechos reservados</p>
        </div>
      </div>
    </div>

    <!-- Botón de volver -->
    <div class="back-to-home">
      <button
        class="back-button mobile-back-button"
        @click="goToLanding"
      >
        <i class="el-icon-arrow-left" />
        <span>Volver al Inicio</span>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    const validateUsername = (rule, value, callback) => {
      if (!value || value.trim() === '') {
        callback(new Error('Ingresa tu usuario'))
      } else {
        callback()
      }
    }
    const validatePassword = (rule, value, callback) => {
      if (!value || value.length < 6) {
        callback(new Error('Mínimo 6 caracteres'))
      } else {
        callback()
      }
    }
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{ required: true, trigger: 'blur', validator: validateUsername }],
        password: [{ required: true, trigger: 'blur', validator: validatePassword }]
      },
      passwordType: 'password',
      loading: false,
      rememberMe: false,
      isMobile: false
    }
  },
  mounted() {
    this.detectMobile()
    this.$nextTick(() => {
      this.$refs.username.focus()
    })

    window.addEventListener('resize', this.detectMobile)
    window.addEventListener('orientationchange', this.detectMobile)
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.detectMobile)
    window.removeEventListener('orientationchange', this.detectMobile)
  },
  methods: {
    detectMobile() {
      this.isMobile = window.innerWidth <= 768
    },
    showPwd() {
      this.passwordType = this.passwordType === 'password' ? 'text' : 'password'
      this.$nextTick(() => {
        this.$refs.password.focus()
      })
    },
    handleInput() {
      // Este método se usa para el binding de los iconos
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true
          this.$store.dispatch('user/login', this.loginForm)
            .then(() => {
              this.$router.push({ path: this.$route.query.redirect || '/dashboard' })
              this.loading = false
            })
            .catch(() => {
              this.loading = false
            })
        }
      })
    },
    goToLanding() {
      this.$router.push('/')
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary) 0%, #8B0000 100%);
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.soccer-field {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(90deg, transparent 49%, rgba(255,255,255,0.2) 49%, rgba(255,255,255,0.2) 51%, transparent 51%),
    linear-gradient(transparent 49%, rgba(255,255,255,0.2) 49%, rgba(255,255,255,0.2) 51%, transparent 51%),
    radial-gradient(circle at 50% 50%, transparent 69%, rgba(255,255,255,0.2) 69%, rgba(255,255,255,0.2) 71%, transparent 71%);
  opacity: 0.3;
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(229, 29, 34, 0.9) 0%, rgba(139, 0, 0, 0.8) 100%);
}

.login-center-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 440px;
  padding: 1rem;
  margin: 0 auto;
}

.login-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  width: 100%;
  box-shadow:
    0 20px 40px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.4);
  position: relative;
}

.login-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 60px;
  height: 60px;
  object-fit: contain;
  border-radius: 8px;
}

.logo-text h1 {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--color-text-dark);
  margin: 0;
  line-height: 1.2;
}

.logo-text p {
  font-size: 0.9rem;
  color: var(--color-text-dark);
  margin: 0;
  font-weight: 600;
  opacity: 0.9;
}

.club-motto {
  font-size: 0.75rem;
  color: var(--color-primary);
  font-style: italic;
  font-weight: 500;
}

.welcome-section h2 {
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text-dark);
  margin: 0 0 0.25rem 0;
}

.welcome-section p {
  color: #000;
  margin: 0;
  font-size: 0.9rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

/* Corregir posición de mensajes de error */
:deep(.form-item-custom .el-form-item__error) {
  padding-top: 4px !important;
  margin-top: 2px !important;
  position: relative !important;
  top: 0 !important;
  transform: none !important;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem; /* Reducido para acercar el mensaje de error */
}

.input-icon {
  position: absolute;
  left: 16px;
  z-index: 2;
  color: var(--color-text-light);
  font-size: 1.1rem;
  pointer-events: none;
  transition: all 0.3s ease;
  top: 50%;
  transform: translateY(-50%);
}

.input-icon-hidden {
  opacity: 0;
  transform: translateY(-50%) translateX(-10px);
}

.password-toggle {
  position: absolute;
  right: 12px;
  z-index: 3;
  color: var(--color-text-light);
  cursor: pointer;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  min-width: 40px;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 50%;
  transform: translateY(-50%);
}

.password-toggle:hover {
  color: var(--color-primary);
  background: rgba(229, 29, 34, 0.1);
}

:deep(.mobile-input .el-input__inner) {
  padding-left: 16px !important;
  padding-right: 50px !important;
  height: 52px !important;
  border: 2px solid var(--color-text-light);
  border-radius: 12px;
  background: #ffffff;
  font-size: 16px !important;
  font-weight: 500;
  transition: all 0.2s ease;
  min-height: 52px;
  color: var(--color-text-dark);
}

/* Asegurar que el placeholder tenga suficiente espacio */
:deep(.mobile-input .el-input__inner::placeholder) {
  color: var(--color-text-light);
  opacity: 1;
  padding-left: 30px !important;
  transition: padding-left 0.3s ease;
}

/* Cuando hay texto, el placeholder desaparece naturalmente */
:deep(.mobile-input .el-input__inner:not(:placeholder-shown)) {
  padding-left: 16px !important;
}

:deep(.mobile-input .el-input__inner:hover) {
  border-color: #cbd5e0;
}

:deep(.mobile-input .el-input__inner:focus) {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(229, 29, 34, 0.1);
  padding-left: 16px !important;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 1.25rem 0 1.5rem 0;
  flex-wrap: wrap;
  gap: 0.5rem;
}

:deep(.mobile-checkbox .el-checkbox__label) {
  color: var(--color-text-dark);
  font-size: 0.9rem;
  font-weight: 500;
}

:deep(.mobile-checkbox .el-checkbox__inner) {
  width: 18px;
  height: 18px;
}

:deep(.mobile-checkbox .el-checkbox__inner:hover) {
  border-color: var(--color-primary);
}

:deep(.mobile-checkbox .el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.forgot-link {
  font-size: 0.85rem;
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
  padding: 4px 8px;
  border-radius: 4px;
}

.forgot-link:hover {
  color: #8B0000;
  background: rgba(229, 29, 34, 0.05);
}

.login-button.mobile-button {
  width: 100%;
  height: 52px;
  background: linear-gradient(135deg, var(--color-primary), #8B0000);
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(229, 29, 34, 0.3);
  min-height: 52px;
}

.login-button.mobile-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(229, 29, 34, 0.4);
}

/* Sección de Información del Club - Comentada */
/*
.club-info-section {
  margin: 1.5rem 0;
  padding: 1.25rem;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.info-header {
  text-align: center;
  margin-bottom: 1rem;
}

.info-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.info-item i {
  color: var(--color-primary);
  font-size: 1rem;
  flex-shrink: 0;
}

.info-item span {
  font-size: 0.8rem;
  color: var(--color-text-dark);
  font-weight: 500;
  line-height: 1.3;
}
*/

/* Footer sin línea superior */
.login-footer {
  text-align: center;
  padding-top: 0; /* Eliminado el padding superior */
  margin-bottom: 1rem;
  border-top: none; /* Eliminada la línea gris */
}

.login-footer p {
  color: #000;
  margin: 0;
  font-size: 0.85rem;
}

.register-link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
  padding: 2px 4px;
  border-radius: 4px;
}

.register-link:hover {
  color: #8B0000;
  text-decoration: underline;
  background: rgba(229, 29, 34, 0.05);
}

/* Copyright dentro del card */
.login-copyright-card {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0; /* Solo esta línea queda */
}

.login-copyright-card p {
  color: var(--color-text-light);
  font-size: 0.75rem;
  margin: 0;
  line-height: 1.4;
}

.back-to-home {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 3;
}

.back-button.mobile-back-button {
  color: white;
  font-weight: 500;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 44px;
}

.back-button.mobile-back-button:hover {
  background: rgba(255, 255, 255, 0.25);
  color: white;
  transform: scale(0.98);
}

/* Media Queries para móvil */
@media (max-width: 768px) {
  .login-container {
    align-items: flex-start;
    padding-top: 2rem;
  }

  .login-center-wrapper {
    padding: 0.5rem;
    max-width: 100%;
    margin: 0 0.5rem;
  }

  .login-card {
    padding: 1.5rem 1.25rem;
    border-radius: 14px;
  }

  .logo-section {
    flex-direction: column;
    text-align: center;
    gap: 0.5rem;
  }

  .logo-image {
    width: 65px;
    height: 65px;
  }

  .logo-text h1 {
    font-size: 1.4rem;
  }

  .welcome-section h2 {
    font-size: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .back-to-home {
    top: 0.5rem;
    left: 0.5rem;
  }

  .back-button.mobile-back-button {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) and (max-height: 700px) {
  .login-container {
    padding-top: 1rem;
    align-items: flex-start;
  }

  .login-card {
    padding: 1.25rem 1rem;
  }

  .login-header {
    margin-bottom: 1rem;
  }

  .login-form {
    margin-bottom: 1rem;
  }
}

@media (max-width: 360px) {
  .login-card {
    padding: 1rem 0.75rem;
  }

  .logo-text h1 {
    font-size: 1.2rem;
  }

  .welcome-section h2 {
    font-size: 1.3rem;
  }

  :deep(.mobile-input .el-input__inner) {
    font-size: 14px !important;
  }
}

/* Soporte para modo landscape en móviles */
@media (max-height: 500px) and (orientation: landscape) {
  .login-container {
    align-items: flex-start;
    padding-top: 1rem;
    min-height: auto;
  }

  .login-card {
    padding: 1rem 1.5rem;
    margin: 1rem 0;
  }

  .login-header {
    margin-bottom: 1rem;
  }

  .logo-section {
    flex-direction: row;
    gap: 0.75rem;
  }

  .input-group {
    margin-bottom: 0.75rem;
  }

  .login-copyright-card {
    display: none;
  }
}
</style>
