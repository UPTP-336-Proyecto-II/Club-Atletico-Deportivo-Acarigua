<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Plantel Técnico</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá gestionar el plantel técnico del club."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GestionPlantel'
}
</script>
