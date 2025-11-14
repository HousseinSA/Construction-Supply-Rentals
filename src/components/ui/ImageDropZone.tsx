"use client"

import { Camera, Upload } from "lucide-react"
import { useTranslations } from "next-intl"
import Button from "./Button"

interface ImageDropZoneProps {
  isDragging: boolean
  uploading: boolean
  disabled: boolean
  maxImages: number
  currentCount: number
  onFileSelect: () => void
  dragHandlers: any
}

export default function ImageDropZone({
  isDragging,
  uploading,
  disabled,
  maxImages,
  currentCount,
  onFileSelect,
  dragHandlers
}: ImageDropZoneProps) {
  const t = useTranslations("dashboard.equipment")

  return (
    <div
      {...dragHandlers}
      onClick={() => !disabled && !uploading && currentCount < maxImages && onFileSelect()}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
        isDragging
          ? "border-primary bg-primary/10 scale-[1.02]"
          : "border-gray-300 hover:border-primary hover:bg-gray-50"
      } ${
        disabled || uploading || currentCount >= maxImages
          ? "opacity-50 cursor-not-allowed"
          : ""
      }`}
    >
      {isDragging ? (
        <>
          <Upload className="h-12 w-12 text-primary mx-auto mb-4 animate-bounce" />
          <p className="text-primary font-medium">{t("dropHere")}</p>
        </>
      ) : (
        <>
          <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t("uploadImages")}</p>
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onFileSelect()
            }}
            disabled={uploading || currentCount >= maxImages || disabled}
            variant="primary"
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? t("uploading") : t("selectImages")}
          </Button>
          <p className="text-xs text-gray-400 mt-3">{t("uploadHint")}</p>
        </>
      )}
    </div>
  )
}