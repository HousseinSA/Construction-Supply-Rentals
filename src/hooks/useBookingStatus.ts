import { useTranslations } from "next-intl"
import { Clock, CheckCircle, XCircle } from "lucide-react"

export function useBookingStatus() {
  const t = useTranslations("dashboard.bookings")

  const getStatusConfig = (status: string) => {
    const statusConfig = {
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        text: t("status.pending"),
      },
      paid: {
        color: "bg-blue-100 text-blue-800",
        icon: CheckCircle,
        text: t("status.paid"),
      },
      completed: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        text: t("status.completed"),
      },
      cancelled: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: t("status.cancelled"),
      },
    }
    return statusConfig[status as keyof typeof statusConfig]
  }

  return { getStatusConfig }
}
