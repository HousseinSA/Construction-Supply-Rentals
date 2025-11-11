"use client"

import { useState, useEffect, useMemo } from "react"
import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface EquipmentTypeDropdownProps {
  category: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

interface EquipmentType {
  _id: string
  name: string
  nameAr?: string
  nameFr?: string
  categoryId: string
}

export default function EquipmentTypeDropdown({
  category,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: EquipmentTypeDropdownProps) {
  const t = useTranslations("dashboard.equipment")
  const [equipmentTypes, setEquipmentTypes] = useState<EquipmentType[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEquipmentTypes = async () => {
      try {
        const response = await fetch('/api/equipment-types')
        const data = await response.json()
        if (data.success) {
          setEquipmentTypes(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch equipment types:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEquipmentTypes()
  }, [])

  const filteredTypes = useMemo(() => {
    if (!category || !equipmentTypes.length) return []
    return equipmentTypes.filter(type => type.categoryId === category)
  }, [category, equipmentTypes])

  const equipmentTypeOptions = filteredTypes.map(type => ({
    value: type._id,
    label: type.name
  }))

  return (
    <Dropdown
      label={t("equipmentType")}
      options={equipmentTypeOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t("selectEquipmentType")}
      disabled={disabled || !category || loading}
      className={className}
    />
  )
}