import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { NotificationItem } from '@/types/notification'
import { getUnreadCount, getRecentUnread, markAsRead, markAllAsRead } from '@/api/notification'

export const useNotificationStore = defineStore('notification', () => {
  const unreadCount = ref(0)
  const recentList = ref<NotificationItem[]>([])
  let pollTimer: ReturnType<typeof setInterval> | null = null

  async function fetchUnreadCount() {
    try {
      const res = await getUnreadCount()
      unreadCount.value = res.count
    } catch {
      // 静默失败
    }
  }

  async function fetchRecentUnread() {
    try {
      recentList.value = await getRecentUnread()
    } catch {
      // 静默失败
    }
  }

  async function readOne(id: number) {
    await markAsRead(id)
    const item = recentList.value.find((n) => n.id === id)
    if (item) item.isRead = true
    if (unreadCount.value > 0) unreadCount.value--
  }

  async function readAll() {
    await markAllAsRead()
    recentList.value.forEach((n) => (n.isRead = true))
    unreadCount.value = 0
  }

  /** 启动轮询（每30秒刷新一次未读数） */
  function startPolling() {
    fetchUnreadCount()
    pollTimer = setInterval(fetchUnreadCount, 30000)
  }

  function stopPolling() {
    if (pollTimer) {
      clearInterval(pollTimer)
      pollTimer = null
    }
  }

  return {
    unreadCount,
    recentList,
    fetchUnreadCount,
    fetchRecentUnread,
    readOne,
    readAll,
    startPolling,
    stopPolling,
  }
})
