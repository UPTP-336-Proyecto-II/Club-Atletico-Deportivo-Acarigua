/**
 * Template Migration: HEAD Vue2 → Vue3 + Alejandro's visual design
 * Reads HEAD_ours.vue, applies Vue2→3 conversions, swaps visual sections with Alejandro's
 */
const fs = require('fs')
const path = require('path')

const headContent = fs.readFileSync(path.join(__dirname, 'HEAD_ours.vue'), 'utf8')
const alejandroContent = fs.readFileSync(path.join(__dirname, 'ALEJANDRO_theirs.vue'), 'utf8')

// Extract template from HEAD
const tplStart = headContent.indexOf('<template>')
const tplEnd = headContent.lastIndexOf('</template>') + '</template>'.length
let template = headContent.substring(tplStart, tplEnd)

// === VUE 2 → VUE 3 SYNTAX ===
// slot-scope
template = template.replace(/<template\s+slot-scope="scope">/g, '<template #default="scope">')
template = template.replace(/<template\s+slot-scope="\{ row \}">/g, '<template #default="{ row }">')
// :visible.sync → v-model
template = template.replace(/:visible\.sync="(\w+)"/g, 'v-model="$1"')
// value-format="yyyy-MM-dd" → value-format="YYYY-MM-DD" (Element Plus Vue3)
template = template.replace(/value-format="yyyy-MM-dd"/g, 'value-format="YYYY-MM-DD"')

// slot="footer" → template #footer (need to handle span→template)
let lines = template.split('\n')
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('slot="footer"')) {
    lines[i] = lines[i].replace(/<span\s+slot="footer">/, '<template #footer>')
  }
}
// Fix closing </span> before </el-dialog> → </template>
for (let i = lines.length - 1; i >= 0; i--) {
  if (lines[i].trim() === '</span>' && i + 1 < lines.length) {
    // Look ahead for </el-dialog>
    let j = i + 1
    while (j < lines.length && lines[j].trim() === '') j++
    if (j < lines.length && lines[j].trim() === '</el-dialog>') {
      lines[i] = lines[i].replace('</span>', '</template>')
    }
  }
}
template = lines.join('\n')

// slot="header" → template #header (for el-card)
template = template.replace(/<div\s+slot="header"\s+class="sidebar-header">/g, '<template #header>\n          <div class="sidebar-header">')
// Add closing </template> after the header div closes
lines = template.split('\n')
let foundHeader = false
let headerDepth = 0
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<template #header>')) {
    foundHeader = true; headerDepth = 0; continue
  }
  if (foundHeader) {
    headerDepth += (lines[i].match(/<div/g) || []).length - (lines[i].match(/<\/div>/g) || []).length
    if (headerDepth <= -1) {
      lines[i] = lines[i] + '\n          </template>'
      foundHeader = false
    }
  }
}
template = lines.join('\n')

// slot="reference" → template #reference
template = template.replace(/<el-button\s+slot="reference"\s+([^/]*?)\/>/g,
  '<template #reference>\n              <el-button $1/>\n            </template>')

// slot="label" spans
template = template.replace(/<span\s+slot="label">/g, '<template #label>')
lines = template.split('\n')
let inLabel = false
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('<template #label>')) { inLabel = true; continue }
  if (inLabel && lines[i].trim() === '</span>') {
    lines[i] = lines[i].replace('</span>', '</template>')
    inLabel = false
  }
}
template = lines.join('\n')

// === REPLACE HEADER with Alejandro's premium-header ===
const oldHeader = /\s*<!-- Header -->\s*\n\s*<div class="page-header">[\s\S]*?<\/div>\s*\n\s*<\/div>\s*\n\s*<\/div>/
const newHeader = `    <!-- Header -->
    <div class="premium-header">
      <div class="header-content">
        <div class="header-info">
          <h1>Gestión de Atletas
            <el-tag v-if="!canUserEdit && !isUserMedico" type="info" size="small" style="margin-left: 10px;">
              Solo Lectura
            </el-tag>
            <el-tag v-if="isUserMedico" type="warning" size="small" style="margin-left: 10px;">
              Acceso Médico
            </el-tag>
          </h1>
          <p class="subtitle">Club Atlético Deportivo Acarigua
            <span v-if="atletas.length" class="total-count" style="margin-left: 6px; opacity: 0.85;">({{ atletas.length }} atletas)</span>
          </p>
        </div>
      </div>
    </div>`
template = template.replace(oldHeader, newHeader)

