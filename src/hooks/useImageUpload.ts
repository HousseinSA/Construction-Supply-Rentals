import { useState, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"

interface UploadedImage {
  url: string
  public_id: string
}

interface UseImageUploadProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  maxImages: number
  disabled: boolean
}

export function useImageUpload({
  images,
  onImagesChange,
  maxImages,
  disabled,
}: UseImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const tToast = useTranslations("toast")

  const handleImageUpload = async (files: FileList) => {
    if (images.length >= maxImages) {
      toast.error(tToast("maxImagesReached", { max: maxImages }))
      return
    }

    if (images.length + files.length > maxImages) {
      const allowedCount = maxImages - images.length
      toast.error(
        tToast("maxImagesExceeded", {
          allowed: allowedCount,
          max: maxImages,
          plural: allowedCount > 1 ? "s" : "",
        })
      )
      return
    }

    const maxSize = 10 * 1024 * 1024
    const validFiles: File[] = []
    
    for (const file of Array.from(files)) {
      if (file.size > maxSize) {
        toast.error(tToast("imageTooLarge"))
        continue
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error(tToast("invalidFileType"))
        continue
      }
      
      validFiles.push(file)
    }

    if (validFiles.length === 0) return

    setUploading(true)
    const uploadPromises = validFiles.map(async (file) => {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")
      const data = await response.json()
      return { url: data.url, public_id: data.public_id }
    })

    try {
      const uploadedUrls = await Promise.all(uploadPromises)
      onImagesChange([...images, ...uploadedUrls])
    } catch (error) {
      console.error("Upload error:", error)
      toast.error(tToast("imageUploadFailed"))
    } finally {
      setUploading(false)
    }
  }

  const removeImage = async (publicId: string, index: number) => {
    setDeletingIndex(index)
    try {
      const res = await fetch("/api/upload", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      })

      if (!res.ok) throw new Error("Failed to delete image")
      onImagesChange(images.filter((_, i) => i !== index))
    } catch (error) {
      console.error("Delete error:", error)
      toast.error(tToast("imageDeleteFailed"))
    } finally {
      setDeletingIndex(null)
    }
  }

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (disabled || uploading || images.length >= maxImages) return

      const items = e.clipboardData?.items
      if (!items) return

      const imageFiles: File[] = []
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile()
          if (file) imageFiles.push(file)
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault()
        const dataTransfer = new DataTransfer()
        imageFiles.forEach((file) => dataTransfer.items.add(file))
        handleImageUpload(dataTransfer.files)
      }
    }

    document.addEventListener("paste", handlePaste)
    return () => document.removeEventListener("paste", handlePaste)
  }, [disabled, uploading, images.length, maxImages])

  return {
    uploading,
    deletingIndex,
    fileInputRef,
    handleImageUpload,
    removeImage,
  }
}
