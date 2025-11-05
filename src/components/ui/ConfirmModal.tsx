import { ReactNode } from "react"
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
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-xs"
        onClick={onClose}
      />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3 mb-4">
            {icon && (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center bg-red-100`}
              >
                {icon}
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose} className="flex-1">
              {cancelText}
            </Button>
            <Button onClick={onConfirm} variant="warning" className={`flex-1`}>
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
