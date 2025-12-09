<template>
  <div class="categorias-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="logo">
          <span class="logo-icon">⚽</span>
          <h1>Gestión de Categorías - Club de Fútbol</h1>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- Sidebar -->
      <div class="sidebar">
        <div class="card category-card">
          <div class="category-icon">🏆</div>
          <div class="category-name">{{ categoriaSeleccionada ? categoriaSeleccionada.NOMBRE_CATEGORIA : 'Selecciona una categoría' }}</div>
          <div class="category-age">{{ categoriaSeleccionada ? `${categoriaSeleccionada.EDAD_MIN} - ${categoriaSeleccionada.EDAD_MAX} años` : '-' }}</div>

          <div class="category-info">
            <div class="info-item">
              <div class="info-label">Total Atletas</div>
              <div class="info-value">{{ categoriaSeleccionada ? categoriaSeleccionada.total_atletas || 0 : '-' }}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Entrenador</div>
              <div class="info-value">{{ categoriaSeleccionada && categoriaSeleccionada.entrenador_nombre ? categoriaSeleccionada.entrenador_nombre + ' ' + categoriaSeleccionada.entrenador_apellido : '-' }}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Filtros</h2>
          <div class="filters">
            <div class="form-group">
              <label>Seleccionar Categoría</label>
              <select v-model="filtroCategoria" @change="seleccionarCategoria">
                <option value="">Todas las categorías</option>
                <option v-for="cat in categorias" :key="cat.CATEGORIA_ID" :value="cat.CATEGORIA_ID">{{ cat.NOMBRE_CATEGORIA }}</option>
              </select>
            </div>

            <div class="form-group">
              <label>Filtrar por Entrenador</label>
              <select v-model="filtroEntrenador">
                <option value="">Todos los entrenadores</option>
                <option v-for="ent in entrenadores" :key="ent.PLANTEL_ID" :value="ent.PLANTEL_ID">{{ ent.NOMBRE }} {{ ent.APELLIDO }}</option>
              </select>
            </div>

            <button class="btn btn-primary" @click="aplicarFiltros">
              <span>Aplicar Filtros</span>
            </button>

            <button class="btn btn-category" @click="nuevaCategoria">
              <span>+</span> Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="content">
        <div class="card">
          <h2 class="card-title">Gestión de Categorías</h2>

          <!-- Formulario -->
          <div v-show="mostrarFormulario" class="form-container">
            <h3 class="card-title">{{ modoEdicion ? 'Editar Categoría' : 'Nueva Categoría' }}</h3>

            <div class="form-row">
              <div class="form-group">
                <label>Nombre de Categoría</label>
                <input v-model="formulario.nombre_categoria" type="text" placeholder="Ej: Sub-12">
              </div>
              <div class="form-group">
                <label>Edad Mínima</label>
                <input v-model.number="formulario.edad_min" type="number" min="5" max="17">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>Edad Máxima</label>
                <input v-model.number="formulario.edad_max" type="number" min="5" max="17">
              </div>
              <div class="form-group">
                <label>Entrenador Principal</label>
                <select v-model="formulario.entrenador_id">
                  <option value="">Seleccionar entrenador</option>
                  <option v-for="ent in entrenadores" :key="ent.PLANTEL_ID" :value="ent.PLANTEL_ID">{{ ent.NOMBRE }} {{ ent.APELLIDO }}</option>
                </select>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn action-delete" @click="cancelarEdicion">Cancelar</button>
              <button class="btn btn-category" @click="guardarCategoria">Guardar Categoría</button>
            </div>
          </div>

          <h3 class="card-title">Lista de Categorías</h3>

          <!-- Lista de categorías -->
          <div v-if="categoriasFiltradas.length === 0" class="empty-state">
            <div class="empty-state-icon">🏆</div>
            <p>No hay categorías que coincidan con los filtros</p>
          </div>

          <div v-else class="categories-grid">
            <div v-for="categoria in categoriasFiltradas" :key="categoria.CATEGORIA_ID" class="category-item">
              <div class="category-header">
                <div class="category-title">{{ categoria.NOMBRE_CATEGORIA }}</div>
                <div class="category-age-range">{{ categoria.EDAD_MIN }}-{{ categoria.EDAD_MAX }} años</div>
              </div>
              <div class="category-details">
                <div class="category-detail">
                  <span class="detail-label">Entrenador:</span>
                  <span class="detail-value">{{ categoria.entrenador_nombre ? categoria.entrenador_nombre + ' ' + categoria.entrenador_apellido : 'No asignado' }}</span>
                </div>
                <div class="category-detail">
                  <span class="detail-label">Total Atletas:</span>
                  <span class="detail-value">{{ categoria.total_atletas || 0 }}</span>
                </div>
              </div>
              <div class="category-actions">
                <button class="action-btn action-edit" @click="editarCategoria(categoria)">Editar</button>
                <button class="action-btn action-delete" @click="eliminarCategoria(categoria)">Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import request from '@/utils/request'

