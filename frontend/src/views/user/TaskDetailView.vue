<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  getTaskDetail, getTaskApplications, getMessages, sendMessage,
  selectWinner, deliverTask, confirmTask, rejectDelivery,
  forceCancel, extendDeadline, removeTask,
  applyTask, requestCancel, appealTask, evaluateTask, reportTask,
} from '@/api/task'
import type { TaskDetail, TaskApplication, TaskMessage } from '@/types/task'
import { formatDateTime, formatRemainingTime } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import StatusTag from '@/components/common/StatusTag.vue'

const props = defineProps<{ taskId: string }>()
const router = useRouter()
const auth = useAuthStore()

// ── 数据 ──────────────────────────────────────────────────────────────────────
const task = ref<TaskDetail | null>(null)
const applications = ref<TaskApplication[]>([])
const messages = ref<TaskMessage[]>([])
const loading = ref(true)

// ── 弹窗控制 ──────────────────────────────────────────────────────────────────
const applyVisible = ref(false)
const deliverVisible = ref(false)
const reportVisible = ref(false)
const appealVisible = ref(false)
const evaluateVisible = ref(false)
const cancelRequestVisible = ref(false)
const rejectVisible = ref(false)

// ── 表单数据 ──────────────────────────────────────────────────────────────────
const applyReason = ref('')
const deliverText = ref('')
const deliverFiles = ref<File[]>([])
const reportType = ref('')
const reportEvidence = ref('')
const appealReason = ref('')
const evaluateStars = ref(5)
const evaluateComment = ref('')
const cancelReason = ref('')
const msgContent = ref('')
const rejectReason = ref('')

// ── 频控 ──────────────────────────────────────────────────────────────────────
const msgCount = ref(0)
const msgLocked = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

// ── 计算属性 ──────────────────────────────────────────────────────────────────
const isPublisher = computed(() => task.value?.publisherId === auth.user?.id)
const isWinner = computed(() => task.value?.winnerId === auth.user?.id)
const canUseMsgBoard = computed(() =>
  ['IN_PROGRESS', 'PENDING_CONFIRM', 'APPEALING'].includes(task.value?.status ?? '')
)
const remainingTime = computed(() =>
  task.value?.deadlineAt ? formatRemainingTime(task.value.deadlineAt) : '-'
)

// ── 数据加载 ──────────────────────────────────────────────────────────────────
async function loadTask() {
  loading.value = true
  try {
    task.value = await getTaskDetail(Number(props.taskId))
    if (task.value.status === 'PUBLISHING' && isPublisher.value) {
      applications.value = await getTaskApplications(Number(props.taskId))
    }
    if (canUseMsgBoard.value) {
      messages.value = await getMessages(Number(props.taskId))
    }
  } finally {
    loading.value = false
  }
}

// ── 操作方法 ──────────────────────────────────────────────────────────────────
async function handleApply() {
  if (applyReason.value.length < 10 || applyReason.value.length > 200) {
    ElMessage.warning('申请理由需在10~200字之间'); return
  }
  await applyTask(Number(props.taskId), applyReason.value)
  ElMessage.success('申请已提交')
  applyVisible.value = false
  loadTask()
}

async function handleSelectWinner(appId: number, nickname: string) {
  await ElMessageBox.confirm(`确认选择「${nickname}」为中标者？`, '确认中标', {
    confirmButtonText: '确认', cancelButtonText: '取消', type: 'info',
  })
  await selectWinner(Number(props.taskId), appId)
  ElMessage.success('已选定中标者')
  loadTask()
}

async function handleDeliver() {
  if (!deliverText.value.trim()) { ElMessage.warning('请填写交付说明'); return }
  const fd = new FormData()
  fd.append('text', deliverText.value)
  deliverFiles.value.forEach(f => fd.append('files', f))
  await deliverTask(Number(props.taskId), fd)
  ElMessage.success('交付物已提交')
  deliverVisible.value = false
  loadTask()
}

async function handleConfirm() {
  await ElMessageBox.confirm(
    '确认完成后积分立即划转，无法撤回。确认吗？',
    '⚠️ 确认完成', { confirmButtonText: '确认完成', cancelButtonText: '取消', type: 'warning' }
  )
  await confirmTask(Number(props.taskId))
  ElMessage.success('任务已完成，积分已划转')
  loadTask()
}

async function handleReject() {
  await rejectDelivery(Number(props.taskId), rejectReason.value)
  ElMessage.success('已退回修改')
  rejectVisible.value = false
  loadTask()
}

