/**
 * 开发模式 Mock 数据
 * 后端未就绪时，API 调用失败后返回这里的默认值，让页面正常渲染。
 * 正式上线后此文件不会被调用（后端返回真实数据）。
 */

import type { UserInfo } from '@/types/auth'
import type { TaskListItem, TaskDetail, TaskCategory, PageResult } from '@/types/task'
import type { NotificationItem } from '@/types/notification'
import type { FinanceRecord, CreditLogItem } from '@/types/finance'
import type { EvaluationItem } from '@/types/user'
import type { NotificationSettings } from '@/types/notification'

// ── 当前登录用户 ─────────────────────────────────────────────────────────────
export const MOCK_USER: UserInfo = {
  id: 1,
  username: 'testuser',
  studentNo: '1120200001',
  realName: '测试用户',
  name: '测试用户',
  nickname: 'TestUser',
  avatarUrl: '',
  grade: '2020级',
  college: '计算机学院',
  academy: '知行书院',
  creditScore: 85,
  completionRate: 0.92,
  points: 520,
  totalIncome: 1200,
  totalExpense: 680,
  announcement: '诚信交易，非诚勿扰',
  accountStatus: 'normal',
  viewMode: 'publisher',
}

// ── 任务分类 ──────────────────────────────────────────────────────────────────
export const MOCK_CATEGORIES: TaskCategory[] = [
  { id: 1, name: '跑腿代办', sortWeight: 1, enabled: true, taskCount: 42 },
  { id: 2, name: '设计', sortWeight: 2, enabled: true, taskCount: 18 },
  { id: 3, name: '编程', sortWeight: 3, enabled: true, taskCount: 27 },
  { id: 4, name: '文案', sortWeight: 4, enabled: true, taskCount: 11 },
  { id: 5, name: '其他', sortWeight: 5, enabled: true, taskCount: 9 },
]

// ── 任务列表（任务大厅） ──────────────────────────────────────────────────────
export const MOCK_TASK_LIST: TaskListItem[] = [
  {
    id: 1,
    title: '帮忙取快递',
    categoryId: 1,
    categoryName: '跑腿代办',
    campus: '良乡校区',
    reward: 50,
    status: 'PUBLISHING',
    publisherId: 2,
    publisherNickname: '李明',
    publisherCreditScore: 85,
    remainingListTime: '2天5小时',
    deadlineAt: null,
    publishedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 2,
    title: 'PS修图 - 证件照美化',
    categoryId: 2,
    categoryName: '设计',
    campus: '两校区往返',
    reward: 80,
    status: 'PUBLISHING',
    publisherId: 3,
    publisherNickname: '王芳',
    publisherCreditScore: 90,
    remainingListTime: '1天12小时',
    deadlineAt: null,
    publishedAt: new Date(Date.now() - 43200000).toISOString(),
  },
  {
    id: 3,
    title: 'Python数据分析',
    categoryId: 3,
    categoryName: '编程',
    campus: '中关村校区',
    reward: 200,
    status: 'PUBLISHING',
    publisherId: 4,
    publisherNickname: '赵强',
    publisherCreditScore: 78,
    remainingListTime: '5天8小时',
    deadlineAt: null,
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 4,
    title: 'PPT制作 - 课程汇报',
    categoryId: 2,
    categoryName: '设计',
    campus: '良乡校区',
    reward: 150,
    status: 'PUBLISHING',
    publisherId: 5,
    publisherNickname: '陈晓',
    publisherCreditScore: 82,
    remainingListTime: '3天',
    deadlineAt: null,
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 5,
    title: '文案撰写 - 推文排版',
    categoryId: 4,
    categoryName: '文案',
    campus: '良乡校区',
    reward: 100,
    status: 'PUBLISHING',
    publisherId: 6,
    publisherNickname: '孙磊',
    publisherCreditScore: 76,
    remainingListTime: '4天',
    deadlineAt: null,
    publishedAt: new Date(Date.now() - 1800000).toISOString(),
  },
]

