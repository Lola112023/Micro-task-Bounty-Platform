/**
 * 任务相关 API
 * 后端未就绪时自动回退到 mock 数据，同时在控制台打印警告。
 */
import request from './index'
import type {
  TaskListParams, TaskListItem, TaskDetail,
  TaskApplication, TaskMessage, TaskCategory, PageResult,
} from '@/types/task'
import {
  MOCK_TASK_LIST, MOCK_TASK_DETAIL, MOCK_CATEGORIES, emptyPage,
} from './mock'

function warn(fn: string) {
  console.warn(`[Mock] ${fn} — 后端未就绪，返回 mock 数据`)
}

/** 获取任务分类列表 */
export async function getCategories(): Promise<TaskCategory[]> {
  try { return await request.get('/public/categories') }
  catch { warn('getCategories'); return MOCK_CATEGORIES }
}

/** 获取任务列表（任务大厅） */
export async function getTasks(params: TaskListParams): Promise<PageResult<TaskListItem>> {
  try {
    const { categoryIds, pageSize, publishedAfter, sortBy, ...rest } = params
    const mapped: Record<string, unknown> = { ...rest }
    if (categoryIds?.length) mapped.categoryId = categoryIds
    if (pageSize) mapped.size = pageSize
    if (publishedAfter) mapped.startDate = publishedAfter
    if (sortBy) mapped.sortBy = sortBy === 'remainingTime' ? 'time' : sortBy
    return await request.get('/tasks', { params: mapped })
  }
  catch {
    warn('getTasks')
    return { total: MOCK_TASK_LIST.length, page: 1, pageSize: 12, list: MOCK_TASK_LIST }
  }
}

/** 获取推荐任务（接单者视角） */
export async function getRecommendedTasks(): Promise<TaskListItem[]> {
  try { return await request.get('/tasks/recommended') }
  catch { warn('getRecommendedTasks'); return MOCK_TASK_LIST.slice(0, 3) }
}

/** 获取任务详情 */
export async function getTaskDetail(taskId: number): Promise<TaskDetail> {
  try { return await request.get(`/tasks/${taskId}`) }
  catch { warn('getTaskDetail'); return { ...MOCK_TASK_DETAIL, id: taskId } }
}

/** 发布任务 */
export async function publishTask(formData: FormData): Promise<TaskDetail> {
  return request.post('/tasks', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

/** 编辑任务 */
export async function editTask(taskId: number, formData: FormData): Promise<TaskDetail> {
  return request.put(`/tasks/${taskId}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

/** 下架任务 */
export async function removeTask(taskId: number): Promise<void> {
  return request.delete(`/tasks/${taskId}`)
}

/** 申请接单 */
export async function applyTask(taskId: number, reason: string): Promise<void> {
  return request.post(`/tasks/${taskId}/apply`, { reason })
}

/** 获取任务申请列表 */
export async function getTaskApplications(taskId: number): Promise<TaskApplication[]> {
  try { return await request.get(`/tasks/${taskId}/applications`) }
  catch { warn('getTaskApplications'); return [] }
}

/** 选择中标者 */
export async function selectWinner(taskId: number, applicationId: number): Promise<void> {
  return request.post(`/tasks/${taskId}/applications/${applicationId}/award`)
}

/** 提交交付物 */
export async function deliverTask(taskId: number, formData: FormData): Promise<void> {
  return request.post(`/tasks/${taskId}/deliver`, formData, { headers: { 'Content-Type': 'multipart/form-data' } })
}

/** 确认完成 */
export async function confirmTask(taskId: number): Promise<void> {
  return request.post(`/tasks/${taskId}/confirm`)
}

/** 退回修改 */
export async function rejectDelivery(taskId: number, reason?: string): Promise<void> {
  return request.post(`/tasks/${taskId}/reject`, { reason })
}

/** 强制取消 */
export async function forceCancel(taskId: number): Promise<void> {
  return request.post(`/tasks/${taskId}/force-cancel`)
}

/** 接单者申请取消 */
export async function requestCancel(taskId: number, reason: string): Promise<void> {
  return request.post(`/tasks/${taskId}/request-cancel`, { reason })
}

/** 发布者处理取消申请 */
export async function handleCancelRequest(taskId: number, agree: boolean): Promise<void> {
  return request.post(`/tasks/${taskId}/handle-cancel`, { agree })
}

/** 延长截止时间 */
export async function extendDeadline(taskId: number): Promise<void> {
  return request.put(`/tasks/${taskId}/extend`)
}

/** 发起申诉 */
export async function appealTask(taskId: number, reason: string, formData?: FormData): Promise<void> {
  const data = formData || new FormData()
  data.append('reason', reason)
  return request.post(`/tasks/${taskId}/appeal`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
}

/** 评价任务 */
export async function evaluateTask(taskId: number, stars: number, comment?: string): Promise<void> {
  return request.post(`/tasks/${taskId}/evaluate`, { stars, comment })
}

/** 举报任务 */
export async function reportTask(taskId: number, type: string, evidence: string): Promise<void> {
  return request.post(`/tasks/${taskId}/report`, { type, evidence })
}

/** 获取留言列表 */
export async function getMessages(taskId: number): Promise<TaskMessage[]> {
  try { return await request.get(`/tasks/${taskId}/messages`) }
  catch { warn('getMessages'); return [] }
}

/** 发送留言 */
export async function sendMessage(taskId: number, content: string): Promise<TaskMessage> {
  return request.post(`/tasks/${taskId}/messages`, { content })
}

/** 我发布的任务 */
export async function getMyPublishedTasks(params: {
  status?: string; page?: number; pageSize?: number
}): Promise<PageResult<TaskListItem>> {
  try {
    const { pageSize, ...rest } = params
    return await request.get('/my/tasks', { params: { ...rest, size: pageSize || 10 } })
  }
  catch { warn('getMyPublishedTasks'); return emptyPage() }
}

/** 我承接的任务 */
export async function getMyAcceptedTasks(params: {
  status?: string; page?: number; pageSize?: number
}): Promise<PageResult<TaskListItem>> {
  try { return await request.get('/tasks/my/accepted', { params }) }
  catch { warn('getMyAcceptedTasks'); return emptyPage() }
}

/** 我的申请记录 */
export async function getMyApplications(params: {
  status?: string; page?: number; pageSize?: number
}): Promise<PageResult<TaskApplication>> {
  try {
    const { pageSize, ...rest } = params
    return await request.get('/my/applications', { params: { ...rest, size: pageSize || 10 } })
  }
  catch { warn('getMyApplications'); return emptyPage() }
}

/** 举报用户 */
export async function reportUser(userId: number, type: string, evidence: string): Promise<void> {
  return request.post(`/users/${userId}/report`, { type, evidence })
}
