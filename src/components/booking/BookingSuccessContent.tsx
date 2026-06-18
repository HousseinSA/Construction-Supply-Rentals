import { memo } from "react"
import { Equipment } from "@/src/lib/models"
import SuccessHeader from "./SuccessHeader"
import RelatedEquipmentSection from "./RelatedEquipmentSection"
import TransportEquipmentSection from "./TransportEquipmentSection"
import ActionLinks from "./ActionLinks"

interface BookingSuccessContentProps {
  t: (key: string) => string
  type: string
  mainLoading: boolean
  mainEquipment: Equipment | null
  equipmentName: string | null
  needsTransport: boolean
  
  relatedEquipment: Equipment[]
  relatedHasMore: boolean
  relatedLoadingMore: boolean
  onLoadMoreRelated: () => void
  
  transportEquipment: Equipment[]
  transportHasMore: boolean
  transportLoadingMore: boolean
  onLoadMoreTransport: () => void
}

function BookingSuccessContent({
  t,
  type,
  mainLoading,
  mainEquipment,
  equipmentName,
  needsTransport,
  relatedEquipment,
  relatedHasMore,
  relatedLoadingMore,
  onLoadMoreRelated,
  transportEquipment,
  transportHasMore,
  transportLoadingMore,
  onLoadMoreTransport,
}: BookingSuccessContentProps) {
  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <SuccessHeader
          t={t}
          type={type}
          mainLoading={mainLoading}
          mainEquipment={mainEquipment}
          equipmentName={equipmentName}
        />

        <RelatedEquipmentSection
          t={t}
          equipment={relatedEquipment}
          hasMore={relatedHasMore}
          loadingMore={relatedLoadingMore}
          onLoadMore={onLoadMoreRelated}
        />

        {needsTransport && (
          <TransportEquipmentSection
            t={t}
            equipment={transportEquipment}
            hasMore={transportHasMore}
            loadingMore={transportLoadingMore}
            onLoadMore={onLoadMoreTransport}
          />
        )}

        <ActionLinks t={t} />
      </div>
    </div>
  )
}

export default memo(BookingSuccessContent)
