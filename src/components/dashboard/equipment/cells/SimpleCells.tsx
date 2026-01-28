import { MapPin } from "lucide-react"
import { memo } from "react"

function LocationCell({ location }: { location: string }) {
  return (
    <td className="px-6 py-4">
      <div className="flex items-center gap-1.5">
        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
        <span className="text-sm font-medium text-gray-700 capitalize whitespace-nowrap">
          {location}
        </span>
      </div>
    </td>
  )
}

function DateCell({ date }: { date: Date }) {
  return (
    <td className="px-6 py-4 text-center">
      <span className="text-sm text-gray-600 whitespace-nowrap">
        {new Date(date).toLocaleDateString()}
      </span>
    </td>
  )
}

export const MemoizedLocationCell = memo(LocationCell)
export const MemoizedDateCell = memo(DateCell)