// === REPLACE SIDEBAR with Alejandro's visual but user's filters ===
// Replace sidebar opening
template = template.replace(
  '<aside class="sidebar">',
  '<aside class="sidebar premium-sidebar">'
)

// Replace sidebar header content
const oldSidebarHeader = /<div class="sidebar-header">\s*\n\s*<span><i class="el-icon-user" \/> Lista de Atletas<\/span>/
const newSidebarHeader = `<div class="sidebar-header">
            <span class="sidebar-title">
              <el-icon class="sidebar-title-icon"><Collection /></el-icon>
              <span>Lista de Atletas</span>
            </span>
            <div class="sidebar-actions">
              <button v-if="canUserEdit" class="mini-add-btn" title="Agregar Atleta" @click="openAtletaModal(false)">
                <el-icon><Plus /></el-icon>
              </button>`
template = template.replace(oldSidebarHeader, newSidebarHeader)

// Replace filter popover opening and filter button
template = template.replace(
  '<el-popover\n              placement="bottom-end"\n              width="250"\n              trigger="click"\n            >',
  '<el-popover placement="bottom-end" width="280" trigger="click" popper-class="athletes-filter-popper">'
)
template = template.replace(
  '<h4>Filtros Avanzados</h4>',
  '<div class="filter-popover-header">\n                    <span class="filter-popover-kicker">Panel rápido</span>\n                    <h4>Filtros avanzados</h4>\n                    <p>Refina la lista por orden, categoría o estatus.</p>\n                  </div>'
)

// Replace filter button reference
template = template.replace(
  /<template #reference>\s*\n\s*<el-button\s+type="text"\s+icon="el-icon-s-operation"\s+class="filter-btn"\s*\/>\s*\n\s*<\/template>/,
  `<template #reference>
                <button class="filter-toggle-btn" title="Abrir filtros avanzados">
                  <el-icon><Setting /></el-icon>
                </button>
              </template>`
)

// Close sidebar-actions div after popover
template = template.replace(
  '</el-popover>\n          </div>',
  '</el-popover>\n            </div>\n          </div>'
)

// Replace search container with Alejandro's premium search
template = template.replace(
  `          <div class="search-container">
            <el-input
              v-model="searchQuery"
              placeholder="Buscar por nombre..."
              prefix-icon="el-icon-search"
              size="small"
              clearable
            />
          </div>`,
  `          <div class="search-container">
            <div class="search-intro">
              <span class="search-intro-badge">Búsqueda rápida</span>
              <p>Encuentra atletas por nombre o filtra por cédula en segundos.</p>
            </div>
            <div class="search-field">
              <label class="premium-search-label">Buscar Atleta</label>
              <el-input v-model="searchQuery" placeholder="Busca por nombre o apellido" clearable class="modern-search-input modern-sidebar-control" />
            </div>
            <div class="cedula-filter">
              <label class="premium-search-label">Filtro de Cédula</label>
              <div class="modern-toggle-group">
                <button class="toggle-btn" :class="{ active: filterCedula === 'todos' }" @click="filterCedula = 'todos'">Todos</button>
                <button class="toggle-btn" :class="{ active: filterCedula === 'con_cedula' }" @click="filterCedula = 'con_cedula'">Con Cédula</button>
                <button class="toggle-btn" :class="{ active: filterCedula === 'sin_cedula' }" @click="filterCedula = 'sin_cedula'">Sin Cédula</button>
              </div>
              <el-input v-if="filterCedula === 'con_cedula'" v-model="searchCedula" placeholder="Escribe la cédula sin puntos" clearable maxlength="9" class="modern-cedula-input modern-sidebar-control" @input="v => searchCedula = v.replace(/\\D/g, '')" />
              <p v-if="filterCedula === 'con_cedula'" class="field-caption">Usa solo números para encontrar coincidencias exactas.</p>
            </div>
          </div>`
)

// Remove old cédula filter from popover (it's now in the search area)
template = template.replace(
  /\s*<div class="filter-item">\s*\n\s*<label>Buscar por C[ée]dula<\/label>[\s\S]*?<\/el-select>\s*\n\s*<\/div>\s*\n\s*<div v-if="filterCedula === 'con_cedula'" class="filter-item">[\s\S]*?<\/el-input>\s*\n\s*<\/div>/,
  ''
)

