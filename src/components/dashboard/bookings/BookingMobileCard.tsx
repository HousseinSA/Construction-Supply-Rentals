import { Coins } from "lucide-react"
import { useTranslations } from "next-intl"
import { formatDate, getTranslatedUnit } from "@/src/lib/table-utils"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"
import ReferenceNumber from "@/src/components/ui/ReferenceNumber"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

interface BookingMobileCardProps {
  booking: BookingWithDetails
  onViewDetails: (booking: BookingWithDetails) => void
  t: (key: string) => string
  highlight?: boolean
  isAdminView?: boolean
}

export default function BookingMobileCard({ booking, onViewDetails, t, highlight = true, isAdminView = true }: BookingMobileCardProps) {
  const tCommon = useTranslations("common")
  const commission = booking.totalCommission || booking.bookingItems[0]?.commission || 0
  const equipmentTitle = `${booking.bookingItems[0]?.equipmentName}${
    booking.bookingItems.length > 1 ? ` +${booking.bookingItems.length - 1}` : ""
  }`
  const renterName = booking.renterInfo && booking.renterInfo.length > 0
    ? `${booking.renterInfo[0]?.firstName} ${booking.renterInfo[0]?.lastName}`
    : "Unknown"
  const renterPhone = booking.renterInfo && booking.renterInfo.length > 0
    ? booking.renterInfo[0]?.phone
    : undefined
  const totalUsage = booking.bookingItems.reduce((sum, item) => sum + item.usage, 0)
  const usageUnit = booking.bookingItems[0]?.usageUnit || ""
  
  const supplierName = booking.supplierInfo && booking.supplierInfo.length > 0
    ? `${booking.supplierInfo[0].firstName} ${booking.supplierInfo[0].lastName}`
    : t("admin")
  const supplierPhone = booking.supplierInfo && booking.supplierInfo.length > 0
    ? booking.supplierInfo[0]?.phone
    : undefined

  const getRentalPeriod = () => {
    if (booking.startDate && booking.endDate) {
      return `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`
    } else if (booking.startDate) {
      return formatDate(booking.startDate)
    }
    return '-'
  }
  return (
    <div className={highlight ? "animate-pulse" : ""}>
      <GenericMobileCard
        id={
            <ReferenceNumber referenceNumber={booking.referenceNumber} size="md" />
        }
        title={equipmentTitle}
        subtitle={renterName}
        phoneNumber={renterPhone}
        supplierNumber={supplierPhone}
        supplierName={supplierName}
        date={formatDate(booking.createdAt)}
        status={booking.status}
        isAdminView={isAdminView}
        fields={[
          {
            label: t("table.usage"),
            value: `${totalUsage} ${getTranslatedUnit(usageUnit, tCommon)}`,
          },
          {
            label: t("table.total"),
            value: <PriceDisplay amount={booking.totalPrice} />,
          },
          {
            label: t("table.rentalPeriod"),
            value: getRentalPeriod(),
            valueClassName: "text-xs font-medium text-gray-700"  
          },
          {
            label: t("table.supplier"),
            value: supplierName,
            secondaryValue: supplierPhone && supplierName !== t("admin") ? supplierPhone : undefined,
          },
          {
            label: t("table.commission"),
            value: <PriceDisplay amount={commission} variant="commission" />,
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
