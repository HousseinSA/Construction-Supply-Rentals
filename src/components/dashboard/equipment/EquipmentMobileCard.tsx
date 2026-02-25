import { memo, useState } from "react"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import Dropdown from "@/src/components/ui/Dropdown"
import CopyButton from "@/src/components/ui/CopyButton"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import PricingInfoModal from "./PricingInfoModal"
import CardHeader from "./mobile-card/CardHeader"
import CardActions from "./mobile-card/CardActions"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useCityData } from "@/src/hooks/useCityData"
import { useTooltip } from "@/src/hooks/useTooltip"
import { useCardData } from "./mobile-card/useCardData"
import { formatPhoneNumber } from "@/src/lib/format"

interface EquipmentMobileCardProps {
  item: EquipmentWithSupplier & { hasActiveBookings?: boolean; hasPendingSale?: boolean }
  updating: string | null
  navigating: string | null
  onStatusChange: (id: string, action: "approve" | "reject") => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate: (url: string, id: string) => void
  onPricingReview?: (item: EquipmentWithSupplier) => void
  t: (key: string) => string
  isSupplier?: boolean
}

function EquipmentMobileCard({
  item,
  updating,
  navigating,
  onStatusChange,
  onAvailabilityChange,
  onNavigate,
  onPricingReview,
  t,
  isSupplier = false,
}: EquipmentMobileCardProps) {
  const { convertToLocalized } = useCityData()
  const { ref: tooltipRef, isOpen: showTooltip, toggle: toggleTooltip } = useTooltip()
  const [showPricingModal, setShowPricingModal] = useState(false)
  const { pricesList, supplierName, cardBorderClass } = useCardData(item)

  return (
    <>
    <div className={`p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all grid grid-rows-[minmax(50px,auto)_auto_auto] gap-2 ${cardBorderClass}`}>
      <CardHeader
        referenceNumber={item.referenceNumber}
        name={item.name}
        status={item.status}
        rejectionReason={item.rejectionReason}
        createdBy={item.createdBy}
        listingType={item.listingType}
        isAvailable={item.isAvailable}
        location={item.location}
        createdAt={item.createdAt}
        isSupplier={isSupplier}
        updating={updating}
        itemId={item._id?.toString() || ""}
        onStatusChange={onStatusChange}
        convertToLocalized={convertToLocalized}
        t={t}
      />

      <div className="flex gap-4 pb-3 border-b border-gray-200">
        <div className="w-36 sm:w-44 md:w-48 lg:w-52 h-36 relative rounded-lg flex-shrink-0 overflow-hidden">
          <EquipmentImage
            src={item.images[0] || "/equipement-images/default-fallback-image.png"}
            alt={item.name}
            cover
            onClick={() =>
              onNavigate(
                `/equipment/${item._id?.toString()}?admin=true`,
                item._id?.toString() || ""
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
                      onClick={() => isSupplier ? setShowPricingModal(true) : onPricingReview?.(item)}
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
              item.status === "approved" && !(item.listingType === "forSale" && !item.isAvailable) && !item.hasActiveBookings && !item.hasPendingSale &&
              onAvailabilityChange(
                item._id?.toString() || "",
                val === "available"
              )
            }
            disabled={item.status !== "approved" || (item.listingType === "forSale" && !item.isAvailable) || item.hasActiveBookings || item.hasPendingSale}
          />
          {(item.status !== "approved" || (item.status === "approved" && (item.hasActiveBookings || item.hasPendingSale)) || (item.status === "approved" && item.listingType === "forSale" && !item.isAvailable)) && (
            <div onClick={toggleTooltip} className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap transition-opacity pointer-events-auto z-10 cursor-pointer ${showTooltip ? 'opacity-100' : 'opacity-0'}`}>
              {item.status !== "approved" && t("pendingVerification")}
              {item.status === "approved" && (item.hasActiveBookings || item.hasPendingSale) && t("cannotEditActiveBooking")}
              {item.status === "approved" && item.listingType === "forSale" && !item.isAvailable && t("equipmentSold")}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>

        <CardActions
          itemId={item._id?.toString() || ""}
          status={item.status}
          listingType={item.listingType}
          isAvailable={item.isAvailable}
          hasActiveBookings={item.hasActiveBookings || false}
          createdBy={item.createdBy}
          isSupplier={isSupplier}
          navigating={navigating}
          onNavigate={onNavigate}
          t={t}
        />
      </div>
    </div>
    <PricingInfoModal
      isOpen={showPricingModal}
      onClose={() => setShowPricingModal(false)}
      item={item}
      isSupplier={isSupplier}
    />
  </>
  )
}

export default memo(EquipmentMobileCard, (prev, next) => {
  if (prev.item._id !== next.item._id) return false
  if (prev.item.status !== next.item.status) return false
  if (prev.item.isAvailable !== next.item.isAvailable) return false
  if (prev.item.pendingPricing !== next.item.pendingPricing) return false
  if (prev.updating !== next.updating) return false
  if (prev.navigating !== next.navigating) return false
  if (prev.isSupplier !== next.isSupplier) return false
  return true
})
