import { useTranslations } from "next-intl"
import { useRouter } from "@/src/i18n/navigation"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { MapPin, Edit, Eye, Tag, Loader2 } from "lucide-react"
import Image from "next/image"
import Dropdown from "../../ui/Dropdown"
import { Equipment } from "@/src/lib/models/equipment"
import { User } from "@/src/lib/models/user"
import CopyButton from "../../ui/CopyButton"
import { formatPhoneNumber } from "@/src/lib/format"

interface EquipmentWithSupplier extends Equipment {
  supplier?: User
}

interface EquipmentTableRowProps {
  item: EquipmentWithSupplier
  updating: string | null
  navigating?: string | null
  onStatusChange: (id: string, action: "approve" | "reject") => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate?: (url: string, id: string) => void
}

export default function EquipmentTableRow({
  item,
  updating,
  navigating,
  onStatusChange,
  onAvailabilityChange,
  onNavigate,
}: EquipmentTableRowProps) {
  const t = useTranslations("dashboard.equipment")
  const router = useRouter()
  const { getPriceData, formatPrice } = usePriceFormatter()

  const priceData = getPriceData(item.pricing, item.listingType === "forSale")
  const { displayPrice, displayUnit } = formatPrice(
    priceData.rate,
    priceData.unit
  )
  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Image
              src={
                item.images[0] || "/equipement-images/default-fallback-image.png"
              }
              alt={item.name}
              width={96}
              height={80}
              className="w-24 h-20 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() =>
                onNavigate ? onNavigate(`/equipment/${item._id?.toString()}?admin=true`, item._id?.toString() || "") : router.push(`/equipment/${item._id?.toString()}?admin=true`)
              }
            />
            {navigating === item._id?.toString() && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900 text-base mb-1">
              {item.name}
            </div>
            <div className="flex gap-2">
              {item.createdBy === "admin" && (
                <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                  {t("createdByAdmin")}
                </span>
              )}
              {item.listingType === "forSale" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded bg-gradient-to-r from-orange-500 to-red-500">
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
          <span className="text-sm font-medium text-gray-700 capitalize">
            {item.location}
          </span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="text-sm font-semibold text-gray-900">
          <span dir="ltr">{displayPrice}</span>
          {displayUnit && ` ${displayUnit}`}
        </span>
      </td>
      <td className="px-6 py-4">
        {item.supplier ? (
          <div className="space-y-1.5">
            <div className="font-medium text-gray-900 text-sm">
              {item.supplier.firstName} {item.supplier.lastName}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700" dir="ltr">{formatPhoneNumber(item.supplier.phone)}</span>
              <CopyButton text={item.supplier.phone} size="sm" />
            </div>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">-</span>
        )}
      </td>
      <td className="px-6 py-4 text-center">
        <span className="text-sm text-gray-600">
          {new Date(item.createdAt).toLocaleDateString()}
        </span>
      </td>
      <td className="px-6 py-4 text-center">
        {item.status === "pending" ? (
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
        ) : (
          <span
            className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md ${
              item.status === "approved"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {t(item.status)}
          </span>
        )}
      </td>
      <td className="px-6 py-4">
        <div className="flex justify-center">
          <div className="w-40">
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
              compact
            />
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-2">
          {item.createdBy === "admin" && (
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
  )
}
