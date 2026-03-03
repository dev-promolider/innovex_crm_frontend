import { createRouter, createWebHistory } from 'vue-router';
import LoginWiew from '../views/inicio/LoginWiew.vue';

const routes = [
  {
    path: '/',
    name: 'Inicio',
    component: LoginWiew,
  },
];  

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;