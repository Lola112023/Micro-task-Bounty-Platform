export type FinanceType =
  | 'RECHARGE'       // 充值
  | 'TASK_INCOME'    // 任务收入
  | 'TASK_EXPENSE'   // 任务支出（冻结）
  | 'WITHDRAW'       // 提现
  | 'FROZEN'         // 冻结
  | 'UNFROZEN'       // 解冻
  | 'SYSTEM_ADJUST'  // 系统调整

export interface FinanceRecord {
  id: number
  type: FinanceType
  amount: number         // 变动额（正为收入，负为支出）
  balanceAfter: number   // 变动后余额
  relatedName: string    // 关联任务名称或交易号
  createdAt: string
}

export interface RechargeParams {
  amount: number         // 充值金额（元）
  payMethod: 'wechat' | 'alipay'
}

export interface WithdrawParams {
  points: number         // 提现积分
  account: string        // 提现账户（微信/支付宝）
  accountType: 'wechat' | 'alipay'
}

export interface CreditLogItem {
  id: number
  completedAt: string
  taskCategory: string
  publisherStars: number
  takerStars: number
  publisherComment: string | null
  creditChange: number
}
