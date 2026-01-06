"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Info } from "lucide-react"
import Dropdown from "./Dropdown"
import { useTooltip } from "@/src/hooks/useTooltip"

interface UsageInputProps {
  equipmentTypeId: string
  value: string
  unitValue: string
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUnitChange: (value: string) => void
  disabled?: boolean
}

export default function UsageInput({
  equipmentTypeId,
  value,
  unitValue,
  onValueChange,
  onUnitChange,
  disabled = false
}: UsageInputProps) {
  const t = useTranslations("dashboard.equipment")
  const [usageCategory, setUsageCategory] = useState<"hours" | "kilometers" | "tonnage">("hours")
  const { ref, isOpen, toggle } = useTooltip()

  useEffect(() => {
    if (!equipmentTypeId) return

    const fetchUsageCategory = async () => {
      try {
        const response = await fetch(`/api/equipment-types/${equipmentTypeId}`)
        const data = await response.json()
        if (data.success && data.data?.usageCategory) {
          setUsageCategory(data.data.usageCategory)
        }
      } catch (error) {
        console.error("Failed to fetch usage category:", error)
      }
    }

    fetchUsageCategory()
  }, [equipmentTypeId])

  const getTooltipText = () => {
    switch (usageCategory) {
      case "kilometers":
        return t("usageTooltip.kilometers")
      case "tonnage":
        return t("usageTooltip.tonnage")
      default:
        return units.length > 1 ? t("usageTooltip.hoursKm") : t("usageTooltip.hours")
    }
  }

  const getPlaceholder = () => {
    switch (usageCategory) {
      case "kilometers":
        return "45000"
      case "tonnage":
        return "50000"
      default:
        return "1200"
    }
  }

  const getUnits = () => {
    switch (usageCategory) {
      case "kilometers":
        return [{ value: "km", label: "km" }]
      case "tonnage":
        return [{ value: "tons", label: t("weightUnits.tons") }]
      default:
        return [
          { value: "hours", label: t("usageUnits.hours") },
          { value: "km", label: "km" }
        ]
    }
  }

  const units = getUnits()

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
        {t("usageLabel")}
        <div ref={ref} className="relative group">
          <Info 
            className="h-4 w-4 text-gray-400 cursor-help" 
            onClick={toggle}
          />
          <div className={`absolute ltr:left-0 rtl:right-0 bottom-full mb-2 w-64 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg transition-opacity z-50 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 group-hover:opacity-100 pointer-events-none'}`}>
            {getTooltipText()}
            <div className="absolute top-full ltr:left-4 rtl:right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </label>
      <div className="relative">
        <input
          type="number"
          name="usageValue"
          value={value}
          onChange={onValueChange}
          onWheel={handleWheel}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className="w-full px-4 py-3 pr-28 rtl:pl-28 rtl:pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 w-20 z-30">
          <Dropdown
            options={units}
            value={unitValue || "hours"}
            onChange={onUnitChange}
            disabled={disabled}
            noBorder
            compact
            useAbsolutePosition
          />
        </div>
      </div>
    </div>
  )
}
