"use client"

import { useRef, ReactNode, FormEvent } from "react"
import { useModalClose } from "@/src/hooks/useModalClose"
import ModalHeader from "@/src/components/booking/ModalHeader"
import EquipmentInfo from "@/src/components/booking/EquipmentInfo"
import Button from "@/src/components/ui/Button"

interface BaseRequestModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  equipmentName: string
  equipmentLocation: string
  children: ReactNode
  message: string
  onMessageChange: (value: string) => void
  onSubmit: (e: FormEvent) => void
  loading: boolean
  submitLabel: string
  submittingLabel: string
  messageLabel: string
  optionalLabel: string
  messagePlaceholder: string
  submitIcon: ReactNode
  isSubmitDisabled?: boolean
}

export default function BaseRequestModal({
  isOpen,
  onClose,
  title,
  equipmentName,
  equipmentLocation,
  children,
  message,
  onMessageChange,
  onSubmit,
  loading,
  submitLabel,
  submittingLabel,
  messageLabel,
  optionalLabel,
  messagePlaceholder,
  submitIcon,
  isSubmitDisabled = false,
}: BaseRequestModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  useModalClose(isOpen, onClose, modalRef)

  if (!isOpen) return null

  return (
    <div ref={modalRef} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
        <div className="p-6">
          <ModalHeader title={title} onClose={onClose} />
          <EquipmentInfo name={equipmentName} location={equipmentLocation} />

          <form onSubmit={onSubmit} className="space-y-4">
            {children}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {messageLabel} ({optionalLabel})
              </label>
              <textarea
                value={message}
                onChange={(e) => onMessageChange(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-all duration-200"
                placeholder={messagePlaceholder}
              />
            </div>

            <Button type="submit" disabled={loading || isSubmitDisabled} className="w-full flex items-center justify-center gap-2">
              {submitIcon}
              {loading ? submittingLabel : submitLabel}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
