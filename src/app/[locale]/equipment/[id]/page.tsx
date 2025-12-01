"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useCityData } from "@/src/hooks/useCityData"
import ImageModal from "@/src/components/ui/ImageModal"
import ImageGallery from "@/src/components/equipment-details/ImageGallery"
import EquipmentHeader from "@/src/components/equipment-details/EquipmentHeader"
import LocationInfo from "@/src/components/equipment-details/LocationInfo"
import PricingCard from "@/src/components/equipment-details/PricingCard"
import SpecificationsGrid from "@/src/components/equipment-details/SpecificationsGrid"
import ActionButtons from "@/src/components/equipment-details/ActionButtons"
import LoadingState from "@/src/components/equipment-details/LoadingState"
import NotFoundState from "@/src/components/equipment-details/NotFoundState"
import SupplierInfo from "@/src/components/equipment-details/SupplierInfo"

export default function EquipmentDetailsPage() {
  const params = useParams()
  const t = useTranslations("equipmentDetails")
  const [equipment, setEquipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdminView, setIsAdminView] = useState(false)
  const equipmentId = params.id as string
  const fontClass = useFontClass()
  const { convertToLocalized } = useCityData()
  const { getPriceData, formatPrice } = usePriceFormatter()

  const getFormattedPrice = (pricing: any, isForSale: boolean) => {
    const { rate, unit } = getPriceData(pricing, isForSale)
    const { displayPrice, displayUnit } = formatPrice(rate, unit)
    return { displayPrice, displayUnit }
  }

  const isForSale = equipment?.listingType === "forSale"

  const fetchEquipment = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search)
      const isAdmin = urlParams.get('admin') === 'true'
      setIsAdminView(isAdmin)
      const apiUrl = `/api/equipment/${equipmentId}${isAdmin ? '?admin=true' : ''}`
      const response = await fetch(apiUrl)
      const data = await response.json()
      if (data.success) {
        setEquipment(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch equipment:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEquipment()
  }, [equipmentId])
  
  const handleBookingSuccess = () => {
    fetchEquipment()
  }

  if (loading) return <LoadingState />
  if (!equipment) return <NotFoundState />

  const { displayPrice, displayUnit } = equipment
    ? getFormattedPrice(equipment.pricing, isForSale)
    : { displayPrice: "", displayUnit: "" }

  return (
    <div className={`min-h-screen bg-gray-50 ${fontClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg sm:rounded-xl lg:rounded-2xl shadow-lg overflow-hidden">
          <div className="grid lg:grid-cols-2 gap-0">
            <ImageGallery
              images={equipment.images || []}
              name={equipment.name}
              selectedImage={selectedImage}
              isForSale={isForSale}
              onImageSelect={setSelectedImage}
              onImageClick={() => equipment.images?.length > 0 && setIsModalOpen(true)}
            />

            <div className="p-4 sm:p-6 lg:p-8 flex flex-col">
              <EquipmentHeader name={equipment.name} description={equipment.description} />
              <LocationInfo location={convertToLocalized(equipment.location)} />
              <PricingCard
                displayPrice={displayPrice}
                displayUnit={displayUnit}
                isForSale={isForSale}
              />
              <SpecificationsGrid specifications={equipment.specifications} isForSale={isForSale} />
              {isAdminView && equipment.supplierInfo && (
                <SupplierInfo supplier={equipment.supplierInfo} />
              )}
              {!isAdminView && (
                <ActionButtons 
                  isForSale={isForSale} 
                  equipment={equipment} 
                  onBookingSuccess={handleBookingSuccess}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {equipment.images && equipment.images.length > 0 && (
        <ImageModal
          images={equipment.images}
          initialIndex={selectedImage}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  )
}
