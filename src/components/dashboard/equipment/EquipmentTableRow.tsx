import { useTranslations } from "next-intl"
import { useRouter } from "@/src/i18n/navigation"
import { useCityData } from "@/src/hooks/useCityData"
import { useEquipmentPrices } from "@/src/hooks/useEquipmentPrices"
import { useTooltip } from "@/src/hooks/useTooltip"
import {
  MapPin,
  Edit,
  Eye,
  Tag,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import Image from "next/image"
import Dropdown from "../../ui/Dropdown"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import CopyButton from "../../ui/CopyButton"
import { formatPhoneNumber } from "@/src/lib/format"
import { getOptimizedCloudinaryUrl } from "@/src/lib/cloudinary-url"
import PriceDisplay from "../../ui/PriceDisplay"

interface EquipmentWithSupplier extends Equipment {
  supplier?: User
  hasActiveBookings?: boolean
  hasPendingSale?: boolean
}

interface EquipmentTableRowProps {
  item: EquipmentWithSupplier
  updating: string | null
  navigating?: string | null
  onStatusChange: (
    id: string,
    action: "approve" | "reject",
    reason?: string
  ) => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate?: (url: string, id: string) => void
  onPricingReview?: (item: EquipmentWithSupplier) => void
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
  isSupplier = false,
}: EquipmentTableRowProps) {
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { convertToLocalized } = useCityData()
  const editTooltip = useTooltip()
  const pricingTooltip = useTooltip()
  const allPrices = useEquipmentPrices(item)
  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-6 py-4 sticky left-0 z-10 bg-white">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Image
                src={
                  item.images[0]
                    ? getOptimizedCloudinaryUrl(item.images[0], {
                        width: 200,
                        height: 160,
                        quality: "auto:good",
                        format: "auto",
                        crop: "fill",
                      })
                    : "/equipement-images/default-fallback-image.png"
                }
                alt={item.name}
                width={96}
                height={80}
                sizes="96px"
                className="w-24 h-20 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() =>
                  onNavigate
                    ? onNavigate(
                        `/equipment/${item._id?.toString()}?admin=true`,
                        item._id?.toString() || ""
                      )
                    : router.push(
                        `/equipment/${item._id?.toString()}?admin=true`
                      )
                }
                loading="lazy"
              />
              {navigating === item._id?.toString() && (
                <div className="absolute inset-0 bg-black/25 rounded-lg flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-white animate-spin" />
                </div>
              )}
            </div>
            <div className="space-y-1">
              {item.referenceNumber && (
                <div className="text-xs font-semibold text-primary">
                  #{item.referenceNumber}
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-gray-900">
                  {item.name}
                </span>
                {item.status === "rejected" && item.rejectionReason && (
                  <div className="relative group inline-block">
                    <span className="text-red-600 cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max max-w-xs z-50 whitespace-normal">
                      {item.rejectionReason}
                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {item.createdBy === "admin" && (
                  <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded w-fit">
                    {t("createdByAdmin")}
                  </span>
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
          <div className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm font-medium text-gray-700 capitalize whitespace-nowrap">
              {convertToLocalized(item.location)}
            </span>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="space-y-1">
            {allPrices.map((price, index) => (
              <div key={index} className="flex items-center gap-1.5">
                <PriceDisplay amount={price.amount} suffix={price.suffix} />
                {index === 0 && item.pendingPricing && !isSupplier && (
                  <div className="relative group inline-block">
                    <button
                      onClick={() => onPricingReview?.(item)}
                      className="inline-flex items-center gap-0.5 text-xs text-orange-600 hover:text-orange-700"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {t("clickToShowNewPrices")}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
                {index === 0 && item.pendingPricing && isSupplier && (
                  <div className="relative group inline-block">
                    <span className="inline-flex items-center gap-0.5 text-xs text-orange-600 cursor-help">
                      <RefreshCw className="w-3 h-3" />
                    </span>
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      <div className="space-y-1">
                        <div className="font-semibold">
                          {t("pricingPendingApproval")}
                        </div>
                        <div className="text-gray-300">
                          {t("currentPricing")} → {t("requestedPricing")}
                        </div>
                        {[
                          { key: "hourlyRate" as const, suffix: `/h` },
                          {
                            key: "dailyRate" as const,
                            suffix: `/${tCommon("day")}`,
                          },
                          {
                            key: "kmRate" as const,
                            suffix: `/${tCommon("km")}`,
                          },
                          { key: "salePrice" as const, suffix: "" },
                        ].map(({ key, suffix }) =>
                          item.pricing[key] && item.pendingPricing?.[key] ? (
                            <div key={key} dir="ltr">
                              {item.pricing[key]} → {item.pendingPricing[key]}{" "}
                              MRU{suffix}
                            </div>
                          ) : null
                        )}
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
                {index === 0 && item.pricingRejectionReason && isSupplier && (
                  <div className="relative group inline-block">
                    <span className=" gap-0.5 text-xs text-red-600 cursor-help">
                      <AlertCircle className="w-3.5 h-3.5" />
                    </span>
                    <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max max-w-xs z-50 whitespace-normal">
                      {item.pricingRejectionReason}
                      <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </td>
        {!isSupplier && (
          <td className="px-6 py-4">
            {item.createdBy === "admin" ? (
              <span className="text-sm font-medium text-blue-700 whitespace-nowrap">
                {tCommon("admin")}
              </span>
            ) : item.supplier ? (
              <div className="space-y-1.5">
                <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
                  {item.supplier.firstName} {item.supplier.lastName}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm text-gray-700 whitespace-nowrap"
                    dir="ltr"
                  >
                    {formatPhoneNumber(item.supplier.phone)}
                  </span>
                  <CopyButton text={item.supplier.phone} size="sm" />
                </div>
              </div>
            ) : (
              <span className="text-gray-400 text-sm">-</span>
            )}
          </td>
        )}
        <td className="px-6 py-4 text-center">
          <span className="text-lg text-gray-600 whitespace-nowrap">
            {new Date(item.createdAt).toLocaleDateString()}
          </span>
        </td>
        <td className="px-6 py-4 text-center">
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
            <div className="relative group">
              <span className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-red-100 text-red-700 cursor-help">
                {t("rejected")}
              </span>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max z-10">
                {t("editBeforeResubmit")}
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
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
              {isSupplier && item.status === "pending"
                ? t("pendingVerification")
                : t(item.status)}
            </span>
          )}
        </td>
        <td className="px-6 py-4">
          <div className="flex justify-center overflow-visible">
            <div className="relative group">
              <Dropdown
                options={[
                  { value: "available", label: t("available") },
                  { value: "unavailable", label: t("unavailable") },
                ]}
                value={item.isAvailable ? "available" : "unavailable"}
                onChange={(val) =>
                  item.status === "approved" &&
                  !(item.listingType === "forSale" && !item.isAvailable) &&
                  !item.hasActiveBookings &&
                  !item.hasPendingSale &&
                  onAvailabilityChange(
                    item._id?.toString() || "",
                    val === "available"
                  )
                }
                compact
                disabled={
                  item.status !== "approved" ||
                  (item.listingType === "forSale" && !item.isAvailable) ||
                  item.hasActiveBookings ||
                  item.hasPendingSale
                }
              />
              {item.status !== "approved" && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max z-10">
                  {t("equipmentMustBeApproved")}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                </div>
              )}
              {item.status === "approved" &&
                (item.hasActiveBookings || item.hasPendingSale) && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max z-10">
                    {t("cannotEditActiveBooking")}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
              {item.status === "approved" &&
                item.listingType === "forSale" &&
                !item.isAvailable && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max z-10">
                    {t("equipmentSold")}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="flex items-center justify-end gap-2 min-h-[40px] w-[88px] mx-auto">
            {!isSupplier &&
              item.status === "approved" &&
              !item.hasActiveBookings &&
              !item.hasPendingSale &&
              !(item.listingType === "forSale" && !item.isAvailable) && (
                <div ref={editTooltip.ref} className="relative group">
                  <button
                    onClick={() => {
                      onNavigate
                        ? onNavigate(
                            `/dashboard/equipment/edit/${item._id?.toString()}`,
                            `edit-${item._id?.toString()}`
                          )
                        : router.push(
                            `/dashboard/equipment/edit/${item._id?.toString()}`
                          )
                    }}
                    disabled={navigating === `edit-${item._id?.toString()}`}
                    className="p-2 font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    title={t("editEquipment")}
                  >
                    {navigating === `edit-${item._id?.toString()}` ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Edit className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            {isSupplier &&
              (item.status === "rejected" ||
                (item.status === "approved" &&
                  !item.hasActiveBookings &&
                  !item.hasPendingSale &&
                  !(item.listingType === "forSale" && !item.isAvailable))) && (
                <div className="relative group">
                  <button
                    onClick={() => {
                      onNavigate
                        ? onNavigate(
                            `/dashboard/equipment/edit/${item._id?.toString()}`,
                            `edit-${item._id?.toString()}`
                          )
                        : router.push(
                            `/dashboard/equipment/edit/${item._id?.toString()}`
                          )
                    }}
                    disabled={navigating === `edit-${item._id?.toString()}`}
                    className="p-2 font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                    title={t("editEquipment")}
                  >
                    {navigating === `edit-${item._id?.toString()}` ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Edit className="w-5 h-5" />
                    )}
                  </button>
                </div>
              )}
            <button
              onClick={() =>
                onNavigate
                  ? onNavigate(
                      `/equipment/${item._id?.toString()}?admin=true`,
                      item._id?.toString() || ""
                    )
                  : router.push(`/equipment/${item._id?.toString()}?admin=true`)
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
    </>
  )
}
