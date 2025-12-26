"use client"

import { useState } from 'react'
import { useTranslations } from "next-intl"
import { useParams, useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import BaseRequestModal from "@/src/components/shared/BaseRequestModal"
import { requiresTransport } from "@/src/lib/constants/transport"

interface SaleModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: any
  onSaleSuccess?: () => void
  buyerId: string
}

export default function SaleModal({
  isOpen,
  onClose,
  equipment,
  onSaleSuccess,
  buyerId,
}: SaleModalProps) {
  const t = useTranslations("equipmentDetails")
  const { getPriceData } = usePriceFormatter()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const params = useParams()
  const router = useRouter()
  const locale = params?.locale as string || 'fr'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const saleData: any = {
        buyerId,
        equipmentId: equipment._id,
        buyerMessage: message,
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      })

      const data = await response.json()

      if (data.success) {
        router.push(`/${locale}/booking-success?equipment=${encodeURIComponent(equipment.name)}&equipmentId=${equipment._id}&type=sale`)
        onSaleSuccess?.()
        onClose()
        setMessage("")
      } else {
        const { toast } = await import("sonner")
        toast.error(data.error || t("saleRequestFailed"))
      }
    } catch (error) {
      const { toast } = await import("sonner")
      toast.error(t("saleRequestFailed"))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !equipment) return null

  const { rate } = getPriceData(equipment.pricing, true)

  return (
    <BaseRequestModal
      isOpen={isOpen}
      onClose={() => {
        setMessage("")
        onClose()
      }}
      title={t("sendSaleRequest")}
      equipmentName={equipment.name}
      equipmentLocation={equipment.location}
      message={message}
      onMessageChange={setMessage}
      onSubmit={handleSubmit}
      loading={loading}
      submitLabel={t("sendSaleRequest")}
      submittingLabel={t("sending")}
      messageLabel={t("message")}
      optionalLabel={t("optional")}
      messagePlaceholder={t("messagePlaceholder")}
      submitIcon={<FileText className="w-4 h-4" />}
    >
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{t("salePrice")}</span>
          <span className="text-2xl font-bold text-primary" dir="ltr">
            {rate.toLocaleString()} MRU
          </span>
        </div>
      </div>
    </BaseRequestModal>
  )
}
