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
