export type NotificationType =
  | 'TASK_AWARDED'
  | 'TASK_REJECTED'
  | 'TASK_CANCELLED'
  | 'TASK_COMPLETED'
  | 'DELIVERY_SUBMITTED'
  | 'DELIVERY_REJECTED'
  | 'REVIEW_REQUEST'
  | 'REPORT_RESULT'
  | 'APPEAL_RESULT'
  | 'SYSTEM_BROADCAST'
  | 'SYSTEM_NOTICE'
  | 'TASK_UPDATE'
  | 'CREDIT_CHANGE'
  | 'FREEZE_NOTICE'
  | 'REMINDER'
  | 'NICKNAME_APPROVED'
  | 'NICKNAME_REJECTED'
  | 'AVATAR_APPROVED'
  | 'AVATAR_REJECTED'
  | 'ANNOUNCEMENT_APPROVED'
  | 'ANNOUNCEMENT_REJECTED'
  | 'OVERDUE_WARNING'

export interface NotificationItem {
  id: number
  type: NotificationType
  title: string
  content: string
  isRead: boolean
  targetUrl: string | null
  createdAt: string
}

export interface NotificationSettings {
  taskSelected: boolean
  taskRejected: boolean
  taskTimeout: boolean
  creditChange: boolean
  reviewResult: boolean
  systemAnnouncement: boolean
  evaluation: boolean
}

export const NOTIFICATION_TYPE_LABEL: Record<NotificationType, string> = {
  TASK_AWARDED: '任务中标',
  TASK_REJECTED: '任务落选',
  TASK_CANCELLED: '任务取消',
  TASK_COMPLETED: '任务完成',
  DELIVERY_SUBMITTED: '交付物提交',
  DELIVERY_REJECTED: '交付物退回',
  REVIEW_REQUEST: '评价邀请',
  REPORT_RESULT: '举报结果',
  APPEAL_RESULT: '申诉结果',
  SYSTEM_BROADCAST: '系统公告',
  SYSTEM_NOTICE: '系统通知',
  TASK_UPDATE: '任务更新',
  CREDIT_CHANGE: '信用分变更',
  FREEZE_NOTICE: '账户冻结',
  REMINDER: '任务提醒',
  NICKNAME_APPROVED: '昵称审核通过',
  NICKNAME_REJECTED: '昵称审核拒绝',
  AVATAR_APPROVED: '头像审核通过',
  AVATAR_REJECTED: '头像审核拒绝',
  ANNOUNCEMENT_APPROVED: '公告审核通过',
  ANNOUNCEMENT_REJECTED: '公告审核拒绝',
  OVERDUE_WARNING: '超时提醒',
}

export const NOTIFICATION_TYPE_COLOR: Record<NotificationType, string> = {
  TASK_AWARDED: '#52c41a',
  TASK_REJECTED: '#ff4d4f',
  TASK_CANCELLED: '#ff4d4f',
  TASK_COMPLETED: '#52c41a',
  DELIVERY_SUBMITTED: '#1890ff',
  DELIVERY_REJECTED: '#fa8c16',
  REVIEW_REQUEST: '#722ed1',
  REPORT_RESULT: '#ff4d4f',
  APPEAL_RESULT: '#fa8c16',
  SYSTEM_BROADCAST: '#1890ff',
  SYSTEM_NOTICE: '#1890ff',
  TASK_UPDATE: '#13c2c2',
  CREDIT_CHANGE: '#faad14',
  FREEZE_NOTICE: '#ff4d4f',
  REMINDER: '#fa8c16',
  NICKNAME_APPROVED: '#52c41a',
  NICKNAME_REJECTED: '#ff4d4f',
  AVATAR_APPROVED: '#52c41a',
  AVATAR_REJECTED: '#ff4d4f',
  ANNOUNCEMENT_APPROVED: '#52c41a',
  ANNOUNCEMENT_REJECTED: '#ff4d4f',
  OVERDUE_WARNING: '#ff4d4f',
}

/** 通知类型分类（用于筛选下拉） */
export const NOTIFICATION_TYPE_GROUPS = [
  { label: '全部类型', value: '' },
  { label: '任务相关', value: 'TASK' },
  { label: '交付相关', value: 'DELIVERY' },
  { label: '系统公告', value: 'SYSTEM' },
  { label: '信用分', value: 'CREDIT_CHANGE' },
  { label: '审核结果', value: 'REVIEW' },
]
