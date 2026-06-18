import { memo } from "react"
import { TrendingUp } from "lucide-react"
import { Equipment } from "@/src/lib/models"
import EquipmentSection from "./EquipmentSection"

interface PopularEquipmentSectionProps {
  t: (key: string) => string
  equipment: Equipment[]
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

function PopularEquipmentSection({
  t,
  equipment,
  hasMore,
  loadingMore,
  onLoadMore,
}: PopularEquipmentSectionProps) {
  return (
    <EquipmentSection
      title={t("popularTitle")}
      subtitle={t("popularSubtitle")}
      icon={<TrendingUp className="w-6 h-6" />}
      iconBgColor="bg-orange-100"
      iconColor="text-orange-600"
      equipment={equipment}
      hasMore={hasMore}
      loadingMore={loadingMore}
      onLoadMore={onLoadMore}
      noMoreText={t("noMoreEquipment")}
    />
  )
}

export default memo(PopularEquipmentSection)
