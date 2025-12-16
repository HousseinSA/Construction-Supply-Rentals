import { Package, ExternalLink } from 'lucide-react'
import { Link } from '@/src/i18n/navigation'

interface EquipmentItemsProps {
  items: Array<{
    equipmentId: any
    equipmentName: string
    usage: number
    usageUnit?: string
    pricingType?: string
    rate: number
    subtotal: number
  }>
  calculateCommission: (subtotal: number, usage: number, pricingType?: string) => number
  getUsageLabel: (unit: string) => string
  labels: {
    title: string
    usage: string
    rate: string
    commission: string
    subtotal: string
  }
}

export default function EquipmentItems({ items, calculateCommission, getUsageLabel, labels }: EquipmentItemsProps) {
  return (
    <div className="bg-green-50 rounded-lg p-4 h-[200px] flex flex-col">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Package className="w-5 h-5 text-green-600" />
        {labels.title}
      </h3>
      <div className="space-y-3 flex-1">
        {items.map((item, index) => (
          <div key={index}>
            <div className="font-medium text-base mb-2 flex items-center gap-2">
              <span>{item.equipmentName}</span>
              {item.equipmentId && (
                <Link 
                  href={`/equipment/${item.equipmentId.toString()}?admin=true`}
                  target="_blank"
                  className="text-primary hover:text-primary/80 transition-colors"
                  title="View equipment details"
                >
                  <ExternalLink className="w-4 h-4" />
                </Link>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{item.usage} {getUsageLabel(item.usageUnit || 'hours')}</span>
                <span className="font-medium" dir="ltr">{item.rate.toLocaleString()} MRU</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{labels.commission}:</span>
                <span className="font-medium text-green-600" dir="ltr">
                  {calculateCommission(item.subtotal, item.usage, item.pricingType).toLocaleString()} MRU
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{labels.subtotal}:</span>
                <span className="font-medium" dir="ltr">{item.subtotal.toLocaleString()} MRU</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
