// Generates the complete <script setup> block for the Vue 3 migration
const fs = require('fs')
const path = require('path')

const script = `<script setup>
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
    { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$/, message: 'Solo se permiten letras', trigger: 'blur' }
  ],
  apellido: [
    { required: true, message: 'El apellido es requerido', trigger: 'blur' },
    { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$/, message: 'Solo se permiten letras', trigger: 'blur' }
  ],
  fecha_nacimiento: [{ required: true, message: 'La fecha de nacimiento es requerida', trigger: 'change' }],
  sexo: [{ required: true, message: 'El sexo es requerido', trigger: 'change' }],
  categoria_id: [{ required: true, message: 'La categoría es requerida', trigger: 'change' }]
}
const tutorRules = {
  nombre_completo: [
    { required: true, message: 'El nombre es requerido', trigger: 'blur' },
    { pattern: /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\\s]+$/, message: 'Solo se permiten letras', trigger: 'blur' }
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
  const isAdult = !isUnderage.value
  if (!isAdult) return false
  if (tutor.value.cedula && tutor.value.cedula !== 'S/N' && tutor.value.cedula === currentAtleta.value.cedula) return true
  const tutorName = (tutor.value.nombre_completo || '').toLowerCase().trim()
  const atletaName = \\\`\\\${currentAtleta.value.nombre || ''} \\\${currentAtleta.value.apellido || ''}\\\`.toLowerCase().trim()
  return tutor.value.tipo_relacion === 'representante' && tutorName === atletaName
})
const datePickerOptions = computed(() => ({
  disabledDate(time) {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() - 3)
    return time.getTime() > maxDate.getTime()
  }
}))
`

fs.writeFileSync(path.join(__dirname, '_script_setup.tmp'), script, 'utf8')
console.log('Script setup part 1 written:', script.split('\\n').length, 'lines')
