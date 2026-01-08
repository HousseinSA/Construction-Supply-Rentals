import { Eye } from "lucide-react"
import { formatPhoneNumber } from "@/src/lib/format"
import { formatDate, getTranslatedUnit } from "@/src/lib/table-utils"
import CopyButton from "@/src/components/ui/CopyButton"
import ReferenceNumber from "@/src/components/ui/ReferenceNumber"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import BookingStatusBadge from "./BookingStatusBadge"
import { TableRow, TableCell } from "@/src/components/ui/Table"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

interface BookingTableRowProps {
  booking: BookingWithDetails
  onViewDetails: (booking: BookingWithDetails) => void
  t: (key: string) => string
  highlight?: boolean
}

export default function BookingTableRow({
  booking,
  onViewDetails,
  t,
  highlight = false,
}: BookingTableRowProps) {
  console.group(booking.bookingItems)
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const isArabic = locale === 'ar'
  const commission = booking.totalCommission || booking.bookingItems[0]?.commission || 0
  const totalUsage = booking.bookingItems.reduce(
    (sum, item) => sum + item.usage,
    0
  )
  const usageUnit = booking.bookingItems[0]?.usageUnit || "hours"
  const getRentalPeriod = () => {
    if (booking.startDate && booking.endDate) {
      return `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`
    } else if (booking.startDate) {
      return formatDate(booking.startDate)
    }
    return '-'
  }

  const getUsageDisplay = () => {
    const unit = getTranslatedUnit(usageUnit, tCommon)
    return isArabic ? `${totalUsage} ${unit}` : `${totalUsage} ${unit}`
  }

  return (
    <TableRow className={highlight ? "animate-pulse bg-yellow-50" : ""}>
      <TableCell>
        <div className="space-y-0.5">
          <div className="font-semibold text-sm text-gray-900">
            {booking.bookingItems[0]?.equipmentName}
            {booking.bookingItems.length > 1 && (
              <span className="text-gray-600 text-xs">
                {" "}+{booking.bookingItems.length - 1} {t("more")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <ReferenceNumber referenceNumber={booking.referenceNumber} size="md" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <div className="font-medium text-gray-900 text-sm">
            {booking.renterInfo[0]?.firstName} {booking.renterInfo[0]?.lastName}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700" >
              {formatPhoneNumber(booking.renterInfo[0]?.phone)}
            </span>
            <CopyButton text={booking.renterInfo[0]?.phone} size="sm" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs font-medium text-gray-700" >
          {getRentalPeriod()}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm font-medium text-gray-700" >
          {getUsageDisplay()}
        </span>
      </TableCell>
      <TableCell>
        <PriceDisplay amount={booking.totalPrice} />
      </TableCell>
      <TableCell>
        <PriceDisplay amount={commission} variant="commission" />
      </TableCell>
      <TableCell>
        {booking.supplierInfo &&
        booking.supplierInfo.length > 0 &&
        !booking.hasAdminCreatedEquipment ? (
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-gray-900">
              {booking.supplierInfo[0]?.firstName}{" "}
              {booking.supplierInfo[0]?.lastName}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700" dir="ltr">
                {formatPhoneNumber(booking.supplierInfo[0]?.phone)}
              </span>
              <CopyButton text={booking.supplierInfo[0]?.phone} size="sm" />
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{t("admin")}</span>
        )}
      </TableCell>
      <TableCell align="center">
        <BookingStatusBadge status={booking.status} />
      </TableCell>
      <TableCell align="center">
        <span className="text-xs text-gray-600" dir="ltr">
          {formatDate(booking.createdAt)}
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
