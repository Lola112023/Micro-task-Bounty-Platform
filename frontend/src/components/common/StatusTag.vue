<script setup lang="ts">
import { computed } from 'vue'
import { TASK_STATUS_LABEL, APPLICATION_STATUS_LABEL } from '@/utils/format'

const props = defineProps<{
  status: string
  mode?: 'task' | 'application'
}>()

const TYPE_MAP: Record<string, string> = {
  PUBLISHING: 'primary',
  IN_PROGRESS: 'success',
  PENDING_CONFIRM: 'warning',
  COMPLETED: 'info',
  CANCELLED: 'danger',
  APPEALING: 'warning',
  PENDING: '',
  SELECTED: 'success',
  REJECTED: 'info',
}

const label = computed(() => {
  if (props.mode === 'application') return APPLICATION_STATUS_LABEL[props.status] ?? props.status
  return TASK_STATUS_LABEL[props.status] ?? props.status
})

const type = computed(() => TYPE_MAP[props.status] ?? 'info')
</script>

<template>
  <el-tag :type="(type as any)" size="small" disable-transitions>{{ label }}</el-tag>
</template>
