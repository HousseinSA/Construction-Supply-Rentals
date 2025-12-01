import { Eye, Coins } from "lucide-react"
import BookingStatusBadge from "../dashboard/bookings/BookingStatusBadge"

interface CardField {
  label: string
  value: string | number
  icon?: React.ReactNode
  highlight?: boolean
}

interface GenericMobileCardProps {
  id: string
  title: string
  subtitle?: string
  date: string
  status: string
  fields: CardField[]
  onViewDetails: () => void
  viewButtonText: string
  actionButton?: React.ReactNode
}

export default function GenericMobileCard({
  id,
  title,
  subtitle,
  date,
  status,
  fields,
  onViewDetails,
  viewButtonText,
  actionButton,
}: GenericMobileCardProps) {
  return (
    <div className="p-4 space-y-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          {subtitle && (
            <div className="text-sm text-gray-600">{subtitle}</div>
          )}
          <div className="text-xs text-gray-500 mt-0.5">{date}</div>
        </div>
        <BookingStatusBadge status={status} />
      </div>

      {title && (
        <div className="text-sm font-medium text-gray-900">{title}</div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {fields.map((field, index) => {
            const isNumeric = typeof field.value === "number"
            const displayValue = isNumeric
              ? field.value.toLocaleString()
              : field.value
            const showMRU = isNumeric && !String(field.value).includes("h")

            return (
              <div key={index} className="flex items-center gap-1">
                {field.icon}
                <div>
                  <div className="text-xs text-gray-500">{field.label}</div>
                  <div
                    className={`font-semibold ${
                      field.highlight ? "text-green-600" : "text-gray-900"
                    }`}
                  >
                    {displayValue}
                    {showMRU ? " MRU" : ""}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={onViewDetails}
            className="px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm flex items-center gap-1.5"
          >
            <Eye className="w-4 h-4" />
            {viewButtonText}
          </button>
          {actionButton}
        </div>
      </div>
    </div>
  )
}
