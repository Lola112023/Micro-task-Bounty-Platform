<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { formatDateTime } from '@/utils/format'

const router = useRouter()
const notif = useNotificationStore()
const visible = ref(false)

onMounted(() => notif.fetchRecentUnread())

const displayCount = (n: number) => (n > 99 ? '99+' : String(n))

function handleClick(item: { id: number; targetUrl: string | null; isRead: boolean }) {
  if (!item.isRead) notif.readOne(item.id)
  visible.value = false
  if (item.targetUrl) router.push(item.targetUrl)
}

function goNotifications() {
  visible.value = false
  router.push('/notifications')
}
</script>

<template>
  <el-popover
    v-model:visible="visible"
    placement="bottom-end"
    :width="360"
    trigger="click"
    @show="notif.fetchRecentUnread()"
  >
    <!-- 铃铛触发器 -->
    <template #reference>
      <el-badge
        :value="notif.unreadCount > 0 ? displayCount(notif.unreadCount) : ''"
        :hidden="notif.unreadCount === 0"
        type="danger"
        class="bell-badge"
      >
        <el-icon class="bell-icon" :size="22"><Bell /></el-icon>
      </el-badge>
    </template>

    <!-- 下拉面板 -->
    <div class="notif-panel">
      <div class="notif-header">
        <span class="notif-title">通知</span>
        <el-button link size="small" @click="notif.readAll()">全部已读</el-button>
      </div>

      <div v-if="notif.recentList.length === 0" class="notif-empty">
        暂无未读通知
      </div>

      <div
        v-for="item in notif.recentList"
        :key="item.id"
        class="notif-item"
        :class="{ unread: !item.isRead }"
        @click="handleClick(item)"
      >
        <div class="notif-item-title">{{ item.title }}</div>
        <div class="notif-item-content">{{ item.content }}</div>
        <div class="notif-item-time">{{ formatDateTime(item.createdAt) }}</div>
      </div>

      <div class="notif-footer" @click="goNotifications">查看全部通知 →</div>
    </div>
  </el-popover>
</template>

<style scoped>
.bell-badge {
  cursor: pointer;
}

.bell-icon {
  color: #595959;
  transition: color 0.2s;
}

.bell-icon:hover {
  color: #1e56a0;
}

.notif-panel {
  min-height: 60px;
}

.notif-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
  margin-bottom: 8px;
}

.notif-title {
  font-size: 15px;
  font-weight: 600;
}

.notif-empty {
  text-align: center;
  color: #bbb;
  padding: 20px 0;
  font-size: 13px;
}

.notif-item {
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  border-radius: 4px;
  padding: 8px;
  transition: background 0.15s;
}

.notif-item:hover {
  background: #f5f5f5;
}

.notif-item.unread {
  background: #fafafa;
}

.notif-item-title {
  font-weight: 500;
  font-size: 13px;
  margin-bottom: 3px;
}

.notif-item-content {
  color: #595959;
  font-size: 12px;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.notif-item-time {
  font-size: 11px;
  color: #bbb;
}

.notif-footer {
  text-align: center;
  padding: 10px 0 4px;
  color: #1e56a0;
  font-size: 13px;
  cursor: pointer;
}

.notif-footer:hover {
  text-decoration: underline;
}
</style>
