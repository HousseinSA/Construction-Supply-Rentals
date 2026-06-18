import { memo } from "react"
import { Equipment } from "@/src/lib/models"
import { ColoredIcon } from "@/src/components/ui/EquipmentImage"
import EquipmentSection from "./EquipmentSection"

interface RelatedEquipmentSectionProps {
  t: (key: string) => string
  equipment: Equipment[]
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

function RelatedEquipmentSection({
  t,
  equipment,
  hasMore,
  loadingMore,
  onLoadMore,
}: RelatedEquipmentSectionProps) {
  return (
    <EquipmentSection
      title={t("moreEquipment")}
      subtitle={t("browseEquipment")}
      icon={<ColoredIcon alt="Equipment" size={24} color="green" />}
      iconBgColor="bg-green-100"
      iconColor="text-green-600"
      equipment={equipment}
      hasMore={hasMore}
      loadingMore={loadingMore}
      onLoadMore={onLoadMore}
      noMoreText={t("noMoreEquipment")}
    />
  )
}

export default memo(RelatedEquipmentSection)
