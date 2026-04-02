import { useTranslations } from "next-intl"
import ImageUpload from "../../ui/ImageUpload"
import { UploadedImage } from "@/src/hooks/equipment/useEquipmentForm"

interface ImageUploadFieldProps {
  images: UploadedImage[]
  onImagesChange: (images: UploadedImage[]) => void
  disabled: boolean
}

export default function ImageUploadField({
  images,
  onImagesChange,
  disabled,
}: ImageUploadFieldProps) {
  const t = useTranslations("dashboard.equipment")

  return (
    <div>
      <label className="block text-sm font-medium text-primary mb-2">
        {t("images")} <span className="text-red-500">*</span>
        <span className="text-sm text-gray-500 ml-2">
          {t("imageConstraints")}
        </span>
      </label>
      <ImageUpload
        images={images}
        onImagesChange={onImagesChange}
        maxImages={10}
        disabled={disabled}
      />
    </div>
  )
}
