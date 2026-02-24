"use client"

import { useState, useEffect } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import { useTranslations } from "next-intl"
import { getOptimizedCloudinaryUrl } from "@/src/lib/cloudinary-url"
import { useImagePreload } from "@/src/hooks/useImagePreload"

interface ImageModalProps {
  images: string[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export default function ImageModal({ images, initialIndex = 0, isOpen, onClose }: ImageModalProps) {
  const t = useTranslations("equipmentDetails.imageModal")
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  useImagePreload(images, currentIndex, { width: 1200, height: 800, quality: 'auto:good', format: 'auto' }, isOpen)

  useEffect(() => {
    setCurrentIndex(initialIndex)
  }, [initialIndex])

  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose() }
      else if (e.key === "ArrowLeft") { e.preventDefault(); setCurrentIndex(p => (p - 1 + images.length) % images.length) }
      else if (e.key === "ArrowRight") { e.preventDefault(); setCurrentIndex(p => (p + 1) % images.length) }
    }
    
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, images.length, onClose])

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % images.length)
  const handlePrevious = () => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        aria-label={t("close")}
        type="button"
      >
        <X className="w-6 h-6 text-white" />
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); handlePrevious() }}
            className="absolute left-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label={t("previous")}
            type="button"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleNext() }}
            className="absolute right-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            aria-label={t("next")}
            type="button"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        </>
      )}

      <div 
        className="relative w-full h-full flex items-center justify-center p-4 md:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-w-6xl max-h-[80vh]">
          <Image
            src={getOptimizedCloudinaryUrl(images[currentIndex], {
              width: 1200,
              height: 800,
              quality: 'auto:good',
              format: 'auto'
            })}
            alt={`Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1920px"
          />
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-full px-4">
          <div className="flex gap-2 bg-black/50 rounded-lg p-3 overflow-x-auto max-w-[90vw]">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx) }}
                className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                  currentIndex === idx
                    ? "border-white ring-2 ring-white/50 scale-110"
                    : "border-white/30 hover:border-white/60"
                }`}
                type="button"
              >
                <Image 
                  src={getOptimizedCloudinaryUrl(img, {
                    width: 160,
                    height: 160,
                    quality: 'auto:good',
                    format: 'auto',
                    crop: 'fill'
                  })} 
                  alt={`Thumbnail ${idx + 1}`} 
                  fill 
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {images.length > 1 && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-medium">
          {t("imageCounter", { current: currentIndex + 1, total: images.length })}
        </div>
      )}
    </div>
  )
}
