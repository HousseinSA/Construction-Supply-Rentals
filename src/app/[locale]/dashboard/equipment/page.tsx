import { setRequestLocale } from "next-intl/server"
import ManageEquipment from "@/src/components/dashboard/equipment/ManageEquipment"

export default async function ManageEquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <ManageEquipment />
}
