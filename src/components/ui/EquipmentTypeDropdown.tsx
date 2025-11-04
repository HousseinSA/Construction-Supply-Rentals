"use client"

import { useMemo } from "react"
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

export default function EquipmentTypeDropdown({
  category,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: EquipmentTypeDropdownProps) {
  const t = useTranslations("dashboard.equipment")
  const tCategories = useTranslations("categories")

  const equipmentTypesByCategory = {
    terrassement: [
      { value: "pellehydraulique", label: tCategories("equipmentTypes.pellehydraulique") },
      { value: "bulldozer", label: tCategories("equipmentTypes.bulldozer") },
      { value: "chargeuse", label: tCategories("equipmentTypes.chargeuse") },
      { value: "tractopelle", label: tCategories("equipmentTypes.tractopelle") },
      { value: "minipelle", label: tCategories("equipmentTypes.minipelle") }
    ],
    nivellementcompactage: [
      { value: "niveuleuse", label: tCategories("equipmentTypes.niveuleuse") },
      { value: "compacteur", label: tCategories("equipmentTypes.compacteur") },
      { value: "plaquevibrante", label: tCategories("equipmentTypes.plaquevibrante") },
      { value: "pilonneuse", label: tCategories("equipmentTypes.pilonneuse") }
    ],
    transport: [
      { value: "camionbenne", label: tCategories("equipmentTypes.camionbenne") },
      { value: "camionciterne", label: tCategories("equipmentTypes.camionciterne") },
      { value: "portechar", label: tCategories("equipmentTypes.portechar") },
      { value: "bennearticulee", label: tCategories("equipmentTypes.bennearticulee") }
    ],
    levageemanutention: [
      { value: "gruemobile", label: tCategories("equipmentTypes.gruemobile") },
      { value: "manitou", label: tCategories("equipmentTypes.manitou") },
      { value: "chariotelevateur", label: tCategories("equipmentTypes.chariotelevateur") },
      { value: "nacelleelevratrice", label: tCategories("equipmentTypes.nacelleelevratrice") }
    ]
  }

  const availableTypes = useMemo(() => {
    return category ? equipmentTypesByCategory[category as keyof typeof equipmentTypesByCategory] || [] : []
  }, [category, tCategories])

  return (
    <Dropdown
      label={t("equipmentType")}
      options={availableTypes}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t("selectEquipmentType")}
      disabled={disabled || !category}
      className={className}
    />
  )
}