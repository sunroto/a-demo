export async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: 'application/json' } })
  if (!res.ok) {
    throw new Error(`请求失败（HTTP ${res.status}）`)
  }
  return (await res.json()) as T
}
