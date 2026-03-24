<template>
  <div class="atletas-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div>
          <h1>
            <i class="el-icon-user" /> Gestión de Atletas
            <el-tag v-if="!canUserEdit && !isUserMedico" type="info" size="small" style="margin-left: 10px;">
              Solo Lectura
            </el-tag>
            <el-tag v-if="isUserMedico" type="warning" size="small" style="margin-left: 10px;">
              Acceso Médico
            </el-tag>
          </h1>
          <p class="subtitle">
            Club Atlético Deportivo Acarigua
            <span v-if="atletas.length" class="total-count">(Cantidad: {{ atletas.length }})</span>
          </p>
        </div>
        <el-button v-if="canUserEdit" type="primary" icon="el-icon-plus" @click="openAtletaModal(false)">
          Agregar Atleta
        </el-button>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Sidebar con lista de atletas -->
      <aside class="sidebar">
        <el-card shadow="hover">
          <div slot="header" class="sidebar-header">
            <span><i class="el-icon-user" /> Lista de Atletas</span>
            <el-popover
              placement="bottom-end"
              width="250"
              trigger="click"
            >
              <div class="filter-popover">
                <h4>Filtros Avanzados</h4>
                <div class="filter-item">
                  <label>Ordenar por</label>
                  <el-select v-model="filterOrder" placeholder="Seleccionar" size="small" style="width: 100%">
                    <el-option label="Más Recientes" value="recent" />
                    <el-option label="Más Antiguos" value="oldest" />
                    <el-option label="Nombre (A-Z)" value="name_asc" />
                    <el-option label="Nombre (Z-A)" value="name_desc" />
                  </el-select>
                </div>
                <div class="filter-item">
                  <label>Categoría</label>
                  <el-select v-model="filterCategoria" placeholder="Todas" clearable size="small" style="width: 100%">
                    <el-option
                      v-for="cat in categorias"
                      :key="cat.categoria_id"
                      :label="cat.nombre_categoria"
                      :value="cat.categoria_id"
                    />
                  </el-select>
                </div>
                <div class="filter-item">
                  <label>Estatus</label>
                  <el-select v-model="filterEstatus" placeholder="Predeterminado" clearable size="small" style="width: 100%">
                    <el-option label="Activos / Lesionados" value="" />
                    <el-option label="Activo" value="ACTIVO" />
                    <el-option label="Inactivo" value="INACTIVO" />
                    <el-option label="Lesionado" value="LESIONADO" />
                    <el-option label="Suspendido" value="SUSPENDIDO" />
                    <el-option label="Ver Todos" value="TODOS" />
                  </el-select>
                </div>
                <div class="filter-item">
                  <label>Buscar por Cédula</label>
                  <el-select v-model="filterCedula" placeholder="Todos" size="small" style="width: 100%">
                    <el-option label="Todos los Atletas" value="todos" />
                    <el-option label="Con Cédula" value="con_cedula" />
                    <el-option label="Sin Cédula" value="sin_cedula" />
                  </el-select>
                </div>
                <div v-if="filterCedula === 'con_cedula'" class="filter-item">
                  <label>Número de Cédula</label>
                  <el-input
                    v-model="searchCedula"
                    placeholder="Ej: 123456789"
                    size="small"
                    clearable
                    maxlength="9"
                    @input="v => searchCedula = v.replace(/\D/g, '')"
                  />
                </div>
              </div>
              <el-button slot="reference" type="text" icon="el-icon-s-operation" class="filter-btn" />
            </el-popover>
          </div>
          <div class="search-container">
            <el-input
              v-model="searchQuery"
              placeholder="Buscar por nombre..."
              prefix-icon="el-icon-search"
              size="small"
              clearable
            />
          </div>
          <div class="athlete-list">
            <div
              v-for="atleta in atletas"
              :key="atleta.atleta_id"
              class="athlete-item"
              :class="{ active: currentAtletaId === atleta.atleta_id }"
              @click="selectAtleta(atleta.atleta_id)"
            >
              <div class="athlete-photo">
                <img v-if="atleta.foto" :src="getFotoUrl(atleta.foto)" class="avatar-img">
                <i v-else class="el-icon-user" />
              </div>
              <div class="athlete-info-compact">
                <div class="athlete-header-compact">
                  <h3 class="athlete-name-compact">{{ atleta.nombre }} {{ atleta.apellido }}</h3>
                </div>
                <div class="athlete-meta-compact">
                  <span class="athlete-cat-compact" style="margin-right: 10px;">{{ atleta.categoria_nombre || 'Sin categoría' }}</span>
                  <el-tag :type="getStatusType(atleta.estatus)" size="mini" effect="dark" class="athlete-status-compact">{{ atleta.estatus }}</el-tag>
                </div>
              </div>
            </div>
            <div v-if="atletas.length === 0" class="empty-state">
              <p>No hay atletas registrados</p>
            </div>
          </div>
        </el-card>
      </aside>

      <!-- Área de contenido -->
      <main class="content-area">
        <el-card v-if="!currentAtletaId" shadow="hover">
          <div class="empty-state">
            <i class="el-icon-user-solid" style="font-size: 4rem; color: #ddd;" />
            <h3>No hay atleta seleccionado</h3>
            <p>Selecciona un atleta de la lista o agrega uno nuevo.</p>
          </div>
        </el-card>

        <el-card v-else shadow="hover">
          <!-- Encabezado del atleta -->
          <div class="athlete-details-header">
            <div class="athlete-details-photo">
              <img v-if="currentAtleta.foto" :src="getFotoUrl(currentAtleta.foto)" class="avatar-img-large">
              <i v-else class="el-icon-user" />
            </div>
            <div class="athlete-details-info">
              <h2>{{ currentAtleta.nombre }} {{ currentAtleta.apellido }}</h2>
              <div style="display: flex; gap: 15px; margin-top: 5px; align-items: center;">
                <p style="margin: 0;">Categoría: {{ currentAtleta.categoria_nombre || 'No asignada' }}</p>
                <p style="margin: 0;">Edad: {{ calculateAge(currentAtleta.fecha_nacimiento) }} años</p>
                <el-tag :type="getStatusType(currentAtleta.estatus)">{{ currentAtleta.estatus }}</el-tag>
              </div>
              <div class="athlete-actions-header" style="margin-top: 15px;">
                <el-button type="info" size="small" icon="el-icon-data-line" @click="goToProgress">
                  Análisis de Rendimiento
                </el-button>
              </div>
            </div>
          </div>

          <!-- Tabs -->
          <el-tabs v-model="activeTab" type="border-card">
            <el-tab-pane v-if="isTabVisible('datos-personales')" label="Datos Personales" name="personal">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit" type="primary" size="small" icon="el-icon-edit" @click="openEditPersonalModal">Editar Datos Personales</el-button>
                <el-button v-if="canUserEdit && !isUserMedico" type="danger" size="small" icon="el-icon-delete" @click="deleteAtleta">Eliminar Atleta</el-button>
              </div>
              <div class="form-grid">
                <div class="form-item">
                  <label>Nombre</label>
                  <p>{{ currentAtleta.nombre }}</p>
                </div>
                <div class="form-item">
                  <label>Apellido</label>
                  <p>{{ currentAtleta.apellido }}</p>
                </div>
                <div class="form-item">
                  <label>Fecha de Nacimiento</label>
                  <p>{{ formatDate(currentAtleta.fecha_nacimiento) }}</p>
                </div>
                <div class="form-item">
                  <label>Sexo</label>
                  <p>{{ currentAtleta.sexo === 'M' ? 'Masculino' : (currentAtleta.sexo === 'F' ? 'Femenino' : 'No especificado') }}</p>
                </div>
                <div class="form-item">
                  <label>Edad</label>
                  <p>{{ calculateAge(currentAtleta.fecha_nacimiento) }} años</p>
                </div>
                <div class="form-item">
                  <label>Estatus</label>
                  <el-tag :type="getStatusType(currentAtleta.estatus)">{{ currentAtleta.estatus }}</el-tag>
                </div>
                <div class="form-item">
                  <label>Cédula</label>
                  <p>{{ currentAtleta.cedula || 'No registrada' }}</p>
                </div>
                <div class="form-item">
                  <label>Teléfono</label>
                  <p>{{ currentAtleta.telefono || 'No registrado' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Dirección</label>
                  <p>
                    {{ [currentAtleta.estado, currentAtleta.municipio, currentAtleta.parroquia, currentAtleta.descripcion_descriptiva].filter(Boolean).join(', ') || 'No registrada' }}
                  </p>
                </div>
              </div>
            </el-tab-pane>

            <!-- Nueva Tab: Datos Deportivos -->
            <el-tab-pane v-if="isTabVisible('datos-personales')" label="Datos Deportivos" name="sports">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit" type="primary" size="small" icon="el-icon-edit" @click="openEditSportsModal">Editar Datos Deportivos</el-button>
              </div>
              <div class="form-grid">
                <div class="form-item">
                  <label>Posición de Juego</label>
                  <p>{{ formatEnum(currentAtleta.posicion_de_juego_nombre) || 'No especificada' }}</p>
                </div>
                <div class="form-item">
                  <label>Categoría</label>
                  <p>{{ currentAtleta.categoria_nombre || 'No asignada' }}</p>
                </div>
                <div class="form-item">
                  <label>Entrenador a Cargo</label>
                  <p>{{ getEntrenadorNombre(currentAtleta.categoria_id) }}</p>
                </div>
                <div class="form-item">
                  <label>Pierna Dominante</label>
                  <p>{{ currentAtleta.pierna_dominante ? currentAtleta.pierna_dominante.charAt(0).toUpperCase() + currentAtleta.pierna_dominante.slice(1).toLowerCase() : 'Derecha' }}</p>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab 3: Medidas Antropométricas -->
            <el-tab-pane v-if="isTabVisible('medidas-antropometricas')" label="Medidas Antropométricas" name="anthropometric">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit || isUserEntrenador" type="primary" size="small" icon="el-icon-plus" @click="openAnthropometricModal">
                  Agregar Medidas
                </el-button>
              </div>

              <div class="medidas-list">
                <el-table
                  :data="medidas"
                  style="width: 100%"
                  border
                  size="small"
                >
                  <el-table-column prop="fecha_medicion" label="Fecha" width="150" align="center">
                    <template slot-scope="scope">
                      {{ formatDateTime(scope.row.fecha_medicion) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="peso" label="Peso (kg)" width="90" align="center" />
                  <el-table-column prop="altura" label="Altura (cm)" width="95" align="center" />
                  <el-table-column prop="indice_de_masa" label="IMC" width="90" align="center" />
                  <el-table-column prop="porcentaje_grasa" label="% Grasa" width="90" align="center" />
                  <el-table-column prop="porcentaje_musculatura" label="% Musculatura" width="115" align="center" />
                  <el-table-column prop="envergadura" label="Envergadura" width="100" align="center" />
                  <el-table-column prop="largo_de_pierna" label="L. Pierna" width="95" align="center" />
                  <el-table-column prop="largo_de_torso" label="L. Torso" width="90" align="center" />
                  <el-table-column label="Acciones" width="120" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="openAnthropometricModal(scope.row)">Editar</el-button>
                      <el-button type="text" size="small" style="color: red" @click="deleteMedida(scope.row.medidas_id)">Eliminar</el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <div v-if="!medidas || medidas.length === 0" class="empty-tab" style="padding-top: 30px">
                  <i class="el-icon-data-line" />
                  <p>No hay medidas antropométricas registradas</p>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab 4: Rendimiento -->
            <el-tab-pane v-if="isTabVisible('rendimiento')" label="Rendimiento" name="performance">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit || isUserEntrenador" type="primary" size="small" icon="el-icon-plus" @click="openPerformanceModal">
                  Agregar Rendimiento
                </el-button>
              </div>

              <div class="performance-list">
                <el-table
                  :data="tests"
                  style="width: 100%"
                  border
                  size="small"
                >
                  <el-table-column prop="fecha_test" label="Fecha" width="150" align="center">
                    <template slot-scope="scope">
                      {{ formatDateTime(scope.row.fecha_test) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="test_de_fuerza" label="Fuerza" />
                  <el-table-column prop="test_resistencia" label="Resistencia" />
                  <el-table-column prop="test_velocidad" label="Velocidad" />
                  <el-table-column prop="test_coordinacion" label="Coordinación" />
                  <el-table-column prop="test_de_reaccion" label="Reacción" />
                  <el-table-column label="Acciones" width="120" align="center">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="openPerformanceModal(scope.row)">Editar</el-button>
                      <el-button type="text" size="small" style="color: red" @click="deletePerformanceTest(scope.row.test_id)">Eliminar</el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <div v-if="!tests || tests.length === 0" class="empty-tab" style="padding-top: 30px">
                  <i class="el-icon-trophy" />
                  <p>No hay tests de rendimiento registrados</p>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab 5: Representante -->
            <el-tab-pane v-if="isTabVisible('representante')" label="Representante" name="representante">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit" type="primary" size="small" icon="el-icon-edit" @click="openTutorModal">
                  {{ (tutor && !isSelfRepresented) ? 'Editar Representante' : 'Asignar Representante' }}
                </el-button>
                <el-button v-if="canUserEdit && tutor && !isSelfRepresented" type="danger" size="small" icon="el-icon-delete" @click="deleteTutor">
                  Eliminar Representante
                </el-button>
              </div>
              <div v-if="tutor && !isSelfRepresented" class="form-grid">
                <div class="form-item">
                  <label>Nombre del Representante</label>
                  <p>{{ tutor.nombre_completo }}</p>
                </div>
                <div class="form-item">
                  <label>Cédula</label>
                  <p>{{ tutor.cedula || 'No registrada' }}</p>
                </div>
                <div class="form-item">
                  <label>Tipo de Relación</label>
                  <el-tag>{{ tutor.tipo_relacion }}</el-tag>
                </div>
                <div class="form-item">
                  <label>Teléfono</label>
                  <p>{{ tutor.telefono || 'No especificado' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Dirección</label>
                  <p>
                    {{ [tutor.estado, tutor.municipio, tutor.parroquia, tutor.descripcion_descriptiva].filter(Boolean).join(', ') || 'No registrada' }}
                  </p>
                </div>
              </div>
              <div v-else class="empty-tab">
                <i class="el-icon-user-solid" />
                <p>No hay representante asignado</p>
                <p v-if="!isSelfRepresented" class="hint">Haz clic en "Asignar Representante" para asignar un representante</p>
                <p v-else class="hint">El atleta se representa a sí mismo. Haz clic en "Editar Representante" si deseas asignar un tercero.</p>
              </div>
            </el-tab-pane>

            <!-- Tab: Ficha Médica (Movido) -->
            <el-tab-pane v-if="isTabVisible('ficha-medica')" label="Ficha Médica" name="medical">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit || isUserMedico" type="primary" size="small" icon="el-icon-edit" @click="openMedicalModal">
                  {{ fichaMedica ? 'Editar Ficha Médica' : 'Agregar Ficha Médica' }}
                </el-button>
              </div>
              <div v-if="fichaMedica" class="form-grid">
                <div class="form-item">
                  <label>Tipo Sanguíneo</label>
                  <p>{{ fichaMedica.tipo_sanguineo || 'No especificado' }}</p>
                </div>
                <div class="form-item">
                  <label>Alergias</label>
                  <p>{{ fichaMedica.alergias || 'Ninguna' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Lesiones</label>
                  <p>{{ fichaMedica.lesion || 'Ninguna' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Condición Médica</label>
                  <p>{{ fichaMedica.condicion_medica || 'Ninguna' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Observaciones</label>
                  <p>{{ fichaMedica.observacion || 'Sin observaciones' }}</p>
                </div>
              </div>
              <div v-else class="empty-tab">
                <i class="el-icon-document" />
                <p>No hay ficha médica registrada</p>
                <p v-if="canUserEdit || isUserMedico" class="hint">Haz clic en "Agregar Ficha Médica" para crear la ficha médica</p>
              </div>
            </el-tab-pane>

            <!-- Tab 6: Atención Médica -->
            <el-tab-pane v-if="isTabVisible('ficha-medica')" label="Atención Médica" name="atencion_medica">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit || isUserMedico" type="primary" size="small" icon="el-icon-plus" @click="openAtencionModal">
                  Registrar Atención
                </el-button>
                <el-button v-if="canUserEdit || isUserMedico" type="primary" size="small" icon="el-icon-edit" @click="openCarnetModal">
                  {{ carnetDiscapacidad ? 'Editar Carnet Discapacidad' : 'Registrar Carnet Discapacidad' }}
                </el-button>
              </div>
              <div v-if="carnetDiscapacidad" class="carnet-info-banner">
                <el-alert
                  :title="'Posee carnet de discapacidad: ' + carnetDiscapacidad.nombre_tipo + ' (' + carnetDiscapacidad.porcentaje_discapacidad + '%)'"
                  type="info"
                  show-icon
                  :closable="false"
                >
                  <p><strong>Nro Carnet:</strong> {{ carnetDiscapacidad.nro_carnet }} | <strong>Fecha Registro:</strong> {{ formatDate(carnetDiscapacidad.fecha_registro) }}</p>
                </el-alert>
              </div>

              <div class="medical-attention-list">
                <!-- Tabla aquí -->
                <el-table
                  :data="atencionesMedicas"
                  style="width: 100%"
                  border
                  size="small"
                >
                  <el-table-column prop="fecha_suceso" label="Fecha" width="100">
                    <template slot-scope="scope">
                      {{ formatDate(scope.row.fecha_suceso) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="diagnostico" label="Diagnóstico" />
                  <el-table-column label="Especialista">
                    <template slot-scope="scope">
                      {{ scope.row.especialista_nombre }} {{ scope.row.especialista_apellido }}
                    </template>
                  </el-table-column>
                  <el-table-column label="Estado Disp." width="120">
                    <template slot-scope="scope">
                      <el-tag :type="getDisponibilidadMedicaType(scope.row.estado_disponibilidad)">
                        {{ getDisponibilidadMedicaLabel(scope.row.estado_disponibilidad) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="Acciones" width="100">
                    <template slot-scope="scope">
                      <el-button type="text" size="small" @click="editAtencion(scope.row)">Editar</el-button>
                      <el-button type="text" size="small" style="color: red" @click="deleteAtencion(scope.row.atencion_id)">Eliminar</el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <div v-if="!atencionesMedicas || atencionesMedicas.length === 0" class="empty-tab" style="padding-top: 30px">
                  <i class="el-icon-document" />
                  <p>No hay historial de atenciones médicas</p>
                </div>
              </div>
            </el-tab-pane>

            <!-- Tab 7: Historial de Partidos -->
            <el-tab-pane v-if="isTabVisible('rendimiento')" label="Historial de Partidos" name="historial_partidos">
              <div class="partidos-list">
                <el-table
                  :data="historialPartidos"
                  style="width: 100%"
                  border
                  size="small"
                >
                  <el-table-column prop="fecha_partido" label="Fecha" width="100">
                    <template slot-scope="scope">
                      {{ formatDate(scope.row.fecha_partido) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="nombre_rival" label="Rival" />
                  <el-table-column label="Resultado" width="120">
                    <template slot-scope="scope">
                      <el-tag :type="getPartidoResultadoType(scope.row.resultado)">
                        {{ getPartidoResultadoLabel(scope.row.resultado) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="Marcador" width="100" align="center">
                    <template slot-scope="scope">
                      {{ scope.row.goles_anotados }} - {{ scope.row.goles_recibidos }}
                    </template>
                  </el-table-column>
                </el-table>

                <div v-if="!historialPartidos || historialPartidos.length === 0" class="empty-tab" style="padding-top: 30px">
                  <i class="el-icon-medal" />
                  <p>No hay historial de partidos para esta categoría.</p>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </main>
    </div>

    <!-- Modal Atleta -->
    <el-dialog
      :title="isEditingAtleta ? 'Editar Atleta' : 'Agregar Nuevo Atleta'"
      :visible.sync="showAtletaModal"
      width="700px"
      :close-on-click-modal="false"
      @closed="resetAtletaStep"
    >
      <el-steps :active="atletaStep" finish-status="success" align-center style="margin-bottom: 20px;">
        <el-step title="Datos Personales" />
        <el-step title="Datos Deportivos" />
        <el-step title="Representante" />
      </el-steps>

      <el-form ref="atletaForm" :model="atletaForm" :rules="atletaRules" label-position="top">
        <!-- PASO 1: Datos Personales y Dirección -->
        <div v-show="atletaStep === 0">
          <div class="photo-upload-container">
            <el-upload
              class="avatar-uploader"
              :action="backendUrl + '/api/atletas/upload'"
              :show-file-list="false"
              :on-success="handleUploadSuccess"
              :before-upload="beforeAvatarUpload"
              name="foto"
            >
              <div v-if="atletaForm.foto" class="photo-preview-wrapper">
                <img :src="getFotoUrl(atletaForm.foto)" class="avatar-preview">
                <div class="photo-overlay">
                  <i class="el-icon-delete" @click.stop="removePhoto" />
                </div>
              </div>
              <div v-else class="avatar-uploader-icon">
                <i class="el-icon-plus" />
                <span>Subir Foto</span>
              </div>
            </el-upload>
          </div>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Nombre" prop="nombre">
                <el-input v-model="atletaForm.nombre" placeholder="Nombre completo" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Apellido" prop="apellido">
                <el-input v-model="atletaForm.apellido" placeholder="Apellido completo" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Cédula (Opcional)">
                <el-input
                  v-model="atletaForm.cedula"
                  placeholder="Ej: 123456789"
                  maxlength="9"
                  @input="v => atletaForm.cedula = v.replace(/\D/g, '')"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Fecha de Nacimiento" prop="fecha_nacimiento">
                <el-date-picker
                  v-model="atletaForm.fecha_nacimiento"
                  type="date"
                  placeholder="Seleccionar"
                  style="width: 100%"
                  value-format="yyyy-MM-dd"
                  :picker-options="datePickerOptions"
                  @change="checkUnderage"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Sexo" prop="sexo">
                <el-select v-model="atletaForm.sexo" placeholder="Seleccionar" style="width: 100%">
                  <el-option label="Masculino" value="M" />
                  <el-option label="Femenino" value="F" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item :class="{'is-required': !isUnderage}">
                <span slot="label">
                  Teléfono
                </span>
                <el-input
                  v-model="atletaForm.telefono"
                  placeholder="Ej: 04141234567"
                  maxlength="11"
                  @input="v => atletaForm.telefono = v.replace(/\D/g, '')"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Estatus">
                <el-select v-model="atletaForm.estatus" placeholder="Seleccionar" style="width: 100%">
                  <el-option label="ACTIVO" value="ACTIVO" />
                  <el-option label="INACTIVO" value="INACTIVO" />
                  <el-option label="LESIONADO" value="LESIONADO" />
                  <el-option label="SUSPENDIDO" value="SUSPENDIDO" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

          <h4 style="margin-top: 10px; margin-bottom: 10px; color: #606266;">Dirección de Habitación</h4>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Estado" class="is-required">
                <el-select v-model="atletaForm.direccion.estado" placeholder="Seleccionar" style="width: 100%" filterable @change="handleEstadoChangeAtleta">
                  <el-option v-for="estado in estadosList" :key="estado.id" :label="estado.nombre" :value="estado.nombre" />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Municipio" class="is-required">
                <el-select v-model="atletaForm.direccion.municipio" placeholder="Seleccionar" style="width: 100%" filterable @change="handleMunicipioChangeAtleta">
                  <el-option v-for="mun in municipiosListAtleta" :key="mun.id" :label="mun.nombre" :value="mun.nombre" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Parroquia" class="is-required">
                <el-select v-model="atletaForm.direccion.parroquia" placeholder="Seleccionar" style="width: 100%" filterable>
                  <el-option v-for="par in parroquiasListAtleta" :key="par.id" :label="par.nombre" :value="par.nombre" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="24">
              <el-form-item label="Descripción de la Dirección" class="is-required">
                <el-input v-model="atletaForm.direccion.descripcion_descriptiva" placeholder="Calle, casa, edificio, referencias..." type="textarea" :rows="2" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- PASO 2: Datos Deportivos -->
        <div v-show="atletaStep === 1">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Categoría" prop="categoria_id">
                <el-select v-model="atletaForm.categoria_id" placeholder="Seleccionar" style="width: 100%">
                  <el-option
                    v-for="cat in categorias"
                    :key="cat.categoria_id"
                    :label="cat.nombre_categoria"
                    :value="cat.categoria_id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Entrenador a Cargo">
                <el-input
                  :value="getEntrenadorNombre(atletaForm.categoria_id)"
                  disabled
                  placeholder="Se autocompleta con la categoría"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Posición de Juego">
                <el-select v-model="atletaForm.posicion_de_juego" placeholder="Seleccionar" style="width: 100%">
                  <el-option label="Sin definir" :value="null" />
                  <el-option
                    v-for="pos in posiciones"
                    :key="pos.posicion_id"
                    :label="formatEnum(pos.nombre_posicion)"
                    :value="pos.posicion_id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Pierna Dominante">
                <el-select v-model="atletaForm.pierna_dominante" placeholder="Seleccionar" style="width: 100%">
                  <el-option label="Derecha" value="Derecha" />
                  <el-option label="Izquierda" value="Izquierda" />
                  <el-option label="Ambidiestro" value="Ambidiestro" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- PASO 3: Representante -->
        <div v-show="atletaStep === 2">
          <el-alert
            v-if="isUnderage"
            title="El atleta es menor de edad. Los datos del representante son obligatorios."
            type="warning"
            show-icon
            style="margin-bottom: 20px;"
            :closable="false"
          />
          <el-alert
            v-else
            title="El atleta es mayor de edad. Los datos del representante son opcionales."
            type="info"
            show-icon
            style="margin-bottom: 20px;"
            :closable="false"
          />

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Nombre del Representante" :class="{'is-required': isUnderage}">
                <el-input v-model="atletaForm.representante.nombre" placeholder="Nombre del representante" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Apellido del Representante" :class="{'is-required': isUnderage}">
                <el-input v-model="atletaForm.representante.apellido" placeholder="Apellido del representante" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Cédula" :class="{'is-required': isUnderage}">
                <el-input
                  v-model="atletaForm.representante.cedula"
                  placeholder="Ej: 12345678"
                  maxlength="10"
                  @input="v => atletaForm.representante.cedula = v.replace(/\D/g, '')"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Teléfono" :class="{'is-required': isUnderage}">
                <el-input
                  v-model="atletaForm.representante.telefono"
                  placeholder="Ej: 04141234567"
                  maxlength="11"
                  @input="v => atletaForm.representante.telefono = v.replace(/\D/g, '')"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Relación con el atleta" :class="{'is-required': isUnderage}">
                <el-select v-model="atletaForm.representante.tipo_relacion" placeholder="Seleccionar" style="width: 100%">
                  <el-option label="Padres" value="padres" />
                  <el-option label="Abuelo/a" value="abuelo/a" />
                  <el-option label="Tío/a" value="tio/a" />
                  <el-option label="Hermano/a" value="hermano/a" />
                  <el-option label="Primo/a" value="primo/a" />
                  <el-option label="Representante Legal" value="representante" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <span slot="footer">
        <el-button v-if="atletaStep > 0" @click="atletaStep--">Atrás</el-button>
        <el-button v-if="atletaStep < 2" type="primary" @click="nextAtletaStep">Siguiente</el-button>
        <el-button v-if="atletaStep === 2" type="success" :loading="loading" @click="saveAtleta">
          Guardar Atleta
        </el-button>
      </span>
    </el-dialog>

    <!-- Modal Editar Datos Personales -->
    <el-dialog
      title="Editar Datos Personales"
      :visible.sync="showEditPersonalModal"
      width="700px"
      :close-on-click-modal="false"
    >
      <el-form ref="editPersonalForm" :model="atletaForm" :rules="atletaRules" label-position="top">
        <div class="photo-upload-container">
          <el-upload
            class="avatar-uploader"
            :action="backendUrl + '/api/atletas/upload'"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeAvatarUpload"
            name="foto"
          >
            <div v-if="atletaForm.foto" class="photo-preview-wrapper">
              <img :src="getFotoUrl(atletaForm.foto)" class="avatar-preview">
              <div class="photo-overlay">
                <i class="el-icon-delete" @click.stop="removePhoto" />
              </div>
            </div>
            <div v-else class="avatar-uploader-icon">
              <i class="el-icon-plus" />
              <span>Subir Foto</span>
            </div>
          </el-upload>
        </div>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Nombre" prop="nombre">
              <el-input v-model="atletaForm.nombre" placeholder="Nombre completo" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Apellido" prop="apellido">
              <el-input v-model="atletaForm.apellido" placeholder="Apellido completo" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Cédula (Opcional)">
              <el-input
                v-model="atletaForm.cedula"
                placeholder="Ej: 123456789"
                maxlength="9"
                @input="v => atletaForm.cedula = v.replace(/\D/g, '')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fecha de Nacimiento" prop="fecha_nacimiento">
              <el-date-picker
                v-model="atletaForm.fecha_nacimiento"
                type="date"
                placeholder="Seleccionar"
                style="width: 100%"
                value-format="yyyy-MM-dd"
                :picker-options="datePickerOptions"
                @change="checkUnderage"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Sexo" prop="sexo">
              <el-select v-model="atletaForm.sexo" placeholder="Seleccionar" style="width: 100%">
                <el-option label="Masculino" value="M" />
                <el-option label="Femenino" value="F" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item :class="{'is-required': !isUnderage}">
              <span slot="label">
                Teléfono
              </span>
              <el-input
                v-model="atletaForm.telefono"
                placeholder="Ej: 04141234567"
                maxlength="11"
                @input="v => atletaForm.telefono = v.replace(/\D/g, '')"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Estatus">
              <el-select v-model="atletaForm.estatus" placeholder="Seleccionar" style="width: 100%">
                <el-option label="ACTIVO" value="ACTIVO" />
                <el-option label="INACTIVO" value="INACTIVO" />
                <el-option label="LESIONADO" value="LESIONADO" />
                <el-option label="SUSPENDIDO" value="SUSPENDIDO" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <h4 style="margin-top: 10px; margin-bottom: 10px; color: #606266;">Dirección de Habitación</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Estado" class="is-required">
              <el-select v-model="atletaForm.direccion.estado" placeholder="Seleccionar" style="width: 100%" filterable @change="handleEstadoChangeAtleta">
                <el-option v-for="estado in estadosList" :key="estado.id" :label="estado.nombre" :value="estado.nombre" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Municipio" class="is-required">
              <el-select v-model="atletaForm.direccion.municipio" placeholder="Seleccionar" style="width: 100%" filterable @change="handleMunicipioChangeAtleta">
                <el-option v-for="mun in municipiosListAtleta" :key="mun.id" :label="mun.nombre" :value="mun.nombre" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Parroquia" class="is-required">
              <el-select v-model="atletaForm.direccion.parroquia" placeholder="Seleccionar" style="width: 100%" filterable>
                <el-option v-for="par in parroquiasListAtleta" :key="par.id" :label="par.nombre" :value="par.nombre" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item label="Descripción de la Dirección" class="is-required">
              <el-input v-model="atletaForm.direccion.descripcion_descriptiva" placeholder="Calle, casa, edificio, referencias..." type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="showEditPersonalModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveEditPersonal">Guardar Cambios</el-button>
      </span>
    </el-dialog>

    <!-- Modal Editar Datos Deportivos -->
    <el-dialog
      title="Editar Datos Deportivos"
      :visible.sync="showEditSportsModal"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="editSportsForm" :model="atletaForm" :rules="atletaRules" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Categoría" prop="categoria_id">
              <el-select v-model="atletaForm.categoria_id" placeholder="Seleccionar" style="width: 100%">
                <el-option
                  v-for="cat in categorias"
                  :key="cat.categoria_id"
                  :label="cat.nombre_categoria"
                  :value="cat.categoria_id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Entrenador a Cargo">
              <el-input
                :value="getEntrenadorNombre(atletaForm.categoria_id)"
                disabled
                placeholder="Se autocompleta con la categoría"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Posición de Juego">
              <el-select v-model="atletaForm.posicion_de_juego" placeholder="Seleccionar" style="width: 100%">
                <el-option label="Sin definir" :value="null" />
                <el-option
                  v-for="pos in posiciones"
                  :key="pos.posicion_id"
                  :label="formatEnum(pos.nombre_posicion)"
                  :value="pos.posicion_id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Pierna Dominante">
              <el-select v-model="atletaForm.pierna_dominante" placeholder="Seleccionar" style="width: 100%">
                <el-option label="Derecha" value="Derecha" />
                <el-option label="Izquierda" value="Izquierda" />
                <el-option label="Ambidiestro" value="Ambidiestro" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="showEditSportsModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveEditSports">Guardar Cambios</el-button>
      </span>
    </el-dialog>

    <!-- Modal Ficha Médica -->
    <el-dialog
      title="Ficha Médica"
      :visible.sync="showMedicalModal"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="medicalForm" :model="medicalForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tipo Sanguíneo">
              <el-select v-model="medicalForm.tipo_sanguineo" placeholder="Seleccionar" style="width: 100%">
                <el-option label="A+" value="A+" />
                <el-option label="A-" value="A-" />
                <el-option label="B+" value="B+" />
                <el-option label="B-" value="B-" />
                <el-option label="O+" value="O+" />
                <el-option label="O-" value="O-" />
                <el-option label="AB+" value="AB+" />
                <el-option label="AB-" value="AB-" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Alergias">
              <el-input v-model="medicalForm.alergias" placeholder="Ej: Polen, maní" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Lesiones">
          <el-input v-model="medicalForm.lesion" type="textarea" :rows="2" placeholder="Lesiones previas" />
        </el-form-item>
        <el-form-item label="Condición Médica">
          <el-input v-model="medicalForm.condicion_medica" type="textarea" :rows="2" placeholder="Condiciones médicas actuales" />
        </el-form-item>
        <el-form-item label="Observaciones">
          <el-input v-model="medicalForm.observacion" type="textarea" :rows="3" placeholder="Observaciones adicionales" />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showMedicalModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveMedical">Guardar</el-button>
      </span>
    </el-dialog>

    <!-- Modal Medidas Antropométricas -->
    <el-dialog
      :title="editingAnthropometricId ? 'Editar Medidas Antropométricas' : 'Agregar Medidas Antropométricas'"
      :visible.sync="showAnthropometricModal"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="anthropometricForm" :model="anthropometricForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Peso (kg)">
              <el-input-number v-model="anthropometricForm.peso" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Altura (cm)">
              <el-input-number v-model="anthropometricForm.altura" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Porcentaje de Grasa">
              <el-input-number v-model="anthropometricForm.porcentaje_grasa" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Porcentaje de Musculatura">
              <el-input-number v-model="anthropometricForm.porcentaje_musculatura" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Envergadura (cm)">
              <el-input-number v-model="anthropometricForm.envergadura" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Largo de Pierna (cm)">
              <el-input-number v-model="anthropometricForm.largo_de_pierna" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Largo de Torso (cm)">
              <el-input-number v-model="anthropometricForm.largo_de_torso" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Fecha y Hora de Medición">
          <el-date-picker
            v-model="anthropometricForm.fecha_medicion"
            type="datetime"
            placeholder="Seleccionar fecha y hora"
            style="width: 100%"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showAnthropometricModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveAnthropometric">Guardar</el-button>
      </span>
    </el-dialog>

    <!-- Modal Tests de Rendimiento -->
    <el-dialog
      :title="editingPerformanceId ? 'Editar Test de Rendimiento' : 'Agregar Test de Rendimiento'"
      :visible.sync="showPerformanceModal"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form ref="performanceForm" :model="performanceForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Test de Fuerza">
              <el-input-number v-model="performanceForm.test_de_fuerza" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Test de Resistencia">
              <el-input-number v-model="performanceForm.test_resistencia" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Test de Velocidad">
              <el-input-number v-model="performanceForm.test_velocidad" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Test de Coordinación">
              <el-input-number v-model="performanceForm.test_coordinacion" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Test de Reacción">
              <el-input-number v-model="performanceForm.test_de_reaccion" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fecha y Hora del Test">
              <el-date-picker
                v-model="performanceForm.fecha_test"
                type="datetime"
                placeholder="Seleccionar fecha y hora"
                style="width: 100%"
                value-format="yyyy-MM-dd HH:mm:ss"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="showPerformanceModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="savePerformance">Guardar</el-button>
      </span>
    </el-dialog>

    <!-- Modal Representante -->
    <el-dialog
      :title="isEditingTutor ? 'Editar Representante' : 'Asignar Representante'"
      :visible.sync="showTutorModal"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetTutorForm"
    >
      <el-form ref="tutorForm" :model="tutorForm" :rules="tutorRules" label-position="top">
        <el-form-item label="Nombre del Representante" prop="nombre_completo">
          <el-input v-model="tutorForm.nombre_completo" placeholder="Nombre completo del representante" />
        </el-form-item>
        <el-form-item label="Cédula" prop="cedula">
          <el-input
            v-model="tutorForm.cedula"
            placeholder="Ej: 12345678"
            maxlength="10"
            @input="v => tutorForm.cedula = v.replace(/\D/g, '')"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Teléfono" prop="telefono">
              <el-input
                v-model="tutorForm.telefono"
                placeholder="Ej: 04141234567"
                maxlength="11"
                @input="v => tutorForm.telefono = v.replace(/\D/g, '')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tipo de Relación" prop="tipo_relacion">
              <el-select v-model="tutorForm.tipo_relacion" placeholder="Seleccionar" style="width: 100%">
                <el-option label="Padres" value="padres" />
                <el-option label="Abuelo/a" value="abuelo/a" />
                <el-option label="Tío/a" value="tio/a" />
                <el-option label="Hermano/a" value="hermano/a" />
                <el-option label="Primo/a" value="primo/a" />
                <el-option label="Representante Legal" value="representante" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <h4 style="margin-top: 10px; margin-bottom: 10px; color: #606266;">Dirección del Representante</h4>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Estado" prop="direccion.estado">
              <el-select v-model="tutorForm.direccion.estado" placeholder="Seleccionar" style="width: 100%" filterable @change="handleEstadoChangeTutor">
                <el-option v-for="estado in estadosList" :key="estado.id" :label="estado.nombre" :value="estado.nombre" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Municipio" prop="direccion.municipio">
              <el-select v-model="tutorForm.direccion.municipio" placeholder="Seleccionar" style="width: 100%" filterable @change="handleMunicipioChangeTutor">
                <el-option v-for="mun in municipiosListTutor" :key="mun.id" :label="mun.nombre" :value="mun.nombre" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Parroquia" prop="direccion.parroquia">
              <el-select v-model="tutorForm.direccion.parroquia" placeholder="Seleccionar" style="width: 100%" filterable>
                <el-option v-for="par in parroquiasListTutor" :key="par.id" :label="par.nombre" :value="par.nombre" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Dirección Detallada" prop="direccion.descripcion_descriptiva" class="is-required">
          <el-input v-model="tutorForm.direccion.descripcion_descriptiva" type="textarea" :rows="2" placeholder="Calle, casa, edificio..." />
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showTutorModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveTutor">
          {{ isEditingTutor ? 'Actualizar' : 'Asignar' }} Representante
        </el-button>
      </span>
    </el-dialog>

    <!-- Modal Atención Médica -->
    <el-dialog
      :title="isEditingAtencion ? 'Editar Atención Médica' : 'Registrar Atención Médica'"
      :visible.sync="showAtencionModal"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetAtencionForm"
    >
      <el-form ref="atencionForm" :model="atencionForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tipo de Registro" required>
              <el-select v-model="atencionForm.tipo_registro" placeholder="Seleccionar" style="width: 100%">
                <el-option label="Lesión" :value="1" />
                <el-option label="Enfermedad" :value="2" />
                <el-option label="Control" :value="3" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fecha Suceso" required>
              <el-date-picker
                v-model="atencionForm.fecha_suceso"
                type="date"
                placeholder="Seleccionar"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Especialista" required>
          <el-select v-model="atencionForm.especialista_id" placeholder="Seleccionar Especialista" style="width: 100%">
            <el-option
              v-for="medico in medicosList"
              :key="medico.personal_id"
              :label="medico.nombre + ' ' + medico.apellido"
              :value="medico.personal_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Descripción" required>
          <el-input v-model="atencionForm.descripcion" type="textarea" :rows="2" placeholder="Describa el suceso..." />
        </el-form-item>
        <el-form-item label="Diagnóstico">
          <el-input v-model="atencionForm.diagnostico" placeholder="Ej: Esguince tobillo derecho" />
        </el-form-item>
        <el-form-item label="Tratamiento Indicado">
          <el-input v-model="atencionForm.tratamiento_indicado" type="textarea" :rows="2" placeholder="Reposo, hielo..." />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Fecha Alta Estimada">
              <el-date-picker
                v-model="atencionForm.fecha_alta_estimada"
                type="date"
                placeholder="Seleccionar"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fecha Alta Real">
              <el-date-picker
                v-model="atencionForm.fecha_alta_real"
                type="date"
                placeholder="Seleccionar"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Disponibilidad Médica">
          <el-select v-model="atencionForm.estado_disponibilidad" placeholder="Seleccionar" style="width: 100%">
            <el-option label="No Apto" :value="0" />
            <el-option label="Trabajo Diferenciado" :value="1" />
            <el-option label="Apto" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="showAtencionModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveAtencion">Guardar</el-button>
      </span>
    </el-dialog>

    <!-- Modal Carnet Discapacidad -->
    <el-dialog
      :title="carnetDiscapacidad ? 'Editar Carnet Discapacidad' : 'Registrar Carnet Discapacidad'"
      :visible.sync="showCarnetModal"
      width="500px"
      :close-on-click-modal="false"
      @closed="resetCarnetForm"
    >
      <el-form ref="carnetForm" :model="carnetForm" label-position="top">
        <el-form-item label="Tipo de Discapacidad" required>
          <el-select v-model="carnetForm.tipo_discapacidad_id" placeholder="Seleccionar" style="width: 100%">
            <el-option
              v-for="tipo in tiposDiscapacidadList"
              :key="tipo.tipos_discapacidad_id"
              :label="tipo.nombre_tipo"
              :value="tipo.tipos_discapacidad_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Nro. Carnet">
          <el-input v-model="carnetForm.nro_carnet" placeholder="Ej: 123456789" />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Porcentaje">
              <el-input v-model="carnetForm.porcentaje_discapacidad" type="number" placeholder="Ej: 30" append="%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Fecha Registro">
              <el-date-picker
                v-model="carnetForm.fecha_registro"
                type="date"
                placeholder="Seleccionar"
                style="width: 100%"
                value-format="yyyy-MM-dd"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <span slot="footer">
        <el-button @click="showCarnetModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveCarnet">Guardar</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import request from '@/utils/request'
import { canEdit, isMedico, isEntrenador, getVisibleAtletasTabs } from '@/utils/permission'
import { mapGetters } from 'vuex'
import { getPosiciones } from '@/api/posiciones'

export default {
  name: 'Atletas',
  data() {
    return {
      atletas: [],
      categorias: [],
      tutores: [],
      posiciones: [],
      currentAtletaId: null,
      currentAtleta: {},
      fichaMedica: null,
      medidas: [],
      tests: [],
      tutor: null,
      atencionesMedicas: [],
      carnetDiscapacidad: null,
      historialPartidos: [],
      activeTab: 'personal',
      loading: false,
      loadingAtletas: false,
      backendUrl: 'http://localhost:3000',

      // Formularios
      atletaStep: 0,

      showAtletaModal: false,
      showEditPersonalModal: false,
      showEditSportsModal: false,
      showMedicalModal: false,
      showAnthropometricModal: false,
      editingAnthropometricId: null,
      showPerformanceModal: false,
      editingPerformanceId: null,
      showTutorModal: false,
      showAtencionModal: false,
      showCarnetModal: false,

      // Estados de edición
      isEditingAtleta: false,
      isEditingTutor: false,
      isEditingAtencion: false,

      // Filtros y búsqueda
      searchQuery: '',
      searchCedula: '',
      filterCedula: 'todos', // 'todos', 'con_cedula', 'sin_cedula'
      filterSinCedula: false,
      filterCategoria: '',
      filterEstatus: '', // "" significa por defecto (Activos/Lesionados)
      filterOrder: 'recent',
      searchTimeout: null,
      searchCedulaTimeout: null,

      // Listas para dirección dinámica
      estadosList: [],
      municipiosListAtleta: [],
      parroquiasListAtleta: [],
      municipiosListTutor: [],
      parroquiasListTutor: [],

      // Formularios
      atletaForm: {
        nombre: '',
        apellido: '',
        cedula: '',
        fecha_nacimiento: '',
        sexo: 'M',
        posicion_de_juego: '',
        categoria_id: '',
        tutor_id: null,
        telefono: '',
        direccion: {
          estado: '',
          municipio: '',
          parroquia: '',
          descripcion_descriptiva: ''
        },
        representante: {
          nombre: '',
          apellido: '',
          cedula: '',
          telefono: '',
          tipo_relacion: ''
        },
        estatus: 'ACTIVO',
        foto: null,
        pierna_dominante: 'Derecha'
      },
      medicalForm: {
        tipo_sanguineo: '',
        alergias: '',
        lesion: '',
        condicion_medica: '',
        observacion: ''
      },
      anthropometricForm: {
        peso: null,
        altura: null,
        porcentaje_grasa: null,
        porcentaje_musculatura: null,
        envergadura: null,
        largo_de_pierna: null,
        largo_de_torso: null,
        fecha_medicion: ''
      },
      performanceForm: {
        test_de_fuerza: null,
        test_resistencia: null,
        test_velocidad: null,
        test_coordinacion: null,
        test_de_reaccion: null,
        fecha_test: ''
      },
      tutorForm: {
        nombre_completo: '',
        cedula: '',
        telefono: '',
        direccion: {
          estado: '',
          municipio: '',
          parroquia: '',
          descripcion_descriptiva: ''
        },
        tipo_relacion: ''
      },
      atencionForm: {
        tipo_registro: 1,
        descripcion: '',
        diagnostico: '',
        fecha_suceso: '',
        fecha_alta_estimada: '',
        fecha_alta_real: '',
        tratamiento_indicado: '',
        especialista_id: null,
        estado_disponibilidad: 0
      },
      carnetForm: {
        tipo_discapacidad_id: null,
        nro_carnet: '',
        porcentaje_discapacidad: null,
        fecha_registro: ''
      },
      tiposDiscapacidadList: [],
      medicosList: [],

      // Reglas de validación
      atletaRules: {
        nombre: [
          { required: true, message: 'El nombre es requerido', trigger: 'blur' },
          { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras', trigger: 'blur' }
        ],
        apellido: [
          { required: true, message: 'El apellido es requerido', trigger: 'blur' },
          { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras', trigger: 'blur' }
        ],
        fecha_nacimiento: [{ required: true, message: 'La fecha de nacimiento es requerida', trigger: 'change' }],
        sexo: [{ required: true, message: 'El sexo es requerido', trigger: 'change' }],
        categoria_id: [{ required: true, message: 'La categoría es requerida', trigger: 'change' }]
      },
      tutorRules: {
        nombre_completo: [
          { required: true, message: 'El nombre es requerido', trigger: 'blur' },
          { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras', trigger: 'blur' }
        ],
        cedula: [{ required: true, message: 'La cédula es requerida', trigger: 'blur' }],
        telefono: [
          { required: true, message: 'El teléfono es requerido', trigger: 'blur' },
          { pattern: /^[0-9]{11}$/, message: 'El teléfono debe tener 11 dígitos numéricos', trigger: 'blur' }
        ],
        tipo_relacion: [{ required: true, message: 'El tipo de relación es requerido', trigger: 'change' }],
        'direccion.pais': [{ required: true, message: 'El país es requerido', trigger: 'change' }],
        'direccion.estado': [{ required: true, message: 'El estado es requerido', trigger: 'change' }],
        'direccion.municipio': [{ required: true, message: 'El municipio es requerido', trigger: 'blur' }],
        'direccion.parroquia': [{ required: true, message: 'La parroquia es requerida', trigger: 'blur' }],
        'direccion.descripcion_descriptiva': [{ required: true, message: 'La dirección detallada es requerida', trigger: 'blur' }]
      }
    }
  },
  computed: {
    ...mapGetters(['roles']),

    // Verificar si el usuario puede editar
    canUserEdit() {
      return canEdit()
    },

    isUserMedico() {
      return isMedico()
    },

    // Verificar si el usuario es entrenador
    isUserEntrenador() {
      return isEntrenador()
    },

    // Obtener pestañas visibles según el rol
    visibleTabs() {
      return getVisibleAtletasTabs()
    },

    // Verificar si una pestaña específica es visible
    isTabVisible() {
      return (tabName) => {
        return this.visibleTabs.includes(tabName)
      }
    },

    isUnderage() {
      if (!this.atletaForm.fecha_nacimiento) return false
      const birthDate = new Date(this.atletaForm.fecha_nacimiento)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age < 18
    },
    isSelfRepresented() {
      if (!this.tutor || !this.currentAtleta) return false

      const isAdult = !this.isUnderage
      if (!isAdult) return false

      // Check if cedulas match explicitly (and are not S/N)
      if (this.tutor.cedula && this.tutor.cedula !== 'S/N' && this.tutor.cedula === this.currentAtleta.cedula) {
        return true
      }

      // If cedulas are S/N or empty, check if names match
      const tutorName = (this.tutor.nombre_completo || '').toLowerCase().trim()
      const atletaName = `${this.currentAtleta.nombre || ''} ${this.currentAtleta.apellido || ''}`.toLowerCase().trim()

      return this.tutor.tipo_relacion === 'representante' && tutorName === atletaName
    },
    datePickerOptions() {
      return {
        disabledDate(time) {
          // No permitir fechas futuras ni menores a 3 años
          const today = new Date()
          const maxDate = new Date()
          maxDate.setFullYear(today.getFullYear() - 3)
          return time.getTime() > maxDate.getTime()
        }
      }
    }
  },
  watch: {
    searchQuery() {
      if (this.searchTimeout) clearTimeout(this.searchTimeout)
      this.searchTimeout = setTimeout(() => {
        this.loadAtletas()
      }, 500)
    },
    searchCedula() {
      if (this.searchCedulaTimeout) clearTimeout(this.searchCedulaTimeout)
      this.searchCedulaTimeout = setTimeout(() => {
        this.loadAtletas()
      }, 500)
    },
    filterSinCedula() {
      this.loadAtletas()
    },
    filterCedula(newVal) {
      // Resetear el campo de búsqueda por cédula cuando cambia el tipo de filtro
      if (newVal !== 'con_cedula') {
        this.searchCedula = ''
      }
      this.loadAtletas()
    },
    filterCategoria() {
      this.loadAtletas()
    },
    filterEstatus() {
      this.loadAtletas()
    },
    filterOrder() {
      this.loadAtletas()
    },
    filterOrden() {
      this.loadAtletas()
    },
    currentAtletaId: {
      immediate: false,
      handler(newId) {
        if (newId && this.isUserMedico) {
          this.activeTab = 'atencion_medica'
        }
      }
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    async loadData() {
      await this.loadCategorias()
      await Promise.all([
        this.loadAtletas(),
        this.loadTutores(),
        this.loadPosiciones(),
        this.fetchEstados(),
        this.loadMedicos(),
        this.loadTiposDiscapacidad()
      ])
    },

    async loadMedicos() {
      try {
        const response = await request({ url: '/plantel?rol=medico', method: 'get' })
        this.medicosList = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando médicos para el listado:', error)
      }
    },

    async loadTiposDiscapacidad() {
      try {
        const response = await request({ url: '/carnet-discapacidad/tipos', method: 'get' })
        this.tiposDiscapacidadList = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando tipos de discapacidad:', error)
      }
    },

    async loadAtletas() {
      this.loadingAtletas = true // Asumiendo que agregaremos un pequeño spinner si es necesario
      try {
        const params = {}
        if (this.searchQuery) params.search = this.searchQuery

        // Lógica de filtro por cédula
        if (this.filterCedula === 'con_cedula') {
          if (this.searchCedula) params.cedula = this.searchCedula
          params.con_cedula = 'true'
        } else if (this.filterCedula === 'sin_cedula') {
          params.sin_cedula = 'true'
        }
        // Si filterCedula === 'todos', no se añaden filtros de cédula

        if (this.filterCategoria) params.categoria_id = this.filterCategoria
        if (this.filterEstatus) params.estatus = this.filterEstatus
        if (this.filterOrder) params.order = this.filterOrder
        if (this.filterOrden) params.orderBy = this.filterOrden

        const response = await request({
          url: '/atletas',
          method: 'get',
          params
        })
        this.atletas = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando atletas:', error)
        this.$message.error('Error al cargar atletas')
      } finally {
        this.loadingAtletas = false
      }
    },

    async loadCategorias() {
      try {
        const response = await request({ url: '/categoria', method: 'get' })
        this.categorias = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando categorías:', error)
      }
    },

    async loadTutores() {
      try {
        const response = await request({ url: '/tutor', method: 'get' })
        this.tutores = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando tutores:', error)
      }
    },

    async loadPosiciones() {
      try {
        const response = await getPosiciones()
        this.posiciones = Array.isArray(response) ? response : []
      } catch (error) {
        console.error('Error cargando posiciones:', error)
      }
    },

    async fetchEstados() {
      try {
        const res = await request({ url: '/ubicacion/estados', method: 'get' })
        this.estadosList = Array.isArray(res) ? res : []
      } catch (error) {
        console.error('Error cargando estados:', error)
      }
    },
    async fetchMunicipiosAtleta(estadoName) {
      if (!estadoName) {
        this.municipiosListAtleta = []
        return
      }
      const estado = this.estadosList.find(e => e.nombre === estadoName)
      if (!estado) return
      try {
        const res = await request({ url: `/ubicacion/estados/${estado.id}/municipios`, method: 'get' })
        this.municipiosListAtleta = Array.isArray(res) ? res : []
      } catch (error) {
        console.error('Error cargando municipios:', error)
      }
    },
    async fetchParroquiasAtleta(municipioName) {
      if (!municipioName) {
        this.parroquiasListAtleta = []
        return
      }
      const municipio = this.municipiosListAtleta.find(m => m.nombre === municipioName)
      if (!municipio) return
      try {
        const res = await request({ url: `/ubicacion/municipios/${municipio.id}/parroquias`, method: 'get' })
        this.parroquiasListAtleta = Array.isArray(res) ? res : []
      } catch (error) {
        console.error('Error cargando parroquias:', error)
      }
    },
    async fetchMunicipiosTutor(estadoName) {
      if (!estadoName) {
        this.municipiosListTutor = []
        return
      }
      const estado = this.estadosList.find(e => e.nombre === estadoName)
      if (!estado) return
      try {
        const res = await request({ url: `/ubicacion/estados/${estado.id}/municipios`, method: 'get' })
        this.municipiosListTutor = Array.isArray(res) ? res : []
      } catch (error) {
        console.error('Error cargando municipios:', error)
      }
    },
    async fetchParroquiasTutor(municipioName) {
      if (!municipioName) {
        this.parroquiasListTutor = []
        return
      }
      const municipio = this.municipiosListTutor.find(m => m.nombre === municipioName)
      if (!municipio) return
      try {
        const res = await request({ url: `/ubicacion/municipios/${municipio.id}/parroquias`, method: 'get' })
        this.parroquiasListTutor = Array.isArray(res) ? res : []
      } catch (error) {
        console.error('Error cargando parroquias:', error)
      }
    },
    handleEstadoChangeAtleta(val) {
      this.atletaForm.direccion.municipio = ''
      this.atletaForm.direccion.parroquia = ''
      this.municipiosListAtleta = []
      this.parroquiasListAtleta = []
      this.fetchMunicipiosAtleta(val)
    },
    handleMunicipioChangeAtleta(val) {
      this.atletaForm.direccion.parroquia = ''
      this.parroquiasListAtleta = []
      this.fetchParroquiasAtleta(val)
    },
    handleEstadoChangeTutor(val) {
      this.tutorForm.direccion.municipio = ''
      this.tutorForm.direccion.parroquia = ''
      this.municipiosListTutor = []
      this.parroquiasListTutor = []
      this.fetchMunicipiosTutor(val)
    },
    handleMunicipioChangeTutor(val) {
      this.tutorForm.direccion.parroquia = ''
      this.parroquiasListTutor = []
      this.fetchParroquiasTutor(val)
    },

    async selectAtleta(id, keepTab = false) {
      this.currentAtletaId = id
      this.currentAtleta = this.atletas.find(a => a.atleta_id === id) || {}

      if (!keepTab) {
        // Si es médico, ir a pestaña médica; si no, a personal
        this.activeTab = this.isUserMedico ? 'atencion_medica' : 'personal'
        this.fichaMedica = null
        this.medidas = []
        this.tests = []
        this.tutor = null
        this.atencionesMedicas = []
        this.carnetDiscapacidad = null
        this.historialPartidos = []
      }

      await Promise.all([
        this.loadAtencionesMedicas(id),
        this.loadCarnetDiscapacidad(id),
        this.loadHistorialPartidos(this.currentAtleta.categoria_id)
      ])
      this.loadFichaMedica(id)
      this.loadMedidas(id)
      this.loadTests(id)
      this.loadTutor(this.currentAtleta.representante_id)
    },

    async loadAtencionesMedicas(atleta_id) {
      try {
        const response = await request({ url: `/atencion-medica/atleta/${atleta_id}`, method: 'get' })
        this.atencionesMedicas = Array.isArray(response) ? response : []
      } catch (error) {
        this.atencionesMedicas = []
      }
    },

    async loadCarnetDiscapacidad(atleta_id) {
      try {
        const response = await request({ url: `/carnet-discapacidad/atleta/${atleta_id}`, method: 'get' })
        this.carnetDiscapacidad = response || null
      } catch (error) {
        this.carnetDiscapacidad = null
      }
    },

    async loadHistorialPartidos(categoria_id) {
      if (!categoria_id) {
        this.historialPartidos = []
        return
      }
      try {
        const response = await request({ url: `/historial-partidos/categoria/${categoria_id}`, method: 'get' })
        this.historialPartidos = Array.isArray(response) ? response : []
      } catch (error) {
        this.historialPartidos = []
      }
    },

    async loadFichaMedica(atleta_id) {
      try {
        const response = await request({ url: `/ficha-medica?atleta_id=${atleta_id}`, method: 'get' })
        this.fichaMedica = Array.isArray(response) && response.length > 0 ? response[0] : null
      } catch (error) {
        this.fichaMedica = null
      }
    },

    async loadMedidas(atleta_id) {
      try {
        const response = await request({ url: `/mediciones?atleta_id=${atleta_id}`, method: 'get' })
        this.medidas = Array.isArray(response) ? response : []
      } catch (error) {
        this.medidas = []
      }
    },

    async loadTests(atleta_id) {
      try {
        const response = await request({ url: `/tests?atleta_id=${atleta_id}`, method: 'get' })
        this.tests = Array.isArray(response) ? response : []
      } catch (error) {
        this.tests = []
      }
    },

    async loadTutor(tutor_id) {
      if (!tutor_id) {
        this.tutor = null
        return
      }
      try {
        const response = await request({ url: `/tutor/${tutor_id}`, method: 'get' })
        this.tutor = response
      } catch (error) {
        this.tutor = null
      }
    },

    handleEdit() {
      switch (this.activeTab) {
        case 'personal':
          this.openAtletaModal(true)
          break
        case 'medical':
          this.openMedicalModal()
          break
        case 'anthropometric':
          this.openAnthropometricModal()
          break
        case 'performance':
          this.openPerformanceModal()
          break
        case 'tutor':
          this.openTutorModal()
          break
      }
    },

    openAtletaModal(editing) {
      this.isEditingAtleta = editing
      this.atletaStep = 0
      if (editing && this.currentAtleta) {
        this.atletaForm = {
          nombre: this.currentAtleta.nombre,
          apellido: this.currentAtleta.apellido,
          cedula: this.currentAtleta.cedula,
          fecha_nacimiento: this.currentAtleta.fecha_nacimiento,
          sexo: this.currentAtleta.sexo || 'M',
          posicion_de_juego: this.currentAtleta.posicion_de_juego || '',
          categoria_id: this.currentAtleta.categoria_id,
          representante_id: this.currentAtleta.representante_id || null,
          telefono: this.currentAtleta.telefono || '',
          direccion: {
            estado: this.currentAtleta.estado || '',
            municipio: this.currentAtleta.municipio || '',
            parroquia: this.currentAtleta.parroquia || '',
            descripcion_descriptiva: this.currentAtleta.descripcion_descriptiva || ''
          },
          representante: {
            nombre: '',
            apellido: '',
            cedula: '',
            telefono: '',
            tipo_relacion: ''
          },
          estatus: this.currentAtleta.estatus || 'ACTIVO',
          foto: this.currentAtleta.foto || '',
          pierna_dominante: this.currentAtleta.pierna_dominante || 'Derecha'
        }

        // Cargar combos dependientes si es edición
        if (this.atletaForm.direccion.estado) {
          this.fetchMunicipiosAtleta(this.atletaForm.direccion.estado).then(() => {
            if (this.atletaForm.direccion.municipio) {
              this.fetchParroquiasAtleta(this.atletaForm.direccion.municipio)
            }
          })
        }

        // Cargar datos del representante si existe
        if (this.currentAtleta.representante_id && this.tutor) {
          const nombres = this.tutor.nombre_completo ? this.tutor.nombre_completo.split(' ') : ['', '']
          this.atletaForm.representante = {
            nombre: nombres[0] || '',
            apellido: nombres.slice(1).join(' ') || '',
            cedula: this.tutor.cedula || '',
            telefono: this.tutor.telefono || '',
            tipo_relacion: this.tutor.tipo_relacion || ''
          }
        } else if (this.currentAtleta.representante_id) {
          // Fetch tutor just in case it wasn't loaded in the view before editing
          request({ url: `/tutor/${this.currentAtleta.representante_id}`, method: 'get' }).then(res => {
            if (res) {
              const nombres = res.nombre_completo ? res.nombre_completo.split(' ') : ['', '']
              this.atletaForm.representante = {
                nombre: nombres[0] || '',
                apellido: nombres.slice(1).join(' ') || '',
                cedula: res.cedula || '',
                telefono: res.telefono || '',
                tipo_relacion: res.tipo_relacion || ''
              }
            }
          }).catch(e => console.error(e))
        }
      } else {
        this.resetAtletaForm()
      }
      this.showAtletaModal = true
    },

    openEditPersonalModal() {
      this.isEditingAtleta = true
      if (this.currentAtleta) {
        this.atletaForm = {
          nombre: this.currentAtleta.nombre,
          apellido: this.currentAtleta.apellido,
          cedula: this.currentAtleta.cedula,
          fecha_nacimiento: this.currentAtleta.fecha_nacimiento,
          sexo: this.currentAtleta.sexo || 'M',
          telefono: this.currentAtleta.telefono || '',
          estatus: this.currentAtleta.estatus || 'ACTIVO',
          foto: this.currentAtleta.foto || '',
          direccion: {
            estado: this.currentAtleta.estado || '',
            municipio: this.currentAtleta.municipio || '',
            parroquia: this.currentAtleta.parroquia || '',
            descripcion_descriptiva: this.currentAtleta.descripcion_descriptiva || ''
          },
          representante: {
            nombre: '',
            apellido: '',
            cedula: '',
            telefono: '',
            tipo_relacion: ''
          }
        }
        if (this.atletaForm.direccion.estado) {
          this.fetchMunicipiosAtleta(this.atletaForm.direccion.estado).then(() => {
            if (this.atletaForm.direccion.municipio) {
              this.fetchParroquiasAtleta(this.atletaForm.direccion.municipio)
            }
          })
        }
      }
      this.showEditPersonalModal = true
    },

    openEditSportsModal() {
      this.isEditingAtleta = true
      if (this.currentAtleta) {
        this.atletaForm = {
          posicion_de_juego: this.currentAtleta.posicion_de_juego || '',
          categoria_id: this.currentAtleta.categoria_id,
          pierna_dominante: this.currentAtleta.pierna_dominante || 'Derecha',
          direccion: {
            estado: '', municipio: '', parroquia: '', descripcion_descriptiva: ''
          },
          representante: {
            nombre: '', apellido: '', cedula: '', telefono: '', tipo_relacion: ''
          }
        }
      }
      this.showEditSportsModal = true
    },

    nextAtletaStep() {
      let fieldsToValidate = []
      if (this.atletaStep === 0) {
        fieldsToValidate = ['nombre', 'apellido', 'fecha_nacimiento', 'sexo']
      } else if (this.atletaStep === 1) {
        fieldsToValidate = ['categoria_id']
      }

      const goToNextStep = async() => {
        // Validaciones manuales extra para paso 0
        if (this.atletaStep === 0) {
          const { telefono, direccion } = this.atletaForm

          if (!this.isUnderage) {
            if (!telefono || telefono.length !== 11) {
              this.$message.error('Debe ingresar un número de teléfono válido de 11 dígitos para atletas mayores de edad.')
              return
            }
          } else if (telefono && telefono.length !== 11) {
            this.$message.error('El número de teléfono ingresado está incompleto (deben ser 11 dígitos).')
            return
          }

          if (!direccion.estado || !direccion.municipio || !direccion.parroquia || !direccion.descripcion_descriptiva) {
            this.$message.error('Todos los atletas (mayores o menores de edad) deben registrar su dirección completa.')
            return
          }

          // Validación de cédula duplicada
          if (this.atletaForm.cedula) {
            try {
              const res = await request({
                url: '/atletas',
                method: 'get',
                params: { con_cedula: 'true', cedula: this.atletaForm.cedula }
              })
              const isDuplicate = this.isEditingAtleta
                ? res.some(a => a.cedula === this.atletaForm.cedula && a.atleta_id !== this.currentAtletaId)
                : res.some(a => a.cedula === this.atletaForm.cedula)

              if (isDuplicate) {
                this.$message.error('La cédula ingresada ya está registrada para otro atleta.')
                return
              }
            } catch (error) {
              console.error('Error validando cédula', error)
            }
          }
        }
        this.atletaStep++
      }

      if (fieldsToValidate.length > 0) {
        let validCount = 0
        let hasErrors = false

        fieldsToValidate.forEach(field => {
          this.$refs.atletaForm.validateField(field, (errorMessage) => {
            if (errorMessage) {
              hasErrors = true
            }
            validCount++

            if (validCount === fieldsToValidate.length) {
              if (!hasErrors) {
                goToNextStep()
              } else {
                this.$message.error('Por favor, complete los campos requeridos en este paso.')
              }
            }
          })
        })
      } else {
        goToNextStep()
      }
    },

    resetAtletaStep() {
      this.atletaStep = 0
      if (this.$refs.atletaForm) {
        this.$refs.atletaForm.clearValidate()
      }
    },

    checkUnderage() {
      // Método llamado al cambiar la fecha, isUnderage (computed) reaccionará a esto automáticamente.
      // Se puede añadir lógica extra si se requiere limpiar campos del representante, etc.
    },

    openMedicalModal() {
      if (this.fichaMedica) {
        this.medicalForm = {
          tipo_sanguineo: this.fichaMedica.tipo_sanguineo || '',
          alergias: this.fichaMedica.alergias || '',
          lesion: this.fichaMedica.lesion || '',
          condicion_medica: this.fichaMedica.condicion_medica || '',
          observacion: this.fichaMedica.observacion || ''
        }
      } else {
        this.resetMedicalForm()
      }
      this.showMedicalModal = true
    },

    openAnthropometricModal(medida = null) {
      if (medida && medida.medidas_id) {
        this.editingAnthropometricId = medida.medidas_id
        this.anthropometricForm = {
          peso: medida.peso,
          altura: medida.altura,
          porcentaje_grasa: medida.porcentaje_grasa,
          porcentaje_musculatura: medida.porcentaje_musculatura,
          envergadura: medida.envergadura,
          largo_de_pierna: medida.largo_de_pierna,
          largo_de_torso: medida.largo_de_torso,
          fecha_medicion: medida.fecha_medicion
        }
      } else {
        this.editingAnthropometricId = null
        this.resetAnthropometricForm()
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        this.anthropometricForm.fecha_medicion = now.toISOString().slice(0, 19).replace('T', ' ')
      }
      this.showAnthropometricModal = true
    },

    openPerformanceModal(test = null) {
      if (test && test.test_id) {
        this.editingPerformanceId = test.test_id
        this.performanceForm = {
          test_de_fuerza: test.test_de_fuerza,
          test_resistencia: test.test_resistencia,
          test_velocidad: test.test_velocidad,
          test_coordinacion: test.test_coordinacion,
          test_de_reaccion: test.test_de_reaccion,
          fecha_test: test.fecha_test
        }
      } else {
        this.editingPerformanceId = null
        this.resetPerformanceForm()
        const now = new Date()
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset())
        this.performanceForm.fecha_test = now.toISOString().slice(0, 19).replace('T', ' ')
      }
      this.showPerformanceModal = true
    },

    openTutorModal() {
      if (this.tutor && !this.isSelfRepresented) {
        // Editing an actual third-party representative
        this.isEditingTutor = true
        this.tutorForm = {
          nombre_completo: this.tutor.nombre_completo,
          cedula: this.tutor.cedula === 'S/N' ? '' : this.tutor.cedula,
          telefono: (this.tutor.telefono === 'S/N' ? '' : this.tutor.telefono) || '',
          direccion: {
            estado: this.tutor.estado || '',
            municipio: this.tutor.municipio || '',
            parroquia: this.tutor.parroquia || '',
            descripcion_descriptiva: this.tutor.descripcion_descriptiva || ''
          },
          tipo_relacion: this.tutor.tipo_relacion
        }
        if (this.tutorForm.direccion.estado) {
          this.fetchMunicipiosTutor(this.tutorForm.direccion.estado).then(() => {
            if (this.tutorForm.direccion.municipio) {
              this.fetchParroquiasTutor(this.tutorForm.direccion.municipio)
            }
          })
        }
      } else {
        this.isEditingTutor = false
        this.resetTutorForm()
        // Pre-fill address from athlete
        if (this.currentAtleta) {
          this.tutorForm.direccion = {
            pais: this.currentAtleta.pais || 'venezuela',
            estado: this.currentAtleta.estado || '',
            municipio: this.currentAtleta.municipio || '',
            parroquia: this.currentAtleta.parroquia || '',
            descripcion_descriptiva: this.currentAtleta.descripcion_descriptiva || ''
          }
        }
      }
      this.showTutorModal = true
    },

    openAtencionModal() {
      this.isEditingAtencion = false
      this.resetAtencionForm()
      this.atencionForm.fecha_suceso = new Date().toISOString().split('T')[0]
      this.showAtencionModal = true
    },

    editAtencion(row) {
      this.isEditingAtencion = true
      this.atencionForm = { ...row }
      // Ajustar fechas al formato YYYY-MM-DD
      if (this.atencionForm.fecha_suceso) this.atencionForm.fecha_suceso = this.atencionForm.fecha_suceso.split('T')[0]
      if (this.atencionForm.fecha_alta_estimada) this.atencionForm.fecha_alta_estimada = this.atencionForm.fecha_alta_estimada.split('T')[0]
      if (this.atencionForm.fecha_alta_real) this.atencionForm.fecha_alta_real = this.atencionForm.fecha_alta_real.split('T')[0]
      this.showAtencionModal = true
    },

    openCarnetModal() {
      if (this.carnetDiscapacidad) {
        this.carnetForm = {
          tipo_discapacidad_id: this.carnetDiscapacidad.tipo_discapacidad_id,
          nro_carnet: this.carnetDiscapacidad.nro_carnet,
          porcentaje_discapacidad: this.carnetDiscapacidad.porcentaje_discapacidad,
          fecha_registro: this.carnetDiscapacidad.fecha_registro ? this.carnetDiscapacidad.fecha_registro.split('T')[0] : ''
        }
      } else {
        this.resetCarnetForm()
        this.carnetForm.fecha_registro = new Date().toISOString().split('T')[0]
      }
      this.showCarnetModal = true
    },

    saveAtleta() {
      this.$refs.atletaForm.validate(async(valid) => {
        if (!valid) return

        // Validación condicional del representante
        if (this.isUnderage) {
          const rep = this.atletaForm.representante
          if (!rep.nombre || !rep.apellido || !rep.cedula || !rep.telefono || !rep.tipo_relacion) {
            this.$message.error('Por favor, complete todos los datos del representante, ya que el atleta es menor de edad.')
            return
          }
          if (rep.telefono.length !== 11) {
            this.$message.error('El teléfono del representante debe tener exactamente 11 dígitos.')
            return
          }
        } else {
          // Si es mayor de edad, teléfono es obligatorio
          if (!this.atletaForm.telefono || this.atletaForm.telefono.length !== 11) {
            this.$message.error('Debe ingresar un número de teléfono válido de 11 dígitos para atletas mayores de edad.')
            return
          }
        }

        const dir = this.atletaForm.direccion
        if (!dir.estado || !dir.municipio || !dir.parroquia || !dir.descripcion_descriptiva) {
          this.$message.error('Por favor, complete todos los datos de la dirección de habitación.')
          return
        }

        this.loading = true
        try {
          if (this.isEditingAtleta) {
            await request({
              url: `/atletas/${this.currentAtletaId}`,
              method: 'put',
              data: this.atletaForm
            })
            this.$message.success('Atleta actualizado correctamente')
          } else {
            await request({
              url: '/atletas',
              method: 'post',
              data: this.atletaForm
            })
            this.$message.success('Atleta creado correctamente')
          }

          this.showAtletaModal = false
          await this.loadAtletas()

          if (this.isEditingAtleta) {
            await this.selectAtleta(this.currentAtletaId)
          }
        } catch (error) {
          console.error('Error guardando atleta:', error)
        } finally {
          this.loading = false
        }
      })
    },

    saveEditPersonal() {
      this.$refs.editPersonalForm.validate(async(valid) => {
        if (!valid) return

        if (!this.isUnderage) {
          if (!this.atletaForm.telefono) {
            this.$message.error('El teléfono es obligatorio para atletas mayores de edad.')
            return
          }
          const dir = this.atletaForm.direccion
          if (!dir.estado || !dir.municipio || !dir.parroquia || !dir.descripcion_descriptiva) {
            this.$message.error('Por favor, complete todos los datos de la dirección obligatorios.')
            return
          }
        }

        this.loading = true
        try {
          await request({
            url: `/atletas/${this.currentAtletaId}`,
            method: 'put',
            data: {
              nombre: this.atletaForm.nombre,
              apellido: this.atletaForm.apellido,
              cedula: this.atletaForm.cedula,
              fecha_nacimiento: this.atletaForm.fecha_nacimiento,
              sexo: this.atletaForm.sexo,
              telefono: this.atletaForm.telefono,
              estatus: this.atletaForm.estatus,
              foto: this.atletaForm.foto,
              direccion: this.atletaForm.direccion
            }
          })
          this.$message.success('Datos personales actualizados correctamente')
          this.showEditPersonalModal = false
          await this.loadAtletas()
          await this.selectAtleta(this.currentAtletaId)
        } catch (error) {
          console.error('Error actualizando datos personales:', error)
          this.$message.error('Error al actualizar datos personales')
        } finally {
          this.loading = false
        }
      })
    },

    saveEditSports() {
      this.$refs.editSportsForm.validate(async(valid) => {
        if (!valid) return

        this.loading = true
        try {
          await request({
            url: `/atletas/${this.currentAtletaId}`,
            method: 'put',
            data: {
              categoria_id: this.atletaForm.categoria_id,
              posicion_de_juego: this.atletaForm.posicion_de_juego,
              pierna_dominante: this.atletaForm.pierna_dominante
            }
          })
          this.$message.success('Datos deportivos actualizados correctamente')
          this.showEditSportsModal = false
          await this.loadAtletas()
          await this.selectAtleta(this.currentAtletaId)
        } catch (error) {
          console.error('Error actualizando datos deportivos:', error)
          this.$message.error('Error al actualizar datos deportivos')
        } finally {
          this.loading = false
        }
      })
    },

    async saveMedical() {
      this.loading = true
      try {
        const data = {
          ...this.medicalForm,
          atleta_id: this.currentAtletaId
        }

        if (this.fichaMedica) {
          await request({
            url: `/ficha-medica/${this.fichaMedica.ficha_id}`,
            method: 'put',
            data
          })
          this.$message.success('Ficha médica actualizada')
        } else {
          await request({
            url: '/ficha-medica',
            method: 'post',
            data
          })
          this.$message.success('Ficha médica creada')
        }

        this.showMedicalModal = false
        await this.loadFichaMedica(this.currentAtletaId)
      } catch (error) {
        console.error('Error guardando ficha médica:', error)
        this.$message.error('Error al guardar ficha médica')
      } finally {
        this.loading = false
      }
    },

    async saveAnthropometric() {
      this.loading = true
      try {
        const payload = {
          ...this.anthropometricForm,
          atleta_id: this.currentAtletaId
        }

        let url = '/mediciones'
        let method = 'post'

        if (this.editingAnthropometricId) {
          url = `/mediciones/${this.editingAnthropometricId}`
          method = 'put'
        }

        await request({
          url,
          method,
          data: payload
        })

        this.$message.success(`Medidas ${this.editingAnthropometricId ? 'actualizadas' : 'registradas'} exitosamente`)
        this.showAnthropometricModal = false
        await this.loadMedidas(this.currentAtletaId)
      } catch (error) {
        console.error('Error guardando medidas:', error)
        this.$message.error('Error al guardar medidas')
      } finally {
        this.loading = false
      }
    },

    async savePerformance() {
      this.loading = true
      try {
        const payload = {
          ...this.performanceForm,
          atleta_id: this.currentAtletaId
        }

        let url = '/tests'
        let method = 'post'

        if (this.editingPerformanceId) {
          url = `/tests/${this.editingPerformanceId}`
          method = 'put'
        }

        await request({
          url,
          method,
          data: payload
        })

        this.$message.success(`Test ${this.editingPerformanceId ? 'actualizado' : 'registrado'} exitosamente`)
        this.showPerformanceModal = false
        await this.loadTests(this.currentAtletaId)
      } catch (error) {
        console.error('Error guardando test:', error)
        this.$message.error('Error al guardar test')
      } finally {
        this.loading = false
      }
    },

    saveTutor() {
      this.$refs.tutorForm.validate(async(valid) => {
        if (!valid) return

        this.loading = true
        try {
          if (this.isEditingTutor && this.tutor) {
            await request({
              url: `/tutor/${this.tutor.representante_id}`,
              method: 'put',
              data: this.tutorForm
            })
            this.$message.success('Tutor actualizado correctamente')
          } else {
            const response = await request({
              url: '/tutor',
              method: 'post',
              data: this.tutorForm
            })

            const nuevoTutorId = response.id || response.tutor_id || response.insertId

            if (!nuevoTutorId) {
              console.error('Respuesta del servidor:', response)
              throw new Error('No se recibió el ID del tutor creado')
            }

            if (!this.currentAtleta || !this.currentAtletaId) {
              throw new Error('No hay atleta seleccionado para asignar tutor')
            }

            await request({
              url: `/atletas/${this.currentAtletaId}/tutor`,
              method: 'put',
              data: { tutor_id: nuevoTutorId }
            })

            this.$message.success('Tutor creado y asignado correctamente')
          }

          this.showTutorModal = false
          await this.loadAtletas()
          await this.selectAtleta(this.currentAtletaId, true)
        } catch (error) {
          console.error('Error guardando tutor:', error)
          this.$message.error('Error al guardar tutor')
        } finally {
          this.loading = false
        }
      })
    },

    async deleteTutor() {
      try {
        await this.$confirm(
          '¿Está seguro de que desea eliminar este representante? El representante será removido y el atleta quedará sin un tercero asignado.',
          'Confirmar eliminación',
          {
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            type: 'warning'
          }
        )
      } catch (e) {
        return // User cancelled
      }

      this.loading = true
      try {
        await request({
          url: `/atletas/${this.currentAtletaId}/tutor`,
          method: 'delete'
        })

        this.$message.success('Representante eliminado correctamente')
        await this.loadAtletas()
        await this.selectAtleta(this.currentAtletaId, true)
      } catch (error) {
        console.error('Error eliminando tutor:', error)
        this.$message.error('Error al eliminar representante')
      } finally {
        this.loading = false
      }
    },

    async saveAtencion() {
      this.loading = true
      try {
        const data = { ...this.atencionForm, atleta_id: this.currentAtletaId }
        if (this.isEditingAtencion) {
          await request({ url: `/atencion-medica/${this.atencionForm.atencion_id}`, method: 'put', data })
          this.$message.success('Atención médica actualizada')
        } else {
          await request({ url: '/atencion-medica', method: 'post', data })
          this.$message.success('Atención médica registrada')
        }
        this.showAtencionModal = false
        await this.loadAtencionesMedicas(this.currentAtletaId)
      } catch (error) {
        console.error(error)
        this.$message.error('Error al guardar la atención médica')
      } finally {
        this.loading = false
      }
    },

    deleteAtencion(id) {
      this.$confirm('¿Desea eliminar este registro médico?', 'Confirmar', {
        confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', type: 'warning'
      }).then(async() => {
        try {
          await request({ url: `/atencion-medica/${id}`, method: 'delete' })
          this.$message.success('Registro eliminado')
          await this.loadAtencionesMedicas(this.currentAtletaId)
        } catch (error) {
          console.error(error)
          this.$message.error('Error al eliminar')
        }
      }).catch(() => {})
    },

    async saveCarnet() {
      this.loading = true
      try {
        const data = { ...this.carnetForm, atleta_id: this.currentAtletaId }
        if (this.carnetDiscapacidad) {
          await request({ url: `/carnet-discapacidad/${this.carnetDiscapacidad.carnet_id}`, method: 'put', data })
          this.$message.success('Carnet de discapacidad actualizado')
        } else {
          await request({ url: '/carnet-discapacidad', method: 'post', data })
          this.$message.success('Carnet de discapacidad registrado')
        }
        this.showCarnetModal = false
        await this.loadCarnetDiscapacidad(this.currentAtletaId)
      } catch (error) {
        console.error(error)
        this.$message.error('Error al guardar el carnet de discapacidad')
      } finally {
        this.loading = false
      }
    },

    formatEnum(value) {
      if (!value) return ''
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    },

    async deletePerformanceTest(testId) {
      if (!testId) return
      try {
        await this.$confirm('¿Está seguro de eliminar este test de rendimiento?', 'Confirmar', {
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          type: 'warning'
        })
        this.loading = true
        await request({
          url: `/tests/${testId}`,
          method: 'delete'
        })
        this.$message.success('Test eliminado exitosamente')
        await this.loadAtletas()
        await this.selectAtleta(this.currentAtletaId)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error eliminando test:', error)
          this.$message.error('Error al eliminar el test')
        }
      } finally {
        this.loading = false
      }
    },

    async deleteMedida(medidaId) {
      if (!medidaId) return
      try {
        await this.$confirm('¿Está seguro de eliminar estas medidas?', 'Confirmar', {
          confirmButtonText: 'Eliminar',
          cancelButtonText: 'Cancelar',
          type: 'warning'
        })
        this.loading = true
        await request({
          url: `/mediciones/${medidaId}`,
          method: 'delete'
        })
        this.$message.success('Medidas eliminadas exitosamente')
        await this.loadAtletas()
        await this.selectAtleta(this.currentAtletaId)
      } catch (error) {
        if (error !== 'cancel') {
          console.error('Error eliminando medidas:', error)
          this.$message.error('Error al eliminar medidas antropométricas')
        }
      } finally {
        this.loading = false
      }
    },

    deleteAtleta() {
      this.$confirm(
        '¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE a este atleta? ' +
        'Se borrarán TODOS sus registros asociados: asistencias, atenciones médicas, ' +
        'ficha médica, medidas antropométricas, pruebas de rendimiento y su representante. ' +
        'Esta acción NO se puede deshacer. Si solo deseas desactivarlo, cambia su estatus a INACTIVO desde "Editar Datos Personales".',
        'Eliminar Atleta Permanentemente',
        {
          confirmButtonText: 'Sí, eliminar todo',
          cancelButtonText: 'Cancelar',
          type: 'error'
        }
      ).then(async() => {
        try {
          await request({
            url: `/atletas/${this.currentAtletaId}`,
            method: 'delete'
          })
          this.$message.success('Atleta eliminado correctamente')
          this.currentAtletaId = null
          this.currentAtleta = {}
          await this.loadAtletas()
        } catch (error) {
          console.error('Error eliminando atleta:', error)
          this.$message.error('Error al eliminar atleta')
        }
      }).catch(() => {})
    },

    goToProgress() {
      this.$router.push({
        path: '/reportes/rendimiento',
        query: { atleta_id: this.currentAtletaId }
      })
    },

    resetAtletaForm() {
      this.atletaForm = {
        nombre: '',
        apellido: '',
        cedula: '',
        fecha_nacimiento: '',
        sexo: 'M',
        posicion_de_juego: null,
        categoria_id: '',
        tutor_id: null,
        telefono: '',
        direccion: {
          estado: '',
          municipio: '',
          parroquia: '',
          descripcion_descriptiva: ''
        },
        representante: {
          nombre: '',
          apellido: '',
          cedula: '',
          telefono: '',
          tipo_relacion: ''
        },
        estatus: 'ACTIVO',
        foto: null,
        pierna_dominante: 'Derecha'
      }
      this.municipiosListAtleta = []
      this.parroquiasListAtleta = []
    },

    resetMedicalForm() {
      this.medicalForm = {
        tipo_sanguineo: '',
        alergias: '',
        lesion: '',
        condicion_medica: '',
        observacion: ''
      }
    },

    resetAnthropometricForm() {
      this.anthropometricForm = {
        peso: null,
        altura: null,
        porcentaje_grasa: null,
        porcentaje_musculatura: null,
        envergadura: null,
        largo_de_pierna: null,
        largo_de_torso: null,
        fecha_medicion: ''
      }
    },

    resetPerformanceForm() {
      this.performanceForm = {
        test_de_fuerza: null,
        test_resistencia: null,
        test_velocidad: null,
        test_coordinacion: null,
        test_de_reaccion: null,
        fecha_test: ''
      }
    },

    resetTutorForm() {
      this.tutorForm = {
        nombre_completo: '',
        cedula: '',
        telefono: '',
        correo: '',
        direccion: {
          estado: '',
          municipio: '',
          parroquia: '',
          descripcion_descriptiva: ''
        },
        tipo_relacion: ''
      }
      this.municipiosListTutor = []
      this.parroquiasListTutor = []
    },

    resetAtencionForm() {
      this.atencionForm = {
        tipo_registro: 1,
        descripcion: '',
        diagnostico: '',
        fecha_suceso: '',
        fecha_alta_estimada: '',
        fecha_alta_real: '',
        tratamiento_indicado: '',
        especialista_id: null,
        estado_disponibilidad: 0
      }
    },

    resetCarnetForm() {
      this.carnetForm = {
        tipo_discapacidad_id: null,
        nro_carnet: '',
        porcentaje_discapacidad: null,
        fecha_registro: ''
      }
    },

    calculateAge(birthdate) {
      if (!birthdate) return '-'
      const birthDate = new Date(birthdate)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age
    },

    formatDate(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-ES')
    },

    formatDateTime(dateString) {
      if (!dateString) return '-'
      const date = new Date(dateString)
      return date.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },

    getStatusType(estatus) {
      const types = {
        'ACTIVO': 'success',
        'INACTIVO': 'info',
        'LESIONADO': 'warning',
        'SUSPENDIDO': 'danger'
      }
      return types[estatus] || 'info'
    },

    getDisponibilidadMedicaType(estado) {
      const types = { 0: 'danger', 1: 'warning', 2: 'success' }
      return types[estado] || 'info'
    },
    getDisponibilidadMedicaLabel(estado) {
      const labels = { 0: 'No Apto', 1: 'Diferenciado', 2: 'Apto' }
      return labels[estado] || 'Desconocido'
    },

    getPartidoResultadoType(resultado) {
      if (resultado === 'V') return 'success'
      if (resultado === 'E') return 'warning'
      if (resultado === 'D') return 'danger'
      return 'info'
    },

    getPartidoResultadoLabel(resultado) {
      if (resultado === 'V') return 'Victoria'
      if (resultado === 'E') return 'Empate'
      if (resultado === 'D') return 'Derrota'
      return 'N/A'
    },

    getEntrenadorNombre(categoriaId) {
      if (!categoriaId || !this.categorias || this.categorias.length === 0) return 'No asignado'
      const categoria = this.categorias.find(c => c.categoria_id === categoriaId)
      return categoria ? (categoria.entrenador_nombre || categoria.nombre_entrenador || 'No asignado') : 'No asignado'
    },

    getFotoUrl(filename) {
      if (!filename) return null
      return `${this.backendUrl}/uploads/atletas/${filename}`
    },

    handleUploadSuccess(res) {
      this.atletaForm.foto = res.filename
      this.$message.success('Foto cargada exitosamente')
    },

    removePhoto() {
      this.atletaForm.foto = ''
    },

    beforeAvatarUpload(file) {
      const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png'
      const isLt2M = file.size / 1024 / 1024 < 2

      if (!isJPGorPNG) {
        this.$message.error('La imagen debe estar en formato JPG o PNG')
      }
      if (!isLt2M) {
        this.$message.error('La imagen no puede exceder los 2MB')
      }
      if (!isLt2M) {
        this.$message.error('La imagen no puede exceder los 2MB')
      }
      return isJPGorPNG && isLt2M
    }

  }
}

</script>

<style scoped>
.atletas-container {
  padding: 20px;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #E51D22, #c41a1d);
  color: white;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(229, 29, 34, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 5px 0;
}

.subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* Header Button - Modern Executive Style */
.header-content ::v-deep .el-button--primary {
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.header-content ::v-deep .el-button--primary:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.header-content ::v-deep .el-button--primary:active {
  transform: translateY(0);
}

.main-content {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 15px;
}

aside.sidebar {
  padding: 0;
  background: transparent;
  margin-bottom: 0;
}

.sidebar .el-card {
  height: calc(100vh - 200px);
  overflow: hidden;
}

.sidebar ::v-deep .el-card__body {
  padding: 0;
}

.athlete-list {
  max-height: calc(100vh - 340px);
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  padding: 15px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border-bottom: 2px solid #e2e8f0;
}

.search-container ::v-deep .el-input__inner {
  background: #fff !important;
  border: 2px solid #64748b !important;
  border-radius: 10px;
  padding: 10px 14px 10px 36px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
}

.search-container ::v-deep .el-input__inner:hover {
  border-color: #E51D22 !important;
}

.search-container ::v-deep .el-input__inner:focus {
  border-color: #E51D22 !important;
  box-shadow: 0 0 0 3px rgba(229, 29, 34, 0.12);
}

.search-container ::v-deep .el-input__inner::placeholder {
  color: #64748b !important;
  font-weight: 500;
}

.search-container ::v-deep .el-input__prefix {
  color: #64748b;
}

.filter-popover {
  padding: 5px;
}

.filter-popover h4 {
  margin: 0 0 18px 0;
  font-size: 1rem;
  font-weight: 700;
  color: #E51D22;
  border-bottom: 2px solid #E51D22;
  padding-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.filter-item {
  margin-bottom: 18px;
}

.filter-item label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.filter-item ::v-deep .el-select .el-input__inner {
  background: #fff !important;
  border: 2px solid #64748b !important;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.3s ease;
}

.filter-item ::v-deep .el-select .el-input__inner:hover {
  border-color: #E51D22 !important;
}

.filter-item ::v-deep .el-select .el-input.is-focus .el-input__inner {
  border-color: #E51D22 !important;
  box-shadow: 0 0 0 3px rgba(229, 29, 34, 0.12);
}

/* Placeholder styling for select dropdowns in filter popover */
.filter-item ::v-deep .el-select .el-input__inner::placeholder {
  color: #1e293b !important;
  font-weight: 500;
  opacity: 1;
}

/* Estilos para el input de cédula - igual que los selectores */
.filter-item ::v-deep > .el-input .el-input__inner {
  background: #fff !important;
  border: 2px solid #64748b !important;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
  transition: all 0.3s ease;
}

.filter-item ::v-deep > .el-input .el-input__inner:hover {
  border-color: #E51D22 !important;
}

.filter-item ::v-deep > .el-input .el-input__inner:focus {
  border-color: #E51D22 !important;
  box-shadow: 0 0 0 3px rgba(229, 29, 34, 0.12);
}

.filter-item ::v-deep > .el-input .el-input__inner::placeholder {
  color: #64748b !important;
  font-weight: 500;
  opacity: 1;
}

/* Estilos modernos para el switch */
.filter-item ::v-deep .el-switch {
  height: 28px;
}

.filter-item ::v-deep .el-switch__core {
  width: 50px !important;
  height: 26px !important;
  border-radius: 13px;
  border: 2px solid #cbd5e1;
  background-color: #e2e8f0;
  transition: all 0.3s ease;
}

.filter-item ::v-deep .el-switch__core::after {
  width: 20px;
  height: 20px;
  top: 1px;
  left: 1px;
  border-radius: 50%;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.filter-item ::v-deep .el-switch.is-checked .el-switch__core {
  background-color: #E51D22 !important;
  border-color: #E51D22 !important;
}

.filter-item ::v-deep .el-switch.is-checked .el-switch__core::after {
  left: 100%;
  margin-left: -23px;
}

.filter-item ::v-deep .el-switch__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
}

.filter-item ::v-deep .el-switch__label.is-active {
  color: #1e293b;
}

.filter-item ::v-deep .el-switch__label--left {
  margin-right: 8px;
}

.filter-item ::v-deep .el-switch__label--right {
  margin-left: 8px;
}

.filter-btn {
  font-size: 1.3rem;
  color: #64748b;
  padding: 5px;
  transition: all 0.3s ease;
}

.filter-btn:hover {
  color: #E51D22;
  transform: rotate(90deg);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.avatar-img-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.photo-upload-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.avatar-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 120px;
  height: 120px;
  transition: border-color 0.3s;
}

.avatar-uploader:hover {
  border-color: #E51D22;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  line-height: 1.2;
  text-align: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.avatar-uploader-icon span {
  font-size: 12px;
  margin-top: 5px;
}

.avatar-preview {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}

.athlete-item {
  padding: 16px;
  margin: 8px 12px;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.athlete-item:hover {
  border-color: #E51D22;
  background: linear-gradient(135deg, #fff5f5, #fff);
  box-shadow: 0 4px 12px rgba(229, 29, 34, 0.12);
  transform: translateX(4px);
}

.athlete-item.active {
  background: linear-gradient(135deg, #fee2e2, #fff);
  border: 2px solid #E51D22;
  box-shadow: 0 4px 16px rgba(229, 29, 34, 0.2);
}

.athlete-photo {
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #E51D22, #c41a1d);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(229, 29, 34, 0.3);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.athlete-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.athlete-info h3 {
  font-size: 0.95rem;
  font-weight: 700;
  margin: 0 0 6px 0;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.athlete-info p {
  font-size: 0.8rem;
  color: #64748b;
  margin: 3px 0;
  font-weight: 500;
}

.athlete-details-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e2e8f0;
}

.athlete-details-photo {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  background-color: #E51D22;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  flex-shrink: 0;
}

.athlete-details-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.athlete-details-info h2 {
  font-size: 1.5rem;
  margin: 0 0 8px 0;
  color: #2c3e50;
  word-break: break-all;
}

.athlete-details-info p {
  color: #64748b;
  margin: 4px 0;
  font-size: 0.95rem;
}

.athlete-actions {
  display: flex;
  gap: 10px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  padding: 20px 0;
}

.tab-header-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.form-item label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-item p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

.form-item.full-width {
  grid-column: 1 / span 2;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.performance-item {
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #E51D22;
}

.performance-item h4 {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.performance-item p {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #94a3b8;
}

.empty-tab {
  text-align: center;
  padding: 80px 20px;
  color: #94a3b8;
}

.empty-tab i {
  font-size: 4rem;
  margin-bottom: 15px;
  display: block;
}

.empty-tab p {
  font-size: 1.1rem;
  margin: 5px 0;
}

.empty-tab .hint {
  font-size: 0.9rem;
  color: #cbd5e1;
  margin-top: 10px;
}

::v-deep .el-button--primary {
  background-color: #E51D22;
  border-color: #E51D22;
}

::v-deep .el-button--primary:hover,
::v-deep .el-button--primary:focus {
  background-color: #c41a1d;
  border-color: #c41a1d;
}

::v-deep .el-tabs__item.is-active {
  color: #E51D22;
}

::v-deep .el-tabs__active-bar {
  background-color: #E51D22;
}

::v-deep .el-tabs__item:hover {
  color: #E51D22;
}

::v-deep .el-tabs__content {
  height: calc(100vh - 350px);
  overflow-y: auto;
  padding-right: 10px;
}

::v-deep .el-tabs__content::-webkit-scrollbar {
  width: 8px;
}

::v-deep .el-tabs__content::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

/* Responsive - Tablets y Laptops pequeños */
@media (max-width: 1200px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .sidebar {
    display: none;
  }

  .content-area {
    min-height: auto;
  }

  .athlete-details-header {
    flex-wrap: wrap;
    gap: 15px;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .form-item.full-width {
    grid-column: 1 / span 2;
  }

  .performance-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Responsive - Tablets */
@media (max-width: 992px) {
  .atletas-container {
    padding: 15px;
  }

  .page-header {
    padding: 15px;
    margin-bottom: 15px;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .header-content h1 {
    font-size: 1.5rem;
  }

  .athlete-details-photo {
    width: 80px;
    height: 80px;
    font-size: 2.5rem;
  }

  .athlete-details-info h2 {
    font-size: 1.3rem;
  }

  .athlete-actions {
    flex-wrap: wrap;
  }
}

/* Responsive - Móviles */
@media (max-width: 768px) {
  .atletas-container {
    padding: 10px;
  }

  .page-header {
    padding: 12px;
    border-radius: 8px;
  }

  .header-content h1 {
    font-size: 1.3rem;
  }

  .subtitle {
    font-size: 0.85rem;
  }

  .athlete-details-header {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }

  .athlete-details-photo {
    width: 70px;
    height: 70px;
    font-size: 2rem;
  }

  .athlete-details-info {
    text-align: center;
  }

  .athlete-details-info h2 {
    font-size: 1.2rem;
  }

  .athlete-details-info p {
    font-size: 0.85rem;
  }

  .athlete-actions {
    flex-direction: column;
    width: 100%;
    gap: 8px;
  }

  .athlete-actions .el-button {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 15px;
  }

  .form-item.full-width {
    grid-column: 1;
  }

  .performance-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .performance-item {
    padding: 15px;
  }

  .performance-item p {
    font-size: 1.5rem;
  }

  .empty-state {
    padding: 40px 15px;
  }

  .empty-tab {
    padding: 50px 15px;
  }

  .tab-header-actions {
    justify-content: center;
  }

  /* Tabs scrollable */
  ::v-deep .el-tabs__nav-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  ::v-deep .el-tabs__content {
    height: auto;
    max-height: none;
  }
}

/* Responsive - Móviles pequeños */
@media (max-width: 480px) {
  .atletas-container {
    padding: 8px;
  }

  .page-header {
    padding: 10px;
  }

  .header-content h1 {
    font-size: 1.15rem;
  }

  .athlete-details-photo {
    width: 60px;
    height: 60px;
    font-size: 1.75rem;
  }

  .athlete-details-info h2 {
    font-size: 1.1rem;
  }

  .form-item label {
    font-size: 0.85rem;
  }

  .form-item p {
    font-size: 0.9rem;
  }

  .performance-item h4 {
    font-size: 0.8rem;
  }

  .performance-item p {
    font-size: 1.3rem;
  }
}

.photo-preview-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
}

.photo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
  cursor: pointer;
  z-index: 10;
}

.photo-overlay:hover {
  opacity: 1;
}

.photo-overlay i {
  color: white;
  font-size: 24px;
}
</style>
