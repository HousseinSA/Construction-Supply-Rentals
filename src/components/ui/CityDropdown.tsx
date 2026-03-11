"use client"

import { useTranslations } from "next-intl"
import { useCityData } from "@/src/hooks/useCityData"
import Dropdown from "./Dropdown"

interface CityDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function CityDropdown({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: CityDropdownProps) {
  const t = useTranslations("dashboard.equipment")
  const { cities } = useCityData()

  const getCityOptions = () => {
    return cities.map(city => ({
      value: city,
      label: city
    }))
  }

  return (
    <Dropdown
      label={t("city")}
      options={getCityOptions()}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t("selectCity")}
      disabled={disabled}
      className={className}
      required
    />
  )
}
