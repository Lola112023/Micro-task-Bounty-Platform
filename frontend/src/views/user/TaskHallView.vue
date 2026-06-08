<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/task'
import { getTasks, getRecommendedTasks } from '@/api/task'
import type { TaskListItem, TaskListParams } from '@/types/task'
import TaskCard from '@/components/common/TaskCard.vue'
import dayjs from 'dayjs'

const router = useRouter()
const auth = useAuthStore()
const taskStore = useTaskStore()

// ── 状态 ─────────────────────────────────────────────────────────────────────
const loading = ref(false)
const taskList = ref<TaskListItem[]>([])
const recommendList = ref<TaskListItem[]>([])
const total = ref(0)
const viewMode = ref<'grid' | 'list'>('grid')

const filters = reactive<TaskListParams>({
  keyword: '',
  categoryIds: [],
  minReward: undefined,
  maxReward: undefined,
  publishedAfter: undefined,
  sortBy: 'remainingTime',
  page: 1,
  pageSize: 12,
})

const dateRange = ref<[Date, Date] | null>(null)

// 14 天前
const minDate = computed(() => dayjs().subtract(14, 'day').toDate())

// ── 初始化 ───────────────────────────────────────────────────────────────────
onMounted(async () => {
  await taskStore.fetchCategories()
  fetchTasks()
  if (auth.isTaker) fetchRecommended()
})

// ── 数据获取 ─────────────────────────────────────────────────────────────────
async function fetchTasks() {
  loading.value = true
  try {
    if (dateRange.value) {
      filters.publishedAfter = dayjs(dateRange.value[0]).format('YYYY-MM-DD')
    } else {
      filters.publishedAfter = undefined
    }
    const res = await getTasks(filters)
    taskList.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function fetchRecommended() {
  try {
    recommendList.value = await getRecommendedTasks()
  } catch {
    recommendList.value = []
  }
}

function handleSearch() {
  filters.page = 1
  fetchTasks()
}

function handleReset() {
  filters.keyword = ''
  filters.categoryIds = []
  filters.minReward = undefined
  filters.maxReward = undefined
  filters.sortBy = 'remainingTime'
  dateRange.value = null
  filters.page = 1
  fetchTasks()
}

function handlePageChange(page: number) {
  filters.page = page
  fetchTasks()
}

watch(() => filters.sortBy, () => {
  filters.page = 1
  fetchTasks()
})
</script>

<template>
  <div>
    <!-- 接单者视角推荐模块 -->
    <div v-if="auth.isTaker && recommendList.length > 0" class="card" style="margin-bottom: 20px">
      <div class="section-header">
        <h3>🎯 为你推荐</h3>
        <el-button link @click="router.push('/my-applications')">查看我的申请 →</el-button>
      </div>
      <div class="task-grid">
        <TaskCard v-for="t in recommendList.slice(0, 3)" :key="t.id" :task="t" />
      </div>
    </div>

    <!-- 筛选栏 -->
    <div class="card filter-section">
      <div class="filter-row">
        <el-input
          v-model="filters.keyword"
          placeholder="搜索任务名称..."
          clearable
          style="width: 260px"
          @keyup.enter="handleSearch"
        >
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select
          v-model="filters.categoryIds"
          multiple
          collapse-tags
          placeholder="任务分类"
          style="width: 180px"
          clearable
        >
          <el-option
            v-for="cat in taskStore.categories.filter(c => c.enabled)"
            :key="cat.id"
            :label="cat.name"
            :value="cat.id"
          />
        </el-select>

        <div class="reward-range">
          <el-input-number
            v-model="filters.minReward"
            :min="1"
            :max="5000"
            placeholder="最低积分"
            controls-position="right"
            style="width: 120px"
          />
          <span style="padding: 0 6px; color: #8c8c8c">-</span>
          <el-input-number
            v-model="filters.maxReward"
            :min="1"
            :max="5000"
            placeholder="最高积分"
            controls-position="right"
            style="width: 120px"
          />
        </div>

        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="发布开始"
          end-placeholder="发布结束"
          :disabled-date="(d: Date) => d < minDate || d > new Date()"
          style="width: 230px"
        />

        <el-button type="primary" @click="handleSearch">
          <el-icon><Search /></el-icon> 搜索
        </el-button>
        <el-button @click="handleReset">重置</el-button>
      </div>

      <!-- 排序 & 视图切换 -->
      <div class="filter-row" style="margin-bottom: 0">
        <div class="sort-group">
          <span class="sort-label">排序：</span>
          <el-radio-group v-model="filters.sortBy" size="small">
            <el-radio-button value="remainingTime">剩余时间</el-radio-button>
            <el-radio-button value="reward">报酬最高</el-radio-button>
          </el-radio-group>
        </div>

        <div style="margin-left: auto; display: flex; gap: 8px">
          <el-tooltip content="网格视图">
            <el-button
              :type="viewMode === 'grid' ? 'primary' : 'default'"
              :icon="Grid"
              size="small"
              circle
              @click="viewMode = 'grid'"
            />
          </el-tooltip>
          <el-tooltip content="列表视图">
            <el-button
              :type="viewMode === 'list' ? 'primary' : 'default'"
              :icon="List"
              size="small"
              circle
              @click="viewMode = 'list'"
            />
          </el-tooltip>
        </div>

        <!-- 发布者视角：突出发布任务入口 -->
        <el-button
          v-if="auth.isPublisher"
          type="primary"
          @click="router.push('/publish-task')"
        >
          <el-icon><Plus /></el-icon> 发布任务
        </el-button>
      </div>
    </div>

    <!-- 任务列表 -->
    <div class="card">
      <div class="list-header">
        <span class="list-count">共 {{ total }} 个任务</span>
      </div>

      <el-skeleton :loading="loading" animated>
        <template #template>
          <div :class="viewMode === 'grid' ? 'task-grid' : 'task-list-view'">
            <el-skeleton-item v-for="i in 6" :key="i" variant="rect" style="height: 160px; border-radius: 8px" />
          </div>
        </template>
        <template #default>
          <el-empty v-if="taskList.length === 0" description="暂无任务" />
          <div v-else :class="viewMode === 'grid' ? 'task-grid' : 'task-list-view'">
            <TaskCard v-for="t in taskList" :key="t.id" :task="t" />
          </div>
        </template>
      </el-skeleton>

      <!-- 分页 -->
      <div class="pagination-wrap" v-if="total > filters.pageSize!">
        <el-pagination
          v-model:current-page="filters.page"
          :page-size="filters.pageSize"
          :total="total"
          layout="prev, pager, next, total"
          background
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Grid, List, Plus, Search } from '@element-plus/icons-vue'
</script>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.filter-section {
  padding: 16px 20px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  margin-bottom: 12px;
}

.reward-range {
  display: flex;
  align-items: center;
}

.sort-label {
  font-size: 13px;
  color: #595959;
  margin-right: 4px;
}

.sort-group {
  display: flex;
  align-items: center;
}

.list-header {
  margin-bottom: 14px;
}

.list-count {
  font-size: 13px;
  color: #8c8c8c;
}

.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.task-list-view {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
</style>
