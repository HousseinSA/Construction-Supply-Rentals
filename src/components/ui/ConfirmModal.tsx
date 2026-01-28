import { ReactNode, useRef } from "react"
import { useModalClose } from '@/src/hooks/useModalClose'
import Button from "./Button"

interface ConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText: string
  cancelText: string
  icon?: ReactNode
  iconBgColor?: string
  isLoading?: boolean
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  icon,
  iconBgColor = "bg-gray-100",
  isLoading = false,
}: ConfirmModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  useModalClose(isOpen, onClose, modalRef)

  if (!isOpen) return null

  return (
    <div ref={modalRef} className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgColor}`}
              >
                {icon}
              </div>
            )}
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{message}</p>
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="secondary"
              onClick={onClose}
              className="flex-1 !py-2 !px-4 sm:!py-3 sm:!px-8 !text-sm sm:!text-base whitespace-nowrap"
              disabled={isLoading}
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
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
