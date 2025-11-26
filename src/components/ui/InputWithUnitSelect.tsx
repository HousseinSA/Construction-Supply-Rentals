import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface InputWithUnitSelectProps {
  label: string
  name: string
  value: string
  unitValue: string
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUnitChange: (value: string) => void
  placeholder?: string
  required?: boolean
  units?: { value: string; label: string }[]
  disabled?: boolean
}

export default function InputWithUnitSelect({
  label,
  name,
  value,
  unitValue,
  onValueChange,
  onUnitChange,
  placeholder,
  required = false,
  units,
  disabled = false,
}: InputWithUnitSelectProps) {
  const t = useTranslations("dashboard.equipment")
  const unitOptions = units || [
    { value: "kg", label: t("weightUnits.kg") },
    { value: "tons", label: t("weightUnits.tons") },
  ]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative z-20">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onValueChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 pr-28 rtl:pl-28 rtl:pr-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <div className="absolute right-3 rtl:left-3 rtl:right-auto top-1/2 -translate-y-1/2 w-20">
          <Dropdown
            options={unitOptions}
            value={unitValue}
            onChange={onUnitChange}
            disabled={disabled}
            noBorder
            compact
          />
        </div>
      </div>
    </div>
  )
}
