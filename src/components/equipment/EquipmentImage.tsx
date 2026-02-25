"use client"

import Image from "next/image"
import { Tag } from "lucide-react"
import { getEquipmentImage } from "@/src/lib/equipment-images"
import { getOptimizedCloudinaryUrl, getBlurDataURL } from "@/src/lib/cloudinary-url"

interface EquipmentImageProps {
  images?: string[]
  name: string
  isOwnEquipment: boolean
  isForSale: boolean
  yourEquipmentLabel: string
  forSaleLabel: string
  onClick: () => void
}

export default function EquipmentImage({
  images,
  name,
  isOwnEquipment,
  isForSale,
  yourEquipmentLabel,
  forSaleLabel,
  onClick,
}: EquipmentImageProps) {
  return (
    <div
      className="relative w-full aspect-[3/2] bg-gray-50 rounded-t-2xl overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <Image
        src={
          images?.length
            ? getOptimizedCloudinaryUrl(images[0], {
                width: 600,
                height: 400,
                quality: 'auto:good',
                format: 'auto',
                crop: 'fill'
              })
            : getEquipmentImage(name)
        }
        alt={name}
        fill
        sizes="(max-width: 500px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        placeholder={images?.length ? "blur" : "empty"}
        blurDataURL={images?.length ? getBlurDataURL(images[0]) : undefined}
        loading="lazy"
      />
      {isOwnEquipment && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
          {yourEquipmentLabel}
        </div>
      )}
      {!isOwnEquipment && isForSale && (
        <div className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
          <Tag className="w-3 h-3" />
          {forSaleLabel}
        </div>
      )}
    </div>
  )
}
