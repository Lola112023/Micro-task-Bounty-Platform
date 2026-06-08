<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  getReviewList, approveReview, rejectReview,
  getReportList, verifyReport, rejectReport,
  getAppealList, judgeAppealComplete, judgeAppealCancel, judgeAppealContinue
} from '@/api/admin'
import type { AdminReviewItem, AdminReportItem, AdminAppealItem } from '@/types/admin'
import { formatDateTime } from '@/utils/format'
import { ElMessage } from 'element-plus'

const route = useRoute()
const activeTab = ref((route.query.tab as string) || 'avatar')

// ── 审核列表 ──────────────────────────────────────────────────────────────────
const reviews = ref<AdminReviewItem[]>([])
const reviewTotal = ref(0)
const reviewPage = ref(1)
const reviewLoading = ref(false)
const rejectDialogVisible = ref(false)
const rejectTarget = ref<AdminReviewItem | null>(null)
const rejectReason = ref('')

// ── 举报列表 ──────────────────────────────────────────────────────────────────
const reports = ref<AdminReportItem[]>([])
const reportTotal = ref(0)
const reportPage = ref(1)
const reportLoading = ref(false)
const verifyDialogVisible = ref(false)
const verifyTarget = ref<AdminReportItem | null>(null)
const verifyFreezeDays = ref(5)
const verifyCreditDeduct = ref(5)

// ── 申诉列表 ──────────────────────────────────────────────────────────────────
const appeals = ref<AdminAppealItem[]>([])
const appealTotal = ref(0)
const appealPage = ref(1)
const appealLoading = ref(false)
const judgeDialogVisible = ref(false)
const judgeTarget = ref<AdminAppealItem | null>(null)
const judgeType = ref<'complete' | 'cancel' | 'continue'>('complete')
const judgeOpinion = ref('')

// ── 数据加载 ──────────────────────────────────────────────────────────────────
async function loadReviews(type: string) {
  reviewLoading.value = true
  try {
    const res = await getReviewList({ type, page: reviewPage.value, pageSize: 15 })
    reviews.value = res.list
    reviewTotal.value = res.total
  } finally { reviewLoading.value = false }
}

async function loadReports() {
  reportLoading.value = true
  try {
    const res = await getReportList({ page: reportPage.value, pageSize: 15 })
    reports.value = res.list
    reportTotal.value = res.total
  } finally { reportLoading.value = false }
}

async function loadAppeals() {
  appealLoading.value = true
  try {
    const res = await getAppealList({ page: appealPage.value, pageSize: 15 })
    appeals.value = res.list
    appealTotal.value = res.total
  } finally { appealLoading.value = false }
}

function handleTabChange(tab: string) {
  if (tab === 'avatar' || tab === 'nickname' || tab === 'announcement') loadReviews(tab)
  if (tab === 'report') loadReports()
  if (tab === 'appeal') loadAppeals()
}

// ── 审核操作 ──────────────────────────────────────────────────────────────────
async function handleApprove(item: AdminReviewItem) {
  await approveReview(item.id)
  ElMessage.success('已通过')
  loadReviews(activeTab.value)
}

async function confirmReject() {
  if (!rejectTarget.value || !rejectReason.value.trim()) { ElMessage.error('请填写拒绝原因'); return }
  await rejectReview(rejectTarget.value.id, rejectReason.value)
  ElMessage.success('已拒绝')
  rejectDialogVisible.value = false
  loadReviews(activeTab.value)
}

// ── 举报操作 ──────────────────────────────────────────────────────────────────
async function confirmVerify() {
  if (!verifyTarget.value) return
  await verifyReport(verifyTarget.value.id, verifyFreezeDays.value, verifyCreditDeduct.value)
  ElMessage.success('举报已核实，已处罚')
  verifyDialogVisible.value = false
  loadReports()
}

async function handleRejectReport(item: AdminReportItem) {
  await rejectReport(item.id)
  ElMessage.success('举报已驳回')
  loadReports()
}

