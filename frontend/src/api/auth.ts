import request from './index'
import type { LoginResult, AdminLoginResult } from '@/types/auth'

/** 用户注册 */
export function register(data: {
  username: string
  password: string
  confirmPassword: string
  nickname: string
  realName: string
  studentNo: string
  grade: string
  college: string
  academy: string
}): Promise<LoginResult> {
  return request.post('/auth/register', data)
}

/** 用户登录 */
export function login(username: string, password: string): Promise<LoginResult> {
  return request.post('/auth/login', { username, password })
}

/** 管理员登录 */
export function adminLogin(username: string, password: string): Promise<AdminLoginResult> {
  return request.post('/admin/auth/login', { username, password })
}

/** 退出登录 */
export function logout(): Promise<void> {
  return request.post('/auth/logout')
}
