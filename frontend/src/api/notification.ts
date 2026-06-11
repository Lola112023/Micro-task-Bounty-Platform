/**
 * 通知相关 API
 */
import request from './index'
import type { NotificationItem } from '@/types/notification'
import type { PageResult } from '@/types/task'

/** 获取通知列表 */
export async function getNotifications(params: {
  type?: string; isRead?: boolean; page?: number; pageSize?: number
}): Promise<PageResult<NotificationItem>> {
  const { pageSize, ...rest } = params
  return await request.get('/notifications', { params: { ...rest, size: pageSize || 20 } })
}

/** 获取未读通知数量 */
export async function getUnreadCount(): Promise<{ count: number }> {
  return await request.get('/notifications/unread-count')
}

/** 获取最近5条未读通知 */
export async function getRecentUnread(): Promise<NotificationItem[]> {
  return await request.get('/notifications/unread')
}

/** 标记单条通知为已读 */
export async function markAsRead(notificationId: number): Promise<void> {
  return await request.put('/notifications/read', { ids: [notificationId] })
}

/** 全部标记为已读 */
export async function markAllAsRead(): Promise<void> {
  return await request.put('/notifications/read-all')
}

/** 删除通知 */
export async function deleteNotification(notificationId: number): Promise<void> {
  return await request.delete('/notifications', { data: { ids: [notificationId] } })
}

/** 批量删除通知 */
export async function batchDeleteNotifications(ids: number[]): Promise<void> {
  return await request.delete('/notifications', { data: { ids } })
}
