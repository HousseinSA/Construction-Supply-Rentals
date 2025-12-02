import { Eye } from "lucide-react"
import { formatBookingId, formatPhoneNumber } from "@/src/lib/format"
import { calculateBookingCommission } from "@/src/lib/commission"
import CopyButton from "@/src/components/ui/CopyButton"
import BookingStatusBadge from "./BookingStatusBadge"
import { TableRow, TableCell } from "@/src/components/ui/Table"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

interface BookingTableRowProps {
  booking: BookingWithDetails
  onViewDetails: (booking: BookingWithDetails) => void
  t: (key: string) => string
}

export default function BookingTableRow({ booking, onViewDetails, t }: BookingTableRowProps) {
  const commission = calculateBookingCommission(booking.bookingItems)
  const totalUsage = booking.bookingItems.reduce((sum, item) => sum + item.usage, 0)
  const usageUnit = booking.bookingItems[0]?.usageUnit || 'hours'

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1.5">
          <div className="font-medium text-gray-900 text-sm">
            {booking.renterInfo[0]?.firstName} {booking.renterInfo[0]?.lastName}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700" dir="ltr">
              {formatPhoneNumber(booking.renterInfo[0]?.phone)}
            </span>
            <CopyButton text={booking.renterInfo[0]?.phone} size="sm" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm font-medium text-gray-900">
          {booking.bookingItems[0]?.equipmentName}
          {booking.bookingItems.length > 1 && (
            <span className="text-gray-600">
              {" "}+{booking.bookingItems.length - 1} {t("more")}
            </span>
          )}
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium text-gray-700" dir="ltr">
          {totalUsage} {usageUnit}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm font-semibold text-gray-900" dir="ltr">
          {booking.totalPrice.toLocaleString()} MRU
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm font-semibold text-green-600" dir="ltr">
          {commission.toLocaleString()} MRU
        </span>
      </TableCell>
      <TableCell>
        {booking.supplierInfo && booking.supplierInfo.length > 0 ? (
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-gray-900">
              {booking.supplierInfo[0]?.firstName} {booking.supplierInfo[0]?.lastName}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700" dir="ltr">
                {formatPhoneNumber(booking.supplierInfo[0]?.phone)}
              </span>
              <CopyButton text={booking.supplierInfo[0]?.phone} size="sm" />
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Admin</span>
        )}
      </TableCell>
      <TableCell align="center"><BookingStatusBadge status={booking.status} /></TableCell>
      <TableCell align="center">
        <span className="text-sm text-gray-600">
          {new Date(booking.createdAt).toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell align="center">
        <button
          onClick={() => onViewDetails(booking)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={t("actions.view")}
        >
          <Eye className="w-5 h-5" />
        </button>
      </TableCell>
    </TableRow>
  )
}
