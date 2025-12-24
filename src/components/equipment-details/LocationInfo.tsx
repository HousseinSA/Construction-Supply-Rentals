import { MapPin } from "lucide-react"

interface LocationInfoProps {
  location: string
}

export default function LocationInfo({ location }: LocationInfoProps) {
  return (
    <div className="flex items-center capitalize gap-2 text-gray-600 mb-1 sm:mb-2 pb-1 sm:pb-2 border-b border-gray-200">
      <MapPin className="w-4 h-4 text-primary" />
      <span className="text-sm sm:text-base font-medium">{location}</span>
    </div>
  )
}
