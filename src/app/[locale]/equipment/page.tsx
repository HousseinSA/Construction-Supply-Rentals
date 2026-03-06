import EquipmentClient from "@/src/components/equipment/EquipmentClient"

interface EquipmentPageProps {
  searchParams: Promise<{ city?: string; type?: string; listingType?: string }>
}

export default async function EquipmentPage({ searchParams }: EquipmentPageProps) {
  const params = await searchParams
  const selectedCity = params.city || null
  const selectedType = params.type || null
  const listingType = params.listingType || null
  
  return <EquipmentClient selectedCity={selectedCity} selectedType={selectedType} listingType={listingType} />
}