export default {
  name: 'Categorias',
  data() {
    return {
      categorias: [],
      categoriasFiltradas: [],
      entrenadores: [],
      categoriaSeleccionada: null,
      filtroCategoria: '',
      filtroEntrenador: '',
      mostrarFormulario: false,
      modoEdicion: false,
      formulario: {
        id: null,
        nombre_categoria: '',
        edad_min: 5,
        edad_max: 7,
        entrenador_id: ''
      }
    }
  },
  created() {
    this.cargarDatos()
  },
  methods: {
    async cargarDatos() {
      try {
        // Cargar categorías
        const categoriasResponse = await request({
          url: '/categoria',
          method: 'get'
        })
        this.categorias = Array.isArray(categoriasResponse) ? categoriasResponse : []
        this.categoriasFiltradas = [...this.categorias]

        // Cargar entrenadores
        const entrenadoresResponse = await request({
          url: '/plantel',
          method: 'get',
          params: { rol: 'ENTRENADOR' }
        })
        this.entrenadores = Array.isArray(entrenadoresResponse) ? entrenadoresResponse : []
      } catch (error) {
        console.error('Error cargando datos:', error)
        this.$message.error('Error al cargar los datos')
      }
    },

    seleccionarCategoria() {
      if (this.filtroCategoria) {
        this.categoriaSeleccionada = this.categorias.find(c => c.CATEGORIA_ID === this.filtroCategoria)
      } else {
        this.categoriaSeleccionada = null
      }
    },

    aplicarFiltros() {
      let resultado = [...this.categorias]
      if (this.filtroCategoria) {
        resultado = resultado.filter(c => c.CATEGORIA_ID === this.filtroCategoria)
      }
      if (this.filtroEntrenador) {
        resultado = resultado.filter(c => c.ENTRENADOR_ID === this.filtroEntrenador)
      }
      this.categoriasFiltradas = resultado
    },

    nuevaCategoria() {
      this.modoEdicion = false
      this.formulario = {
        id: null,
        nombre_categoria: '',
        edad_min: 5,
        edad_max: 7,
        entrenador_id: ''
      }
      this.mostrarFormulario = true
    },

    editarCategoria(categoria) {
      this.modoEdicion = true
      this.formulario = {
        id: categoria.CATEGORIA_ID,
        nombre_categoria: categoria.NOMBRE_CATEGORIA,
        edad_min: categoria.EDAD_MIN,
        edad_max: categoria.EDAD_MAX,
        entrenador_id: categoria.ENTRENADOR_ID || ''
      }
      this.mostrarFormulario = true
    },

    async guardarCategoria() {
      // Validaciones
      if (!this.formulario.nombre_categoria) {
        this.$message.error('El nombre de la categoría es requerido')
        return
      }
      if (!this.formulario.edad_min || !this.formulario.edad_max) {
        this.$message.error('Las edades son requeridas')
        return
      }
      if (this.formulario.edad_min >= this.formulario.edad_max) {
        this.$message.error('La edad mínima debe ser menor que la máxima')
        return
      }

      try {
        if (this.modoEdicion) {
          // Actualizar
          await request({
            url: `/categoria/${this.formulario.id}`,
            method: 'put',
            data: this.formulario
          })
          this.$message.success('Categoría actualizada correctamente')
        } else {
          // Crear
          await request({
            url: '/categoria',
            method: 'post',
            data: this.formulario
          })
          this.$message.success('Categoría creada correctamente')
        }
        this.cancelarEdicion()
        this.cargarDatos()
      } catch (error) {
        console.error('Error guardando:', error)
        this.$message.error('Error al guardar la categoría')
      }
    },

    cancelarEdicion() {
      this.mostrarFormulario = false
      this.formulario = {
        id: null,
        nombre_categoria: '',
        edad_min: 5,
        edad_max: 7,
        entrenador_id: ''
      }
    },

    async eliminarCategoria(categoria) {
      try {
        await this.$confirm(`¿Estás seguro de eliminar "${categoria.NOMBRE_CATEGORIA}"?`, 'Advertencia', {
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          type: 'warning'
        })

        await request({
          url: `/categoria/${categoria.CATEGORIA_ID}`,
          method: 'delete'
        })

        this.$message.success('Categoría eliminada correctamente')
        this.cargarDatos()
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error eliminando:', error)
          this.$message.error('Error al eliminar la categoría')
        }
      }
    }
  }
}
</script>

