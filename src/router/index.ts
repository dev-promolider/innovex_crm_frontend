import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/inicio/LoginView.vue'
import DashboardView from '../views/dashboard/DashboardView.vue'
import CampanasView from '../views/campanas/CampanasView.vue'
import LideresView from '../views/lideres/LideresView.vue'
import ValidacionView from '../views/validacion/ValidacionView.vue'

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
    }
  ]
})

// Guard: si no hay token redirige al login
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else {
    next()
  }
})

export default router