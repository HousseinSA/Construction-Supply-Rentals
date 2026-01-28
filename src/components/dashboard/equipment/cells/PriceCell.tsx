import { RefreshCw, AlertCircle } from "lucide-react"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import TooltipWrapper from "@/src/components/ui/TooltipWrapper"
import PricingUpdateTooltip from "../PricingUpdateTooltip"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import { memo, useMemo } from "react"

interface EquipmentWithSupplier extends Equipment {
  supplier?: User
}

interface PriceCellProps {
  prices: Array<{ amount: number; suffix: string }>
  item: EquipmentWithSupplier
  isSupplier: boolean
  onPricingReview?: (item: EquipmentWithSupplier) => void
}

function PriceCell({ prices, item, isSupplier, onPricingReview }: PriceCellProps) {
  const tooltipContent = useMemo(
    () => <PricingUpdateTooltip item={item} isSupplier={isSupplier} />,
    [item.pendingPricing, item.currentPricing, item.requestedPricing, isSupplier]
  )

  return (
    <td className="px-6 py-4">
      <div className="space-y-1">
        {prices.map((price, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <PriceDisplay amount={price.amount} suffix={price.suffix} />
            {index === 0 && item.pendingPricing && (
              <TooltipWrapper content={tooltipContent} className={isSupplier ? "min-w-max" : undefined}>
                <button
                  onClick={!isSupplier ? () => onPricingReview?.(item) : undefined}
                  className="inline-flex items-center gap-0.5 text-xs text-orange-600 hover:text-orange-700"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              </TooltipWrapper>
            )}
            {index === 0 && item.pricingRejectionReason && isSupplier && (
              <TooltipWrapper content={item.pricingRejectionReason}>
                <span className="inline-flex items-center text-red-600 cursor-help">
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
              </TooltipWrapper>
            )}
          </div>
        ))}
      </div>
    </td>
  )
}

export default memo(PriceCell)
