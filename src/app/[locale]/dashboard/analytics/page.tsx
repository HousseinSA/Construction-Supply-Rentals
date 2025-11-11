import { setRequestLocale } from "next-intl/server"
import DashboardPageHeader from "@/src/components/dashboard/DashboardPageHeader"

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <DashboardPageHeader pageKey="analytics" />
}
