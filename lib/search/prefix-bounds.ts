/** Lowercase prefix bounds for Firestore `startAt` / `endAt` autocomplete. */
export function prefixBounds(term: string) {
  const start = term.trim().toLowerCase()
  return { start, end: `${start}\uf8ff` }
}
