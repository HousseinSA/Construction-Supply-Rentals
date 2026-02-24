import { Edit, Eye, Loader2 } from "lucide-react"

interface CardActionsProps {
  itemId: string
  status: string
  listingType: string
  isAvailable: boolean
  hasActiveBookings: boolean
  createdBy: string
  isSupplier: boolean
  navigating: string | null
  onNavigate: (url: string, id: string) => void
  t: (key: string) => string
}

export default function CardActions({
  itemId, status, listingType, isAvailable, hasActiveBookings, createdBy,
  isSupplier, navigating, onNavigate, t
}: CardActionsProps) {
  const canEdit = !isSupplier && createdBy === "admin" && !(listingType === "forSale" && !isAvailable)
  const canEditSupplier = isSupplier && (status === "rejected" || (status === "approved" && !hasActiveBookings)) && !(listingType === "forSale" && !isAvailable)

  return (
    <div className="flex gap-2">
      {canEdit && (
        <div className="relative group">
          <button
            onClick={() => !hasActiveBookings && onNavigate(`/dashboard/equipment/edit/${itemId}`, `edit-${itemId}`)}
            disabled={navigating === `edit-${itemId}` || hasActiveBookings}
            className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 ${
              hasActiveBookings ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "text-blue-600 bg-blue-50 hover:bg-blue-100"
            }`}
          >
            {navigating === `edit-${itemId}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
          </button>
          {hasActiveBookings && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {t("cannotEditActiveBooking")}
              <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
            </div>
          )}
        </div>
      )}
      {canEditSupplier && (
        <button
          onClick={() => onNavigate(`/dashboard/equipment/edit/${itemId}`, `edit-${itemId}`)}
          disabled={navigating === `edit-${itemId}`}
          className="px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100"
        >
          {navigating === `edit-${itemId}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
        </button>
      )}
      <button
        onClick={() => onNavigate(`/equipment/${itemId}?admin=true`, itemId)}
        disabled={navigating === itemId}
        className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center justify-center gap-1.5"
      >
        <Eye className="w-4 h-4" />
        {t("viewDetails")}
      </button>
    </div>
  )
}
