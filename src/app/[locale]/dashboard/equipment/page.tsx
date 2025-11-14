import { setRequestLocale } from "next-intl/server"
import ManageEquipmentClient from "@/src/components/dashboard/ManageEquipmentClient"

export default async function ManageEquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ManageEquipmentClient />
}
