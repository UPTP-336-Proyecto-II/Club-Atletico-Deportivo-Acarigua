<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input
        v-model="listQuery.search"
        placeholder="Buscar atleta..."
        style="width: 200px;"
        class="filter-item"
        @keyup.enter.native="handleFilter"
      />
      <el-button
        v-waves
        class="filter-item"
        type="primary"
        icon="el-icon-search"
        @click="handleFilter"
      >
        Buscar
      </el-button>
      <el-button
        class="filter-item"
        style="margin-left: 10px;"
        type="primary"
        icon="el-icon-plus"
        @click="handleCreate"
      >
        Agregar Atleta
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      border
      fit
      highlight-current-row
      style="width: 100%;"
    >
      <el-table-column label="ID" prop="ATLETA_ID" align="center" width="80">
        <template slot-scope="{row}">
          <span>{{ row.ATLETA_ID }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Nombre" min-width="150px">
        <template slot-scope="{row}">
          <span class="link-type" @click="handleDetail(row)">{{ row.NOMBRE }} {{ row.APELLIDO }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Teléfono" width="130px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.TELEFONO }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Posición" width="150px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.POSICION_DE_JUEGO }}</span>
        </template>
      </el-table-column>
      <el-table-column label="Estatus" class-name="status-col" width="100">
        <template slot-scope="{row}">
          <el-tag :type="row.ESTATUS | statusFilter">
            {{ row.ESTATUS }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="Acciones" align="center" width="230" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button type="primary" size="mini" @click="handleDetail(row)">
            Ver
          </el-button>
          <el-button type="primary" size="mini" @click="handleUpdate(row)">
            Editar
          </el-button>
          <el-button size="mini" type="danger" @click="handleDelete(row)">
            Eliminar
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="listQuery.page"
      :limit.sync="listQuery.limit"
      @pagination="getList"
    />
  </div>
</template>

<script>
// import { getAtletas } from '@/api/atletas' // TODO: Crear API de atletas
import waves from '@/directive/waves'
import Pagination from '@/components/Pagination'

export default {
  name: 'ListaAtletas',
  components: { Pagination },
  directives: { waves },
  filters: {
    statusFilter(status) {
      const statusMap = {
        ACTIVO: 'success',
        INACTIVO: 'info',
        LESIONADO: 'warning',
        SUSPENDIDO: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [],
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        search: ''
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    async getList() {
      this.listLoading = true
      try {
        // Por ahora usamos datos mock hasta que esté lista la API
        // const response = await getAtletas(this.listQuery)
        // this.list = response.data.items
        // this.total = response.data.total

        // Datos temporales de ejemplo
        this.list = [
          {
            ATLETA_ID: 1,
            NOMBRE: 'Elsio',
            APELLIDO: 'Apallido',
            TELEFONO: '04145384801',
            POSICION_DE_JUEGO: 'Delantero',
            ESTATUS: 'ACTIVO'
          }
        ]
        this.total = 1
      } catch (error) {
        console.error('Error al cargar atletas:', error)
        this.$message.error('Error al cargar la lista de atletas')
      } finally {
        this.listLoading = false
      }
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    handleCreate() {
      this.$router.push('/atletas/crear')
    },
    handleUpdate(row) {
      this.$router.push(`/atletas/editar/${row.ATLETA_ID}`)
    },
    handleDetail(row) {
      this.$router.push(`/atletas/detalle/${row.ATLETA_ID}`)
    },
    handleDelete(row) {
      this.$confirm('¿Está seguro de eliminar este atleta?', 'Advertencia', {
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        type: 'warning'
      }).then(() => {
        this.$message.success('Atleta eliminado exitosamente')
        this.getList()
      })
    }
  }
}
</script>

<style scoped>
.link-type {
  color: #409EFF;
  cursor: pointer;
}
.link-type:hover {
  color: #66b1ff;
}
</style>