// Replace athlete list items with Alejandro's visual
template = template.replace(
  /(<div\s+v-for="atleta in atletas"[\s\S]*?class=")athlete-item("[\s\S]*?@click="selectAtleta\(atleta\.atleta_id\)"\s*>)/,
  '$1premium-list-item$2'
)
// Replace photo div content
template = template.replace(
  '<i v-else class="el-icon-user" />\n              </div>\n              <div class="athlete-info-compact">',
  `<span v-else class="avatar-initials">{{ (atleta.nombre || '?').charAt(0) }}{{ (atleta.apellido || '').charAt(0) }}</span>
              </div>
              <div class="item-info">`
)
template = template.replace(
  /\s*<div class="athlete-header-compact">\s*\n\s*<h3 class="athlete-name-compact">{{ atleta\.nombre }} {{ atleta\.apellido }}<\/h3>\s*\n\s*<\/div>\s*\n\s*<div class="athlete-meta-compact">\s*\n\s*<span class="athlete-cat-compact"[^>]*>{{ atleta\.categoria_nombre[^}]*}}<\/span>\s*\n\s*<el-tag[^>]*>{{ atleta\.estatus }}<\/el-tag>\s*\n\s*<\/div>\s*\n\s*<\/div>/,
  `<h3>{{ atleta.nombre }} {{ atleta.apellido }}</h3>
                <p>{{ formatEnum(atleta.posicion_de_juego_nombre) || 'Sin posición' }}</p>
                <p class="athlete-category">{{ atleta.categoria_nombre || 'Sin categoría' }}</p>
              </div>
              <span class="athlete-status-dot" :class="'status-' + (atleta.estatus || '').toLowerCase()" :title="atleta.estatus" />`
)

// Replace empty list
template = template.replace(
  /<div v-if="atletas\.length === 0" class="empty-state">\s*\n\s*<p>No hay atletas registrados<\/p>\s*\n\s*<\/div>/,
  `<div v-if="atletas.length === 0" class="empty-list">
              <span class="empty-list-icon"><el-icon><Collection /></el-icon></span>
              <p class="empty-list-title">Sin atletas</p>
              <p class="empty-list-hint">Agrega tu primer atleta con el botón de arriba</p>
            </div>`
)

// Replace no-atleta-selected empty state
template = template.replace(
  /<el-card v-if="!currentAtletaId" shadow="hover">\s*\n\s*<div class="empty-state">\s*\n\s*<i class="el-icon-user-solid"[^/]*\/>\s*\n\s*<h3>No hay atleta seleccionado<\/h3>\s*\n\s*<p>Selecciona un atleta de la lista o agrega uno nuevo\.<\/p>\s*\n\s*<\/div>\s*\n\s*<\/el-card>/,
  `<div v-if="!currentAtletaId" class="empty-main">
          <div class="empty-main-content">
            <span class="empty-main-icon"><el-icon><UserFilled /></el-icon></span>
            <h3>No hay atleta seleccionado</h3>
            <p>Selecciona un atleta de la lista o agrega uno nuevo.</p>
          </div>
        </div>`
)

// Replace detail card opening
template = template.replace(
  '<el-card v-else shadow="hover">',
  '<el-card v-else v-loading="loading" shadow="hover" class="detail-card">'
)

// Replace detail photo (icon → initials)
template = template.replace(
  '<i v-else class="el-icon-user" />\n            </div>\n            <div class="athlete-details-info">',
  `<span v-else class="avatar-initials-large">{{ (currentAtleta.nombre || '?').charAt(0) }}{{ (currentAtleta.apellido || '').charAt(0) }}</span>
            </div>
            <div class="athlete-details-info">`
)

// Replace detail info section with Alejandro's meta + action buttons
template = template.replace(
  /(<div class="athlete-details-info">\s*\n\s*<h2>{{ currentAtleta\.nombre }} {{ currentAtleta\.apellido }}<\/h2>)\s*\n\s*<div style="display: flex;[^"]*">\s*\n\s*<p style="margin: 0;">Categor[ií]a:.*?<\/p>\s*\n\s*<p style="margin: 0;">Edad:.*?<\/p>\s*\n\s*<el-tag[^>]*>{{ currentAtleta\.estatus }}<\/el-tag>\s*\n\s*<\/div>\s*\n\s*<div class="athlete-actions-header"[^>]*>\s*\n\s*<el-button[^>]*@click="goToProgress"[^>]*>\s*\n\s*An[aá]lisis de Rendimiento\s*\n\s*<\/el-button>\s*\n\s*<\/div>\s*\n\s*<\/div>/,
  `$1
              <div class="athlete-meta">
                <div class="athlete-meta-item">
                  <span class="athlete-meta-icon"><el-icon><CollectionTag /></el-icon></span>
                  <span class="athlete-meta-copy">
                    <span class="athlete-meta-label">Categoría</span>
                    <span class="athlete-meta-value">{{ currentAtleta.categoria_nombre || 'No asignada' }}</span>
                  </span>
                </div>
                <div class="athlete-meta-item">
                  <span class="athlete-meta-icon"><el-icon><Calendar /></el-icon></span>
                  <span class="athlete-meta-copy">
                    <span class="athlete-meta-label">Edad</span>
                    <span class="athlete-meta-value">{{ calculateAge(currentAtleta.fecha_nacimiento) }} años</span>
                  </span>
                </div>
              </div>
              <el-tag :type="getStatusType(currentAtleta.estatus)" size="small">{{ currentAtleta.estatus }}</el-tag>
            </div>
            <div class="athlete-actions">
              <button v-if="!isUserMedico" class="action-btn action-btn-info" @click="goToProgress" title="Análisis">
                <el-icon class="action-btn-icon"><DataAnalysis /></el-icon>
                <span>Análisis</span>
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
            </div>`
)

