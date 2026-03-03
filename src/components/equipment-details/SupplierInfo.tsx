"use client"
import { useTranslations } from "next-intl"
import ContactCard from "@/src/components/shared/ContactCard"

interface SupplierInfoProps {
  supplier: any
  variant?: "card" | "modal"
  showContactButtons?: boolean
  title?: string
  bgColor?: string
  iconColor?: string
  showEmail?: boolean
}

export default function SupplierInfo({ supplier, title }: SupplierInfoProps) {
  const t = useTranslations("equipmentDetails")

  if (!supplier) return null

  return (
    <div className="mt-6">
      <ContactCard
        user={supplier}
        title={title || t("supplierInfo")}
        variant="supplier"
      />
    </div>
  )
}
