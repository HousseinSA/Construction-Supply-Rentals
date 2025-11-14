import { useTranslations } from "next-intl"

interface ConditionDropdownProps {
  value: string
  onChange: (value: string) => void
}

export default function ConditionDropdown({
  value,
  onChange,
}: ConditionDropdownProps) {
  const t = useTranslations("dashboard.equipment")

  const conditions = ["new", "excellent", "good", "fair", "used"]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {t("condition")} <span className="text-red-500">*</span>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
        required
      >
        <option value="">{t("selectCondition")}</option>
        {conditions.map((condition) => (
          <option key={condition} value={condition}>
            {t(`conditions.${condition}`)}
          </option>
        ))}
      </select>
    </div>
  )
}
