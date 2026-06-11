<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { sendBroadcast } from '@/api/admin'
import { formatDateTime } from '@/utils/format'
import { ElMessage } from 'element-plus'

const sending = ref(false)
const form = ref({
  title: '',
  content: '',
  targetScope: 'all' as 'all' | 'publisher' | 'taker' | 'specific',
  targetIds: [] as string[],
  strongAlert: false,
  scheduledAt: '',
})
const specificIds = ref('')
const historyList = ref<{ id: number; title: string; targetScope: string; sentAt: string; readCount: number }[]>([])

async function handleSend() {
  if (!form.value.title.trim()) { ElMessage.error('请填写标题'); return }
  if (!form.value.content.trim()) { ElMessage.error('请填写正文'); return }
  if (form.value.content.length > 1000) { ElMessage.error('正文不超过1000字'); return }
  if (form.value.targetScope === 'specific') {
    form.value.targetIds = specificIds.value.split(/[\n,，]+/).map(s => s.trim()).filter(Boolean)
    if (!form.value.targetIds.length) { ElMessage.error('请填写学号列表'); return }
  }
  sending.value = true
  try {
    await sendBroadcast(form.value)
    ElMessage.success('公告已发送')
    form.value = { title: '', content: '', targetScope: 'all', targetIds: [], strongAlert: false, scheduledAt: '' }
    specificIds.value = ''
    loadHistory()
  } finally { sending.value = false }
}

async function loadHistory() {
  historyList.value = []
}

onMounted(loadHistory)
</script>

<template>
  <div>
    <h2 style="margin-bottom:20px">📢 消息广播</h2>

    <div class="card" style="margin-bottom:16px">
      <div class="card-title">发布公告</div>
      <el-form label-position="top">
        <el-form-item label="标题">
          <el-input v-model="form.title" placeholder="请输入公告标题" :maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="正文（最长1000字）">
          <el-input v-model="form.content" type="textarea" :rows="6"
            :maxlength="1000" show-word-limit placeholder="请输入公告内容" />
        </el-form-item>
        <div class="form-row">
          <el-form-item label="发送范围" style="flex:1">
            <el-select v-model="form.targetScope" style="width:100%">
              <el-option label="全部用户" value="all" />
              <el-option label="仅发布者" value="publisher" />
              <el-option label="仅接单者" value="taker" />
              <el-option label="指定学号" value="specific" />
            </el-select>
          </el-form-item>
          <el-form-item label="定时发送（可选）" style="flex:1">
            <el-date-picker v-model="form.scheduledAt" type="datetime"
              placeholder="不填则立即发送" style="width:100%" />
          </el-form-item>
        </div>
        <div v-if="form.targetScope === 'specific'" style="margin-bottom:16px">
          <el-input v-model="specificIds" type="textarea" :rows="4"
            placeholder="每行或逗号分隔一个学号/工号" />
        </div>
        <el-form-item>
          <el-checkbox v-model="form.strongAlert">强提醒（跑马灯或弹窗）</el-checkbox>
        </el-form-item>
        <el-button type="primary" :loading="sending" @click="handleSend">
          📤 发送公告
        </el-button>
      </el-form>
    </div>

    <div class="card">
      <div class="card-title">历史广播记录</div>
      <el-table :data="historyList" empty-text="暂无记录">
        <el-table-column prop="title" label="标题" min-width="160" show-overflow-tooltip />
        <el-table-column label="发送范围" width="120">
          <template #default="{ row }">
            {{ { all:'全部', publisher:'仅发布者', taker:'仅接单者', specific:'指定学号' }[row.targetScope as string] ?? row.targetScope }}
          </template>
        </el-table-column>
        <el-table-column label="发送时间" width="155">
          <template #default="{ row }">{{ formatDateTime(row.sentAt) }}</template>
        </el-table-column>
        <el-table-column label="已读数" width="80">
          <template #default="{ row }">{{ row.readCount }}</template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.form-row { display:flex; gap:16px; }
</style>
