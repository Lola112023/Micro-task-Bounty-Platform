export interface UserInfo {
  id: number
  studentId: string       // 学号/工号
  name: string            // 姓名（学校系统绑定）
  nickname: string        // 昵称
  avatarUrl: string       // 头像URL
  grade: string | null    // 年级（可能为空）
  college: string | null  // 学院（可能为空）
  academy: string | null  // 书院（可能为空）
  creditScore: number     // 信用分
  completionRate: number | null  // 完成率（无承接任务时null）
  points: number          // 当前积分余额
  totalIncome: number     // 累计收入
  totalExpense: number    // 累计支出
  announcement: string | null   // 公告栏
  accountStatus: 'normal' | 'frozen'  // 账户状态
  viewMode: 'publisher' | 'taker'     // 视角模式（本地持久化）
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
