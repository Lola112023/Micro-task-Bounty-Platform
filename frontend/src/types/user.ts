export interface UserPublicProfile {
  id: number
  nickname: string
  avatarUrl: string
  creditScore: number
  completionRate: number | null
  announcement: string | null
}

export interface EvaluationItem {
  id: number
  evaluatorNickname: string
  evaluatorAvatarUrl: string
  taskId: number
  taskTitle: string
  stars: number
  comment: string | null
  evaluatedAt: string
}

export interface ReviewApplication {
  id: number
  type: 'avatar' | 'nickname' | 'announcement'
  content: string        // 昵称文本 或 头像URL 或 公告栏内容
  status: 'pending' | 'approved' | 'rejected' | 'timeout'
  rejectReason: string | null
  submittedAt: string
}
