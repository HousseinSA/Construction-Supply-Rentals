import type { FormData, UploadedImage } from "./validation"

export function hasFormChanges(
  currentFormData: FormData,
  initialFormData: FormData | null,
  currentImages: UploadedImage[],
  initialImages: UploadedImage[],
): boolean {
  if (!initialFormData) return true

  const formChanged = JSON.stringify(currentFormData) !== JSON.stringify(initialFormData)
  const imagesChanged =
    JSON.stringify(currentImages.map((i) => i.url)) !==
    JSON.stringify(initialImages.map((i) => i.url))

  return formChanged || imagesChanged
}
