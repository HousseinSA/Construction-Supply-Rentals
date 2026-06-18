import { memo, useRef, useEffect, ReactNode } from "react"
import { Loader2 } from "lucide-react"
import EquipmentCard from "@/src/components/equipment/EquipmentCard"
import { Equipment } from "@/src/lib/models"
import { transformEquipmentForCard } from "@/src/lib/equipment-transform"

interface EquipmentSectionProps {
  title: string
  subtitle: string
  icon: ReactNode
  iconBgColor: string
  iconColor: string
  equipment: Equipment[]
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
  noMoreText: string
}

function EquipmentSection({
  title,
  subtitle,
  icon,
  iconBgColor,
  iconColor,
  equipment,
  hasMore,
  loadingMore,
  onLoadMore,
  noMoreText,
}: EquipmentSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainer
      const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth

      if (scrollPercentage > 0.8 && hasMore && !loadingMore) {
        onLoadMore()
      }
    }

    scrollContainer.addEventListener("scroll", handleScroll)
    return () => scrollContainer.removeEventListener("scroll", handleScroll)
  }, [hasMore, loadingMore, onLoadMore])

  if (equipment.length === 0) return null

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`${iconBgColor} p-3 rounded-full`}>
          <div className={iconColor}>{icon}</div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600">{subtitle}</p>
        </div>
      </div>

      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4 min-w-max">
            {equipment.map((item) => {
              const equipmentForCard = transformEquipmentForCard(item)
              return (
                <div key={equipmentForCard._id} className="w-72 flex-shrink-0">
                  <EquipmentCard equipment={equipmentForCard} compact />
                </div>
              )
            })}

            {loadingMore && (
              <div className="w-72 flex-shrink-0 flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default memo(EquipmentSection)
