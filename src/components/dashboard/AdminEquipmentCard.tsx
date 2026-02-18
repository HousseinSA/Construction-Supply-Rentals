"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/src/i18n/navigation"
import { useCityData } from "@/src/hooks/useCityData"
import Button from "../ui/Button"
import { showToast } from "@/src/lib/toast"
import Image from "next/image"
import { getOptimizedCloudinaryUrl, getBlurDataURL } from "@/src/lib/cloudinary-url"

interface EquipmentCardProps {
  equipment: {
    _id: string
    referenceNumber?: string
    name: string
    description: string
    location: string
    images: string[]
    pricing: {
      type: string
      hourlyRate?: number
      dailyRate?: number
      kmRate?: number
      salePrice?: number
    }
    specifications?: {
      condition?: string
      brand?: string
      model?: string
      hoursUsed?: number
      weight?: number
      weightUnit?: string
    }
    status: "pending" | "approved" | "rejected"
    isAvailable: boolean
    listingType: "forSale" | "forRent"
    createdBy: "admin" | "supplier"
    hasActiveBookings?: boolean
    supplier?: {
      firstName: string
      lastName: string
      email: string
      phone: string
      companyName?: string
      location?: string
    }
  }
}

export default function AdminEquipmentCard({ equipment }: EquipmentCardProps) {
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { convertToLocalized } = useCityData()
  const [isAvailable, setIsAvailable] = useState(equipment.isAvailable)
  const [status, setStatus] = useState(equipment.status)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState<{
    type: "availability" | "status"
    value: boolean | string
  } | null>(null)

  const isAdminCreated = equipment.createdBy === "admin"

  const handleEdit = () => {
    router.push(`/dashboard/equipment/edit/${equipment._id}`)
  }

  const handleAvailabilityChange = async (newValue: boolean) => {
    setShowConfirm({ type: "availability", value: newValue })
  }

  const handleStatusChange = async (newStatus: "approved" | "rejected") => {
    setShowConfirm({ type: "status", value: newStatus })
  }

  const confirmAction = async () => {
    if (!showConfirm) return

    setLoading(true)
    try {
      const response = await fetch(`/api/equipment/${equipment._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          showConfirm.type === "availability"
            ? { isAvailable: showConfirm.value }
            : { status: showConfirm.value }
        ),
      })

      if (!response.ok) throw new Error()

      if (showConfirm.type === "availability") {
        setIsAvailable(showConfirm.value as boolean)
        showToast.success(t("availabilityUpdated"))
      } else {
        setStatus(showConfirm.value as "approved" | "rejected")
        showToast.success(
          showConfirm.value === "approved"
            ? t("equipmentApproved")
            : t("equipmentRejected")
        )
      }
    } catch (error) {
      showToast.error(t("equipmentUpdateFailed"))
    } finally {
      setLoading(false)
      setShowConfirm(null)
    }
  }

  const getPriceDisplay = () => {
    const { pricing } = equipment
    if (equipment.listingType === "forSale" && pricing.salePrice) {
      return `${pricing.salePrice.toLocaleString()} ${tCommon("currency")}`
    }
    if (pricing.hourlyRate)
      return `${pricing.hourlyRate} ${tCommon("currency")}/${tCommon("hour")}`
    if (pricing.dailyRate)
      return `${pricing.dailyRate} ${tCommon("currency")}/${tCommon("day")}`
    if (pricing.kmRate)
      return `${pricing.kmRate} ${tCommon("currency")}/${tCommon("km")}`
    return "N/A"
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-56 bg-gray-200">
          <Image
            src={
              equipment.images[0]
                ? getOptimizedCloudinaryUrl(equipment.images[0], {
                    width: 600,
                    height: 400,
                    quality: 'auto:good',
                    format: 'auto',
                    crop: 'fill'
                  })
                : "/equipement-images/default-fallback-image.png"
            }
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            alt={equipment.name}
            className="object-cover"
            placeholder={equipment.images[0] ? "blur" : "empty"}
            blurDataURL={equipment.images[0] ? getBlurDataURL(equipment.images[0]) : undefined}
            loading="lazy"
          />
          {isAdminCreated && (
            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
              {t("createdByAdmin")}
            </span>
          )}
          <span
            className={`absolute top-2 right-2 text-white text-xs px-2 py-1 rounded ${
              status === "approved"
                ? "bg-green-600"
                : status === "pending"
                ? "bg-yellow-600"
                : "bg-red-600"
            }`}
          >
            {t(status)}
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-1">
            {equipment.referenceNumber && (
              <span className="text-sm text-gray-500 font-normal mr-2">#{equipment.referenceNumber}</span>
            )}
            {equipment.name}
          </h3>
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
            {equipment.description}
          </p>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">{t("location")}:</span>
              <span className="font-medium">{convertToLocalized(equipment.location)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">{t("price")}:</span>
              <span className="font-medium">{getPriceDisplay()}</span>
            </div>
            {equipment.specifications?.brand && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t("brand")}:</span>
                <span className="font-medium">
                  {equipment.specifications.brand}
                </span>
              </div>
            )}
            {equipment.specifications?.condition && (
              <div className="flex justify-between">
                <span className="text-gray-600">{t("condition")}:</span>
                <span className="font-medium capitalize">
                  {equipment.specifications.condition}
                </span>
              </div>
            )}
          </div>

          {!isAdminCreated && equipment.supplier && (
            <div className="border-t pt-3 mb-4">
              <h4 className="text-sm font-semibold mb-2 text-gray-700">
                {t("supplierInfo")}
              </h4>
              <div className="space-y-1 text-xs text-gray-600">
                <p>
                  <span className="font-medium">{t("name")}:</span>{" "}
                  {equipment.supplier.firstName} {equipment.supplier.lastName}
                </p>
                <p>
                  <span className="font-medium">{t("email")}:</span>{" "}
                  {equipment.supplier.email}
                </p>
                <p>
                  <span className="font-medium">{t("phone")}:</span>{" "}
                  {equipment.supplier.phone}
                </p>
                {equipment.supplier.companyName && (
                  <p>
                    <span className="font-medium">{t("company")}:</span>{" "}
                    {equipment.supplier.companyName}
                  </p>
                )}
                {equipment.supplier.location && (
                  <p>
                    <span className="font-medium">{t("location")}:</span>{" "}
                    {equipment.supplier.location}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {isAdminCreated && (
              <>
                <div className="relative group">
                  <Button
                    variant="primary"
                    size="card"
                    className="w-full"
                    onClick={handleEdit}
                    disabled={equipment.hasActiveBookings}
                  >
                    {t("editEquipment")}
                  </Button>
                  {equipment.hasActiveBookings && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {t("cannotEditActiveBooking")}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-700">
                    {t("availability")}:
                  </span>
                  <select
                    value={isAvailable ? "available" : "unavailable"}
                    onChange={(e) =>
                      handleAvailabilityChange(e.target.value === "available")
                    }
                    className="text-sm border rounded px-2 py-1"
                    disabled={loading}
                  >
                    <option value="available">{t("available")}</option>
                    <option value="unavailable">{t("unavailable")}</option>
                  </select>
                </div>
              </>
            )}

            {!isAdminCreated && (
              <>
                {status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="card"
                      className="flex-1"
                      onClick={() => handleStatusChange("approved")}
                      disabled={loading}
                    >
                      {t("approve")}
                    </Button>
                    <Button
                      variant="warning"
                      size="card"
                      className="flex-1"
                      onClick={() => handleStatusChange("rejected")}
                      disabled={loading}
                    >
                      {t("reject")}
                    </Button>
                  </div>
                )}
                {status === "approved" && (
                  <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700">
                      {t("availability")}:
                    </span>
                    <select
                      value={isAvailable ? "available" : "unavailable"}
                      onChange={(e) =>
                        handleAvailabilityChange(e.target.value === "available")
                      }
                      className="text-sm border rounded px-2 py-1"
                      disabled={loading}
                    >
                      <option value="available">{t("available")}</option>
                      <option value="unavailable">{t("unavailable")}</option>
                    </select>
                  </div>
                )}
              </>
            )}

            <Button
              variant="card-secondary"
              size="card"
              className="w-full"
              onClick={() => router.push(`/equipment/${equipment._id}`)}
            >
              {t("view")} Details
            </Button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">{t("confirmAction")}</h3>
            <p className="text-gray-600 mb-6">
              {showConfirm.type === "availability"
                ? t("confirmAvailability", {
                    status: showConfirm.value
                      ? t("available")
                      : t("unavailable"),
                  })
                : t("confirmStatus", { action: showConfirm.value })}
            </p>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setShowConfirm(null)}
                disabled={loading}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={confirmAction}
                disabled={loading}
              >
                {loading ? t("processing") : t("confirm")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
