export function mergeById<T extends { id: string }>(
  batches: T[][],
  limit: number
): T[] {
  const byId = new Map<string, T>()
  for (const item of batches.flat()) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item)
    }
  }
  return Array.from(byId.values()).slice(0, limit)
}
