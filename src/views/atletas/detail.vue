<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Detalle del Atleta</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="goBack">Volver</el-button>
      </div>

      <el-row :gutter="20">
        <el-col :span="12">
          <h3>Información Personal</h3>
          <p><strong>Nombre:</strong> {{ atleta.NOMBRE }} {{ atleta.APELLIDO }}</p>
          <p><strong>Teléfono:</strong> {{ atleta.TELEFONO }}</p>
          <p><strong>Dirección:</strong> {{ atleta.DIRECCION }}</p>
          <p><strong>Fecha de Nacimiento:</strong> {{ atleta.FECHA_NACIMIENTO }}</p>
          <p><strong>Posición:</strong> {{ atleta.POSICION_DE_JUEGO }}</p>
          <p><strong>Estatus:</strong> <el-tag :type="getStatusType(atleta.ESTATUS)">{{ atleta.ESTATUS }}</el-tag></p>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'DetalleAtleta',
  data() {
    return {
      atleta: {
        NOMBRE: 'Elsio',
        APELLIDO: 'Apallido',
        TELEFONO: '04145384801',
        DIRECCION: 'Bosque de camoruco',
        FECHA_NACIMIENTO: '1995-01-15',
        POSICION_DE_JUEGO: 'Delantero',
        ESTATUS: 'ACTIVO'
      }
    }
  },
  methods: {
    goBack() {
      this.$router.push('/atletas/lista')
    },
    getStatusType(status) {
      const map = {
        ACTIVO: 'success',
        INACTIVO: 'info',
        LESIONADO: 'warning',
        SUSPENDIDO: 'danger'
      }
      return map[status]
    }
  }
}
</script>
