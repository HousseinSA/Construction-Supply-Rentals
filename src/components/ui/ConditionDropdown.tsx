import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface ConditionDropdownProps {
  value: string
  onChange: (value: string) => void
}

export default function ConditionDropdown({
  value,
  onChange,
}: ConditionDropdownProps) {
  const t = useTranslations("dashboard.equipment")

  const conditions = [
    { value: "new", label: t("conditions.new") },
    { value: "excellent", label: t("conditions.excellent") },
    { value: "used", label: t("conditions.used") },
  ]

  return (
    <Dropdown
      label={t("condition")}
      options={conditions}
      value={value}
      onChange={onChange}
      placeholder={t("selectCondition")}
      required
    />
  )
}
