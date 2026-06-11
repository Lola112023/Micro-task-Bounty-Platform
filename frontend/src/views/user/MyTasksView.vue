<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getMyPublishedTasks, getMyAcceptedTasks } from '@/api/task'
import type { TaskListItem } from '@/types/task'
import { formatDateTime } from '@/utils/format'
import StatusTag from '@/components/common/StatusTag.vue'

const router = useRouter()
const auth = useAuthStore()

const activeTab = ref(auth.isPublisher ? 'published' : 'accepted')
const statusFilter = ref('')
const loading = ref(false)
const list = ref<TaskListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 15

const statusOptions = [
  { label: '全部', value: '' },
  { label: '发布中', value: 'PUBLISHING' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '待确认', value: 'PENDING_CONFIRM' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' },
  { label: '申诉中', value: 'APPEALING' },
]

async function fetchList() {
  loading.value = true
  try {
    const params = { status: statusFilter.value || undefined, page: page.value, pageSize }
    const res = activeTab.value === 'published'
      ? await getMyPublishedTasks(params)
      : await getMyAcceptedTasks(params)
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  statusFilter.value = ''
  page.value = 1
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div class="card">
    <div class="page-header">
      <h2>我的任务</h2>
      <el-button type="primary" @click="router.push('/publish-task')">
        <el-icon><Plus /></el-icon> 发布新任务
      </el-button>
    </div>

    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="我发布的任务" name="published" />
      <el-tab-pane label="我承接的任务" name="accepted" />
    </el-tabs>

    <!-- 筛选 -->
    <div class="filter-row">
      <span style="color:#595959; font-size:13px">状态筛选：</span>
      <el-radio-group v-model="statusFilter" size="small" @change="() => { page = 1; fetchList() }">
        <el-radio-button v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <el-table v-loading="loading" :data="list" style="width:100%" empty-text="暂无任务">
      <el-table-column label="任务名称" min-width="200">
        <template #default="{ row }">
          <el-button link @click="router.push(`/task/${row.id}`)">{{ row.title }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="categoryName" label="分类" width="100" />
      <el-table-column label="报酬" width="100">
        <template #default="{ row }">
          <span style="color:#fa8c16; font-weight:600">{{ row.reward }} 积分</span>
        </template>
      </el-table-column>
      <el-table-column label="发布时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.publishedAt) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }"><StatusTag :status="row.status" /></template>
      </el-table-column>
      <el-table-column label="操作" width="90" fixed="right">
        <template #default="{ row }">
          <el-button size="small" link @click="router.push(`/task/${row.id}`)">查看</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap" v-if="total > pageSize">
      <el-pagination
        v-model:current-page="page"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next, total"
        background
        @current-change="fetchList"
      />
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
