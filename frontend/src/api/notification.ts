/**
 * 通知相关 API
 * 后端未就绪时自动回退到 mock 数据。
 */
import request from './index'
import type { NotificationItem } from '@/types/notification'
import type { PageResult } from '@/types/task'
import { MOCK_NOTIFICATIONS, emptyPage } from './mock'

function warn(fn: string) {
  console.warn(`[Mock] ${fn} — 后端未就绪，返回 mock 数据`)
}

/** 获取通知列表 */
export async function getNotifications(params: {
  type?: string; isRead?: boolean; page?: number; pageSize?: number
}): Promise<PageResult<NotificationItem>> {
  try {
    const { pageSize, ...rest } = params
    return await request.get('/notifications', { params: { ...rest, size: pageSize || 20 } })
  }
  catch {
    warn('getNotifications')
    return { total: MOCK_NOTIFICATIONS.length, page: 1, pageSize: 20, list: [...MOCK_NOTIFICATIONS] }
  }
}

/** 获取未读通知数量 */
export async function getUnreadCount(): Promise<{ count: number }> {
  try { return await request.get('/notifications/unread-count') }
  catch { return { count: MOCK_NOTIFICATIONS.filter(n => !n.isRead).length } }
}

/** 获取最近5条未读通知 */
export async function getRecentUnread(): Promise<NotificationItem[]> {
  try { return await request.get('/notifications/unread') }
  catch {
    warn('getRecentUnread')
    return MOCK_NOTIFICATIONS.filter(n => !n.isRead).slice(0, 5)
  }
}

/** 标记单条通知为已读 */
export async function markAsRead(notificationId: number): Promise<void> {
  try { return await request.put('/notifications/read', { ids: [notificationId] }) }
  catch { warn('markAsRead') }
}

/** 全部标记为已读 */
export async function markAllAsRead(): Promise<void> {
  try { return await request.put('/notifications/read-all') }
  catch { warn('markAllAsRead') }
}

/** 删除通知 */
export async function deleteNotification(notificationId: number): Promise<void> {
  try { return await request.delete('/notifications', { data: { ids: [notificationId] } }) }
  catch { warn('deleteNotification') }
}

/** 批量删除通知 */
export async function batchDeleteNotifications(ids: number[]): Promise<void> {
  try { return await request.delete('/notifications', { data: { ids } }) }
  catch { warn('batchDeleteNotifications') }
}
