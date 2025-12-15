import { MapPin, Edit, Eye, Tag, Loader2 } from "lucide-react"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import Dropdown from "@/src/components/ui/Dropdown"
import { EquipmentWithSupplier } from "@/src/stores/equipmentStore"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useCityData } from "@/src/hooks/useCityData"
import { useTranslations } from "next-intl"

interface EquipmentMobileCardProps {
  item: EquipmentWithSupplier
  updating: string | null
  navigating: string | null
  displayPrice: string
  displayUnit: string
  onStatusChange: (id: string, action: "approve" | "reject") => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate: (url: string, id: string) => void
  t: any
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
  t,
}: EquipmentMobileCardProps) {
  const { formatPrice } = usePriceFormatter()
  const { convertToLocalized } = useCityData()
  const tCommon = useTranslations("common")
  
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
    return prices
  }

  const supplierName = item.createdBy === "admin" 
    ? tCommon("admin")
    : item.supplier 
    ? `${item.supplier.firstName} ${item.supplier.lastName}`
    : "-"

  return (
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
            {item.listingType === "forSale" && (
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
          <span
            className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
              item.status === "approved"
                ? "bg-green-100 text-green-700"
                : item.status === "pending"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {t(item.status)}
          </span>
          <div className="text-xs text-gray-500 mt-1">
            {new Date(item.createdAt).toLocaleDateString()}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-200">
         
          <div className="relative">
            <EquipmentImage
              src={item.images[0] || "/equipement-images/default-fallback-image.png"}
              alt={item.name}
              size="lg"
              className="!w-full !h-28"
              onClick={() =>
                onNavigate(
                  `/equipment/${item._id?.toString()}?admin=true`,
                  item._id?.toString() || ""
                )
              }
            />
            {navigating === item._id?.toString() && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
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
          <div>
            <div className="text-xs text-gray-500 mb-1">{t("supplierInfo")}</div>
            <div className="font-semibold text-sm text-gray-900">
              {supplierName}
            </div>
          </div>
        </div>
      </div>

      {item.status === "pending" && (
        <div className="flex gap-2">
          <button
            onClick={() => onStatusChange(item._id?.toString() || "", "approve")}
            disabled={updating === item._id?.toString()}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            {t("approve")}
          </button>
          <button
            onClick={() => onStatusChange(item._id?.toString() || "", "reject")}
            disabled={updating === item._id?.toString()}
            className="flex-1 px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            {t("reject")}
          </button>
        </div>
      )}

      {!(item.listingType === "forSale" && !item.isAvailable) && (
        <div className="w-full">
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
            disabled={updating === item._id?.toString()}
          />
        </div>
      )}
      <div className="flex items-stretch gap-2">
        {item.createdBy === "admin" && (
          <button
            onClick={() =>
              onNavigate(
                `/dashboard/equipment/edit/${item._id?.toString()}`,
                `edit-${item._id?.toString()}`
              )
            }
            disabled={navigating === `edit-${item._id?.toString()}`}
            className="px-3 py-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 text-sm font-medium flex items-center justify-center gap-1.5"
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
  )
}
