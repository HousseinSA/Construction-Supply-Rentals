import { setRequestLocale } from "next-intl/server"
import SettingsPageClient from "./SettingsPageClient"

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <SettingsPageClient />
}
