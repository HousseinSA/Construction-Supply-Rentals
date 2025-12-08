import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useRouter } from "@/src/i18n/navigation"
import { PricingType } from "@/src/lib/types"

export function useBookingModal(equipment: any, onSuccess?: () => void, onClose?: () => void, pricingType?: PricingType) {
  const { data: session } = useSession()
  const router = useRouter()
  const t = useTranslations("booking")
  
  const [usage, setUsage] = useState(0)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const resetForm = () => {
    setUsage(0)
    setMessage("")
  }

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
          bookingItems: [{ equipmentId: equipment._id, usage, pricingType }],
          renterMessage: message,
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        toast.success(t("successPending"))
        resetForm()
        onSuccess?.()
        onClose?.()
        setTimeout(() => router.push("/bookings"), 800)
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
    message,
    setMessage,
    loading,
    handleSubmit,
    resetForm,
  }
}
