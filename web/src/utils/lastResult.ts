import type { AttemptResult } from '../api/attempts'

export interface ResultPageState {
  title: string
  result: AttemptResult
}

const KEY = 'attemptResult'

/** 序列化为字符串放进 history.state，刷新结果页后仍可读取 */
export function toHistoryState(state: ResultPageState): Record<string, string> {
  return { [KEY]: JSON.stringify(state) }
}

export function fromHistoryState(): ResultPageState | null {
  const raw: unknown = (window.history.state as Record<string, unknown> | null)?.[KEY]
  if (typeof raw !== 'string') return null
  try {
    return JSON.parse(raw) as ResultPageState
  } catch {
    return null
  }
}
