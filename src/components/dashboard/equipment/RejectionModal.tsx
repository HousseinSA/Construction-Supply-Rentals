"use client"

import { useState, useRef, useEffect } from "react"
import { AlertTriangle } from "lucide-react"
import { useModalClose } from "@/src/hooks/useModalClose"
import Button from "@/src/components/ui/Button"

interface RejectionModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  title: string
  confirmText: string
  cancelText: string
  placeholder: string
  isLoading?: boolean
}

export default function RejectionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  cancelText,
  placeholder,
  isLoading = false,
}: RejectionModalProps) {
  const [reason, setReason] = useState("")
  const modalRef = useRef<HTMLDivElement>(null)
  useModalClose(isOpen, onClose, modalRef)

  useEffect(() => {
    if (isOpen) {
      setReason("")
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm(reason.trim() || "")
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return (
    <div ref={modalRef} className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">
              {title}
            </h3>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200 resize-none mb-4 sm:mb-6"
            disabled={isLoading}
          />
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="secondary"
              onClick={handleClose}
              className="flex-1 !py-2 !px-4 sm:!py-3 sm:!px-8 !text-sm sm:!text-base whitespace-nowrap"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              variant="warning"
              className="flex-1 !py-2 !px-4 sm:!py-3 sm:!px-8 !text-sm sm:!text-base whitespace-nowrap"
              disabled={isLoading}
            >
              {isLoading ? `${confirmText}...` : confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
