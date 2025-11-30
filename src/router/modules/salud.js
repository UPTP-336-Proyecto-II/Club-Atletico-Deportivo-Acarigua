/** Módulo de salud y rendimiento */

import Layout from '@/layout'

const saludRouter = {
  path: '/salud',
  component: Layout,
  redirect: '/salud/fichas-medicas',
  name: 'Salud',
  meta: {
    title: 'Salud y Rendimiento',
    icon: 'chart',
    roles: ['ADMIN', 'ENTRENADOR']
  },
  children: [
    {
      path: 'fichas-medicas',
      component: () => import('@/views/salud/fichas-medicas.vue'),
      name: 'FichasMedicas',
      meta: {
        title: 'Fichas Médicas',
        roles: ['ADMIN', 'ENTRENADOR']
      }
    },
    {
      path: 'tests-rendimiento',
      component: () => import('@/views/salud/tests-rendimiento.vue'),
      name: 'TestsRendimiento',
      meta: {
        title: 'Tests de Rendimiento',
        roles: ['ADMIN', 'ENTRENADOR']
      }
    },
    {
      path: 'medidas-antropometricas',
      component: () => import('@/views/salud/medidas-antropometricas.vue'),
      name: 'MedidasAntropometricas',
      meta: {
        title: 'Medidas Antropométricas',
        roles: ['ADMIN', 'ENTRENADOR']
      }
    },
    {
      path: 'graficas',
      component: () => import('@/views/salud/graficas.vue'),
      name: 'GraficasRendimiento',
      meta: {
        title: 'Gráficas de Rendimiento',
        roles: ['ADMIN', 'ENTRENADOR']
      }
    }
  ]
}

export default saludRouter
