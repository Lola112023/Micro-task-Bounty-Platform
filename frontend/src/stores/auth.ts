import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, AdminInfo } from '@/types/auth'
import { getMyInfo } from '@/api/user'

const STORED_USER_KEY = 'storedUser'

function loadStoredUser(): UserInfo | null {
  try {
    const raw = localStorage.getItem(STORED_USER_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return null
}

function saveStoredUser(u: UserInfo) {
  try {
    localStorage.setItem(STORED_USER_KEY, JSON.stringify(u))
  } catch {}
}

function clearStoredUser() {
  localStorage.removeItem(STORED_USER_KEY)
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserInfo | null>(loadStoredUser())
  const adminToken = ref<string | null>(localStorage.getItem('adminToken'))
  const admin = ref<AdminInfo | null>(null)

  const viewMode = ref<'publisher' | 'taker'>(
    (localStorage.getItem('viewMode') as 'publisher' | 'taker') || 'publisher'
  )

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => !!adminToken.value)
  const isPublisher = computed(() => viewMode.value === 'publisher')
  const isTaker = computed(() => viewMode.value === 'taker')

  function setToken(t: string) {
    token.value = t
    localStorage.setItem('token', t)
  }

  function setUser(u: UserInfo) {
    user.value = {
      ...u,
      points: u.availablePoints ?? u.points ?? 0,
      name: u.realName || u.name || '',
    }
    viewMode.value = u.viewMode || 'publisher'
    saveStoredUser(user.value)
    if (u.id) localStorage.setItem('userId', String(u.id))
  }

  function setAdminToken(t: string) {
    adminToken.value = t
    localStorage.setItem('adminToken', t)
  }

  function setAdmin(a: AdminInfo) {
    admin.value = a
  }

  function setViewMode(mode: 'publisher' | 'taker') {
    viewMode.value = mode
    localStorage.setItem('viewMode', mode)
    if (user.value) {
      user.value.viewMode = mode
      saveStoredUser(user.value)
    }
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('viewMode')
    clearStoredUser()
  }

  function adminLogout() {
    adminToken.value = null
    admin.value = null
    localStorage.removeItem('adminToken')
  }

  async function fetchUserInfo() {
    const t = token.value
    if (!t) return
    try {
      const info = await getMyInfo()
      // 检测 token 是否被其他账号覆盖
      const storedUserId = localStorage.getItem('userId')
      if (storedUserId && info?.id && String(info.id) !== storedUserId) {
        console.warn(
          `[Auth] Token 身份冲突！存储 userId=${storedUserId}，/users/me 返回 userId=${info.id}。` +
          '可能是多账号同时登录导致 token 被覆盖，强制跳转登录页。'
        )
        logout()
        window.location.href = '/login'
        return
      }
      setUser(info)
    } catch (e) {
      console.warn('[Auth] fetchUserInfo 失败，保留当前用户状态', e)
    }
  }

  return {
    token, user, adminToken, admin, viewMode,
    isLoggedIn, isAdmin, isPublisher, isTaker,
    setToken, setUser, setAdminToken, setAdmin,
    setViewMode, logout, adminLogout, fetchUserInfo,
  }
})
