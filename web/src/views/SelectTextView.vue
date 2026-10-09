<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { fetchTexts, type TextMeta } from '../api/texts'

const texts = ref<TextMeta[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

async function load(): Promise<void> {
  loading.value = true
  error.value = null
  try {
    texts.value = await fetchTexts()
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
      <h2>选择题目</h2>
      <RouterLink class="back-link" :to="{ name: 'home' }">← 返回首页</RouterLink>
    </div>

    <p v-if="loading" class="state">加载中…</p>

    <div v-else-if="error" class="state state-error" role="alert">
      <span>加载题目失败：{{ error }}</span>
      <button type="button" @click="load">重试</button>
    </div>

    <p v-else-if="texts.length === 0" class="state">暂无题目</p>

    <ul v-else class="texts">
      <li v-for="text in texts" :key="text.id">
        <RouterLink :to="{ name: 'dictation', params: { textId: text.id } }">
          {{ text.title }}
        </RouterLink>
      </li>
    </ul>
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

.texts {
  margin: 0;
  padding: 0;
  list-style: none;
}

.texts li + li {
  border-top: 1px solid #eaeef2;
}

.texts a {
  display: block;
  padding: 12px 8px;
  color: #1f2328;
  text-decoration: none;
}

.texts a:hover {
  background: #f6f8fa;
  color: #0969da;
}
</style>
