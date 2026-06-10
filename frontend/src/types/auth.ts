export interface UserInfo {
  id: number
  username: string
  studentNo?: string
  name?: string
  realName?: string
  nickname: string
  avatarUrl: string
  grade: string | null
  college: string | null
  academy: string | null
  creditScore: number
  completionRate: number | null
  points: number
  availablePoints?: number
  totalIncome: number
  totalExpense: number
  announcement: string | null
  accountStatus: 'normal' | 'frozen'
  viewMode: 'publisher' | 'taker'
}

export interface AdminInfo {
  id: number
  username: string
  role: 'admin'
}

export interface LoginResult {
  token: string
  user: UserInfo
}

export interface AdminLoginResult {
  token: string
  admin: AdminInfo
}
