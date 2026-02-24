import { useEffect, useMemo } from "react"
import { getOptimizedCloudinaryUrl } from "@/src/lib/cloudinary-url"

type CloudinaryOptions = Parameters<typeof getOptimizedCloudinaryUrl>[1]

export function useImagePreload(
  images: string[],
  currentIndex: number,
  options: CloudinaryOptions,
  enabled: boolean = true
) {
  const preloadUrls = useMemo(() => {
    if (!enabled || images.length <= 1) return []
    const nextIdx = (currentIndex + 1) % images.length
    const prevIdx = (currentIndex - 1 + images.length) % images.length
    return [
      getOptimizedCloudinaryUrl(images[nextIdx], options),
      getOptimizedCloudinaryUrl(images[prevIdx], options)
    ]
  }, [currentIndex, images, options, enabled])

  useEffect(() => {
    preloadUrls.forEach(url => { new window.Image().src = url })
  }, [preloadUrls])
}
