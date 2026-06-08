/**
 * 积分/财务相关 API
 * 后端接口占位，待实现
 */
import request from './index'
import type { RechargeParams, WithdrawParams } from '@/types/finance'

/** 发起充值 */
export function recharge(params: RechargeParams): Promise<{ payUrl: string; orderId: string }> {
  return request.post('/finance/recharge', params)
}

/** 发起提现 */
export function withdraw(params: WithdrawParams): Promise<{ withdrawId: string }> {
  return request.post('/finance/withdraw', params)
}

/** 查询充值订单状态 */
export function getRechargeStatus(orderId: string): Promise<{ status: 'pending' | 'success' | 'failed' }> {
  return request.get(`/finance/recharge/${orderId}/status`)
}
