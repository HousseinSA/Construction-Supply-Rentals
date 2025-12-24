import { useTranslations } from "next-intl"
import { useRouter } from "@/src/i18n/navigation"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useCityData } from "@/src/hooks/useCityData"
import { MapPin, Edit, Eye, Tag, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import { createPortal } from "react-dom"
import Dropdown from "../../ui/Dropdown"
import MessageModal from "../../ui/MessageModal"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import CopyButton from "../../ui/CopyButton"
import { formatPhoneNumber } from "@/src/lib/format"
import { getOptimizedCloudinaryUrl } from "@/src/lib/cloudinary-url"

interface EquipmentWithSupplier extends Equipment {
  supplier?: User
  hasActiveBookings?: boolean
  hasPendingSale?: boolean
}

interface EquipmentTableRowProps {
  item: EquipmentWithSupplier
  updating: string | null
  navigating?: string | null
  onStatusChange: (id: string, action: "approve" | "reject", reason?: string) => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate?: (url: string, id: string) => void
  onPricingReview?: (item: EquipmentWithSupplier) => void
  onResubmit?: (id: string) => void
  isSupplier?: boolean
}

export default function EquipmentTableRow({
  item,
  updating,
  navigating,
  onStatusChange,
  onAvailabilityChange,
  onNavigate,
  onPricingReview,
  onResubmit,
  isSupplier = false,
}: EquipmentTableRowProps) {
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { getPriceData, formatPrice } = usePriceFormatter()
  const { convertToLocalized } = useCityData()
  const [showRejectionModal, setShowRejectionModal] = useState(false)
  const [showPricingRejectionModal, setShowPricingRejectionModal] = useState(false)

  const getAllPrices = () => {
    const prices = []
    if (item.listingType === "forSale" && item.pricing.salePrice) {
      const { displayPrice, displayUnit } = formatPrice(item.pricing.salePrice, "sale")
      prices.push({ displayPrice, displayUnit })
    } else {
      if (item.pricing.hourlyRate) {
        const { displayPrice, displayUnit } = formatPrice(item.pricing.hourlyRate, "hour")
        prices.push({ displayPrice, displayUnit })
      }
      if (item.pricing.dailyRate) {
        const { displayPrice, displayUnit } = formatPrice(item.pricing.dailyRate, "day")
        prices.push({ displayPrice, displayUnit })
      }
      if (item.pricing.kmRate) {
        const { displayPrice, displayUnit } = formatPrice(item.pricing.kmRate, "km")
        prices.push({ displayPrice, displayUnit })
      }
      if (item.pricing.tonRate) {
        const { displayPrice, displayUnit } = formatPrice(item.pricing.tonRate, "ton")
        prices.push({ displayPrice, displayUnit })
      }
    }
    return prices
  }
  
  const allPrices = getAllPrices()
  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4 sticky left-0 z-10 bg-white">
        <div className="flex items-center gap-4 min-w-[280px]">
          <div className="relative">
            <Image
              src={
                item.images[0]
                  ? getOptimizedCloudinaryUrl(item.images[0], {
                      width: 200,
                      height: 160,
                      quality: 'auto:good',
                      format: 'auto',
                      crop: 'fill'
                    })
                  : "/equipement-images/default-fallback-image.png"
              }
              alt={item.name}
              width={96}
              height={80}
              sizes="96px"
              className="w-24 h-20 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
                onNavigate ? onNavigate(`/equipment/${item._id?.toString()}?admin=true`, item._id?.toString() || "") : router.push(`/equipment/${item._id?.toString()}?admin=true`)
              }
              loading="lazy"
            />
            {navigating === item._id?.toString() && (
              <div className="absolute inset-0 bg-black/25 rounded-lg flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-base mb-1">
              {item.name}
            </div>
            <div className="flex flex-col gap-2">
              {item.createdBy === "admin" && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded w-fit">
                  {t("createdByAdmin")}
                </span>
              )}
              {item.pendingPricing && (
                <button
                  onClick={() => !isSupplier && onPricingReview?.(item)}
                  disabled={isSupplier}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-700 rounded hover:bg-orange-200 transition-colors w-fit disabled:hover:bg-orange-100 disabled:cursor-default"
                  title={!isSupplier ? t("reviewPricingRequest") : ""}
                >
                  <RefreshCw className="w-3 h-3" />
                  {isSupplier ? t("pricingPendingApproval") : t("pricingUpdateRequest")}
                </button>
              )}
              {item.status === "rejected" && item.rejectionReason && (
                <button
                  onClick={() => setShowRejectionModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  <AlertCircle className="w-3 h-3" />
                  {t("rejectionReason")}
                </button>
              )}
              {item.pricingRejectionReason && isSupplier && (
                <button
                  onClick={() => setShowPricingRejectionModal(true)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                >
                  <AlertCircle className="w-3 h-3" />
                  {t("pricingRejectionReason")}
                </button>
              )}
              {item.listingType === "forSale" && !item.isAvailable && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded bg-red-600 w-fit">
                  <Tag className="w-3 h-3" />
                  {t("sold")}
                </span>
              )}
              {item.listingType === "forSale" && item.isAvailable && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded bg-gradient-to-r from-orange-500 to-red-500 w-fit">
                  <Tag className="w-3 h-3" />
                  {t("forSale")}
                </span>
              )}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-1.5 min-w-[120px]">
          <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 capitalize whitespace-nowrap">
            {convertToLocalized(item.location)}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="space-y-1 min-w-[140px]">
          {allPrices.map((price, index) => (
            <div key={index} className="text-sm font-semibold text-gray-900">
              <span dir="ltr">{price.displayPrice}</span>
              {price.displayUnit && ` ${price.displayUnit}`}
            </div>
          ))}
        </div>
      </td>
      {!isSupplier && (
        <td className="px-6 py-4">
          {item.createdBy === "admin" ? (
            <span className="text-sm font-medium text-blue-700 whitespace-nowrap">{tCommon("admin")}</span>
          ) : item.supplier ? (
            <div className="space-y-1.5 min-w-[160px]">
              <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
                {item.supplier.firstName} {item.supplier.lastName}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 whitespace-nowrap" dir="ltr">{formatPhoneNumber(item.supplier.phone)}</span>
                <CopyButton text={item.supplier.phone} size="sm" />
              </div>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          )}
        </td>
      )}
      <td className="px-6 py-4 text-center">
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4 text-center min-w-[120px]">
        {item.status === "pending" && !isSupplier ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={() =>
                onStatusChange(item._id?.toString() || "", "approve")
              }
              disabled={updating === item._id?.toString()}
              className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              {t("approve")}
            </button>
            <button
              onClick={() =>
                onStatusChange(item._id?.toString() || "", "reject")
              }
              disabled={updating === item._id?.toString()}
              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 transition-colors"
            >
              {t("reject")}
            </button>
          </div>
        ) : item.status === "rejected" && isSupplier ? (
          <div className="flex flex-col gap-2">
            <span className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-red-100 text-red-700">
              {t("rejected")}
            </span>
            <div className="relative group">
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
                className="px-3 py-1.5 text-xs font-medium bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors w-full"
              >
                {updating === item._id?.toString() ? t("resubmitting") : t("resubmit")}
              </button>
              {!(item.lastEditedAt && item.rejectedAt && 
                new Date(item.lastEditedAt) > new Date(item.rejectedAt)) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {t("editBeforeResubmit")}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <span
            className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md ${
              item.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : item.status === "approved"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {isSupplier && item.status === "pending" ? t("pendingVerification") : t(item.status)}
          </span>
        )}
      </td>
      <td className="px-6 py-4 overflow-visible relative">
        <div className="flex justify-center">
          {item.status === "approved" ? (
            <div className="w-40 relative group">
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
                compact
                disabled={item.hasActiveBookings || item.hasPendingSale}
              />
              {(item.hasActiveBookings || item.hasPendingSale) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {t("cannotEditActiveBooking")}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          ) : (
            <span className="text-sm text-gray-400">-</span>
          )}
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {!isSupplier && (
            <button
              onClick={() =>
                onNavigate ? onNavigate(`/dashboard/equipment/edit/${item._id?.toString()}`, `edit-${item._id?.toString()}`) : router.push(`/dashboard/equipment/edit/${item._id?.toString()}`)
              }
              disabled={navigating === `edit-${item._id?.toString()}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title={t("editEquipment")}
            >
              {navigating === `edit-${item._id?.toString()}` ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Edit className="w-5 h-5" />
              )}
            </button>
          )}
          {isSupplier && (
            <button
              onClick={() =>
                onNavigate ? onNavigate(`/dashboard/equipment/edit/${item._id?.toString()}`, `edit-${item._id?.toString()}`) : router.push(`/dashboard/equipment/edit/${item._id?.toString()}`)
              }
              disabled={navigating === `edit-${item._id?.toString()}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
              title={t("editEquipment")}
            >
              {navigating === `edit-${item._id?.toString()}` ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Edit className="w-5 h-5" />
              )}
            </button>
          )}
          <button
            onClick={() =>
              onNavigate ? onNavigate(`/equipment/${item._id?.toString()}?admin=true`, item._id?.toString() || "") : router.push(`/equipment/${item._id?.toString()}?admin=true`)
            }
            disabled={navigating === item._id?.toString()}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title={t("viewDetails")}
          >
            {navigating === item._id?.toString() ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </td>
    </tr>
    {typeof document !== 'undefined' && showRejectionModal && createPortal(
      <MessageModal
        isOpen={showRejectionModal}
        onClose={() => setShowRejectionModal(false)}
        title={t("rejectionReason")}
        message={item.rejectionReason || ""}
      />,
      document.body
    )}
    {typeof document !== 'undefined' && showPricingRejectionModal && createPortal(
      <MessageModal
        isOpen={showPricingRejectionModal}
        onClose={() => setShowPricingRejectionModal(false)}
        title={t("pricingRejectionReason")}
        message={item.pricingRejectionReason || ""}
      />,
      document.body
    )}
    </>
  )
}
