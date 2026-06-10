<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { login, adminLogin } from '@/api/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const activeTab = ref<'user' | 'admin'>('user')
const loading = ref(false)
const adminLoading = ref(false)
const formRef = ref<FormInstance>()

const loginForm = reactive({ username: '', password: '' })
const adminForm = reactive({ username: '', password: '' })

const loginRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

const adminRules: FormRules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  await formRef.value?.validate()
  loading.value = true
  try {
    const res = await login(loginForm.username, loginForm.password)
    auth.setToken(res.token)
    auth.setUser(res.user)
    ElMessage.success('登录成功')
    const redirect = route.query.redirect as string | undefined
    router.push(redirect || '/task-hall')
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}

async function handleAdminLogin() {
  loading.value = true
  try {
    const res = await adminLogin(adminForm.username, adminForm.password)
    auth.setAdminToken(res.token)
    auth.setAdmin(res.admin)
    ElMessage.success('登录成功')
    router.push('/admin/dashboard')
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <div class="login-logo">任</div>
        <div class="login-title">校园任务悬赏平台</div>
        <div class="login-subtitle">注册账号，开始使用</div>
      </div>

      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- 用户登录 -->
        <el-tab-pane label="用户登录" name="user">
          <el-form ref="formRef" :model="loginForm" :rules="loginRules" label-position="top">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="loginForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                @keyup.enter="handleLogin"
              />
            </el-form-item>
          </el-form>

          <el-button
            type="primary"
            size="large"
            :loading="loading"
            style="width: 100%; margin-bottom: 12px"
            @click="handleLogin"
          >
            登录
          </el-button>

          <div style="text-align: center">
            没有账号？
            <el-link type="primary" @click="router.push('/register')">立即注册</el-link>
          </div>
        </el-tab-pane>

        <!-- 管理员登录 -->
        <el-tab-pane label="管理员登录" name="admin">
          <el-form :model="adminForm" :rules="adminRules" label-position="top">
            <el-form-item label="管理员账号" prop="username">
              <el-input v-model="adminForm.username" placeholder="请输入管理员账号" />
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input
                v-model="adminForm.password"
                type="password"
                placeholder="请输入密码"
                show-password
                @keyup.enter="handleAdminLogin"
              />
            </el-form-item>
          </el-form>

          <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
            仅授权管理员可登录
          </el-alert>

          <el-button
            type="primary"
            size="large"
            :loading="adminLoading"
            style="width: 100%"
            @click="handleAdminLogin"
          >
            登录
          </el-button>
        </el-tab-pane>
      </el-tabs>

      <div class="login-footer">校园任务悬赏平台</div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.login-header {
  text-align: center;
  margin-bottom: 28px;
}

.login-logo {
  width: 64px;
  height: 64px;
  background: #1e56a0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  font-weight: bold;
  margin: 0 auto 14px;
}

.login-title {
  font-size: 22px;
  font-weight: bold;
  color: #1e56a0;
  margin-bottom: 6px;
}

.login-subtitle {
  font-size: 13px;
  color: #8c8c8c;
}

.login-tabs {
  margin-bottom: 0;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #bbb;
}
</style>
