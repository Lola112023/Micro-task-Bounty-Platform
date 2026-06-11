<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserProfile, getUserEvaluations } from '@/api/user'
import { reportUser } from '@/api/task'
import type { UserPublicProfile, EvaluationItem } from '@/types/user'
import { formatDateTime, creditScoreColor } from '@/utils/format'
import { ElMessage } from 'element-plus'

const props = defineProps<{ userId: string }>()
const router = useRouter()

const profile = ref<UserPublicProfile | null>(null)
const evaluations = ref<EvaluationItem[]>([])
const total = ref(0)
const page = ref(1)
const loading = ref(true)
const reportVisible = ref(false)
const reportType = ref('')
const reportEvidence = ref('')

async function loadProfile() {
  loading.value = true
  try {
    profile.value = await getUserProfile(Number(props.userId))
    const res = await getUserEvaluations(Number(props.userId), { page: 1, pageSize: 10 })
    evaluations.value = res.list
    total.value = res.total
  } finally {
    loading.value = false
  }
}

async function loadMoreEvaluations() {
  page.value++
  const res = await getUserEvaluations(Number(props.userId), { page: page.value, pageSize: 10 })
  evaluations.value.push(...res.list)
}

async function handleReport() {
  if (!reportType.value) { ElMessage.warning('请选择举报类型'); return }
  await reportUser(Number(props.userId), reportType.value, reportEvidence.value)
  ElMessage.success('举报已提交')
  reportVisible.value = false
}

function starsText(n: number) {
  return '⭐'.repeat(n)
}

onMounted(loadProfile)
</script>

<template>
  <div>
    <el-button link style="margin-bottom:16px" @click="router.back()">
      <el-icon><ArrowLeft /></el-icon> 返回
    </el-button>

    <div v-if="loading">
      <el-skeleton :rows="6" animated />
    </div>

    <div v-else-if="profile">
      <!-- 用户基本信息 -->
      <div class="card user-profile-card">
        <div class="profile-header">
          <el-avatar :size="72" style="background:#1e56a0; font-size:28px">
            {{ profile.nickname.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="profile-info">
            <div class="profile-nickname">{{ profile.nickname }}</div>
            <div class="profile-stats">
              <span>
                信用分：
                <strong :style="{ color: creditScoreColor(profile.creditScore) }">
                  {{ profile.creditScore }}
                </strong>
              </span>
              <span>
                完成率：
                <strong>
                  {{ profile.completionRate !== null ? (profile.completionRate * 100).toFixed(1) + '%' : 'N/A' }}
                </strong>
              </span>
            </div>
            <div v-if="profile.announcement" class="profile-announcement">
              📢 {{ profile.announcement }}
            </div>
          </div>
          <el-button type="danger" plain size="small" @click="reportVisible = true">
            🚨 举报
          </el-button>
        </div>
      </div>

      <!-- 评价列表 -->
      <div class="card">
        <div class="card-title">收到的评价（{{ total }}条）</div>
        <div v-if="evaluations.length === 0" class="empty-tip">暂无评价</div>
        <div v-else>
          <div v-for="ev in evaluations" :key="ev.id" class="eval-item">
            <div class="eval-header">
              <span class="eval-from">{{ ev.evaluatorNickname }}</span>
              <span class="eval-stars">{{ starsText(ev.stars) }}</span>
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
          <div v-if="evaluations.length < total" class="load-more">
            <el-button link @click="loadMoreEvaluations">加载更多</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 举报弹窗 -->
    <el-dialog v-model="reportVisible" title="举报用户" width="480px">
      <el-form label-position="top">
        <el-form-item label="举报类型">
          <el-select v-model="reportType" style="width:100%">
            <el-option label="涉黄" value="PORNOGRAPHY" />
            <el-option label="涉暴" value="VIOLENCE" />
            <el-option label="诈骗" value="FRAUD" />
            <el-option label="其他" value="OTHER" />
          </el-select>
        </el-form-item>
        <el-form-item label="举报证据（100字以内）">
          <el-input v-model="reportEvidence" type="textarea" :rows="3" :maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="reportVisible = false">取消</el-button>
        <el-button type="danger" @click="handleReport">提交举报</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.user-profile-card {}
.profile-header { display: flex; align-items: flex-start; gap: 16px; }
.profile-info { flex: 1; }
.profile-nickname { font-size: 20px; font-weight: 700; margin-bottom: 6px; }
.profile-stats { display: flex; gap: 16px; font-size: 14px; color: #595959; margin-bottom: 6px; }
.profile-announcement { font-size: 13px; color: #595959; background: #f5f5f5; padding: 8px 10px; border-radius: 6px; }
.eval-item { padding: 12px 0; border-bottom: 1px solid #f0f0f0; }
.eval-item:last-child { border-bottom: none; }
.eval-header { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; flex-wrap: wrap; }
.eval-from { font-weight: 600; font-size: 14px; }
.eval-stars { color: #faad14; }
.eval-time { font-size: 12px; color: #aaa; margin-left: auto; }
.eval-comment { font-size: 13px; color: #595959; margin-bottom: 4px; }
.eval-task { font-size: 12px; color: #8c8c8c; }
.empty-tip { text-align: center; color: #bbb; padding: 24px; }
.load-more { text-align: center; padding: 12px; }
</style>
