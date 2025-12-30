import { useState } from "react"
import { toast } from "sonner"

export function useTransactionCancel(
  type: "booking" | "purchase",
  onSuccess: () => void,
  translations: any
) {
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const handleCancelClick = (id: string) => {
    setSelectedId(id)
    setShowDialog(true)
  }

  const handleConfirm = async () => {
    if (!selectedId) return

    setCancellingId(selectedId)
    const endpoint = type === "booking" ? "/api/bookings" : "/api/sales"
    const bodyKey = type === "booking" ? "bookingId" : "saleId"

    try {
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [bodyKey]: selectedId, status: "cancelled" }),
      })

      if (response.ok) {
        toast.success(translations.cancelSuccess)
        onSuccess()
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error("Cancel error:", { status: response.status, error: errorData })
        toast.error(errorData.error || translations.cancelFailed)
      }
    } catch (error) {
      console.error("Cancel request error:", error)
      toast.error(translations.cancelFailed)
    } finally {
      setCancellingId(null)
      setShowDialog(false)
      setSelectedId(null)
    }
  }

  return {
    cancellingId,
    showDialog,
    setShowDialog,
    handleCancelClick,
    handleConfirm,
  }
}
