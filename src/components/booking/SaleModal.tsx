"use client"

import { useRef, useState } from 'react'
import { useTranslations } from "next-intl"
import { FileText } from "lucide-react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useModalClose } from '@/src/hooks/useModalClose'
import { toast } from "sonner"
import Button from "@/src/components/ui/Button"
import ModalHeader from "./ModalHeader"
import EquipmentInfo from "./EquipmentInfo"

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
  const modalRef = useRef<HTMLDivElement>(null)
  const { getPriceData } = usePriceFormatter()
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  
  useModalClose(isOpen, onClose, modalRef)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerId,
          equipmentId: equipment._id,
          buyerMessage: message,
        }),
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

  return (
    <div ref={modalRef} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
        <div className="p-6">
          <ModalHeader title={t("sendSaleRequest")} onClose={onClose} />
          <EquipmentInfo name={equipment.name} location={equipment.location} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t("salePrice")}</span>
                <span className="text-2xl font-bold text-primary" dir="ltr">
                  {rate.toLocaleString()} MRU
                </span>
              </div>
            </div>

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
              <FileText className="w-4 h-4" />
              {loading ? t("sending") : t("sendSaleRequest")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
