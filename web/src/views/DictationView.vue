<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { submitAttempt } from '../api/attempts'
import { HttpError } from '../api/http'
import { fetchTexts, type TextMeta } from '../api/texts'
import { toHistoryState } from '../utils/lastResult'

const route = useRoute()
const router = useRouter()

const textId = computed(() => Number(route.params.textId))

const text = ref<TextMeta | null>(null)
const loading = ref(true)
const loadError = ref<string | null>(null)

const input = ref('')
const hint = ref<string | null>(null)
const submitting = ref(false)

async function load(): Promise<void> {
  loading.value = true
  loadError.value = null
  try {
    const texts = await fetchTexts()
    text.value = texts.find((t) => t.id === textId.value) ?? null
    if (!text.value) loadError.value = '题目不存在'
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}

watch(input, () => {
  hint.value = null
})

async function submit(): Promise<void> {
  if (!text.value || submitting.value) return
  if (input.value.trim() === '') {
    hint.value = '默写后提交'
    return
  }

  submitting.value = true
  hint.value = null
  try {
    const result = await submitAttempt(text.value.id, input.value)
    await router.push({
      name: 'result',
      state: toHistoryState({ title: text.value.title, result }),
    })
  } catch (e) {
    if (e instanceof HttpError && e.status === 404) {
      hint.value = '提交失败：题目不存在'
    } else {
      hint.value = `提交失败：${e instanceof Error ? e.message : String(e)}`
    }
  } finally {
    submitting.value = false
  }
}

onMounted(load)
</script>

<template>
  <section class="card">
    <div class="card-header">
      <h2>{{ text?.title ?? '默写' }}</h2>
      <RouterLink class="back-link" :to="{ name: 'texts' }">← 返回选题</RouterLink>
    </div>

    <p v-if="loading" class="state">加载中…</p>

    <div v-else-if="loadError" class="state state-error" role="alert">
      <span>{{ loadError }}</span>
      <button type="button" @click="load">重试</button>
    </div>

    <form v-else class="dictation" @submit.prevent="submit">
      <label for="dictation-input" class="label">请凭记忆默写全文：</label>
      <textarea
        id="dictation-input"
        v-model="input"
        rows="8"
        :disabled="submitting"
        placeholder="在此输入默写内容"
      />
      <div class="actions">
        <span v-if="hint" class="hint" role="alert">{{ hint }}</span>
        <button type="submit" class="btn-primary" :disabled="submitting">
          {{ submitting ? '提交中…' : '提交' }}
        </button>
      </div>
    </form>
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

.label {
  display: block;
  margin-bottom: 8px;
  color: #656d76;
  font-size: 14px;
}

textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  font: inherit;
  font-size: 16px;
  line-height: 1.8;
  resize: vertical;
}

textarea:focus {
  outline: 2px solid #0969da;
  outline-offset: -1px;
}

.actions {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: flex-end;
  margin-top: 12px;
}

.hint {
  color: #cf222e;
  font-size: 14px;
}
</style>
