import { getJson, postJson } from './http'

export interface Attempt {
  id: number
  title: string
  /** 正确率，0–1 */
  score: number
  /** ISO 8601 时间字符串（UTC） */
  created_at: string
}

export type MarkStatus = 'correct' | 'wrong' | 'missing'

export interface Mark {
  /** 原文中的字 */
  char: string
  status: MarkStatus
  /** 用户写下的字，仅 status 为 wrong 时存在 */
  input?: string
}

export interface AttemptResult {
  id: number
  text_id: number
  /** 正确率，0–1 */
  score: number
  marks: Mark[]
  created_at: string
}

export function fetchAttempts(): Promise<Attempt[]> {
  return getJson<Attempt[]>('/api/attempts')
}

export function submitAttempt(textId: number, input: string): Promise<AttemptResult> {
  return postJson<AttemptResult>('/api/attempts', { text_id: textId, input })
}
