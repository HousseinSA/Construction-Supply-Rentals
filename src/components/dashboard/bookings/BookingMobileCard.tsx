import { Eye, Coins } from "lucide-react"
import { formatBookingId } from "@/src/lib/format"
import { calculateBookingCommission } from "@/src/lib/commission"
import BookingStatusBadge from "./BookingStatusBadge"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

interface BookingMobileCardProps {
  booking: BookingWithDetails
  onViewDetails: (booking: BookingWithDetails) => void
  t: (key: string) => string
}

export default function BookingMobileCard({ booking, onViewDetails, t }: BookingMobileCardProps) {
  const commission = calculateBookingCommission(booking.bookingItems)

  return (
    <div className="p-4 space-y-3 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-semibold text-gray-900 text-base">{formatBookingId(booking._id)}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {new Date(booking.createdAt).toLocaleDateString()}
          </div>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <div>
        <div className="text-sm font-medium text-gray-900 mb-1">
          {booking.bookingItems[0]?.equipmentName}
          {booking.bookingItems.length > 1 && (
            <span className="text-gray-500"> +{booking.bookingItems.length - 1}</span>
          )}
        </div>
        <div className="text-sm text-gray-600">
          {booking.renterInfo[0]?.firstName} {booking.renterInfo[0]?.lastName}
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div>
            <div className="text-xs text-gray-500">{t("table.total")}</div>
            <div className="font-semibold text-gray-900" dir="ltr">{booking.totalPrice.toLocaleString()} MRU</div>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-green-600" />
            <div>
              <div className="text-xs text-gray-500">{t("table.commission")}</div>
              <div className="font-semibold text-green-600" dir="ltr">{commission.toLocaleString()} MRU</div>
            </div>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(booking)}
          className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm flex items-center gap-1.5 flex-shrink-0"
        >
          <Eye className="w-4 h-4" />
          {t("actions.view")}
        </button>
      </div>
    </div>
  )
}
