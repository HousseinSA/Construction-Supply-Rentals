import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { PricingType } from "@/src/lib/types"
import { useBookingSuccessStore } from "@/src/stores/bookingSuccessStore"
import { calculateCommission } from "@/src/lib/commission"
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
      toast.error(validation.error || t("error"))
      return
    }
    
    setLoading(true)
    try {
      // Calculate rate and subtotal
      const pricing = equipment.pricing
      let rate = 0
      if (pricingType === 'hourly') rate = pricing?.hourlyRate || 0
      else if (pricingType === 'daily') rate = pricing?.dailyRate || 0
      else if (pricingType === 'monthly') rate = pricing?.monthlyRate || 0
      else if (pricingType === 'per_km') rate = pricing?.kmRate || 0
      else if (pricingType === 'per_ton') rate = pricing?.tonRate || 0
      
      const subtotal = rate * usage
      const commission = calculateCommission(subtotal)

      const bookingData: any = {
        renterId: session.user.id,
        equipmentId: equipment._id,
        usage,
        pricingType,
        subtotal,
        commission,
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
          toast.success(t("successPending"))
        }
        resetForm()
        onSuccess?.()
        onClose?.()
      } else {
        toast.error(data.error || t("error"))
      }
    } catch {
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
