<template>
  <div class="asistencia-container">
    <!-- Estadísticas -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-label">Total Asistencias</div>
            <div class="stat-value">{{ estadisticas.total }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card stat-presente">
          <div class="stat-content">
            <div class="stat-label">Asistieron</div>
            <div class="stat-value">{{ estadisticas.presentes }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card stat-ausente">
          <div class="stat-content">
            <div class="stat-label">Faltaron</div>
            <div class="stat-value">{{ estadisticas.ausentes }}</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card stat-justificado">
          <div class="stat-content">
            <div class="stat-label">Justificados</div>
            <div class="stat-value">{{ estadisticas.justificados }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- Contenido principal -->
    <el-row :gutter="20" class="main-row">
      <!-- Formulario de registro -->
      <el-col :xs="24" :sm="24" :md="8">
        <el-card class="form-card">
          <div slot="header" class="card-header">
            <span>{{ isEditing ? 'Editar Asistencia' : 'Registrar Asistencia' }}</span>
          </div>

          <el-form ref="asistenciaForm" :model="form" :rules="rules" label-position="top">
            <el-form-item label="Categoría" prop="categoria_id">
              <el-select
                v-model="form.categoria_id"
                placeholder="Seleccionar categoría"
                filterable
                @change="onCategoriaChange"
              >
                <el-option
                  v-for="cat in categorias"
                  :key="cat.categoria_id"
                  :label="cat.nombre_categoria"
                  :value="cat.categoria_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Atleta" prop="atleta_id">
              <el-select
                v-model="form.atleta_id"
                placeholder="Seleccionar atleta"
                filterable
                :disabled="!form.categoria_id"
              >
                <el-option
                  v-for="atleta in atletasFiltrados"
                  :key="atleta.atleta_id"
                  :label="`${atleta.nombre} ${atleta.apellido}`"
                  :value="atleta.atleta_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Fecha" prop="fecha">
              <el-date-picker
                v-model="form.fecha"
                type="date"
                placeholder="Seleccionar fecha"
                value-format="yyyy-MM-dd"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="Tipo de Evento" prop="tipo_evento">
              <el-select v-model="form.tipo_evento" placeholder="Seleccionar tipo">
                <el-option label="Entrenamiento" value="ENTRENAMIENTO" />
                <el-option label="Partido" value="PARTIDO" />
                <el-option label="Evento Especial (Fisioterapia, Reunión, etc.)" value="EVENTO_ESPECIAL" />
              </el-select>
            </el-form-item>

            <el-form-item label="Estatus" prop="estatus">
              <el-select v-model="form.estatus" placeholder="Seleccionar estatus">
                <el-option label="Asistió" value="PRESENTE" />
                <el-option label="Faltó" value="AUSENTE" />
                <el-option label="Justificado" value="JUSTIFICADO" />
              </el-select>
            </el-form-item>

            <el-form-item label="Entrenador" prop="entrenador_id">
              <el-select v-model="form.entrenador_id" placeholder="Seleccionar entrenador" filterable>
                <el-option
                  v-for="entrenador in entrenadores"
                  :key="entrenador.plantel_id"
                  :label="`${entrenador.nombre} ${entrenador.apellido}`"
                  :value="entrenador.plantel_id"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="Observaciones">
              <el-input
                v-model="form.observaciones"
                type="textarea"
                :rows="3"
                placeholder="Notas adicionales..."
              />
            </el-form-item>

            <el-form-item>
              <el-button
                type="primary"
                :loading="loading"
                @click="submitForm"
              >
                {{ isEditing ? 'Actualizar Asistencia' : 'Registrar Asistencia' }}
              </el-button>
              <el-button v-if="isEditing" @click="cancelEdit">Cancelar</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <!-- Tabla de asistencias -->
      <el-col :xs="24" :sm="24" :md="16">
        <el-card class="table-card">
          <div slot="header" class="card-header">
            <span>Historial de Asistencias</span>
          </div>

          <!-- Filtros -->
          <el-row :gutter="15" class="filters-row">
            <el-col :xs="24" :sm="12" :md="6">
              <el-select
                v-model="filters.categoria_id"
                placeholder="Todas las categorías"
                clearable
                @change="fetchAsistencias"
              >
                <el-option
                  v-for="cat in categorias"
                  :key="cat.categoria_id"
                  :label="cat.nombre_categoria"
                  :value="cat.categoria_id"
                />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-select
                v-model="filters.atleta_id"
                placeholder="Todos los atletas"
                clearable
                filterable
                @change="fetchAsistencias"
              >
                <el-option
                  v-for="atleta in atletas"
                  :key="atleta.atleta_id"
                  :label="`${atleta.nombre} ${atleta.apellido}`"
                  :value="atleta.atleta_id"
                />
              </el-select>
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-date-picker
                v-model="filters.fecha"
                type="date"
                placeholder="Filtrar por fecha"
                value-format="yyyy-MM-dd"
                clearable
                style="width: 100%"
                @change="fetchAsistencias"
              />
            </el-col>

            <el-col :xs="24" :sm="12" :md="6">
              <el-select
                v-model="filters.estatus"
                placeholder="Todos los estatus"
                clearable
                @change="applyLocalFilters"
              >
                <el-option label="Asistió" value="PRESENTE" />
                <el-option label="Faltó" value="AUSENTE" />
                <el-option label="Justificado" value="JUSTIFICADO" />
              </el-select>
            </el-col>
          </el-row>

          <!-- Tabla -->
          <el-table
            v-loading="tableLoading"
            :data="asistenciasFiltradas"
            border
            style="width: 100%; margin-top: 20px"
          >
            <el-table-column prop="asistencia_id" label="ID" width="60" />
            <el-table-column label="Atleta" min-width="150">
              <template slot-scope="scope">
                {{ scope.row.atleta_nombre }} {{ scope.row.atleta_apellido }}
              </template>
            </el-table-column>
            <el-table-column prop="categoria_nombre" label="Categoría" width="120" />
            <el-table-column label="Fecha" width="110">
              <template slot-scope="scope">
                {{ formatDate(scope.row.fecha) }}
              </template>
            </el-table-column>
            <el-table-column prop="tipo_evento" label="Tipo" width="130" />
            <el-table-column label="Estatus" width="130">
              <template slot-scope="scope">
                <el-tag :type="getStatusType(scope.row.estatus)">
                  {{ getStatusLabel(scope.row.estatus) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="Entrenador" min-width="150">
              <template slot-scope="scope">
                {{ scope.row.entrenador_nombre }} {{ scope.row.entrenador_apellido }}
              </template>
            </el-table-column>
            <el-table-column prop="observaciones" label="Observaciones" min-width="150" show-overflow-tooltip />
            <el-table-column label="Acciones" width="150" fixed="right">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="warning"
                  icon="el-icon-edit"
                  @click="editAsistencia(scope.row)"
                >
                  Editar
                </el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="deleteAsistenciaConfirm(scope.row)"
                >
                  Eliminar
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getAsistencias, createAsistencia, updateAsistencia, deleteAsistencia } from '@/api/asistencias'
import { getAtletas } from '@/api/atletas'
import { getCategorias } from '@/api/categorias'
import { getPlantel } from '@/api/plantel'

export default {
  name: 'RegistroAsistencia',
  data() {
    return {
      form: {
        categoria_id: '',
        atleta_id: '',
        fecha: '',
        tipo_evento: 'ENTRENAMIENTO',
        estatus: 'PRESENTE',
        entrenador_id: '',
        observaciones: ''
      },
      rules: {
        categoria_id: [{ required: true, message: 'Seleccione una categoría', trigger: 'change' }],
        atleta_id: [{ required: true, message: 'Seleccione un atleta', trigger: 'change' }],
        fecha: [{ required: true, message: 'Seleccione una fecha', trigger: 'change' }],
        tipo_evento: [{ required: true, message: 'Seleccione el tipo de evento', trigger: 'change' }],
        estatus: [{ required: true, message: 'Seleccione el estatus', trigger: 'change' }],
        entrenador_id: [{ required: true, message: 'Seleccione un entrenador', trigger: 'change' }]
      },
      filters: {
        categoria_id: '',
        atleta_id: '',
        fecha: '',
        estatus: ''
      },
      asistencias: [],
      atletas: [],
      categorias: [],
      entrenadores: [],
      loading: false,
      tableLoading: false,
      isEditing: false,
      editingId: null
    }
  },
  computed: {
    atletasFiltrados() {
      if (!this.form.categoria_id) {
        return []
      }
      return this.atletas.filter(a => a.categoria_id === this.form.categoria_id)
    },
    asistenciasFiltradas() {
      let filtered = [...this.asistencias]

      if (this.filters.estatus) {
        filtered = filtered.filter(a => a.estatus === this.filters.estatus)
      }

      return filtered
    },
    estadisticas() {
      const filtered = this.asistenciasFiltradas
      return {
        total: filtered.length,
        presentes: filtered.filter(a => a.estatus === 'PRESENTE').length,
        ausentes: filtered.filter(a => a.estatus === 'AUSENTE').length,
        justificados: filtered.filter(a => a.estatus === 'JUSTIFICADO').length
      }
    }
  },
  created() {
    this.initializeData()
  },
  methods: {
    async initializeData() {
      this.form.fecha = this.getTodayDate()
      await Promise.all([
        this.fetchCategorias(),
        this.fetchAtletas(),
        this.fetchEntrenadores(),
        this.fetchAsistencias()
      ])
    },
    async fetchCategorias() {
      try {
        const response = await getCategorias()
        this.categorias = response
      } catch (error) {
        this.$message.error('Error al cargar categorías')
      }
    },
    async fetchAtletas() {
      try {
        const response = await getAtletas()
        this.atletas = response
      } catch (error) {
        this.$message.error('Error al cargar atletas')
      }
    },
    async fetchEntrenadores() {
      try {
        const response = await getPlantel({ rol: 'ENTRENADOR' })
        this.entrenadores = response
      } catch (error) {
        this.$message.error('Error al cargar entrenadores')
      }
    },
    async fetchAsistencias() {
      this.tableLoading = true
      try {
        const params = {}
        if (this.filters.categoria_id) params.categoria_id = this.filters.categoria_id
        if (this.filters.atleta_id) params.atleta_id = this.filters.atleta_id
        if (this.filters.fecha) params.fecha = this.filters.fecha

        const response = await getAsistencias(params)
        this.asistencias = response
      } catch (error) {
        this.$message.error('Error al cargar asistencias')
      } finally {
        this.tableLoading = false
      }
    },
    onCategoriaChange() {
      // Limpiar atleta seleccionado cuando cambia la categoría
      this.form.atleta_id = ''
    },
    applyLocalFilters() {
      // Trigger computed property update
      this.$forceUpdate()
    },
    submitForm() {
      this.loading = true
      this.$refs.asistenciaForm.validate(async(valid) => {
        if (!valid) {
          this.loading = false
          return
        }

        try {
          const data = {
            atleta_id: this.form.atleta_id,
            fecha: this.form.fecha,
            tipo_evento: this.form.tipo_evento,
            estatus: this.form.estatus,
            entrenador_id: this.form.entrenador_id,
            observaciones: this.form.observaciones
          }

          if (this.isEditing) {
            await updateAsistencia(this.editingId, data)
            this.$message.success('Asistencia actualizada correctamente')
          } else {
            await createAsistencia(data)
            this.$message.success('Asistencia registrada correctamente')
          }

          this.resetForm()
          await this.fetchAsistencias()
        } catch (error) {
          console.error('Error submitForm:', error)
          const errorMsg = error.response?.data?.error || 'Error al guardar asistencia'
          this.$message.error(errorMsg)
        } finally {
          this.loading = false
        }
      })
    },
    editAsistencia(row) {
      this.isEditing = true
      this.editingId = row.asistencia_id

      // Buscar el atleta para obtener su categoría
      const atleta = this.atletas.find(a => a.atleta_id === row.atleta_id)

      this.form = {
        categoria_id: atleta ? atleta.categoria_id : '',
        atleta_id: row.atleta_id,
        fecha: row.fecha,
        tipo_evento: row.tipo_evento,
        estatus: row.estatus,
        entrenador_id: row.entrenador_id,
        observaciones: row.observaciones || ''
      }

      // Scroll to form
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    deleteAsistenciaConfirm(row) {
      this.$confirm('¿Está seguro de eliminar este registro de asistencia?', 'Confirmar eliminación', {
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(async() => {
        try {
          await deleteAsistencia(row.asistencia_id)
          this.$message.success('Asistencia eliminada correctamente')
          await this.fetchAsistencias()
        } catch (error) {
          this.$message.error('Error al eliminar asistencia')
        }
      }).catch(() => {
        // Cancelado
      })
    },
    cancelEdit() {
      this.resetForm()
    },
    resetForm() {
      this.isEditing = false
      this.editingId = null
      this.form = {
        categoria_id: '',
        atleta_id: '',
        fecha: this.getTodayDate(),
        tipo_evento: 'ENTRENAMIENTO',
        estatus: 'PRESENTE',
        entrenador_id: '',
        observaciones: ''
      }
      this.$refs.asistenciaForm.clearValidate()
    },
    getTodayDate() {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },
    formatDate(dateStr) {
      if (!dateStr) return '-'
      const date = new Date(dateStr)
      const options = { year: 'numeric', month: 'short', day: 'numeric' }
      return date.toLocaleDateString('es-ES', options)
    },
    getStatusType(estatus) {
      const types = {
        'PRESENTE': 'success',
        'AUSENTE': 'danger',
        'JUSTIFICADO': 'warning'
      }
      return types[estatus] || 'info'
    },
    getStatusLabel(estatus) {
      const labels = {
        'PRESENTE': 'Asistió',
        'AUSENTE': 'Faltó',
        'JUSTIFICADO': 'Justificado'
      }
      return labels[estatus] || estatus
    }
  }
}
</script>

<style lang="scss" scoped>
.asistencia-container {
  padding: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  border-top: 4px solid #E51D22;

  &.stat-presente {
    border-top-color: #2ecc71;
  }

  &.stat-ausente {
    border-top-color: #e74c3c;
  }

  &.stat-justificado {
    border-top-color: #f39c12;
  }

  .stat-content {
    text-align: center;

    .stat-label {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .stat-value {
      font-size: 32px;
      font-weight: bold;
      color: #E51D22;
    }
  }

  &.stat-presente .stat-value {
    color: #2ecc71;
  }

  &.stat-ausente .stat-value {
    color: #e74c3c;
  }

  &.stat-justificado .stat-value {
    color: #f39c12;
  }
}

.main-row {
  margin-top: 20px;
}

.form-card, .table-card {
  ::v-deep .el-card__header {
    background-color: #f5f7fa;
    border-bottom: 2px solid #E51D22;
  }

  .card-header {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }
}

.filters-row {
  margin-bottom: 15px;
}

::v-deep .el-button--primary {
  background-color: #E51D22;
  border-color: #E51D22;

  &:hover, &:focus {
    background-color: #c41a1d;
    border-color: #c41a1d;
  }
}

::v-deep .el-form-item__label {
  font-weight: 500;
  color: #333;
}

::v-deep .el-select, ::v-deep .el-date-editor {
  width: 100%;
}

@media (max-width: 768px) {
  .asistencia-container {
    padding: 10px;
  }

  .stat-card .stat-value {
    font-size: 24px;
  }

  ::v-deep .el-table {
    font-size: 12px;
  }
}
</style>
