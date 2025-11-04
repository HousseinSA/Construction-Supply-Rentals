import { setRequestLocale } from "next-intl/server"
import Dashboard from "@/src/components/dashboard/Dashboard"

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <Dashboard />
}