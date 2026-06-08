/**
 * 用户相关 API
 * 后端未就绪时自动回退到 mock 数据，同时在控制台打印警告。
 */
import request from './index'
import type { UserInfo } from '@/types/auth'
import type { UserPublicProfile, EvaluationItem, ReviewApplication } from '@/types/user'
import type { CreditLogItem, FinanceRecord } from '@/types/finance'
import type { NotificationSettings } from '@/types/notification'
import type { PageResult } from '@/types/task'
import {
  MOCK_USER, MOCK_CREDIT_LOGS, MOCK_FINANCE_RECORDS,
  MOCK_EVALUATIONS, MOCK_NOTIF_SETTINGS, emptyPage,
} from './mock'

function warn(fn: string) {
  console.warn(`[Mock] ${fn} — 后端未就绪，返回 mock 数据`)
}

/** 获取当前用户信息 */
export async function getMyInfo(): Promise<UserInfo> {
  try { return await request.get('/users/me') }
  catch { warn('getMyInfo'); return MOCK_USER }
}

/** 获取他人公开主页 */
export async function getUserProfile(userId: number): Promise<UserPublicProfile> {
  try { return await request.get(`/users/${userId}`) }
  catch {
    warn('getUserProfile')
    return { id: userId, nickname: '用户' + userId, avatarUrl: '', creditScore: 80, completionRate: null, announcement: null }
  }
}

/** 获取他人评价列表 */
export async function getUserEvaluations(
  userId: number,
  params: { page?: number; pageSize?: number }
): Promise<PageResult<EvaluationItem>> {
  try { return await request.get(`/users/${userId}/evaluations`, { params }) }
  catch { warn('getUserEvaluations'); return emptyPage() }
}

/** 提交头像修改申请 */
export async function submitAvatarApplication(formData: FormData): Promise<ReviewApplication> {
  return request.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

/** 提交昵称修改申请 */
export async function submitNicknameApplication(nickname: string): Promise<ReviewApplication> {
  return request.post('/users/me/nickname', { nickname })
}

/** 校验昵称唯一性 */
export async function checkNicknameAvailable(nickname: string): Promise<{ available: boolean }> {
  try { return await request.get('/users/nickname/check', { params: { nickname } }) }
  catch { warn('checkNicknameAvailable'); return { available: true } }
}

/** 提交公告栏修改申请 */
export async function submitAnnouncementApplication(content: string): Promise<ReviewApplication> {
  return request.post('/users/me/announcement', { content })
}

/** 获取当前审核申请状态 */
export async function getMyReviewApplications(): Promise<ReviewApplication[]> {
  try { return await request.get('/users/me/applications') }
  catch { warn('getMyReviewApplications'); return [] }
}

/** 获取信用分明细 */
export async function getCreditLog(params: { page?: number; pageSize?: number }): Promise<PageResult<CreditLogItem>> {
  try { return await request.get('/users/me/credit-log', { params }) }
  catch { warn('getCreditLog'); return MOCK_CREDIT_LOGS }
}

/** 申请恢复信用分 */
export async function applyCreditRestore(statement: string): Promise<void> {
  return request.post('/users/me/credit-restore', { statement })
}

/** 获取收支明细 */
export async function getFinanceRecords(params: {
  type?: string; startDate?: string; endDate?: string; page?: number; pageSize?: number
}): Promise<PageResult<FinanceRecord>> {
  try { return await request.get('/users/me/finance', { params }) }
  catch { warn('getFinanceRecords'); return MOCK_FINANCE_RECORDS }
}

/** 导出收支明细（Excel） */
export async function exportFinanceRecords(): Promise<Blob> {
  return request.get('/users/me/finance/export', { responseType: 'blob' })
}

/** 获取收到的评价 */
export async function getReceivedEvaluations(params: { page?: number; pageSize?: number }): Promise<PageResult<EvaluationItem>> {
  try { return await request.get('/users/me/evaluations/received', { params }) }
  catch { warn('getReceivedEvaluations'); return MOCK_EVALUATIONS }
}

/** 获取我给出的评价 */
export async function getGivenEvaluations(params: { page?: number; pageSize?: number }): Promise<PageResult<EvaluationItem>> {
  try { return await request.get('/users/me/evaluations/given', { params }) }
  catch { warn('getGivenEvaluations'); return emptyPage() }
}

/** 获取通知设置 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  try { return await request.get('/users/me/notification-settings') }
  catch { warn('getNotificationSettings'); return { ...MOCK_NOTIF_SETTINGS } }
}

/** 更新通知设置 */
export async function updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<void> {
  try { return await request.put('/users/me/notification-settings', settings) }
  catch { warn('updateNotificationSettings') }
}
