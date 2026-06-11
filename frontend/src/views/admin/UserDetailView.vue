<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminUserDetail, getUserAuditLogs, resetCreditScore } from '@/api/admin'
import type { AdminUser } from '@/types/admin'
import { formatDateTime, creditScoreColor } from '@/utils/format'
import { ElMessage } from 'element-plus'

const props = defineProps<{ userId: string }>()
const router = useRouter()
const user = ref<AdminUser | null>(null)
const logs = ref<{ action: string; detail: string; ip: string; createdAt: string }[]>([])
const logTotal = ref(0)
const logPage = ref(1)
const resetReason = ref('')
const loading = ref(true)

async function loadUser() {
  loading.value = true
  try {
    user.value = await getAdminUserDetail(Number(props.userId))
    await loadLogs()
  } finally { loading.value = false }
}

async function loadLogs() {
  const res = await getUserAuditLogs(Number(props.userId), { page: logPage.value, pageSize: 15 })
  logs.value = res.list
  logTotal.value = res.total
}

async function handleResetCredit() {
  if (!resetReason.value.trim()) { ElMessage.error('请填写操作理由'); return }
  await resetCreditScore(Number(props.userId), resetReason.value)
  ElMessage.success('信用分已重置为80分')
  loadUser()
}

onMounted(loadUser)
</script>

<template>
  <div>
    <el-button link style="margin-bottom:16px" @click="router.back()">
      <el-icon><ArrowLeft /></el-icon> 返回用户列表
    </el-button>

    <el-skeleton v-if="loading" :rows="8" animated />

    <template v-else-if="user">
      <!-- 基本信息 -->
      <div class="card" style="margin-bottom:16px">
        <div class="card-title">用户基本信息</div>
        <div class="info-grid">
          <div><span class="label">学号/工号：</span>{{ user.studentNo }}</div>
          <div><span class="label">姓名：</span>{{ user.realName || '-' }}</div>
          <div><span class="label">昵称：</span>{{ user.nickname }}</div>
          <div><span class="label">角色：</span>{{ user.role }}</div>
          <div>
            <span class="label">信用分：</span>
            <strong :style="{ color: creditScoreColor(user.creditScore) }">{{ user.creditScore }}</strong>
          </div>
          <div>
            <span class="label">账户状态：</span>
            <el-tag :type="user.accountStatus === 'NORMAL' ? 'success' : 'danger'" size="small">
              {{ user.accountStatus === 'NORMAL' ? '正常' : user.accountStatus === 'FROZEN' ? '冻结' : user.accountStatus }}
            </el-tag>
          </div>
          <div><span class="label">注册时间：</span>{{ formatDateTime(user.createdAt) }}</div>
          <div><span class="label">最后登录：</span>{{ user.lastLoginTime ? formatDateTime(user.lastLoginTime) : '-' }}</div>
        </div>
      </div>

      <!-- 信用分重置 -->
      <div v-if="user.creditScore < 40" class="card" style="margin-bottom:16px">
        <div class="card-title">信用分管理</div>
        <el-alert type="warning" :closable="false" style="margin-bottom:12px">
          该用户信用分低于40，可执行一次信用分重置操作（恢复至80分）
        </el-alert>
        <el-input v-model="resetReason" type="textarea" :rows="2"
          placeholder="请填写操作理由（必填）" :maxlength="200" show-word-limit
          style="margin-bottom:10px" />
        <el-button type="warning" @click="handleResetCredit">恢复信用分至80分</el-button>
      </div>

      <!-- 操作日志 -->
      <div class="card">
        <div class="card-title">操作日志</div>
        <el-table :data="logs" style="width:100%" empty-text="暂无日志">
          <el-table-column prop="action" label="操作类型" width="130" />
          <el-table-column prop="detail" label="详情" min-width="200" show-overflow-tooltip />
          <el-table-column prop="ip" label="IP" width="130" />
          <el-table-column label="时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap" v-if="logTotal > 15">
          <el-pagination v-model:current-page="logPage" :page-size="15" :total="logTotal"
            layout="prev, pager, next" background @current-change="loadLogs" />
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.info-grid { display:grid; grid-template-columns:repeat(2,1fr); gap:10px; font-size:14px; }
.label { font-weight:500; color:#262626; margin-right:6px; }
.pagination-wrap { display:flex; justify-content:center; margin-top:16px; }
</style>
