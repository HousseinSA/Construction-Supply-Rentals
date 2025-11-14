import { MapPin } from "lucide-react"

interface LocationInfoProps {
  location: string
}

export default function LocationInfo({ location }: LocationInfoProps) {
  return (
    <div className="flex items-center gap-2 text-gray-600 mb-4 sm:mb-6 pb-4 sm:pb-6 border-b border-gray-200">
      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
      <span className="text-base sm:text-lg font-medium">{location}</span>
    </div>
  )
}
