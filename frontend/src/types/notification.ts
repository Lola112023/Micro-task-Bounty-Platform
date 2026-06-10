export type NotificationType =
  | 'TASK_SELECTED'       // 任务中标
  | 'TASK_REJECTED'       // 申请落选
  | 'TASK_COMPLETED'      // 任务完成
  | 'TASK_CANCELLED'      // 任务取消
  | 'TASK_DELIVERED'      // 接单者提交交付物
  | 'TASK_RETURNED'       // 发布者退回修改
  | 'TASK_APPEAL'         // 申诉状态变更
  | 'TASK_TIMEOUT'        // 超时提醒
  | 'CREDIT_CHANGE'       // 信用分变更
  | 'REVIEW_RESULT'       // 审核结果（头像/昵称/公告栏）
  | 'SYSTEM'              // 系统公告
  | 'EVALUATION'          // 收到评价
  | 'CANCEL_REQUEST'      // 接单者申请取消

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
  taskSelected: boolean     // 任务中标（不可关闭）
  taskRejected: boolean     // 申请落选（可关闭）
  taskTimeout: boolean      // 超时提醒（不可关闭）
  creditChange: boolean     // 信用分变更（不可关闭）
  reviewResult: boolean     // 审核结果
  systemAnnouncement: boolean  // 系统公告
  evaluation: boolean       // 评价通知
}
