<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Implementos Deportivos</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá gestionar el inventario de implementos deportivos."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GestionImplementos'
}
</script>
