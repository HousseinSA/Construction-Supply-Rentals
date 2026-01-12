"use client"

import { useState, useRef, RefObject } from "react"
import { X, Search, Loader2 } from "lucide-react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { useRouter } from "@/src/i18n/navigation"
import { useModalClose } from "@/src/hooks/useModalClose"
import BookingDetailsModal from "../bookings/BookingDetailsModal"
import SalesDetailsModal from "../sales/SalesDetailsModal"

import type { BookingWithDetails } from "@/src/stores/bookingsStore"

type SearchResult = BookingWithDetails | Record<string, unknown>

interface QuickSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function QuickSearchModal({
  isOpen,
  onClose,
}: QuickSearchModalProps) {
  const t = useTranslations("quickSearch")
  const tToast = useTranslations("toast")
  const router = useRouter()
  const [refNumber, setRefNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SearchResult | null>(null)
  const [resultType, setResultType] = useState<"booking" | "sale" | "equipment" | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const handleSearch = async () => {
    const cleanRef = refNumber.replace(/\D/g, "")
    
    if (!cleanRef) {
      toast.error(t("enterReference"))
      return
    }
    
    if (cleanRef.length < 6) {
      toast.error("Please enter a complete 6-digit reference number")
      return
    }

    setLoading(true)
    try {
      const response = await fetch(
        `/api/search-reference?ref=${encodeURIComponent(cleanRef)}`
      )
      
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      
      const data = await response.json()

      if (data.success) {
        if (data.type === "equipment") {
          // Navigate to equipment details page for equipment results
          router.push(`/equipment/${data.data._id}?admin=true`)
          handleClose()
        } else {
          setResult(data.data)
          setResultType(data.type)
          setRefNumber("")
        }
      } else {
        toast.error(t("notFound"))
      }
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message === 'Failed to fetch') || !navigator.onLine) {
        toast.error(tToast("networkError"))
      } else {
        toast.error(t("notFound"))
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setRefNumber("")
    setResult(null)
    setResultType(null)
    onClose()
  }

  useModalClose(isOpen, handleClose, modalRef as unknown as RefObject<HTMLElement>)

  if (!isOpen) return null

  return (
    <>
      {!result && (
        <div
          ref={modalRef}
          className="fixed inset-0 z-[60] animate-in fade-in duration-150"
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6 animate-in slide-in-from-bottom-4 duration-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  {t("title")}
                </h2>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="text-sm text-gray-600 mb-4">{t("description")}</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={refNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
                    setRefNumber(value)
                  }}
                  onPaste={(e) => {
                    e.preventDefault()
                    const paste = e.clipboardData.getData('text')
                    const cleanValue = paste.replace(/\D/g, "").slice(0, 6)
                    setRefNumber(cleanValue)
                  }}
                  onKeyDown={(e) => e.key === "Enter" && refNumber.length === 6 && handleSearch()}
                  placeholder={t("placeholder")}
                  maxLength={6}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                <button
                  onClick={handleSearch}
                  disabled={loading || refNumber.length < 6}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && resultType === "booking" && (
        <BookingDetailsModal
          booking={result as BookingWithDetails}
          isOpen={true}
          onClose={() => {
            setResult(null)
            setResultType(null)
            onClose()
          }}
          onStatusUpdate={() => {}}
        />
      )}

      {result && resultType === "sale" && (
        <SalesDetailsModal
          sale={result as Record<string, unknown>}
          isOpen={true}
          onClose={() => {
            setResult(null)
            setResultType(null)
            onClose()
          }}
          onStatusUpdate={() => {}}
        />
      )}
    </>
  )
}
