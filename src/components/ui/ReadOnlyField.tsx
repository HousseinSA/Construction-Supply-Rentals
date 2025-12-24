import { Lock } from "lucide-react"

interface ReadOnlyFieldProps {
  label: string
  value: string
  icon?: React.ReactNode
}

export default function ReadOnlyField({ label, value, icon }: ReadOnlyFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
        {label}
        <Lock className="w-3 h-3 text-gray-400" />
      </label>
      <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
        {icon}
        <span className="font-medium">{value}</span>
      </div>
    </div>
  )
}
