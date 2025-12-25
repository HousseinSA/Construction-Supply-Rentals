"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
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
import AdminPricingActions from "@/src/components/equipment-details/AdminPricingActions"

interface EquipmentDetailsViewProps {
  equipmentId: string
}

export default function EquipmentDetailsView({ equipmentId }: EquipmentDetailsViewProps) {
  const t = useTranslations("equipmentDetails")
  const { data: session } = useSession()
  const [equipment, setEquipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdminView, setIsAdminView] = useState(false)
  const fontClass = useFontClass()
  const { convertToLocalized } = useCityData()
  const { formatPrice } = usePriceFormatter()

  const getAllFormattedPrices = (pricing: any, isForSale: boolean) => {
    const prices = []
    if (isForSale && pricing.salePrice) {
      const { displayPrice, displayUnit } = formatPrice(pricing.salePrice, "sale")
      prices.push({ displayPrice, displayUnit })
    } else {
      if (pricing.hourlyRate) {
        const { displayPrice, displayUnit } = formatPrice(pricing.hourlyRate, "hour")
        prices.push({ displayPrice, displayUnit })
      }
      if (pricing.dailyRate) {
        const { displayPrice, displayUnit } = formatPrice(pricing.dailyRate, "day")
        prices.push({ displayPrice, displayUnit })
      }
      if (pricing.kmRate) {
        const { displayPrice, displayUnit } = formatPrice(pricing.kmRate, "km")
        prices.push({ displayPrice, displayUnit })
      }
      if (pricing.tonRate) {
        const { displayPrice, displayUnit } = formatPrice(pricing.tonRate, "ton")
        prices.push({ displayPrice, displayUnit })
      }
    }
    return prices
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

  const allPrices = equipment ? getAllFormattedPrices(equipment.pricing, isForSale) : []

  return (
    <div className={`min-h-screen sm:bg-gray-50 ${fontClass}`}>
      <div className="max-w-7xl mx-auto sm:px-4 lg:px-8 sm:py-4">
        <div className="bg-white sm:rounded-xl sm:shadow-lg overflow-hidden">
          <div className="flex flex-col lg:grid lg:grid-cols-2 gap-0">
            <ImageGallery
              images={equipment.images || []}
              name={equipment.name}
              selectedImage={selectedImage}
              isForSale={isForSale}
              onImageSelect={setSelectedImage}
              onImageClick={() => equipment.images?.length > 0 && setIsModalOpen(true)}
            />  

            <div className="p-4 sm:p-6 lg:p-8 flex flex-col">
              <div className="space-y-4 sm:space-y-5 flex-1">
              <EquipmentHeader name={equipment.name} description={equipment.description} />
              <LocationInfo location={convertToLocalized(equipment.location)} />
              <PricingCard
                prices={allPrices}
                isForSale={isForSale}
              />
              <SpecificationsGrid specifications={equipment.specifications} isForSale={isForSale} />
              </div>
              {isAdminView && equipment.supplierInfo && equipment.createdBy !== "admin" && session?.user?.role === "admin" && (
                <SupplierInfo supplier={equipment.supplierInfo} />
              )}
              {!isAdminView && session?.user?.role === "renter" && equipment.supplierInfo && equipment.createdBy !== "admin" && (
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
