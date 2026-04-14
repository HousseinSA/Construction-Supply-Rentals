import { AlertCircle, MapPin, Tag } from "lucide-react"
import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { useUserSession } from "@/src/hooks/useUserSession"
import { useCityData } from "@/src/hooks/useCityData"
import { useTranslations } from "next-intl"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import { useTooltip } from "@/src/hooks/useTooltip"

interface CardHeaderProps {
  item: EquipmentWithSupplier
  onStatusChange: (id: string, action: "approve" | "reject") => void
}

export default function CardHeader({ item, onStatusChange }: CardHeaderProps) {
  const { user } = useUserSession()
  const isSupplier = user?.isSupplier ?? false
  const { updating } = useEquipmentStore()
  const { convertToLocalized } = useCityData()
  const t = useTranslations("dashboard.equipment")
  const { ref: rejectedTooltipRef, isOpen: showRejectedTooltip, toggle: toggleRejectedTooltip } = useTooltip()
  const { ref: reasonTooltipRef, isOpen: showReasonTooltip, toggle: toggleReasonTooltip } = useTooltip()
  
  const {
    referenceNumber,
    name,
    status,
    rejectionReason,
    createdBy,
    listingType,
    isSold,
    location,
    createdAt,
    _id
  } = item
  const itemId = _id?.toString() || ""

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        {referenceNumber && <div className="text-sm font-semibold text-primary mb-1">#{referenceNumber}</div>}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">{name}</span>
          {status === "rejected" && rejectionReason && (
            <div ref={reasonTooltipRef} className="relative inline-block">
              <span onClick={toggleReasonTooltip} className="inline-flex items-center text-red-600 cursor-pointer">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
              <div onClick={toggleReasonTooltip} className={`absolute bottom-full  mb-2 px-3 py-2 bg-gray-700 text-white text-xs rounded-lg min-w-[150px] max-w-[calc(100vw-2rem)] break-words transition-opacity pointer-events-auto z-50 cursor-pointer ${showReasonTooltip ? 'opacity-100' : 'opacity-0'}`}>
                {rejectionReason}
                <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-700"></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {createdBy === "admin" && <span className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">{t("createdByAdmin")}</span>}
          {listingType === "forSale" && isSold && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-red-600">
              <Tag className="w-3.5 h-3.5" />{t("sold")}
            </span>
          )}
          {listingType === "forSale" && !isSold && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-gradient-to-r from-orange-500 to-red-500">
              <Tag className="w-3.5 h-3.5" />{t("forSale")}
            </span>
          )}
          <span className="inline-flex items-center gap-1 capitalize px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded">
            <MapPin className="w-3.5 h-3.5 text-primary" />{convertToLocalized(location)}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        {status === "pending" && !isSupplier ? (
          <>
            <button onClick={() => onStatusChange(itemId, "approve")} disabled={updating === itemId}
              className="w-24 px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600">
              {t("approve")}
            </button>
            <button onClick={() => onStatusChange(itemId, "reject")} disabled={updating === itemId}
              className="w-24 px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600">
              {t("reject")}
            </button>
          </>
        ) : status === "rejected" && isSupplier ? (
          <div ref={rejectedTooltipRef} className="relative">
            <span onClick={toggleRejectedTooltip} className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-red-100 text-red-700 cursor-pointer">{t("rejected")}</span>
            <div onClick={toggleRejectedTooltip} className={`absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-700 text-white text-xs rounded-lg max-w-[calc(100vw-2rem)] text-center break-words transition-opacity pointer-events-auto z-50 cursor-pointer ${showRejectedTooltip ? 'opacity-100' : 'opacity-0'}`}>
              {t("editBeforeResubmit")}
              <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-700"></div>
            </div>
          </div>
          
        ) : (
          <span className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md ${
            status === "approved" ? "bg-green-100 text-green-700" :
            status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
          }`}>
            {isSupplier && status === "pending" ? t("pendingVerification") : t(status)}
          </span>
        )}
        <div className="text-xs text-gray-500" dir="ltr">
          {new Date(createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </div>
      </div>
    </div>
  )
}
