"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface PricingTypeDropdownProps {
  equipmentType: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

interface EquipmentType {
  _id: string
  name: string
  category: string
  pricingTypes: string[]
}

export default function PricingTypeDropdown({
  equipmentType,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: PricingTypeDropdownProps) {
  const t = useTranslations("dashboard.equipment")
  const [equipmentTypeData, setEquipmentTypeData] = useState<EquipmentType | null>(null)

  useEffect(() => {
    if (!equipmentType) {
      setEquipmentTypeData(null)
      return
    }

    const fetchEquipmentType = async () => {
      try {
        const response = await fetch('/api/equipment-types')
        const data = await response.json()
        if (data.success) {
          const typeData = data.data.find((type: EquipmentType) => type._id === equipmentType)
          setEquipmentTypeData(typeData || null)
        }
      } catch (error) {
        console.error('Failed to fetch equipment type:', error)
      }
    }

    fetchEquipmentType()
  }, [equipmentType])

  const availablePricingTypes = useMemo(() => {
    if (!equipmentTypeData || !equipmentTypeData.pricingTypes) return []
    
    return equipmentTypeData.pricingTypes.map(type => ({
      value: type,
      label: t(type === "hourly" ? "hourly" : type === "daily" ? "daily" : type === "per_km" ? "perKm" : "perTon")
    }))
  }, [equipmentTypeData, t])

  return (
    <Dropdown
      label={t("priceType")}
      options={availablePricingTypes}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t("selectPriceType")}
      disabled={disabled || !equipmentType || !equipmentTypeData}
      className={className}
    />
  )
}