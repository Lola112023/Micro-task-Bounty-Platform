<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { TaskListItem } from '@/types/task'
import { formatRemainingTime, formatDateTime } from '@/utils/format'
import StatusTag from './StatusTag.vue'

const props = defineProps<{ task: TaskListItem }>()
const router = useRouter()

const timeDisplay = computed(() => {
  if (props.task.status === 'PUBLISHING') {
    if (props.task.remainingListTime) return `剩余上架 ${props.task.remainingListTime}`
    return '待中标后计时'
  }
  if (props.task.deadlineAt) return `截止 ${formatRemainingTime(props.task.deadlineAt)}`
  return formatDateTime(props.task.publishedAt)
})

function goDetail() {
  router.push(`/task/${props.task.id}`)
}
</script>

<template>
  <div class="task-card" @click="goDetail">
    <div class="task-card-header">
      <span class="task-title" :title="task.title">{{ task.title }}</span>
      <StatusTag :status="task.status" />
    </div>

    <div class="task-tags">
      <el-tag type="primary" size="small" effect="plain">{{ task.categoryName }}</el-tag>
      <el-tag type="info" size="small" effect="plain">{{ task.campus }}</el-tag>
    </div>

    <div class="task-footer">
      <span class="task-reward">{{ task.reward }} 积分</span>
      <div class="task-meta">
        <span class="task-publisher">{{ task.publisherNickname }}</span>
        <span class="task-time">{{ timeDisplay }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.task-card {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.task-card:hover {
  border-color: #2e7bd6;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.14);
  transform: translateY(-2px);
}

.task-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.task-title {
  font-size: 15px;
  font-weight: 600;
  color: #262626;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.task-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.task-reward {
  font-size: 18px;
  font-weight: bold;
  color: #fa8c16;
}

.task-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.task-publisher {
  font-size: 12px;
  color: #8c8c8c;
}

.task-time {
  font-size: 12px;
  color: #8c8c8c;
}
</style>
