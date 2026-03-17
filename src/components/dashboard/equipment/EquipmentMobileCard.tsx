import { useState } from "react"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import Dropdown from "@/src/components/ui/Dropdown"
import CopyButton from "@/src/components/ui/CopyButton"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import PricingInfoModal from "./PricingInfoModal"
import PricingReviewModal from "./PricingReviewModal"
import CardHeader from "./mobile-card/CardHeader"
import CardActions from "./mobile-card/CardActions"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useTooltip } from "@/src/hooks/useTooltip"
import { useCardData } from "./mobile-card/useCardData"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { useTranslations } from "next-intl"
import { useRouter } from "@/src/i18n/navigation"
import { formatPhoneNumber } from "@/src/lib/format"

interface EquipmentMobileCardProps {
  item: EquipmentWithSupplier & { hasActiveBookings?: boolean; hasPendingSale?: boolean }
  onStatusChange: (id: string, action: "approve" | "reject") => void
}

function EquipmentMobileCard({ item, onStatusChange }: EquipmentMobileCardProps) {
  const { ref: tooltipRef, isOpen: showTooltip, toggle: toggleTooltip } = useTooltip()
  const [showPricingModal, setShowPricingModal] = useState(false)
  const { pricesList, supplierName, cardBorderClass } = useCardData(item)
  const updating = useEquipmentStore((state) => state.updating)
  const navigating = useEquipmentStore((state) => state.navigating)
  const isSupplier = useEquipmentStore((state) => state.isSupplier)
  const onPricingReview = useEquipmentStore((state) => state.onPricingReview)
  const updateEquipmentAvailability = useEquipmentStore((state) => state.updateEquipmentAvailability)
  const navigateToEquipment = useEquipmentStore((state) => state.navigateToEquipment)
  const t = useTranslations("dashboard.equipment")
  const router = useRouter()

  return (
    <>
    <div className={`p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all grid grid-rows-[minmax(50px,auto)_auto_auto] gap-2 ${cardBorderClass}`}>
      <CardHeader item={item} onStatusChange={onStatusChange} />

      <div className="flex gap-4 pb-3 border-b border-gray-200">
        <div className="w-36 sm:w-44 md:w-48 lg:w-52 h-36 relative rounded-lg flex-shrink-0 overflow-hidden">
          <EquipmentImage
            src={item.images?.[0] || "/equipment-images/default-fallback-image.png"}
            alt={item.name}
            cover
            onClick={() =>
              navigateToEquipment(
                `/equipment/${item._id?.toString()}?admin=true`,
                item._id?.toString() || "",
                router
              )
            }
          />
          {navigating === item._id?.toString() && (
            <div className="absolute inset-0 bg-black/25 rounded-lg flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-start space-y-2 overflow-visible" >
          <div >
            <div className="text-xs text-gray-500 mb-1">{t("price")}</div>
            <div className="space-y-0.5">
              {pricesList.map((price, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <PriceDisplay amount={price.amount} suffix={price.suffix} />
                  {idx === 0 && item.pendingPricing && (
                    <button
                      onClick={() => setShowPricingModal(true)}
                      className="inline-flex items-center text-orange-600 hover:text-orange-700"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {idx === 0 && item.rejectedPricingValues && Object.keys(item.rejectedPricingValues).length > 0 && isSupplier && !item.pendingPricing && (
                    <button
                      onClick={() => setShowPricingModal(true)}
                      className="inline-flex items-center text-red-600 hover:text-red-700"
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
          {!isSupplier && (
            <div>
              <div className="text-xs text-gray-500 mb-1">{t("supplierInfo")}</div>
              <div className={`font-semibold ${supplierName === 'Admin' ? 'text-blue-700' : 'text-gray-900'} text-sm`}>
                {supplierName}
              </div>
              {item.createdBy !== "admin" && item.supplier && (
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-xs text-gray-700" dir="ltr">{formatPhoneNumber(item.supplier.phone)}</span>
                  <CopyButton text={item.supplier.phone} size="sm" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div ref={tooltipRef} className="w-full relative">
          <Dropdown
            options={[
              { value: "available", label: t("available") },
              { value: "unavailable", label: t("unavailable") },
            ]}
            value={item.isAvailable ? "available" : "unavailable"}
            onChange={(val) =>
              item.status === "approved" && !item.isSold && !item.hasActiveBookings && !item.hasPendingSale &&
              updateEquipmentAvailability(
                item._id?.toString() || "",
                val === "available",
                t
              )
            }
            disabled={item.status !== "approved" || item.isSold || item.hasActiveBookings || item.hasPendingSale}
          />
          {(item.status !== "approved" || (item.status === "approved" && (item.hasActiveBookings || item.hasPendingSale)) || item.isSold) && (
            <div onClick={toggleTooltip} className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap transition-opacity pointer-events-auto z-10 cursor-pointer ${showTooltip ? 'opacity-100' : 'opacity-0'}`}>
              {item.status !== "approved" && t("pendingVerification")}
              {item.status === "approved" && item.isSold && t("equipmentSold")}
              {item.status === "approved" && !item.isSold && item.listingType === "forSale" && item.hasPendingSale && t("hasPendingSale")}
              {item.status === "approved" && !item.isSold && item.hasActiveBookings && t("hasActiveBookings")}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
        <CardActions item={item} />
      </div>
    </div>
    {!isSupplier && item.pendingPricing && showPricingModal ? (
      <PricingReviewModal
        equipmentId={item._id?.toString() || ""}
        currentPricing={item.pricing}
        pendingPricing={item.pendingPricing}
        onClose={() => setShowPricingModal(false)}
        onSuccess={() => {
          setShowPricingModal(false)
          onPricingReview?.(item)
        }}
      />
    ) : (
      <PricingInfoModal
        isOpen={showPricingModal}
        onClose={() => setShowPricingModal(false)}
        item={item}
        isSupplier={isSupplier}
      />
    )}
  </>
  )
}

export default EquipmentMobileCard
