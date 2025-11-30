<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Control de Asistencias</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá registrar y consultar asistencias de los atletas a entrenamientos, partidos y eventos especiales."
        :closable="false"
        show-icon
      />
      <div style="margin-top: 20px;">
        <el-button type="primary" icon="el-icon-plus">Registrar Asistencia</el-button>
        <el-button type="success" icon="el-icon-document">Ver Reportes</el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ControlAsistencias'
}
</script>
