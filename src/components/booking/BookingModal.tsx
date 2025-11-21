"use client"

import { useRef } from 'react'
import { useTranslations } from "next-intl"
import { Send } from "lucide-react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useBookingModal } from "@/src/hooks/useBookingModal"
import { useModalClose } from '@/src/hooks/useModalClose'
import Toast from "@/src/components/ui/Toast"
import Button from "@/src/components/ui/Button"
import Input from "@/src/components/ui/Input"
import ModalHeader from "./ModalHeader"
import EquipmentInfo from "./EquipmentInfo"
import PriceCalculation from "./PriceCalculation"

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  equipment: any
  onBookingSuccess?: () => void
}

export default function BookingModal({
  isOpen,
  onClose,
  equipment,
  onBookingSuccess,
}: BookingModalProps) {
  const t = useTranslations("booking")
  const modalRef = useRef<HTMLDivElement>(null)
  const { getPriceData } = usePriceFormatter()
  const { usage, setUsage, message, setMessage, loading, toast, setToast, handleSubmit } =
    useBookingModal(equipment, onBookingSuccess, onClose)
  
  useModalClose(isOpen, onClose, modalRef)

  if (!isOpen || !equipment) return null

  const { rate, unit } = getPriceData(equipment.pricing, equipment.listingType === "forSale")
  const subtotal = rate * usage
  const usageLabel =
    equipment.usageCategory === "hours"
      ? t("hours")
      : equipment.usageCategory === "kilometers"
      ? t("km")
      : t("tons")

  return (
    <div ref={modalRef} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <ModalHeader title={t("title")} onClose={onClose} />
          <EquipmentInfo name={equipment.name} location={equipment.location} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="number"
              label={`${t("usage")} (${usageLabel})`}
              min="1"
              value={usage}
              onChange={(e) => setUsage(Number(e.target.value))}
              required
            />

            <PriceCalculation
              rate={rate}
              unit={unit}
              usage={usage}
              usageLabel={usageLabel}
              subtotal={subtotal}
              labels={{
                calculation: t("calculation"),
                rate: t("rate"),
                usage: t("usage"),
                total: t("total"),
              }}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("message")} ({t("optional")})
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
                placeholder={t("messagePlaceholder")}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              {loading ? t("sending") : t("sendRequest")}
            </Button>
          </form>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={!!toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
