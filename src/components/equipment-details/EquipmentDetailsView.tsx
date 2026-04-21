"use client"

import { useEquipmentDetails } from "@/src/hooks/equipment/useEquipmentDetails"
import ImageModal from "@/src/components/ui/ImageModal"
import ImageGallery from "@/src/components/equipment-details/ImageGallery"
import EquipmentHeader from "@/src/components/equipment-details/EquipmentHeader"
import LocationInfo from "@/src/components/equipment-details/LocationInfo"
import PricingCard from "@/src/components/equipment-details/PricingCard"
import SpecificationsGrid from "@/src/components/equipment-details/SpecificationsGrid"
import ActionButtons from "@/src/components/equipment-details/ActionButtons"
import SupplierInfo from "@/src/components/equipment-details/SupplierInfo"
import LoadingState from "@/src/components/ui/PageLoading"
import ErrorState from "@/src/components/ui/ErrorState"
import NotFoundState from "@/src/components/equipment-details/NotFoundState"

interface EquipmentDetailsViewProps {
  equipmentId: string
}

export default function EquipmentDetailsView({
  equipmentId,
}: EquipmentDetailsViewProps) {
  const {
    equipment,
    loading,
    error,
    selectedImage,
    setSelectedImage,
    isModalOpen,
    setIsModalOpen,
    isAdminView,
    fontClass,
    convertToLocalized,
    isForSale,
    allPrices,
    handleBookingSuccess,
    fetchEquipment,
    session,
  } = useEquipmentDetails({ equipmentId })

  if (loading) return <LoadingState />
  if (error) return <ErrorState onRetry={fetchEquipment} />
  if (!equipment) return <NotFoundState />

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
              onImageClick={() =>
                equipment.images?.length > 0 && setIsModalOpen(true)
              }
            />

            <div className="p-4 sm:p-6 lg:p-8 flex flex-col">
              <div className="space-y-4 sm:space-y-5 flex-1">
                <EquipmentHeader
                  name={equipment.name}
                  description={equipment.description}
                />
                <LocationInfo
                  location={convertToLocalized(equipment.location)}
                />
                <PricingCard prices={allPrices} isForSale={isForSale} />
                <SpecificationsGrid
                  specifications={equipment.specifications}
                  isForSale={isForSale}
                />
              </div>
              {isAdminView &&
                equipment.supplierInfo &&
                equipment.createdBy !== "admin" &&
                session?.user?.role === "admin" && (
                  <SupplierInfo supplier={equipment.supplierInfo} />
                )}
              {!isAdminView &&
                session?.user?.role === "renter" &&
                equipment.supplierInfo &&
                equipment.createdBy !== "admin" && (
                  <SupplierInfo supplier={equipment.supplierInfo} />
                )}
              <ActionButtons
                isForSale={isForSale}
                equipment={equipment}
                onBookingSuccess={handleBookingSuccess}
              />
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
