<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyPublishedTasks, getMyAcceptedTasks } from '@/api/task'
import type { TaskListItem } from '@/types/task'
import { formatDateTime, TASK_STATUS_LABEL } from '@/utils/format'
import StatusTag from '@/components/common/StatusTag.vue'
import dayjs from 'dayjs'

const router = useRouter()
const activeTab = ref<'published' | 'accepted'>('published')
const statusFilter = ref('')
const dateRange = ref<[Date, Date] | null>(null)
const loading = ref(false)
const list = ref<TaskListItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 15

const statusOptions = [
  { label: '全部', value: '' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' },
  { label: '发布中', value: 'PUBLISHING' },
  { label: '进行中', value: 'IN_PROGRESS' },
  { label: '待确认', value: 'PENDING_CONFIRM' },
]

async function fetchList() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      status: statusFilter.value || undefined,
      page: page.value,
      pageSize,
    }
    if (dateRange.value) {
      params.startDate = dayjs(dateRange.value[0]).format('YYYY-MM-DD')
      params.endDate = dayjs(dateRange.value[1]).format('YYYY-MM-DD')
    }
    const res = activeTab.value === 'published'
      ? await getMyPublishedTasks(params as { status?: string; page?: number; pageSize?: number })
      : await getMyAcceptedTasks(params as { status?: string; page?: number; pageSize?: number })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

function handleTabChange() {
  statusFilter.value = ''
  dateRange.value = null
  page.value = 1
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div>
    <div style="display:flex; align-items:center; gap:12px; margin-bottom:16px">
      <el-button link @click="router.push('/profile')">
        <el-icon><ArrowLeft /></el-icon> 返回个人中心
      </el-button>
      <h2>我的任务历史</h2>
    </div>

    <div class="card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="已发布" name="published" />
        <el-tab-pane label="已接单" name="accepted" />
      </el-tabs>

      <!-- 筛选 -->
      <div class="filter-row">
        <el-select v-model="statusFilter" clearable placeholder="状态筛选" style="width:130px"
          @change="() => { page=1; fetchList() }">
          <el-option v-for="o in statusOptions" :key="o.value" :label="o.label" :value="o.value" />
        </el-select>
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width:240px"
          @change="() => { page=1; fetchList() }"
        />
        <el-button @click="() => { statusFilter=''; dateRange=null; page=1; fetchList() }">重置</el-button>
      </div>

      <el-table v-loading="loading" :data="list" style="width:100%" empty-text="暂无记录">
        <el-table-column label="任务名称" min-width="200">
          <template #default="{ row }">
            <el-button link @click="router.push(`/task/${row.id}`)">{{ row.title }}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="categoryName" label="分类" width="100" />
        <el-table-column label="报酬" width="110">
          <template #default="{ row }">
            <span style="color:#fa8c16; font-weight:600">{{ row.reward }} 积分</span>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="155">
          <template #default="{ row }">{{ formatDateTime(row.publishedAt) }}</template>
        </el-table-column>
        <el-table-column label="状态" width="110">
          <template #default="{ row }"><StatusTag :status="row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
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
  </div>
</template>

<style scoped>
.filter-row {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
}
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
