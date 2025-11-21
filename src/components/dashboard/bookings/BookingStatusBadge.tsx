import { useBookingStatus } from "@/src/hooks/useBookingStatus"

interface BookingStatusBadgeProps {
  status: string
}

export default function BookingStatusBadge({ status }: BookingStatusBadgeProps) {
  const { getStatusConfig } = useBookingStatus()
  const config = getStatusConfig(status)
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
      <Icon className="w-3 h-3" />
      {config.text}
    </span>
  )
}
