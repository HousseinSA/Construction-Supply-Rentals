"use client"

import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
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
  const params = useParams()
  const locale = params.locale as string

  const getCityOptions = () => {
    const cities = [
      { value: "nouakchott", ar: "نواكشوط", fr: "Nouakchott", en: "Nouakchott" },
      { value: "nouadhibou", ar: "نواذيبو", fr: "Nouadhibou", en: "Nouadhibou" },
      { value: "rosso", ar: "روصو", fr: "Rosso", en: "Rosso" },
      { value: "kaedi", ar: "كيهيدي", fr: "Kaédi", en: "Kaedi" },
      { value: "zouerate", ar: "الزويرات", fr: "Zouérat", en: "Zouerat" },
      { value: "atar", ar: "أطار", fr: "Atar", en: "Atar" },
      { value: "kiffa", ar: "كيفة", fr: "Kiffa", en: "Kiffa" },
      { value: "nema", ar: "النعمة", fr: "Néma", en: "Nema" }
    ]

    return cities.map(city => ({
      value: city.value,
      label: city[locale as keyof typeof city] || city.en
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
    />
  )
}