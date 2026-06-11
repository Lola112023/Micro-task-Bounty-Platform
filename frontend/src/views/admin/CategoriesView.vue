<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getAdminCategories, createCategory, updateCategory, deleteCategory } from '@/api/admin'
import type { TaskCategory } from '@/types/task'
import { ElMessage, ElMessageBox } from 'element-plus'

const list = ref<TaskCategory[]>([])
const loading = ref(false)
const addForm = ref({ name: '', sortOrder: 0 })
const editTarget = ref<TaskCategory | null>(null)
const editDialogVisible = ref(false)
const editForm = ref({ name: '', sortWeight: 0 })

async function fetchList() {
  loading.value = true
  try { list.value = await getAdminCategories() } finally { loading.value = false }
}

async function handleAdd() {
  if (!addForm.value.name.trim()) { ElMessage.error('请填写分类名称'); return }
  if (addForm.value.name.length > 10) { ElMessage.error('分类名称不超过10字'); return }
  await createCategory(addForm.value)
  ElMessage.success('分类已添加')
  addForm.value = { name: '', sortOrder: 0 }
  fetchList()
}

function openEdit(cat: TaskCategory) {
  editTarget.value = cat
  editForm.value = { name: cat.name, sortWeight: cat.sortWeight }
  editDialogVisible.value = true
}

async function confirmEdit() {
  if (!editTarget.value) return
  await updateCategory(editTarget.value.id, editForm.value)
  ElMessage.success('已更新')
  editDialogVisible.value = false
  fetchList()
}

async function handleDelete(cat: TaskCategory) {
  if (cat.taskCount && cat.taskCount > 0) {
    ElMessage.error(`该分类下有 ${cat.taskCount} 个任务，请先迁移后再删除`)
    return
  }
  await ElMessageBox.confirm(`确认删除分类「${cat.name}」？`, '删除确认', {
    confirmButtonText: '确认删除', cancelButtonText: '取消', type: 'warning'
  })
  await deleteCategory(cat.id)
  ElMessage.success('已删除')
  fetchList()
}

async function handleToggle(cat: TaskCategory) {
  await updateCategory(cat.id, { ...cat, enabled: !cat.enabled })
  ElMessage.success(cat.enabled ? '已禁用' : '已启用')
  fetchList()
}

onMounted(fetchList)
</script>

<template>
  <div>
    <h2 style="margin-bottom:20px">🏷️ 分类管理</h2>

    <!-- 添加 -->
    <div class="card" style="margin-bottom:16px">
      <div class="card-title">添加新分类</div>
      <div class="add-row">
        <el-input v-model="addForm.name" placeholder="分类名称（最长10字）" style="width:200px"
          :maxlength="10" show-word-limit />
        <el-button type="primary" @click="handleAdd">➕ 添加</el-button>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="card">
      <div class="card-title">分类列表</div>
      <el-table v-loading="loading" :data="list" style="width:100%" empty-text="暂无分类">
        <el-table-column prop="name" label="分类名称" width="160" />
        <el-table-column prop="sortWeight" label="排序权重" width="100" />
        <el-table-column label="启用状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'" size="small">
              {{ row.enabled ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="任务数" width="90">
          <template #default="{ row }">{{ row.taskCount ?? '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" link @click="openEdit(row)">编辑</el-button>
            <el-button size="small" link :type="row.enabled ? 'warning' : 'success'"
              @click="handleToggle(row)">
              {{ row.enabled ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" link type="danger" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑分类" width="380px">
      <el-form label-position="top">
        <el-form-item label="分类名称">
          <el-input v-model="editForm.name" :maxlength="10" show-word-limit />
        </el-form-item>
        <el-form-item label="排序权重">
          <el-input-number v-model="editForm.sortWeight" :min="0" controls-position="right" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.add-row { display:flex; gap:12px; align-items:center; }
</style>
