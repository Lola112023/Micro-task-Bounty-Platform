import { describe, it, expect } from 'vitest'
import {
  formatDateTime,
  formatDate,
  creditScoreColor,
  pointsToYuan,
  yuanToPoints,
  calcWithdrawFee,
  charCount,
  TASK_STATUS_LABEL,
  FINANCE_TYPE_LABEL,
} from '@/utils/format'

describe('format', () => {
  it('formatDateTime returns formatted string', () => {
    const result = formatDateTime('2026-01-15T10:30:00')
    expect(result).toContain('2026')
    expect(result).toContain('01-15')
  })

  it('formatDate returns date only', () => {
    const result = formatDate('2026-01-15T10:30:00')
    expect(result).toBe('2026-01-15')
  })

  it('creditScoreColor returns green for >= 80', () => {
    expect(creditScoreColor(80)).toBe('#52c41a')
    expect(creditScoreColor(100)).toBe('#52c41a')
  })

  it('creditScoreColor returns red for < 40', () => {
    expect(creditScoreColor(30)).toBe('#ff4d4f')
  })

  it('pointsToYuan converts correctly', () => {
    expect(pointsToYuan(100)).toBe('10.00')
    expect(pointsToYuan(1)).toBe('0.10')
  })

  it('yuanToPoints converts correctly', () => {
    expect(yuanToPoints(10)).toBe(100)
    expect(yuanToPoints(0.1)).toBe(1)
  })

  it('calcWithdrawFee calculates 2% fee rounded up', () => {
    expect(calcWithdrawFee(100, 0.02)).toBe(2)
    expect(calcWithdrawFee(101, 0.02)).toBe(3) // ceil
  })

  it('charCount returns string length', () => {
    expect(charCount('hello')).toBe(5)
    expect(charCount('你好')).toBe(2)
  })

  it('TASK_STATUS_LABEL has expected keys', () => {
    expect(TASK_STATUS_LABEL).toHaveProperty('PUBLISHING')
    expect(TASK_STATUS_LABEL).toHaveProperty('COMPLETED')
    expect(TASK_STATUS_LABEL).toHaveProperty('IN_PROGRESS')
  })

  it('FINANCE_TYPE_LABEL has expected keys', () => {
    expect(FINANCE_TYPE_LABEL).toHaveProperty('RECHARGE')
    expect(FINANCE_TYPE_LABEL).toHaveProperty('TASK_INCOME')
  })
})