async function handleForceCancel() {
  await ElMessageBox.confirm('确认强制取消？接单者记录超时扣分。', '强制取消', {
    confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning',
  })
  await forceCancel(Number(props.taskId))
  ElMessage.success('任务已强制取消')
  loadTask()
}

async function handleRemoveTask() {
  await ElMessageBox.confirm('下架任务将扣除5%冻结积分，确认下架？', '下架任务', {
    confirmButtonText: '确认下架', cancelButtonText: '取消', type: 'warning',
  })
  await removeTask(Number(props.taskId))
  ElMessage.success('任务已下架')
  router.push('/my-tasks')
}

async function handleExtend() {
  await ElMessageBox.confirm('确认延长截止时间？（每次延长50%，最多2次）', '延长截止', {
    confirmButtonText: '确认', cancelButtonText: '取消',
  })
  await extendDeadline(Number(props.taskId))
  ElMessage.success('截止时间已延长')
  loadTask()
}

async function handleRequestCancel() {
  if (!cancelReason.value.trim()) { ElMessage.warning('请填写取消理由'); return }
  await requestCancel(Number(props.taskId), cancelReason.value)
  ElMessage.success('取消申请已提交')
  cancelRequestVisible.value = false
  loadTask()
}

async function handleReport() {
  if (!reportType.value) { ElMessage.warning('请选择举报类型'); return }
  await reportTask(Number(props.taskId), reportType.value, reportEvidence.value)
  ElMessage.success('举报已提交')
  reportVisible.value = false
}

async function handleAppeal() {
  if (!appealReason.value.trim()) { ElMessage.warning('请填写申诉理由'); return }
  await appealTask(Number(props.taskId), appealReason.value)
  ElMessage.success('申诉已提交，管理员将在24小时内处理')
  appealVisible.value = false
  loadTask()
}

async function handleEvaluate() {
  await evaluateTask(Number(props.taskId), evaluateStars.value, evaluateComment.value)
  ElMessage.success('评价已提交')
  evaluateVisible.value = false
  loadTask()
}

async function handleSendMsg() {
  if (!msgContent.value.trim()) return
  if (msgContent.value.length > 50) { ElMessage.warning('消息不超过50字'); return }
  if (msgLocked.value) { ElMessage.warning('发送太频繁，每分钟最多5条'); return }
  await sendMessage(Number(props.taskId), msgContent.value)
  msgContent.value = ''
  msgCount.value++
  if (msgCount.value >= 5) {
    msgLocked.value = true
    setTimeout(() => { msgLocked.value = false; msgCount.value = 0 }, 60000)
  }
  messages.value = await getMessages(Number(props.taskId))
}

function handleDeliverFileChange(file: { raw?: File }) {
  if (file.raw) deliverFiles.value.push(file.raw)
}

onMounted(() => {
  loadTask()
  pollTimer = setInterval(async () => {
    if (canUseMsgBoard.value && task.value) {
      messages.value = await getMessages(Number(props.taskId))
    }
  }, 10000)
})
onUnmounted(() => { if (pollTimer) clearInterval(pollTimer) })
</script>

