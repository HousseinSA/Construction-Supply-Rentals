import { Eye } from "lucide-react"
import BookingStatusBadge from "../dashboard/bookings/BookingStatusBadge"
import CopyButton from "./CopyButton"

interface CardField {
  label: string
  value: string | number | React.ReactNode
  icon?: React.ReactNode
  highlight?: boolean
  currency?: boolean
  valueClassName?: string
  labelClassName?: string
  secondaryValue?: string
}

interface StyleConfig {
  dateClassName?: string
  labelClassName?: string
  valueClassName?: string
  idClassName?: string
  subtitleClassName?: string
}

interface GenericMobileCardProps {
  id: string | React.ReactNode
  title: string
  subtitle?: string
  date: string
  status: string
  fields: CardField[]
  onViewDetails: () => void
  viewButtonText: string
  actionButton?: React.ReactNode
  image?: React.ReactNode
  styleConfig?: StyleConfig
  isAdminView?: boolean
  phoneNumber?: string
  supplierNumber?: string
  supplierName?: string
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
  image,
  isAdminView,
  styleConfig,
  phoneNumber,
}: GenericMobileCardProps) {
  const defaultStyles = {
    dateClassName: "text-sm text-gray-500 mt-0.5",
    labelClassName: "text-xs text-gray-500",
    valueClassName: "font-semibold text-xs text-gray-900",
    idClassName: "font-semibold text-orange-600 flex items-center text-sm mb-1",
    subtitleClassName: "text-sm text-gray-600",
    ...styleConfig,
  }
  return (
    <div className="p-4 space-y-3 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className={`${defaultStyles.idClassName}`}>
            {typeof id === "string" && "#" + id}
            {!isAdminView && <CopyButton text={id as string} />}
          </div>
          {subtitle && (
            <div>
              <div className={defaultStyles.subtitleClassName}>{subtitle}</div>
              {isAdminView && phoneNumber && (
                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600">{phoneNumber}</span>
                  <CopyButton text={phoneNumber} />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-col items-center gap-1">
          <BookingStatusBadge status={status} />
          <div className={defaultStyles.dateClassName}>{date}</div>
        </div>
      </div>

      {(title || image) && (
        <div className="flex gap-3 items-start">
          {image && <div className="flex-shrink-0">{image}</div>}
          <div className="flex-1 flex flex-col gap-2">
            <div className="text-sm font-medium text-gray-900">{title}</div>

            {fields.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {fields.slice(0, 2).map((field, index) => {
                  const isNumeric = typeof field.value === "number"
                  const isString = typeof field.value === "string"
                  const isJSX =
                    typeof field.value === "object" && !isNumeric && !isString

                  let displayValue: string | React.ReactNode = field.value
                  if (
                    isNumeric &&
                    field.value !== null &&
                    field.value !== undefined
                  ) {
                    const formatted = field.value.toLocaleString()
                    displayValue = field.currency
                      ? `${formatted} MRU`
                      : formatted
                  }

                  return (
                    <div key={index} className="flex items-start gap-1">
                      {field.icon}
                      <div>
                        <div
                          className={
                            field.labelClassName || defaultStyles.labelClassName
                          }
                        >
                          {field.label}
                        </div>
                        <div
                          className={
                            field.valueClassName ||
                            `font-semibold text-xs ${
                              field.highlight
                                ? "text-green-600"
                                : "text-gray-900"
                            }`
                          }
                        >
                          {isJSX ? displayValue : displayValue}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {fields.length > 2 && (
        <div className="space-y-2 border-t border-gray-200 pt-2">
          <div className="grid grid-cols-2 gap-3">
            {fields.slice(2).map((field, index) => {
              const isNumeric = typeof field.value === "number"
              const isString = typeof field.value === "string"
              const isJSX =
                typeof field.value === "object" && !isNumeric && !isString

              let displayValue: string | React.ReactNode = field.value
              if (
                isNumeric &&
                field.value !== null &&
                field.value !== undefined
              ) {
                const formatted = field.value.toLocaleString()
                displayValue = field.currency ? `${formatted} MRU` : formatted
              }

              return (
                <div key={index} className="flex items-start gap-1">
                  {field.icon}
                  <div className="flex-1">
                    <div
                      className={
                        field.labelClassName || defaultStyles.labelClassName
                      }
                    >
                      {field.label}
                    </div>
                    <div
                      className={
                        field.valueClassName ||
                        `font-semibold text-sm ${
                          field.highlight ? "text-green-600" : "text-gray-900"
                        }`
                      }
                    >
                      {isJSX ? displayValue : displayValue}
                    </div>
                    {field.secondaryValue && (
                      <div className="flex items-center gap-1">
                        <span className="text-sm text-gray-600 ">
                          {field.secondaryValue}
                        </span>
                        <CopyButton text={field.secondaryValue} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
        <button
          onClick={onViewDetails}
          className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center justify-center gap-1.5"
        >
          <Eye className="w-4 h-4" />
          {viewButtonText}
        </button>
        {actionButton}
      </div>
    </div>
  )
}
