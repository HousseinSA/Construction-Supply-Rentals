import { Eye } from "lucide-react"
import { formatBookingId } from "@/src/lib/format"
import BookingStatusBadge from "../bookings/BookingStatusBadge"

interface SalesMobileCardProps {
  sale: any
  onViewDetails: (sale: any) => void
  t: (key: string) => string
}

export default function SalesMobileCard({ sale, onViewDetails, t }: SalesMobileCardProps) {
  return (
    <div className="p-4 space-y-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="text-sm font-semibold text-gray-900 mb-1">
            {formatBookingId(sale._id)}
          </div>
          <div className="text-sm font-medium text-gray-700">{sale.equipmentName}</div>
          <div className="text-xs text-gray-500 mt-0.5">
            {new Date(sale.createdAt).toLocaleDateString()}
          </div>
        </div>
        <BookingStatusBadge status={sale.status} />
      </div>

      <div className="space-y-3 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <div>
            <div className="text-xs text-gray-500">{t("table.price")}</div>
            <div className="font-semibold text-gray-900" dir="ltr">{sale.salePrice.toLocaleString()} MRU</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">{t("table.commission")}</div>
            <div className="font-semibold text-green-600" dir="ltr">{sale.commission.toLocaleString()} MRU</div>
          </div>
        </div>
        <button
          onClick={() => onViewDetails(sale)}
          className="w-full px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm flex items-center justify-center gap-1.5"
        >
          <Eye className="w-4 h-4" />
          {t("actions.view")}
        </button>
      </div>
    </div>
  )
}
