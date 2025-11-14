import { forwardRef } from "react"

interface InputWithUnitProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  unit: string
  error?: string
}

const InputWithUnit = forwardRef<HTMLInputElement, InputWithUnitProps>(
  ({ label, unit, error, className = "", required, ...props }, ref) => {
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            ref={ref}
            className={`w-full px-4 py-3 pr-16 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200 ${className}`}
            {...props}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
            {unit}
          </span>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

InputWithUnit.displayName = "InputWithUnit"

export default InputWithUnit
