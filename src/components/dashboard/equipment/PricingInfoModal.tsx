"use client"

import { X } from "lucide-react"
import { useTranslations } from "next-intl"
import { useEffect } from "react"
import { Equipment } from "@/src/lib/models/equipment"
import PricingUpdateTooltip from "./PricingUpdateTooltip"

interface PricingInfoModalProps {
  isOpen: boolean
  onClose: () => void
  item: Equipment
  isSupplier: boolean
}

export default function PricingInfoModal({
  isOpen,
  onClose,
  item,
  isSupplier,
}: PricingInfoModalProps) {
  const t = useTranslations("dashboard.equipment")
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (isOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t("pricingInformation")}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="text-sm text-gray-700">
          <PricingUpdateTooltip item={item} isSupplier={isSupplier} />
        </div>
      </div>
    </div>
  )
}
