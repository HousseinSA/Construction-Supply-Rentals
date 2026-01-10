"use client"

import { AlertCircle } from "lucide-react"
import { UnifiedStatus, getStatusConfig } from "@/src/lib/equipment-status"

interface UnifiedStatusBadgeProps {
  status: UnifiedStatus
  hasDetails?: boolean
  onClick?: () => void
  t: (key: string) => string
}

export default function UnifiedStatusBadge({ 
  status, 
  hasDetails = false, 
  onClick,
  t 
}: UnifiedStatusBadgeProps) {
  const config = getStatusConfig(status, t)
  
  return (
    <button
      onClick={onClick}
      disabled={!hasDetails && !onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${config.color} ${
        hasDetails || onClick ? "cursor-pointer hover:opacity-80" : "cursor-default"
      }`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
      {hasDetails && <AlertCircle className="w-3 h-3" />}
    </button>
  )
}
