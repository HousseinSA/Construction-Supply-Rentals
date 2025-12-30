import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { PricingType } from "@/src/lib/types"
import { requiresTransport } from "@/src/lib/constants/transport"
import { useBookingSuccessStore } from "@/src/stores/bookingSuccessStore"
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

  const validateBooking = (type: PricingType): { valid: boolean; error?: string } => {
    if (type === "daily") {
      if (!startDate || !endDate) {
        return { valid: false, error: "Please select both start and end dates" }
      }
    } else {
      if (!startDate) {
        return { valid: false, error: "Start date is required" }
      }
      if (usage <= 0) {
        return { valid: false, error: "Usage must be greater than 0" }
      }
    }
    return { valid: true }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    const validation = validateBooking(pricingType || "daily")
    if (!validation.valid) {
      const { toast } = await import("sonner")
      toast.error(validation.error || t("error"))
      return
    }
    
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
        if (data.data.equipment) {
          useBookingSuccessStore.setState({ equipment: data.data.equipment })
        }
        if (router && locale) {
          router.push(`/${locale}/booking-success?equipment=${encodeURIComponent(equipment.name)}&equipmentId=${equipment._id}&type=booking`)
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
    validateBooking,
  }
}
