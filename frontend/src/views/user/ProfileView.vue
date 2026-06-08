<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  submitAvatarApplication, submitNicknameApplication,
  submitAnnouncementApplication, getCreditLog, getFinanceRecords,
  getReceivedEvaluations, getGivenEvaluations,
  getNotificationSettings, updateNotificationSettings,
  applyCreditRestore, checkNicknameAvailable, exportFinanceRecords
} from '@/api/user'
import { recharge, withdraw } from '@/api/finance'
import { formatDateTime, creditScoreColor, pointsToYuan, calcWithdrawFee } from '@/utils/format'
import { validateNickname, validateAnnouncement } from '@/utils/validate'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { CreditLogItem, FinanceRecord } from '@/types/finance'
import type { EvaluationItem } from '@/types/user'
import type { NotificationSettings } from '@/types/notification'

const router = useRouter()
const auth = useAuthStore()

// ── 子标签 ────────────────────────────────────────────────────────────────────
const activeTab = ref('basic')

// ── 弹窗控制 ──────────────────────────────────────────────────────────────────
const avatarVisible = ref(false)
const nicknameVisible = ref(false)
const announcementVisible = ref(false)
const rechargeVisible = ref(false)
const withdrawVisible = ref(false)
const creditRestoreVisible = ref(false)

// ── 表单 ──────────────────────────────────────────────────────────────────────
const newNickname = ref('')
const nicknameAvailable = ref<boolean | null>(null)
const nicknameChecking = ref(false)
const newAnnouncement = ref('')
const avatarFile = ref<File | null>(null)
const creditRestoreStatement = ref('')

const rechargeForm = reactive({ amount: 100, payMethod: 'wechat' as 'wechat' | 'alipay' })
const withdrawForm = reactive({ points: 100, accountType: 'wechat' as 'wechat' | 'alipay', account: '' })

// ── 信用分明细 ────────────────────────────────────────────────────────────────
const creditLogs = ref<CreditLogItem[]>([])
const creditTotal = ref(0)
const creditPage = ref(1)
const creditLoading = ref(false)

// ── 收支明细 ──────────────────────────────────────────────────────────────────
const financeList = ref<FinanceRecord[]>([])
const financeTotal = ref(0)
const financePage = ref(1)
const financeLoading = ref(false)
const financeTypeFilter = ref('')

// ── 评价记录 ──────────────────────────────────────────────────────────────────
const evalTab = ref<'received' | 'given'>('received')
const evalList = ref<EvaluationItem[]>([])
const evalTotal = ref(0)
const evalPage = ref(1)
const evalLoading = ref(false)

// ── 通知设置 ──────────────────────────────────────────────────────────────────
const notifSettings = ref<NotificationSettings | null>(null)

// ── 计算属性 ──────────────────────────────────────────────────────────────────
const user = computed(() => auth.user)
const creditScore = computed(() => user.value?.creditScore ?? 80)
const creditStatus = computed(() => {
  if (creditScore.value >= 60) return { text: '良好', type: 'success' }
  if (creditScore.value >= 40) return { text: '风险', type: 'warning' }
  return { text: '受限', type: 'danger' }
})
const withdrawFee = computed(() => calcWithdrawFee(withdrawForm.points))
const withdrawActual = computed(() => withdrawForm.points - withdrawFee.value)

// ── 方法 ──────────────────────────────────────────────────────────────────────
async function loadCreditLog() {
  creditLoading.value = true
  try {
    const res = await getCreditLog({ page: creditPage.value, pageSize: 15 })
    creditLogs.value = res.list
    creditTotal.value = res.total
  } finally { creditLoading.value = false }
}

async function loadFinance() {
  financeLoading.value = true
  try {
    const res = await getFinanceRecords({
      type: financeTypeFilter.value || undefined,
      page: financePage.value,
      pageSize: 20,
    })
    financeList.value = res.list
    financeTotal.value = res.total
  } finally { financeLoading.value = false }
}

