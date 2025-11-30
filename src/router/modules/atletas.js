/** Módulo de gestión de atletas */

import Layout from '@/layout'

const atletasRouter = {
  path: '/atletas',
  component: Layout,
  redirect: '/atletas/lista',
  name: 'Atletas',
  meta: {
    title: 'Atletas',
    icon: 'peoples',
    roles: ['ADMIN', 'ENTRENADOR']
  },
  children: [
    {
      path: 'lista',
      component: () => import('@/views/atletas/index.vue'),
      name: 'ListaAtletas',
      meta: {
        title: 'Lista de Atletas',
        roles: ['ADMIN', 'ENTRENADOR']
      }
    },
    {
      path: 'crear',
      component: () => import('@/views/atletas/form.vue'),
      name: 'CrearAtleta',
      meta: {
        title: 'Crear Atleta',
        roles: ['ADMIN', 'ENTRENADOR']
      },
      hidden: true
    },
    {
      path: 'editar/:id',
      component: () => import('@/views/atletas/form.vue'),
      name: 'EditarAtleta',
      meta: {
        title: 'Editar Atleta',
        roles: ['ADMIN', 'ENTRENADOR']
      },
      hidden: true
    },
    {
      path: 'detalle/:id',
      component: () => import('@/views/atletas/detail.vue'),
      name: 'DetalleAtleta',
      meta: {
        title: 'Detalle del Atleta',
        roles: ['ADMIN', 'ENTRENADOR', 'USUARIO']
      },
      hidden: true
    }
  ]
}

export default atletasRouter
