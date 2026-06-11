<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useTaskStore } from '@/stores/task'
import { publishTask, getTaskDetail, editTask } from '@/api/task'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const taskStore = useTaskStore()

const formRef = ref<FormInstance>()
const loading = ref(false)
const editId = computed(() => route.query.edit ? Number(route.query.edit) : null)
const isEdit = computed(() => !!editId.value)

const form = reactive({
  title: '',
  description: '',
  categoryId: undefined as number | undefined,
  campus: '',
  durationMinutes: 2880,
  reward: 50,
  listDays: 7,
})
const files = ref<File[]>([])
const fileList = computed(() => files.value.map(f => ({ name: f.name, size: f.size })))

const rules: FormRules = {
  title: [
    { required: true, message: '请填写任务名称', trigger: 'blur' },
    { max: 30, message: '任务名称不超过30字', trigger: 'blur' },
  ],
  description: [
    { required: true, message: '请填写任务描述', trigger: 'blur' },
    { max: 2000, message: '描述不超过2000字', trigger: 'blur' },
  ],
  categoryId: [{ required: true, message: '请选择任务分类', trigger: 'change' }],
  campus: [{ required: true, message: '请选择校区', trigger: 'change' }],
  durationMinutes: [
    {
      validator: (_: any, v: number, cb: (e?: Error) => void) => {
        if (v < 30 || v > 43200) cb(new Error('截止时长需在30~43200分钟之间'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
  reward: [
    {
      validator: (_: any, v: number, cb: (e?: Error) => void) => {
        if (!Number.isInteger(v) || v < 1 || v > 5000) cb(new Error('报酬需在1~5000积分之间'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
  listDays: [
    {
      validator: (_: any, v: number, cb: (e?: Error) => void) => {
        if (v < 1 || v > 14) cb(new Error('上架天数需在1~14天之间'))
        else cb()
      },
      trigger: 'blur',
    },
  ],
}

const pointsBalance = computed(() => auth.user?.points ?? 0)
const frozenPoints = computed(() => form.reward)
const canAfford = computed(() => pointsBalance.value >= frozenPoints.value)

onMounted(async () => {
  await taskStore.fetchCategories()
  if (editId.value) {
    try {
      const detail = await getTaskDetail(editId.value)
      form.title = detail.title
      form.description = detail.description
      form.categoryId = detail.categoryId
      form.campus = detail.campus
      form.durationMinutes = detail.durationMinutes
      form.reward = detail.reward
      form.listDays = detail.listDays
    } catch {
      ElMessage.error('加载任务信息失败')
    }
  }
})

function handleFileChange(file: any) {
  if (files.value.length >= 3) {
    ElMessage.warning('最多上传3个附件')
    return false
  }
  if (file.size > 20 * 1024 * 1024) {
    ElMessage.warning('单个文件不超过20MB')
    return false
  }
  const totalSize = files.value.reduce((s, f) => s + f.size, 0) + file.size
  if (totalSize > 30 * 1024 * 1024) {
    ElMessage.warning('附件总大小不超过30MB')
    return false
  }
  files.value.push(file.raw)
  return false // 阻止自动上传
}

function handleFileRemove(file: any) {
  const idx = files.value.findIndex(f => f.name === file.name && f.size === file.size)
  if (idx >= 0) {
    files.value.splice(idx, 1)
  }
}

async function handleSubmit() {
  await formRef.value?.validate()
  if (!canAfford.value) {
    ElMessage.error('积分余额不足，无法发布任务')
    return
  }
  await ElMessageBox.confirm(
    `发布后将冻结 ${frozenPoints.value} 积分，确认发布？`,
    '确认发布', { confirmButtonText: '确认发布', cancelButtonText: '取消', type: 'info' }
  )
  loading.value = true
  const fd = new FormData()
  fd.append('request', new Blob([JSON.stringify({...form})], { type: 'application/json' }))
  files.value.forEach(f => fd.append('files', f))
  try {
    if (isEdit.value && editId.value) {
      await editTask(editId.value, fd)
      ElMessage.success('任务已更新')
    } else {
      await publishTask(fd)
      ElMessage.success('任务发布成功，已冻结积分')
    }
    router.push('/my-tasks')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="card" style="max-width: 780px; margin: 0 auto">
    <h2 class="card-title">{{ isEdit ? '编辑任务' : '发布新任务' }}</h2>

    <el-form ref="formRef" :model="form" :rules="rules" label-position="top" size="default">
      <el-form-item label="任务名称" prop="title">
        <el-input v-model="form.title" :maxlength="30" show-word-limit placeholder="最多30字" />
      </el-form-item>

      <el-form-item label="详细描述" prop="description">
        <el-input
          v-model="form.description"
          type="textarea"
          :rows="6"
          :maxlength="2000"
          show-word-limit
          placeholder="请详细描述任务内容、要求等（最长2000字，仅支持纯文本）"
        />
      </el-form-item>

      <div class="form-row">
        <el-form-item label="任务分类" prop="categoryId" style="flex:1">
          <el-select v-model="form.categoryId" placeholder="请选择分类" style="width:100%">
            <el-option
              v-for="cat in taskStore.categories.filter(c => c.enabled)"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="校区" prop="campus" style="flex:1">
          <el-select v-model="form.campus" placeholder="请选择校区" style="width:100%">
            <el-option label="良乡校区" value="良乡校区" />
            <el-option label="中关村校区" value="中关村校区" />
            <el-option label="两校区往返" value="两校区往返" />
          </el-select>
        </el-form-item>
      </div>

      <div class="form-row">
        <el-form-item label="截止时长（分钟）" prop="durationMinutes" style="flex:1">
          <el-input-number
            v-model="form.durationMinutes"
            :min="30"
            :max="43200"
            controls-position="right"
            style="width:100%"
          />
          <div class="form-hint">30分钟 ~ 43200分钟（30天），从中标时刻开始计时</div>
        </el-form-item>

        <el-form-item label="预估报酬（积分）" prop="reward" style="flex:1">
          <el-input-number
            v-model="form.reward"
            :min="1"
            :max="5000"
            controls-position="right"
            style="width:100%"
          />
          <div class="form-hint">当前余额：{{ pointsBalance }} 积分</div>
        </el-form-item>
      </div>

      <el-form-item label="任务展示天数" prop="listDays">
        <el-input-number
          v-model="form.listDays"
          :min="1"
          :max="14"
          controls-position="right"
          style="width:200px"
        />
        <div class="form-hint">任务在大厅展示的时长（1~14天），超时无人接单将自动取消，积分全额退回</div>
      </el-form-item>

      <el-form-item label="附件（可选）">
        <el-upload
          :auto-upload="false"
          :on-change="handleFileChange"
          :on-remove="handleFileRemove"
          :limit="3"
          :file-list="fileList"
          accept=".zip,.rar,.jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
          multiple
        >
          <el-button>选择文件</el-button>
          <template #tip>
            <div class="form-hint">支持 zip/rar/图片/文档，单个≤20MB，最多3个，总计≤30MB</div>
          </template>
        </el-upload>
      </el-form-item>
    </el-form>

    <!-- 冻结积分提示 -->
    <el-alert
      :type="canAfford ? 'info' : 'error'"
      :closable="false"
      style="margin-bottom: 20px"
    >
      💰 发布后将冻结 <strong>{{ frozenPoints }}</strong> 积分作为报酬
      <span v-if="!canAfford" style="color:#ff4d4f">（余额不足，无法发布）</span>
    </el-alert>

    <div class="form-actions">
      <el-button type="primary" :loading="loading" :disabled="!canAfford" @click="handleSubmit">
        {{ isEdit ? '保存修改' : '提交发布' }}
      </el-button>
      <el-button @click="router.push('/task-hall')">取消</el-button>
    </div>
  </div>
</template>

<style scoped>
.form-row {
  display: flex;
  gap: 20px;
}
.form-hint {
  font-size: 12px;
  color: #8c8c8c;
  margin-top: 4px;
  line-height: 1.5;
}
.form-actions {
  display: flex;
  gap: 12px;
}
</style>
