"use client"

import { useState } from "react"
import { Camera, X, Upload } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { useFontClass } from "@/src/hooks/useFontClass"
import Button from "./Button"

interface ImageUploadProps {
  images: string[]
  onImagesChange: (images: string[]) => void
  maxImages?: number
  disabled?: boolean
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 5, 
  disabled = false 
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const t = useTranslations("dashboard.equipment")
  const tToast = useTranslations("toast")
  const fontClass = useFontClass()
  const isRTL = fontClass.includes('rtl')

  const handleImageUpload = async (files: FileList) => {
    if (images.length >= maxImages) {
      toast.error(tToast('maxImagesReached', { max: maxImages }))
      return
    }
    
    if (images.length + files.length > maxImages) {
      const allowedCount = maxImages - images.length
      toast.error(tToast('maxImagesExceeded', { 
        allowed: allowedCount, 
        max: maxImages,
        plural: allowedCount > 1 ? 's' : ''
      }))
      return
    }

    setUploading(true)
    const uploadPromises = Array.from(files).map(async (file) => {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      return data.url
    })

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      onImagesChange([...images, ...uploadedUrls])
      toast.success(tToast('imageUploadSuccess', { 
        count: uploadedUrls.length,
        plural: uploadedUrls.length > 1 ? 's' : ''
      }))
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(tToast('imageUploadFailed'))
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index))
    toast.success(tToast('imageRemoved'))
  }

  return (
    <div>
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary transition-colors">
        <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 mb-4">{t("uploadImages")}</p>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          id="image-upload"
          onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
          disabled={uploading || images.length >= maxImages || disabled}
        />
        <button
          type="button"
          onClick={() => document.getElementById('image-upload')?.click()}
          disabled={uploading || images.length >= maxImages || disabled}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? t("uploading") : t("selectImages")}
        </button>
      </div>

      {images.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            {t("imagesUploaded", { count: images.length, max: maxImages })}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative group">
                <div className="relative overflow-hidden rounded-xl border-2 border-gray-200 hover:border-primary/30 transition-all duration-200">
                  <img 
                    src={url} 
                    alt={`Equipment ${index + 1}`}
                    className="w-full h-24 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200" />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className={`absolute -top-2 ${isRTL ? '-left-2' : '-right-2'} bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 transform hover:scale-110`}
                  disabled={disabled}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}