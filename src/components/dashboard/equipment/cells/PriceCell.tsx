import { RefreshCw, AlertCircle } from "lucide-react"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import { memo, useState } from "react"
import { useTranslations } from "next-intl"
import PricingInfoModal from "../PricingInfoModal"

interface EquipmentWithSupplier extends Equipment {
  supplier?: User
}

interface PriceCellProps {
  prices: Array<{ amount: number; suffix: string }>
  item: EquipmentWithSupplier
  isSupplier: boolean
  onPricingReview?: (item: EquipmentWithSupplier) => void
}

function PriceCell({
  prices,
  item,
  isSupplier,
  onPricingReview,
}: PriceCellProps) {
  const [showModal, setShowModal] = useState(false)
  const t = useTranslations("dashboard.equipment")

  return (
    <td className="px-6 py-4">
      <div className="space-y-1">
        {prices.map((price, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <PriceDisplay amount={price.amount} suffix={price.suffix} />
            {index === 0 && item.pendingPricing && (
              <button
                onClick={() =>
                  isSupplier ? setShowModal(true) : onPricingReview?.(item)
                }
                className="inline-flex items-center gap-0.5 text-xs text-orange-600 hover:text-orange-700 relative group"
                title={t("viewPricingInfo")}
              >
                <RefreshCw className="w-3 h-3" />
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  {t("viewPricingInfo")}
                </span>
              </button>
            )}
            {index === 0 &&
              item.rejectedPricingValues &&
              Object.keys(item.rejectedPricingValues).length > 0 &&
              isSupplier &&
              !item.pendingPricing && (
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center text-red-600 hover:text-red-700 relative group"
                  title={t("viewPricingInfo")}
                >
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {t("viewPricingInfo")}
                  </span>
                </button>
              )}
          </div>
        ))}
      </div>
      <PricingInfoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        item={item}
        isSupplier={isSupplier}
      />
    </td>
  )
}

export default memo(PriceCell, (prevProps, nextProps) => {
  return (
    prevProps.item._id === nextProps.item._id &&
    prevProps.item.pendingPricing === nextProps.item.pendingPricing &&
    prevProps.item.pricingRejectionReasons ===
      nextProps.item.pricingRejectionReasons &&
    prevProps.isSupplier === nextProps.isSupplier &&
    JSON.stringify(prevProps.prices) === JSON.stringify(nextProps.prices)
  )
})
