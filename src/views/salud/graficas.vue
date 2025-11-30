<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Gráficas de Rendimiento</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo mostrará gráficas de evolución de rendimiento de los atletas."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GraficasRendimiento'
}
</script>
