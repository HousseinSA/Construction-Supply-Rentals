import { MapPin } from "lucide-react"
import { useCityData } from "@/src/hooks/useCityData"

interface EquipmentInfoProps {
  name: string
  reference?: string
  location: string
}

export default function EquipmentInfo({ name, reference, location }: EquipmentInfoProps) {
  const { convertToLocalized } = useCityData()
  
  return (
    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium mb-2">
        {reference && (
          <span className="text-sm text-gray-500 font-normal mr-2">#{reference}</span>
        )}
        {name}
      </h3>
      <div className="flex items-center gap-1 text-sm capitalize text-gray-600">
        <MapPin className="w-4 h-4 text-primary" />
        {convertToLocalized(location)}
      </div>
    </div>
  )
}
