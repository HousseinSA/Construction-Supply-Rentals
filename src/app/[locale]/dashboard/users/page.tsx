import { setRequestLocale } from "next-intl/server"
import UsersPageClient from "./UsersPageClient"

export default async function UsersPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <UsersPageClient />
}
