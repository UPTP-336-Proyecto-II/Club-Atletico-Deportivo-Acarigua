import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/* Router Modules */
// Removed unused router modules: components, charts, table, nested

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    noCache: true                if set true, the page will no be cached(default is false)
    affix: true                  if set true, the tag will affix in the tags-view
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/redirect',
    component: Layout,
    hidden: true,
    children: [
      {
        path: '/redirect/:path(.*)',
        component: () => import('@/views/redirect/index')
      }
    ]
  },
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/auth-redirect',
    component: () => import('@/views/login/auth-redirect'),
    hidden: true
  },
  {
    path: '/404',
    component: () => import('@/views/error-page/404'),
    hidden: true
  },
  {
    path: '/401',
    component: () => import('@/views/error-page/401'),
    hidden: true
  },
  // Nueva landing page como ruta principal
  {
    path: '/',
    component: () => import('@/views/landing/index'),
    hidden: true,
    meta: { title: 'Inicio' }
  },
  {
    path: '/dashboard',
    component: Layout,
    redirect: '/dashboard/index',
    children: [
      {
        path: 'index',
        component: () => import('@/views/dashboard/index'),
        name: 'Inicio',
        meta: { title: 'Inicio', icon: 'dashboard', affix: true }
      }
    ]
  },

  // ========== ASISTENCIA ==========
  {
    path: '/asistencia',
    component: Layout,
    redirect: '/asistencia/registro',
    name: 'Asistencia',
    meta: {
      title: 'Asistencia',
      icon: 'el-icon-document'
    },
    children: [
      {
        path: 'registro',
        component: () => import('@/views/asistencia/registro'),
        name: 'RegistroDiario',
        meta: { title: 'Registro Diario', icon: 'el-icon-edit' }
      },
      {
        path: 'reportes-mes',
        component: () => import('@/views/asistencia/reportes-mes'),
        name: 'ReportesMes',
        meta: { title: 'Reportes por Mes', icon: 'el-icon-data-analysis' }
      },
      {
        path: 'estadisticas',
        component: () => import('@/views/asistencia/estadisticas'),
        name: 'EstadisticasAsistencia',
        meta: { title: 'Estadísticas', icon: 'el-icon-pie-chart' }
      },
      {
        path: 'historial',
        component: () => import('@/views/asistencia/historial'),
        name: 'HistorialCompleto',
        meta: { title: 'Historial Completo', icon: 'el-icon-document-copy' }
      }
    ]
  },

  // ========== ATLETAS ==========
  {
    path: '/atletas',
    component: Layout,
    redirect: '/atletas/lista',
    name: 'Atletas',
    meta: {
      title: 'Atletas',
      icon: 'el-icon-user'
    },
    children: [
      {
        path: 'lista',
        component: () => import('@/views/atletas/lista'),
        name: 'ListaAtletas',
        meta: { title: 'Lista Completa', icon: 'el-icon-s-custom' }
      },
      {
        path: 'nuevo',
        component: () => import('@/views/atletas/nuevo'),
        name: 'NuevoAtleta',
        meta: { title: 'Nuevo Atleta', icon: 'el-icon-plus' }
      }
    ]
  },

  // ========== CATEGORÍAS ==========
  {
    path: '/categorias',
    component: Layout,
    children: [
      {
        path: 'index',
        component: () => import('@/views/categorias/index'),
        name: 'Categorias',
        meta: { title: 'Categorías', icon: 'el-icon-medal' }
      }
    ]
  },

  // ========== ENTRENADORES ==========
  {
    path: '/entrenadores',
    component: Layout,
    redirect: '/entrenadores/lista',
    name: 'Entrenadores',
    meta: {
      title: 'Entrenadores',
      icon: 'el-icon-user-solid'
    },
    children: [
      {
        path: 'lista',
        component: () => import('@/views/entrenadores/lista'),
        name: 'ListaEntrenadores',
        meta: { title: 'Lista Completa', icon: 'el-icon-s-custom' }
      },
      {
        path: 'asignacion',
        component: () => import('@/views/entrenadores/asignacion'),
        name: 'AsignacionAtletas',
        meta: { title: 'Asignación Atletas', icon: 'el-icon-connection' }
      },
      {
        path: 'horarios',
        component: () => import('@/views/entrenadores/horarios'),
        name: 'HorariosEntrenadores',
        meta: { title: 'Horarios', icon: 'el-icon-time' }
      },
      {
        path: 'especialidades',
        component: () => import('@/views/entrenadores/especialidades'),
        name: 'EspecialidadesEntrenadores',
        meta: { title: 'Especialidades', icon: 'el-icon-star-on' }
      }
    ]
  },

  // ========== MÉDICO/ENFERMERÍA ==========
  {
    path: '/medico',
    component: Layout,
    redirect: '/medico/consultas',
    name: 'Medico',
    meta: {
      title: 'Médico/Enfermería',
      icon: 'el-icon-first-aid-kit'
    },
    children: [
      {
        path: 'consultas',
        component: () => import('@/views/medico/consultas'),
        name: 'ConsultasMedicas',
        meta: { title: 'Consultas', icon: 'el-icon-document-checked' }
      },
      {
        path: 'historial',
        component: () => import('@/views/medico/historial'),
        name: 'HistorialMedico',
        meta: { title: 'Historial Médico', icon: 'el-icon-folder-opened' }
      },
      {
        path: 'lesiones',
        component: () => import('@/views/medico/lesiones'),
        name: 'ReportesLesiones',
        meta: { title: 'Reportes Lesiones', icon: 'el-icon-warning' }
      }
    ]
  },

  // ========== REPORTES ==========
  {
    path: '/reportes',
    component: Layout,
    redirect: '/reportes/rendimiento',
    name: 'Reportes',
    meta: {
      title: 'Reportes',
      icon: 'el-icon-data-line'
    },
    children: [
      {
        path: 'rendimiento',
        component: () => import('@/views/reportes/rendimiento'),
        name: 'RendimientoGeneral',
        meta: { title: 'Rendimiento General', icon: 'el-icon-trend-charts' }
      },
      {
        path: 'medicos',
        component: () => import('@/views/reportes/medicos'),
        name: 'ReportesMedicos',
        meta: { title: 'Reportes Médicos', icon: 'el-icon-first-aid-kit' }
      },
      {
        path: 'asistencia-mensual',
        component: () => import('@/views/reportes/asistencia-mensual'),
        name: 'AsistenciaMensual',
        meta: { title: 'Asistencia Mensual', icon: 'el-icon-date' }
      },
      {
        path: 'metas',
        component: () => import('@/views/reportes/metas'),
        name: 'MetasCumplidas',
        meta: { title: 'Metas Cumplidas', icon: 'el-icon-trophy' }
      },
      {
        path: 'exportar',
        component: () => import('@/views/reportes/exportar'),
        name: 'ExportarDatos',
        meta: { title: 'Exportar Datos', icon: 'el-icon-download' }
      }
    ]
  },

  // ========== CONFIGURACIÓN ==========
  {
    path: '/configuracion',
    component: Layout,
    redirect: '/configuracion/usuarios',
    name: 'Configuracion',
    meta: {
      title: 'Configuración',
      icon: 'el-icon-setting'
    },
    children: [
      {
        path: 'usuarios',
        component: () => import('@/views/configuracion/usuarios'),
        name: 'UsuariosSistema',
        meta: { title: 'Usuarios del Sistema', icon: 'el-icon-user' }
      },
      {
        path: 'permisos',
        component: () => import('@/views/configuracion/permisos'),
        name: 'PermisosRoles',
        meta: { title: 'Permisos y Roles', icon: 'el-icon-lock' }
      },
      {
        path: 'club',
        component: () => import('@/views/configuracion/club'),
        name: 'ConfiguracionClub',
        meta: { title: 'Configuración Club', icon: 'el-icon-office-building' }
      },
      {
        path: 'notificaciones',
        component: () => import('@/views/configuracion/notificaciones'),
        name: 'ConfigNotificaciones',
        meta: { title: 'Notificaciones', icon: 'el-icon-message' }
      },
      {
        path: 'respaldo',
        component: () => import('@/views/configuracion/respaldo'),
        name: 'RespaldoDatos',
        meta: { title: 'Respaldo de Datos', icon: 'el-icon-refresh' }
      }
    ]
  },

  {
    path: '/profile',
    component: Layout,
    redirect: '/profile/index',
    hidden: true,
    children: [
      {
        path: 'index',
        component: () => import('@/views/profile/index'),
        name: 'Profile',
        meta: { title: 'Profile', icon: 'user', noCache: true }
      }
    ]
  }
]

/**
 * asyncRoutes
 * the routes that need to be dynamically loaded based on user roles
 */
export const asyncRoutes = [
  {
    path: '/permission',
    component: Layout,
    redirect: '/permission/page',
    alwaysShow: true, // will always show the root menu
    name: 'Permission',
    meta: {
      title: 'Permission',
      icon: 'lock',
      roles: ['admin', 'editor'] // you can set roles in root nav
    },
    children: [
      {
        path: 'page',
        component: () => import('@/views/permission/page'),
        name: 'PagePermission',
        meta: {
          title: 'Page Permission',
          roles: ['admin'] // or you can only set roles in sub nav
        }
      },
      {
        path: 'directive',
        component: () => import('@/views/permission/directive'),
        name: 'DirectivePermission',
        meta: {
          title: 'Directive Permission'
          // if do not set roles, means: this page does not require permission
        }
      },
      {
        path: 'role',
        component: () => import('@/views/permission/role'),
        name: 'RolePermission',
        meta: {
          title: 'Role Permission',
          roles: ['admin']
        }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
