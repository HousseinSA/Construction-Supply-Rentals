import { Coins } from "lucide-react"
import { useTranslations } from "next-intl"
import { formatBookingId } from "@/src/lib/format"
import { formatReferenceNumber } from "@/src/lib/format-reference"
import { formatPhoneNumber } from "@/src/lib/format"
import { calculateBookingCommission } from "@/src/lib/commission"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"
import CopyButton from "@/src/components/ui/CopyButton"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

interface BookingMobileCardProps {
  booking: BookingWithDetails
  onViewDetails: (booking: BookingWithDetails) => void
  t: (key: string) => string
  highlight?: boolean
}

export default function BookingMobileCard({ booking, onViewDetails, t, highlight = false }: BookingMobileCardProps) {
  const tCommon = useTranslations("common")
  const commission = calculateBookingCommission(booking.bookingItems)
  const equipmentTitle = `${booking.bookingItems[0]?.equipmentName}${
    booking.bookingItems.length > 1 ? ` +${booking.bookingItems.length - 1}` : ""
  }`
  const renterName = `${booking.renterInfo[0]?.firstName} ${booking.renterInfo[0]?.lastName}`
  const totalUsage = booking.bookingItems.reduce((sum, item) => sum + item.usage, 0)
  const usageUnit = booking.bookingItems[0]?.usageUnit || ""
  
  const getTranslatedUnit = (unit: string) => {
    const unitMap: Record<string, string> = {
      'hours': tCommon('hour'),
      'days': tCommon('day'),
      'months': tCommon('month'),
      'km': tCommon('km'),
      'tons': tCommon('ton')
    }
    return unitMap[unit] || unit
  }
  
  const supplierDisplay = booking.supplierInfo && booking.supplierInfo.length > 0 && !booking.hasAdminCreatedEquipment
    ? (
        <div className="space-y-1">
          <div className="text-sm">{booking.supplierInfo[0].firstName} {booking.supplierInfo[0].lastName}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm" dir="ltr">{formatPhoneNumber(booking.supplierInfo[0].phone)}</span>
            <CopyButton text={booking.supplierInfo[0].phone} size="sm" />
          </div>
        </div>
      )
    : t("admin")

  return (
    <div className={highlight ? "animate-pulse" : ""}>
      <GenericMobileCard
        id={formatReferenceNumber(booking.referenceNumber)}
        title={equipmentTitle}
        subtitle={renterName}
        date={new Date(booking.createdAt).toLocaleDateString()}
        status={booking.status}
        fields={[
          {
            label: t("table.usage"),
            value: `${totalUsage} ${getTranslatedUnit(usageUnit)}`,
          },
          {
            label: t("table.supplier"),
            value: supplierDisplay,
          },
          {
            label: t("table.total"),
            value: booking.totalPrice,
          },
          {
            label: t("table.commission"),
            value: booking.hasAdminCreatedEquipment ? t("adminOwned") : commission,
            icon: !booking.hasAdminCreatedEquipment ? <Coins className="w-3.5 h-3.5 text-green-600" /> : undefined,
            highlight: !booking.hasAdminCreatedEquipment,
          },
        ]}
        onViewDetails={() => onViewDetails(booking)}
        viewButtonText={t("actions.view")}
      />
    </div>
  )
}
