import { setRequestLocale } from "next-intl/server"
import BookingTable from "@/src/components/dashboard/bookings/BookingTable"

export default async function BookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <BookingTable />
}
