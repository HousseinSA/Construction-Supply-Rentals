import Image from "next/image"
import { Loader2 } from "lucide-react"
import { useState } from "react"

interface EquipmentImageProps {
  src: string | string[]
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  onClick?: () => void
  className?: string
  cover?: boolean
}

export default function EquipmentImage({ src, alt, size = "md", onClick, className, cover = false }: EquipmentImageProps) {
  const imageSrc = Array.isArray(src) ? src[0] : src
  const fallback = "/equipement-images/default-fallback-image.png"
  const [loading, setLoading] = useState(true)

  const sizes = {
    sm: { width: 64, height: 56, class: "w-16 h-14" },
    md: { width: 80, height: 64, class: "w-20 h-16" },
    lg: { width: 96, height: 80, class: "w-24 h-20" },
    xl: { width: 200, height: 150, class: "w-50 h-38" },
  }

  const { width, height, class: sizeClass } = sizes[size]

  if (cover) {
    return (
      <div className="relative w-full h-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        )}
        <Image
          src={imageSrc || fallback}
          alt={alt}
          fill
          className={`object-cover ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""} ${className || ""}`}
          onClick={onClick}
          onLoad={() => setLoading(false)}
        />
      </div>
    )
  }

  return imageSrc ? (
    <Image
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      className={`${sizeClass} object-scale-down rounded-lg shadow-sm ${onClick ? "cursor-pointer hover:opacity-80 transition-opacity" : ""} ${className || ""}`}
      onClick={onClick}
    />
  ) : (
    <div className={`${sizeClass} bg-gray-200 rounded-lg flex items-center justify-center ${className || ""}`}>
      <span className="text-gray-400 text-xs">No image</span>
    </div>
  )
}
