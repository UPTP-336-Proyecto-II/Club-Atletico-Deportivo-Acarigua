<template>
  <div class="app-container">
    <el-card>
      <div slot="header">
        <span>Categorías</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permit irá gestionar las categorías deportivas."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'GestionCategorias'
}
</script>
