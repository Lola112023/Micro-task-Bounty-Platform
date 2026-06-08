import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, AdminInfo } from '@/types/auth'
import { getMyInfo } from '@/api/user'
import { MOCK_USER } from '@/api/mock'

export const useAuthStore = defineStore('auth', () => {
  // ── Token：正式 token 存 localStorage，mock token 只存 sessionStorage ──────
  const _storedToken = sessionStorage.getItem('token') || localStorage.getItem('token')
  const token = ref<string | null>(_storedToken)

  // 启动时如果 localStorage 里有残留 mock token，清掉
  if (localStorage.getItem('token')?.startsWith('mock-')) {
    localStorage.removeItem('token')
  }

  const user = ref<UserInfo | null>(null)

  // 如果 session 里有 mock token，恢复 mock user（同一个 tab 刷新场景）
  if (token.value?.startsWith('mock-')) {
    user.value = { ...MOCK_USER }
  }

  const _storedAdminToken = sessionStorage.getItem('adminToken') || localStorage.getItem('adminToken')
  const adminToken = ref<string | null>(_storedAdminToken)
  if (localStorage.getItem('adminToken')?.startsWith('mock-')) {
    localStorage.removeItem('adminToken')
  }
  const admin = ref<AdminInfo | null>(null)

  const viewMode = ref<'publisher' | 'taker'>(
    (localStorage.getItem('viewMode') as 'publisher' | 'taker') || 'publisher'
  )

  // ── 计算属性 ──────────────────────────────────────────────────────────────
  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => !!adminToken.value)
  const isPublisher = computed(() => viewMode.value === 'publisher')
  const isTaker = computed(() => viewMode.value === 'taker')

  // ── 方法 ──────────────────────────────────────────────────────────────────
  function setToken(t: string) {
    token.value = t
    if (t.startsWith('mock-')) {
      // mock token 仅存 sessionStorage，关闭标签后即失效
      sessionStorage.setItem('token', t)
    } else {
      localStorage.setItem('token', t)
      sessionStorage.setItem('token', t)
    }
  }

  function setUser(u: UserInfo) {
    user.value = u
    viewMode.value = u.viewMode || 'publisher'
  }

  function setAdminToken(t: string) {
    adminToken.value = t
    if (t.startsWith('mock-')) {
      sessionStorage.setItem('adminToken', t)
    } else {
      localStorage.setItem('adminToken', t)
      sessionStorage.setItem('adminToken', t)
    }
  }

  function setAdmin(a: AdminInfo) {
    admin.value = a
  }

  function setViewMode(mode: 'publisher' | 'taker') {
    viewMode.value = mode
    localStorage.setItem('viewMode', mode)
    if (user.value) user.value.viewMode = mode
  }

  function logout() {
    token.value = null
    user.value = null
    sessionStorage.removeItem('token')
    localStorage.removeItem('token')
    localStorage.removeItem('viewMode')
  }

  function adminLogout() {
    adminToken.value = null
    admin.value = null
    sessionStorage.removeItem('adminToken')
    localStorage.removeItem('adminToken')
  }

  async function fetchUserInfo() {
    if (token.value?.startsWith('mock-')) {
      // mock 模式：如果 user 已有值就不重复设置
      if (!user.value) user.value = { ...MOCK_USER }
      return
    }
    try {
      const info = await getMyInfo()
      setUser(info)
    } catch {
      logout()
    }
  }

  return {
    token,
    user,
    adminToken,
    admin,
    viewMode,
    isLoggedIn,
    isAdmin,
    isPublisher,
    isTaker,
    setToken,
    setUser,
    setAdminToken,
    setAdmin,
    setViewMode,
    logout,
    adminLogout,
    fetchUserInfo,
  }
})
