<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getRechargeRecords, getWithdrawRecords, getPlatformFlow, getAnomalyRecords, markWithdrawPaid, rejectWithdraw } from '@/api/admin'
import type { AdminFinanceRecord } from '@/types/admin'
import { formatDateTime } from '@/utils/format'
import { ElMessage } from 'element-plus'

const activeTab = ref('recharge')
const loading = ref(false)
const list = ref<AdminFinanceRecord[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = 20

const rejectDialogVisible = ref(false)
const rejectTarget = ref<AdminFinanceRecord | null>(null)
const rejectReason = ref('')

async function fetchData() {
  loading.value = true
  try {
    const params = { page: page.value, pageSize }
    let res
    if (activeTab.value === 'recharge') res = await getRechargeRecords(params)
    else if (activeTab.value === 'withdraw') res = await getWithdrawRecords(params)
    else if (activeTab.value === 'platform') res = await getPlatformFlow(params)
    else res = await getAnomalyRecords(params)
    list.value = res.list
    total.value = res.total
  } finally { loading.value = false }
}

async function handlePaid(row: AdminFinanceRecord) {
  await markWithdrawPaid(row.id)
  ElMessage.success('已标记为已打款')
  fetchData()
}

async function confirmReject() {
  if (!rejectTarget.value || !rejectReason.value.trim()) { ElMessage.error('请填写驳回理由'); return }
  await rejectWithdraw(rejectTarget.value.id, rejectReason.value)
  ElMessage.success('提现已驳回，积分已退回')
  rejectDialogVisible.value = false
  fetchData()
}

onMounted(fetchData)
</script>

<template>
  <div>
    <h2 style="margin-bottom:20px">💰 财务审计</h2>
    <div class="card">
      <el-tabs v-model="activeTab" @tab-change="() => { page=1; fetchData() }">
        <el-tab-pane label="充值记录" name="recharge" />
        <el-tab-pane label="提现记录" name="withdraw" />
        <el-tab-pane label="平台收益账户流水" name="platform" />
        <el-tab-pane label="异常交易监控" name="anomaly" />
      </el-tabs>

      <el-table v-loading="loading" :data="list" style="width:100%" empty-text="暂无记录">
        <!-- 充值 -->
        <template v-if="activeTab === 'recharge'">
          <el-table-column prop="id" label="订单号" width="160" show-overflow-tooltip />
          <el-table-column prop="userNickname" label="用户" width="120" />
          <el-table-column label="金额" width="100">
            <template #default="{ row }">¥{{ row.amount?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column prop="payMethod" label="支付方式" width="100" />
          <el-table-column label="时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="90">
            <template #default="{ row }">
              <el-tag :type="row.status === 'success' ? 'success' : 'info'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </template>

        <!-- 提现 -->
        <template v-if="activeTab === 'withdraw'">
          <el-table-column label="申请时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column prop="userNickname" label="用户" width="120" />
          <el-table-column label="提现积分" width="100">
            <template #default="{ row }">{{ row.withdrawPoints }}</template>
          </el-table-column>
          <el-table-column label="手续费" width="90">
            <template #default="{ row }">{{ row.fee }} 积分</template>
          </el-table-column>
          <el-table-column label="到账金额" width="100">
            <template #default="{ row }">¥{{ row.actualAmount?.toFixed(2) }}</template>
          </el-table-column>
          <el-table-column label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="{ pending:'warning', paid:'success', failed:'danger' }[row.status] as any" size="small">
                {{ { pending:'待审核', paid:'已打款', failed:'失败' }[row.status as string] ?? row.status }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150" fixed="right">
            <template #default="{ row }">
              <template v-if="row.status === 'pending'">
                <el-button size="small" link type="success" @click="handlePaid(row)">标记已打款</el-button>
                <el-button size="small" link type="danger"
                  @click="() => { rejectTarget=row; rejectReason=''; rejectDialogVisible=true }">
                  驳回
                </el-button>
              </template>
            </template>
          </el-table-column>
        </template>

        <!-- 平台流水 / 异常 -->
        <template v-if="['platform','anomaly'].includes(activeTab)">
          <el-table-column label="时间" width="155">
            <template #default="{ row }">{{ formatDateTime(row.createdAt) }}</template>
          </el-table-column>
          <el-table-column prop="userNickname" label="用户" width="120" />
          <el-table-column label="金额/积分" width="120">
            <template #default="{ row }">{{ row.amount }}</template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100" />
          <el-table-column prop="id" label="关联单号" min-width="160" show-overflow-tooltip />
        </template>
      </el-table>

      <div class="pagination-wrap" v-if="total > pageSize">
        <el-pagination v-model:current-page="page" :page-size="pageSize" :total="total"
          layout="prev, pager, next, total" background @current-change="fetchData" />
      </div>
    </div>

    <el-dialog v-model="rejectDialogVisible" title="驳回提现" width="420px">
      <el-input v-model="rejectReason" type="textarea" :rows="3"
        placeholder="请填写驳回理由（必填）" :maxlength="200" show-word-limit />
      <template #footer>
        <el-button @click="rejectDialogVisible=false">取消</el-button>
        <el-button type="danger" @click="confirmReject">确认驳回</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.pagination-wrap { display:flex; justify-content:center; margin-top:20px; }
</style>
