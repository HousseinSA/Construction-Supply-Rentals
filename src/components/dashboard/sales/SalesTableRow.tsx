import { Eye } from "lucide-react"
import Image from "next/image"
import { formatBookingId, formatPhoneNumber } from "@/src/lib/format"
import { formatReferenceNumber } from "@/src/lib/format-reference"
import CopyButton from "@/src/components/ui/CopyButton"
import BookingStatusBadge from "../bookings/BookingStatusBadge"
import { TableRow, TableCell } from "@/src/components/ui/Table"

interface SalesTableRowProps {
  sale: any
  onViewDetails: (sale: any) => void
  t: (key: string) => string
  highlight?: boolean
}

export default function SalesTableRow({ sale, onViewDetails, t, highlight = false }: SalesTableRowProps) {
  return (
    <TableRow className={highlight ? "animate-pulse bg-yellow-50" : ""}>
      <TableCell>
        <div className="font-semibold text-orange-600 text-sm mb-1" dir="ltr">
          {formatReferenceNumber(sale.referenceNumber)}
        </div>
      </TableCell>
      <TableCell>
        <div className="space-y-1.5">
          <div className="font-medium text-gray-900 text-sm">
            {sale.buyerInfo[0]?.firstName} {sale.buyerInfo[0]?.lastName}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700" dir="ltr">
              {formatPhoneNumber(sale.buyerInfo[0]?.phone)}
            </span>
            <CopyButton text={sale.buyerInfo[0]?.phone} size="sm" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="text-sm font-medium text-gray-900">{sale.equipmentName}</div>
      </TableCell>
      <TableCell>
        <span className="text-sm font-semibold text-gray-900" dir="ltr">
          {sale.salePrice.toLocaleString()} MRU
        </span>
      </TableCell>
      <TableCell>
        <span className="text-sm font-semibold text-green-600" dir="ltr">
          {sale.commission.toLocaleString()} MRU
        </span>
      </TableCell>
      <TableCell>
        {sale.supplierInfo && sale.supplierInfo.length > 0 ? (
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-gray-900">
              {sale.supplierInfo[0]?.firstName} {sale.supplierInfo[0]?.lastName}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700" dir="ltr">
                {formatPhoneNumber(sale.supplierInfo[0]?.phone)}
              </span>
              <CopyButton text={sale.supplierInfo[0]?.phone} size="sm" />
            </div>
          </div>
        ) : (
          <span className="text-sm text-gray-400">{t("admin")}</span>
        )}
      </TableCell>
      <TableCell align="center"><BookingStatusBadge status={sale.status} /></TableCell>
      <TableCell align="center">
        <span className="text-sm text-gray-600">
          {new Date(sale.createdAt).toLocaleDateString()}
        </span>
      </TableCell>
      <TableCell align="center">
        <button
          onClick={() => onViewDetails(sale)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title={t("actions.view")}
        >
          <Eye className="w-5 h-5" />
        </button>
      </TableCell>
    </TableRow>
  )
}
