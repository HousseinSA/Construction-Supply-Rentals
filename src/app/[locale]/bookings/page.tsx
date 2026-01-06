import { setRequestLocale } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { redirect } from "next/navigation"
import RenterTransactionsView from "@/src/components/dashboard/bookings/RenterTransactionsView"
import DashboardPageHeader from "@/src/components/dashboard/DashboardPageHeader"
import { getTranslations } from "next-intl/server"

export default async function RenterBookingsPage({
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

  if (session.user.role === "admin") {
    redirect(`/${locale}/dashboard`)
  }

  const tCommon = await getTranslations("common")

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardPageHeader title={tCommon("myBookings")}  />
        <RenterTransactionsView />
      </div>
    </div>
  )
}
