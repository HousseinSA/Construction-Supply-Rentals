"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useDragAndDrop } from "@/src/hooks/useDragAndDrop"
import { useImageUpload } from "@/src/hooks/useImageUpload"
import ImageModal from "./ImageModal"
import ImageDropZone from "./ImageDropZone"
import ImagePreview from "./ImagePreview"

interface UploadedImage {
  url: string
  public_id: string
}
interface ImageUploadProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  disabled?: boolean
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
  disabled = false,
}: ImageUploadProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const t = useTranslations("dashboard.equipment")

  const { uploading, deletingIndex, fileInputRef, handleImageUpload, removeImage } = useImageUpload({
    images,
    onImagesChange,
    maxImages,
    disabled,
  })

  const { isDragging, dragHandlers } = useDragAndDrop({
    onDrop: handleImageUpload,
    disabled: disabled || uploading,
    maxItems: maxImages,
    currentCount: images.length,
  })

  return (
    <div>
      <ImageDropZone
        isDragging={isDragging}
        uploading={uploading}
        disabled={disabled}
        maxImages={maxImages}
        currentCount={images.length}
        onFileSelect={() => fileInputRef.current?.click()}
        dragHandlers={dragHandlers}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
        disabled={uploading || images.length >= maxImages || disabled}
      />

      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {t("imagesUploaded", { count: images.length, max: maxImages })}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <ImagePreview
                key={index}
                image={image}
                index={index}
                isDeleting={deletingIndex === index}
                onView={() => {
                  setSelectedImageIndex(index)
                  setIsModalOpen(true)
                }}
                onDelete={() => removeImage(image.public_id, index)}
                disabled={disabled}
              />
            ))}
          </div>
        </div>
      )}

      <ImageModal
        images={images.map((img) => img.url)}
        initialIndex={selectedImageIndex}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
