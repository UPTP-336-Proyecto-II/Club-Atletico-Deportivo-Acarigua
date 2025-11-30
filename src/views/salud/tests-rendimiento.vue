<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Tests de Rendimiento</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá registrar tests de fuerza, resistencia, velocidad, coordinación y reacción."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'TestsRendimiento'
}
</script>
