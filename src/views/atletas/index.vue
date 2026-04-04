<template>
  <div class="atletas-container">
    <!-- Header -->
    <div class="premium-header">
      <div class="header-content">
        <div class="header-info">
          <h1>Gesti├│n de Atletas
            <el-tag v-if="!canUserEdit && !isUserMedico" type="info" size="small" style="margin-left: 10px;">
              Solo Lectura
            </el-tag>
            <el-tag v-if="isUserMedico" type="warning" size="small" style="margin-left: 10px;">
              Acceso M├®dico
            </el-tag>
          </h1>
          <p class="subtitle">Club Atl├®tico Deportivo Acarigua</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Sidebar con lista de atletas -->
      <aside class="sidebar premium-sidebar">
        <el-card v-loading="loadingAtletas" shadow="hover">
          <div class="sidebar-header">
            <span class="sidebar-title">
              <el-icon class="sidebar-title-icon"><Collection /></el-icon>
              <span>Lista de Atletas</span>
            </span>
            <div class="sidebar-actions">
              <button v-if="canUserEdit" class="mini-add-btn" title="Agregar Atleta" @click="openAtletaModal(false)">
                <el-icon><Plus /></el-icon>
              </button>
              <el-popover placement="bottom-end" width="280" trigger="click" popper-class="athletes-filter-popper">
                <div class="filter-popover">
                  <div class="filter-popover-header">
                    <span class="filter-popover-kicker">Panel r├ípido</span>
                    <h4>Filtros avanzados</h4>
                    <p>Refina la lista por orden, categor├¡a o estatus.</p>
                  </div>
                  <div class="filter-item">
                    <label>Ordenar por</label>
                    <el-select
                      v-model="filterOrder"
                      placeholder="Elige el orden"
                      class="modern-filter-select"
                      popper-class="athletes-filter-select-dropdown"
                      style="width: 100%"
                    >
                      <el-option label="M├ís Recientes" value="recent" />
                      <el-option label="M├ís Antiguos" value="oldest" />
                      <el-option label="Nombre (A-Z)" value="name_asc" />
                      <el-option label="Nombre (Z-A)" value="name_desc" />
                    </el-select>
                  </div>
                  <div class="filter-item">
                    <label>Categor├¡a</label>
                    <el-select
                      v-model="filterCategoria"
                      placeholder="Todas las categor├¡as"
                      clearable
                      class="modern-filter-select"
                      popper-class="athletes-filter-select-dropdown"
                      style="width: 100%"
                    >
                      <el-option v-for="cat in categorias" :key="cat.categoria_id" :label="cat.nombre_categoria" :value="cat.categoria_id" />
                    </el-select>
                  </div>
                  <div class="filter-item">
                    <label>Estatus</label>
                    <el-select
                      v-model="filterEstatus"
                      placeholder="Activos por defecto"
                      clearable
                      class="modern-filter-select"
                      popper-class="athletes-filter-select-dropdown"
                      style="width: 100%"
                    >
                      <el-option label="Activos / Lesionados" value="" />
                      <el-option label="Activo" value="ACTIVO" />
                      <el-option label="Inactivo" value="INACTIVO" />
                      <el-option label="Lesionado" value="LESIONADO" />
                      <el-option label="Suspendido" value="SUSPENDIDO" />
                      <el-option label="Ver Todos" value="TODOS" />
                    </el-select>
                  </div>
                </div>
                <template #reference>
                  <button class="filter-toggle-btn" title="Abrir filtros avanzados">
                    <el-icon><Setting /></el-icon>
                  </button>
                </template>
              </el-popover>
            </div>
          </div>
          <div class="search-container">
            <div class="search-intro">
              <span class="search-intro-badge">B├║squeda r├ípida</span>
              <p>Encuentra atletas por nombre o filtra por c├®dula en segundos.</p>
            </div>
            <div class="search-field">
              <label class="premium-search-label">Buscar Atleta</label>
              <el-input v-model="searchQuery" placeholder="Busca por nombre o apellido" clearable class="modern-search-input modern-sidebar-control" />
            </div>
            <div class="cedula-filter">
              <label class="premium-search-label">Filtro de C├®dula</label>
              <div class="modern-toggle-group">
                <button class="toggle-btn" :class="{ active: filterCedula === 'todos' }" @click="filterCedula = 'todos'">Todos</button>
                <button class="toggle-btn" :class="{ active: filterCedula === 'con_cedula' }" @click="filterCedula = 'con_cedula'">Con C├®dula</button>
                <button class="toggle-btn" :class="{ active: filterCedula === 'sin_cedula' }" @click="filterCedula = 'sin_cedula'">Sin C├®dula</button>
              </div>
              <el-input v-if="filterCedula === 'con_cedula'" v-model="searchCedula" placeholder="Escribe la c├®dula sin puntos" clearable maxlength="9" class="modern-cedula-input modern-sidebar-control" @input="v => searchCedula = v.replace(/\D/g, '')" />
              <p v-if="filterCedula === 'con_cedula'" class="field-caption">Usa solo n├║meros para encontrar coincidencias exactas.</p>
            </div>
          </div>
          <div class="athlete-list">
            <div v-for="atleta in atletas" :key="atleta.atleta_id" class="premium-list-item" :class="{ active: currentAtletaId === atleta.atleta_id }" @click="selectAtleta(atleta.atleta_id)">
              <div class="item-photo">
                <img v-if="atleta.foto" :src="getFotoUrl(atleta.foto)" class="avatar-img">
                <span v-else class="avatar-initials">{{ (atleta.nombre || '?').charAt(0) }}{{ (atleta.apellido || '').charAt(0) }}</span>
              </div>
              <div class="item-info">
                <h3>{{ atleta.nombre }} {{ atleta.apellido }}</h3>
                <p>{{ formatEnum(atleta.posicion_de_juego_nombre) || 'Sin posici├│n' }}</p>
                <p class="athlete-category">{{ atleta.categoria_nombre || 'Sin categor├¡a' }}</p>
              </div>
              <span class="athlete-status-dot" :class="'status-' + (atleta.estatus || '').toLowerCase()" :title="atleta.estatus" />
            </div>
            <div v-if="atletas.length === 0" class="empty-list">
              <span class="empty-list-icon">
                <el-icon><Collection /></el-icon>
              </span>
              <p class="empty-list-title">Sin atletas</p>
              <p class="empty-list-hint">Agrega tu primer atleta con el bot├│n de arriba</p>
            </div>
          </div>
        </el-card>
      </aside>

      <!-- ├ürea de contenido -->
      <main class="content-area">
        <div v-if="!currentAtletaId" class="empty-main">
          <div class="empty-main-content">
            <span class="empty-main-icon">
              <el-icon><UserFilled /></el-icon>
            </span>
            <h3>No hay atleta seleccionado</h3>
            <p>Selecciona un atleta de la lista o agrega uno nuevo.</p>
          </div>
        </div>

        <el-card v-else v-loading="loading" shadow="hover" class="detail-card">
          <!-- Encabezado del atleta -->
          <div class="athlete-details-header">
            <div class="athlete-details-photo">
              <img v-if="currentAtleta.foto" :src="getFotoUrl(currentAtleta.foto)" class="avatar-img-large">
              <span v-else class="avatar-initials-large">{{ (currentAtleta.nombre || '?').charAt(0) }}{{ (currentAtleta.apellido || '').charAt(0) }}</span>
            </div>
            <div class="athlete-details-info">
              <h2>{{ currentAtleta.nombre }} {{ currentAtleta.apellido }}</h2>
              <div class="athlete-meta">
                <div class="athlete-meta-item">
                  <span class="athlete-meta-icon">
                    <el-icon><CollectionTag /></el-icon>
                  </span>
                  <span class="athlete-meta-copy">
                    <span class="athlete-meta-label">Categor├¡a</span>
                    <span class="athlete-meta-value">{{ currentAtleta.categoria_nombre || 'No asignada' }}</span>
                  </span>
                </div>
                <div class="athlete-meta-item">
                  <span class="athlete-meta-icon">
                    <el-icon><Calendar /></el-icon>
                  </span>
                  <span class="athlete-meta-copy">
                    <span class="athlete-meta-label">Edad</span>
                    <span class="athlete-meta-value">{{ calculateAge(currentAtleta.fecha_nacimiento) }} a├▒os</span>
                  </span>
                </div>
              </div>
              <el-tag :type="getStatusType(currentAtleta.estatus)" size="small">{{ currentAtleta.estatus }}</el-tag>
            </div>
            <div class="athlete-actions">
              <button v-if="!isUserMedico" class="action-btn action-btn-info" @click="goToProgress" title="An├ílisis">
                <el-icon class="action-btn-icon"><DataAnalysis /></el-icon>
                <span>An├ílisis</span>
              </button>
              <button v-if="canUserEdit && !isUserMedico" class="action-btn action-btn-danger" @click="deleteAtleta" title="Eliminar">
                <el-icon class="action-btn-icon"><Delete /></el-icon>
                <span>Eliminar</span>
              </button>
              <button
                v-if="canUserEdit || (isUserEntrenador && (activeTab === 'anthropometric' || activeTab === 'performance'))"
                class="action-btn action-btn-primary"
                @click="handleEdit"
                title="Editar"
              >
                <el-icon class="action-btn-icon"><Edit /></el-icon>
                <span>Editar</span>
              </button>
            </div>
          </div>

          <!-- Tabs -->

          <!-- Tabs -->
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
                  <p>{{ calculateAge(currentAtleta.fecha_nacimiento) }} a├▒os</p>
                </div>
                <div class="form-item">
                  <label>Estatus</label>
                  <el-tag :type="getStatusType(currentAtleta.estatus)">{{ currentAtleta.estatus }}</el-tag>
                </div>
                <div class="form-item">
                  <label>C├®dula</label>
                  <p>{{ currentAtleta.cedula || 'No registrada' }}</p>
                </div>
                <div class="form-item">
                  <label>Tel├®fono</label>
                  <p>{{ currentAtleta.telefono || 'No registrado' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Direcci├│n</label>
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
                  <label>Posici├│n de Juego</label>
                  <p>{{ formatEnum(currentAtleta.posicion_de_juego_nombre) || 'No especificada' }}</p>
                </div>
                <div class="form-item">
                  <label>Categor├¡a</label>
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

            <!-- Tab 3: Medidas Antropom├®tricas -->
            <el-tab-pane v-if="isTabVisible('medidas-antropometricas')" label="Medidas Antropom├®tricas" name="anthropometric">
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
                    <template #default="scope">
                      {{ formatDateTime(scope.row.fecha_medicion) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="peso" label="Peso (kg)" width="90" align="center" />
                  <el-table-column prop="altura" label="Altura (cm)" width="95" align="center" />
                  <el-table-column label="IMC" width="90" align="center">
                    <template #default="{ row }">
                      {{ row.indice_de_masa ? Number(row.indice_de_masa).toFixed(1) : '-' }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="porcentaje_grasa" label="% Grasa" width="90" align="center" />
                  <el-table-column prop="porcentaje_musculatura" label="% Musculatura" width="115" align="center" />
                  <el-table-column prop="envergadura" label="Envergadura" width="100" align="center" />
                  <el-table-column prop="largo_de_pierna" label="L. Pierna" width="95" align="center" />
                  <el-table-column prop="largo_de_torso" label="L. Torso" width="90" align="center" />
                  <el-table-column label="Acciones" width="120" align="center">
                    <template #default="scope">
                      <el-button type="text" size="small" @click="openAnthropometricModal(scope.row)">Editar</el-button>
                      <el-button type="text" size="small" style="color: red" @click="deleteMedida(scope.row.medidas_id)">Eliminar</el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <div v-if="!medidas || medidas.length === 0" class="empty-tab" style="padding-top: 30px">
                  <i class="el-icon-data-line" />
                  <p>No hay medidas antropom├®tricas registradas</p>
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
                    <template #default="scope">
                      {{ formatDateTime(scope.row.fecha_test) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="test_de_fuerza" label="Fuerza" />
                  <el-table-column prop="test_resistencia" label="Resistencia" />
                  <el-table-column prop="test_velocidad" label="Velocidad" />
                  <el-table-column prop="test_coordinacion" label="Coordinaci├│n" />
                  <el-table-column prop="test_de_reaccion" label="Reacci├│n" />
                  <el-table-column label="Acciones" width="120" align="center">
                    <template #default="scope">
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
                  <label>C├®dula</label>
                  <p>{{ tutor.cedula || 'No registrada' }}</p>
                </div>
                <div class="form-item">
                  <label>Tipo de Relaci├│n</label>
                  <el-tag>{{ tutor.tipo_relacion }}</el-tag>
                </div>
                <div class="form-item">
                  <label>Tel├®fono</label>
                  <p>{{ tutor.telefono || 'No especificado' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Direcci├│n</label>
                  <p>
                    {{ [tutor.estado, tutor.municipio, tutor.parroquia, tutor.descripcion_descriptiva].filter(Boolean).join(', ') || 'No registrada' }}
                  </p>
                </div>
              </div>
              <div v-else class="empty-tab">
                <i class="el-icon-user-solid" />
                <p>No hay representante asignado</p>
                <p v-if="!isSelfRepresented" class="hint">Haz clic en "Asignar Representante" para asignar un representante</p>
                <p v-else class="hint">El atleta se representa a s├¡ mismo. Haz clic en "Editar Representante" si deseas asignar un tercero.</p>
              </div>
            </el-tab-pane>

            <!-- Tab: Ficha M├®dica (Movido) -->
            <el-tab-pane v-if="isTabVisible('ficha-medica')" label="Ficha M├®dica" name="medical">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit || isUserMedico" type="primary" size="small" icon="el-icon-edit" @click="openMedicalModal">
                  {{ fichaMedica ? 'Editar Ficha M├®dica' : 'Agregar Ficha M├®dica' }}
                </el-button>
              </div>
              <div v-if="fichaMedica" class="form-grid">
                <div class="form-item">
                  <label>Grupo Sangu├¡neo</label>
                  <p>{{ fichaMedica.grupo_sanguineo || 'No especificado' }}</p>
                </div>
                <div class="form-item">
                  <label>Alergias</label>
                  <p>{{ fichaMedica.alergias || 'Ninguna' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Antecedentes Familiares</label>
                  <p>{{ fichaMedica.antecedentes_familiares || 'Ninguno' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Antecedentes Quir├║rgicos / Lesiones</label>
                  <p>{{ fichaMedica.antecedentes_quirurgicos || 'Ninguno' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Condiciones Cr├│nicas</label>
                  <p>{{ fichaMedica.condicion_cronica || 'Ninguna' }}</p>
                </div>
                <div class="form-item full-width">
                  <label>Medicaci├│n Actual</label>
                  <p>{{ fichaMedica.medicacion_actual || 'Ninguna' }}</p>
                </div>
              </div>
              <div v-else class="empty-tab">
                <i class="el-icon-document" />
                <p>No hay ficha m├®dica registrada</p>
                <p v-if="canUserEdit || isUserMedico" class="hint">Haz clic en "Agregar Ficha M├®dica" para crear la ficha m├®dica</p>
              </div>
            </el-tab-pane>

            <!-- Tab 6: Atenci├│n M├®dica -->
            <el-tab-pane v-if="isTabVisible('ficha-medica')" label="Atenci├│n M├®dica" name="atencion_medica">
              <div class="tab-header-actions">
                <el-button v-if="canUserEdit || isUserMedico" type="primary" size="small" icon="el-icon-plus" @click="openAtencionModal">
                  Registrar Atenci├│n
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
                <!-- Tabla aqu├¡ -->
                <el-table
                  :data="atencionesMedicas"
                  style="width: 100%"
                  border
                  size="small"
                >
                  <el-table-column prop="fecha_suceso" label="Fecha" width="100">
                    <template #default="scope">
                      {{ formatDate(scope.row.fecha_suceso) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="diagnostico" label="Diagn├│stico" />
                  <el-table-column label="Especialista">
                    <template #default="scope">
                      {{ scope.row.especialista_nombre }} {{ scope.row.especialista_apellido }}
                    </template>
                  </el-table-column>
                  <el-table-column label="Estado Disp." width="120">
                    <template #default="scope">
                      <el-tag :type="getDisponibilidadMedicaType(scope.row.estado_disponibilidad)">
                        {{ getDisponibilidadMedicaLabel(scope.row.estado_disponibilidad) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="Acciones" width="100">
                    <template #default="scope">
                      <el-button type="text" size="small" @click="editAtencion(scope.row)">Editar</el-button>
                      <el-button type="text" size="small" style="color: red" @click="deleteAtencion(scope.row.atencion_id)">Eliminar</el-button>
                    </template>
                  </el-table-column>
                </el-table>

                <div v-if="!atencionesMedicas || atencionesMedicas.length === 0" class="empty-tab" style="padding-top: 30px">
                  <i class="el-icon-document" />
                  <p>No hay historial de atenciones m├®dicas</p>
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
                    <template #default="scope">
                      {{ formatDate(scope.row.fecha_partido) }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="nombre_rival" label="Rival" />
                  <el-table-column label="Resultado" width="120">
                    <template #default="scope">
                      <el-tag :type="getPartidoResultadoType(scope.row.resultado)">
                        {{ getPartidoResultadoLabel(scope.row.resultado) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="Marcador" width="100" align="center">
                    <template #default="scope">
                      {{ scope.row.goles_anotados }} - {{ scope.row.goles_recibidos }}
                    </template>
                  </el-table-column>
                </el-table>

                <div v-if="!historialPartidos || historialPartidos.length === 0" class="empty-tab" style="padding-top: 30px">
                  <i class="el-icon-medal" />
                  <p>No hay historial de partidos para esta categor├¡a.</p>
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
      v-model="showAtletaModal"
      width="700px"
      :close-on-click-modal="false"
      @closed="resetAtletaStep"
    
      class="modern-athlete-dialog"
    >
      <el-steps :active="atletaStep" finish-status="success" align-center style="margin-bottom: 20px;">
        <el-step title="Datos Personales" />
        <el-step title="Datos Deportivos" />
        <el-step title="Representante" />
      </el-steps>

      <el-form ref="atletaFormRef" :model="atletaForm" :rules="atletaRules" label-position="top">
        <!-- PASO 1: Datos Personales y Direcci├│n -->
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
              <el-form-item label="C├®dula (Opcional)">
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
                  value-format="YYYY-MM-DD"
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
                <template #label>
                  Tel├®fono
                </template>
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

          <h4 style="margin-top: 10px; margin-bottom: 10px; color: #606266;">Direcci├│n de Habitaci├│n</h4>
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
              <el-form-item label="Descripci├│n de la Direcci├│n" class="is-required">
                <el-input v-model="atletaForm.direccion.descripcion_descriptiva" placeholder="Calle, casa, edificio, referencias..." type="textarea" :rows="2" />
              </el-form-item>
            </el-col>
          </el-row>
        </div>

        <!-- PASO 2: Datos Deportivos -->
        <div v-show="atletaStep === 1">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Categor├¡a" prop="categoria_id">
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
                  placeholder="Se autocompleta con la categor├¡a"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="Posici├│n de Juego">
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
              <el-form-item label="C├®dula" :class="{'is-required': isUnderage}">
                <el-input
                  v-model="atletaForm.representante.cedula"
                  placeholder="Ej: 12345678"
                  maxlength="10"
                  @input="v => atletaForm.representante.cedula = v.replace(/\D/g, '')"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="Tel├®fono" :class="{'is-required': isUnderage}">
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
              <el-form-item label="Relaci├│n con el atleta" :class="{'is-required': isUnderage}">
                <el-select v-model="atletaForm.representante.tipo_relacion" placeholder="Seleccionar" style="width: 100%">
                  <el-option label="Padres" value="padres" />
                  <el-option label="Abuelo/a" value="abuelo/a" />
                  <el-option label="T├¡o/a" value="tio/a" />
                  <el-option label="Hermano/a" value="hermano/a" />
                  <el-option label="Primo/a" value="primo/a" />
                  <el-option label="Representante Legal" value="representante" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </div>
      </el-form>

      <template #footer>
        <el-button v-if="atletaStep > 0" @click="atletaStep--">Atr├ís</el-button>
        <el-button v-if="atletaStep < 2" type="primary" @click="nextAtletaStep">Siguiente</el-button>
        <el-button v-if="atletaStep === 2" type="success" :loading="loading" @click="saveAtleta">
          Guardar Atleta
        </el-button>
      </template>
    </el-dialog>

    <!-- Modal Editar Datos Personales -->
    <el-dialog
      title="Editar Datos Personales"
      v-model="showEditPersonalModal"
      width="700px"
      :close-on-click-modal="false"
    
      class="modern-athlete-dialog"
    >
      <el-form ref="editPersonalFormRef" :model="atletaForm" :rules="atletaRules" label-position="top">
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
            <el-form-item label="C├®dula (Opcional)">
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
                value-format="YYYY-MM-DD"
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
              <template #label>
                Tel├®fono
              </template>
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

        <h4 style="margin-top: 10px; margin-bottom: 10px; color: #606266;">Direcci├│n de Habitaci├│n</h4>
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
            <el-form-item label="Descripci├│n de la Direcci├│n" class="is-required">
              <el-input v-model="atletaForm.direccion.descripcion_descriptiva" placeholder="Calle, casa, edificio, referencias..." type="textarea" :rows="2" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showEditPersonalModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveEditPersonal">Guardar Cambios</el-button>
      </template>
    </el-dialog>

    <!-- Modal Editar Datos Deportivos -->
    <el-dialog
      title="Editar Datos Deportivos"
      v-model="showEditSportsModal"
      width="600px"
      :close-on-click-modal="false"
    
      class="modern-athlete-dialog"
    >
      <el-form ref="editSportsFormRef" :model="atletaForm" :rules="atletaRules" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Categor├¡a" prop="categoria_id">
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
                placeholder="Se autocompleta con la categor├¡a"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Posici├│n de Juego">
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
      <template #footer>
        <el-button @click="showEditSportsModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveEditSports">Guardar Cambios</el-button>
      </template>
    </el-dialog>

    <!-- Modal Ficha M├®dica -->
    <el-dialog
      title="Ficha M├®dica"
      v-model="showMedicalModal"
      width="600px"
      :close-on-click-modal="false"
    
      class="modern-athlete-dialog"
    >
      <el-form ref="medicalFormRef" :model="medicalForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Grupo Sangu├¡neo">
              <el-select v-model="medicalForm.grupo_sanguineo" placeholder="Seleccionar" style="width: 100%">
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
              <el-input v-model="medicalForm.alergias" placeholder="Ej: Polen, man├¡" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Antecedentes Familiares">
          <el-input v-model="medicalForm.antecedentes_familiares" type="textarea" :rows="2" placeholder="Antecedentes m├®dicos en la familia" />
        </el-form-item>
        <el-form-item label="Antecedentes Quir├║rgicos / Lesiones">
          <el-input v-model="medicalForm.antecedentes_quirurgicos" type="textarea" :rows="2" placeholder="Operaciones o lesiones previas" />
        </el-form-item>
        <el-form-item label="Condiciones Cr├│nicas">
          <el-input v-model="medicalForm.condicion_cronica" type="textarea" :rows="2" placeholder="Asma, diabetes, etc" />
        </el-form-item>
        <el-form-item label="Medicaci├│n Actual">
          <el-input v-model="medicalForm.medicacion_actual" type="textarea" :rows="2" placeholder="Medicamentos que usa actualmente" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showMedicalModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveMedical">Guardar</el-button>
      </template>
    </el-dialog>

    <!-- Modal Medidas Antropom├®tricas -->
    <el-dialog
      :title="editingAnthropometricId ? 'Editar Medidas Antropom├®tricas' : 'Agregar Medidas Antropom├®tricas'"
      v-model="showAnthropometricModal"
      width="600px"
      :close-on-click-modal="false"
    
      class="modern-athlete-dialog"
    >
      <el-form ref="anthropometricFormRef" :model="anthropometricForm" label-position="top">
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
        <el-form-item label="Fecha y Hora de Medici├│n">
          <el-date-picker
            v-model="anthropometricForm.fecha_medicion"
            type="datetime"
            placeholder="Seleccionar fecha y hora"
            style="width: 100%"
            value-format="yyyy-MM-dd HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAnthropometricModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveAnthropometric">Guardar</el-button>
      </template>
    </el-dialog>

    <!-- Modal Tests de Rendimiento -->
    <el-dialog
      :title="editingPerformanceId ? 'Editar Test de Rendimiento' : 'Agregar Test de Rendimiento'"
      v-model="showPerformanceModal"
      width="600px"
      :close-on-click-modal="false"
    
      class="modern-athlete-dialog"
    >
      <el-form ref="performanceFormRef" :model="performanceForm" label-position="top">
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
            <el-form-item label="Test de Coordinaci├│n">
              <el-input-number v-model="performanceForm.test_coordinacion" :min="0" :step="0.1" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Test de Reacci├│n">
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
      <template #footer>
        <el-button @click="showPerformanceModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="savePerformance">Guardar</el-button>
      </template>
    </el-dialog>

    <!-- Modal Representante -->
    <el-dialog
      :title="isEditingTutor ? 'Editar Representante' : 'Asignar Representante'"
      v-model="showTutorModal"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetTutorForm"
    
      class="modern-athlete-dialog"
    >
      <el-form ref="tutorFormRef" :model="tutorForm" :rules="tutorRules" label-position="top">
        <el-form-item label="Nombre del Representante" prop="nombre_completo">
          <el-input v-model="tutorForm.nombre_completo" placeholder="Nombre completo del representante" />
        </el-form-item>
        <el-form-item label="C├®dula" prop="cedula">
          <el-input
            v-model="tutorForm.cedula"
            placeholder="Ej: 12345678"
            maxlength="10"
            @input="v => tutorForm.cedula = v.replace(/\D/g, '')"
          />
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tel├®fono" prop="telefono">
              <el-input
                v-model="tutorForm.telefono"
                placeholder="Ej: 04141234567"
                maxlength="11"
                @input="v => tutorForm.telefono = v.replace(/\D/g, '')"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tipo de Relaci├│n" prop="tipo_relacion">
              <el-select v-model="tutorForm.tipo_relacion" placeholder="Seleccionar" style="width: 100%">
                <el-option label="Padres" value="padres" />
                <el-option label="Abuelo/a" value="abuelo/a" />
                <el-option label="T├¡o/a" value="tio/a" />
                <el-option label="Hermano/a" value="hermano/a" />
                <el-option label="Primo/a" value="primo/a" />
                <el-option label="Representante Legal" value="representante" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <h4 style="margin-top: 10px; margin-bottom: 10px; color: #606266;">Direcci├│n del Representante</h4>
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
        <el-form-item label="Direcci├│n Detallada" prop="direccion.descripcion_descriptiva" class="is-required">
          <el-input v-model="tutorForm.direccion.descripcion_descriptiva" type="textarea" :rows="2" placeholder="Calle, casa, edificio..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showTutorModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveTutor">
          {{ isEditingTutor ? 'Actualizar' : 'Asignar' }} Representante
        </el-button>
      </template>
    </el-dialog>

    <!-- Modal Atenci├│n M├®dica -->
    <el-dialog
      :title="isEditingAtencion ? 'Editar Atenci├│n M├®dica' : 'Registrar Atenci├│n M├®dica'"
      v-model="showAtencionModal"
      width="600px"
      :close-on-click-modal="false"
      @closed="resetAtencionForm"
    
      class="modern-athlete-dialog"
    >
      <el-form ref="atencionFormRef" :model="atencionForm" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="Tipo de Registro" required>
              <el-select v-model="atencionForm.tipo_registro" placeholder="Seleccionar" style="width: 100%">
                <el-option label="Lesi├│n" :value="1" />
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
                value-format="YYYY-MM-DD"
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
        <el-form-item label="Descripci├│n" required>
          <el-input v-model="atencionForm.descripcion" type="textarea" :rows="2" placeholder="Describa el suceso..." />
        </el-form-item>
        <el-form-item label="Diagn├│stico">
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
                value-format="YYYY-MM-DD"
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
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="Disponibilidad M├®dica">
          <el-select v-model="atencionForm.estado_disponibilidad" placeholder="Seleccionar" style="width: 100%">
            <el-option label="No Apto" :value="0" />
            <el-option label="Trabajo Diferenciado" :value="1" />
            <el-option label="Apto" :value="2" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAtencionModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveAtencion">Guardar</el-button>
      </template>
    </el-dialog>

    <!-- Modal Carnet Discapacidad -->
    <el-dialog
      :title="carnetDiscapacidad ? 'Editar Carnet Discapacidad' : 'Registrar Carnet Discapacidad'"
      v-model="showCarnetModal"
      width="500px"
      :close-on-click-modal="false"
      @closed="resetCarnetForm"
    
      class="modern-athlete-dialog"
    >
      <el-form ref="carnetFormRef" :model="carnetForm" label-position="top">
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
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="showCarnetModal = false">Cancelar</el-button>
        <el-button type="primary" :loading="loading" @click="saveCarnet">Guardar</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import { canEdit, isMedico, isEntrenador, getVisibleAtletasTabs } from '@/utils/permission'
import { getPosiciones } from '@/api/posiciones'
import { Collection, CollectionTag, Calendar, Plus, Setting, Edit, Delete, DataAnalysis, UserFilled } from '@element-plus/icons-vue'

const router = useRouter()
const store = useStore()

// === REFS ===
const atletas = ref([])
const categorias = ref([])
const tutores = ref([])
const posiciones = ref([])
const currentAtletaId = ref(null)
const currentAtleta = ref({})
const fichaMedica = ref(null)
const medidas = ref([])
const tests = ref([])
const tutor = ref(null)
const atencionesMedicas = ref([])
const carnetDiscapacidad = ref(null)
const historialPartidos = ref([])
const activeTab = ref('personal')
const loading = ref(false)
const loadingAtletas = ref(false)
const backendUrl = 'http://localhost:3000'
const atletaStep = ref(0)
const showAtletaModal = ref(false)
const showEditPersonalModal = ref(false)
const showEditSportsModal = ref(false)
const showMedicalModal = ref(false)
const showAnthropometricModal = ref(false)
const editingAnthropometricId = ref(null)
const showPerformanceModal = ref(false)
const editingPerformanceId = ref(null)
const showTutorModal = ref(false)
const showAtencionModal = ref(false)
const showCarnetModal = ref(false)
const isEditingAtleta = ref(false)
const isEditingTutor = ref(false)
const isEditingAtencion = ref(false)
const searchQuery = ref('')
const searchCedula = ref('')
const filterCedula = ref('todos')
const filterSinCedula = ref(false)
const filterCategoria = ref('')
const filterEstatus = ref('')
const filterOrder = ref('recent')
let searchTimeout = null
let searchCedulaTimeout = null
const estadosList = ref([])
const municipiosListAtleta = ref([])
const parroquiasListAtleta = ref([])
const municipiosListTutor = ref([])
const parroquiasListTutor = ref([])
const tiposDiscapacidadList = ref([])
const medicosList = ref([])

// Form refs
const atletaFormRef = ref(null)
const editPersonalFormRef = ref(null)
const editSportsFormRef = ref(null)
const medicalFormRef = ref(null)
const anthropometricFormRef = ref(null)
const performanceFormRef = ref(null)
const tutorFormRef = ref(null)
const atencionFormRef = ref(null)
const carnetFormRef = ref(null)

// === REACTIVE FORMS ===
const atletaForm = reactive({
  nombre: '', apellido: '', cedula: '', fecha_nacimiento: '', sexo: 'M',
  posicion_de_juego: '', categoria_id: '', tutor_id: null, telefono: '',
  direccion: { estado: '', municipio: '', parroquia: '', descripcion_descriptiva: '' },
  representante: { nombre: '', apellido: '', cedula: '', telefono: '', tipo_relacion: '' },
  estatus: 'ACTIVO', foto: null, pierna_dominante: 'Derecha'
})
const medicalForm = reactive({
  grupo_sanguineo: '', alergias: '', antecedentes_familiares: '',
  antecedentes_quirurgicos: '', condicion_cronica: '', medicacion_actual: ''
})
const anthropometricForm = reactive({
  peso: null, altura: null, porcentaje_grasa: null, porcentaje_musculatura: null,
  envergadura: null, largo_de_pierna: null, largo_de_torso: null, fecha_medicion: ''
})
const performanceForm = reactive({
  test_de_fuerza: null, test_resistencia: null, test_velocidad: null,
  test_coordinacion: null, test_de_reaccion: null, fecha_test: ''
})
const tutorForm = reactive({
  nombre_completo: '', cedula: '', telefono: '',
  direccion: { estado: '', municipio: '', parroquia: '', descripcion_descriptiva: '' },
  tipo_relacion: ''
})
const atencionForm = reactive({
  tipo_registro: 1, descripcion: '', diagnostico: '', fecha_suceso: '',
  fecha_alta_estimada: '', fecha_alta_real: '', tratamiento_indicado: '',
  especialista_id: null, estado_disponibilidad: 0
})
const carnetForm = reactive({
  tipo_discapacidad_id: null, nro_carnet: '', porcentaje_discapacidad: null, fecha_registro: ''
})

// === VALIDATION RULES ===
const atletaRules = {
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
}
const tutorRules = {
  nombre_completo: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
    { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, message: 'Solo se permiten letras', trigger: 'blur' }
  ],
  cedula: [
    { required: true, message: 'La cédula es requerida', trigger: 'blur' },
    { min: 7, message: 'La cédula debe tener al menos 7 caracteres', trigger: 'blur' }
  ],
  telefono: [
    { required: true, message: 'El teléfono es requerido', trigger: 'blur' },
    { pattern: /^[0-9]{11}$/, message: 'El teléfono debe tener 11 dígitos numéricos', trigger: 'blur' }
  ],
  tipo_relacion: [{ required: true, message: 'El tipo de relación es requerido', trigger: 'change' }],
  'direccion.estado': [{ required: true, message: 'El estado es requerido', trigger: 'change' }],
  'direccion.municipio': [{ required: true, message: 'El municipio es requerido', trigger: 'blur' }],
  'direccion.parroquia': [{ required: true, message: 'La parroquia es requerida', trigger: 'blur' }],
  'direccion.descripcion_descriptiva': [{ required: true, message: 'La dirección detallada es requerida', trigger: 'blur' }]
}

// === COMPUTED ===
const canUserEdit = computed(() => canEdit())
const isUserMedico = computed(() => isMedico())
const isUserEntrenador = computed(() => isEntrenador())
const visibleTabs = computed(() => getVisibleAtletasTabs())
const isTabVisible = computed(() => (tabName) => visibleTabs.value.includes(tabName))
const isUnderage = computed(() => {
  if (!atletaForm.fecha_nacimiento) return false
  const birthDate = new Date(atletaForm.fecha_nacimiento)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
  return age < 18
})
const isSelfRepresented = computed(() => {
  if (!tutor.value || !currentAtleta.value) return false
  if (!isUnderage.value === false) return false
  if (tutor.value.cedula && tutor.value.cedula !== 'S/N' && tutor.value.cedula === currentAtleta.value.cedula) return true
  const tutorName = (tutor.value.nombre_completo || '').toLowerCase().trim()
  const atletaName = `${currentAtleta.value.nombre || ''} ${currentAtleta.value.apellido || ''}`.toLowerCase().trim()
  return tutor.value.tipo_relacion === 'representante' && tutorName === atletaName
})
const datePickerOptions = computed(() => ({
  disabledDate(time) {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() - 3)
    return time.getTime() > maxDate.getTime()
  }
}))

// === WATCHERS ===
watch(searchQuery, () => { if (searchTimeout) clearTimeout(searchTimeout); searchTimeout = setTimeout(() => loadAtletas(), 500) })
watch(searchCedula, () => { if (searchCedulaTimeout) clearTimeout(searchCedulaTimeout); searchCedulaTimeout = setTimeout(() => loadAtletas(), 500) })
watch(filterSinCedula, () => loadAtletas())
watch(filterCedula, (newVal) => { if (newVal !== 'con_cedula') searchCedula.value = ''; loadAtletas() })
watch(filterCategoria, () => loadAtletas())
watch(filterEstatus, () => loadAtletas())
watch(filterOrder, () => loadAtletas())
watch(currentAtletaId, (newId) => { if (newId && isUserMedico.value) activeTab.value = 'atencion_medica' })

// === DATA LOADING ===
async function loadData() {
  await loadCategorias()
  await Promise.all([loadAtletas(), loadTutores(), loadPosiciones(), fetchEstados(), loadMedicos(), loadTiposDiscapacidad()])
}
async function loadMedicos() {
  try { const r = await request({ url: '/plantel?rol=medico', method: 'get' }); medicosList.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando médicos:', error) }
}
async function loadTiposDiscapacidad() {
  try { const r = await request({ url: '/carnet-discapacidad/tipos', method: 'get' }); tiposDiscapacidadList.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando tipos de discapacidad:', error) }
}
async function loadAtletas() {
  loadingAtletas.value = true
  try {
    const params = {}
    if (searchQuery.value) params.search = searchQuery.value
    if (filterCedula.value === 'con_cedula') { if (searchCedula.value) params.cedula = searchCedula.value; params.con_cedula = 'true' }
    else if (filterCedula.value === 'sin_cedula') { params.sin_cedula = 'true' }
    if (filterCategoria.value) params.categoria_id = filterCategoria.value
    if (filterEstatus.value) params.estatus = filterEstatus.value
    if (filterOrder.value) params.order = filterOrder.value
    const r = await request({ url: '/atletas', method: 'get', params })
    atletas.value = Array.isArray(r) ? r : []
  } catch (error) { console.error('Error cargando atletas:', error); ElMessage.error('Error al cargar atletas') }
  finally { loadingAtletas.value = false }
}
async function loadCategorias() {
  try { const r = await request({ url: '/categoria', method: 'get' }); categorias.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando categorías:', error) }
}
async function loadTutores() {
  try { const r = await request({ url: '/tutor', method: 'get' }); tutores.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando tutores:', error) }
}
async function loadPosiciones() {
  try { const r = await getPosiciones(); posiciones.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando posiciones:', error) }
}

// === LOCATION FUNCTIONS ===
async function fetchEstados() {
  try { const r = await request({ url: '/ubicacion/estados', method: 'get' }); estadosList.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando estados:', error) }
}
async function fetchMunicipiosAtleta(estadoName) {
  if (!estadoName) { municipiosListAtleta.value = []; return }
  const estado = estadosList.value.find(e => e.nombre === estadoName)
  if (!estado) return
  try { const r = await request({ url: `/ubicacion/estados/${estado.id}/municipios`, method: 'get' }); municipiosListAtleta.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando municipios:', error) }
}
async function fetchParroquiasAtleta(municipioName) {
  if (!municipioName) { parroquiasListAtleta.value = []; return }
  const municipio = municipiosListAtleta.value.find(m => m.nombre === municipioName)
  if (!municipio) return
  try { const r = await request({ url: `/ubicacion/municipios/${municipio.id}/parroquias`, method: 'get' }); parroquiasListAtleta.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando parroquias:', error) }
}
async function fetchMunicipiosTutor(estadoName) {
  if (!estadoName) { municipiosListTutor.value = []; return }
  const estado = estadosList.value.find(e => e.nombre === estadoName)
  if (!estado) return
  try { const r = await request({ url: `/ubicacion/estados/${estado.id}/municipios`, method: 'get' }); municipiosListTutor.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando municipios:', error) }
}
async function fetchParroquiasTutor(municipioName) {
  if (!municipioName) { parroquiasListTutor.value = []; return }
  const municipio = municipiosListTutor.value.find(m => m.nombre === municipioName)
  if (!municipio) return
  try { const r = await request({ url: `/ubicacion/municipios/${municipio.id}/parroquias`, method: 'get' }); parroquiasListTutor.value = Array.isArray(r) ? r : [] }
  catch (error) { console.error('Error cargando parroquias:', error) }
}
function handleEstadoChangeAtleta(val) { atletaForm.direccion.municipio = ''; atletaForm.direccion.parroquia = ''; municipiosListAtleta.value = []; parroquiasListAtleta.value = []; fetchMunicipiosAtleta(val) }
function handleMunicipioChangeAtleta(val) { atletaForm.direccion.parroquia = ''; parroquiasListAtleta.value = []; fetchParroquiasAtleta(val) }
function handleEstadoChangeTutor(val) { tutorForm.direccion.municipio = ''; tutorForm.direccion.parroquia = ''; municipiosListTutor.value = []; parroquiasListTutor.value = []; fetchMunicipiosTutor(val) }
function handleMunicipioChangeTutor(val) { tutorForm.direccion.parroquia = ''; parroquiasListTutor.value = []; fetchParroquiasTutor(val) }

// === SELECT ATLETA ===
async function selectAtleta(id, keepTab = false) {
  currentAtletaId.value = id
  currentAtleta.value = atletas.value.find(a => a.atleta_id === id) || {}
  if (!keepTab) {
    activeTab.value = isUserMedico.value ? 'atencion_medica' : 'personal'
    fichaMedica.value = null; medidas.value = []; tests.value = []; tutor.value = null
    atencionesMedicas.value = []; carnetDiscapacidad.value = null; historialPartidos.value = []
  }
  await Promise.all([loadAtencionesMedicas(id), loadCarnetDiscapacidad(id), loadHistorialPartidos(currentAtleta.value.categoria_id)])
  loadFichaMedica(id); loadMedidas(id); loadTests(id); loadTutor(currentAtleta.value.representante_id)
}
async function loadAtencionesMedicas(aid) { try { const r = await request({ url: `/atencion-medica/atleta/${aid}`, method: 'get' }); atencionesMedicas.value = Array.isArray(r) ? r : [] } catch { atencionesMedicas.value = [] } }
async function loadCarnetDiscapacidad(aid) { try { const r = await request({ url: `/carnet-discapacidad/atleta/${aid}`, method: 'get' }); carnetDiscapacidad.value = r || null } catch { carnetDiscapacidad.value = null } }
async function loadHistorialPartidos(cid) { if (!cid) { historialPartidos.value = []; return }; try { const r = await request({ url: `/historial-partidos/categoria/${cid}`, method: 'get' }); historialPartidos.value = Array.isArray(r) ? r : [] } catch { historialPartidos.value = [] } }
async function loadFichaMedica(aid) { try { const r = await request({ url: `/ficha-medica?atleta_id=${aid}`, method: 'get' }); fichaMedica.value = Array.isArray(r) && r.length > 0 ? r[0] : null } catch { fichaMedica.value = null } }
async function loadMedidas(aid) { try { const r = await request({ url: `/mediciones?atleta_id=${aid}`, method: 'get' }); medidas.value = Array.isArray(r) ? r : [] } catch { medidas.value = [] } }
async function loadTests(aid) { try { const r = await request({ url: `/tests?atleta_id=${aid}`, method: 'get' }); tests.value = Array.isArray(r) ? r : [] } catch { tests.value = [] } }
async function loadTutor(tid) { if (!tid) { tutor.value = null; return }; try { const r = await request({ url: `/tutor/${tid}`, method: 'get' }); tutor.value = r } catch { tutor.value = null } }

// === MODAL OPENERS ===
function handleEdit() {
  switch (activeTab.value) {
    case 'personal': openEditPersonalModal(); break
    case 'sports': openEditSportsModal(); break
    case 'medical': openMedicalModal(); break
    case 'anthropometric': openAnthropometricModal(); break
    case 'performance': openPerformanceModal(); break
    case 'representante': openTutorModal(); break
  }
}
function openAtletaModal(editing) {
  isEditingAtleta.value = editing; atletaStep.value = 0
  if (editing && currentAtleta.value) {
    Object.assign(atletaForm, {
      nombre: currentAtleta.value.nombre, apellido: currentAtleta.value.apellido, cedula: currentAtleta.value.cedula,
      fecha_nacimiento: currentAtleta.value.fecha_nacimiento, sexo: currentAtleta.value.sexo || 'M',
      posicion_de_juego: currentAtleta.value.posicion_de_juego || '', categoria_id: currentAtleta.value.categoria_id,
      representante_id: currentAtleta.value.representante_id || null, telefono: currentAtleta.value.telefono || '',
      estatus: currentAtleta.value.estatus || 'ACTIVO', foto: currentAtleta.value.foto || '',
      pierna_dominante: currentAtleta.value.pierna_dominante || 'Derecha',
      direccion: { estado: currentAtleta.value.estado || '', municipio: currentAtleta.value.municipio || '', parroquia: currentAtleta.value.parroquia || '', descripcion_descriptiva: currentAtleta.value.descripcion_descriptiva || '' },
      representante: { nombre: '', apellido: '', cedula: '', telefono: '', tipo_relacion: '' }
    })
    if (atletaForm.direccion.estado) fetchMunicipiosAtleta(atletaForm.direccion.estado).then(() => { if (atletaForm.direccion.municipio) fetchParroquiasAtleta(atletaForm.direccion.municipio) })
    if (currentAtleta.value.representante_id && tutor.value) {
      const n = tutor.value.nombre_completo ? tutor.value.nombre_completo.split(' ') : ['', '']
      Object.assign(atletaForm.representante, { nombre: n[0] || '', apellido: n.slice(1).join(' ') || '', cedula: tutor.value.cedula || '', telefono: tutor.value.telefono || '', tipo_relacion: tutor.value.tipo_relacion || '' })
    } else if (currentAtleta.value.representante_id) {
      request({ url: `/tutor/${currentAtleta.value.representante_id}`, method: 'get' }).then(res => {
        if (res) { const n = res.nombre_completo ? res.nombre_completo.split(' ') : ['', '']; Object.assign(atletaForm.representante, { nombre: n[0] || '', apellido: n.slice(1).join(' ') || '', cedula: res.cedula || '', telefono: res.telefono || '', tipo_relacion: res.tipo_relacion || '' }) }
      }).catch(e => console.error(e))
    }
  } else { resetAtletaForm() }
  showAtletaModal.value = true
}
function openEditPersonalModal() {
  isEditingAtleta.value = true
  if (currentAtleta.value) {
    Object.assign(atletaForm, {
      nombre: currentAtleta.value.nombre, apellido: currentAtleta.value.apellido, cedula: currentAtleta.value.cedula,
      fecha_nacimiento: currentAtleta.value.fecha_nacimiento, sexo: currentAtleta.value.sexo || 'M',
      telefono: currentAtleta.value.telefono || '', estatus: currentAtleta.value.estatus || 'ACTIVO', foto: currentAtleta.value.foto || '',
      direccion: { estado: currentAtleta.value.estado || '', municipio: currentAtleta.value.municipio || '', parroquia: currentAtleta.value.parroquia || '', descripcion_descriptiva: currentAtleta.value.descripcion_descriptiva || '' },
      representante: { nombre: '', apellido: '', cedula: '', telefono: '', tipo_relacion: '' }
    })
    if (atletaForm.direccion.estado) fetchMunicipiosAtleta(atletaForm.direccion.estado).then(() => { if (atletaForm.direccion.municipio) fetchParroquiasAtleta(atletaForm.direccion.municipio) })
  }
  showEditPersonalModal.value = true
}
function openEditSportsModal() {
  isEditingAtleta.value = true
  if (currentAtleta.value) {
    Object.assign(atletaForm, {
      posicion_de_juego: currentAtleta.value.posicion_de_juego || '', categoria_id: currentAtleta.value.categoria_id,
      pierna_dominante: currentAtleta.value.pierna_dominante || 'Derecha',
      direccion: { estado: '', municipio: '', parroquia: '', descripcion_descriptiva: '' },
      representante: { nombre: '', apellido: '', cedula: '', telefono: '', tipo_relacion: '' }
    })
  }
  showEditSportsModal.value = true
}
async function nextAtletaStep() {
  let fieldsToValidate = []
  if (atletaStep.value === 0) fieldsToValidate = ['nombre', 'apellido', 'fecha_nacimiento', 'sexo']
  else if (atletaStep.value === 1) fieldsToValidate = ['categoria_id']
  const goToNextStep = async () => {
    if (atletaStep.value === 0) {
      const { telefono, direccion } = atletaForm
      if (!isUnderage.value) { if (!telefono || telefono.length !== 11) { ElMessage.error('Debe ingresar un número de teléfono válido de 11 dígitos para atletas mayores de edad.'); return } }
      else if (telefono && telefono.length !== 11) { ElMessage.error('El número de teléfono ingresado está incompleto (deben ser 11 dígitos).'); return }
      if (!direccion.estado || !direccion.municipio || !direccion.parroquia || !direccion.descripcion_descriptiva) { ElMessage.error('Todos los atletas deben registrar su dirección completa.'); return }
      if (atletaForm.cedula) {
        if (atletaForm.cedula.length < 7 && atletaForm.cedula.toUpperCase() !== 'S/N') { ElMessage.error('La cédula del atleta debe tener al menos 7 dígitos (o "S/N").'); return }
        try {
          const res = await request({ url: '/atletas', method: 'get', params: { con_cedula: 'true', cedula: atletaForm.cedula } })
          const isDuplicate = isEditingAtleta.value ? res.some(a => a.cedula === atletaForm.cedula && a.atleta_id !== currentAtletaId.value) : res.some(a => a.cedula === atletaForm.cedula)
          if (isDuplicate) { ElMessage.error('La cédula ingresada ya está registrada para otro atleta.'); return }
        } catch (error) { console.error('Error validando cédula', error) }
      }
    }
    atletaStep.value++
  }
  if (fieldsToValidate.length > 0) {
    let validCount = 0; let hasErrors = false
    fieldsToValidate.forEach(field => {
      atletaFormRef.value.validateField(field, (errorMessage) => {
        if (errorMessage) hasErrors = true; validCount++
        if (validCount === fieldsToValidate.length) { if (!hasErrors) goToNextStep(); else ElMessage.error('Por favor, complete los campos requeridos en este paso.') }
      })
    })
  } else { goToNextStep() }
}
function resetAtletaStep() { atletaStep.value = 0; if (atletaFormRef.value) atletaFormRef.value.clearValidate() }
function checkUnderage() { /* isUnderage computed reacts automatically */ }
function openMedicalModal() {
  if (fichaMedica.value) { Object.assign(medicalForm, { grupo_sanguineo: fichaMedica.value.grupo_sanguineo || '', alergias: fichaMedica.value.alergias || '', antecedentes_familiares: fichaMedica.value.antecedentes_familiares || '', antecedentes_quirurgicos: fichaMedica.value.antecedentes_quirurgicos || '', condicion_cronica: fichaMedica.value.condicion_cronica || '', medicacion_actual: fichaMedica.value.medicacion_actual || '' }) }
  else { resetMedicalForm() }
  showMedicalModal.value = true
}
function openAnthropometricModal(medida = null) {
  if (medida && medida.medidas_id) { editingAnthropometricId.value = medida.medidas_id; Object.assign(anthropometricForm, { peso: medida.peso, altura: medida.altura, porcentaje_grasa: medida.porcentaje_grasa, porcentaje_musculatura: medida.porcentaje_musculatura, envergadura: medida.envergadura, largo_de_pierna: medida.largo_de_pierna, largo_de_torso: medida.largo_de_torso, fecha_medicion: medida.fecha_medicion }) }
  else { editingAnthropometricId.value = null; resetAnthropometricForm(); const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); anthropometricForm.fecha_medicion = now.toISOString().slice(0, 19).replace('T', ' ') }
  showAnthropometricModal.value = true
}
function openPerformanceModal(test = null) {
  if (test && test.test_id) { editingPerformanceId.value = test.test_id; Object.assign(performanceForm, { test_de_fuerza: test.test_de_fuerza, test_resistencia: test.test_resistencia, test_velocidad: test.test_velocidad, test_coordinacion: test.test_coordinacion, test_de_reaccion: test.test_de_reaccion, fecha_test: test.fecha_test }) }
  else { editingPerformanceId.value = null; resetPerformanceForm(); const now = new Date(); now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); performanceForm.fecha_test = now.toISOString().slice(0, 19).replace('T', ' ') }
  showPerformanceModal.value = true
}
function openTutorModal() {
  if (tutor.value && !isSelfRepresented.value) {
    isEditingTutor.value = true
    Object.assign(tutorForm, { nombre_completo: tutor.value.nombre_completo, cedula: tutor.value.cedula === 'S/N' ? '' : tutor.value.cedula, telefono: (tutor.value.telefono === 'S/N' ? '' : tutor.value.telefono) || '', direccion: { estado: tutor.value.estado || '', municipio: tutor.value.municipio || '', parroquia: tutor.value.parroquia || '', descripcion_descriptiva: tutor.value.descripcion_descriptiva || '' }, tipo_relacion: tutor.value.tipo_relacion })
    if (tutorForm.direccion.estado) fetchMunicipiosTutor(tutorForm.direccion.estado).then(() => { if (tutorForm.direccion.municipio) fetchParroquiasTutor(tutorForm.direccion.municipio) })
  } else {
    isEditingTutor.value = false; resetTutorForm()
    if (currentAtleta.value) Object.assign(tutorForm.direccion, { pais: currentAtleta.value.pais || 'venezuela', estado: currentAtleta.value.estado || '', municipio: currentAtleta.value.municipio || '', parroquia: currentAtleta.value.parroquia || '', descripcion_descriptiva: currentAtleta.value.descripcion_descriptiva || '' })
  }
  showTutorModal.value = true
}
function openAtencionModal() { isEditingAtencion.value = false; resetAtencionForm(); atencionForm.fecha_suceso = new Date().toISOString().split('T')[0]; showAtencionModal.value = true }
function editAtencion(row) { isEditingAtencion.value = true; Object.assign(atencionForm, { ...row }); if (atencionForm.fecha_suceso) atencionForm.fecha_suceso = atencionForm.fecha_suceso.split('T')[0]; if (atencionForm.fecha_alta_estimada) atencionForm.fecha_alta_estimada = atencionForm.fecha_alta_estimada.split('T')[0]; if (atencionForm.fecha_alta_real) atencionForm.fecha_alta_real = atencionForm.fecha_alta_real.split('T')[0]; showAtencionModal.value = true }
function openCarnetModal() {
  if (carnetDiscapacidad.value) { Object.assign(carnetForm, { tipo_discapacidad_id: carnetDiscapacidad.value.tipo_discapacidad_id, nro_carnet: carnetDiscapacidad.value.nro_carnet, porcentaje_discapacidad: carnetDiscapacidad.value.porcentaje_discapacidad, fecha_registro: carnetDiscapacidad.value.fecha_registro ? carnetDiscapacidad.value.fecha_registro.split('T')[0] : '' }) }
  else { resetCarnetForm(); carnetForm.fecha_registro = new Date().toISOString().split('T')[0] }
  showCarnetModal.value = true
}

// === SAVE FUNCTIONS ===
function saveAtleta() {
  atletaFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (isUnderage.value) {
      const rep = atletaForm.representante
      if (!rep.nombre || !rep.apellido || !rep.cedula || !rep.telefono || !rep.tipo_relacion) { ElMessage.error('Complete todos los datos del representante, el atleta es menor de edad.'); return }
      if (rep.cedula.length < 7) { ElMessage.error('La cédula del representante debe tener al menos 7 dígitos.'); return }
      if (rep.telefono.length !== 11) { ElMessage.error('El teléfono del representante debe tener exactamente 11 dígitos.'); return }
    } else { if (!atletaForm.telefono || atletaForm.telefono.length !== 11) { ElMessage.error('Debe ingresar un teléfono válido de 11 dígitos para atletas mayores de edad.'); return } }
    const dir = atletaForm.direccion
    if (!dir.estado || !dir.municipio || !dir.parroquia || !dir.descripcion_descriptiva) { ElMessage.error('Complete todos los datos de la dirección.'); return }
    loading.value = true
    try {
      if (isEditingAtleta.value) { await request({ url: `/atletas/${currentAtletaId.value}`, method: 'put', data: { ...atletaForm } }); ElMessage.success('Atleta actualizado correctamente') }
      else { await request({ url: '/atletas', method: 'post', data: { ...atletaForm } }); ElMessage.success('Atleta creado correctamente') }
      showAtletaModal.value = false; await loadAtletas()
      if (isEditingAtleta.value) await selectAtleta(currentAtletaId.value)
    } catch (error) { console.error('Error guardando atleta:', error) }
    finally { loading.value = false }
  })
}
function saveEditPersonal() {
  editPersonalFormRef.value.validate(async (valid) => {
    if (!valid) return
    if (!isUnderage.value) {
      if (!atletaForm.telefono) { ElMessage.error('El teléfono es obligatorio para atletas mayores de edad.'); return }
      const dir = atletaForm.direccion; if (!dir.estado || !dir.municipio || !dir.parroquia || !dir.descripcion_descriptiva) { ElMessage.error('Complete todos los datos de la dirección.'); return }
    }
    loading.value = true
    try {
      await request({ url: `/atletas/${currentAtletaId.value}`, method: 'put', data: { nombre: atletaForm.nombre, apellido: atletaForm.apellido, cedula: atletaForm.cedula, fecha_nacimiento: atletaForm.fecha_nacimiento, sexo: atletaForm.sexo, telefono: atletaForm.telefono, estatus: atletaForm.estatus, foto: atletaForm.foto, direccion: atletaForm.direccion } })
      ElMessage.success('Datos personales actualizados correctamente'); showEditPersonalModal.value = false; await loadAtletas(); await selectAtleta(currentAtletaId.value)
    } catch (error) { console.error('Error actualizando datos personales:', error) }
    finally { loading.value = false }
  })
}
function saveEditSports() {
  editSportsFormRef.value.validate(async (valid) => {
    if (!valid) return; loading.value = true
    try {
      await request({ url: `/atletas/${currentAtletaId.value}`, method: 'put', data: { categoria_id: atletaForm.categoria_id, posicion_de_juego: atletaForm.posicion_de_juego, pierna_dominante: atletaForm.pierna_dominante } })
      ElMessage.success('Datos deportivos actualizados correctamente'); showEditSportsModal.value = false; await loadAtletas(); await selectAtleta(currentAtletaId.value)
    } catch (error) { console.error('Error actualizando datos deportivos:', error) }
    finally { loading.value = false }
  })
}
async function saveMedical() {
  loading.value = true
  try {
    const data = { ...medicalForm, atleta_id: currentAtletaId.value }
    if (fichaMedica.value) { await request({ url: `/ficha-medica/${currentAtletaId.value}`, method: 'put', data }); ElMessage.success('Ficha médica actualizada') }
    else { await request({ url: '/ficha-medica', method: 'post', data }); ElMessage.success('Ficha médica creada') }
    showMedicalModal.value = false; await loadFichaMedica(currentAtletaId.value)
  } catch (error) { console.error('Error guardando ficha médica:', error) }
  finally { loading.value = false }
}
async function saveAnthropometric() {
  loading.value = true
  try {
    const payload = { ...anthropometricForm, atleta_id: currentAtletaId.value }
    let url = '/mediciones'; let method = 'post'
    if (editingAnthropometricId.value) { url = `/mediciones/${editingAnthropometricId.value}`; method = 'put' }
    await request({ url, method, data: payload }); ElMessage.success(`Medidas ${editingAnthropometricId.value ? 'actualizadas' : 'registradas'} exitosamente`)
    showAnthropometricModal.value = false; await loadMedidas(currentAtletaId.value)
  } catch (error) { console.error('Error guardando medidas:', error) }
  finally { loading.value = false }
}
async function savePerformance() {
  loading.value = true
  try {
    const payload = { ...performanceForm, atleta_id: currentAtletaId.value }
    let url = '/tests'; let method = 'post'
    if (editingPerformanceId.value) { url = `/tests/${editingPerformanceId.value}`; method = 'put' }
    await request({ url, method, data: payload }); ElMessage.success(`Test ${editingPerformanceId.value ? 'actualizado' : 'registrado'} exitosamente`)
    showPerformanceModal.value = false; await loadTests(currentAtletaId.value)
  } catch (error) { console.error('Error guardando test:', error) }
  finally { loading.value = false }
}
function saveTutor() {
  tutorFormRef.value.validate(async (valid) => {
    if (!valid) return; loading.value = true
    try {
      if (isEditingTutor.value && tutor.value) { await request({ url: `/tutor/${tutor.value.representante_id}`, method: 'put', data: { ...tutorForm } }); ElMessage.success('Tutor actualizado correctamente') }
      else {
        const response = await request({ url: '/tutor', method: 'post', data: { ...tutorForm } })
        const nuevoTutorId = response.id || response.tutor_id || response.insertId
        if (!nuevoTutorId) { console.error('Respuesta:', response); throw new Error('No se recibió el ID del tutor creado') }
        if (!currentAtletaId.value) throw new Error('No hay atleta seleccionado')
        await request({ url: `/atletas/${currentAtletaId.value}/tutor`, method: 'put', data: { tutor_id: nuevoTutorId } }); ElMessage.success('Tutor creado y asignado correctamente')
      }
      showTutorModal.value = false; await loadAtletas(); await selectAtleta(currentAtletaId.value, true)
    } catch (error) { console.error('Error guardando tutor:', error) }
    finally { loading.value = false }
  })
}
async function saveAtencion() {
  if (!atencionForm.tipo_registro || !atencionForm.especialista_id || !atencionForm.descripcion || !atencionForm.fecha_suceso) { ElMessage.warning('Complete todos los campos obligatorios: Tipo, Especialista, Descripción y Fecha.'); return }
  loading.value = true
  try {
    const data = { ...atencionForm, atleta_id: currentAtletaId.value }
    if (isEditingAtencion.value) { await request({ url: `/atencion-medica/${atencionForm.atencion_id}`, method: 'put', data }); ElMessage.success('Atención médica actualizada') }
    else { await request({ url: '/atencion-medica', method: 'post', data }); ElMessage.success('Atención médica registrada') }
    showAtencionModal.value = false; await loadAtencionesMedicas(currentAtletaId.value)
  } catch (error) { console.error(error) } finally { loading.value = false }
}
async function saveCarnet() {
  loading.value = true
  try {
    const data = { ...carnetForm, atleta_id: currentAtletaId.value }
    if (carnetDiscapacidad.value) { await request({ url: `/carnet-discapacidad/${carnetDiscapacidad.value.id}`, method: 'put', data }); ElMessage.success('Carnet de discapacidad actualizado') }
    else { await request({ url: '/carnet-discapacidad', method: 'post', data }); ElMessage.success('Carnet de discapacidad registrado') }
    showCarnetModal.value = false; await loadCarnetDiscapacidad(currentAtletaId.value)
  } catch (error) { console.error(error); ElMessage.error('Error al guardar el carnet de discapacidad') } finally { loading.value = false }
}

// === DELETE FUNCTIONS ===
async function deleteTutor() {
  try { await ElMessageBox.confirm('¿Está seguro de que desea eliminar este representante?', 'Confirmar eliminación', { confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar', type: 'warning' }) } catch { return }
  loading.value = true
  try { await request({ url: `/atletas/${currentAtletaId.value}/tutor`, method: 'delete' }); ElMessage.success('Representante eliminado correctamente'); await loadAtletas(); await selectAtleta(currentAtletaId.value, true) }
  catch (error) { console.error('Error eliminando tutor:', error); ElMessage.error('Error al eliminar representante') } finally { loading.value = false }
}
async function deleteAtencion(id) {
  try { await ElMessageBox.confirm('¿Desea eliminar este registro médico?', 'Confirmar', { confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', type: 'warning' }); await request({ url: `/atencion-medica/${id}`, method: 'delete' }); ElMessage.success('Registro eliminado'); await loadAtencionesMedicas(currentAtletaId.value) }
  catch (error) { if (error !== 'cancel') { console.error(error); ElMessage.error('Error al eliminar') } }
}
async function deletePerformanceTest(testId) {
  if (!testId) return
  try { await ElMessageBox.confirm('¿Está seguro de eliminar este test?', 'Confirmar', { confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', type: 'warning' }); loading.value = true; await request({ url: `/tests/${testId}`, method: 'delete' }); ElMessage.success('Test eliminado exitosamente'); await loadAtletas(); await selectAtleta(currentAtletaId.value) }
  catch (error) { if (error !== 'cancel') { console.error('Error eliminando test:', error); ElMessage.error('Error al eliminar el test') } } finally { loading.value = false }
}
async function deleteMedida(medidaId) {
  if (!medidaId) return
  try { await ElMessageBox.confirm('¿Está seguro de eliminar estas medidas?', 'Confirmar', { confirmButtonText: 'Eliminar', cancelButtonText: 'Cancelar', type: 'warning' }); loading.value = true; await request({ url: `/mediciones/${medidaId}`, method: 'delete' }); ElMessage.success('Medidas eliminadas exitosamente'); await loadAtletas(); await selectAtleta(currentAtletaId.value) }
  catch (error) { if (error !== 'cancel') { console.error('Error eliminando medidas:', error); ElMessage.error('Error al eliminar medidas') } } finally { loading.value = false }
}
function deleteAtleta() {
  ElMessageBox.confirm('¿Estás seguro de que deseas ELIMINAR PERMANENTEMENTE a este atleta? Se borrarán TODOS sus registros asociados. Esta acción NO se puede deshacer.', 'Eliminar Atleta Permanentemente', { confirmButtonText: 'Sí, eliminar todo', cancelButtonText: 'Cancelar', type: 'error' })
  .then(async () => {
    try { await request({ url: `/atletas/${currentAtletaId.value}`, method: 'delete' }); ElMessage.success('Atleta eliminado correctamente'); currentAtletaId.value = null; currentAtleta.value = {}; await loadAtletas() }
    catch (error) { console.error('Error eliminando atleta:', error); ElMessage.error('Error al eliminar atleta') }
  }).catch(() => {})
}

// === RESET FUNCTIONS ===
function resetAtletaForm() { Object.assign(atletaForm, { nombre: '', apellido: '', cedula: '', fecha_nacimiento: '', sexo: 'M', posicion_de_juego: null, categoria_id: '', tutor_id: null, telefono: '', direccion: { estado: '', municipio: '', parroquia: '', descripcion_descriptiva: '' }, representante: { nombre: '', apellido: '', cedula: '', telefono: '', tipo_relacion: '' }, estatus: 'ACTIVO', foto: null, pierna_dominante: 'Derecha' }); municipiosListAtleta.value = []; parroquiasListAtleta.value = [] }
function resetMedicalForm() { Object.assign(medicalForm, { grupo_sanguineo: '', alergias: '', antecedentes_familiares: '', antecedentes_quirurgicos: '', condicion_cronica: '', medicacion_actual: '' }) }
function resetAnthropometricForm() { Object.assign(anthropometricForm, { peso: null, altura: null, porcentaje_grasa: null, porcentaje_musculatura: null, envergadura: null, largo_de_pierna: null, largo_de_torso: null, fecha_medicion: '' }) }
function resetPerformanceForm() { Object.assign(performanceForm, { test_de_fuerza: null, test_resistencia: null, test_velocidad: null, test_coordinacion: null, test_de_reaccion: null, fecha_test: '' }) }
function resetTutorForm() { Object.assign(tutorForm, { nombre_completo: '', cedula: '', telefono: '', correo: '', direccion: { estado: '', municipio: '', parroquia: '', descripcion_descriptiva: '' }, tipo_relacion: '' }); municipiosListTutor.value = []; parroquiasListTutor.value = [] }
function resetAtencionForm() { Object.assign(atencionForm, { tipo_registro: 1, descripcion: '', diagnostico: '', fecha_suceso: '', fecha_alta_estimada: '', fecha_alta_real: '', tratamiento_indicado: '', especialista_id: null, estado_disponibilidad: 0 }) }
function resetCarnetForm() { Object.assign(carnetForm, { tipo_discapacidad_id: null, nro_carnet: '', porcentaje_discapacidad: null, fecha_registro: '' }) }

// === UTILITY FUNCTIONS ===
function formatEnum(value) { if (!value) return ''; return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase() }
function calculateAge(birthdate) { if (!birthdate) return '-'; const b = new Date(birthdate); const t = new Date(); let age = t.getFullYear() - b.getFullYear(); const m = t.getMonth() - b.getMonth(); if (m < 0 || (m === 0 && t.getDate() < b.getDate())) age--; return age }
function formatDate(dateString) { if (!dateString) return '-'; return new Date(dateString).toLocaleDateString('es-ES') }
function formatDateTime(dateString) { if (!dateString) return '-'; return new Date(dateString).toLocaleString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) }
function getStatusType(estatus) { return { 'ACTIVO': 'success', 'INACTIVO': 'info', 'LESIONADO': 'warning', 'SUSPENDIDO': 'danger' }[estatus] || 'info' }
function getDisponibilidadMedicaType(estado) { return { 0: 'danger', 1: 'warning', 2: 'success' }[estado] || 'info' }
function getDisponibilidadMedicaLabel(estado) { return { 0: 'No Apto', 1: 'Diferenciado', 2: 'Apto' }[estado] || 'Desconocido' }
function getPartidoResultadoType(r) { if (r === 'V') return 'success'; if (r === 'E') return 'warning'; if (r === 'D') return 'danger'; return 'info' }
function getPartidoResultadoLabel(r) { if (r === 'V') return 'Victoria'; if (r === 'E') return 'Empate'; if (r === 'D') return 'Derrota'; return 'N/A' }
function getEntrenadorNombre(categoriaId) { if (!categoriaId || !categorias.value || categorias.value.length === 0) return 'No asignado'; const c = categorias.value.find(c => c.categoria_id === categoriaId); return c ? (c.entrenador_nombre || c.nombre_entrenador || 'No asignado') : 'No asignado' }
function getFotoUrl(filename) { if (!filename) return null; return `${backendUrl}/uploads/atletas/${filename}` }
function handleUploadSuccess(res) { atletaForm.foto = res.filename; ElMessage.success('Foto cargada exitosamente') }
function removePhoto() { atletaForm.foto = '' }
function beforeAvatarUpload(file) { const isJPGorPNG = file.type === 'image/jpeg' || file.type === 'image/png'; const isLt2M = file.size / 1024 / 1024 < 2; if (!isJPGorPNG) ElMessage.error('La imagen debe estar en formato JPG o PNG'); if (!isLt2M) ElMessage.error('La imagen no puede exceder los 2MB'); return isJPGorPNG && isLt2M }
function goToProgress() { router.push({ path: '/reportes/rendimiento', query: { atleta_id: currentAtletaId.value } }) }

// === LIFECYCLE ===
onMounted(() => { loadData() })
</script>


<style scoped>
.atletas-container {
  padding: 20px;
  min-height: 100vh;
}

.premium-header {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: white;
  padding: 24px 30px;
  border-radius: 16px;
  margin-bottom: 24px;
  box-shadow: 0 10px 25px -5px var(--color-shadow);
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

/* Header Button - Custom Style */
.add-atleta-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.35);
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 10px 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
  flex-shrink: 0;
  font-family: inherit;
}

.add-atleta-btn:hover {
  background: rgba(255, 255, 255, 0.28);
  border-color: rgba(255, 255, 255, 0.6);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.18);
  transform: translateY(-2px);
}

.add-atleta-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.25);
  font-size: 1.1rem;
  font-weight: 700;
  line-height: 1;
}

.main-content {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 20px;
}

aside.sidebar {
  padding: 0;
  background: transparent;
}

.sidebar-card {
  background: var(--color-bg-card);
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 2px solid var(--color-border);
  overflow: hidden;
  height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.sidebar-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-add-btn {
  background: var(--color-bg-hover);
  color: var(--color-primary);
  border: 1px solid rgba(255, 255, 255, 0.28);
  width: 28px;
  height: 28px;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 800;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);

  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 10px rgba(0,0,0,0.15);
  }
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 16px;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: #fff;
}

.sidebar-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  letter-spacing: 0.2px;
}

.sidebar-title-icon {
  font-size: 1rem;
}

.filter-toggle-btn {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.3);
  color: #fff;
  font-size: 1.1rem;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-toggle-btn:hover {
  background: rgba(255,255,255,0.3);
}

/* Empty Main Content */
.empty-main {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: var(--color-bg-card);
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.empty-main-content {
  text-align: center;
  padding: 40px;
}

.empty-main-icon {
  width: 88px;
  height: 88px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  border-radius: 24px;
  font-size: 2.4rem;
  color: var(--color-primary);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.78), rgba(255, 255, 255, 0.42));
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);
}

.empty-main-content h3 {
  color: #475569;
  font-size: 1.3rem;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.empty-main-content p {
  color: var(--color-border);
  margin: 0;
  font-size: 0.95rem;
}

/* Detail Card */
.detail-card {
  border-radius: 14px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 2px solid var(--color-border);
  overflow: hidden;
}

/* Avatar Initials */
.avatar-initials {
  font-size: 0.85rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
}

.avatar-initials-large {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
}

/* Athlete Status Dot */
.athlete-status-dot {
  width: 10px;
  height: 10px;
  min-width: 10px;
  border-radius: 50%;
  flex-shrink: 0;
  align-self: center;
}
.athlete-status-dot.status-activo { background: #22c55e; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
.athlete-status-dot.status-inactivo { background: var(--color-border); }
.athlete-status-dot.status-lesionado { background: #f59e0b; box-shadow: 0 0 6px rgba(245, 158, 11, 0.4); }
.athlete-status-dot.status-suspendido { background: #ef4444; box-shadow: 0 0 6px rgba(239, 68, 68, 0.4); }

/* Athlete Category badge in list */
.athlete-category {
  color: var(--color-text-main) !important;
  font-size: 0.8rem !important;
  font-weight: 600;
  opacity: 1;
}

/* Empty List */
.empty-list {
  text-align: center;
  padding: 50px 20px;
}

.empty-list-icon {
  width: 64px;
  height: 64px;
  font-size: 1.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
  border-radius: 18px;
  color: var(--color-primary);
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.06);
}

.empty-list-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-muted);
  margin: 0 0 6px 0;
}

.empty-list-hint {
  font-size: 0.82rem;
  color: var(--color-border);
  margin: 0;
}

/* Action Buttons */
.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease;
  font-family: inherit;
}

.action-btn-icon {
  font-size: 0.95rem;
}

/* Search & Filters Inside Sidebar */
.search-container {
  padding: 18px 16px 16px;
  background: linear-gradient(180deg, rgba(255, 59, 48, 0.08), transparent 90px), var(--color-bg-card);
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

.search-intro {
  margin-bottom: 14px;
  padding: 0;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.search-intro-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(15, 23, 42, 0.08);
  color: var(--color-text-main);
  border: 1px solid var(--color-border);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

[data-theme='dark'] .search-intro-badge {
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  border-color: transparent;
}

.search-intro p {
  margin: 10px 0 0;
  color: var(--color-text-main);
  font-size: 0.82rem;
  line-height: 1.5;
}

.premium-search-label {
  display: block;
  font-size: 0.68rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-primary);
  margin-bottom: 8px;
  opacity: 0.95;
}

:deep(.athletes-filter-popper) {
  border-radius: 22px !important;
  padding: 0 !important;
  background: var(--color-bg-card) !important;
  border: 1px solid rgba(148, 163, 184, 0.16) !important;
  box-shadow: 0 28px 55px -35px rgba(15, 23, 42, 0.75) !important;
}

.filter-popover {
  padding: 18px;
}

.filter-popover-header {
  margin-bottom: 16px;
}

.filter-popover-kicker {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 59, 48, 0.12);
  color: var(--color-primary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.filter-popover-header h4 {
  margin: 10px 0 6px;
  color: var(--color-text-main);
  font-size: 1rem;
  font-weight: 800;
}

.filter-popover-header p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.83rem;
  line-height: 1.5;
}

.filter-item {
  margin-bottom: 14px;
}

.filter-item:last-child {
  margin-bottom: 0;
}

.filter-item label {
  display: block;
  margin-bottom: 8px;
  color: var(--color-text-muted);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

:deep(.modern-filter-select .el-select__wrapper) {
  min-height: 44px;
  border-radius: 14px;
  background: var(--color-bg-body);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.16);
  transition: box-shadow 0.25s ease, background 0.25s ease, transform 0.25s ease;
}

:deep(.modern-filter-select .el-select__wrapper:hover) {
  box-shadow: inset 0 0 0 1px rgba(255, 90, 79, 0.28);
}

:deep(.modern-filter-select .el-select__wrapper.is-focused) {
  background: var(--color-bg-card);
  box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.14), inset 0 0 0 1px var(--color-primary);
}

:deep(.athletes-filter-select-dropdown.el-popper) {
  border-radius: 14px !important;
  background: var(--color-bg-card) !important;
  border: 1px solid rgba(148, 163, 184, 0.18) !important;
  box-shadow: 0 22px 40px -28px rgba(15, 23, 42, 0.9) !important;
}

:deep(.athletes-filter-select-dropdown .el-popper__arrow::before) {
  background: var(--color-bg-card) !important;
  border-color: rgba(148, 163, 184, 0.18) !important;
}

:deep(.athletes-filter-select-dropdown .el-select-dropdown__wrap) {
  background: transparent !important;
}

:deep(.athletes-filter-select-dropdown .el-select-dropdown__item) {
  color: var(--color-text-main) !important;
  font-weight: 600;
}

:deep(.athletes-filter-select-dropdown .el-select-dropdown__item:hover),
:deep(.athletes-filter-select-dropdown .el-select-dropdown__item.hover) {
  background: rgba(255, 59, 48, 0.16) !important;
  color: var(--color-text-main) !important;
}

:deep(.athletes-filter-select-dropdown .el-select-dropdown__item.selected) {
  background: rgba(255, 59, 48, 0.22) !important;
  color: #bfdbfe !important;
  font-weight: 700;
}

:deep(.modern-sidebar-control .el-input__wrapper) {
  min-height: 46px;
  border-radius: 15px;
  background: var(--color-bg-body);
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
  padding: 0 14px;
  transition: box-shadow 0.25s ease, transform 0.25s ease, background 0.25s ease;
}

:deep(.modern-sidebar-control .el-input__wrapper:hover) {
  box-shadow: inset 0 0 0 1px rgba(255, 90, 79, 0.26);
}

:deep(.modern-sidebar-control .el-input__wrapper.is-focus) {
  background: var(--color-bg-card);
  box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.14), inset 0 0 0 1px var(--color-primary);
}

:deep(.modern-sidebar-control .el-input__inner) {
  font-size: 0.93rem;
  font-weight: 600;
  color: var(--color-text-main);
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}

.field-caption {
  margin: 8px 2px 0;
  color: var(--color-text-muted);
  font-size: 0.77rem;
  line-height: 1.45;
}

.modern-toggle-group {
  display: flex;
  gap: 6px;
  background: linear-gradient(180deg, rgba(148, 163, 184, 0.14), rgba(148, 163, 184, 0.08));
  padding: 6px;
  border-radius: 16px;
  margin-bottom: 12px;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.toggle-btn {
  flex: 1;
  border: 1px solid transparent;
  background: transparent;
  padding: 9px 6px;
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-muted);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &.active {
    background: linear-gradient(135deg, rgba(255, 59, 48, 0.18), rgba(255, 59, 48, 0.08));
    color: var(--color-primary);
    border-color: rgba(255, 90, 79, 0.16);
    box-shadow: 0 18px 30px -28px rgba(255, 59, 48, 0.95);
    transform: translateY(-1px);
  }

  &:hover:not(.active) {
    color: var(--color-text-main);
    background: rgba(255, 255, 255, 0.05);
  }
}

.modern-cedula-input {
  margin-top: 8px;
}

/* Modern Dialog Forms */
:deep(.modern-athlete-dialog) {
  border-radius: 28px !important;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 59, 48, 0.06), transparent 140px), var(--color-bg-card);
  border: 1px solid rgba(148, 163, 184, 0.16);
  box-shadow: 0 35px 70px -42px rgba(15, 23, 42, 0.8);
}

:deep(.modern-athlete-dialog .el-dialog__header) {
  padding: 24px 24px 14px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.12);
}

:deep(.modern-athlete-dialog .el-dialog__title) {
  color: var(--color-text-main);
  font-size: 1.14rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

:deep(.modern-athlete-dialog .el-dialog__body) {
  padding: 20px 24px 8px;
}

:deep(.modern-athlete-dialog .el-dialog__footer) {
  padding: 0 24px 24px;
}

:deep(.modern-athlete-dialog .el-button) {
  min-height: 44px;
  padding: 0 18px;
  border-radius: 14px;
  font-weight: 700;
}

:deep(.modern-athlete-dialog .el-button--default) {
  background: var(--color-bg-body);
  border-color: transparent;
  color: var(--color-text-main);
}

:deep(.modern-athlete-dialog .el-button--default:hover) {
  background: var(--color-bg-hover);
  border-color: rgba(148, 163, 184, 0.16);
  color: var(--color-text-main);
}

.photo-upload-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 24px;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.14), rgba(255, 122, 102, 0.05));
  border: 1px dashed rgba(96, 165, 250, 0.28);
  box-shadow: 0 24px 36px -34px rgba(255, 59, 48, 0.95);
}

.photo-upload-copy {
  flex: 1;
}

.photo-upload-badge {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.photo-upload-copy p {
  margin: 10px 0 0;
  color: var(--color-text-main);
  font-size: 0.86rem;
  line-height: 1.5;
}

.avatar-uploader {
  flex-shrink: 0;
}

.avatar-uploader-icon {
  width: 120px;
  height: 120px;
  border-radius: 18px;
  border: 1px dashed rgba(255, 90, 79, 0.38);
  background: rgba(255, 255, 255, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--color-primary);
  font-weight: 700;
  transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
}

.avatar-uploader-icon:hover {
  transform: translateY(-2px);
  background: rgba(255, 59, 48, 0.08);
  box-shadow: 0 22px 34px -30px rgba(255, 59, 48, 0.95);
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.dialog-form-intro {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(255, 59, 48, 0.14), rgba(255, 122, 102, 0.05));
  border: 1px solid rgba(96, 165, 250, 0.18);
  box-shadow: 0 20px 34px -30px rgba(255, 59, 48, 0.95);
}

.compact-intro {
  padding: 16px 18px;
}

.dialog-form-kicker {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.dialog-form-intro h3 {
  margin: 10px 0 0;
  color: var(--color-text-main);
  font-size: 1.18rem;
  font-weight: 800;
}

.dialog-form-intro p {
  margin: 0;
  max-width: 260px;
  color: var(--color-text-muted);
  font-size: 0.88rem;
  line-height: 1.5;
}

.form-section-card {
  padding: 18px 18px 6px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(255, 59, 48, 0.05), transparent 48px), var(--color-bg-card);
  border: 1px solid rgba(148, 163, 184, 0.14);
  box-shadow: 0 24px 42px -38px rgba(15, 23, 42, 0.95);
}

.form-section-heading {
  margin-bottom: 16px;
}

.form-section-kicker {
  display: inline-flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  background: rgba(255, 59, 48, 0.12);
  color: var(--color-primary);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.form-section-heading h4 {
  margin: 10px 0 6px;
  color: var(--color-text-main);
  font-size: 1rem;
  font-weight: 800;
}

.form-section-heading p {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.84rem;
  line-height: 1.5;
}

:deep(.dialog-form .el-form-item) {
  margin-bottom: 18px;
}

:deep(.dialog-form .el-form-item__label) {
  padding-bottom: 8px;
  color: var(--color-text-main);
  font-size: 0.83rem;
  font-weight: 700;
  letter-spacing: 0.01em;
}

:deep(.dialog-form .el-input__wrapper),
:deep(.dialog-form .el-select__wrapper),
:deep(.dialog-form .el-date-editor .el-input__wrapper),
:deep(.dialog-form .el-input-number .el-input__wrapper) {
  min-height: 48px;
  border-radius: 16px;
  background: transparent !important;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
  padding: 0 14px;
  transition: box-shadow 0.25s ease, background 0.25s ease, transform 0.25s ease;
}

:deep(.dialog-form .el-input__wrapper:hover),
:deep(.dialog-form .el-select__wrapper:hover),
:deep(.dialog-form .el-date-editor .el-input__wrapper:hover),
:deep(.dialog-form .el-input-number:hover .el-input__wrapper) {
  box-shadow: inset 0 0 0 1px rgba(255, 90, 79, 0.28);
}

:deep(.dialog-form .el-input__wrapper.is-focus),
:deep(.dialog-form .el-select__wrapper.is-focused),
:deep(.dialog-form .el-date-editor .el-input__wrapper.is-focus),
:deep(.dialog-form .el-input-number .el-input__wrapper.is-focus) {
  background: transparent !important;
  box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.12), inset 0 0 0 1px var(--color-primary);
}

:deep(.dialog-form .el-input__inner),
:deep(.dialog-form .el-select__selected-item),
:deep(.dialog-form .el-select__placeholder),
:deep(.dialog-form .el-textarea__inner),
:deep(.dialog-form .el-input-number .el-input__inner) {
  color: var(--color-text-main);
  font-size: 0.95rem;
  font-weight: 500;
}

:deep(.dialog-form .el-textarea__inner) {
  min-height: 104px;
  border-radius: 16px;
  background: transparent !important;
  box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.18);
  padding: 14px 16px;
  line-height: 1.55;
  resize: vertical;
  transition: box-shadow 0.25s ease, background 0.25s ease;
}

:deep(.dialog-form .el-textarea__inner:hover) {
  box-shadow: inset 0 0 0 1px rgba(255, 90, 79, 0.28);
}

:deep(.dialog-form .el-textarea__inner:focus) {
  background: transparent !important;
  box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.12), inset 0 0 0 1px var(--color-primary);
}

:deep(.dialog-form .el-input-number) {
  width: 100%;
}

:deep(.dialog-form .el-input-number__increase),
:deep(.dialog-form .el-input-number__decrease) {
  width: 34px;
  border: none;
  background: transparent;
  color: var(--color-primary);
}

:deep(.dialog-form .el-input-number__increase:hover),
:deep(.dialog-form .el-input-number__decrease:hover) {
  background: rgba(255, 59, 48, 0.08);
}

/* Athlete List */
.athlete-list {
  flex: 1;
  overflow-y: auto;
  max-height: calc(100vh - 450px);
}

.athlete-status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-left: auto;
}

.status-activo { background-color: #10b981; }
.status-lesionado { background-color: #f59e0b; }
.status-suspendido { background-color: #ef4444; }
.status-inactivo { background-color: #64748b; }

/* Detail Card */
.detail-card {
  border-radius: 16px;
  border: 1px solid var(--color-border);
  background: var(--color-bg-card);
}

.athlete-details-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--color-border);
  margin-bottom: 24px;
}

.athlete-details-photo {
  width: 100px;
  height: 100px;
  flex-shrink: 0;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.8rem;
}

.item-photo {
  overflow: hidden;
}

.avatar-img,
.avatar-img-large {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.athlete-details-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.athlete-details-info h2 {
  font-size: 1.5rem;
  margin: 0 0 8px 0;
  color: var(--color-text-main);
  word-break: break-all;
}

.athlete-details-info p {
  color: var(--color-text-muted);
  margin: 4px 0;
  font-size: 0.95rem;
}

.athlete-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 14px;
}

.athlete-meta-item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 14px;
  background: linear-gradient(180deg, var(--color-bg-card), var(--color-bg-body));
  border: 1px solid var(--color-border);
  box-shadow: 0 12px 26px rgba(2, 6, 23, 0.18);
}

.athlete-meta-icon {
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  color: var(--color-primary);
  background: linear-gradient(180deg, var(--color-bg-body), var(--color-bg-card));
  font-size: 1rem;
  box-shadow: inset 0 0 0 1px var(--color-border);
}

.athlete-meta-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.athlete-meta-label {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}

.athlete-meta-value {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text-main);
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
  border-bottom: 1px solid var(--color-border);
}

.form-item label {
  display: block;
  font-weight: 600;
  color: var(--color-text-main);
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-item p {
  color: var(--color-text-muted);
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
  background-color: var(--color-bg-card);
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid var(--color-primary);
}

.performance-item h4 {
  font-size: 0.9rem;
  color: var(--color-text-muted);
  margin: 0 0 10px 0;
  font-weight: 600;
}

.performance-item p {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--color-text-main);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-border);
}

.empty-tab {
  text-align: center;
  padding: 80px 20px;
  color: var(--color-border);
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

:deep(.el-button--primary) {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

:deep(.el-button--primary:hover),
:deep(.el-button--primary:focus) {
  background-color: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

:deep(.el-tabs__item.is-active) {
  color: var(--color-primary);
}

:deep(.el-tabs__active-bar) {
  background-color: var(--color-primary);
}

:deep(.el-tabs__item:hover) {
  color: var(--color-primary);
}

:deep(.el-tabs__content) {
  height: calc(100vh - 350px);
  overflow-y: auto;
  padding-right: 10px;
}

:deep(.el-tabs__content::-webkit-scrollbar) {
  width: 8px;
}

:deep(.el-tabs__content::-webkit-scrollbar-thumb) {
  background-color: #cbd5e1;
  border-radius: 4px;
}

/* Responsive - Tablets y Laptops peque├▒os */
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

/* Responsive - M├│viles */
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

  .athlete-meta {
    justify-content: center;
  }

  .athlete-meta-item {
    width: 100%;
    justify-content: center;
  }

  .athlete-meta-copy {
    align-items: center;
  }

  .athlete-meta-value {
    font-size: 0.9rem;
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

  .dialog-form-intro,
  .photo-upload-container {
    flex-direction: column;
    align-items: flex-start;
  }

  .dialog-form-intro p {
    max-width: none;
  }

  .form-section-card {
    padding: 16px 16px 4px;
  }

  :deep(.modern-athlete-dialog) {
    width: calc(100vw - 24px) !important;
  }

  :deep(.modern-athlete-dialog .el-dialog__header) {
    padding: 20px 18px 12px;
  }

  :deep(.modern-athlete-dialog .el-dialog__body) {
    padding: 16px 18px 8px;
  }

  :deep(.modern-athlete-dialog .el-dialog__footer) {
    padding: 0 18px 18px;
  }

  /* Tabs scrollable */
  :deep(.el-tabs__nav-wrap) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  :deep(.el-tabs__content) {
    height: auto;
    max-height: none;
  }
}

/* Responsive - M├│viles peque├▒os */
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

  .dialog-form-intro h3 {
    font-size: 1.02rem;
  }

  .photo-upload-container {
    padding: 16px;
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

.search-label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
  padding-left: 2px;
}

.search-field {
  margin-bottom: 12px;
}
</style>