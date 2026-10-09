<script setup lang="ts">
import { computed } from 'vue'
import MarkedText from '../components/MarkedText.vue'
import { formatScore } from '../utils/format'
import { fromHistoryState } from '../utils/lastResult'

const state = fromHistoryState()

const counts = computed(() => {
  const c = { correct: 0, wrong: 0, missing: 0 }
  for (const mark of state?.result.marks ?? []) c[mark.status]++
  return c
})
</script>

<template>
  <section class="card">
    <div class="card-header">
      <h2>{{ state ? `默写结果：${state.title}` : '默写结果' }}</h2>
      <RouterLink class="back-link" :to="{ name: 'home' }">← 返回首页</RouterLink>
    </div>

    <p v-if="!state" class="state">没有可展示的默写结果，请从首页重新开始默写。</p>

    <template v-else>
      <div class="summary">
        <div class="score">
          <span class="score-label">正确率</span>
          <span class="score-value">{{ formatScore(state.result.score) }}</span>
        </div>
        <ul class="legend">
          <li><span class="swatch correct" />正确 {{ counts.correct }}</li>
          <li><span class="swatch wrong" />错字 {{ counts.wrong }}（上方小字为你的输入）</li>
          <li><span class="swatch missing" />漏字 {{ counts.missing }}</li>
        </ul>
      </div>

      <MarkedText :marks="state.result.marks" />

      <div class="actions">
        <RouterLink class="back-link" :to="{ name: 'dictation', params: { textId: state.result.text_id } }">
          再默写一次
        </RouterLink>
        <RouterLink class="btn-primary" :to="{ name: 'home' }">查看默写记录</RouterLink>
      </div>
    </template>
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

.summary {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: center;
  padding: 12px 0 16px;
  border-bottom: 1px solid #eaeef2;
  margin-bottom: 12px;
}

.score {
  display: flex;
  flex-direction: column;
}

.score-label {
  color: #656d76;
  font-size: 14px;
}

.score-value {
  font-size: 32px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 14px;
  color: #656d76;
}

.legend li {
  display: flex;
  align-items: center;
  gap: 6px;
}

.swatch {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 3px;
}

.swatch.correct {
  background: #dafbe1;
  border: 1px solid #1a7f37;
}

.swatch.wrong {
  background: #ffebe9;
  border: 1px solid #cf222e;
}

.swatch.missing {
  background: #fff8c5;
  border: 1px solid #9a6700;
}

.actions {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
