/**
 * 管理员相关 API
 * 后端接口占位，待实现
 */
import request from './index'
import type {
  DashboardStats,
  AdminUser,
  AdminTask,
  AdminReviewItem,
  AdminReportItem,
  AdminAppealItem,
  SystemConfig,
  AdminFinanceRecord,
} from '@/types/admin'
import type { TaskCategory } from '@/types/task'
import type { PageResult } from '@/types/task'

// ─── 仪表盘 ───────────────────────────────────────────────────────────────────
export function getDashboardStats(): Promise<DashboardStats> {
  return request.get('/admin/dashboard')
}

// ─── 用户管理 ─────────────────────────────────────────────────────────────────
export function getAdminUsers(params: {
  keyword?: string
  status?: string
  creditRange?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminUser>> {
  return request.get('/admin/users', { params })
}

export function getAdminUserDetail(userId: number): Promise<AdminUser> {
  return request.get(`/admin/users/${userId}`)
}

export function freezeUser(userId: number, reason: string): Promise<void> {
  return request.post(`/admin/users/${userId}/freeze`, { reason })
}

export function unfreezeUser(userId: number): Promise<void> {
  return request.post(`/admin/users/${userId}/unfreeze`)
}

export function resetCreditScore(userId: number, reason: string): Promise<void> {
  return request.post(`/admin/users/${userId}/credit-reset`, { reason })
}

export function getUserOperationLog(userId: number, params: {
  page?: number
  pageSize?: number
}): Promise<PageResult<{ action: string; detail: string; ip: string; createdAt: string }>> {
  return request.get(`/admin/users/${userId}/logs`, { params })
}

export function batchFreezeGraduated(userIds: number[]): Promise<void> {
  return request.post('/admin/users/batch-freeze', { userIds })
}

export function delayFreezeUser(userId: number, days: number): Promise<void> {
  return request.post(`/admin/users/${userId}/delay-freeze`, { days })
}

// ─── 任务管理 ─────────────────────────────────────────────────────────────────
export function getAdminTasks(params: {
  keyword?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminTask>> {
  return request.get('/admin/tasks', { params })
}

export function forceRemoveTask(taskId: number, reason: string): Promise<void> {
  return request.post(`/admin/tasks/${taskId}/force-remove`, { reason })
}

// ─── 审核管理 ─────────────────────────────────────────────────────────────────
export function getReviewList(params: {
  type?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminReviewItem>> {
  return request.get('/admin/reviews', { params })
}

export function approveReview(reviewId: number): Promise<void> {
  return request.post(`/admin/reviews/${reviewId}/approve`)
}

export function rejectReview(reviewId: number, reason: string): Promise<void> {
  return request.post(`/admin/reviews/${reviewId}/reject`, { reason })
}

// ─── 举报处理 ─────────────────────────────────────────────────────────────────
export function getReportList(params: {
  status?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminReportItem>> {
  return request.get('/admin/reports', { params })
}

export function verifyReport(reportId: number, freezeDays: number, creditDeduct: number): Promise<void> {
  return request.post(`/admin/reports/${reportId}/verify`, { freezeDays, creditDeduct })
}

export function rejectReport(reportId: number): Promise<void> {
  return request.post(`/admin/reports/${reportId}/reject`)
}

// ─── 申诉处理 ─────────────────────────────────────────────────────────────────
export function getAppealList(params: {
  status?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminAppealItem>> {
  return request.get('/admin/appeals', { params })
}

export function judgeAppealComplete(appealId: number, opinion: string): Promise<void> {
  return request.post(`/admin/appeals/${appealId}/complete`, { opinion })
}

export function judgeAppealCancel(appealId: number, opinion: string): Promise<void> {
  return request.post(`/admin/appeals/${appealId}/cancel`, { opinion })
}

export function judgeAppealContinue(appealId: number, opinion: string): Promise<void> {
  return request.post(`/admin/appeals/${appealId}/continue`, { opinion })
}

// ─── 系统配置 ─────────────────────────────────────────────────────────────────
export function getSystemConfig(): Promise<SystemConfig> {
  return request.get('/admin/settings')
}

export function saveSystemConfig(config: Partial<SystemConfig>): Promise<void> {
  return request.put('/admin/settings', config)
}

// ─── 财务审计 ─────────────────────────────────────────────────────────────────
export function getRechargeRecords(params: {
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminFinanceRecord>> {
  return request.get('/admin/finance/recharges', { params })
}

export function getWithdrawRecords(params: {
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminFinanceRecord>> {
  return request.get('/admin/finance/withdrawals', { params })
}

export function markWithdrawPaid(withdrawId: string): Promise<void> {
  return request.post(`/admin/finance/withdrawals/${withdrawId}/paid`)
}

export function rejectWithdraw(withdrawId: string, reason: string): Promise<void> {
  return request.post(`/admin/finance/withdrawals/${withdrawId}/reject`, { reason })
}

export function getPlatformFlow(params: {
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminFinanceRecord>> {
  return request.get('/admin/finance/platform-flow', { params })
}

export function getAnomalyRecords(params: {
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminFinanceRecord>> {
  return request.get('/admin/finance/anomalies', { params })
}

export function exportFinance(type: string, params: object): Promise<Blob> {
  return request.get(`/admin/finance/${type}/export`, { params, responseType: 'blob' })
}

// ─── 消息广播 ─────────────────────────────────────────────────────────────────
export function sendBroadcast(data: {
  title: string
  content: string
  targetScope: 'all' | 'publisher' | 'taker' | 'specific'
  targetIds?: string[]
  strongAlert: boolean
  scheduledAt?: string
}): Promise<void> {
  return request.post('/admin/broadcast', data)
}

export function getBroadcastHistory(params: {
  page?: number
  pageSize?: number
}): Promise<PageResult<{
  id: number
  title: string
  targetScope: string
  sentAt: string
  readCount: number
}>> {
  return request.get('/admin/broadcast/history', { params })
}

// ─── 分类管理 ─────────────────────────────────────────────────────────────────
export function getAdminCategories(): Promise<TaskCategory[]> {
  return request.get('/admin/categories')
}

export function createCategory(data: { name: string; sortWeight: number }): Promise<TaskCategory> {
  return request.post('/admin/categories', data)
}

export function updateCategory(id: number, data: Partial<TaskCategory>): Promise<TaskCategory> {
  return request.put(`/admin/categories/${id}`, data)
}

export function deleteCategory(id: number): Promise<void> {
  return request.delete(`/admin/categories/${id}`)
}

export function migrateTasksCategory(fromId: number, toId: number): Promise<void> {
  return request.post('/admin/categories/migrate', { fromId, toId })
}

export function toggleCategoryStatus(id: number, enabled: boolean): Promise<void> {
  return request.put(`/admin/categories/${id}/status`, { enabled })
}
