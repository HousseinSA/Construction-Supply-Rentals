import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface WeightUnitDropdownProps {
  value: string
  onChange: (value: string) => void
}

export default function WeightUnitDropdown({
  value,
  onChange,
}: WeightUnitDropdownProps) {
  const t = useTranslations("dashboard.equipment")

  const unitOptions = [
    { value: "kg", label: t("weightUnits.kg") },
    { value: "tons", label: t("weightUnits.tons") },
  ]

  return (
    <Dropdown
      options={unitOptions}
      value={value}
      onChange={onChange}
      placeholder={t("weightUnits.kg")}
    />
  )
}
