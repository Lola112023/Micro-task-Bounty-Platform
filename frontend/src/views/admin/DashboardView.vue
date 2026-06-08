<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getDashboardStats } from '@/api/admin'
import type { DashboardStats } from '@/types/admin'

const router = useRouter()
const stats = ref<DashboardStats | null>(null)
let timer: ReturnType<typeof setInterval> | null = null

async function load() {
  try { stats.value = await getDashboardStats() } catch { /* 静默 */ }
}

onMounted(() => { load(); timer = setInterval(load, 30000) })
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<template>
  <div>
    <h2 style="margin-bottom:20px">📊 运营数据概览</h2>

    <el-skeleton v-if="!stats" :rows="6" animated />

    <template v-else>
      <!-- 用户 & 任务统计 -->
      <div class="stat-grid" style="margin-bottom:20px">
        <div class="admin-stat-card" style="background:linear-gradient(135deg,#667eea,#764ba2)">
          <div class="admin-stat-label">👥 用户总数</div>
          <div class="admin-stat-value">{{ stats.totalUsers.toLocaleString() }}</div>
          <div class="admin-stat-sub">今日新增 +{{ stats.newUsersToday }}</div>
        </div>
        <div class="admin-stat-card" style="background:linear-gradient(135deg,#2193b0,#6dd5ed)">
          <div class="admin-stat-label">🟢 当前在线</div>
          <div class="admin-stat-value">{{ stats.onlineUsers }}</div>
        </div>
        <div class="admin-stat-card" style="background:linear-gradient(135deg,#56ab2f,#a8e063)">
          <div class="admin-stat-label">📋 任务总数</div>
          <div class="admin-stat-value">{{ stats.totalTasks.toLocaleString() }}</div>
        </div>
        <div class="admin-stat-card" style="background:linear-gradient(135deg,#f2994a,#f2c94c)">
          <div class="admin-stat-label">⏳ 进行中</div>
          <div class="admin-stat-value">{{ stats.inProgressTasks }}</div>
        </div>
        <div class="admin-stat-card" style="background:linear-gradient(135deg,#eb3349,#f45c43)">
          <div class="admin-stat-label">⚠️ 待确认</div>
          <div class="admin-stat-value">{{ stats.pendingConfirmTasks }}</div>
        </div>
        <div class="admin-stat-card" style="background:linear-gradient(135deg,#8e2de2,#4a00e0)">
          <div class="admin-stat-label">🚨 超时未交付</div>
          <div class="admin-stat-value">{{ stats.timeoutTasks }}</div>
        </div>
      </div>

      <!-- 待处理事项 -->
      <div class="card" style="margin-bottom:20px">
        <div class="card-title">🔔 待处理事项</div>
        <div class="pending-grid">
          <div class="pending-item" @click="router.push('/admin/reviews?tab=avatar')">
            <div class="pending-icon">🖼️</div>
            <div class="pending-count">{{ stats.pendingAvatarReviews }}</div>
            <div class="pending-label">待审核头像</div>
          </div>
          <div class="pending-item" @click="router.push('/admin/reviews?tab=nickname')">
            <div class="pending-icon">📝</div>
            <div class="pending-count">{{ stats.pendingNicknameReviews }}</div>
            <div class="pending-label">待审核昵称</div>
          </div>
          <div class="pending-item" @click="router.push('/admin/reviews?tab=announcement')">
            <div class="pending-icon">📢</div>
            <div class="pending-count">{{ stats.pendingAnnouncementReviews }}</div>
            <div class="pending-label">待审核公告栏</div>
          </div>
          <div class="pending-item" @click="router.push('/admin/reviews?tab=appeal')">
            <div class="pending-icon">⚖️</div>
            <div class="pending-count">{{ stats.pendingAppeals }}</div>
            <div class="pending-label">待处理申诉</div>
          </div>
          <div class="pending-item" @click="router.push('/admin/reviews?tab=report')">
            <div class="pending-icon">🚨</div>
            <div class="pending-count">{{ stats.reportedTasks }}</div>
            <div class="pending-label">被举报任务</div>
          </div>
        </div>
      </div>

      <!-- 财务数据 -->
      <div class="card">
        <div class="card-title">💰 财务数据</div>
        <div class="finance-grid">
          <div class="finance-card" style="background:linear-gradient(135deg,#f093fb,#f5576c)">
            <div style="font-size:13px;opacity:.9;margin-bottom:8px">平台收益账户余额</div>
            <div style="font-size:28px;font-weight:700">{{ stats.platformBalance.toLocaleString() }}
              <span style="font-size:16px">积分</span>
            </div>
          </div>
          <div class="finance-card" style="background:linear-gradient(135deg,#4facfe,#00f2fe)">
            <div style="font-size:13px;opacity:.9;margin-bottom:8px">近7天提现手续费</div>
            <div style="font-size:28px;font-weight:700">{{ stats.weeklyWithdrawFee.toLocaleString() }}
              <span style="font-size:16px">积分</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.admin-stat-sub {
  font-size: 12px;
  opacity: .8;
  margin-top: 6px;
}
.pending-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;
}
.pending-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  cursor: pointer;
  text-align: center;
  transition: all .2s;
}
.pending-item:hover {
  border-color: #1e56a0;
  box-shadow: 0 4px 12px rgba(30,86,160,.15);
  transform: translateY(-2px);
}
.pending-icon { font-size: 22px; margin-bottom: 8px; }
.pending-count { font-size: 26px; font-weight: 700; color: #1e56a0; margin-bottom: 4px; }
.pending-label { font-size: 13px; color: #595959; }
.finance-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.finance-card {
  color: white;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,.15);
}
</style>
