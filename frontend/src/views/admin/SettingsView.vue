<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getSystemConfig, saveSystemConfig } from '@/api/admin'
import type { SystemConfig } from '@/types/admin'
import { ElMessage } from 'element-plus'

const config = ref<SystemConfig | null>(null)
const loading = ref(false)
const saving = ref(false)

async function load() {
  loading.value = true
  try { config.value = await getSystemConfig() } finally { loading.value = false }
}

async function handleSave() {
  if (!config.value) return
  saving.value = true
  try {
    await saveSystemConfig(config.value)
    ElMessage.success('配置已保存并立即生效')
  } finally { saving.value = false }
}

onMounted(load)
</script>

<template>
  <div>
    <h2 style="margin-bottom:20px">⚙️ 系统配置</h2>
    <el-skeleton v-if="loading" :rows="10" animated />

    <template v-else-if="config">
      <!-- 信用分规则 -->
      <div class="card config-section">
        <div class="section-title">📊 信用分规则配置</div>
        <div class="config-grid">
          <div class="config-item">
            <label>完成率加分阈值（%）</label>
            <el-input-number v-model="config.completionRateBonusThreshold" :min="0" :max="100" />
          </div>
          <div class="config-item">
            <label>完成率加分分值</label>
            <el-input-number v-model="config.completionRateBonus" :min="0" :max="20" />
          </div>
          <div class="config-item">
            <label>完成率减分阈值（%）</label>
            <el-input-number v-model="config.completionRatePenaltyThreshold" :min="0" :max="100" />
          </div>
          <div class="config-item">
            <label>完成率减分分值</label>
            <el-input-number v-model="config.completionRatePenalty" :min="0" :max="20" />
          </div>
          <div class="config-item">
            <label>好评率加分阈值（%）</label>
            <el-input-number v-model="config.goodRateBonusThreshold" :min="0" :max="100" />
          </div>
          <div class="config-item">
            <label>好评率加分分值</label>
            <el-input-number v-model="config.goodRateBonus" :min="0" :max="20" />
          </div>
          <div class="config-item">
            <label>好评率减分阈值（%）</label>
            <el-input-number v-model="config.goodRatePenaltyThreshold" :min="0" :max="100" />
          </div>
          <div class="config-item">
            <label>好评率减分分值</label>
            <el-input-number v-model="config.goodRatePenalty" :min="0" :max="20" />
          </div>
          <div class="config-item">
            <label>超时扣分</label>
            <el-input-number v-model="config.timeoutPenalty" :min="0" :max="30" />
          </div>
          <div class="config-item">
            <label>主动放弃扣分</label>
            <el-input-number v-model="config.giveupPenalty" :min="0" :max="20" />
          </div>
          <div class="config-item">
            <label>发布者无故下架扣分</label>
            <el-input-number v-model="config.publisherCancelPenalty" :min="0" :max="20" />
          </div>
          <div class="config-item">
            <label>风险提示阈值</label>
            <el-input-number v-model="config.creditRiskThreshold" :min="0" :max="100" />
          </div>
          <div class="config-item">
            <label>接单限制阈值</label>
            <el-input-number v-model="config.creditLimitThreshold" :min="0" :max="100" />
          </div>
        </div>
      </div>

      <!-- 积分配置 -->
      <div class="card config-section">
        <div class="section-title">💰 积分与提现配置</div>
        <div class="config-grid">
          <div class="config-item">
            <label>单笔充值下限（元）</label>
            <el-input-number v-model="config.rechargeMinAmount" :min="1" />
          </div>
          <div class="config-item">
            <label>日累计充值上限（元）</label>
            <el-input-number v-model="config.rechargeDailyLimit" :min="1" />
          </div>
          <div class="config-item">
            <label>提现单笔下限（积分）</label>
            <el-input-number v-model="config.withdrawMinPoints" :min="1" />
          </div>
          <div class="config-item">
            <label>日提现上限（积分）</label>
            <el-input-number v-model="config.withdrawDailyLimit" :min="1" />
          </div>
          <div class="config-item">
            <label>提现手续费率（%）</label>
            <el-input-number v-model="config.withdrawFeeRate" :min="0" :max="20" :precision="1" :step="0.5" />
          </div>
        </div>
      </div>

      <!-- 超时配置 -->
      <div class="card config-section">
        <div class="section-title">⏱️ 超时与任务时限配置</div>
        <div class="config-grid">
          <div class="config-item">
            <label>无人接单自动取消天数</label>
            <el-input-number v-model="config.autocancelDays" :min="1" :max="30" />
          </div>
          <div class="config-item">
            <label>交付超时提醒提前量（小时）</label>
            <el-input-number v-model="config.timeoutReminderHours" :min="1" :max="48" />
          </div>
          <div class="config-item">
            <label>截止时间单次延长比例（%）</label>
            <el-input-number v-model="config.extendRatio" :min="10" :max="100" />
          </div>
          <div class="config-item">
            <label>最大延长次数</label>
            <el-input-number v-model="config.maxExtendCount" :min="1" :max="5" />
          </div>
        </div>
      </div>

      <!-- 附件配置 -->
      <div class="card config-section">
        <div class="section-title">📎 附件与存储配置</div>
        <div class="config-grid">
          <div class="config-item">
            <label>任务附件大小上限（MB）</label>
            <el-input-number v-model="config.taskAttachmentMaxMb" :min="1" :max="100" />
          </div>
          <div class="config-item">
            <label>交付物附件上限（MB）</label>
            <el-input-number v-model="config.deliveryAttachmentMaxMb" :min="1" :max="100" />
          </div>
          <div class="config-item">
            <label>交付物保存天数</label>
            <el-input-number v-model="config.deliveryKeepDays" :min="7" :max="90" />
          </div>
        </div>
      </div>

      <!-- 同步配置 -->
      <div class="card config-section">
        <div class="section-title">🔄 学校信息同步配置</div>
        <div class="config-item" style="max-width:400px">
          <label>同步 Cron 表达式</label>
          <el-input v-model="config.syncCron" placeholder="如: 0 3 1 * *" />
          <div style="font-size:12px;color:#8c8c8c;margin-top:4px">
            默认：每月1日凌晨03:00（0 3 1 * *）
          </div>
        </div>
      </div>

      <div style="padding: 0 0 20px">
        <el-button type="primary" size="large" :loading="saving" @click="handleSave">
          💾 保存配置（立即生效）
        </el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.config-section { margin-bottom: 16px; }
.section-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: #262626; padding-bottom: 10px; border-bottom: 1px solid #f0f0f0; }
.config-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.config-item { display: flex; flex-direction: column; gap: 6px; }
.config-item label { font-size: 13px; font-weight: 500; color: #262626; }
</style>
