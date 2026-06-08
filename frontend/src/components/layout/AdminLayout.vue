<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/admin/users')) return '/admin/users'
  if (path.startsWith('/admin/tasks')) return '/admin/tasks'
  if (path.startsWith('/admin/reviews')) return '/admin/reviews'
  if (path.startsWith('/admin/settings')) return '/admin/settings'
  if (path.startsWith('/admin/finance')) return '/admin/finance'
  if (path.startsWith('/admin/broadcast')) return '/admin/broadcast'
  if (path.startsWith('/admin/categories')) return '/admin/categories'
  return '/admin/dashboard'
})

function navigate(path: string) {
  router.push(path)
}

async function handleLogout() {
  await ElMessageBox.confirm('确认退出管理员登录？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning',
  })
  auth.adminLogout()
  router.push('/admin/login')
}
</script>

<template>
  <el-container class="admin-layout">
    <!-- 顶部栏 -->
    <el-header class="admin-header">
      <div class="admin-logo">
        <div class="admin-logo-icon">管</div>
        <span>后台管理系统</span>
      </div>
      <div class="admin-header-right">
        <span class="admin-name">管理员: {{ auth.admin?.username || 'admin' }}</span>
        <el-button link type="danger" @click="handleLogout">退出登录</el-button>
      </div>
    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="220px" class="admin-sidebar">
        <el-menu :default-active="activeMenu" @select="navigate">
          <el-menu-item index="/admin/dashboard">
            <el-icon><DataLine /></el-icon>
            <template #title>仪表盘</template>
          </el-menu-item>
          <el-menu-item index="/admin/users">
            <el-icon><UserFilled /></el-icon>
            <template #title>用户管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/tasks">
            <el-icon><Files /></el-icon>
            <template #title>任务管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/reviews">
            <el-icon><Search /></el-icon>
            <template #title>审核管理</template>
          </el-menu-item>
          <el-menu-item index="/admin/settings">
            <el-icon><Setting /></el-icon>
            <template #title>系统配置</template>
          </el-menu-item>
          <el-menu-item index="/admin/finance">
            <el-icon><Money /></el-icon>
            <template #title>财务审计</template>
          </el-menu-item>
          <el-menu-item index="/admin/broadcast">
            <el-icon><Notification /></el-icon>
            <template #title>消息广播</template>
          </el-menu-item>
          <el-menu-item index="/admin/categories">
            <el-icon><PriceTag /></el-icon>
            <template #title>分类管理</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 内容区 -->
      <el-main class="admin-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}

.admin-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 64px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.admin-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #1e56a0;
}

.admin-logo-icon {
  width: 32px;
  height: 32px;
  background: #1e56a0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.admin-header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.admin-name {
  font-size: 14px;
  color: #595959;
}

.admin-sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  z-index: 999;
}

.admin-sidebar :deep(.el-menu) {
  border-right: none;
  height: 100%;
}

.admin-sidebar :deep(.el-menu-item.is-active) {
  background: rgba(30, 86, 160, 0.08);
  border-left: 3px solid #1e56a0;
  color: #1e56a0;
  font-weight: 500;
}

.admin-main {
  margin-top: 64px;
  margin-left: 220px;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
  padding: 24px;
}
</style>
