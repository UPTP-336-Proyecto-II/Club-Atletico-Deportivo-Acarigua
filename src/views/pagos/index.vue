<template>
  <div class=" app-container">
    <el-card>
      <div slot="header">
        <span>Gestión de Pagos</span>
      </div>
      <el-alert
        title="Módulo en desarrollo"
        type="info"
        description="Este módulo permitirá gestionar los pagos mensuales de los atletas."
        :closable="false"
        show-icon
      />
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'ListaPagos'
}
</script>
