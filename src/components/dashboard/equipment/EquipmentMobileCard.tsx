import { MapPin, Edit, Eye, Tag, Loader2 } from "lucide-react"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import Dropdown from "@/src/components/ui/Dropdown"
import { EquipmentWithSupplier } from "@/src/stores/equipmentStore"

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
  return (
    <div className="p-4 hover:bg-gray-50">
      <div className="flex gap-3 mb-3">
        <div className="relative">
          <EquipmentImage
            src={item.images[0] || "/equipement-images/default-fallback-image.png"}
            alt={item.name}
            size="lg"
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
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
          <div className="flex gap-2 mb-1">
            {item.createdBy === "admin" && (
              <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                {t("createdByAdmin")}
              </span>
            )}
            {item.listingType === "forSale" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-gradient-to-r from-orange-500 to-red-500">
                <Tag className="w-3 h-3" />
                {t("forSale")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
            <span className="capitalize">{item.location}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {displayPrice}
            {displayUnit ? ` ${displayUnit}` : ""}
          </p>
        </div>
      </div>

      {item.supplier && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-bold text-gray-800 mb-2">
            {t("supplierInfo")}
          </p>
          <div className="space-y-1">
            <p className="text-base font-semibold text-gray-900">
              {item.supplier.firstName} {item.supplier.lastName}
            </p>
            <p className="text-sm text-gray-700">{item.supplier.phone}</p>
            {item.supplier.companyName && (
              <p className="text-sm font-medium text-gray-800">
                {item.supplier.companyName}
              </p>
            )}
            {item.supplier.location && (
              <p className="text-sm text-gray-600">{item.supplier.location}</p>
            )}
          </div>
        </div>
      )}

      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">
          {t("status")}:
        </p>
        {item.status === "pending" ? (
          <div className="flex gap-2">
            <button
              onClick={() => onStatusChange(item._id?.toString() || "", "approve")}
              disabled={updating === item._id?.toString()}
              className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 flex-1"
            >
              {t("approve")}
            </button>
            <button
              onClick={() => onStatusChange(item._id?.toString() || "", "reject")}
              disabled={updating === item._id?.toString()}
              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 flex-1"
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
      </div>

      <div className="mb-3">
        <p className="text-xs font-semibold text-gray-600 mb-2">
          {t("availability")}:
        </p>
        {item.listingType === "forSale" ? (
          <div className={`px-3 py-2 text-sm font-semibold rounded-lg text-center ${
            item.isAvailable 
              ? "text-green-600 bg-green-50" 
              : "text-red-600 bg-red-50"
          }`}>
            {item.isAvailable ? t("available") : t("sold")}
          </div>
        ) : (
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
        )}
      </div>

      <div className="flex gap-2">
        {item.createdBy === "admin" && (
          <button
            onClick={() =>
              onNavigate(
                `/dashboard/equipment/edit/${item._id?.toString()}`,
                `edit-${item._id?.toString()}`
              )
            }
            disabled={navigating === `edit-${item._id?.toString()}`}
            className="flex-1 p-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm disabled:opacity-50"
          >
            {navigating === `edit-${item._id?.toString()}` ? (
              <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
            ) : (
              <Edit className="w-4 h-4 inline mr-1" />
            )}
            {t("editEquipment")}
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
          className="flex-1 p-2 text-gray-600 bg-gray-100 rounded-lg font-medium text-sm disabled:opacity-50"
        >
          {navigating === item._id?.toString() ? (
            <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
          ) : (
            <Eye className="w-4 h-4 inline mr-1" />
          )}
          {t("viewDetails")}
        </button>
      </div>
    </div>
  )
}
