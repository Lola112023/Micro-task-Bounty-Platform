<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAdminTasks, forceCancelTask } from '@/api/admin'
import type { AdminTask } from '@/types/admin'
import { formatDateTime } from '@/utils/format'
import { ElMessage } from 'element-plus'
import StatusTag from '@/components/common/StatusTag.vue'

const router = useRouter()
const loading = ref(false)
const list = ref<AdminTask[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const keyword = ref('')
const statusFilter = ref('')

const removeDialogVisible = ref(false)
const removeTarget = ref<AdminTask | null>(null)
const removeReason = ref('')

async function fetchList() {
  loading.value = true
  try {
    const res = await getAdminTasks({
      keyword: keyword.value || undefined,
      status: statusFilter.value || undefined,
      page: page.value,
      pageSize,
    })
    list.value = res.list
    total.value = res.total
  } finally { loading.value = false }
}

async function confirmRemove() {
  if (!removeTarget.value || !removeReason.value.trim()) {
    ElMessage.error('请填写下架原因')
    return
  }
  await forceCancelTask(removeTarget.value.id, removeReason.value)
  ElMessage.success('任务已强制下架')
  removeDialogVisible.value = false
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div>
    <h2 style="margin-bottom:20px">📋 任务管理</h2>
    <div class="card">
      <div class="filter-row">
        <el-input v-model="keyword" placeholder="任务ID/名称" clearable style="width:220px"
          @keyup.enter="() => { page=1; fetchList() }" />
        <el-select v-model="statusFilter" clearable placeholder="任务状态" style="width:130px"
          @change="() => { page=1; fetchList() }">
          <el-option label="发布中" value="PUBLISHING" />
          <el-option label="进行中" value="IN_PROGRESS" />
          <el-option label="待确认" value="PENDING_CONFIRM" />
          <el-option label="已完成" value="COMPLETED" />
          <el-option label="已取消" value="CANCELLED" />
          <el-option label="申诉中" value="APPEALING" />
        </el-select>
        <el-button type="primary" @click="() => { page=1; fetchList() }">搜索</el-button>
      </div>

      <el-table v-loading="loading" :data="list" style="width:100%" empty-text="暂无任务">
        <el-table-column prop="id" label="任务ID" width="80" />
        <el-table-column prop="title" label="任务名称" min-width="180" show-overflow-tooltip />
        <el-table-column prop="publisherNickname" label="发布者" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><StatusTag :status="row.status" /></template>
        </el-table-column>
        <el-table-column label="报酬" width="100">
          <template #default="{ row }">
            <span style="color:#fa8c16;font-weight:600">{{ row.reward }} 积分</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="155">
          <template #default="{ row }">{{ formatDateTime(row.publishedAt) }}</template>
        </el-table-column>
        <el-table-column prop="stayDuration" label="停留时长" width="100" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="router.push(`/admin/tasks/${row.id}`)">查看</el-button>
            <el-button size="small" link type="danger"
              @click="() => { removeTarget = row as any; removeReason = ''; removeDialogVisible = true }">
              强制下架
            </el-button>
            <el-button v-if="['IN_PROGRESS','PENDING_CONFIRM','APPEALING'].includes(row.status)"
              size="small" link type="warning"
              @click="router.push(`/admin/reviews?tab=appeal`)">
              申诉处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total"
          layout="prev, pager, next, total" background @current-change="fetchList" />
      </div>
    </div>

    <el-dialog v-model="removeDialogVisible" title="强制下架" width="420px">
      <el-alert type="warning" :closable="false" style="margin-bottom:12px">
        强制下架将划扣100%任务积分并记录违规原因
      </el-alert>
      <el-input v-model="removeReason" type="textarea" :rows="3"
        placeholder="请填写违规原因（必填）" :maxlength="200" show-word-limit />
      <template #footer>
        <el-button @click="removeDialogVisible=false">取消</el-button>
        <el-button type="danger" @click="confirmRemove">确认下架</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.filter-row { display:flex; gap:10px; align-items:center; margin-bottom:16px; flex-wrap:wrap; }
.pagination-wrap { display:flex; justify-content:center; margin-top:20px; }
</style>
