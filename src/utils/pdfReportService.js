import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { LOGO_BASE64 } from './logoBase64'

// Register fonts
// Fix for different build environments (Webpack vs others)
if (pdfFonts && pdfFonts.pdfMake && pdfFonts.pdfMake.vfs) {
  pdfMake.vfs = pdfFonts.pdfMake.vfs
} else if (pdfFonts && pdfFonts.vfs) {
  pdfMake.vfs = pdfFonts.vfs
} else {
  pdfMake.vfs = pdfFonts
}

const COMPANY_NAME = 'Club Atlético Deportivo Acarigua'

export const PdfReportService = {
  /**
         * Base configuration for all reports
         */
  _getBaseDocDefinition(content, title, subtitle) {
    return {
      pageSize: 'LETTER',
      pageMargins: [40, 60, 40, 60], // [left, top, right, bottom]

      header: (currentPage, pageCount) => {
        return {
          columns: [
            // Logo (placeholder or text if image fails)
            {
              image: LOGO_BASE64,
              width: 50
            },
            // Title and Date
            {
              stack: [
                { text: COMPANY_NAME, style: 'headerCompany' },
                { text: `${new Date().toLocaleDateString('es-VE')} - ${new Date().toLocaleTimeString('es-VE')}`, alignment: 'right', style: 'headerDate' }
              ],
              width: '*'
            }
          ],
          margin: [40, 20, 40, 0]
        }
      },

      footer: (currentPage, pageCount) => {
        return {
          columns: [
            { text: 'Generado por Sistema de Gestión CADA', style: 'footerText', alignment: 'left' },
            { text: `Página ${currentPage} de ${pageCount}`, alignment: 'right', style: 'footerText' }
          ],
          margin: [40, 20, 40, 0]
        }
      },

      content: [
        // Main Title of the Report
        { text: title, style: 'reportTitle' },
        subtitle ? { text: subtitle, style: 'reportSubtitle' } : null,
        { text: ' ', fontSize: 10 }, // Spacer

        // Actual Content
        ...content
      ],

      styles: {
        headerLogo: {
          fontSize: 18,
          bold: true,
          color: '#1e293b'
        },
        headerCompany: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          color: '#555'
        },
        headerDate: {
          fontSize: 8,
          color: '#888',
          margin: [0, 5, 0, 0]
        },
        footerText: {
          fontSize: 8,
          color: '#aaa'
        },
        reportTitle: {
          fontSize: 22,
          bold: true,
          color: '#1e293b',
          alignment: 'center',
          margin: [0, 0, 0, 5]
        },
        reportSubtitle: {
          fontSize: 14,
          color: '#1e293b',
          alignment: 'center',
          margin: [0, 0, 0, 20]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'white',
          fillColor: '#1e293b',
          alignment: 'center'
        },
        tableCell: {
          fontSize: 9,
          color: '#333'
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          color: '#1e293b',
          margin: [0, 15, 0, 10],
          decoration: 'underline',
          decorationColor: '#1e293b'
        },
        label: {
          bold: true,
          fontSize: 10
        },
        value: {
          fontSize: 10
        }
      }
    }
  },

  /**
         * Generates and opens a PDF for Athlete Performance
         * @param {Object} employeeData - Basic data
         * @param {Object} chartsImages - { performance: 'base64...', radar: 'base64...', anthropometric: 'base64...' }
         * @param {Array} statsData - Computed statistics
         */
  generatePerformanceReport(atleta, chartsImages, statsData, photoBase64) {
    const content = []

    // 1. Athlete Summary Section
    content.push({
      columns: [
        // Avatar
        photoBase64
          ? { image: photoBase64, width: 80, fit: [80, 80], alignment: 'center', margin: [0, 5, 0, 0] }
          : { width: 80, text: 'Sin Foto', alignment: 'center', margin: [0, 20, 0, 0], fontSize: 8 },
        {
          width: '*',
          stack: [
            { text: 'Datos Personales', style: 'sectionHeader' },
            {
              columns: [
                { width: 'auto', text: 'Cédula: ', style: 'label' },
                { width: '*', text: atleta.cedula || `ID: ${atleta.atleta_id}`, style: 'value' },
                { width: 'auto', text: 'Categoría: ', style: 'label' },
                { width: '*', text: atleta.categoria_nombre || 'N/A', style: 'value' }
              ],
              columnGap: 10,
              margin: [0, 0, 0, 5]
            },
            {
              columns: [
                { width: 'auto', text: 'Posición: ', style: 'label' },
                { width: '*', text: atleta.posicion_de_juego_nombre || 'N/A', style: 'value' },
                { width: 'auto', text: 'Pierna: ', style: 'label' },
                { width: '*', text: atleta.pierna_dominante || 'Derecha', style: 'value' }
              ],
              columnGap: 10,
              margin: [0, 0, 0, 5]
            },
            {
              columns: [
                { width: 'auto', text: 'Sexo: ', style: 'label' },
                { width: '*', text: (atleta.sexo === 'M' ? 'Masculino' : (atleta.sexo === 'F' ? 'Femenino' : atleta.sexo)) || 'N/A', style: 'value' },
                { width: 'auto', text: 'Edad: ', style: 'label' },
                { width: '*', text: (() => {
                  if (!atleta.fecha_nacimiento) return '-'
                  const today = new Date()
                  const birthDate = new Date(atleta.fecha_nacimiento)
                  let age = today.getFullYear() - birthDate.getFullYear()
                  const m = today.getMonth() - birthDate.getMonth()
                  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--
                  return age + ' años'
                })(), style: 'value' }
              ],
              columnGap: 10,
              margin: [0, 0, 0, 5]
            },
            {
              columns: [
                { width: 'auto', text: 'Teléfono: ', style: 'label' },
                { width: '*', text: atleta.telefono || 'N/A', style: 'value' },
                { width: 'auto', text: 'Entrenador: ', style: 'label' },
                { width: '*', text: atleta.entrenador_nombre || 'N/A', style: 'value' }
              ],
              columnGap: 10
            }
          ]
        }
      ],
      columnGap: 20,
      margin: [0, 0, 0, 20]
    })

    // 2. Stats / Trends Table
    if (statsData && statsData.length > 0) {
      const tableBody = [
        statsData.map(s => ({ text: s.label, style: 'tableHeader', fontSize: 9 }))
      ]
      const valuesRow = statsData.map(s => ({
        text: `${s.value} ${s.unit}\n(${s.diff > 0 ? '+' : ''}${s.diff}%)`,
        style: 'tableCell',
        alignment: 'center',
        color: s.status === 'up' ? 'green' : 'red'
      }))
      tableBody.push(valuesRow)

      content.push({
        table: {
          headerRows: 1,
          widths: Array(statsData.length).fill('*'),
          body: tableBody
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 20]
      })

      // Re-implement simplified widths since we don't have Matrix helper active here
      content[content.length - 1].table.widths = Array(statsData.length).fill('*')
    }

    // 3. Charts Section
    if (chartsImages.performance) {
      content.push({ text: 'Evolución de Rendimiento', style: 'sectionHeader' })
      content.push({ image: chartsImages.performance, width: 500, alignment: 'center', margin: [0, 0, 0, 15] })
    }

    if (chartsImages.radar) {
      content.push({ text: 'Perfil Competitivo', style: 'sectionHeader', pageBreak: 'before' })
      content.push({ image: chartsImages.radar, width: 400, alignment: 'center', margin: [0, 0, 0, 15] })
    }

    if (chartsImages.anthropometric) {
      content.push({ text: 'Histórico de Medidas Corporales', style: 'sectionHeader', pageBreak: 'before' })
      content.push({ image: chartsImages.anthropometric, width: 520, alignment: 'center' })
    }

    const docDef = this._getBaseDocDefinition(content, 'Reporte de Rendimiento', `${atleta.nombre} ${atleta.apellido}`)
    pdfMake.createPdf(docDef).open()
  },

  /**
         * Generates Athlete List Report
         */
  generateAthleteListReport(athletes) {
    const tableBody = [
      // Header Row
      [
        { text: 'Cédula/ID', style: 'tableHeader' },
        { text: 'Nombre y Apellido', style: 'tableHeader' },
        { text: 'Teléfono', style: 'tableHeader' },
        { text: 'Categoría', style: 'tableHeader' },
        { text: 'Posición', style: 'tableHeader' },
        { text: 'Estatus', style: 'tableHeader' }
      ]
    ]

    // Data Rows
    athletes.forEach(a => {
      tableBody.push([
        { text: a.cedula || `ID: ${a.atleta_id}`, style: 'tableCell' },
        { text: `${a.nombre} ${a.apellido}`, style: 'tableCell' },
        { text: a.telefono || '-', style: 'tableCell' },
        { text: a.categoria_nombre || '', style: 'tableCell' },
        { text: a.posicion_de_juego_nombre || '', style: 'tableCell' },
        { text: a.estatus || 'Activo', style: 'tableCell' }
      ])
    })

    const content = [
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
          body: tableBody
        },
        layout: 'lightHorizontalLines'
      }
    ]

    const docDef = this._getBaseDocDefinition(content, 'Lista de Atletas', 'Club Atlético Deportivo Acarigua')
    pdfMake.createPdf(docDef).open()
  },

  /**
   * Generates Individual Athlete Card Report
   */
  generateAthleteCardReport(atleta, medical, metrics, tests, tutor, photoBase64) {
    const content = []

    // Helper to calculate age
    const calculateAge = (dateString) => {
      if (!dateString) return '-'
      const today = new Date()
      const birthDate = new Date(dateString)
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      return age + ' años'
    }

    // 1. Header Info (Personal)
    content.push({
      columns: [
        // Avatar Placeholder
        photoBase64
          ? { image: photoBase64, width: 80, fit: [80, 80], alignment: 'center', margin: [0, 5, 0, 0] }
          : { width: 80, text: 'Sin Foto', alignment: 'center', margin: [0, 20, 0, 0], fontSize: 8 },
        {
          width: '*',
          stack: [
            { text: 'Datos Personales', style: 'sectionHeader' },
            {
              columns: [
                { width: 'auto', text: 'Cédula: ', style: 'label' },
                { width: '*', text: atleta.cedula || `ID: ${atleta.atleta_id}`, style: 'value' },
                { width: 'auto', text: 'Edad: ', style: 'label' },
                { width: '*', text: calculateAge(atleta.fecha_nacimiento), style: 'value' }
              ],
              columnGap: 10,
              margin: [0, 0, 0, 5]
            },
            {
              columns: [
                { width: 'auto', text: 'Télefono: ', style: 'label' },
                { width: '*', text: atleta.telefono || 'N/A', style: 'value' }
              ],
              margin: [0, 0, 0, 5]
            },
            {
              text: [
                { text: 'Dirección: ', style: 'label' },
                { text: [atleta.estado, atleta.municipio, atleta.parroquia].filter(Boolean).join(', ') || 'No registrada', style: 'value' }
              ],
              margin: [0, 0, 0, 2]
            },
            {
              text: [
                { text: 'Localidad: ', style: 'label' },
                { text: atleta.localidad || 'N/A', style: 'value' },
                { text: '   Tipo V.: ', style: 'label' },
                { text: atleta.tipo_vivienda || 'N/A', style: 'value' },
                { text: '   Ubicación: ', style: 'label' },
                { text: atleta.ubicacion_vivienda || 'N/A', style: 'value' }
              ],
              margin: [0, 0, 0, 5]
            }
          ]
        }
      ],
      columnGap: 20
    })

    // 2. Medical Info
    content.push({ text: 'Información Médica', style: 'sectionHeader' })
    if (medical) {
      content.push({
        table: {
          widths: ['50%', '50%'],
          body: [
            [
              { stack: [{ text: 'Grupo Sanguíneo', style: 'label' }, { text: medical.grupo_sanguineo || 'N/A', style: 'value' }], margin: [0, 2, 0, 2] },
              { stack: [{ text: 'Alergias', style: 'label' }, { text: medical.alergias || 'Ninguna', style: 'value' }], margin: [0, 2, 0, 2] }
            ],
            [
              { stack: [{ text: 'Antecedentes Familiares', style: 'label' }, { text: medical.antecedentes_familiares || 'Ninguno', style: 'value' }], margin: [0, 2, 0, 2] },
              { stack: [{ text: 'Antecedentes Quirúrgicos / Lesiones', style: 'label' }, { text: medical.antecedentes_quirurgicos || 'Ninguno', style: 'value' }], margin: [0, 2, 0, 2] }
            ],
            [
              { stack: [{ text: 'Condiciones Crónicas', style: 'label' }, { text: medical.condicion_cronica || 'Ninguna', style: 'value' }], margin: [0, 2, 0, 2] },
              { stack: [{ text: 'Medicación Actual', style: 'label' }, { text: medical.medicacion_actual || 'Ninguna', style: 'value' }], margin: [0, 2, 0, 2] }
            ]
          ]
        },
        layout: 'noBorders'
      })
    } else {
      content.push({ text: 'No hay información médica registrada.', style: 'value', italics: true })
    }

    // 3. Metrics & Tests in 2 columns
    content.push({
      columns: [
        {
          width: '50%',
          stack: [
            { text: 'Antropometría', style: 'sectionHeader' },
            metrics ? {
              table: {
                widths: ['50%', '50%'],
                body: [
                  [
                    { stack: [{ text: 'Peso', style: 'label' }, { text: `${metrics.peso} kg`, style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] },
                    { stack: [{ text: 'Altura', style: 'label' }, { text: `${metrics.altura} cm`, style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] }
                  ],
                  [
                    { stack: [{ text: 'IMC', style: 'label' }, { text: metrics.indice_de_masa ? Number(metrics.indice_de_masa).toFixed(2) : '-', style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] },
                    { stack: [{ text: 'Envergadura', style: 'label' }, { text: `${metrics.envergadura} cm`, style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] }
                  ],
                  [
                    { stack: [{ text: 'P. Pierna', style: 'label' }, { text: `${metrics.largo_de_pierna} cm`, style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] },
                    { stack: [{ text: 'P. Torso', style: 'label' }, { text: `${metrics.largo_de_torso} cm`, style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] }
                  ]
                ]
              },
              layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#e2e8f0',
                vLineColor: () => '#e2e8f0'
              }
            } : { text: 'Sin registros.', style: 'value', italics: true }
          ]
        },
        {
          width: '50%',
          stack: [
            { text: 'Último Rendimiento', style: 'sectionHeader' },
            tests ? {
              table: {
                widths: ['50%', '50%'],
                body: [
                  [
                    { stack: [{ text: 'Fuerza', style: 'label' }, { text: tests.test_de_fuerza || '-', style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] },
                    { stack: [{ text: 'Resistencia', style: 'label' }, { text: tests.test_resistencia || '-', style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] }
                  ],
                  [
                    { stack: [{ text: 'Velocidad', style: 'label' }, { text: tests.test_velocidad || '-', style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] },
                    { stack: [{ text: 'Coordinación', style: 'label' }, { text: tests.test_coordinacion || '-', style: 'value' }], fillColor: '#f8fafc', margin: [5, 5] }
                  ],
                  [
                    { stack: [{ text: 'Reacción', style: 'label' }, { text: tests.test_de_reaccion || '-', style: 'value' }], fillColor: '#f8fafc', margin: [5, 5], colSpan: 2 },
                    {}
                  ]
                ]
              },
              layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#e2e8f0',
                vLineColor: () => '#e2e8f0'
              }
            } : { text: 'Sin tests.', style: 'value', italics: true }
          ]
        }
      ],
      columnGap: 20
    })

    // 4. Representative
    content.push({ text: 'Información del Representante', style: 'sectionHeader' })
    if (tutor) {
      content.push({
        columns: [
          { text: [{ text: 'Nombre: ', style: 'label' }, { text: tutor.nombre_completo, style: 'value' }] },
          { text: [{ text: 'Relación: ', style: 'label' }, { text: tutor.tipo_relacion, style: 'value' }] },
          { text: [{ text: 'Teléfono: ', style: 'label' }, { text: tutor.telefono, style: 'value' }] }
        ],
        margin: [0, 0, 0, 5]
      })
      content.push({
        text: [
          { text: 'Dirección: ', style: 'label' },
          { text: [tutor.estado, tutor.municipio, tutor.parroquia].filter(Boolean).join(', ') || 'No registrada', style: 'value' }
        ],
        margin: [0, 0, 0, 2]
      })
      content.push({
        text: [
          { text: 'Localidad: ', style: 'label' },
          { text: tutor.localidad || 'N/A', style: 'value' },
          { text: '   Tipo V.: ', style: 'label' },
          { text: tutor.tipo_vivienda || 'N/A', style: 'value' },
          { text: '   Ubicación: ', style: 'label' },
          { text: tutor.ubicacion_vivienda || 'N/A', style: 'value' }
        ],
        margin: [0, 0, 0, 5]
      })
    } else {
      content.push({ text: 'No hay representante asignado.', style: 'value', italics: true })
    }

    const docDef = this._getBaseDocDefinition(content, 'Ficha Técnica de Atleta', `${atleta.nombre} ${atleta.apellido}`)
    pdfMake.createPdf(docDef).open()
  },

  /**
         * Generates Attendance Report (General Table)
         */
  generateAttendanceReport(attendanceData, categoryName, dates, trainerName) {
    const tableBody = [
      [
        { text: 'Atleta', style: 'tableHeader' },
        { text: 'Presente', style: 'tableHeader' },
        { text: 'Ausente', style: 'tableHeader' },
        { text: 'Justificado', style: 'tableHeader' },
        { text: '% Asistencia', style: 'tableHeader' }
      ]
    ]

    attendanceData.forEach(row => {
      let percentColor = '#333'
      const p = parseFloat(row.percentage)
      if (p < 50) percentColor = 'red'
      else if (p < 80) percentColor = 'orange'
      else percentColor = 'green'

      tableBody.push([
        { text: row.athlete_name, style: 'tableCell' },
        { text: row.present_count, style: 'tableCell', alignment: 'center' },
        { text: row.absent_count, style: 'tableCell', alignment: 'center' },
        { text: row.justified_count, style: 'tableCell', alignment: 'center' },
        { text: row.percentage + '%', style: 'tableCell', alignment: 'center', color: percentColor, bold: true }
      ])
    })

    const infoStack = [
      { text: `Rango: ${dates && dates.length === 2 ? dates.join(' al ') : 'Todo el periodo'}`, fontSize: 10, alignment: 'center', margin: [0, 0, 0, 5] },
      trainerName ? { text: `Entrenador Responsable: ${trainerName}`, fontSize: 11, bold: true, alignment: 'center', margin: [0, 0, 0, 10] } : null
    ].filter(Boolean)

    const docDef = this._getBaseDocDefinition([...infoStack, {
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', 'auto', 'auto'],
        body: tableBody
      },
      layout: 'lightHorizontalLines'
    }], 'Reporte de Asistencia', categoryName || 'Todas las Categorías')
    pdfMake.createPdf(docDef).open()
  },

  /**
         * Generates Individual Attendance Detail
         */
  generateIndividualAttendanceReport(athleteName, attendanceList, categoryName, trainerName) {
    const tableBody = [
      [
        { text: 'Fecha', style: 'tableHeader' },
        { text: 'Estatus', style: 'tableHeader' },
        { text: 'Observación', style: 'tableHeader' }
      ]
    ]

    attendanceList.forEach(item => {
      let statusColor = 'black'
      if (item.estatus === 'presente') statusColor = 'green'
      if (item.estatus === 'ausente') statusColor = 'red'
      if (item.estatus === 'justificativo') statusColor = 'orange'

      tableBody.push([
        { text: new Date(item.fecha).toLocaleDateString(), style: 'tableCell' },
        { text: item.estatus, style: 'tableCell', color: statusColor, bold: true },
        { text: item.observacion || '-', style: 'tableCell' }
      ])
    })

    const infoStack = [
      categoryName ? { text: `Categoría: ${categoryName}`, fontSize: 11, alignment: 'center', margin: [0, 0, 0, 5] } : null,
      trainerName ? { text: `Entrenador Responsable: ${trainerName}`, fontSize: 11, bold: true, alignment: 'center', margin: [0, 0, 0, 10] } : null
    ].filter(Boolean)

    const docDef = this._getBaseDocDefinition([...infoStack, {
      table: {
        headerRows: 1,
        widths: ['auto', 'auto', '*'],
        body: tableBody
      },
      layout: 'lightHorizontalLines'
    }], 'Detalle de Asistencia', athleteName)
    pdfMake.createPdf(docDef).open()
  },

  /**
   * Generates Category Performance Report (PDF)
   */
  generateCategoryPerformanceReport(athletesData, categoryName, coachName) {
    const tableBody = [
      // Header Row
      [
        { text: 'Cédula', style: 'tableHeader' },
        { text: 'Nombre', style: 'tableHeader' },
        { text: 'Peso', style: 'tableHeader' },
        { text: 'Altura', style: 'tableHeader' },
        { text: 'IMC', style: 'tableHeader' },
        { text: '% Grasa', style: 'tableHeader' },
        { text: '% Musc.', style: 'tableHeader' },
        { text: 'Enverg.', style: 'tableHeader' },
        { text: 'Fuerza', style: 'tableHeader' },
        { text: 'Vel.', style: 'tableHeader' },
        { text: 'Resist.', style: 'tableHeader' },
        { text: 'Coord.', style: 'tableHeader' },
        { text: 'Reacc.', style: 'tableHeader' }
      ]
    ]

    // Data Rows
    athletesData.forEach(a => {
      tableBody.push([
        { text: a.cedula || '-', style: 'tableCell', fontSize: 7 },
        { text: a.nombre, style: 'tableCell', fontSize: 7 },
        { text: a.peso, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.altura, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.imc, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.grasa, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.musculo, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.envergadura, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.fuerza, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.velocidad, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.resistencia, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.coordinacion, style: 'tableCell', alignment: 'center', fontSize: 7 },
        { text: a.reaccion, style: 'tableCell', alignment: 'center', fontSize: 7 }
      ])
    })

    const content = [
      coachName ? { text: `Entrenador: ${coachName}`, style: 'reportSubtitle', fontSize: 11, margin: [0, -10, 0, 15] } : null,
      {
        table: {
          headerRows: 1,
          widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: tableBody
        },
        layout: 'lightHorizontalLines'
      },
      { text: `Total: ${athletesData.length} atletas`, margin: [0, 15, 0, 0], fontSize: 10, alignment: 'right' }
    ].filter(Boolean)

    const docDef = this._getBaseDocDefinition(content, 'Reporte de Rendimiento por Categoría', categoryName || 'Sin Categoría')
    pdfMake.createPdf(docDef).open()
  }
}

