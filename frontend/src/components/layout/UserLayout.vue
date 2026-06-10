<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { onMounted, onUnmounted } from 'vue'
import NotificationBell from '@/components/common/NotificationBell.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const notif = useNotificationStore()

const sidebarCollapsed = ref(false)

onMounted(() => {
  notif.startPolling()
  // mock token 时跳过网络请求，user 数据已在登录时写入
  const token = auth.token
  if (!auth.user && token && !token.startsWith('mock-')) {
    auth.fetchUserInfo()
  }
})
onUnmounted(() => notif.stopPolling())

const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/task-hall') || path.startsWith('/task/')) return '/task-hall'
  if (path.startsWith('/publish-task')) return '/publish-task'
  if (path.startsWith('/my-tasks')) return '/my-tasks'
  if (path.startsWith('/my-applications')) return '/my-applications'
  if (path.startsWith('/profile')) return '/profile'
  if (path.startsWith('/notifications')) return '/notifications'
  return '/task-hall'
})

const avatarLabel = computed(() => {
  const nick = auth.user?.nickname || ''
  return nick.charAt(0).toUpperCase() || '用'
})

function navigate(path: string) {
  router.push(path)
}

function goProfile() {
  router.push('/profile')
}
</script>

<template>
  <el-container class="user-layout">
    <!-- 顶部栏 -->
    <el-header class="user-header">
      <div class="header-left">
        <el-icon
          class="collapse-btn"
          @click="sidebarCollapsed = !sidebarCollapsed"
        >
          <Fold v-if="!sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
        <div class="logo" @click="navigate('/task-hall')">
          <div class="logo-icon">任</div>
          <span class="logo-text">校园任务悬赏平台</span>
        </div>
      </div>
      <div class="header-right">
        <!-- 通知铃铛 -->
        <NotificationBell />
        <!-- 用户信息 -->
        <div class="user-info" @click="goProfile">
          <el-avatar size="small" :style="{ background: '#1e56a0' }">
            {{ avatarLabel }}
          </el-avatar>
          <span class="user-nickname">{{ auth.user?.nickname || '加载中' }}</span>
        </div>
      </div>
    </el-header>

    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="sidebarCollapsed ? '64px' : '220px'" class="user-sidebar">
        <el-menu
          :default-active="activeMenu"
          :collapse="sidebarCollapsed"
          @select="navigate"
        >
          <el-menu-item index="/task-hall">
            <el-icon><HomeFilled /></el-icon>
            <template #title>任务大厅</template>
          </el-menu-item>
          <el-menu-item index="/publish-task">
            <el-icon><Plus /></el-icon>
            <template #title>发布任务</template>
          </el-menu-item>
          <el-sub-menu index="/my-tasks-group">
            <template #title>
              <el-icon><List /></el-icon>
              <span>我的任务</span>
            </template>
            <el-menu-item index="/my-tasks">我发布的 / 我承接的</el-menu-item>
          </el-sub-menu>
          <el-menu-item index="/my-applications">
            <el-icon><Document /></el-icon>
            <template #title>我的申请</template>
          </el-menu-item>
          <el-menu-item index="/profile">
            <el-icon><User /></el-icon>
            <template #title>个人中心</template>
          </el-menu-item>
          <el-menu-item index="/notifications">
            <el-icon><Bell /></el-icon>
            <template #title>消息通知</template>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <!-- 内容区 -->
      <el-main class="user-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.user-layout {
  height: 100vh;
}

.user-header {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 64px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #595959;
  padding: 4px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.logo-icon {
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

.logo-text {
  font-size: 18px;
  font-weight: bold;
  color: #1e56a0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s;
}

.user-info:hover {
  background: #f5f5f5;
}

.user-nickname {
  font-size: 14px;
  color: #262626;
}

.user-sidebar {
  position: fixed;
  top: 64px;
  left: 0;
  bottom: 0;
  overflow-y: auto;
  background: #fff;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
  transition: width 0.3s;
  z-index: 999;
}

.user-sidebar :deep(.el-menu) {
  border-right: none;
  height: 100%;
}

.user-sidebar :deep(.el-menu-item.is-active) {
  background: rgba(30, 86, 160, 0.08);
  border-left: 3px solid #1e56a0;
  color: #1e56a0;
  font-weight: 500;
}

.user-main {
  margin-top: 64px;
  margin-left: 220px;
  min-height: calc(100vh - 64px);
  background: #f5f5f5;
  padding: 24px;
  transition: margin-left 0.3s;
}
</style>
