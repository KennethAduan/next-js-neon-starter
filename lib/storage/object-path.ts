/**
 * Normalize stored image values to an R2 object key.
 * Accepts raw keys, absolute public/signed URLs, or legacy /api/storage paths.
 */
export function extractObjectKey(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  if (trimmed.startsWith("/api/storage/")) {
    return trimmed
      .slice("/api/storage/".length)
      .split("/")
      .map((segment) => decodeURIComponent(segment))
      .join("/")
  }

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const pathname = new URL(trimmed).pathname.replace(/^\/+/, "")
      const usersIndex = pathname.indexOf("users/")
      if (usersIndex >= 0) {
        return pathname.slice(usersIndex)
      }
      return pathname || null
    } catch {
      return null
    }
  }

  return trimmed.replace(/^\/+/, "")
}

export function isSafeObjectKey(key: string): boolean {
  if (!key || key.includes("..") || key.startsWith("/")) return false
  return /^[a-zA-Z0-9/_.,\-]+$/.test(key)
}
