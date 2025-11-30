<template>
  <div class="app-container">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>{{ isEdit ? 'Editar Atleta' : 'Nuevo Atleta' }}</span>
        <el-button style="float: right; padding: 3px 0" type="text" @click="goBack">Volver</el-button>
      </div>

      <el-form ref="form" :model="form" :rules="rules" label-width="180px">
        <el-form-item label="Nombre" prop="NOMBRE">
          <el-input v-model="form.NOMBRE" placeholder="Ingrese el nombre" />
        </el-form-item>

        <el-form-item label="Apellido" prop="APELLIDO">
          <el-input v-model="form.APELLIDO" placeholder="Ingrese el apellido" />
        </el-form-item>

        <el-form-item label="Teléfono" prop="TELEFONO">
          <el-input v-model="form.TELEFONO" placeholder="Ej: 04141234567" />
        </el-form-item>

        <el-form-item label="Dirección">
          <el-input v-model="form.DIRECCION" type="textarea" :rows="3" placeholder="Ingrese la dirección" />
        </el-form-item>

        <el-form-item label="Fecha de Nacimiento" prop="FECHA_NACIMIENTO">
          <el-date-picker
            v-model="form.FECHA_NACIMIENTO"
            type="date"
            placeholder="Seleccione fecha"
            style="width: 100%;"
            format="dd/MM/yyyy"
            value-format="yyyy-MM-dd"
          />
        </el-form-item>

        <el-form-item label="Posición de Juego">
          <el-select v-model="form.POSICION_DE_JUEGO" placeholder="Seleccione posición" style="width: 100%;">
            <el-option label="Portero" value="Portero" />
            <el-option label="Defensa" value="Defensa" />
            <el-option label="Mediocampista" value="Mediocampista" />
            <el-option label="Delantero" value="Delantero" />
          </el-select>
        </el-form-item>

        <el-form-item label="Categoría">
          <el-select v-model="form.CATEGORIA_ID" placeholder="Seleccione categoría" style="width: 100%;">
            <el-option label="Sub-8" :value="1" />
            <el-option label="Sub-10" :value="2" />
            <el-option label="Sub-12" :value="3" />
          </el-select>
        </el-form-item>

        <el-form-item label="Estatus">
          <el-select v-model="form.ESTATUS" placeholder="Seleccione estatus" style="width: 100%;">
            <el-option label="Activo" value="ACTIVO" />
            <el-option label="Inactivo" value="INACTIVO" />
            <el-option label="Lesionado" value="LESIONADO" />
            <el-option label="Suspendido" value="SUSPENDIDO" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm">{{ isEdit ? 'Actualizar' : 'Crear' }}</el-button>
          <el-button @click="goBack">Cancelar</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  name: 'FormAtleta',
  data() {
    return {
      isEdit: false,
      form: {
        NOMBRE: '',
        APELLIDO: '',
        TELEFONO: '',
        DIRECCION: '',
        FECHA_NACIMIENTO: '',
        POSICION_DE_JUEGO: '',
        CATEGORIA_ID: null,
        ESTATUS: 'ACTIVO'
      },
      rules: {
        NOMBRE: [{ required: true, message: 'El nombre es requerido', trigger: 'blur' }],
        APELLIDO: [{ required: true, message: 'El apellido es requerido', trigger: 'blur' }],
        FECHA_NACIMIENTO: [{ required: true, message: 'La fecha de nacimiento es requerida', trigger: 'change' }]
      }
    }
  },
  created() {
    if (this.$route.params.id) {
      this.isEdit = true
      this.loadAtleta()
    }
  },
  methods: {
    loadAtleta() {
      // Aquí iría la llamada a la API para cargar los datos
      console.log('Cargar atleta:', this.$route.params.id)
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          const message = this.isEdit ? 'Atleta actualizado exitosamente' : 'Atleta creado exitosamente'
          this.$message.success(message)
          this.goBack()
        }
      })
    },
    goBack() {
      this.$router.push('/atletas/lista')
    }
  }
}
</script>
