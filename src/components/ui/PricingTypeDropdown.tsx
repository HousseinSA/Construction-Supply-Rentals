"use client"

import { useMemo } from "react"
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

export default function PricingTypeDropdown({
  equipmentType,
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: PricingTypeDropdownProps) {
  const t = useTranslations("dashboard.equipment")

  const equipmentPricingTypes = {
    // Terrassement - mostly hourly
    pellehydraulique: ["hourly", "daily"],
    bulldozer: ["hourly", "daily"],
    chargeuse: ["hourly", "daily"],
    tractopelle: ["hourly", "daily"],
    minipelle: ["hourly", "daily"],
    
    // Nivellement & Compactage - hourly/daily
    niveuleuse: ["hourly", "daily"],
    compacteur: ["hourly", "daily"],
    plaquevibrante: ["hourly", "daily"],
    pilonneuse: ["hourly", "daily"],
    
    // Transport - daily/per_km
    camionbenne: ["daily", "per_km"],
    camionciterne: ["daily", "per_km"],
    portechar: ["daily", "per_km"],
    bennearticulee: ["daily", "per_km"],
    
    // Levage - hourly/daily
    gruemobile: ["hourly", "daily"],
    manitou: ["hourly", "daily"],
    chariotelevateur: ["hourly", "daily"],
    nacelleelevratrice: ["hourly", "daily"]
  }

  const availablePricingTypes = useMemo(() => {
    if (!equipmentType) return []
    const types = equipmentPricingTypes[equipmentType as keyof typeof equipmentPricingTypes] || []
    return types.map(type => ({
      value: type,
      label: t(type === "hourly" ? "hourly" : type === "daily" ? "daily" : "perKm")
    }))
  }, [equipmentType, t])

  return (
    <Dropdown
      label={t("priceType")}
      options={availablePricingTypes}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t("selectPriceType")}
      disabled={disabled || !equipmentType}
      className={className}
    />
  )
}