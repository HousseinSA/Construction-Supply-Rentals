import { memo } from "react"
import { Truck } from "lucide-react"
import { Equipment } from "@/src/lib/models"
import EquipmentSection from "./EquipmentSection"

interface TransportEquipmentSectionProps {
  t: (key: string) => string
  equipment: Equipment[]
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

function TransportEquipmentSection({
  t,
  equipment,
  hasMore,
  loadingMore,
  onLoadMore,
}: TransportEquipmentSectionProps) {
  return (
    <EquipmentSection
      title={t("transportTitle")}
      subtitle={t("transportSubtitle")}
      icon={<Truck className="w-6 h-6" />}
      iconBgColor="bg-blue-100"
      iconColor="text-blue-600"
      equipment={equipment}
      hasMore={hasMore}
      loadingMore={loadingMore}
      onLoadMore={onLoadMore}
      noMoreText={t("noMoreEquipment")}
    />
  )
}

export default memo(TransportEquipmentSection)
