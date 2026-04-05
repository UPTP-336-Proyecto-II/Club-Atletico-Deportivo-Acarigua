/**
 * FINAL APPROACH: Build index.vue by combining exact line ranges from both files.
 * No regex replacements - just line-based splicing.
 * 
 * Strategy:
 * - Alejandro's template lines 1-201 (header, sidebar, detail header with action buttons)
 * - User's tabs (personal, sports, anthropometric TABLE, performance TABLE, representante, medical, atencion medica, carnet, historial)
 * - User's modals (stepper, edit personal, edit sports, medical, anthropometric, performance, tutor, atencion, carnet)
 * - Script setup from _script_setup.vue
 * - Alejandro's CSS
 */
const fs = require('fs')
const path = require('path')

function readLines(filePath) {
  return fs.readFileSync(filePath, 'utf8').split(/\r?\n/)
}

const headLines = readLines(path.join(__dirname, 'dev_scripts', 'HEAD_ours.vue'))
const alejLines = readLines(path.join(__dirname, 'dev_scripts', 'ALEJANDRO_theirs.vue'))
const scriptSetup = fs.readFileSync(path.join(__dirname, 'dev_scripts', '_script_setup.vue'), 'utf8')

// Helper: get lines from array (1-indexed, inclusive)
function getLines(lines, start, end) {
  return lines.slice(start - 1, end)
}

// === BUILD TEMPLATE ===
const templateParts = []

// Part 1: Alejandro's header + sidebar + detail header + action buttons (lines 1-204)
// This includes: premium-header, premium-sidebar, search, filters, athlete list, 
// empty-main, detail-card header with meta + action buttons
templateParts.push(...getLines(alejLines, 1, 204))

// Part 2: User's tabs (from HEAD file)
// We need: personal tab, sports tab, anthropometric tab (with TABLE), 
// performance tab (with TABLE), representante tab, medical tab, 
// atencion medica tab, historial partidos tab
// In HEAD, tabs start at line ~175 after detail header, but we need to find exact lines
// Let's find them:
let headTabsStart = -1, headTabsEnd = -1
for (let i = 0; i < headLines.length; i++) {
  if (headLines[i].includes('<!-- Tabs -->') || (headLines[i].includes('el-tabs') && headLines[i].includes('activeTab'))) {
    if (headTabsStart === -1) headTabsStart = i + 1 // 1-indexed
  }
  // Tabs end at </el-tabs> followed by </el-card> </main> </div>
  if (headLines[i].trim() === '</el-tabs>') headTabsEnd = i + 1
}
console.log(`HEAD tabs: lines ${headTabsStart}-${headTabsEnd}`)

// Part 2: Insert user's complete tabs section
templateParts.push('')
templateParts.push('          <!-- Tabs -->')
templateParts.push(...getLines(headLines, headTabsStart, headTabsEnd))

// Part 3: Close the detail card, main, and main-content div
templateParts.push('        </el-card>')
templateParts.push('      </main>')
templateParts.push('    </div>')
templateParts.push('')

// Part 4: User's modals (stepper + all edit modals)
// Find where modals start in HEAD
let headModalsStart = -1, headModalsEnd = -1
for (let i = 0; i < headLines.length; i++) {
  if (headLines[i].includes('<!-- Modal Atleta -->') && headModalsStart === -1) {
    headModalsStart = i + 1
  }
}
// Find the last </el-dialog> in the template section (before <script>)
for (let i = 0; i < headLines.length; i++) {
  if (headLines[i].trim() === '</el-dialog>') headModalsEnd = i + 1
  if (headLines[i].trim() === '<script>' || headLines[i].trim() === '<script setup>') break
}
console.log(`HEAD modals: lines ${headModalsStart}-${headModalsEnd}`)

// Get modal lines and apply Vue 2->3 fixes
let modalLines = getLines(headLines, headModalsStart, headModalsEnd)
let modalText = modalLines.join('\n')

// Vue 2->3 fixes for modals
modalText = modalText.replace(/:visible\.sync="(\w+)"/g, 'v-model="$1"')
modalText = modalText.replace(/value-format="yyyy-MM-dd"/g, 'value-format="YYYY-MM-DD"')

// Fix slot="footer" -> template #footer
modalText = modalText.replace(/<span\s+slot="footer">/g, '<template #footer>')
// Fix closing </span> before </el-dialog> -> </template>
const modalLineArr = modalText.split('\n')
for (let i = modalLineArr.length - 1; i >= 0; i--) {
  if (modalLineArr[i].trim() === '</span>') {
    let j = i + 1
    while (j < modalLineArr.length && modalLineArr[j].trim() === '') j++
    if (j < modalLineArr.length && modalLineArr[j].trim() === '</el-dialog>') {
      modalLineArr[i] = modalLineArr[i].replace('</span>', '</template>')
    }
  }
}
// Fix slot-scope
for (let i = 0; i < modalLineArr.length; i++) {
  modalLineArr[i] = modalLineArr[i].replace(/slot-scope="scope"/g, '#default="scope"')
  modalLineArr[i] = modalLineArr[i].replace(/slot-scope="\{ row \}"/g, '#default="{ row }"')
}
// Fix slot="label"
let inLabelSlot = false
for (let i = 0; i < modalLineArr.length; i++) {
  if (modalLineArr[i].includes('slot="label"')) {
    modalLineArr[i] = modalLineArr[i].replace(/<span\s+slot="label">/, '<template #label>')
    inLabelSlot = true
    continue
  }
  if (inLabelSlot && modalLineArr[i].trim() === '</span>') {
    modalLineArr[i] = modalLineArr[i].replace('</span>', '</template>')
    inLabelSlot = false
  }
}

