/**
 * 认证相关 API
 * 后端接口占位，待实现
 */
import request from './index'
import type { LoginResult, AdminLoginResult } from '@/types/auth'

/** 获取 BIT OAuth2.0 跳转地址 */
export function getOAuthRedirectUrl(): Promise<{ url: string }> {
  return request.get('/auth/oauth/redirect')
}

/** OAuth 回调：用授权码换取平台 Token */
export function handleOAuthCallback(code: string): Promise<LoginResult> {
  return request.post('/auth/oauth/callback', { code })
}

/** 管理员账号密码登录 */
export function adminLogin(username: string, password: string): Promise<AdminLoginResult> {
  return request.post('/admin/auth/login', { username, password })
}

/** 退出登录 */
export function logout(): Promise<void> {
  return request.post('/auth/logout')
}
