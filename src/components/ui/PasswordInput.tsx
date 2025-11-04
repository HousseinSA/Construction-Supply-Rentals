"use client"

import { useState, forwardRef } from "react"
import { Eye, EyeOff } from "lucide-react"
import { useLocale } from "next-intl"

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, error, className = "", ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const locale = useLocale()
    const isRTL = locale === "ar"

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={`w-full px-4 py-3 ${isRTL ? 'pl-12' : 'pr-12'} border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200 ${className}`}
            {...props}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors z-10`}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    )
  }
)

PasswordInput.displayName = "PasswordInput"

export default PasswordInput