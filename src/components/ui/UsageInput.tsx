"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

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

  const getLabel = () => {
    return t("equipmentUsage")
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

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {getLabel()}
      </label>
      <div className="relative z-20">
        <input
          type="number"
          name="usageValue"
          value={value}
          onChange={onValueChange}
          placeholder={getPlaceholder()}
          disabled={disabled}
          className="w-full px-4 py-3 pr-28 rtl:pl-28 rtl:pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 w-20">
          <Dropdown
            options={units}
            value={unitValue || "hours"}
            onChange={onUnitChange}
            disabled={disabled}
            noBorder
            compact
          />
        </div>
      </div>
    </div>
  )
}
