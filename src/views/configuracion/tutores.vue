<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Tutores</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá gestionar los tutores/representantes de los atletas."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GestionTutores'
}
</script>
