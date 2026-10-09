export type MarkStatus = 'correct' | 'wrong' | 'missing'

export interface Mark {
  char: string
  status: MarkStatus
  /** 用户在该位置写下的字，仅 status 为 wrong 时存在 */
  input?: string
}

export interface ScoreResult {
  /** 正确率，0–1：正确字数 / 原文字数 */
  score: number
  marks: Mark[]
}

/**
 * 字符级比对：先对两侧 trim，再用 LCS 对齐原文与默写内容。
 * LCS 匹配上的字记为 correct；相邻两个匹配点之间，原文未匹配的字与默写未匹配的字
 * 按顺序配对记为 wrong（带 input），原文多出的记为 missing，默写多写的字忽略。
 */
export function scoreAttempt(content: string, input: string): ScoreResult {
  const expected = Array.from(content.trim())
  const actual = Array.from(input.trim())
  const n = expected.length
  const m = actual.length

  // lcs[i][j] = LCS length of expected[i..] and actual[j..]
  const lcs: Uint32Array[] = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] =
        expected[i] === actual[j]
          ? lcs[i + 1][j + 1] + 1
          : Math.max(lcs[i + 1][j], lcs[i][j + 1])
    }
  }

  const marks: Mark[] = []
  let correct = 0
  let pendingExpected: string[] = []
  let pendingActual: string[] = []

  const flushGap = (): void => {
    pendingExpected.forEach((char, k) => {
      marks.push(
        k < pendingActual.length
          ? { char, status: 'wrong', input: pendingActual[k] }
          : { char, status: 'missing' },
      )
    })
    pendingExpected = []
    pendingActual = []
  }

  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (expected[i] === actual[j]) {
      flushGap()
      marks.push({ char: expected[i], status: 'correct' })
      correct++
      i++
      j++
    } else if (lcs[i + 1][j] >= lcs[i][j + 1]) {
      pendingExpected.push(expected[i++])
    } else {
      pendingActual.push(actual[j++])
    }
  }
  pendingExpected.push(...expected.slice(i))
  pendingActual.push(...actual.slice(j))
  flushGap()

  return { score: n === 0 ? 0 : correct / n, marks }
}
