"use client"

import { useState } from 'react'
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { FileText } from "lucide-react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { toast } from "sonner"
import BaseRequestModal from "@/src/components/shared/BaseRequestModal"
import TransportSection from "./TransportSection"
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
  const tBooking = useTranslations("booking")
  const params = useParams()
  const locale = params?.locale as string || 'fr'
  const { getPriceData } = usePriceFormatter()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedPorteChar, setSelectedPorteChar] = useState<any>(null)
  const [distance, setDistance] = useState(0)

  const needsTransport = requiresTransport(equipment?.name || '')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const saleData: any = {
        buyerId,
        equipmentId: equipment._id,
        buyerMessage: message,
      }

      if (selectedPorteChar && distance && distance > 0) {
        saleData.transportDetails = {
          porteCharId: selectedPorteChar._id,
          porteCharName: selectedPorteChar.name,
          supplierId: selectedPorteChar.supplierId,
          supplierName: selectedPorteChar.supplierName,
          distance,
          ratePerKm: selectedPorteChar.pricing.kmRate,
          transportCost: selectedPorteChar.pricing.kmRate * distance,
        }
      }

      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(saleData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success(t("saleRequestSuccess"))
        onSaleSuccess?.()
        onClose()
        setMessage("")
      } else {
        toast.error(data.error || t("saleRequestFailed"))
      }
    } catch (error) {
      toast.error(t("saleRequestFailed"))
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen || !equipment) return null

  const { rate } = getPriceData(equipment.pricing, true)
  const transportCost = selectedPorteChar && distance > 0
    ? selectedPorteChar.pricing.kmRate * distance
    : 0
  const grandTotal = rate + transportCost

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
      {needsTransport && (
        <TransportSection
          isRequired={false}
          selectedPorteChar={selectedPorteChar}
          distance={distance}
          onPorteCharChange={setSelectedPorteChar}
          onDistanceChange={setDistance}
          locale={locale}
        />
      )}

      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">{t("salePrice")}</span>
            <span className="text-2xl font-bold text-primary" dir="ltr">
              {rate.toLocaleString()} MRU
            </span>
          </div>
          {transportCost > 0 && (
            <>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{tBooking("transport")}</span>
                <span className="font-medium" dir="ltr">
                  {transportCost.toLocaleString()} MRU
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="font-semibold">{tBooking("estimatedTotal")}</span>
                <span className="text-2xl font-bold text-primary" dir="ltr">
                  {grandTotal.toLocaleString()} MRU
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </BaseRequestModal>
  )
}
