"use client"

import { useTranslations } from "next-intl"
import { Clock, Gauge } from "lucide-react"

interface EquipmentSpecsProps {
  specs?: {
    brand?: string
    model?: string
    year?: number
    hoursUsed?: number
    kilometersUsed?: number
    condition?: string
  }
}

export default function EquipmentSpecs({ specs }: EquipmentSpecsProps) {
  const tDetails = useTranslations("equipmentDetails")

  if (!specs || (!specs.brand && !specs.model && !specs.year && !specs.hoursUsed && !specs.kilometersUsed)) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-2 text-xs text-gray-700 mb-2">
      <div>
        {specs.brand && <span className="font-semibold">{specs.brand}</span>}
        {specs.model && <span className="text-gray-600"> • {specs.model}</span>}
        {specs.year && <span className="text-gray-600"> • {specs.year}</span>}
      </div>
      {(specs.hoursUsed || specs.kilometersUsed) && (
        <div className="flex items-center gap-1.5">
          {specs.hoursUsed && (
            <div className="inline-flex items-center gap-0.5">
              <Clock className="w-3 h-3 text-blue-600" />
              <span>{specs.hoursUsed.toLocaleString()}h</span>
            </div>
          )}
          {specs.kilometersUsed && (
            <div className="inline-flex items-center gap-0.5">
              <Gauge className="w-3 h-3 text-green-600" />
              <span>{specs.kilometersUsed.toLocaleString()}km</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
