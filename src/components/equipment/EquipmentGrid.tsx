import { useEffect, useRef } from "react"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"
import EquipmentCard from "./EquipmentCard"
import LoadingSkeleton from "./LoadingSkeleton"
import EmptyState from "@/components/ui/EmptyState"
import type { Equipment } from "@/src/lib/models/equipment"

interface EquipmentGridProps {
  equipment: Equipment[]
  loading: boolean
  loadingMore: boolean
  hasMore: boolean
  onLoadMore: () => void
  selectedCity?: string | null
  listingType?: string | null
}

export default function EquipmentGrid({ 
  equipment, 
  loading, 
  loadingMore, 
  hasMore, 
  onLoadMore, 
  selectedCity, 
  listingType 
}: EquipmentGridProps) {
  const t = useTranslations("equipment")
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!sentinelRef.current || loading || loadingMore || !hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )

    observer.observe(sentinelRef.current)

    return () => observer.disconnect()
  }, [loading, loadingMore, hasMore, onLoadMore, equipment.length])

  if (loading && equipment.length === 0) {
    return <LoadingSkeleton count={6} type="card" />
  }

  if (!loading && equipment.length === 0) {
    return <EmptyState type="equipment" selectedCity={selectedCity} listingType={listingType} />
  }

  return (
    <>
      <div className="grid grid-cols-1 min-[500px]:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 items-stretch max-w-7xl mx-auto">
        {equipment.map((item) => (
          <EquipmentCard key={item._id?.toString()} equipment={item} />
        ))}
      </div>
      
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-8">
          {loadingMore ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="text-sm font-medium text-gray-600">{t("loadingMore")}</span>
            </div>
          ) : (
            <div className="h-8" />
          )}
        </div>
      )}
    </>
  )
}