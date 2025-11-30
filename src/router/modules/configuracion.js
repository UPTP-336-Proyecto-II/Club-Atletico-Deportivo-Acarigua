/** Módulo de configuración del sistema (solo ADMIN) */

import Layout from '@/layout'

const configuracionRouter = {
  path: '/configuracion',
  component: Layout,
  redirect: '/configuracion/usuarios',
  name: 'Configuracion',
  meta: {
    title: 'Configuración',
    icon: 'setting',
    roles: ['ADMIN']
  },
  children: [
    {
      path: 'usuarios',
      component: () => import('@/views/configuracion/usuarios.vue'),
      name: 'GestionUsuarios',
      meta: {
        title: 'Usuarios del Sistema',
        roles: ['ADMIN']
      }
    },
    {
      path: 'plantel',
      component: () => import('@/views/configuracion/plantel.vue'),
      name: 'GestionPlantel',
      meta: {
        title: 'Plantel Técnico',
        roles: ['ADMIN']
      }
    },
    {
      path: 'categorias',
      component: () => import('@/views/configuracion/categorias.vue'),
      name: 'GestionCategorias',
      meta: {
        title: 'Categorías',
        roles: ['ADMIN']
      }
    },
    {
      path: 'implementos',
      component: () => import('@/views/configuracion/implementos.vue'),
      name: 'GestionImplementos',
      meta: {
        title: 'Implementos Deportivos',
        roles: ['ADMIN']
      }
    },
    {
      path: 'tutores',
      component: () => import('@/views/configuracion/tutores.vue'),
      name: 'GestionTutores',
      meta: {
        title: 'Tutores',
        roles: ['ADMIN']
      }
    }
  ]
}

export default configuracionRouter
