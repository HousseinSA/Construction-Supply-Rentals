import EquipmentClient from "@/src/components/equipment/EquipmentClient"

interface EquipmentPageProps {
  searchParams: { city?: string }
}

export default function EquipmentPage({ searchParams }: EquipmentPageProps) {
  const selectedCity = searchParams.city || null
  
  return <EquipmentClient selectedCity={selectedCity} />
}