<style scoped>
.categorias-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #1a3a5f, #2a5a8c);
  color: white;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  margin-bottom: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 15px;
}

.logo h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0;
}

.logo-icon {
  font-size: 32px;
  background: white;
  color: #1a3a5f;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 25px;
}

.card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 25px;
}

.card-title {
  font-size: 1.3rem;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid #eee;
  color: #1a3a5f;
  font-weight: 600;
}

.category-card {
  text-align: center;
  padding: 25px 15px;
  border-left: 5px solid #e67e22;
}

.category-icon {
  font-size: 48px;
  margin-bottom: 15px;
  color: #e67e22;
}

.category-name {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 5px;
  color: #1a3a5f;
}

.category-age {
  color: #2a5a8c;
  font-weight: 500;
  margin-bottom: 15px;
}

.category-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 15px;
}

.info-item {
  text-align: left;
}

.info-label {
  font-size: 0.85rem;
  color: #777;
}

.info-value {
  font-weight: 600;
  color: #2c3e50;
}

.filters {
  display: grid;
  gap: 15px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  transition: border 0.3s ease;
}

.form-group select:focus,
.form-group input:focus {
  border-color: #2a5a8c;
  outline: none;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #2a5a8c, #1a3a5f);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(42, 90, 140, 0.3);
}

.btn-category {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
}

.btn-category:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(230, 126, 34, 0.3);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.category-item {
  background: #ffffff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  border-left: 4px solid #e67e22;
  transition: transform 0.3s ease;
}

.category-item:hover {
  transform: translateY(-5px);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.category-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #1a3a5f;
}

.category-age-range {
  background: #e67e22;
  color: white;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.category-details {
  margin-bottom: 15px;
}

.category-detail {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.detail-label {
  font-size: 0.85rem;
  color: #777;
}

.detail-value {
  font-weight: 600;
  color: #2c3e50;
}

.category-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  flex: 1;
  text-align: center;
}

.action-edit {
  background: rgba(52, 152, 219, 0.1);
  color: #3498db;
  border: 1px solid #3498db;
}

.action-edit:hover {
  background: #3498db;
  color: white;
}

.action-delete {
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid #e74c3c;
}

.action-delete:hover {
  background: #e74c3c;
  color: white;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #777;
}

.empty-state-icon {
  font-size: 48px;
  margin-bottom: 15px;
  opacity: 0.5;
}

.form-container {
  background: #ffffff;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
  margin-bottom: 25px;
  border: 2px solid #e67e22;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 25px;
}

@media (max-width: 1100px) {
  .categories-grid {
    grid-template-columns: 1fr 1fr;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  .category-info {
    grid-template-columns: 1fr;
  }
  .categories-grid {
    grid-template-columns: 1fr;
  }
  .category-actions {
    flex-direction: column;
  }
}
</style>
