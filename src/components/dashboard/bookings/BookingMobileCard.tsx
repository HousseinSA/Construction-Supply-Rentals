import { Coins } from "lucide-react"
import { useTranslations } from "next-intl"
import { formatDate, getTranslatedUnit } from "@/src/lib/table-utils"
import { calculateBookingCommission } from "@/src/lib/commission"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"
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
  const renterName = booking.renterInfo && booking.renterInfo.length > 0
    ? `${booking.renterInfo[0]?.firstName} ${booking.renterInfo[0]?.lastName}`
    : "Unknown"
  const totalUsage = booking.bookingItems.reduce((sum, item) => sum + item.usage, 0)
  const usageUnit = booking.bookingItems[0]?.usageUnit || ""
  
  const supplierName = booking.supplierInfo && booking.supplierInfo.length > 0
    ? `${booking.supplierInfo[0].firstName} ${booking.supplierInfo[0].lastName}`
    : t("admin")

  return (
    <div className={highlight ? "animate-pulse" : ""}>
      <GenericMobileCard
        id={`#${booking.referenceNumber || ""}`}
        title={equipmentTitle}
        subtitle={renterName}
        date={formatDate(booking.createdAt)}
        status={booking.status}
        fields={[
          {
            label: t("table.usage"),
            value: `${totalUsage} ${getTranslatedUnit(usageUnit, tCommon)}`,
          },
          {
            label: t("table.supplier"),
            value: supplierName,
          },
          {
            label: t("table.total"),
            value: booking.totalPrice,
          },
          {
            label: t("table.commission"),
            value: commission,
            icon: <Coins className="w-3.5 h-3.5 text-green-600" />,
            highlight: true,
          },
        ]}
        onViewDetails={() => onViewDetails(booking)}
        viewButtonText={t("actions.view")}
      />
    </div>
  )
}
