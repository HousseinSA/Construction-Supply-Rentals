import { MapPin, Edit, Eye, Tag, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import Dropdown from "@/src/components/ui/Dropdown"
import CopyButton from "@/src/components/ui/CopyButton"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import PricingInfoModal from "./PricingInfoModal"
import { EquipmentWithSupplier } from "@/src/stores/equipmentStore"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useCityData } from "@/src/hooks/useCityData"
import { useTooltip } from "@/src/hooks/useTooltip"
import { useTranslations } from "next-intl"
import { formatPhoneNumber } from "@/src/lib/format"
import { useState } from "react"

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

export default function EquipmentMobileCard({
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
  const { formatPrice: _ } = usePriceFormatter()
  const { convertToLocalized } = useCityData()
  const tCommon = useTranslations("common")
  const { ref: tooltipRef, isOpen: showTooltip, toggle: toggleTooltip } = useTooltip()
  const [showPricingModal, setShowPricingModal] = useState(false)
  const getPricesList = () => {
    const prices = []
    if (item.listingType === "forSale" && item.pricing.salePrice) {
      prices.push({ amount: item.pricing.salePrice, suffix: "" })
    } else {
      if (item.pricing.hourlyRate) {
        prices.push({ amount: item.pricing.hourlyRate, suffix: ` / ${tCommon("hour")}` })
      }
      if (item.pricing.dailyRate) {
        prices.push({ amount: item.pricing.dailyRate, suffix: ` / ${tCommon("day")}` })
      }
      if (item.pricing.monthlyRate) {
        prices.push({ amount: item.pricing.monthlyRate, suffix: ` / ${tCommon("month")}` })
      }
      if (item.pricing.kmRate) {
        prices.push({ amount: item.pricing.kmRate, suffix: ` / ${tCommon("km")}` })
      }
      if (item.pricing.tonRate) {
        prices.push({ amount: item.pricing.tonRate, suffix: ` / ${tCommon("ton")}` })
      }
    }
    return prices
  }

  const supplierName = item.createdBy === "admin" 
    ? tCommon("admin")
    : item.supplier 
    ? `${item.supplier.firstName} ${item.supplier.lastName}`
    : "-"

  return (
    <>
    <div className={`p-4 bg-white rounded-lg border shadow-sm hover:shadow-md transition-all grid grid-rows-[minmax(50px,auto)_auto_auto] gap-2 ${
      item.pendingPricing 
        ? 'border-orange-400 border-2 bg-orange-50' 
        : item.rejectedPricingValues && Object.keys(item.rejectedPricingValues).length > 0 && isSupplier
        ? 'border-red-400 border-2 bg-red-50'
        : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {item.referenceNumber && (
            <div className="text-sm font-semibold text-primary mb-1">
              #{item.referenceNumber}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 text-sm">{item.name}</span>
            {item.status === "rejected" && item.rejectionReason && (
              <div className="relative group inline-block">
                <span className="inline-flex items-center text-red-600 cursor-help">
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
                <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max max-w-xs z-50 whitespace-normal">
                  {item.rejectionReason}
                  <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            {item.createdBy === "admin" && (
              <span className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                {t("createdByAdmin")}
              </span>
            )}
            {item.listingType === "forSale" && !item.isAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-red-600">
                <Tag className="w-3.5 h-3.5" />
                {t("sold")}
              </span>
            )}
            {item.listingType === "forSale" && item.isAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-gradient-to-r from-orange-500 to-red-500">
                <Tag className="w-3.5 h-3.5" />
                {t("forSale")}
              </span>
            )}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {convertToLocalized(item.location)}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          {item.status === "pending" && !isSupplier ? (
            <>
              <button
                onClick={() => onStatusChange(item._id?.toString() || "", "approve")}
                disabled={updating === item._id?.toString()}
                className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 min-w-[70px]"
              >
                {t("approve")}
              </button>
              <button
                onClick={() => onStatusChange(item._id?.toString() || "", "reject")}
                disabled={updating === item._id?.toString()}
                className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 min-w-[70px]"
              >
                {t("reject")}
              </button>
            </>
          ) : item.status === "rejected" && isSupplier ? (
            <>
              <div className="relative group">
                <span className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-red-100 text-red-700 cursor-help">
                  {t("rejected")}
                </span>
                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max z-50 whitespace-nowrap">
                  {t("editBeforeResubmit")}
                  <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </>
          ) : (
            <span
              className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md ${
                item.status === "approved"
                  ? "bg-green-100 text-green-700"
                  : item.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {isSupplier && item.status === "pending" ? t("pendingVerification") : t(item.status)}
            </span>
          )}
          <div className="text-xs text-gray-500" dir="ltr">
            {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
          </div>
        </div>
      </div>

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
              {getPricesList().map((price, idx) => (
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

        <div className="flex gap-2">
        {!isSupplier && item.createdBy === "admin" && !(item.listingType === "forSale" && !item.isAvailable) && (
          <div className="relative group">
            <button
              onClick={() =>
                !item.hasActiveBookings &&
                onNavigate(
                  `/dashboard/equipment/edit/${item._id?.toString()}`,
                  `edit-${item._id?.toString()}`
                )
              }
              disabled={navigating === `edit-${item._id?.toString()}` || item.hasActiveBookings}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${
                item.hasActiveBookings
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "text-blue-600 bg-blue-50 hover:bg-blue-100"
              }`}
            >
              {navigating === `edit-${item._id?.toString()}` ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Edit className="w-4 h-4" />
              )}
            </button>
            {item.hasActiveBookings && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                {t("cannotEditActiveBooking")}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            )}
          </div>
        )}
        {isSupplier && (item.status === "rejected" || (item.status === "approved" && !item.hasActiveBookings && !item.hasPendingSale)) && !(item.listingType === "forSale" && !item.isAvailable) && (
          <button
            onClick={() =>
              onNavigate(
                `/dashboard/equipment/edit/${item._id?.toString()}`,
                `edit-${item._id?.toString()}`
              )
            }
            disabled={navigating === `edit-${item._id?.toString()}`}
            className="px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100"
          >
            {navigating === `edit-${item._id?.toString()}` ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Edit className="w-4 h-4" />
            )}
          </button>
        )}
        <button
          onClick={() =>
            onNavigate(
              `/equipment/${item._id?.toString()}?admin=true`,
              item._id?.toString() || ""
            )
          }
          disabled={navigating === item._id?.toString()}
          className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center justify-center gap-1.5"
        >
          <Eye className="w-4 h-4" />
          {t("viewDetails")}
        </button>
        </div>
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
