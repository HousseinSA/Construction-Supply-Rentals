export function formatReferenceNumber(ref: string): string {
  if (!ref || ref.length !== 6) return ref
  return `#${ref}`
}
