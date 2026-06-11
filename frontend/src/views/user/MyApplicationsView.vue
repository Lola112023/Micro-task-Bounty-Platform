<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getMyApplications } from '@/api/task'
import type { TaskApplication } from '@/types/task'
import { formatDateTime } from '@/utils/format'
import StatusTag from '@/components/common/StatusTag.vue'

const router = useRouter()
const statusFilter = ref('')
const loading = ref(false)
const list = ref<TaskApplication[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 15

const statusOptions = [
  { label: '全部', value: '' },
  { label: '审核中', value: 'REVIEWING' },
  { label: '已中标', value: 'AWARDED' },
  { label: '已落选', value: 'REJECTED' },
  { label: '已取消', value: 'CANCELLED' },
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getMyApplications({
      status: statusFilter.value || undefined,
      page: page.value,
      pageSize,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

onMounted(fetchList)
</script>

<template>
  <div class="card">
    <h2 style="margin-bottom:16px">我的申请记录</h2>

    <div class="filter-row">
      <span style="color:#595959; font-size:13px">状态：</span>
      <el-radio-group v-model="statusFilter" size="small" @change="() => { page = 1; fetchList() }">
        <el-radio-button v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </el-radio-button>
      </el-radio-group>
    </div>

    <el-table v-loading="loading" :data="list" style="width:100%" empty-text="暂无申请记录">
      <el-table-column label="任务名称" min-width="200">
        <template #default="{ row }">
          <el-button link @click="router.push(`/task/${row.taskId}`)">{{ row.taskId }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="申请时间" width="160">
        <template #default="{ row }">{{ formatDateTime(row.appliedAt) }}</template>
      </el-table-column>
      <el-table-column label="状态" width="110">
        <template #default="{ row }">
          <StatusTag :status="row.status" mode="application" />
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
