import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/inicio/LoginView.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import EmpresaWorkspaceView from '../views/empresas/EmpresaWorkspaceView.vue'
import EmpresasView from '../views/empresas/EmpresasView.vue'
import CampanasView from '../views/campanas/CampanasView.vue'
import LideresView from '../views/lideres/LideresView.vue'
import ValidacionView from '../views/validacion/ValidacionView.vue'
import InventarioView from '../views/inventario/InventarioView.vue'
import DeudasView from '../views/deudas/DeudasView.vue'
import RecompensasView from '../views/recompensas/RecompensasView.vue'
import ReportesView from '../views/reportes/ReportesView.vue'
import ConfiguracionView from '../views/configuracion/ConfiguracionView.vue'
import UsuariosView from '../views/usuarios/UsuariosView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true }
    },
    {
      path: '/empresas',
      name: 'empresas',
      component: EmpresasView,
      meta: { requiresAuth: true, requiresSuperadmin: true }
    },
    {
      path: '/empresas/:empresaId',
      name: 'empresa-workspace',
      component: EmpresaWorkspaceView,
      meta: { requiresAuth: true, requiresSuperadmin: true }
    },
    {
      path: '/campanas',
      name: 'campanas',
      component: CampanasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/lideres',
      name: 'lideres',
      component: LideresView,
      meta: { requiresAuth: true }
    },
    {
      path: '/validacion',
      name: 'validacion',
      component: ValidacionView,
      meta: { requiresAuth: true }
    },
    {
      path: '/inventario',
      name: 'inventario',
      component: InventarioView,
      meta: { requiresAuth: true }
    },
    {
      path: '/deudas',
      name: 'deudas',
      component: DeudasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/recompensas',
      name: 'recompensas',
      component: RecompensasView,
      meta: { requiresAuth: true }
    },
    {
      path: '/reportes',
      name: 'reportes',
      component: ReportesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/usuarios',
      name: 'usuarios',
      component: UsuariosView,
      meta: { requiresAuth: true, requiresSuperadmin: true }
    },
    {
      path: '/configuracion',
      name: 'configuracion',
      component: ConfiguracionView,
      meta: { requiresAuth: true }
    },
  ]
})

// Guard: si no hay token redirige al login
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  const isSuperadmin = localStorage.getItem('user_es_superadmin') === 'true'
  const workspaceRole = localStorage.getItem('workspace_role') ?? ''
  const hasPanelAccess = isSuperadmin || workspaceRole.length > 0

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.meta.requiresAuth && !hasPanelAccess) {
    localStorage.clear()
    next({ name: 'login' })
  } else if (to.meta.requiresSuperadmin && !isSuperadmin) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router