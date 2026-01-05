'use client'

import { useState } from 'react'
import { formatReferenceNumber } from "@/src/lib/format-reference"
import { Copy, Check } from 'lucide-react'
import { useSession } from 'next-auth/react'

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
  const { data: session } = useSession()
  const [copied, setCopied] = useState(false)

  if (!referenceNumber) return null

  const sizeClasses = {
    sm: "text-xs font-semibold",
    md: "text-sm font-semibold",
    lg: "text-base font-bold"
  }

  const formatted = formatReferenceNumber(referenceNumber)
  const isAdmin = session?.user?.role === 'admin'

  const handleCopy = () => {
    navigator.clipboard.writeText(referenceNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const iconSize = size === 'sm' ? 'w-3 h-3' : size === 'md' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <div className="flex items-center gap-1">
      <span
        className={`text-primary ${sizeClasses[size]} ${className}`}
        dir="ltr"
      >
        {showHashPrefix && <span className="text-gray-500">#</span>}
        {formatted}
      </span>
      {!isAdmin && (
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Copy"
        >
          {copied ? (
            <Check className={`${iconSize} text-green-600`} />
          ) : (
            <Copy className={`${iconSize} text-gray-500`} />
          )}
        </button>
      )}
    </div>
  )
}
