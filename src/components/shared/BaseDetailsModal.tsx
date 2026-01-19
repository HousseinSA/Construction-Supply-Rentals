"use client"

import { useRef, ReactNode, RefObject } from "react"
import { useModalClose } from "@/src/hooks/useModalClose"
import ModalHeader from "@/src/components/booking/ModalHeader"
import ReferenceBadge from "./ReferenceBadge"
import Button from "@/src/components/ui/Button"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
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
  equipmentImage?: string | string[]
  equipmentName?: string
  equipmentId?: string
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
  equipmentImage,
  equipmentName,
  equipmentId,
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
            
            {equipmentImage && equipmentName && equipmentId && (
              <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 -mx-6 mx-6">
                <a 
                  href={`/equipment/${equipmentId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 group cursor-pointer"
                  title="View equipment details"
                >
                  <div className="relative">
                    <EquipmentImage
                      src={equipmentImage}
                      alt={equipmentName}
                      size="xl"
                      className="rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors duration-200 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
                <div className="flex-1 min-w-0">
                  <a 
                    href={`/equipment/${equipmentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-200 truncate">
                      {equipmentName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Click to view equipment details
                    </p>
                  </a>
                </div>
              </div>
            )}
            
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
