<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'
import { getNotifications, deleteNotification, batchDeleteNotifications } from '@/api/notification'
import type { NotificationItem } from '@/types/notification'
import { formatDateTime } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const notifStore = useNotificationStore()

const loading = ref(false)
const list = ref<NotificationItem[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20
const typeFilter = ref('')
const readFilter = ref<boolean | undefined>(undefined)
const selected = ref<number[]>([])

const typeOptions = [
  { label: '全部类型', value: '' },
  { label: '任务通知', value: 'TASK' },
  { label: '系统通知', value: 'SYSTEM' },
  { label: '评价通知', value: 'EVALUATION' },
  { label: '信用分', value: 'CREDIT_CHANGE' },
]

async function fetchList() {
  loading.value = true
  try {
    const res = await getNotifications({
      type: typeFilter.value || undefined,
      isRead: readFilter.value,
      page: page.value,
      pageSize,
    })
    list.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function handleReadAll() {
  await notifStore.readAll()
  fetchList()
}

async function handleDelete(id: number) {
  await deleteNotification(id)
  ElMessage.success('已删除')
  fetchList()
}

async function handleBatchDelete() {
  if (!selected.value.length) return
  await ElMessageBox.confirm(`确认删除选中的 ${selected.value.length} 条通知？`, '批量删除', {
    confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning'
  })
  await batchDeleteNotifications(selected.value)
  selected.value = []
  fetchList()
}

function handleClickItem(item: NotificationItem) {
  notifStore.readOne(item.id)
  list.value.find(n => n.id === item.id && (n.isRead = true))
  if (item.targetUrl) router.push(item.targetUrl)
}

onMounted(fetchList)
</script>

<template>
  <div class="card">
    <div class="notif-page-header">
      <h2>消息通知</h2>
      <div class="header-actions">
        <el-button v-if="selected.length > 0" type="danger" size="small" @click="handleBatchDelete">
          批量删除({{ selected.length }})
        </el-button>
        <el-button size="small" @click="handleReadAll">全部标记已读</el-button>
        <el-select v-model="typeFilter" size="small" style="width:120px" @change="() => { page=1; fetchList() }">
          <el-option v-for="t in typeOptions" :key="t.value" :label="t.label" :value="t.value" />
        </el-select>
        <el-radio-group v-model="readFilter" size="small" @change="() => { page=1; fetchList() }">
          <el-radio-button :value="undefined">全部</el-radio-button>
          <el-radio-button :value="false">未读</el-radio-button>
        </el-radio-group>
      </div>
    </div>

    <el-skeleton :loading="loading" :rows="5" animated>
      <template #default>
        <el-empty v-if="list.length === 0" description="暂无通知" />
        <div v-else class="notif-list">
          <div
            v-for="item in list"
            :key="item.id"
            class="notif-item"
            :class="{ unread: !item.isRead }"
            @click="handleClickItem(item)"
          >
            <el-checkbox
              :model-value="selected.includes(item.id)"
              @change="(v: boolean) => v ? selected.push(item.id) : selected.splice(selected.indexOf(item.id), 1)"
              @click.stop
            />
            <div class="notif-body">
              <div class="notif-title">{{ item.title }}</div>
              <div class="notif-content">{{ item.content }}</div>
              <div class="notif-time">{{ formatDateTime(item.createdAt) }}</div>
            </div>
            <div class="notif-actions" @click.stop>
              <el-button link size="small" @click="() => { notifStore.readOne(item.id); fetchList() }">已读</el-button>
              <el-button link size="small" type="danger" @click="handleDelete(item.id)">删除</el-button>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

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
.notif-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.notif-list { display: flex; flex-direction: column; gap: 2px; }
.notif-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
  border-bottom: 1px solid #f5f5f5;
}
.notif-item:hover { background: #f9f9f9; }
.notif-item.unread { background: #fafafa; }
.notif-body { flex: 1; }
.notif-title { font-weight: 600; font-size: 14px; margin-bottom: 3px; }
.notif-content { color: #595959; font-size: 13px; margin-bottom: 4px; }
.notif-time { font-size: 12px; color: #bbb; }
.notif-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.pagination-wrap { display: flex; justify-content: center; margin-top: 20px; }
</style>