// Remove delete/edit buttons from inside personal tab (now in header actions)
template = template.replace(
  /<div class="tab-header-actions">\s*\n\s*<el-button v-if="canUserEdit" type="primary"[^>]*@click="openEditPersonalModal"[^>]*>Editar Datos Personales<\/el-button>\s*\n\s*<el-button v-if="canUserEdit && !isUserMedico" type="danger"[^>]*@click="deleteAtleta"[^>]*>Eliminar Atleta<\/el-button>\s*\n\s*<\/div>/,
  ''
)

// Add Alejandro's modal class to all dialogs
template = template.replace(/<el-dialog\s/g, (match, offset) => {
  // Check if class="modern-athlete-dialog" already exists nearby
  const context = template.substring(offset, offset + 200)
  if (context.includes('modern-athlete-dialog')) return match
  return match
})

// Add modern-athlete-dialog class to dialogs that don't have it
template = template.replace(
  /(<el-dialog[^>]*?)(\s*>)/g,
  (match, before, after) => {
    if (before.includes('class=')) return match
    return before + '\n      class="modern-athlete-dialog"' + after
  }
)

// Replace form refs: ref="atletaForm" → ref="atletaFormRef" etc.
template = template.replace(/ref="atletaForm"/g, 'ref="atletaFormRef"')
template = template.replace(/ref="editPersonalForm"/g, 'ref="editPersonalFormRef"')
template = template.replace(/ref="editSportsForm"/g, 'ref="editSportsFormRef"')
template = template.replace(/ref="medicalForm"/g, 'ref="medicalFormRef"')
template = template.replace(/ref="anthropometricForm"/g, 'ref="anthropometricFormRef"')
template = template.replace(/ref="performanceForm"/g, 'ref="performanceFormRef"')
template = template.replace(/ref="tutorForm"/g, 'ref="tutorFormRef"')
template = template.replace(/ref="atencionForm"/g, 'ref="atencionFormRef"')
template = template.replace(/ref="carnetForm"/g, 'ref="carnetFormRef"')

// Add Element Plus icon imports needed
// (They'll be auto-imported by Element Plus unplugin, but we reference them in template)

// Write output
fs.writeFileSync(path.join(__dirname, '_template.tmp'), template, 'utf8')
console.log('Template lines:', template.split('\n').length)

// Extract and write Alejandro's CSS
const styleStart = alejandroContent.indexOf('<style scoped>')
const styleEnd = alejandroContent.lastIndexOf('</style>') + '</style>'.length
const style = alejandroContent.substring(styleStart, styleEnd)
fs.writeFileSync(path.join(__dirname, '_style.tmp'), style, 'utf8')
console.log('Style lines:', style.split('\n').length)

// Verify
const remaining_vue2 = (template.match(/slot-scope|:visible\.sync|slot="footer"|slot="header"|slot="reference"|slot="label"/g) || [])
console.log('Remaining Vue2 patterns:', remaining_vue2.length, remaining_vue2)
const features = ['el-steps', 'atletaStep', 'showEditPersonalModal', 'showEditSportsModal',
  'showAtencionModal', 'showCarnetModal', 'isUnderage', 'nextAtletaStep', 'filterCedula',
  'handleEstadoChangeAtleta', 'medicosList', 'tiposDiscapacidadList', 'isSelfRepresented',
  'premium-header', 'premium-list-item', 'action-btn', 'avatar-initials', 'status-dot', 'modern-athlete-dialog']
features.forEach(f => {
  const c = (template.match(new RegExp(f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
  console.log(`  "${f}": ${c}`)
})
