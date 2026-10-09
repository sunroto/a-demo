<script setup lang="ts">
import type { Mark } from '../api/attempts'

defineProps<{ marks: Mark[] }>()

const statusLabel: Record<Mark['status'], string> = {
  correct: '正确',
  wrong: '错字',
  missing: '漏字',
}

function describe(mark: Mark): string {
  return mark.status === 'wrong'
    ? `${statusLabel.wrong}：写成了「${mark.input ?? ''}」`
    : statusLabel[mark.status]
}
</script>

<template>
  <p class="marked-text">
    <template v-for="(mark, index) in marks" :key="index">
      <ruby v-if="mark.status === 'wrong'" class="mark wrong" :title="describe(mark)"
        >{{ mark.char }}<rt>{{ mark.input }}</rt></ruby
      >
      <span v-else :class="['mark', mark.status]" :title="describe(mark)">{{ mark.char }}</span>
    </template>
  </p>
</template>

<style scoped>
.marked-text {
  margin: 0;
  font-size: 22px;
  line-height: 2.4;
  letter-spacing: 2px;
  white-space: pre-wrap;
  word-break: break-all;
}

.mark {
  padding: 0 1px;
  border-radius: 3px;
}

.correct {
  color: #1a7f37;
  background: #dafbe1;
}

.wrong {
  color: #cf222e;
  background: #ffebe9;
}

.wrong rt {
  font-size: 12px;
  color: #cf222e;
  text-decoration: line-through;
}

.missing {
  color: #9a6700;
  background: #fff8c5;
}
</style>
