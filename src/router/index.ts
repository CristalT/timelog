import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
    { path: '/', component: () => import('../views/DashboardView.vue') },
    { path: '/new', component: () => import('../views/NewEntryView.vue') },
    { path: '/report', component: () => import('../views/ReportView.vue') },
    { path: '/settings', component: () => import('../views/SettingsView.vue') },
  ],
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  if (!auth.ready) return true            // let App.vue handle the loading state
  if (!auth.user && !to.meta.public) return '/login'
  if (auth.user && to.path === '/login') return '/'
})

export default router
