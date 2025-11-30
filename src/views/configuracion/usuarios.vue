<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Usuarios del Sistema</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá gestionar los usuarios del sistema (solo ADMIN)."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GestionUsuarios'
}
</script>
