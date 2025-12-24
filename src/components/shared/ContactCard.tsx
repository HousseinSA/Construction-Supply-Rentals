"use client"

import { useTranslations } from "next-intl"
import { Phone, User, Briefcase, Building, MessageCircle } from "lucide-react"
import { formatPhoneNumber } from "@/src/lib/format"
import CopyButton from "@/src/components/ui/CopyButton"

interface ContactCardProps {
  user?: {
    firstName?: string
    lastName?: string
    phone?: string
    email?: string
    location?: string
    city?: string
    companyName?: string
  }
  title: string
  variant?: "buyer" | "renter" | "supplier" | "admin"
  adminCreated?: boolean
  adminLabel?: string
}

export default function ContactCard({ user, title, variant = "renter", adminCreated, adminLabel }: ContactCardProps) {
  const t = useTranslations("dashboard.bookings.details")
  
  if (adminCreated) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-600" />
          {title}
        </h3>
        <p className="text-sm text-gray-600">{adminLabel}</p>
      </div>
    )
  }

  if (!user) return null

  const colorMap = {
    buyer: { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600", iconBg: "bg-blue-600" },
    renter: { bg: "bg-blue-50", border: "border-blue-100", icon: "text-blue-600", iconBg: "bg-blue-600" },
    supplier: { bg: "bg-orange-50", border: "border-orange-100", icon: "text-orange-600", iconBg: "bg-orange-600" },
    admin: { bg: "bg-gray-50", border: "border-gray-200", icon: "text-gray-600", iconBg: "bg-gray-600" },
  }

  const colors = colorMap[variant]
  const Icon = variant === "supplier" ? Briefcase : User

  return (
    <div className={`${colors.bg} rounded-lg p-4 border ${colors.border}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className={`font-semibold text-gray-900 flex items-center gap-2`}>
          <Icon className={`w-4 h-4 ${colors.icon}`} />
          {title}
        </h3>
        {user.phone && (
          <div className="flex items-center gap-1.5">
            <a
              href={`tel:${user.phone}`}
              className="p-1.5 bg-white hover:bg-blue-100 rounded-md transition-colors"
              title={t("call")}
            >
              <Phone className="w-4 h-4 text-blue-600" />
            </a>
            <a
              href={`https://wa.me/222${user.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 bg-white hover:bg-green-100 rounded-md transition-colors"
              title="WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-green-600" />
            </a>
          </div>
        )}
      </div>
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">{t("name")}</span>
          <span className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </span>
        </div>
        {user.companyName && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t("company")}</span>
            <span className="font-medium text-gray-900">{user.companyName}</span>
          </div>
        )}
        {user.phone && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t("phone")}</span>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900" dir="ltr">
                {formatPhoneNumber(user.phone)}
              </span>
              <CopyButton text={user.phone} size="sm" />
            </div>
          </div>
        )}
        {(user.location || user.city) && (
          <div className="flex items-center justify-between">
            <span className="text-gray-600">{t("location")}</span>
            <span className="font-medium text-gray-900">{user.location || user.city}</span>
          </div>
        )}
      </div>
    </div>
  )
}
