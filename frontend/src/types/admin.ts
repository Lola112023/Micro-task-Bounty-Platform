export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  onlineUsers: number
  totalTasks: number
  inProgressTasks: number
  pendingConfirmTasks: number
  timeoutTasks: number
  pendingAvatarReviews: number
  pendingNicknameReviews: number
  pendingAnnouncementReviews: number
  pendingAppeals: number
  reportedTasks: number
  platformBalance: number
  weeklyWithdrawFee: number
  weeklyRechargeChart: ChartDataPoint[]
  weeklyWithdrawChart: ChartDataPoint[]
}

export interface ChartDataPoint {
  date: string
  value: number
}

export interface AdminUser {
  id: number
  studentId: string
  name: string
  nickname: string
  avatarUrl: string
  creditScore: number
  accountStatus: 'normal' | 'frozen' | 'pending_freeze'
  registeredAt: string
  lastLoginIp: string
  grade: string | null
  college: string | null
  academy: string | null
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
  type: 'avatar' | 'nickname' | 'announcement'
  applicantId: number
  applicantNickname: string
  content: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected' | 'timeout'
}

export interface AdminReportItem {
  id: number
  taskId: number
  taskTitle: string
  reporterId: number
  reporterNickname: string | null
  reportType: 'porn' | 'violence' | 'fraud' | 'other'
  reason: string
  status: 'pending' | 'verified' | 'rejected'
  reportedAt: string
}

export interface AdminAppealItem {
  id: number
  taskId: number
  taskTitle: string
  appellantId: number
  appellantNickname: string
  respondentId: number
  respondentNickname: string
  reason: string
  respondentReply: string | null
  status: 'pending' | 'completed' | 'cancelled' | 'continue'
  submittedAt: string
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

export interface AdminFinanceRecord {
  id: string
  userId: number
  userNickname: string
  amount: number
  payMethod?: string
  status: string
  createdAt: string
  fee?: number
  withdrawPoints?: number
  actualAmount?: number
}
