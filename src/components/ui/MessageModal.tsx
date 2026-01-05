'use client'
import { useRef, RefObject } from "react"
import { X, AlertCircle } from "lucide-react"
import { useModalClose } from "@/src/hooks/useModalClose"
import { useTranslations } from "next-intl"

interface MessageModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  message: string
  type?: "error" | "warning" | "info" | "success"
}

export default function MessageModal({
  isOpen,
  onClose,
  title,
  message,
  type = "error"
}: MessageModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  useModalClose(isOpen, onClose, modalRef as unknown as RefObject<HTMLElement>)
  const t = useTranslations("common")
  if (!isOpen) return null

  const typeStyles = {
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-orange-50 border-orange-200 text-orange-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    success: "bg-green-50 border-green-200 text-green-800"
  }

  const iconStyles = {
    error: "text-red-600",
    warning: "text-orange-600",
    info: "text-blue-600",
    success: "text-green-600"
  }

  return (
    <div className="fixed inset-0 z-50 animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative h-full flex items-center justify-center p-4">
        <div
          ref={modalRef}
          className="bg-white rounded-xl max-w-md w-full animate-in slide-in-from-bottom-4 duration-200 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <AlertCircle className={`w-6 h-6 ${iconStyles[type]}`} />
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className={`p-4 rounded-lg border ${typeStyles[type]}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
              >
               { t('close')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
