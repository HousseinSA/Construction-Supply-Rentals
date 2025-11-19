"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { X, Calculator, Send } from "lucide-react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import Toast from "@/src/components/ui/Toast"

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
  const { data: session } = useSession()
  const t = useTranslations("booking")
  const { getPriceData } = usePriceFormatter()

  const [usage, setUsage] = useState<number>(1)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  if (!isOpen || !equipment) return null

  const { rate, unit } = getPriceData(
    equipment.pricing,
    equipment.listingType === "forSale"
  )
  const subtotal = rate * usage
  const usageLabel =
    equipment.usageCategory === "hours"
      ? t("hours")
      : equipment.usageCategory === "kilometers"
      ? t("km")
      : t("tons")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renterId: session.user.id,
          bookingItems: [
            {
              equipmentId: equipment._id,
              usage,
            },
          ],
          renterMessage: message,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setToast({ message: t("success"), type: "success" })
        onBookingSuccess?.()
        setTimeout(() => onClose(), 2000)
      } else {
        setToast({ message: data.error || t("error"), type: "error" })
      }
    } catch (error) {
      setToast({ message: t("error"), type: "error" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{t("title")}</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium mb-2">{equipment.name}</h3>
            <p className="text-sm text-gray-600">{equipment.location}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("usage")} ({usageLabel})
              </label>
              <input
                type="number"
                min="1"
                value={usage}
                onChange={(e) => setUsage(Number(e.target.value))}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                required
              />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-blue-900">
                  {t("calculation")}
                </span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>{t("rate")}</span>
                  <span className="font-medium" dir="ltr">
                    {rate.toLocaleString()} MRU/{unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("usage")}</span>
                  <span>
                    {usage} {usageLabel}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-blue-900 pt-2 border-t">
                  <span>{t("total")}</span>
                  <span className="text-lg" dir="ltr">
                    {subtotal.toLocaleString()} MRU
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                {t("message")} ({t("optional")})
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t("messagePlaceholder")}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? t("sending") : t("sendRequest")}
            </button>
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
