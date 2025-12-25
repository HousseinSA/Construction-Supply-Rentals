import { MapPin, Edit, Eye, Tag, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import Dropdown from "@/src/components/ui/Dropdown"
import MessageModal from "@/src/components/ui/MessageModal"
import CopyButton from "@/src/components/ui/CopyButton"
import { EquipmentWithSupplier } from "@/src/stores/equipmentStore"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useCityData } from "@/src/hooks/useCityData"
import { useTranslations } from "next-intl"
import { formatPhoneNumber } from "@/src/lib/format"
import { useState } from "react"

interface EquipmentMobileCardProps {
  item: EquipmentWithSupplier & { hasActiveBookings?: boolean; hasPendingSale?: boolean }
  updating: string | null
  navigating: string | null
  displayPrice: string
  displayUnit: string
  onStatusChange: (id: string, action: "approve" | "reject") => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate: (url: string, id: string) => void
  onPricingReview?: (item: EquipmentWithSupplier) => void
  onResubmit?: (id: string) => void
  t: any
  isSupplier?: boolean
}

export default function EquipmentMobileCard({
  item,
  updating,
  navigating,
  displayPrice,
  displayUnit,
  onStatusChange,
  onAvailabilityChange,
  onNavigate,
  onPricingReview,
  onResubmit,
  t,
  isSupplier = false,
}: EquipmentMobileCardProps) {
  const { formatPrice } = usePriceFormatter()
  const { convertToLocalized } = useCityData()
  const tCommon = useTranslations("common")
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showPricingRejectionModal, setShowPricingRejectionModal] = useState(false)
  
  const getPricesList = () => {
    const prices = []
    if (item.pricing.hourlyRate) {
      const { displayPrice, displayUnit } = formatPrice(item.pricing.hourlyRate, 'hour')
      prices.push({ displayPrice, displayUnit })
    }
    if (item.pricing.dailyRate) {
      const { displayPrice, displayUnit } = formatPrice(item.pricing.dailyRate, 'day')
      prices.push({ displayPrice, displayUnit })
    }
    if (item.pricing.kmRate) {
      const { displayPrice, displayUnit } = formatPrice(item.pricing.kmRate, 'km')
      prices.push({ displayPrice, displayUnit })
    }
    if (item.pricing.salePrice) {
      const { displayPrice, displayUnit } = formatPrice(item.pricing.salePrice, 'sale')
      prices.push({ displayPrice, displayUnit })
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
    <div className="p-4 space-y-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-sm mb-1">{item.name}</div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {item.createdBy === "admin" && (
              <span className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                {t("createdByAdmin")}
              </span>
            )}
            {item.pendingPricing && (
              <button
                onClick={() => !isSupplier && onPricingReview?.(item)}
                disabled={isSupplier}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors disabled:hover:bg-orange-100 disabled:cursor-default"
                title={!isSupplier ? t("reviewPricingRequest") : ""}
              >
                <RefreshCw className="w-3 h-3" />
                {isSupplier ? t("pricingPendingApproval") : t("pricingUpdateRequest")}
              </button>
            )}
            {item.status === "rejected" && item.rejectionReason && (
              <button
                onClick={() => setShowRejectionModal(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <AlertCircle className="w-3 h-3" />
                {t("rejectionReason")}
              </button>
            )}
            {item.pricingRejectionReason && isSupplier && (
              <button
                onClick={() => setShowPricingRejectionModal(true)}
                className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                <AlertCircle className="w-3 h-3" />
                {t("pricingRejected")}
              </button>
            )}
            {item.listingType === "forSale" && !item.isAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-red-600">
                <Tag className="w-3 h-3" />
                {t("sold")}
              </span>
            )}
            {item.listingType === "forSale" && item.isAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-gradient-to-r from-orange-500 to-red-500">
                <Tag className="w-3 h-3" />
                {t("forSale")}
              </span>
            )}
            <div className="text-xs text-gray-500 capitalize flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              {convertToLocalized(item.location)}
            </div>
          </div>
        </div>
        <div className="flex-shrink-0 flex flex-col items-end">
          {item.status === "pending" && !isSupplier ? (
            <div className="flex flex-col gap-1">
              <button
                onClick={() => onStatusChange(item._id?.toString() || "", "approve")}
                disabled={updating === item._id?.toString()}
                className="px-2 py-1 text-xs font-medium bg-green-500 text-white rounded hover:bg-green-600"
              >
                {t("approve")}
              </button>
              <button
                onClick={() => onStatusChange(item._id?.toString() || "", "reject")}
                disabled={updating === item._id?.toString()}
                className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded hover:bg-red-600"
              >
                {t("reject")}
              </button>
            </div>
          ) : item.status === "rejected" && isSupplier ? (
            <div className="flex flex-col gap-1">
              <span className="inline-block px-2 py-1 text-xs font-semibold rounded bg-red-100 text-red-700">
                {t("rejected")}
              </span>
              <button
                onClick={() => {
                  const canResubmit = item.lastEditedAt && item.rejectedAt && 
                    new Date(item.lastEditedAt) > new Date(item.rejectedAt)
                  if (canResubmit) {
                    onResubmit?.(item._id?.toString() || "")
                  }
                }}
                disabled={updating === item._id?.toString() || 
                  !(item.lastEditedAt && item.rejectedAt && 
                    new Date(item.lastEditedAt) > new Date(item.rejectedAt))}
                className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                {updating === item._id?.toString() ? t("resubmitting") : t("resubmit")}
              </button>
            </div>
          ) : (
            <span
              className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
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
          <div className="text-xs text-gray-500 mt-1">
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-gray-200">
         
          <div className="relative h-32 overflow-hidden rounded-lg bg-gray-100">
            <EquipmentImage
              src={item.images[0] || "/equipement-images/default-fallback-image.png"}
              alt={item.name}
              size="lg"
              className="!w-full !h-full object-contain"
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
        <div className="flex flex-col justify-center space-y-2">
          <div >
            <div className="text-xs text-gray-500 mb-1">{t("price")}</div>
            <div className="space-y-0.5">
              {getPricesList().map((price, idx) => (
                <div key={idx} className="font-semibold text-sm text-gray-900" >
                 <span dir="ltr">{price.displayPrice}</span>  {price.displayUnit}
                </div>
              ))}
            </div>
          </div>
          {!isSupplier && (
            <div>
              <div className="text-xs text-gray-500 mb-1">{t("supplierInfo")}</div>
              <div className="font-semibold text-sm text-gray-900">
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

{item.status === "approved" && !(item.listingType === "forSale" && !item.isAvailable) && (
        <div className="w-full relative group">
          <Dropdown
            options={[
              { value: "available", label: t("available") },
              { value: "unavailable", label: t("unavailable") },
            ]}
            value={item.isAvailable ? "available" : "unavailable"}
            onChange={(val) =>
              onAvailabilityChange(
                item._id?.toString() || "",
                val === "available"
              )
            }
            disabled={item.hasActiveBookings || item.hasPendingSale}
          />
          {(item.hasActiveBookings || item.hasPendingSale) && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {t("cannotEditActiveBooking")}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      )}
      <div className="flex items-stretch gap-2">
        {!isSupplier && item.createdBy === "admin" && (
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
        {isSupplier && (item.status === "approved" || item.status === "pending" || item.status === "rejected") && (
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
    {showRejectionModal && (
      <MessageModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title={t("rejectionReason")}
        message={item.rejectionReason || ""}
      />
    )}
    {showPricingRejectionModal && (
      <MessageModal
        isOpen={showPricingRejectionModal}
        onClose={() => setShowPricingRejectionModal(false)}
        title={t("pricingRejected")}
        message={item.pricingRejectionReason || ""}
      />
    )}
  </>
  )
}
