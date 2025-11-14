"use client"

import { X, Loader2 } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { useFontClass } from "@/src/hooks/useFontClass"

interface ImagePreviewProps {
  image: { url: string; public_id: string }
  index: number
  isDeleting: boolean
  onView: () => void
  onDelete: () => void
  disabled?: boolean
}

export default function ImagePreview({
  image,
  index,
  isDeleting,
  onView,
  onDelete,
  disabled = false
}: ImagePreviewProps) {
  const t = useTranslations("dashboard.equipment")
  const fontClass = useFontClass()
  const isRTL = fontClass.includes("rtl")

  return (
    <div className="relative group p-3">
      <div className="relative h-32 overflow-hidden rounded-xl border-2 border-gray-200 group-hover:border-primary/30 transition-all duration-200">
        <Image
          src={image.url}
          alt={`Equipment ${index + 1}`}
          fill
          className="object-cover"
        />
        {isDeleting && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onView()
            }}
            className="text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/50 px-3 py-2 rounded cursor-pointer hover:bg-black/70"
          >
            {t("view")}
          </button>
        </div>
      </div>
      
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          onDelete()
        }}
        className={`absolute top-1 ${
          isRTL ? "left-1" : "right-1"
        } bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30`}
        disabled={disabled || isDeleting}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}