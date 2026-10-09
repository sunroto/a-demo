import { getJson } from './http'

/** 题目元信息（接口不返回原文） */
export interface TextMeta {
  id: number
  title: string
}

export function fetchTexts(): Promise<TextMeta[]> {
  return getJson<TextMeta[]>('/api/texts')
}
