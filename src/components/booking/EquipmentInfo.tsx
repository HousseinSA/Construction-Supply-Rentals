import { MapPin } from "lucide-react"
import { useCityData } from "@/src/hooks/useCityData"

interface EquipmentInfoProps {
  name: string
  location: string
}

export default function EquipmentInfo({ name, location }: EquipmentInfoProps) {
  const { convertToLocalized } = useCityData()
  
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium mb-2">{name}</h3>
      <div className="flex items-center gap-1 text-sm capitalize text-gray-600">
        <MapPin className="w-4 h-4 text-primary" />
        {convertToLocalized(location)}
      </div>
    </div>
  )
}
