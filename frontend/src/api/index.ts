import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

// 请求拦截器：附加 Token
request.interceptors.request.use((config) => {
  // mock token 直接放行，不加 Authorization
  const token = localStorage.getItem('token')
  if (token && !token.startsWith('mock-')) {
    config.headers.Authorization = `Bearer ${token}`
  }
  const adminToken = localStorage.getItem('adminToken')
  if (adminToken && !adminToken.startsWith('mock-')) {
    config.headers.Authorization = `Bearer ${adminToken}`
  }
  return config
})

// 响应拦截器：统一错误处理
request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const msg = error.response?.data?.message || '请求失败，请稍后重试'

    if (status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('adminToken')
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (status === 403) {
      ElMessage.error('权限不足')
      return Promise.reject(error)
    }

    // 开发阶段后端未就绪时，静默处理网络错误，不弹全局提示
    if (!error.response) {
      console.warn('[API] 网络请求失败（后端未就绪）:', error.config?.url)
      return Promise.reject(error)
    }

    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request
