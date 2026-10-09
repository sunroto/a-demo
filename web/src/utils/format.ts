const percentFormat = new Intl.NumberFormat('zh-CN', {
  style: 'percent',
  maximumFractionDigits: 1,
})

export function formatScore(score: number): string {
  return percentFormat.format(score)
}
