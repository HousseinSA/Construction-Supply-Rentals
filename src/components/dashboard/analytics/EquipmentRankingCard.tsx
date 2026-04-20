import { TopEquipment } from "@/src/lib/types"
import { COMMISSION_COLORS } from "@/src/lib/constants/commission"

interface EquipmentRankingCardProps {
  title: string
  equipment: TopEquipment[]
  colorScheme: 'booking' | 'sale'
  emptyMessage: string
}

export default function EquipmentRankingCard({
  title,
  equipment,
  colorScheme,
  emptyMessage
}: EquipmentRankingCardProps) {
  const colors = COMMISSION_COLORS[colorScheme]
  const bgColor = colorScheme === 'booking' ? 'bg-blue-50' : 'bg-green-50'
  const hoverColor = colorScheme === 'booking' ? 'hover:bg-blue-100' : 'hover:bg-green-100'
  const badgeBg = colorScheme === 'booking' ? 'bg-blue-600' : 'bg-green-600'

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      {equipment.length > 0 ? (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {equipment.map((item, index) => (
            <div
              key={item.equipmentId}
              className={`flex items-center justify-between p-3 ${bgColor} rounded-lg ${hoverColor} transition-colors`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-10 h-10 ${badgeBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <span className="text-sm font-bold text-white">#{index + 1}</span>
                </div>
                <span className="text-sm font-medium text-gray-900 truncate">
                  {item.equipmentName}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={`text-2xl font-bold ${colors.text}`}>{item.count}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-8">{emptyMessage}</p>
      )}
    </div>
  )
}
