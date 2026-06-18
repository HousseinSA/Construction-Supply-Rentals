import { Equipment } from "@/src/lib/models"

export function transformEquipmentForCard(equipment: Equipment) {
  return {
    ...equipment,
    _id: equipment._id?.toString() || '',
    supplierId: equipment.supplierId?.toString() || undefined
  }
}