// ── 申诉操作 ──────────────────────────────────────────────────────────────────
async function confirmJudge() {
  if (!judgeTarget.value || !judgeOpinion.value.trim()) { ElMessage.error('请填写处理意见'); return }
  if (judgeType.value === 'complete') await judgeAppealComplete(judgeTarget.value.id, judgeOpinion.value)
  if (judgeType.value === 'cancel') await judgeAppealCancel(judgeTarget.value.id, judgeOpinion.value)
  if (judgeType.value === 'continue') await judgeAppealContinue(judgeTarget.value.id, judgeOpinion.value)
  ElMessage.success('申诉已裁定')
  judgeDialogVisible.value = false
  loadAppeals()
}

onMounted(() => handleTabChange(activeTab.value))
watch(() => route.query.tab, (v) => { if (v) { activeTab.value = v as string; handleTabChange(v as string) } })
</script>

<template>
  <div>
    <h2 style="margin-bottom:20px">🔍 审核管理</h2>
    <div class="card">
      <el-tabs v-model="activeTab" @tab-change="handleTabChange">
        <el-tab-pane label="🖼️ 头像审核" name="avatar" />
        <el-tab-pane label="📝 昵称审核" name="nickname" />
        <el-tab-pane label="📢 公告栏审核" name="announcement" />
        <el-tab-pane label="🚨 举报处理" name="report" />
        <el-tab-pane label="⚖️ 申诉处理" name="appeal" />
      </el-tabs>

      <!-- 头像/昵称/公告栏 审核 -->
      <div v-if="['avatar','nickname','announcement'].includes(activeTab)">
        <el-table v-loading="reviewLoading" :data="reviews" empty-text="暂无待审核申请">
          <el-table-column prop="applicantNickname" label="申请人" width="120" />
          <el-table-column label="申请类型" width="100">
            <template #default="{ row }">
              <el-tag size="small">{{ ({'avatar':'头像', 'nickname':'昵称', 'announcement':'公告栏'} as Record<string,string>)[row.type as string] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="申请内容" min-width="200">
            <template #default="{ row }">
              <img v-if="row.type === 'avatar'" :src="row.content"
                style="width:40px;height:40px;border-radius:50%;object-fit:cover" />
              <span v-else>{{ row.content }}</span>
            </template>
          </el-table-column>
          <el-table-column label="申请时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <el-tag :type="row.status === 'timeout' ? 'danger' : 'warning'" size="small">
                {{ row.status === 'timeout' ? '超时自动拒绝' : '待审核' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="140" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link type="success" @click="handleApprove(row)">✓ 通过</el-button>
              <el-button size="small" link type="danger"
                @click="() => { rejectTarget = row; rejectReason = ''; rejectDialogVisible = true }">
                ✗ 拒绝
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap" v-if="reviewTotal > 15">
          <el-pagination v-model:current-page="reviewPage" :page-size="15" :total="reviewTotal"
            layout="prev, pager, next" background @current-change="() => loadReviews(activeTab)" />
        </div>
      </div>

      <!-- 举报处理 -->
      <div v-if="activeTab === 'report'">
        <el-table v-loading="reportLoading" :data="reports" empty-text="暂无举报">
          <el-table-column prop="taskTitle" label="被举报任务" min-width="160" show-overflow-tooltip />
          <el-table-column prop="reporterNickname" label="举报人" width="110">
            <template #default="{ row }">{{ row.reporterNickname || '匿名' }}</template>
          </el-table-column>
          <el-table-column label="举报类型" width="90">
            <template #default="{ row }">
              <el-tag size="small" type="danger">
                {{ ({'porn':'涉黄', 'violence':'涉暴', 'fraud':'诈骗', 'other':'其他'} as Record<string,string>)[row.reportType as string] }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="reason" label="举报理由" min-width="160" show-overflow-tooltip />
          <el-table-column label="举报时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.reportedAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link type="danger"
                @click="() => { verifyTarget = row; verifyFreezeDays = 5; verifyCreditDeduct = 5; verifyDialogVisible = true }">
                核实
              </el-button>
              <el-button size="small" link @click="handleRejectReport(row)">驳回</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap" v-if="reportTotal > 15">
          <el-pagination v-model:current-page="reportPage" :page-size="15" :total="reportTotal"
            layout="prev, pager, next" background @current-change="loadReports" />
        </div>
      </div>

      <!-- 申诉处理 -->
      <div v-if="activeTab === 'appeal'">
        <el-table v-loading="appealLoading" :data="appeals" empty-text="暂无申诉">
          <el-table-column prop="taskId" label="任务ID" width="80" />
          <el-table-column prop="taskTitle" label="任务名称" min-width="140" show-overflow-tooltip />
          <el-table-column label="申诉方" width="110">
            <template #default="{ row }">{{ row.appellantNickname }}</template>
          </el-table-column>
          <el-table-column label="对方" width="110">
            <template #default="{ row }">{{ row.respondentNickname }}</template>
          </el-table-column>
          <el-table-column prop="reason" label="申诉理由" min-width="160" show-overflow-tooltip />
          <el-table-column label="提交时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.submittedAt) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button size="small" link type="success"
                @click="() => { judgeTarget=row; judgeType='complete'; judgeOpinion=''; judgeDialogVisible=true }">
                判定完成
              </el-button>
              <el-button size="small" link type="danger"
                @click="() => { judgeTarget=row; judgeType='cancel'; judgeOpinion=''; judgeDialogVisible=true }">
                判定取消
              </el-button>
              <el-button size="small" link
                @click="() => { judgeTarget=row; judgeType='continue'; judgeOpinion=''; judgeDialogVisible=true }">
                继续执行
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination-wrap" v-if="appealTotal > 15">
          <el-pagination v-model:current-page="appealPage" :page-size="15" :total="appealTotal"
            layout="prev, pager, next" background @current-change="loadAppeals" />
        </div>
      </div>
    </div>

    <!-- 拒绝审核弹窗 -->
    <el-dialog v-model="rejectDialogVisible" title="拒绝申请" width="420px">
      <el-input v-model="rejectReason" type="textarea" :rows="3"
        placeholder="请填写拒绝原因（必填）" :maxlength="100" show-word-limit />
      <template #footer>
        <el-button @click="rejectDialogVisible=false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认拒绝</el-button>
      </template>
    </el-dialog>

    <!-- 核实举报弹窗 -->
    <el-dialog v-model="verifyDialogVisible" title="核实举报" width="420px">
      <el-form label-position="top">
        <el-form-item label="冻结天数（5天~永久）">
          <el-input-number v-model="verifyFreezeDays" :min="5" :max="36500" style="width:100%" />
        </el-form-item>
        <el-form-item label="扣除信用分（1~10）">
          <el-input-number v-model="verifyCreditDeduct" :min="1" :max="10" style="width:100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="verifyDialogVisible=false">取消</el-button>
        <el-button type="danger" @click="confirmVerify">确认处罚</el-button>
      </template>
    </el-dialog>

    <!-- 申诉裁定弹窗 -->
    <el-dialog v-model="judgeDialogVisible" title="申诉裁定" width="480px">
      <el-alert
        :type="judgeType === 'complete' ? 'success' : judgeType === 'cancel' ? 'error' : 'info'"
        :closable="false"
        style="margin-bottom:12px"
      >
        {{ { complete:'判定完成：积分划转给接单者', cancel:'判定取消：积分退还发布者', continue:'无效申诉：继续执行任务' }[judgeType] }}
      </el-alert>
      <el-input v-model="judgeOpinion" type="textarea" :rows="4"
        placeholder="请填写处理意见（≤200字，对双方可见）" :maxlength="200" show-word-limit />
      <template #footer>
        <el-button @click="judgeDialogVisible=false">取消</el-button>
        <el-button type="primary" @click="confirmJudge">确认裁定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.pagination-wrap { display:flex; justify-content:center; margin-top:16px; }
</style>
