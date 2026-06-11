<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { adminLogin } from '@/api/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({ username: '', password: '' })
const rules: FormRules = {
  username: [{ required: true, message: '请输入管理员账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
}

async function handleLogin() {
  await formRef.value?.validate()
  loading.value = true
  try {
    const res = await adminLogin(form.username, form.password)
    if (!res || !res.token) {
      ElMessage.error('登录失败')
      return
    }
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
  <div class="admin-login-container">
    <div class="admin-login-box">
      <div class="admin-login-header">
        <div class="admin-logo-icon">管</div>
        <div class="admin-login-title">后台管理系统</div>
        <div class="admin-login-subtitle">校园任务悬赏平台</div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="large">
        <el-form-item label="管理员账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入管理员账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
      </el-form>

      <el-alert type="warning" :closable="false" style="margin-bottom: 16px">
        仅授权管理员可登录
      </el-alert>

      <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="handleLogin">
        登录
      </el-button>

      <el-alert type="info" :closable="false" style="margin-top: 16px">
        <div style="font-size: 13px; line-height: 1.8; color: #595959">
          <div>所有操作将被记录日志（操作人、时间、IP、内容）</div>
          <div>管理员不可使用用户端功能</div>
          <div>日志永久保存，不可删除</div>
        </div>
      </el-alert>

      <div style="text-align: center; margin-top: 16px">
        <el-button link @click="router.push('/login')">返回用户登录</el-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e56a0 0%, #2e7bd6 100%);
}

.admin-login-box {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 420px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.admin-login-header {
  text-align: center;
  margin-bottom: 28px;
}

.admin-logo-icon {
  width: 60px;
  height: 60px;
  background: #1e56a0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  font-weight: bold;
  margin: 0 auto 12px;
}

.admin-login-title {
  font-size: 22px;
  font-weight: bold;
  color: #1e56a0;
  margin-bottom: 4px;
}

.admin-login-subtitle {
  font-size: 13px;
  color: #8c8c8c;
}
</style>
