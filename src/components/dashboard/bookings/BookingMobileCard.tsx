import { Coins } from "lucide-react"
import { formatBookingId } from "@/src/lib/format"
import { calculateBookingCommission } from "@/src/lib/commission"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

interface BookingMobileCardProps {
  booking: BookingWithDetails
  onViewDetails: (booking: BookingWithDetails) => void
  t: (key: string) => string
}

export default function BookingMobileCard({ booking, onViewDetails, t }: BookingMobileCardProps) {
  const commission = calculateBookingCommission(booking.bookingItems)
  const equipmentTitle = `${booking.bookingItems[0]?.equipmentName}${
    booking.bookingItems.length > 1 ? ` +${booking.bookingItems.length - 1}` : ""
  }`
  const renterName = `${booking.renterInfo[0]?.firstName} ${booking.renterInfo[0]?.lastName}`

  return (
    <GenericMobileCard
      id={formatBookingId(booking._id)}
      title={equipmentTitle}
      subtitle={renterName}
      date={new Date(booking.createdAt).toLocaleDateString()}
      status={booking.status}
      fields={[
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
  )
}
