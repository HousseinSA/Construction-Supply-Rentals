export function formatReferenceNumber(ref: string): string {
  if (!ref || ref.length !== 6) return ref
  return `${ref.slice(0, 2)} ${ref.slice(2, 4)} ${ref.slice(4)}`
}
