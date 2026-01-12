import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface ConditionDropdownProps {
  value: string
  onChange: (value: string) => void
  required?: boolean
}

export default function ConditionDropdown({
  value,
  onChange,
  required = true,
}: ConditionDropdownProps) {
  const t = useTranslations("dashboard.equipment")

  const conditions = [
    { value: "new", label: t("conditions.new") },
    { value: "excellent", label: t("conditions.excellent") },
    { value: "good", label: t("conditions.good") },
    { value: "fair", label: t("conditions.Fair") },
  ]

  return (
    <Dropdown
      label={t("condition")}
      options={conditions}
      value={value}
      onChange={onChange}
      placeholder={t("selectCondition")}
      required={required}
    />
  )
}
