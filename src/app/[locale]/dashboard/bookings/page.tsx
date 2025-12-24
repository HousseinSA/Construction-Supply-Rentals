import { setRequestLocale } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { redirect } from "next/navigation"
import BookingTable from "@/src/components/dashboard/bookings/BookingTable"

export default async function BookingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect(`/${locale}/auth/login`)
  }

  if (session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`)
  }

  return <BookingTable />
}
