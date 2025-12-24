import Image from "next/image"
import { Tag } from "lucide-react"
import { useTranslations } from "next-intl"
import { getOptimizedCloudinaryUrl, getBlurDataURL } from "@/src/lib/cloudinary-url"

interface ImageGalleryProps {
  images: string[]
  name: string
  selectedImage: number
  isForSale: boolean
  onImageSelect: (index: number) => void
  onImageClick: () => void
}

export default function ImageGallery({
  images,
  name,
  selectedImage,
  isForSale,
  onImageSelect,
  onImageClick,
}: ImageGalleryProps) {
  const t = useTranslations("equipmentDetails")

  return (
    <div className="relative flex flex-col">
      <div className="flex flex-col">
        <div
          className="relative h-[300px] sm:h-[400px] md:h-[450px] lg:h-[500px] xl:h-[600px] cursor-pointer group"
          onClick={onImageClick}
        >
          <Image
            src={
              images[selectedImage]
                ? getOptimizedCloudinaryUrl(images[selectedImage], {
                    width: 1200,
                    height: 900,
                    quality: 'auto:best',
                    format: 'auto',
                    crop: 'limit'
                  })
                : "/equipement-images/default-fallback-image.png"
            }
            alt={name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            className="object-cover"
            priority
            placeholder={images[selectedImage] ? "blur" : "empty"}
            blurDataURL={images[selectedImage] ? getBlurDataURL(images[selectedImage]) : undefined}
          />
          <div className="absolute inset-0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-900">
              {t("clickToViewFullSize")}
            </div>
          </div>
          {isForSale && (
            <div className="absolute top-2 sm:top-4 ltr:right-2 ltr:sm:right-4 rtl:left-2 rtl:sm:left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold shadow-lg flex items-center gap-1.5 sm:gap-2">
              <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
              {t("forSale")}
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="flex gap-1 sm:gap-2 p-2 sm:p-3 overflow-x-auto bg-white flex-shrink-0">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => onImageSelect(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 flex-shrink-0 rounded-md sm:rounded-lg overflow-hidden transition-all bg-white border-2 ${
                  selectedImage === idx
                    ? "border-primary"
                    : "border-transparent hover:border-primary/50"
                }`}
              >
                <Image
                  src={getOptimizedCloudinaryUrl(img, {
                    width: 160,
                    height: 160,
                    quality: 'auto:good',
                    format: 'auto',
                    crop: 'fill'
                  })}
                  alt={`${name} ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
