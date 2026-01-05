import Image from "next/image"

interface EquipmentImageProps {
  src: string | string[]
  alt: string
  size?: "sm" | "md" | "lg"
  onClick?: () => void
  className?: string
}

export default function EquipmentImage({ src, alt, size = "md", onClick, className }: EquipmentImageProps) {
  const imageSrc = Array.isArray(src) ? src[0] : src
  const fallback = "/equipement-images/default-fallback-image.png"

  const sizes = {
    sm: { width: 64, height: 56, class: "w-16 h-14" },
    md: { width: 80, height: 64, class: "w-20 h-16" },
    lg: { width: 96, height: 80, class: "w-24 h-20" },
  }

  const { width, height, class: sizeClass } = sizes[size]

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
