<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminUsers, freezeUser, unfreezeUser } from '@/api/admin'
import type { AdminUser } from '@/types/admin'
import { formatDateTime } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const loading = ref(false)
const list = ref<AdminUser[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const keyword = ref('')
const statusFilter = ref('')
const creditFilter = ref('')

const freezeDialogVisible = ref(false)
const freezeTarget = ref<AdminUser | null>(null)
const freezeReason = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await getAdminUsers({
      keyword: keyword.value || undefined,
      status: statusFilter.value || undefined,
      minScore: creditFilter.value ? parseInt(creditFilter.value) : undefined,
      page: page.value,
      pageSize,
    })
    list.value = res.list
    total.value = res.total
  } finally { loading.value = false }
}

async function handleFreeze(user: AdminUser) {
  freezeTarget.value = user
  freezeReason.value = ''
  freezeDialogVisible.value = true
}

async function confirmFreeze() {
  if (!freezeTarget.value || !freezeReason.value.trim()) {
    ElMessage.error('请填写冻结理由')
    return
  }
  await freezeUser(freezeTarget.value.id, freezeReason.value)
  ElMessage.success('账户已冻结')
  freezeDialogVisible.value = false
  fetchList()
}

async function handleUnfreeze(user: AdminUser) {
  await ElMessageBox.confirm(`确认解冻用户「${user.nickname}」？`, '解冻确认', {
    confirmButtonText: '确认', cancelButtonText: '取消'
  })
  await unfreezeUser(user.id)
  ElMessage.success('账户已解冻')
  fetchList()
}

function creditColor(score: number) {
  if (score >= 80) return '#52c41a'
  if (score >= 60) return '#faad14'
  if (score >= 40) return '#fa8c16'
  return '#ff4d4f'
}

onMounted(fetchList)
</script>

<template>
  <div>
    <h2 style="margin-bottom:20px">👥 用户管理</h2>
    <div class="card">
      <div class="filter-row">
        <el-input v-model="keyword" placeholder="学号/昵称搜索" clearable style="width:220px"
          @keyup.enter="() => { page=1; fetchList() }" />
        <el-select v-model="statusFilter" clearable placeholder="账户状态" style="width:120px"
          @change="() => { page=1; fetchList() }">
          <el-option label="正常" value="normal" />
          <el-option label="冻结" value="frozen" />
        </el-select>
        <el-select v-model="creditFilter" clearable placeholder="信用分区间" style="width:130px"
          @change="() => { page=1; fetchList() }">
          <el-option label="< 40" value="lt40" />
          <el-option label="40 - 60" value="40-60" />
          <el-option label="60 - 80" value="60-80" />
          <el-option label="80 - 100" value="80-100" />
        </el-select>
        <el-button type="primary" @click="() => { page=1; fetchList() }">搜索</el-button>
      </div>

      <el-table v-loading="loading" :data="list" style="width:100%" empty-text="暂无用户">
        <el-table-column prop="studentNo" label="学号/工号" width="120" />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column label="信用分" width="90">
          <template #default="{ row }">
            <span :style="{ color: creditColor(row.creditScore), fontWeight: 600 }">
              {{ row.creditScore }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="账户状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.accountStatus === 'NORMAL' ? 'success' : 'danger'" size="small">
              {{ row.accountStatus === 'NORMAL' ? '正常' : row.accountStatus === 'FROZEN' ? '冻结' : row.accountStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="155">
          <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="最后登录时间" width="155">
          <template #default="{ row }">{{ row.lastLoginTime ? formatDateTime(row.lastLoginTime) : '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="router.push(`/admin/users/${row.id}`)">详情</el-button>
            <el-button v-if="row.accountStatus === 'NORMAL'" size="small" link type="danger"
              @click="handleFreeze(row as any)">冻结</el-button>
            <el-button v-else size="small" link type="success"
              @click="handleUnfreeze(row as any)">解冻</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total"
          layout="prev, pager, next, total" background @current-change="fetchList" />
      </div>
    </div>

    <!-- 冻结弹窗 -->
    <el-dialog v-model="freezeDialogVisible" title="冻结账户" width="420px">
      <el-input v-model="freezeReason" type="textarea" :rows="3"
        placeholder="请填写冻结理由（必填）" :maxlength="200" show-word-limit />
      <template #footer>
        <el-button @click="freezeDialogVisible=false">取消</el-button>
        <el-button type="danger" @click="confirmFreeze">确认冻结</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.filter-row { display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap; }
.pagination-wrap { display:flex; justify-content:center; margin-top:20px; }
</style>
