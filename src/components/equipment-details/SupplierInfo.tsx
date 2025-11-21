"use client"
import { useTranslations } from "next-intl"
import {
  User,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Building2,
} from "lucide-react"
import CopyButton from "@/src/components/ui/CopyButton"
import { formatPhoneNumber } from "@/src/lib/format"

interface SupplierInfoProps {
  supplier: any
  variant?: "card" | "modal"
  showContactButtons?: boolean
}

export default function SupplierInfo({
  supplier,
  variant = "card",
  showContactButtons = true,
}: SupplierInfoProps) {
  const t = useTranslations("equipmentDetails")
  const tBooking = useTranslations("dashboard.bookings.details")
  if (!supplier) return null

  if (variant === "modal") {
    return (
      <div className="bg-orange-50 rounded-lg p-4 h-full flex flex-col">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-orange-600" />
          {tBooking("supplierInfo")}
        </h3>
        <div className="space-y-2 text-sm flex-1">
          <div className="flex justify-between">
            <span className="text-gray-600">{tBooking("name")}</span>
            <span className="font-medium">
              {supplier.firstName} {supplier.lastName}
            </span>
          </div>
          {supplier.companyName && (
            <div className="flex justify-between">
              <span className="text-gray-600">{tBooking("company")}</span>
              <span className="font-medium">{supplier.companyName}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">{tBooking("email")}</span>
            <span className="font-medium">{supplier.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{tBooking("phone")}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium" dir="ltr">
                {formatPhoneNumber(supplier.phone)}
              </span>
              <CopyButton text={supplier.phone} size="sm" />
            </div>
          </div>
          {supplier.location && (
            <div className="flex justify-between">
              <span className="text-gray-600">{tBooking("location")}</span>
              <span className="font-medium">{supplier.location}</span>
            </div>
          )}
        </div>

        {showContactButtons && (
          <div className="mt-4 flex gap-2">
            <a
              href={`tel:${supplier.phone}`}
              className="flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 text-sm flex-1 justify-center"
            >
              <Phone className="w-4 h-4" />
              {tBooking("call")}
            </a>
            <a
              href={`https://wa.me/222${supplier.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex-1 justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        )}
      </div>
    )
  }

  // Card variant - for equipment details page
  return (
    <div className="mt-6 bg-orange-50 rounded-xl p-6 border border-orange-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Building2 className="w-5 h-5 text-orange-600" />
        {t("supplierInfo")}
      </h3>

      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {supplier.firstName} {supplier.lastName}
            </div>
            {supplier.companyName && (
              <div className="text-sm text-gray-600">
                {supplier.companyName}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Mail className="w-5 h-5 text-orange-600" />
          </div>
          <a
            href={`mailto:${supplier.email}`}
            className="text-gray-700 hover:text-orange-600 transition-colors"
          >
            {supplier.email}
          </a>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Phone className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="text-gray-900 font-medium" dir="ltr">
              {formatPhoneNumber(supplier.phone)}
            </span>
            <CopyButton text={supplier.phone} />
          </div>
        </div>

        {supplier.location && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-700">{supplier.location}</span>
          </div>
        )}

        {showContactButtons && (
          <div className="flex gap-3 mt-4 pt-4 border-t border-orange-200">
            <a
              href={`tel:${supplier.phone}`}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Phone className="w-4 h-4" />
              {t("call")}
            </a>
            <a
              href={`https://wa.me/222${supplier.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
