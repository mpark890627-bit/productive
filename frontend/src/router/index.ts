import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
import ProjectsView from '../views/app/ProjectsView.vue'
import ProjectDetailView from '../views/app/ProjectDetailView.vue'
import ProjectBoardView from '../views/app/ProjectBoardView.vue'
import InboxView from '../views/app/InboxView.vue'
import TasksListView from '../views/app/TasksListView.vue'
import TemplatesView from '../views/app/TemplatesView.vue'
import ProjectTemplatesView from '../views/app/ProjectTemplatesView.vue'
import CalendarView from '../views/app/CalendarView.vue'
import ProjectRisksView from '../views/app/ProjectRisksView.vue'
import RiskDetailView from '../views/app/RiskDetailView.vue'
import { useAuthStore } from '../stores/auth'
import { useTabsStore } from '../stores/tabsStore'
import { pinia } from '../plugins/pinia'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', redirect: '/app/projects' },
    {
      path: '/',
      component: AuthLayout,
      children: [
        { path: 'login', name: 'login', component: LoginView, meta: { title: 'Login', tabbed: false } },
        { path: 'register', name: 'register', component: RegisterView, meta: { title: 'Register', tabbed: false } },
      ],
    },
    {
      path: '/app',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        { path: '', redirect: '/app/projects', meta: { title: 'Dashboard' } },
        {
          path: 'inbox',
          name: 'inbox',
          component: InboxView,
          meta: { requiresAuth: true, title: 'Inbox', tabbed: true, affix: true, keepAlive: true },
        },
        {
          path: 'tasks',
          name: 'tasks',
          component: TasksListView,
          meta: { requiresAuth: true, title: 'Tasks', tabbed: true, keepAlive: true },
        },
        {
          path: 'projects',
          name: 'projects',
          component: ProjectsView,
          meta: { requiresAuth: true, title: 'Projects', tabbed: true, affix: true, keepAlive: true },
        },
        {
          path: 'calendar',
          name: 'calendar',
          component: CalendarView,
          meta: { requiresAuth: true, title: 'Calendar', tabbed: true, keepAlive: true },
        },
        {
          path: 'templates',
          name: 'templates',
          component: TemplatesView,
          meta: { requiresAuth: true, title: 'Templates', tabbed: true, keepAlive: true },
        },
        {
          path: 'projects/:id',
          name: 'project-detail',
          component: ProjectDetailView,
          meta: { requiresAuth: true, title: 'Project Detail', tabbed: true, keepAlive: true },
        },
        {
          path: 'projects/:id/board',
          name: 'project-board',
          component: ProjectBoardView,
          meta: { requiresAuth: true, title: 'Kanban Board', tabbed: true, keepAlive: true },
        },
        {
          path: 'projects/:id/templates',
          name: 'project-templates',
          component: ProjectTemplatesView,
          meta: { requiresAuth: true, title: 'Project Templates', tabbed: true, keepAlive: true },
        },
        {
          path: 'projects/:projectId/risks',
          name: 'project-risks',
          component: ProjectRisksView,
          meta: { requiresAuth: true, title: 'Risk Register', tabbed: true, keepAlive: true },
        },
        {
          path: 'projects/:projectId/risks/:riskId',
          name: 'risk-detail',
          component: RiskDetailView,
          meta: {
            requiresAuth: true,
            title: 'Risk Detail',
            tabbed: true,
            keepAlive: true,
            tabKeyStrategy: 'FULLPATH',
          },
        },
      ],
    },
  ],
})

const tabsStore = useTabsStore(pinia)
tabsStore.restore({
  validatePath: (fullPath) => {
    const resolved = router.resolve(fullPath)
    return resolved.matched.length > 0
  },
})

router.beforeEach((to) => {
  const authStore = useAuthStore(pinia)
  authStore.loadFromStorage()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if ((to.path === '/login' || to.path === '/register') && authStore.isAuthenticated) {
    return '/app/projects'
  }

  return true
})

router.afterEach((to) => {
  tabsStore.openOrActivateFromRoute(to)
})

export default router
