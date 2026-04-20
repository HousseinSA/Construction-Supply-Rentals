import PriceDisplay from "@/src/components/ui/PriceDisplay"
import { CategoryCommission } from "@/src/lib/types"
import { CATEGORY_CHART_COLORS } from "@/src/lib/constants/commission"

interface CategoryProgressBarProps {
  category: CategoryCommission
  percentage: number
  barWidth: number
  colorIndex: number
}

export default function CategoryProgressBar({
  category,
  percentage,
  barWidth,
  colorIndex
}: CategoryProgressBarProps) {
  const colorClass = CATEGORY_CHART_COLORS[colorIndex % CATEGORY_CHART_COLORS.length]

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {category.categoryName}
        </span>
        <span className="text-sm text-gray-600">
          <PriceDisplay amount={category.totalCommission} amountClassName="text-sm text-gray-600" /> ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${barWidth}%` }}
        ></div>
      </div>
    </div>
  )
}
