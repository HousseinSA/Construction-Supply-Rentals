import { useRouter } from "@/src/i18n/navigation"
import { Loader2, AlertCircle, Tag } from "lucide-react"
import Image from "next/image"
import { getOptimizedCloudinaryUrl } from "@/src/lib/cloudinary-url"
import TooltipWrapper from "@/src/components/ui/TooltipWrapper"
import { memo, useMemo, useCallback } from "react"

interface EquipmentImageCellProps {
  images: string[]
  name: string
  referenceNumber?: string
  status: string
  rejectionReason?: string
  createdBy: string
  listingType: string
  isAvailable: boolean
  equipmentId: string
  navigating?: string | null
  onNavigate?: (url: string, id: string) => void
  t: (key: string) => string
}

function EquipmentImageCell({
  images,
  name,
  referenceNumber,
  status,
  rejectionReason,
  createdBy,
  listingType,
  isAvailable,
  equipmentId,
  navigating,
  onNavigate,
  t,
}: EquipmentImageCellProps) {
  const router = useRouter()
  
  const imageSrc = useMemo(() => {
    const firstImage = images[0]
    return firstImage
      ? getOptimizedCloudinaryUrl(firstImage, {
          width: 200,
          height: 160,
          quality: "auto:good",
          format: "auto",
          crop: "fill",
        })
      : "/equipement-images/default-fallback-image.png"
  }, [images])

  const handleImageClick = useCallback(() => {
    if (onNavigate) {
      onNavigate(`/equipment/${equipmentId}?admin=true`, equipmentId)
    } else {
      router.push(`/equipment/${equipmentId}?admin=true`)
    }
  }, [onNavigate, equipmentId, router])

  return (
    <td className="px-6 py-4 sticky left-0 z-10 bg-white">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Image
            src={imageSrc}
            alt={name}
            width={144}
            height={112}
            sizes="144px"
            className="w-36 h-28 object-cover rounded-lg shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleImageClick}
            loading="lazy"
          />
          {navigating === equipmentId && (
            <div className="absolute inset-0 bg-black/25 rounded-lg flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            </div>
          )}
        </div>
        <div className="space-y-1">
          {referenceNumber && (
            <div className="text-xs font-semibold text-primary">
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
            {listingType === "forSale" && !isAvailable && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded bg-red-600 w-fit">
                <Tag className="w-3 h-3" />
                {t("sold")}
              </span>
            )}
            {listingType === "forSale" && isAvailable && (
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
