import EquipmentClient from "@/src/components/equipment/EquipmentClient"

interface EquipmentPageProps {
  searchParams: { city?: string; type?: string }
}

export default function EquipmentPage({ searchParams }: EquipmentPageProps) {
  const selectedCity = searchParams.city || null
  const selectedType = searchParams.type || null
  
  return <EquipmentClient selectedCity={selectedCity} selectedType={selectedType} />
}
