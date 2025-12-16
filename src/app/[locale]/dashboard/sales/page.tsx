import { setRequestLocale } from "next-intl/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"
import { redirect } from "next/navigation"
import SalesTable from "@/src/components/dashboard/sales/SalesTable"

export default async function SalesPage({
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

  // Only admin and supplier can access dashboard sales
  if (session.user.role !== "admin" && session.user.userType !== "supplier") {
    redirect(`/${locale}/dashboard`)
  }

  return <SalesTable />
}
