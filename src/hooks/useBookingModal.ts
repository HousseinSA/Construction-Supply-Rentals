import { useState } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"

export function useBookingModal(equipment: any, onSuccess?: () => void, onClose?: () => void) {
  const { data: session } = useSession()
  const t = useTranslations("booking")
  
  const [usage, setUsage] = useState(1)
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

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
          bookingItems: [{ equipmentId: equipment._id, usage }],
          renterMessage: message,
        }),
      })
      
      const data = await response.json()
      if (data.success) {
        setToast({ message: t("success"), type: "success" })
        onSuccess?.()
        setTimeout(() => onClose?.(), 2000)
      } else {
        setToast({ message: data.error || t("error"), type: "error" })
      }
    } catch {
      setToast({ message: t("error"), type: "error" })
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
    toast,
    setToast,
    handleSubmit,
  }
}
