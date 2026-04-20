import { LucideIcon } from "lucide-react"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import { COMMISSION_COLORS } from "@/src/lib/constants/commission"

interface StatCardProps {
  title: string
  value: number
  subtitle: string
  subtitleValue?: number
  badge?: string
  icon: LucideIcon
  colorScheme: keyof typeof COMMISSION_COLORS
}

export default function StatCard({
  title,
  value,
  subtitle,
  subtitleValue,
  badge,
  icon: Icon,
  colorScheme
}: StatCardProps) {
  const colors = COMMISSION_COLORS[colorScheme]

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            <PriceDisplay amount={value} amountClassName="text-2xl font-bold text-gray-900" />
          </p>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-sm text-gray-500">
              {subtitleValue !== undefined && (
                <span className={`font-semibold ${colors.text} text-base`}>{subtitleValue}</span>
              )}{' '}
              {subtitle}
            </p>
            {badge && (
              <span className={`text-xs font-medium ${colors.badge} px-2 py-1 rounded`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`h-6 w-6 ${colors.icon}`} />
        </div>
      </div>
    </div>
  )
}
