<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Fichas Médicas</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá gestionar las fichas médicas de los atletas."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'FichasMedicas'
}
</script>