<template>
  <div v-if="loading" style="padding:40px"><el-skeleton :rows="8" animated /></div>

  <div v-else-if="!task" style="text-align:center;padding:60px">
    <el-empty description="任务不存在或已删除" />
    <el-button style="margin-top:16px" @click="router.back()">返回</el-button>
  </div>

  <div v-else>
    <el-button link style="margin-bottom:16px" @click="router.back()">
      <el-icon><ArrowLeft /></el-icon> 返回
    </el-button>

    <div class="detail-layout">
      <!-- ── 左侧主内容 ── -->
      <div class="detail-main">
        <!-- 基本信息 -->
        <div class="card">
          <div class="title-row">
            <h2 class="task-name">{{ task.title }}</h2>
            <StatusTag :status="task.status" />
          </div>
          <div class="tags-row">
            <el-tag type="primary" effect="plain">{{ task.categoryName }}</el-tag>
            <el-tag type="info" effect="plain">{{ task.campus }}</el-tag>
            <span class="reward-text">{{ task.reward }} 积分</span>
          </div>

          <div v-if="['IN_PROGRESS','APPEALING'].includes(task.status)" class="countdown">
            <el-icon><Timer /></el-icon>
            剩余：<strong>{{ remainingTime }}</strong>
            <el-tag v-if="task.status === 'APPEALING'" type="warning" size="small" style="margin-left:8px">申诉中</el-tag>
          </div>

          <el-divider />

          <div class="block-title">任务描述</div>
          <p class="task-desc">{{ task.description }}</p>

          <div class="info-grid">
            <div><span class="info-label">校区：</span>{{ task.campus }}</div>
            <div><span class="info-label">截止时长：</span>{{ task.durationMinutes }} 分钟</div>
            <div><span class="info-label">发布时间：</span>{{ formatDateTime(task.publishedAt) }}</div>
            <div><span class="info-label">上架天数：</span>{{ task.listDays }} 天</div>
          </div>

          <div v-if="task.attachments?.length" style="margin-top:14px">
            <div class="block-title">附件</div>
            <div v-for="att in task.attachments" :key="att.id" class="att-item">
              <el-icon><Paperclip /></el-icon>
              <a :href="att.url" target="_blank">{{ att.filename }}</a>
              <span class="att-size">({{ (att.size / 1048576).toFixed(2) }}MB)</span>
            </div>
          </div>
        </div>

        <!-- 交付物展示 -->
        <div v-if="['PENDING_CONFIRM','COMPLETED'].includes(task.status) && task.deliveryText" class="card">
          <div class="block-title">📦 交付物</div>
          <p style="white-space:pre-wrap;color:#595959;line-height:1.8">{{ task.deliveryText }}</p>
          <div v-for="att in (task.deliveryAttachments || [])" :key="att.id" class="att-item" style="margin-top:6px">
            <el-icon><Paperclip /></el-icon>
            <a :href="att.url" target="_blank">{{ att.filename }}</a>
          </div>
        </div>

        <!-- 申诉结果 -->
        <div v-if="task.appealResult" class="card">
          <div class="block-title">⚖️ 申诉裁定结果</div>
          <p style="color:#595959">{{ task.appealResult }}</p>
        </div>

        <!-- 留言板 -->
        <div v-if="canUseMsgBoard" class="card">
          <div class="block-title">💬 留言板</div>
          <div class="msg-list">
            <div v-if="!messages.length" class="msg-empty">暂无留言</div>
            <div v-for="msg in messages" :key="msg.id" class="msg-item">
              <div class="msg-header">
                <span class="msg-sender">{{ msg.senderNickname }}</span>
                <span class="msg-time">{{ formatDateTime(msg.sentAt) }}</span>
              </div>
              <div class="msg-content">{{ msg.content }}</div>
            </div>
          </div>
          <div class="msg-input-row">
            <el-input v-model="msgContent" :maxlength="50" show-word-limit
              placeholder="输入消息（最多50字）" @keyup.enter.exact="handleSendMsg" />
            <el-button type="primary" :disabled="msgLocked" @click="handleSendMsg">发送</el-button>
          </div>
          <div v-if="msgLocked" style="font-size:12px;color:#ff4d4f;margin-top:4px">发送频率过高，请稍候</div>
        </div>
      </div>

      <!-- ── 右侧操作栏 ── -->
      <div class="detail-sidebar">
        <!-- 发布者信息 -->
        <div class="card">
          <div class="block-title">发布者</div>
          <div class="publisher-row">
            <el-avatar style="background:#1e56a0">{{ task.publisherNickname.charAt(0) }}</el-avatar>
            <div style="flex:1">
              <div class="publisher-name" @click="router.push(`/user/${task.publisherId}`)">
                {{ task.publisherNickname }}
              </div>
              <div style="font-size:12px;color:#8c8c8c">
                信用分 {{ task.publisherCreditScore }}
                <span v-if="task.publisherCompletionRate !== null">
                  · 完成率 {{ (task.publisherCompletionRate * 100).toFixed(1) }}%
                </span>
              </div>
              <div v-if="task.publisherAnnouncement" style="font-size:12px;color:#595959;margin-top:3px">
                {{ task.publisherAnnouncement }}
              </div>
            </div>
          </div>
          <el-button size="small" style="width:100%;margin-top:10px" @click="reportVisible=true">
            🚨 举报此任务
          </el-button>
        </div>

        <!-- 操作按钮 -->
        <div class="card">
          <div class="block-title">操作</div>

          <!-- 发布中 — 接单者 -->
          <div v-if="task.status === 'PUBLISHING' && !isPublisher">
            <el-button type="primary" style="width:100%" :disabled="!task.canApply"
              @click="applyVisible=true">申请接单</el-button>
            <div v-if="!task.canApply && task.canApplyReason"
              style="font-size:12px;color:#ff4d4f;margin-top:6px;text-align:center">
              {{ task.canApplyReason }}
            </div>
          </div>

          <!-- 发布中 — 发布者 -->
          <div v-if="task.status === 'PUBLISHING' && isPublisher" class="action-col">
            <el-button style="width:100%" @click="router.push(`/publish-task?edit=${task.id}`)">
              编辑任务
            </el-button>
            <el-button type="danger" plain style="width:100%" @click="handleRemoveTask">
              下架任务
            </el-button>
          </div>

          <!-- 进行中 — 接单者 -->
          <div v-if="task.status === 'IN_PROGRESS' && isWinner" class="action-col">
            <el-button type="primary" style="width:100%" @click="deliverVisible=true">提交交付物</el-button>
            <el-button style="width:100%" @click="cancelRequestVisible=true">申请取消</el-button>
            <el-button type="warning" plain style="width:100%" @click="appealVisible=true">发起申诉</el-button>
          </div>

          <!-- 进行中 — 发布者 -->
          <div v-if="task.status === 'IN_PROGRESS' && isPublisher" class="action-col">
            <el-button style="width:100%" :disabled="task.extendCount >= 2" @click="handleExtend">
              延长截止时间 ({{ task.extendCount }}/2)
            </el-button>
            <el-button type="danger" plain style="width:100%" @click="handleForceCancel">强制取消</el-button>
            <el-button type="warning" plain style="width:100%" @click="appealVisible=true">发起申诉</el-button>
          </div>

          <!-- 待确认 — 发布者 -->
          <div v-if="task.status === 'PENDING_CONFIRM' && isPublisher" class="action-col">
            <el-button type="success" style="width:100%" @click="handleConfirm">确认完成</el-button>
            <el-button style="width:100%" @click="rejectVisible=true">退回修改</el-button>
            <el-button type="warning" plain style="width:100%" @click="appealVisible=true">发起申诉</el-button>
          </div>

          <!-- 待确认 — 接单者 -->
          <div v-if="task.status === 'PENDING_CONFIRM' && isWinner" class="action-col">
            <el-button type="warning" plain style="width:100%" @click="appealVisible=true">发起申诉</el-button>
          </div>

          <!-- 已完成 — 评价入口 -->
          <div v-if="task.status === 'COMPLETED'" class="action-col">
            <el-button type="primary" plain style="width:100%" @click="evaluateVisible=true">
              ⭐ 去评价
            </el-button>
          </div>
        </div>

        <!-- 申请列表（发布者 & 发布中） -->
        <div v-if="task.status === 'PUBLISHING' && isPublisher && applications?.length" class="card">
          <div class="block-title">申请列表（{{ applications.length }}人）</div>
          <div v-for="app in applications" :key="app.id" class="app-item">
            <div class="app-info">
              <span class="app-name">{{ app.applicantNickname }}</span>
              <span style="font-size:12px;color:#52c41a">信用 {{ app.applicantCreditScore }}</span>
            </div>
            <div style="font-size:13px;color:#595959;margin:3px 0">{{ app.reason }}</div>
            <div style="font-size:12px;color:#aaa">{{ formatDateTime(app.appliedAt) }}</div>
            <el-button v-if="app.status === 'REVIEWING'" type="primary" size="small" style="margin-top:6px"
              @click="handleSelectWinner(app.id, app.applicantNickname)">
              选为中标者
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- ── 弹窗 ── -->
    <el-dialog v-model="applyVisible" title="申请接单" width="480px">
      <el-input v-model="applyReason" type="textarea" :rows="4"
        placeholder="请说明您的技能或经验（10~200字）" :maxlength="200" show-word-limit />
      <template #footer>
        <el-button @click="applyVisible=false">取消</el-button>
        <el-button type="primary" @click="handleApply">提交申请</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="deliverVisible" title="提交交付物" width="560px">
      <el-input v-model="deliverText" type="textarea" :rows="5"
        placeholder="交付说明（最长1000字）" :maxlength="1000" show-word-limit style="margin-bottom:12px" />
      <el-upload :auto-upload="false" multiple :limit="3"
        :on-change="handleDeliverFileChange"
        accept=".zip,.rar,.jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx">
        <el-button>上传附件（最多3个，总计≤30MB）</el-button>
      </el-upload>
      <template #footer>
        <el-button @click="deliverVisible=false">取消</el-button>
        <el-button type="primary" @click="handleDeliver">提交交付</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="rejectVisible" title="退回修改" width="480px">
      <el-input v-model="rejectReason" type="textarea" :rows="3"
        placeholder="退回原因（可选）" :maxlength="200" show-word-limit />
      <template #footer>
        <el-button @click="rejectVisible=false">取消</el-button>
        <el-button type="warning" @click="handleReject">确认退回</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="reportVisible" title="举报任务" width="480px">
      <el-form label-position="top">
        <el-form-item label="举报类型">
          <el-select v-model="reportType" style="width:100%">
            <el-option label="涉黄" value="porn" />
            <el-option label="涉暴" value="violence" />
            <el-option label="诈骗" value="fraud" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="举报证据（100字以内）">
          <el-input v-model="reportEvidence" type="textarea" :rows="3" :maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportVisible=false">取消</el-button>
        <el-button type="danger" @click="handleReport">提交举报</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="appealVisible" title="发起申诉" width="480px">
      <el-alert type="info" :closable="false" style="margin-bottom:12px">管理员将在24小时内处理</el-alert>
      <el-input v-model="appealReason" type="textarea" :rows="4"
        placeholder="请详细说明申诉理由" :maxlength="500" show-word-limit />
      <template #footer>
        <el-button @click="appealVisible=false">取消</el-button>
        <el-button type="warning" @click="handleAppeal">提交申诉</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="evaluateVisible" title="评价" width="480px">
      <el-form label-position="top">
        <el-form-item label="星级评分">
          <el-rate v-model="evaluateStars" :max="5" />
        </el-form-item>
        <el-form-item label="文字评价（可选，最长500字）">
          <el-input v-model="evaluateComment" type="textarea" :rows="3" :maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="evaluateVisible=false">取消</el-button>
        <el-button type="primary" @click="handleEvaluate">提交评价</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="cancelRequestVisible" title="申请取消订单" width="480px">
      <el-input v-model="cancelReason" type="textarea" :rows="3"
        placeholder="取消原因（200字以内）" :maxlength="200" show-word-limit />
      <template #footer>
        <el-button @click="cancelRequestVisible=false">取消</el-button>
        <el-button type="warning" @click="handleRequestCancel">提交申请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 310px;
  gap: 20px;
  align-items: start;
}
.detail-main { min-width: 0; }
.detail-sidebar { min-width: 0; }
.title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 10px;
}
.task-name { font-size: 20px; font-weight: 700; flex: 1; }
.tags-row { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.reward-text { font-size: 20px; font-weight: 700; color: #fa8c16; margin-left: auto; }
.countdown {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px; background: #fff7e6; border-radius: 6px;
  color: #d46b08; font-size: 13px; margin-bottom: 10px;
}
.block-title { font-weight: 600; margin-bottom: 8px; }
.task-desc { white-space: pre-wrap; line-height: 1.8; color: #595959; }
.info-grid {
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 8px; margin-top: 12px; font-size: 13px; color: #595959;
}
.info-label { font-weight: 500; color: #262626; margin-right: 4px; }
.att-item { display: flex; align-items: center; gap: 6px; font-size: 13px; padding: 3px 0; }
.att-item a { color: #1e56a0; text-decoration: none; }
.att-item a:hover { text-decoration: underline; }
.att-size { color: #aaa; }
/* 留言板 */
.msg-list {
  max-height: 280px; overflow-y: auto;
  border: 1px solid #f0f0f0; border-radius: 6px;
  padding: 8px; background: #fafafa; margin-bottom: 10px;
}
.msg-empty { text-align: center; color: #bbb; padding: 16px; font-size: 13px; }
.msg-item { padding: 8px; border-bottom: 1px solid #f0f0f0; }
.msg-item:last-child { border-bottom: none; }
.msg-header { display: flex; justify-content: space-between; margin-bottom: 3px; }
.msg-sender { font-weight: 600; font-size: 13px; }
.msg-time { font-size: 12px; color: #aaa; }
.msg-content { font-size: 13px; color: #595959; }
.msg-input-row { display: flex; gap: 8px; }
/* 右侧 */
.publisher-row { display: flex; gap: 10px; align-items: flex-start; }
.publisher-name { font-weight: 600; cursor: pointer; color: #1e56a0; }
.publisher-name:hover { text-decoration: underline; }
.action-col { display: flex; flex-direction: column; gap: 8px; }
/* 申请列表 */
.app-item { padding: 10px 0; border-bottom: 1px solid #f5f5f5; }
.app-item:last-child { border-bottom: none; }
.app-info { display: flex; justify-content: space-between; margin-bottom: 3px; }
.app-name { font-weight: 600; font-size: 13px; }
</style>
