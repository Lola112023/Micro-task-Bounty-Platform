export type TaskStatus =
  | 'PUBLISHING'       // 发布中
  | 'IN_PROGRESS'      // 进行中
  | 'PENDING_CONFIRM'  // 待确认
  | 'COMPLETED'        // 已完成
  | 'CANCELLED'        // 已取消
  | 'APPEALING'        // 申诉中

export type Campus = '良乡校区' | '中关村校区' | '两校区往返'

export interface TaskCategory {
  id: number
  name: string
  sortWeight: number
  enabled: boolean
  taskCount?: number
}

export interface TaskListItem {
  id: number
  title: string
  categoryId: number
  categoryName: string
  campus: Campus
  reward: number           // 报酬积分
  status: TaskStatus
  publisherId: number
  publisherNickname: string
  publisherCreditScore: number
  remainingListTime: string | null   // 剩余上架时间（发布中）
  deadlineAt: string | null          // 截止时间（进行中）
  publishedAt: string
}

export interface TaskDetail extends TaskListItem {
  description: string
  durationMinutes: number    // 截止时长（分钟）
  listDays: number           // 上架天数
  attachments: TaskAttachment[]
  publisherAnnouncement: string | null
  publisherCompletionRate: number | null
  winnerId: number | null
  winnerNickname: string | null
  applicationCount: number
  extendCount: number        // 已延长次数
  appealReason: string | null
  appealResult: string | null
  deliveryText: string | null
  deliveryAttachments: TaskAttachment[]
  myApplicationStatus: ApplicationStatus | null  // 当前用户的申请状态
  canApply: boolean          // 是否可申请接单
  canApplyReason: string | null  // 不可申请原因
}

export interface TaskAttachment {
  id: number
  filename: string
  url: string
  size: number
}

export type ApplicationStatus = 'REVIEWING' | 'AWARDED' | 'REJECTED' | 'CANCELLED'

export interface TaskApplication {
  id: number
  taskId: number
  applicantId: number
  applicantNickname: string
  applicantCreditScore: number
  applicantAnnouncement: string | null
  applicantCompletionRate: number | null
  reason: string
  status: ApplicationStatus
  appliedAt: string
}

export interface TaskMessage {
  id: number
  taskId: number
  senderId: number
  senderNickname: string
  content: string
  sentAt: string
}

export interface TaskListParams {
  keyword?: string
  categoryIds?: number[]
  minReward?: number
  maxReward?: number
  publishedAfter?: string
  sortBy?: 'remainingTime' | 'reward'
  page?: number
  pageSize?: number
}

export interface PageResult<T> {
  total: number
  page: number
  pageSize: number
  list: T[]
}
