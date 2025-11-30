/** Módulo de control de asistencias */

import Layout from '@/layout'

const asistenciasRouter = {
  path: '/asistencias',
  component: Layout,
  redirect: '/asistencias/control',
  name: 'Asistencias',
  meta: {
    title: 'Asistencias',
    icon: 'clipboard',
    roles: ['ADMIN', 'ENTRENADOR']
  },
  children: [
    {
      path: 'control',
      component: () => import('@/views/asistencias/index.vue'),
      name: 'ControlAsistencias',
      meta: {
        title: 'Control de Asistencias',
        roles: ['ADMIN', 'ENTRENADOR']
      }
    },
    {
      path: 'registro',
      component: () => import('@/views/asistencias/registro.vue'),
      name: 'RegistroAsistencia',
      meta: {
        title: 'Registrar Asistencia',
        roles: ['ADMIN', 'ENTRENADOR']
      }
    },
    {
      path: 'reportes',
      component: () => import('@/views/asistencias/reportes.vue'),
      name: 'ReportesAsistencias',
      meta: {
        title: 'Reportes',
        roles: ['ADMIN', 'ENTRENADOR']
      }
    }
  ]
}

export default asistenciasRouter
