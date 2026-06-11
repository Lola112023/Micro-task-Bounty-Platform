import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ─── 认证 ────────────────────────────────────────────────────────────────
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guest: true },
    },
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: () => import('@/views/admin/AdminLoginView.vue'),
      meta: { guest: true },
    },

    // ─── 用户端（需登录） ─────────────────────────────────────────────────────
    {
      path: '/',
      component: () => import('@/components/layout/UserLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/task-hall',
      children: [
        {
          path: 'task-hall',
          name: 'TaskHall',
          component: () => import('@/views/user/TaskHallView.vue'),
        },
        {
          path: 'task/:taskId',
          name: 'TaskDetail',
          component: () => import('@/views/user/TaskDetailView.vue'),
          props: true,
        },
        {
          path: 'publish-task',
          name: 'PublishTask',
          component: () => import('@/views/user/PublishTaskView.vue'),
        },
        {
          path: 'my-tasks',
          name: 'MyTasks',
          component: () => import('@/views/user/MyTasksView.vue'),
        },
        {
          path: 'my-applications',
          name: 'MyApplications',
          component: () => import('@/views/user/MyApplicationsView.vue'),
        },
        {
          path: 'profile',
          name: 'Profile',
          component: () => import('@/views/user/ProfileView.vue'),
        },
        {
          path: 'notifications',
          name: 'Notifications',
          component: () => import('@/views/user/NotificationsView.vue'),
        },
        {
          path: 'user/:userId',
          name: 'UserProfile',
          component: () => import('@/views/user/UserProfileView.vue'),
          props: true,
        },
        {
          path: 'task-history',
          name: 'TaskHistory',
          component: () => import('@/views/user/TaskHistoryView.vue'),
        },
      ],
    },

    // ─── 管理员端（需管理员权限） ─────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('@/components/layout/AdminLayout.vue'),
      meta: { requiresAdmin: true },
      redirect: '/admin/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: () => import('@/views/admin/DashboardView.vue'),
        },
        {
          path: 'users',
          name: 'AdminUsers',
          component: () => import('@/views/admin/UsersView.vue'),
        },
        {
          path: 'users/:userId',
          name: 'AdminUserDetail',
          component: () => import('@/views/admin/UserDetailView.vue'),
          props: true,
        },
        {
          path: 'tasks',
          name: 'AdminTasks',
          component: () => import('@/views/admin/TasksView.vue'),
        },
        {
          path: 'tasks/:taskId',
          name: 'AdminTaskDetail',
          component: () => import('@/views/user/TaskDetailView.vue'),
          props: true,
        },
        {
          path: 'reviews',
          name: 'AdminReviews',
          component: () => import('@/views/admin/ReviewsView.vue'),
        },
        {
          path: 'settings',
          name: 'AdminSettings',
          component: () => import('@/views/admin/SettingsView.vue'),
        },

        {
          path: 'broadcast',
          name: 'AdminBroadcast',
          component: () => import('@/views/admin/BroadcastView.vue'),
        },
        {
          path: 'categories',
          name: 'AdminCategories',
          component: () => import('@/views/admin/CategoriesView.vue'),
        },
      ],
    },

    // ─── 默认重定向 ───────────────────────────────────────────────────────────
    { path: '/:pathMatch(.*)*', redirect: '/task-hall' },
  ],
})

// 路由守卫
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return { name: 'AdminLogin' }
  }

  if (to.meta.guest && auth.isLoggedIn && !to.path.startsWith('/admin')) {
    return { name: 'TaskHall' }
  }

  if (to.meta.guest && auth.isAdmin && to.path.startsWith('/admin')) {
    return { name: 'AdminDashboard' }
  }
})

export default router
