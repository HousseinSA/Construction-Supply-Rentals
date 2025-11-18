import { setRequestLocale } from "next-intl/server"
import AnalyticsPageClient from "./AnalyticsPageClient"

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <AnalyticsPageClient />
}
