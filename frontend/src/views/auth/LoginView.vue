<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
// import { getOAuthRedirectUrl, adminLogin } from '@/api/auth' // 正式上线时取消注释
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const activeTab = ref<'user' | 'admin'>('user')
const oauthLoading = ref(false)
const adminLoading = ref(false)
const formRef = ref<FormInstance>()

const adminForm = reactive({ username: '', password: '' })
const rules: FormRules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleOAuth() {
  // ── Mock 登录（后端对接前使用，正式上线替换为真实 OAuth 跳转） ──
  oauthLoading.value = true
  try {
    // 模拟网络延迟
    await new Promise((r) => setTimeout(r, 600))
    // 写入 mock token 和用户信息
    auth.setToken('mock-user-token-dev')
    auth.setUser({
      id: 1,
      studentId: '1120200001',
      name: '测试用户',
      nickname: 'TestUser',
      avatarUrl: '',
      grade: '2020级',
      college: '计算机学院',
      academy: '知行书院',
      creditScore: 85,
      completionRate: 0.92,
      points: 520,
      totalIncome: 1200,
      totalExpense: 680,
      announcement: '诚信交易，非诚勿扰',
      accountStatus: 'normal',
      viewMode: 'publisher',
    })
    ElMessage.success('登录成功（开发模式）')
    const redirect = route.query.redirect as string | undefined
    router.push(redirect || '/task-hall')
  } finally {
    oauthLoading.value = false
  }
  // ── 正式上线时取消注释以下代码并删除上面的 Mock 块 ──
  // oauthLoading.value = true
  // try {
  //   const { url } = await getOAuthRedirectUrl()
  //   window.location.href = url
  // } catch {
  //   ElMessage.error('获取认证地址失败，请稍后重试')
  // } finally {
  //   oauthLoading.value = false
  // }
}

async function handleAdminLogin() {
  await formRef.value?.validate()
  adminLoading.value = true
  try {
    // ── Mock 管理员登录（后端对接前使用） ──
    await new Promise((r) => setTimeout(r, 400))
    if (adminForm.username === 'admin' && adminForm.password === 'admin123') {
      auth.setAdminToken('mock-admin-token-dev')
      auth.setAdmin({ id: 1, username: 'admin', role: 'admin' })
      ElMessage.success('登录成功（开发模式）')
      router.push('/admin/dashboard')
    } else {
      ElMessage.error('账号或密码错误（开发模式账号：admin / admin123）')
    }
    // ── 正式上线时替换为: ──
    // const res = await adminLogin(adminForm.username, adminForm.password)
    // auth.setAdminToken(res.token)
    // auth.setAdmin(res.admin)
    // ElMessage.success('登录成功')
    // router.push('/admin/dashboard')
  } finally {
    adminLoading.value = false
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <!-- Logo & 标题 -->
      <div class="login-header">
        <div class="login-logo">任</div>
        <div class="login-title">校园任务悬赏平台</div>
        <div class="login-subtitle">北京理工大学校内任务对接平台</div>
      </div>

      <!-- Tab 切换 -->
      <el-tabs v-model="activeTab" class="login-tabs">
        <!-- 用户登录 -->
        <el-tab-pane label="用户登录" name="user">
          <el-button
            type="primary"
            size="large"
            :loading="oauthLoading"
            class="oauth-btn"
            @click="handleOAuth"
          >
            <span class="oauth-icon">🎓</span>
            北京理工大学统一身份认证登录
          </el-button>

          <el-alert type="info" :closable="false" class="login-notice">
            <template #title>
              <div class="notice-title">📌 登录须知</div>
            </template>
            <div class="notice-list">
              <div>• 仅北京理工大学师生可使用（含交换生、教职工）</div>
              <div>• 首次登录自动创建账户，绑定学号/工号等信息</div>
              <div>• 账户信息以学校系统返回为准，平台不可手动修改</div>
              <div>• 账户与学号/工号一一对应，禁止重复注册</div>
            </div>
          </el-alert>
        </el-tab-pane>

        <!-- 管理员登录 -->
        <el-tab-pane label="管理员登录" name="admin">
          <el-form ref="formRef" :model="adminForm" :rules="rules" label-position="top">
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
            ⚠️ 仅授权管理员可登录（校方指定1-3名教师或学生助理）
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

          <el-alert type="info" :closable="false" class="login-notice" style="margin-top: 16px">
            <div class="notice-list">
              <div>• 所有操作将被记录日志（操作人、时间、IP、内容）</div>
              <div>• 管理员不可使用用户端功能</div>
              <div>• 日志永久保存，不可删除</div>
            </div>
          </el-alert>
        </el-tab-pane>
      </el-tabs>

      <div class="login-footer">© 2024 北京理工大学校园任务悬赏平台</div>
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

.oauth-btn {
  width: 100%;
  margin-bottom: 16px;
  height: 46px;
  font-size: 15px;
}

.oauth-icon {
  margin-right: 6px;
  font-size: 18px;
}

.login-notice {
  margin-top: 0;
}

.notice-title {
  font-weight: 600;
  margin-bottom: 6px;
}

.notice-list {
  font-size: 13px;
  line-height: 1.8;
  color: #595959;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #bbb;
}
</style>
