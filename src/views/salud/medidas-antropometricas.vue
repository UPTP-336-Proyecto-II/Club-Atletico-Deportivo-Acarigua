<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Medidas Antropométricas</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá registrar peso, altura, IMC, envergadura y otras medidas físicas."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'MedidasAntropometricas'
}
</script>