// ── 任务详情 ──────────────────────────────────────────────────────────────────
export const MOCK_TASK_DETAIL: TaskDetail = {
  id: 1,
  title: '帮忙取快递',
  categoryId: 1,
  categoryName: '跑腿代办',
  campus: '良乡校区',
  reward: 50,
  status: 'PUBLISHING',
  publisherId: 2,
  publisherNickname: '李明',
  publisherCreditScore: 85,
  publisherCompletionRate: 0.92,
  publisherAnnouncement: '诚信交易，非诚勿扰',
  remainingListTime: '2天5小时',
  deadlineAt: null,
  publishedAt: new Date(Date.now() - 86400000).toISOString(),
  description:
    '需要从良乡校区南门菜鸟驿站取一个包裹，送到知行书院宿舍楼。包裹不大，约1kg。请带上学生证，取件码会私信发送。',
  durationMinutes: 2880,
  listDays: 7,
  attachments: [],
  winnerId: null,
  winnerNickname: null,
  applicationCount: 3,
  extendCount: 0,
  appealReason: null,
  appealResult: null,
  deliveryText: null,
  deliveryAttachments: [],
  myApplicationStatus: null,
  canApply: true,
  canApplyReason: null,
}

// ── 通知 ──────────────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 1,
    type: 'TASK_SELECTED',
    title: '🎉 任务中标通知',
    content: '您已成功中标任务"帮忙取快递"，请尽快与发布者联系',
    isRead: false,
    targetUrl: '/task/1',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 2,
    type: 'TASK_TIMEOUT',
    title: '⏰ 超时提醒',
    content: '任务"PS修图"将在2小时后截止，请尽快完成',
    isRead: false,
    targetUrl: '/task/2',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 3,
    type: 'SYSTEM',
    title: '📢 系统公告',
    content: '平台将于本周日20:00进行维护升级，预计持续2小时',
    isRead: true,
    targetUrl: null,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
]

// ── 收支明细 ──────────────────────────────────────────────────────────────────
export const MOCK_FINANCE_RECORDS: PageResult<FinanceRecord> = {
  total: 3,
  page: 1,
  pageSize: 20,
  list: [
    { id: 1, type: 'TASK_INCOME', amount: 50, balanceAfter: 520, relatedName: '帮忙取快递', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 2, type: 'RECHARGE', amount: 500, balanceAfter: 470, relatedName: 'WX20240114001', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 3, type: 'TASK_EXPENSE', amount: -200, balanceAfter: -30, relatedName: 'Python数据分析', createdAt: new Date(Date.now() - 172800000).toISOString() },
  ],
}

// ── 信用分明细 ────────────────────────────────────────────────────────────────
export const MOCK_CREDIT_LOGS: PageResult<CreditLogItem> = {
  total: 2,
  page: 1,
  pageSize: 15,
  list: [
    { id: 1, completedAt: new Date(Date.now() - 86400000).toISOString(), taskCategory: '跑腿代办', publisherStars: 5, takerStars: 5, publisherComment: '非常准时，态度很好', creditChange: 5 },
    { id: 2, completedAt: new Date(Date.now() - 172800000).toISOString(), taskCategory: '编程', publisherStars: 4, takerStars: 5, publisherComment: '代码质量很高', creditChange: 3 },
  ],
}

// ── 评价记录 ──────────────────────────────────────────────────────────────────
export const MOCK_EVALUATIONS: PageResult<EvaluationItem> = {
  total: 2,
  page: 1,
  pageSize: 10,
  list: [
    { id: 1, evaluatorNickname: '李明', evaluatorAvatarUrl: '', taskId: 1, taskTitle: '帮忙取快递', stars: 5, comment: '非常准时，态度很好，下次还找你！', evaluatedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, evaluatorNickname: '王芳', evaluatorAvatarUrl: '', taskId: 2, taskTitle: 'Python数据分析', stars: 4, comment: '代码质量很高，就是交付稍微晚了一点', evaluatedAt: new Date(Date.now() - 172800000).toISOString() },
  ],
}

// ── 通知设置 ──────────────────────────────────────────────────────────────────
export const MOCK_NOTIF_SETTINGS: NotificationSettings = {
  taskSelected: true,
  taskRejected: true,
  taskTimeout: true,
  creditChange: true,
  reviewResult: true,
  systemAnnouncement: true,
  evaluation: true,
}

// ── 通用空分页结果 ────────────────────────────────────────────────────────────
export function emptyPage<T>(): PageResult<T> {
  return { total: 0, page: 1, pageSize: 20, list: [] }
}
