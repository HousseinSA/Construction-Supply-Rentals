"use client"

import { useRef, ReactNode, RefObject } from "react"
import { useModalClose } from "@/src/hooks/useModalClose"
import ModalHeader from "@/src/components/booking/ModalHeader"
import ReferenceBadge from "./ReferenceBadge"
import Button from "@/src/components/ui/Button"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import { Save, EyeIcon, ExternalLinkIcon } from "lucide-react"

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
  viewDetailsLabel?: string
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
  viewDetailsLabel,
}: BaseDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  useModalClose(isOpen, onClose, modalRef as RefObject<HTMLElement>)

  if (!isOpen) return null

  return (
    <div
      ref={modalRef}
      className="fixed top-0 left-0 right-0 bottom-0 z-50 animate-in fade-in duration-150"
      style={{ height: "100dvh", width: "100vw" }}
    >
      <div className="absolute top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm" style={{ height: "100%", width: "100%" }} />
      <div className="relative h-full flex items-center justify-center p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-200">
          <div className="p-6">
            <ModalHeader title={title} onClose={onClose} />
            <ReferenceBadge
              referenceNumber={referenceNumber}
              label={referenceLabel}
              createdAt={createdAt}
            />

            {equipmentImage && equipmentName && equipmentId && (
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 p-3 sm:p-4 ">
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
                      className="rounded-lg shadow-sm group-hover:shadow-lg transition-shadow duration-200"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 rounded-lg transition-colors duration-200 flex items-center justify-center">
                      <ExternalLinkIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </div>
                  </div>
                </a>
                <div className="flex-1 min-w-0 text-center sm:text-start">
                  <a
                    href={`/equipment/${equipmentId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-primary transition-colors duration-200 line-clamp-2">
                      {equipmentName}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 flex items-center justify-center sm:justify-start gap-1">
                      <EyeIcon className="w-4 h-4" />
                      {viewDetailsLabel}
                    </p>
                  </a>
                </div>
              </div>
            )}

            <div className="space-y-6">{children}</div>

            {onUpdate && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <div className="flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    {closeLabel}
                  </button>
                  <Button
                    onClick={onUpdate}
                    disabled={updateDisabled}
                    className="flex items-center gap-2"
                  >
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
