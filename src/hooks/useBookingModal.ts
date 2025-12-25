import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { PricingType } from "@/src/lib/types"
import { requiresTransport } from "@/src/lib/constants/transport"
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export function useBookingModal(
  equipment: any,
  onSuccess?: () => void,
  onClose?: () => void,
  pricingType?: PricingType,
  router?: AppRouterInstance,
  locale?: string
) {
  const { data: session } = useSession()
  const t = useTranslations("booking")
  
  const [usage, setUsage] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setUsage(0)
    setStartDate("")
    setEndDate("")
    setMessage("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return
    
    setLoading(true)
    try {
      const bookingData: any = {
        renterId: session.user.id,
        bookingItems: [{ equipmentId: equipment._id, usage, pricingType }],
        renterMessage: message,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })
      
      const data = await response.json()
      if (data.success) {
        const needsTransport = requiresTransport(equipment?.name || '')
        if (needsTransport && router && locale) {
          router.push(`/${locale}/booking-success?equipment=${encodeURIComponent(equipment.name)}&type=booking`)
        } else {
          const { toast } = await import("sonner")
          toast.success(t("successPending"))
        }
        resetForm()
        onSuccess?.()
        onClose?.()
      } else {
        const { toast } = await import("sonner")
        toast.error(data.error || t("error"))
      }
    } catch {
      const { toast } = await import("sonner")
      toast.error(t("error"))
    } finally {
      setLoading(false)
    }
  }

  return {
    usage,
    setUsage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    message,
    setMessage,
    loading,
    handleSubmit,
    resetForm,
  }
}
