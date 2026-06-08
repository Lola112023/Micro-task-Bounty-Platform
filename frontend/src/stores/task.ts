import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TaskCategory, TaskListItem, TaskDetail } from '@/types/task'
import { getCategories } from '@/api/task'

export const useTaskStore = defineStore('task', () => {
  const categories = ref<TaskCategory[]>([])
  const currentTask = ref<TaskDetail | null>(null)
  const taskList = ref<TaskListItem[]>([])

  async function fetchCategories() {
    if (categories.value.length) return
    try {
      categories.value = await getCategories()
    } catch {
      // 静默失败，使用缓存
    }
  }

  function setCurrentTask(task: TaskDetail | null) {
    currentTask.value = task
  }

  function getCategoryName(id: number): string {
    return categories.value.find((c) => c.id === id)?.name ?? '未知分类'
  }

  return {
    categories,
    currentTask,
    taskList,
    fetchCategories,
    setCurrentTask,
    getCategoryName,
  }
})
