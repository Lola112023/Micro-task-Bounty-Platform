import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { UserInfo, AdminInfo } from '@/types/auth'
import { getMyInfo } from '@/api/user'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<UserInfo | null>(null)
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
    // 映射后端字段到前端
    user.value = {
      ...u,
      points: u.availablePoints ?? u.points ?? 0,
      name: u.realName || u.name || '',
    }
    viewMode.value = u.viewMode || 'publisher'
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
    if (user.value) user.value.viewMode = mode
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('token')
    localStorage.removeItem('viewMode')
  }

  function adminLogout() {
    adminToken.value = null
    admin.value = null
    localStorage.removeItem('adminToken')
  }

  async function fetchUserInfo() {
    try {
      const info = await getMyInfo()
      setUser(info)
    } catch {
      logout()
    }
  }

  return {
    token, user, adminToken, admin, viewMode,
    isLoggedIn, isAdmin, isPublisher, isTaker,
    setToken, setUser, setAdminToken, setAdmin,
    setViewMode, logout, adminLogout, fetchUserInfo,
  }
})
