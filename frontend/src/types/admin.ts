export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  onlineUsers: number
  totalTasks: number
  inProgressTasks: number
  pendingConfirmTasks: number
  overdueTasks: number
  pendingNicknameAudits: number
  pendingAnnouncementAudits: number
  pendingAppeals: number
  pendingReports: number
}

export interface AdminUser {
  id: number
  studentNo: string
  nickname: string
  realName: string | null
  creditScore: number
  accountStatus: string
  role: string
  createdAt: string
  lastLoginTime: string | null
  graduationFreezeCount: number | null
  creditResetUsed: boolean | null
}

export interface AdminTask {
  id: number
  title: string
  publisherNickname: string
  publisherId: number
  status: string
  reward: number
  publishedAt: string
  stayDuration: string   // 停留时长
}

export interface AdminReviewItem {
  id: number
  auditType: string       // 'AVATAR' | 'NICKNAME' | 'ANNOUNCEMENT'
  applicantId: number
  applicantNickname: string
  oldValue: string | null
  newValue: string
  submittedAt: string
  status: string           // 'PENDING' | 'APPROVED' | 'REJECTED' | 'TIMEOUT_REJECTED'
  rejectReason: string | null
  processedAt: string | null
}

export interface AdminReportItem {
  id: number
  targetType: string      // 'TASK' | 'USER' | 'DELIVERY'
  targetId: number
  reporterId: number
  reportType: string       // 'PORN' | 'VIOLENCE' | 'FRAUD' | 'OTHER'
  evidence: string | null
  status: string           // 'PENDING' | 'APPROVED' | 'REJECTED'
  adminNote: string | null
  penaltyDays: number | null
  creditPenalty: number | null
  processedAt: string | null
  createdAt: string
}

export interface AdminAppealItem {
  id: number
  taskId: number
  appealerId: number
  reason: string
  status: string           // 'PENDING' | 'RESOLVED'
  adminDecision: string | null  // 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS'
  adminId: number | null
  adminNote: string | null
  resolvedAt: string | null
  createdAt: string
}

export interface SystemConfig {
  // 信用分规则
  completionRateBonus: number
  completionRateBonusThreshold: number
  completionRatePenalty: number
  completionRatePenaltyThreshold: number
  goodRateBonus: number
  goodRateBonusThreshold: number
  goodRatePenalty: number
  goodRatePenaltyThreshold: number
  timeoutPenalty: number
  giveupPenalty: number
  publisherCancelPenalty: number
  creditRiskThreshold: number
  creditLimitThreshold: number
  // 积分提现
  rechargeMinAmount: number
  rechargeDailyLimit: number
  withdrawMinPoints: number
  withdrawDailyLimit: number
  withdrawFeeRate: number
  // 超时配置
  autocancelDays: number
  timeoutReminderHours: number
  extendRatio: number
  maxExtendCount: number
  // 附件
  taskAttachmentMaxMb: number
  deliveryAttachmentMaxMb: number
  deliveryKeepDays: number
  // 同步
  syncCron: string
}
