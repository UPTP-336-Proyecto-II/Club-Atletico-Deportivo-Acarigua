/** Módulo de gestión de pagos */

import Layout from '@/layout'

const pagosRouter = {
  path: '/pagos',
  component: Layout,
  redirect: '/pagos/lista',
  name: 'Pagos',
  meta: {
    title: 'Pagos',
    icon: 'money',
    roles: ['ADMIN', 'ENTRENADOR', 'USUARIO']
  },
  children: [
    {
      path: 'lista',
      component: () => import('@/views/pagos/index.vue'),
      name: 'ListaPagos',
      meta: {
        title: 'Gestión de Pagos',
        roles: ['ADMIN']
      }
    },
    {
      path: 'estado-cuenta',
      component: () => import('@/views/pagos/estado-cuenta.vue'),
      name: 'EstadoCuenta',
      meta: {
        title: 'Estado de Cuenta',
        roles: ['ADMIN', 'ENTRENADOR', 'USUARIO']
      }
    },
    {
      path: 'registrar',
      component: () => import('@/views/pagos/registrar.vue'),
      name: 'RegistrarPago',
      meta: {
        title: 'Registrar Pago',
        roles: ['ADMIN']
      },
      hidden: true
    }
  ]
}

export default pagosRouter
