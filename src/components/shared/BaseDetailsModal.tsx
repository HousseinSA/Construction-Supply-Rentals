"use client"

import { useRef, ReactNode, RefObject } from "react"
import { useModalClose } from "@/src/hooks/useModalClose"
import ModalHeader from "@/src/components/booking/ModalHeader"
import ReferenceBadge from "./ReferenceBadge"
import Button from "@/src/components/ui/Button"
import { Save } from "lucide-react"

interface BaseDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  referenceNumber: string
  referenceLabel: string
  children: ReactNode
  onUpdate?: () => void
  updateDisabled?: boolean
  updateLoading?: boolean
  updateLabel?: string
  updatingLabel?: string
  closeLabel?: string
  createdAt?: string
}

export default function BaseDetailsModal({
  isOpen,
  onClose,
  title,
  referenceNumber,
  referenceLabel,
  children,
  onUpdate,
  updateDisabled,
  updateLoading,
  updateLabel,
  updatingLabel,
  closeLabel,
  createdAt,
}: BaseDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  useModalClose(isOpen, onClose, modalRef as RefObject<HTMLElement>)

  if (!isOpen) return null

  return (
    <div ref={modalRef} className="fixed inset-0 z-50 animate-in fade-in duration-150">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-6">
            <ModalHeader title={title} onClose={onClose} />
            <ReferenceBadge referenceNumber={referenceNumber} label={referenceLabel} createdAt={createdAt} />
            
            <div className="space-y-6">{children}</div>

            {onUpdate && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex justify-end gap-3">
                  <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                    {closeLabel}
                  </button>
                  <Button onClick={onUpdate} disabled={updateDisabled} className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {updateLoading ? updatingLabel : updateLabel}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
