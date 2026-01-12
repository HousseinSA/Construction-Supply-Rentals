"use client"

import { useState } from 'react'
import { Tag } from 'lucide-react'
import { useTranslations } from "next-intl"
import { useParams, useRouter } from "next/navigation"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useBookingSuccessStore } from "@/src/stores/bookingSuccessStore"
import { calculateSaleCommission } from "@/src/lib/commission"
import BaseRequestModal from "@/src/components/shared/BaseRequestModal"
import type { Equipment } from "@/src/lib/models/equipment"

interface SaleModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: Equipment
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
    
    if (!buyerId) {
      const { toast } = await import("sonner")
      toast.error(t("saleRequestFailed"))
      return
    }
    
    setLoading(true)

    try {
      const salePrice = equipment.pricing?.salePrice || 0
      const commission = calculateSaleCommission(salePrice)

      const saleData = {
        buyerId,
        equipmentId: equipment._id?.toString() || "",
        buyerMessage: message,
        salePrice,
        commission,
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      })

      const data = await response.json()

      if (data.success) {
        if (data.data.equipment) {
          useBookingSuccessStore.setState({ equipment: data.data.equipment })
        }
        router.push(`/${locale}/booking-success?equipment=${encodeURIComponent(equipment.name)}&equipmentId=${equipment._id?.toString()}&type=sale`)
        onSaleSuccess?.()
        onClose()
        setMessage("")
      } else {
        const { toast } = await import("sonner")
        toast.error(data.error || t("saleRequestFailed"))
      }
    } catch {
      const { toast } = await import("sonner")
      toast.error(t("saleRequestFailed"))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !equipment) return null

  const { rate } = getPriceData(equipment.pricing, true)
  const isFormValid = !!buyerId

  return (
    <BaseRequestModal
      isOpen={isOpen}
      onClose={() => {
        setMessage("")
        onClose()
      }}
      title={t("sendSaleRequest")}
      equipmentName={equipment.name}
      equipmentReference={equipment.referenceNumber}
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
      submitIcon={<Tag className="w-4 h-4" />}
      isSubmitDisabled={!isFormValid}
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
