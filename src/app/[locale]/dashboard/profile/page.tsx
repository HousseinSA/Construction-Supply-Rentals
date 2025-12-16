import { setRequestLocale } from "next-intl/server"
import ProfilePageClient from "./ProfilePageClient"

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ProfilePageClient />
}
