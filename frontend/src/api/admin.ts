/**
 * 管理员相关 API
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
  minScore?: number
  maxScore?: number
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

export function getUserAuditLogs(userId: number, params: {
  page?: number
  pageSize?: number
}): Promise<PageResult<{ action: string; detail: string; ip: string; createdAt: string }>> {
  return request.get(`/admin/users/${userId}/audit-logs`, { params })
}

export function batchFreezeGraduated(userIds: number[]): Promise<void> {
  return request.post('/admin/users/graduated/handle', { userIds })
}

export function delayFreezeUser(userId: number, days: number): Promise<void> {
  return request.post(`/admin/users/${userId}/graduated/defer`, { days })
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

export function forceCancelTask(taskId: number, reason: string): Promise<void> {
  return request.post(`/admin/tasks/${taskId}/force-cancel`, { reason })
}

export function migrateTasksCategory(categoryId: number, targetCategoryId: number, taskIds: number[]): Promise<void> {
  return request.post('/admin/tasks/migrate-category', { categoryId, targetCategoryId, taskIds })
}

// ─── 审核管理 ─────────────────────────────────────────────────────────────────
export function getReviewList(params: {
  type?: string
  status?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminReviewItem>> {
  return request.get('/admin/review-audits', { params })
}

export function approveReview(auditId: number): Promise<void> {
  return request.post(`/admin/review-audits/${auditId}/approve`)
}

export function rejectReview(auditId: number, reason: string): Promise<void> {
  return request.post(`/admin/review-audits/${auditId}/reject`, { reason })
}

// ─── 举报处理 ─────────────────────────────────────────────────────────────────
export function getReportList(params: {
  status?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminReportItem>> {
  return request.get('/admin/reports', { params })
}

export function verifyReport(reportId: number, penaltyDays?: number, creditPenalty?: number): Promise<void> {
  return request.post(`/admin/reports/${reportId}/approve`, { penaltyDays, creditPenalty })
}

export function rejectReport(reportId: number): Promise<void> {
  return request.post(`/admin/reports/${reportId}/reject`, {})
}

export function rejectReportWithPenalty(reportId: number, penaltyDays?: number, creditPenalty?: number): Promise<void> {
  return request.post(`/admin/reports/${reportId}/reject-with-penalty`, { penaltyDays, creditPenalty })
}

// ─── 申诉处理 ─────────────────────────────────────────────────────────────────
export function getAppealList(params: {
  status?: string
  page?: number
  pageSize?: number
}): Promise<PageResult<AdminAppealItem>> {
  return request.get('/admin/appeals', { params })
}

export function processAppeal(appealId: number, decision: 'COMPLETED' | 'CANCELLED' | 'IN_PROGRESS', adminNote: string): Promise<void> {
  return request.post(`/admin/appeals/${appealId}/process`, { decision, adminNote })
}

// ─── 系统配置 ─────────────────────────────────────────────────────────────────
export async function getSystemConfig(): Promise<SystemConfig> {
  const list: Array<{ id: number; configKey: string; configValue: string; configType: string }> = await request.get('/admin/configs')
  const platformConfig = list.find((c: { configKey: string }) => c.configKey === 'platform_config')
  if (platformConfig) {
    return JSON.parse(platformConfig.configValue) as SystemConfig
  }
  // Return default empty config if none found
  return {} as SystemConfig
}

export async function updateConfig(configId: number, configValue: string): Promise<void> {
  return request.put(`/admin/configs/${configId}`, { configValue })
}

export async function saveSystemConfig(configData: SystemConfig): Promise<void> {
  const list: Array<{ id: number; configKey: string; configValue: string }> = await request.get('/admin/configs')
  const platformConfig = list.find((c: { configKey: string }) => c.configKey === 'platform_config')
  if (platformConfig) {
    return request.put(`/admin/configs/${platformConfig.id}`, { configValue: JSON.stringify(configData) })
  }
  throw new Error('Platform config not found')
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
  return request.post('/admin/broadcasts', data)
}

export function sendScheduledBroadcast(data: {
  title: string
  content: string
  targetScope: 'all' | 'publisher' | 'taker' | 'specific'
  targetIds?: string[]
  scheduledAt: string
}): Promise<void> {
  return request.post('/admin/broadcasts/scheduled', data)
}

// ─── 分类管理 ─────────────────────────────────────────────────────────────────
export function getAdminCategories(): Promise<TaskCategory[]> {
  return request.get('/public/categories')
}

export function createCategory(data: { name: string; sortOrder: number }): Promise<TaskCategory> {
  return request.post('/admin/categories', data)
}

export function updateCategory(id: number, data: Partial<TaskCategory>): Promise<TaskCategory> {
  return request.put(`/admin/categories/${id}`, data)
}

export function deleteCategory(id: number): Promise<void> {
  return request.delete(`/admin/categories/${id}`)
}
