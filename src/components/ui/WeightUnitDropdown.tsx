import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface WeightUnitDropdownProps {
  value: string
  onChange: (value: string) => void
  units?: { value: string; label: string }[]
  disabled?: boolean
}

export default function WeightUnitDropdown({
  value,
  onChange,
  units,
  disabled = false,
}: WeightUnitDropdownProps) {
  const t = useTranslations("dashboard.equipment")

  const unitOptions = units || [
    { value: "kg", label: t("weightUnits.kg") },
    { value: "tons", label: t("weightUnits.tons") },
  ]

  return (
    <Dropdown
      options={unitOptions}
      value={value}
      onChange={onChange}
      placeholder={unitOptions[0]?.label}
      disabled={disabled}
    />
  )
}
