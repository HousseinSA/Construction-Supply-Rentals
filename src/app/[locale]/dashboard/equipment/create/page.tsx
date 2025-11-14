import { setRequestLocale } from "next-intl/server"
import CreateEquipmentForm from "@/src/components/equipment/CreateEquipmentForm"

export default async function CreateEquipmentPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  return <CreateEquipmentForm />
}