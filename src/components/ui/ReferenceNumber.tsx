import { formatReferenceNumber } from "@/src/lib/format-reference"

interface ReferenceNumberProps {
  referenceNumber?: string
  size?: "sm" | "md" | "lg"
  showHashPrefix?: boolean
  className?: string
}

export default function ReferenceNumber({
  referenceNumber,
  size = "md",
  showHashPrefix = false,
  className = ""
}: ReferenceNumberProps) {
  if (!referenceNumber) return null

  const sizeClasses = {
    sm: "text-xs font-semibold",
    md: "text-sm font-semibold",
    lg: "text-base font-bold"
  }

  const formatted = formatReferenceNumber(referenceNumber)

  return (
    <span
      className={`text-primary ${sizeClasses[size]} ${className}`}
      dir="ltr"
    >
      {showHashPrefix && <span className="text-gray-500">#</span>}
      {formatted}
    </span>
  )
}
