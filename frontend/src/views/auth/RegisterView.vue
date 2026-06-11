<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { register } from '@/api/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const auth = useAuthStore()

const loading = ref(false)
const formRef = ref<FormInstance>()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: '',
})

const validateConfirm = (_rule: unknown, value: string, callback: (e?: Error) => void) => {
  if (value !== form.password) {
    callback(new Error('两次密码输入不一致'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '用户名长度3-50个字符', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 100, message: '密码长度至少6位', trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' },
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { max: 50, message: '昵称长度不能超过50个字符', trigger: 'blur' },
  ],
}

async function handleRegister() {
  await formRef.value?.validate()
  loading.value = true
  try {
    const res = await register({
      username: form.username,
      password: form.password,
      confirmPassword: form.confirmPassword,
      nickname: form.nickname,
    })
    auth.setToken(res.token)
    auth.setUser(res.user)
    ElMessage.success('注册成功')
    router.push('/task-hall')
  } catch {
    // error handled by interceptor
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <div class="register-header">
        <div class="register-logo">任</div>
        <div class="register-title">创建账号</div>
        <div class="register-subtitle">注册后即可发布和承接任务</div>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="登录用，3-50个字符" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="昵称" prop="nickname">
              <el-input v-model="form.nickname" placeholder="显示名称" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="form.password" type="password" placeholder="至少6位" show-password />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="form.confirmPassword" type="password" placeholder="再次输入密码" show-password />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <el-button type="primary" size="large" :loading="loading" style="width: 100%" @click="handleRegister">
        注册
      </el-button>

      <div style="text-align: center; margin-top: 16px">
        已有账号？
        <el-link type="primary" @click="router.push('/login')">去登录</el-link>
      </div>

      <div class="register-footer">校园任务悬赏平台</div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-box {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.register-header {
  text-align: center;
  margin-bottom: 28px;
}

.register-logo {
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

.register-title {
  font-size: 22px;
  font-weight: bold;
  color: #1e56a0;
  margin-bottom: 6px;
}

.register-subtitle {
  font-size: 13px;
  color: #8c8c8c;
}

.register-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #bbb;
}
</style>
