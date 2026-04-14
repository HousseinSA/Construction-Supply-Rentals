import { useRouter } from "@/src/i18n/navigation"
import { Loader2, AlertCircle, Tag } from "lucide-react"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import TooltipWrapper from "@/src/components/ui/TooltipWrapper"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { useTranslations } from "next-intl"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { memo, useCallback } from "react"

interface EquipmentImageCellProps {
  item: EquipmentWithSupplier
}

function EquipmentImageCell({ item }: EquipmentImageCellProps) {
  const router = useRouter()
  const { navigating, navigateToEquipment } = useEquipmentStore()
  const t = useTranslations("dashboard.equipment")

  const equipmentId = item._id?.toString() || ""
  const {
    images,
    name,
    referenceNumber,
    status,
    rejectionReason,
    createdBy,
    listingType,
    isSold
  } = item

  const handleImageClick = useCallback(() => {
    navigateToEquipment(`/equipment/${equipmentId}?admin=true`, equipmentId, router)
  }, [navigateToEquipment, equipmentId, router])

  return (
    <td className="px-6 py-4 sticky left-0 z-10 bg-white">
      <div className="flex items-center gap-4">
        <div className="relative w-44 h-32">
          <EquipmentImage
            src={images?.[0] || "/equipment-images/default-fallback-image.png"}
            alt={name}
            size="custom"
            width={200}
            height={160}
            cover
            onClick={handleImageClick}
          />
          {navigating === equipmentId && (
            <div className="absolute inset-0 bg-black/25 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          {referenceNumber && (
            <div className="text-sm font-semibold text-primary">
              #{referenceNumber}
            </div>
          )}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">{name}</span>
            {status === "rejected" && rejectionReason && (
              <TooltipWrapper content={rejectionReason}>
                <span className="text-red-600 cursor-help">
                  <AlertCircle className="w-3.5 h-3.5" />
                </span>
              </TooltipWrapper>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {createdBy === "admin" && (
              <span className="inline-block px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded w-fit">
                {t("createdByAdmin")}
              </span>
            )}
            {listingType === "forSale" && isSold && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded bg-red-600 w-fit">
                <Tag className="w-3 h-3" />
                {t("sold")}
              </span>
            )}
            {listingType === "forSale" && !isSold && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded bg-gradient-to-r from-orange-500 to-red-500 w-fit">
                <Tag className="w-3 h-3" />
                {t("forSale")}
              </span>
            )}
          </div>
        </div>
      </div>
    </td>
  )
}

export default memo(EquipmentImageCell)
