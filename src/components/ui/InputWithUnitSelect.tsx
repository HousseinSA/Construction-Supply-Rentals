import WeightUnitDropdown from "./WeightUnitDropdown"

interface InputWithUnitSelectProps {
  label: string
  name: string
  value: string
  unitValue: string
  onValueChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onUnitChange: (value: string) => void
  placeholder?: string
  required?: boolean
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
}: InputWithUnitSelectProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          name={name}
          value={value}
          onChange={onValueChange}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
        />
        <div className="w-32">
          <WeightUnitDropdown value={unitValue} onChange={onUnitChange} />
        </div>
      </div>
    </div>
  )
}
