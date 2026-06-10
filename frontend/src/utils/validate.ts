/** 昵称校验：仅大小写英文字母、中文字符、阿拉伯数字，不含空格及特殊字符，长度 < 10 */
export function validateNickname(nickname: string): string | true {
  if (!nickname) return '昵称不能为空'
  if (nickname.length >= 10) return '昵称不能超过9个字'
  if (/[^a-zA-Z0-9\u4e00-\u9fa5]/.test(nickname)) return '昵称只能包含中文、英文字母、数字'
  return true
}

/** 任务名称校验：不超过30字 */
export function validateTaskTitle(title: string): string | true {
  if (!title.trim()) return '任务名称不能为空'
  if (title.length > 30) return '任务名称不能超过30个字'
  return true
}

/** 申请理由校验：10~200字 */
export function validateApplyReason(reason: string): string | true {
  if (reason.length < 10) return '申请理由不少于10个字'
  if (reason.length > 200) return '申请理由不超过200个字'
  return true
}

/** 公告栏校验：不超过200字 */
export function validateAnnouncement(text: string): string | true {
  if (text.length > 200) return '公告栏内容不超过200个字'
  return true
}

/** 截止时长校验：30~43200分钟 */
export function validateDuration(minutes: number): string | true {
  if (!Number.isInteger(minutes) || minutes < 30 || minutes > 43200)
    return '截止时长需在30分钟到43200分钟（30天）之间'
  return true
}

/** 报酬校验：正整数 1~5000 */
export function validateReward(points: number): string | true {
  if (!Number.isInteger(points) || points < 1 || points > 5000)
    return '报酬需在1~5000积分之间'
  return true
}

/** 留言内容校验：不超过50字 */
export function validateMessage(content: string): string | true {
  if (!content.trim()) return '消息内容不能为空'
  if (content.length > 50) return '消息不能超过50个字'
  return true
}

/** 上架天数校验：1~14 */
export function validateListDays(days: number): string | true {
  if (!Number.isInteger(days) || days < 1 || days > 14)
    return '上架天数需在1~14天之间'
  return true
}
