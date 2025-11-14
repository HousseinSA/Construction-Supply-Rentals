import { setRequestLocale } from "next-intl/server"
import EditEquipmentForm from "@/src/components/equipment/EditEquipmentForm"

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)

  return <EditEquipmentForm equipmentId={id} />
}
