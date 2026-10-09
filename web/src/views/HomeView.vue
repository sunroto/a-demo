<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchAttempts, type Attempt } from '../api/attempts'
import { formatScore } from '../utils/format'

const attempts = ref<Attempt[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const dateFormat = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

function formatTime(iso: string): string {
  const date = new Date(iso)
  return Number.isNaN(date.getTime()) ? iso : dateFormat.format(date)
}

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    attempts.value = await fetchAttempts()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="card">
    <div class="card-header">
      <h2>默写记录</h2>
      <RouterLink class="btn-primary" :to="{ name: 'texts' }">默写</RouterLink>
    </div>

    <p v-if="loading" class="state">加载中…</p>

    <div v-else-if="error" class="state state-error" role="alert">
      <span>加载默写记录失败：{{ error }}</span>
      <button type="button" @click="load">重试</button>
    </div>

    <p v-else-if="attempts.length === 0" class="state">暂无默写记录</p>

    <table v-else class="attempts">
      <thead>
        <tr>
          <th>题目</th>
          <th class="num">正确率</th>
          <th>提交时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="attempt in attempts" :key="attempt.id">
          <td>{{ attempt.title }}</td>
          <td class="num">{{ formatScore(attempt.score) }}</td>
          <td>
            <time :datetime="attempt.created_at">{{ formatTime(attempt.created_at) }}</time>
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<style scoped>
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

h2 {
  margin: 0;
  font-size: 18px;
}

.attempts {
  width: 100%;
  border-collapse: collapse;
}

.attempts th,
.attempts td {
  padding: 10px 8px;
  text-align: left;
  border-bottom: 1px solid #eaeef2;
}

.attempts th {
  font-weight: 600;
  color: #656d76;
  font-size: 14px;
}

.attempts tbody tr:last-child td {
  border-bottom: none;
}

.attempts .num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
</style>