// Fix form refs: ref="atletaForm" -> ref="atletaFormRef"
const refMap = {
  'ref="atletaForm"': 'ref="atletaFormRef"',
  'ref="editPersonalForm"': 'ref="editPersonalFormRef"',
  'ref="editSportsForm"': 'ref="editSportsFormRef"',
  'ref="medicalForm"': 'ref="medicalFormRef"',
  'ref="anthropometricForm"': 'ref="anthropometricFormRef"',
  'ref="performanceForm"': 'ref="performanceFormRef"',
  'ref="tutorForm"': 'ref="tutorFormRef"',
  'ref="atencionForm"': 'ref="atencionFormRef"',
  'ref="carnetForm"': 'ref="carnetFormRef"',
}
for (let i = 0; i < modalLineArr.length; i++) {
  for (const [old, nw] of Object.entries(refMap)) {
    modalLineArr[i] = modalLineArr[i].replace(old, nw)
  }
}

// Add modern-athlete-dialog class to dialogs
for (let i = 0; i < modalLineArr.length; i++) {
  if (modalLineArr[i].includes('<el-dialog') && !modalLineArr[i].includes('class=')) {
    // Find the closing > of the el-dialog tag
    let j = i
    while (j < modalLineArr.length && !modalLineArr[j].includes('>')) j++
    // Insert class before the closing >
    modalLineArr[j] = modalLineArr[j].replace('>', '\n      class="modern-athlete-dialog"\n    >')
  }
}

templateParts.push(...modalLineArr)

// Close container div and template
templateParts.push('  </div>')
templateParts.push('</template>')

// Also fix Vue 2->3 in tabs section
let templateText = templateParts.join('\n')
templateText = templateText.replace(/slot-scope="scope"/g, '#default="scope"')
templateText = templateText.replace(/slot-scope="\{ row \}"/g, '#default="{ row }"')
templateText = templateText.replace(/:visible\.sync="(\w+)"/g, 'v-model="$1"')
templateText = templateText.replace(/value-format="yyyy-MM-dd"/g, 'value-format="YYYY-MM-DD"')

// === BUILD STYLE ===
const alejStyleStart = alejLines.findIndex(l => l.trim() === '<style scoped>') + 1
const alejStyleEnd = alejLines.length // last line is </style>
const styleText = getLines(alejLines, alejStyleStart, alejStyleEnd).join('\n')

// === ASSEMBLE FINAL FILE ===
const finalContent = templateText + '\n\n' + scriptSetup + '\n\n' + styleText + '\n'

const outputPath = path.join(__dirname, 'src', 'views', 'atletas', 'index.vue')
fs.writeFileSync(outputPath, finalContent, 'utf8')

// === VERIFY ===
const totalLines = finalContent.split('\n').length
console.log(`\nFinal file: ${totalLines} lines`)

const mustHave = {
  'script setup': 1, 'el-steps': [2, 99], 'atletaStep': [8, 99], 'showEditPersonalModal': [4, 99],
  'showEditSportsModal': [4, 99], 'showAtencionModal': [4, 99], 'showCarnetModal': [4, 99],
  'isUnderage': [8, 99], 'isSelfRepresented': [4, 99], 'premium-header': [1, 99],
  'premium-list-item': [1, 99], 'action-btn': [5, 99], 'avatar-initials': [2, 99],
  'athlete-status-dot': [2, 99], 'modern-athlete-dialog': [5, 99], 'filterCedula': [4, 99],
  'handleEstadoChangeAtleta': [2, 99], 'medicosList': [2, 99], 'grupo_sanguineo': [4, 99],
  'nextAtletaStep': [1, 99],
}
const mustNotHave = ['slot-scope', ':visible.sync', 'this\\.', 'export default {']

console.log('\n=== MUST HAVE ===')
let allGood = true
for (const [pattern, expected] of Object.entries(mustHave)) {
  const count = (finalContent.match(new RegExp(pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length
  const [min, max] = Array.isArray(expected) ? expected : [expected, expected]
  const ok = count >= min && count <= max
  console.log(`  ${ok ? '✅' : '❌'} "${pattern}": ${count} (expected ${min}-${max})`)
  if (!ok) allGood = false
}
console.log('\n=== MUST NOT HAVE ===')
for (const pattern of mustNotHave) {
  const count = (finalContent.match(new RegExp(pattern, 'g')) || []).length
  const ok = count === 0
  console.log(`  ${ok ? '✅' : '❌'} "${pattern}": ${count}`)
  if (!ok) allGood = false
}

console.log(`\n${allGood ? '✅ ALL CHECKS PASSED!' : '❌ SOME CHECKS FAILED!'}\n`)