async function loadEvaluations() {
  evalLoading.value = true
  try {
    const fn = evalTab.value === 'received' ? getReceivedEvaluations : getGivenEvaluations
    const res = await fn({ page: evalPage.value, pageSize: 10 })
    evalList.value = res.list
    evalTotal.value = res.total
  } finally { evalLoading.value = false }
}

async function loadNotifSettings() {
  notifSettings.value = await getNotificationSettings()
}

function handleTabChange(tab: string | number) {
  const key = String(tab)
  if (key === 'credit' && !creditLogs.value.length) loadCreditLog()
  if (key === 'finance' && !financeList.value.length) loadFinance()
  if (key === 'evaluation' && !evalList.value.length) loadEvaluations()
  if (key === 'notification' && !notifSettings.value) loadNotifSettings()
}

async function handleAvatarChange(file: { raw?: File }) {
  if (!file.raw) return
  const f = file.raw
  if (f.size > 1024 * 1024) { ElMessage.error('头像文件不超过1MB'); return }
  if (!['image/jpeg', 'image/png'].includes(f.type)) { ElMessage.error('仅支持jpg/png格式'); return }
  avatarFile.value = f
}

async function submitAvatar() {
  if (!avatarFile.value) { ElMessage.warning('请先选择图片'); return }
  const fd = new FormData()
  fd.append('avatar', avatarFile.value)
  await submitAvatarApplication(fd)
  ElMessage.success('头像申请已提交，等待审核')
  avatarVisible.value = false
}

async function checkNickname() {
  const err = validateNickname(newNickname.value)
  if (err !== true) return
  nicknameChecking.value = true
  try {
    const res = await checkNicknameAvailable(newNickname.value)
    nicknameAvailable.value = res.available
  } finally { nicknameChecking.value = false }
}

async function submitNickname() {
  const err = validateNickname(newNickname.value)
  if (err !== true) { ElMessage.error(err); return }
  if (nicknameAvailable.value === false) { ElMessage.error('昵称已被占用'); return }
  await submitNicknameApplication(newNickname.value)
  ElMessage.success('昵称申请已提交，等待审核')
  nicknameVisible.value = false
}

async function submitAnnouncement() {
  const err = validateAnnouncement(newAnnouncement.value)
  if (err !== true) { ElMessage.error(err); return }
  await submitAnnouncementApplication(newAnnouncement.value)
  ElMessage.success('公告栏申请已提交，等待审核')
  announcementVisible.value = false
}

async function handleRecharge() {
  if (rechargeForm.amount < 10) { ElMessage.error('最低充值10元'); return }
  await recharge({ amount: rechargeForm.amount, payMethod: rechargeForm.payMethod })
  ElMessage.success('充值成功，积分已到账')
  rechargeVisible.value = false
  auth.fetchUserInfo()
}

async function handleWithdraw() {
  if (withdrawForm.points < 100) { ElMessage.error('最低提现100积分'); return }
  if (withdrawForm.points > 2000) { ElMessage.error('单日提现上限2000积分'); return }
  if (!withdrawForm.account) { ElMessage.error('请填写收款账号'); return }
  await withdraw({ points: withdrawForm.points, account: withdrawForm.account, accountType: withdrawForm.accountType })
  ElMessage.success('提现申请已提交，1个工作日内到账')
  withdrawVisible.value = false
  auth.fetchUserInfo()
}

async function handleCreditRestore() {
  if (creditRestoreStatement.value.length < 10) { ElMessage.error('请详细说明申请原因（至少10字）'); return }
  if (creditRestoreStatement.value.length > 500) { ElMessage.error('申请陈述不超过500字'); return }
  await applyCreditRestore(creditRestoreStatement.value)
  ElMessage.success('申请已提交，管理员将在24小时内处理')
  creditRestoreVisible.value = false
}

async function handleNotifChange(key: keyof NotificationSettings, val: boolean) {
  if (!notifSettings.value) return
  await updateNotificationSettings({ [key]: val })
  ElMessage.success('通知设置已更新')
}

async function handleExportFinance() {
  const blob = await exportFinanceRecords()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = '收支明细.xlsx'; a.click()
  URL.revokeObjectURL(url)
}

