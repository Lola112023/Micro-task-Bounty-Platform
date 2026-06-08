import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.extend(duration)
dayjs.locale('zh-cn')

/** 格式化日期时间 */
export function formatDateTime(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

export function formatDate(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD')
}

export function formatDateTimeSec(date: string | Date): string {
  return dayjs(date).format('YYYY-MM-DD HH:mm:ss')
}

/** 计算距离某个时间的剩余时长（返回可读字符串） */
export function formatRemainingTime(deadline: string): string {
  const diff = dayjs(deadline).diff(dayjs(), 'second')
  if (diff <= 0) return '已超时'
  const d = Math.floor(diff / 86400)
  const h = Math.floor((diff % 86400) / 3600)
  const m = Math.floor((diff % 3600) / 60)
  if (d > 0) return `${d}天${h}小时`
  if (h > 0) return `${h}小时${m}分钟`
  return `${m}分钟`
}

/** 积分状态标签映射 */
export const TASK_STATUS_LABEL: Record<string, string> = {
  PUBLISHING: '发布中',
  IN_PROGRESS: '进行中',
  PENDING_CONFIRM: '待确认',
  COMPLETED: '已完成',
  CANCELLED: '已取消',
  APPEALING: '申诉中',
}

export const TASK_STATUS_TYPE: Record<string, string> = {
  PUBLISHING: 'primary',
  IN_PROGRESS: 'success',
  PENDING_CONFIRM: 'warning',
  COMPLETED: 'info',
  CANCELLED: 'danger',
  APPEALING: 'warning',
}

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: '审核中',
  SELECTED: '已中标',
  REJECTED: '已落选',
  CANCELLED: '已取消',
}

export const FINANCE_TYPE_LABEL: Record<string, string> = {
  RECHARGE: '充值',
  TASK_INCOME: '任务收入',
  TASK_EXPENSE: '任务支出',
  WITHDRAW: '提现',
  FROZEN: '冻结',
  UNFROZEN: '解冻',
  SYSTEM_ADJUST: '系统调整',
}

/** 信用分颜色 */
export function creditScoreColor(score: number): string {
  if (score >= 80) return '#52c41a'
  if (score >= 60) return '#faad14'
  if (score >= 40) return '#fa8c16'
  return '#ff4d4f'
}

/** 积分换算为人民币 */
export function pointsToYuan(points: number): string {
  return (points / 10).toFixed(2)
}

/** 人民币换算为积分 */
export function yuanToPoints(yuan: number): number {
  return Math.floor(yuan * 10)
}

/** 计算提现手续费（向上取整 2%） */
export function calcWithdrawFee(points: number, feeRate = 0.02): number {
  return Math.ceil(points * feeRate)
}

/** 字符数计算（中文/英文/数字/符号均算1字） */
export function charCount(str: string): number {
  return str.length
}
