import { getJson } from './http'

export interface Attempt {
  id: number
  title: string
  /** 正确率，0–1 */
  score: number
  /** ISO 8601 时间字符串（UTC） */
  created_at: string
}

export function fetchAttempts(): Promise<Attempt[]> {
  return getJson<Attempt[]>('/api/attempts')
}