async function handleLogout() {
  await ElMessageBox.confirm('确认退出登录？', '提示', {
    confirmButtonText: '退出', cancelButtonText: '取消', type: 'warning'
  })
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  // mock token 时数据已存在，无需再请求
  if (!auth.user || !auth.token?.startsWith('mock-')) {
    auth.fetchUserInfo()
  }
})
</script>

<template>
  <div v-if="!user"><el-skeleton :rows="8" animated /></div>
  <div v-else class="profile-page">

    <!-- ── 顶部用户信息卡片 ── -->
    <div class="card profile-header-card">
      <div class="profile-top">
        <div class="avatar-wrap">
          <el-avatar :size="80" :src="user.avatarUrl || undefined"
            :style="{ background:'#1e56a0', fontSize:'32px' }">
            {{ user.nickname.charAt(0).toUpperCase() }}
          </el-avatar>
        </div>
        <div class="profile-info">
          <div class="profile-nickname">{{ user.nickname }}</div>
          <div class="profile-meta">
            <span>{{ user.studentId }}</span>
            <span v-if="user.grade">{{ user.grade }}</span>
            <span v-if="user.college">{{ user.college }}</span>
            <span v-if="user.academy">{{ user.academy }}</span>
          </div>
          <div v-if="user.announcement" class="profile-announcement">
            📢 {{ user.announcement }}
          </div>
        </div>
        <div class="profile-stats-right">
          <div class="stat-item">
            <span class="stat-label">信用分</span>
            <span class="stat-value" :style="{ color: creditScoreColor(creditScore) }">
              {{ creditScore }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">完成率</span>
            <span class="stat-value">
              {{ user.completionRate !== null ? (user.completionRate * 100).toFixed(1) + '%' : 'N/A' }}
            </span>
          </div>
          <div class="stat-item">
            <span class="stat-label">积分余额</span>
            <span class="stat-value" style="color:#fa8c16">{{ user.points }}</span>
          </div>
        </div>
      </div>

      <!-- 视角切换 -->
      <div class="view-mode-switch">
        <span class="switch-label">🔄 视角切换：</span>
        <el-radio-group :model-value="auth.viewMode"
          @update:model-value="(v: string | number | boolean | undefined) => auth.setViewMode((v as 'publisher' | 'taker'))">
          <el-radio-button value="publisher">📦 发布者视角</el-radio-button>
          <el-radio-button value="taker">🎯 接单者视角</el-radio-button>
        </el-radio-group>
        <span class="switch-tip">切换后影响任务大厅默认展示</span>
      </div>
    </div>

    <!-- ── 子标签内容 ── -->
    <div class="card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="基本信息" name="basic" />
        <el-tab-pane label="信用分明细" name="credit" />
        <el-tab-pane label="收支明细" name="finance" />
        <el-tab-pane label="评价记录" name="evaluation" />
        <el-tab-pane label="通知设置" name="notification" />
      </el-tabs>

      <!-- ── 基本信息 ── -->
      <div v-show="activeTab === 'basic'">
        <div class="info-section">
          <div class="info-item">
            <div class="info-item-left">
              <div class="info-item-title">头像</div>
              <div class="info-item-desc">225×225像素，小于1MB，仅支持jpg/png</div>
            </div>
            <el-button @click="avatarVisible = true">修改头像</el-button>
          </div>
          <div class="info-item">
            <div class="info-item-left">
              <div class="info-item-title">昵称</div>
              <div class="info-item-desc">当前：{{ user.nickname }} &nbsp;|&nbsp; 每30天可修改一次</div>
            </div>
            <el-button @click="() => { newNickname = ''; nicknameAvailable = null; nicknameVisible = true }">
              修改昵称
            </el-button>
          </div>
          <div class="info-item">
            <div class="info-item-left">
              <div class="info-item-title">公告栏</div>
              <div class="info-item-desc">
                {{ user.announcement || '（未设置）' }}
              </div>
            </div>
            <el-button @click="() => { newAnnouncement = user!.announcement || ''; announcementVisible = true }">
              修改公告
            </el-button>
          </div>
        </div>
        <div class="basic-actions">
          <el-button type="primary" @click="router.push('/task-history')">
            📋 我的任务历史
          </el-button>
          <el-button type="danger" plain @click="handleLogout">退出登录</el-button>
        </div>
      </div>

      <!-- ── 信用分明细 ── -->
      <div v-show="activeTab === 'credit'">
        <div class="credit-overview">
          <el-tag :type="(creditStatus.type as any)" size="large">
            {{ creditScore }} 分 · {{ creditStatus.text }}
          </el-tag>
          <el-button
            v-if="creditScore < 40"
            type="warning"
            size="small"
            @click="creditRestoreVisible = true"
          >申请恢复信用分</el-button>
        </div>
        <el-table v-loading="creditLoading" :data="creditLogs" empty-text="暂无记录">
          <el-table-column label="完成时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.completedAt) }}</template>
          </el-table-column>
          <el-table-column prop="taskCategory" label="任务类型" width="100" />
          <el-table-column label="发布者星级" width="110">
            <template #default="{ row }">{{ '⭐'.repeat(row.publisherStars) }}</template>
          </el-table-column>
          <el-table-column label="接单者星级" width="110">
            <template #default="{ row }">{{ '⭐'.repeat(row.takerStars) }}</template>
          </el-table-column>
          <el-table-column prop="publisherComment" label="评价内容" min-width="160"
            show-overflow-tooltip />
          <el-table-column label="分值变化" width="90">
            <template #default="{ row }">
              <span :style="{ color: row.creditChange >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }">
                {{ row.creditChange >= 0 ? '+' : '' }}{{ row.creditChange }}
              </span>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap" v-if="creditTotal > 15">
          <el-pagination v-model:current-page="creditPage" :page-size="15" :total="creditTotal"
            layout="prev, pager, next" background @current-change="loadCreditLog" />
        </div>
      </div>

      <!-- ── 收支明细 ── -->
      <div v-show="activeTab === 'finance'">
        <div class="finance-summary">
          <div class="summary-item">
            <span class="summary-label">当前余额</span>
            <span class="summary-value" style="color:#fa8c16">{{ user.points }} 积分</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">累计收入</span>
            <span class="summary-value" style="color:#52c41a">{{ user.totalIncome }} 积分</span>
          </div>
          <div class="summary-item">
            <span class="summary-label">累计支出</span>
            <span class="summary-value" style="color:#ff4d4f">{{ user.totalExpense }} 积分</span>
          </div>
          <el-button type="primary" @click="rechargeVisible = true">💰 充值</el-button>
          <el-button type="success" @click="withdrawVisible = true">💸 提现</el-button>
          <el-button @click="handleExportFinance">📥 导出明细</el-button>
        </div>
        <div class="filter-row" style="margin-bottom:12px">
          <el-select v-model="financeTypeFilter" clearable placeholder="类型筛选" style="width:140px"
            @change="() => { financePage=1; loadFinance() }">
            <el-option label="充值" value="RECHARGE" />
            <el-option label="任务收入" value="TASK_INCOME" />
            <el-option label="任务支出" value="TASK_EXPENSE" />
            <el-option label="提现" value="WITHDRAW" />
            <el-option label="冻结" value="FROZEN" />
            <el-option label="解冻" value="UNFROZEN" />
            <el-option label="系统调整" value="SYSTEM_ADJUST" />
          </el-select>
        </div>
        <el-table v-loading="financeLoading" :data="financeList" empty-text="暂无记录">
          <el-table-column label="时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column prop="relatedName" label="关联任务/交易号" min-width="160" show-overflow-tooltip />
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ row.type }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="变动额" width="100">
            <template #default="{ row }">
              <span :style="{ color: row.amount >= 0 ? '#52c41a' : '#ff4d4f', fontWeight: 600 }">
                {{ row.amount >= 0 ? '+' : '' }}{{ row.amount }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="balanceAfter" label="余额" width="90" />
        </el-table>
        <div class="pagination-wrap" v-if="financeTotal > 20">
          <el-pagination v-model:current-page="financePage" :page-size="20" :total="financeTotal"
            layout="prev, pager, next" background @current-change="loadFinance" />
        </div>
      </div>

      <!-- ── 评价记录 ── -->
      <div v-show="activeTab === 'evaluation'">
        <el-tabs v-model="evalTab" @tab-change="() => { evalPage=1; loadEvaluations() }">
          <el-tab-pane label="收到的评价" name="received" />
          <el-tab-pane label="我给出的评价" name="given" />
        </el-tabs>
        <div v-loading="evalLoading">
          <div v-if="evalList.length === 0" class="empty-tip">暂无评价</div>
          <div v-else>
            <div v-for="ev in evalList" :key="ev.id" class="eval-item">
              <div class="eval-header">
                <span class="eval-user">{{ ev.evaluatorNickname }}</span>
                <span class="eval-stars">{{ '⭐'.repeat(ev.stars) }}</span>
                <span class="eval-time">{{ formatDateTime(ev.evaluatedAt) }}</span>
              </div>
              <div v-if="ev.comment" class="eval-comment">{{ ev.comment }}</div>
              <div class="eval-task">
                任务：
                <el-button link size="small" @click="router.push(`/task/${ev.taskId}`)">
                  {{ ev.taskTitle }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
        <div class="pagination-wrap" v-if="evalTotal > 10">
          <el-pagination v-model:current-page="evalPage" :page-size="10" :total="evalTotal"
            layout="prev, pager, next" background @current-change="loadEvaluations" />
        </div>
      </div>

      <!-- ── 通知设置 ── -->
      <div v-show="activeTab === 'notification'">
        <div v-if="!notifSettings" class="empty-tip">加载中...</div>
        <div v-else class="notif-settings">
          <div class="notif-setting-item">
            <div>
              <div class="setting-title">任务中标通知</div>
              <div class="setting-desc">当您中标任务时通知</div>
            </div>
            <span class="locked-tip">🔒 不可关闭</span>
          </div>
          <div class="notif-setting-item">
            <div>
              <div class="setting-title">超时提醒</div>
              <div class="setting-desc">任务即将超时时提醒</div>
            </div>
            <span class="locked-tip">🔒 不可关闭</span>
          </div>
          <div class="notif-setting-item">
            <div>
              <div class="setting-title">信用分变更通知</div>
              <div class="setting-desc">信用分发生变化时通知</div>
            </div>
            <span class="locked-tip">🔒 不可关闭</span>
          </div>
          <div class="notif-setting-item">
            <div>
              <div class="setting-title">落选通知</div>
              <div class="setting-desc">申请未通过时通知</div>
            </div>
            <el-switch v-model="notifSettings.taskRejected"
              @change="(v: string | number | boolean) => handleNotifChange('taskRejected', !!v)" />
          </div>
          <div class="notif-setting-item">
            <div>
              <div class="setting-title">审核结果通知</div>
              <div class="setting-desc">头像/昵称/公告栏审核结果</div>
            </div>
            <el-switch v-model="notifSettings.reviewResult"
              @change="(v: string | number | boolean) => handleNotifChange('reviewResult', !!v)" />
          </div>
          <div class="notif-setting-item">
            <div>
              <div class="setting-title">系统公告</div>
              <div class="setting-desc">平台发布的系统公告</div>
            </div>
            <el-switch v-model="notifSettings.systemAnnouncement"
              @change="(v: string | number | boolean) => handleNotifChange('systemAnnouncement', !!v)" />
          </div>
          <div class="notif-setting-item">
            <div>
              <div class="setting-title">评价通知</div>
              <div class="setting-desc">收到他人评价时通知</div>
            </div>
            <el-switch v-model="notifSettings.evaluation"
              @change="(v: string | number | boolean) => handleNotifChange('evaluation', !!v)" />
          </div>
        </div>
      </div>

    </div><!-- end card -->
  </div><!-- end profile-page -->

  <!-- ─── 弹窗 ─────────────────────────────────────────────────────────────── -->

  <!-- 修改头像 -->
  <el-dialog v-model="avatarVisible" title="修改头像" width="420px">
    <el-upload :auto-upload="false" :show-file-list="false"
      accept="image/jpeg,image/png" :on-change="handleAvatarChange">
      <el-button type="primary">选择图片</el-button>
      <template #tip>
        <div style="font-size:12px;color:#8c8c8c;margin-top:6px">
          要求：225×225像素，小于1MB，仅支持jpg/png
        </div>
      </template>
    </el-upload>
    <div v-if="avatarFile" style="margin-top:10px;color:#595959;font-size:13px">
      已选择：{{ avatarFile.name }}
    </div>
    <template #footer>
      <el-button @click="avatarVisible=false">取消</el-button>
      <el-button type="primary" @click="submitAvatar">提交申请</el-button>
    </template>
  </el-dialog>

  <!-- 修改昵称 -->
  <el-dialog v-model="nicknameVisible" title="修改昵称" width="420px">
    <el-alert type="info" :closable="false" style="margin-bottom:12px">
      每30天仅可提交一次修改申请
    </el-alert>
    <el-input v-model="newNickname" placeholder="仅中文/英文/数字，小于10字"
      :maxlength="9" show-word-limit @blur="checkNickname" />
    <div v-if="nicknameAvailable === true" style="color:#52c41a;font-size:12px;margin-top:4px">
      ✓ 昵称可用
    </div>
    <div v-if="nicknameAvailable === false" style="color:#ff4d4f;font-size:12px;margin-top:4px">
      ✗ 昵称已被占用
    </div>
    <template #footer>
      <el-button @click="nicknameVisible=false">取消</el-button>
      <el-button type="primary" :loading="nicknameChecking" @click="submitNickname">
        提交申请
      </el-button>
    </template>
  </el-dialog>

  <!-- 修改公告栏 -->
  <el-dialog v-model="announcementVisible" title="修改公告栏" width="480px">
    <el-input v-model="newAnnouncement" type="textarea" :rows="4"
      :maxlength="200" show-word-limit placeholder="填写联系方式或个人简介（最长200字）" />
    <template #footer>
      <el-button @click="announcementVisible=false">取消</el-button>
      <el-button type="primary" @click="submitAnnouncement">提交申请</el-button>
    </template>
  </el-dialog>

  <!-- 充值 -->
  <el-dialog v-model="rechargeVisible" title="积分充值" width="420px">
    <el-form label-position="top">
      <el-form-item label="充值金额（元）">
        <el-input-number v-model="rechargeForm.amount" :min="10" :step="10"
          controls-position="right" style="width:100%" />
        <div style="font-size:12px;color:#8c8c8c;margin-top:4px">
          最低10元，将获得 {{ rechargeForm.amount * 10 }} 积分
        </div>
      </el-form-item>
      <el-form-item label="支付方式">
        <el-radio-group v-model="rechargeForm.payMethod">
          <el-radio-button value="wechat">微信支付</el-radio-button>
          <el-radio-button value="alipay">支付宝</el-radio-button>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="rechargeVisible=false">取消</el-button>
      <el-button type="primary" @click="handleRecharge">确认充值</el-button>
    </template>
  </el-dialog>

  <!-- 提现 -->
  <el-dialog v-model="withdrawVisible" title="积分提现" width="420px">
    <el-form label-position="top">
      <el-form-item label="提现积分">
        <el-input-number v-model="withdrawForm.points" :min="100" :max="2000"
          controls-position="right" style="width:100%" />
        <div style="font-size:12px;color:#8c8c8c;margin-top:4px">
          手续费：{{ withdrawFee }} 积分（2%） · 实际到账：{{ withdrawActual }} 积分
          ≈ ¥{{ pointsToYuan(withdrawActual) }}
        </div>
      </el-form-item>
      <el-form-item label="提现方式">
        <el-radio-group v-model="withdrawForm.accountType">
          <el-radio-button value="wechat">微信</el-radio-button>
          <el-radio-button value="alipay">支付宝</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="收款账号">
        <el-input v-model="withdrawForm.account" placeholder="请填写收款账号" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="withdrawVisible=false">取消</el-button>
      <el-button type="success" @click="handleWithdraw">确认提现</el-button>
    </template>
  </el-dialog>

  <!-- 恢复信用分 -->
  <el-dialog v-model="creditRestoreVisible" title="申请恢复信用分" width="480px">
    <el-alert type="warning" :closable="false" style="margin-bottom:12px">
      仅限一次机会，管理员24小时内审核，默认通过
    </el-alert>
    <el-input v-model="creditRestoreStatement" type="textarea" :rows="5"
      :maxlength="500" show-word-limit placeholder="请说明申请原因（10~500字）" />
    <template #footer>
      <el-button @click="creditRestoreVisible=false">取消</el-button>
      <el-button type="warning" @click="handleCreditRestore">提交申请</el-button>
    </template>
  </el-dialog>

</template>

<style scoped>
.profile-page { min-height: 0; }
.profile-header-card { margin-bottom: 16px; }
.profile-top { display: flex; align-items: flex-start; gap: 20px; margin-bottom: 20px; }
.avatar-wrap { flex-shrink: 0; }
.profile-info { flex: 1; }
.profile-nickname { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
.profile-meta { font-size: 13px; color: #8c8c8c; margin-bottom: 6px; display: flex; gap: 10px; flex-wrap: wrap; }
.profile-announcement { font-size: 13px; color: #595959; background: #f5f5f5; padding: 8px 10px; border-radius: 6px; }
.profile-stats-right { display: flex; gap: 20px; align-items: center; }
.stat-item { text-align: center; }
.stat-label { display: block; font-size: 12px; color: #8c8c8c; margin-bottom: 4px; }
.stat-value { font-size: 22px; font-weight: 700; color: #1e56a0; }
.view-mode-switch { display: flex; align-items: center; gap: 12px; padding: 12px 0 0; border-top: 1px solid #f0f0f0; flex-wrap: wrap; }
.switch-label { font-size: 14px; color: #262626; font-weight: 500; }
.switch-tip { font-size: 12px; color: #8c8c8c; }
/* 基本信息 */
.info-section { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
.info-item { display: flex; justify-content: space-between; align-items: center; padding: 14px; border: 1px solid #f0f0f0; border-radius: 6px; }
.info-item-title { font-weight: 500; margin-bottom: 3px; }
.info-item-desc { font-size: 12px; color: #8c8c8c; }
.basic-actions { display: flex; gap: 12px; }
/* 信用分 */
.credit-overview { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
/* 收支 */
.finance-summary { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
.summary-item { display: flex; flex-direction: column; }
.summary-label { font-size: 12px; color: #8c8c8c; }
.summary-value { font-size: 18px; font-weight: 700; }
.filter-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
/* 评价 */
.eval-item { padding: 12px 0; border-bottom: 1px solid #f5f5f5; }
.eval-item:last-child { border-bottom: none; }
.eval-header { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; }
.eval-user { font-weight: 600; font-size: 14px; }
.eval-stars { color: #faad14; }
.eval-time { font-size: 12px; color: #aaa; margin-left: auto; }
.eval-comment { font-size: 13px; color: #595959; margin-bottom: 4px; }
.eval-task { font-size: 12px; color: #8c8c8c; }
/* 通知设置 */
.notif-settings { display: flex; flex-direction: column; gap: 12px; }
.notif-setting-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #f0f0f0; border-radius: 6px; }
.setting-title { font-weight: 500; margin-bottom: 2px; }
.setting-desc { font-size: 12px; color: #8c8c8c; }
.locked-tip { font-size: 12px; color: #8c8c8c; }
/* 通用 */
.empty-tip { text-align: center; color: #bbb; padding: 30px; }
.pagination-wrap { display: flex; justify-content: center; margin-top: 20px; }
</style>
