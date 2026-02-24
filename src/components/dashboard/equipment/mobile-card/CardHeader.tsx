import { AlertCircle, MapPin, Tag } from "lucide-react"

interface CardHeaderProps {
  referenceNumber?: string
  name: string
  status: string
  rejectionReason?: string
  createdBy: string
  listingType: string
  isAvailable: boolean
  location: string
  createdAt: Date
  isSupplier: boolean
  updating: string | null
  itemId: string
  onStatusChange: (id: string, action: "approve" | "reject") => void
  convertToLocalized: (city: string) => string
  t: (key: string) => string
}

export default function CardHeader({
  referenceNumber, name, status, rejectionReason, createdBy, listingType,
  isAvailable, location, createdAt, isSupplier, updating, itemId,
  onStatusChange, convertToLocalized, t
}: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1">
        {referenceNumber && <div className="text-sm font-semibold text-primary mb-1">#{referenceNumber}</div>}
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm">{name}</span>
          {status === "rejected" && rejectionReason && (
            <div className="relative group inline-block">
              <span className="inline-flex items-center text-red-600 cursor-help">
                <AlertCircle className="w-3.5 h-3.5" />
              </span>
              <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max max-w-xs z-50 whitespace-normal">
                {rejectionReason}
                <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1.5 mb-1">
          {createdBy === "admin" && <span className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">{t("createdByAdmin")}</span>}
          {listingType === "forSale" && !isAvailable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-red-600">
              <Tag className="w-3.5 h-3.5" />{t("sold")}
            </span>
          )}
          {listingType === "forSale" && isAvailable && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-gradient-to-r from-orange-500 to-red-500">
              <Tag className="w-3.5 h-3.5" />{t("forSale")}
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-gray-600 bg-gray-100 rounded">
            <MapPin className="w-3.5 h-3.5 text-primary" />{convertToLocalized(location)}
          </span>
        </div>
      </div>
      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
        {status === "pending" && !isSupplier ? (
          <>
            <button onClick={() => onStatusChange(itemId, "approve")} disabled={updating === itemId}
              className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 min-w-[70px]">
              {t("approve")}
            </button>
            <button onClick={() => onStatusChange(itemId, "reject")} disabled={updating === itemId}
              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 min-w-[70px]">
              {t("reject")}
            </button>
          </>
        ) : status === "rejected" && isSupplier ? (
          <div className="relative group">
            <span className="inline-block px-3 py-1.5 text-xs font-semibold rounded-md bg-red-100 text-red-700 cursor-help">{t("rejected")}</span>
            <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none min-w-max z-50 whitespace-nowrap">
              {t("editBeforeResubmit")}
              <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900"></div>
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
