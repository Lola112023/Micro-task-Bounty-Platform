import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

// 请求拦截器：附加 Token
request.interceptors.request.use((config) => {
  // admin token 优先级更高（管理端请求）
  const adminToken = localStorage.getItem('adminToken')
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`
  } else {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

// 响应拦截器：统一错误处理，并解包 ApiResponse
request.interceptors.response.use(
  (response) => {
    const body = response.data
    // 后端返回 { code, message, data } 格式
    if (body && typeof body.code === 'number') {
      return body.data !== undefined ? body.data : body
    }
    return body
  },
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

    if (!error.response) {
      console.warn('[API] 网络请求失败:', error.config?.url)
      return Promise.reject(error)
    }

    ElMessage.error(msg)
    return Promise.reject(error)
  }
)

export default request
