import { Coins } from "lucide-react"
import { formatPhoneNumber } from "@/src/lib/format"
import { formatDate } from "@/src/lib/table-utils"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"
import ReferenceNumber from "@/src/components/ui/ReferenceNumber"
import CopyButton from "@/src/components/ui/CopyButton"

interface SalesMobileCardProps {
  sale: any
  onViewDetails: (sale: any) => void
  t: (key: string) => string
  highlight?: boolean
}

export default function SalesMobileCard({ sale, onViewDetails, t, highlight = false }: SalesMobileCardProps) {
  const buyerName = sale.buyerInfo?.[0] 
    ? `${sale.buyerInfo[0].firstName} ${sale.buyerInfo[0].lastName}`
    : "N/A"
  const isAdminOwned = sale.isAdminOwned || (!sale.supplierInfo || sale.supplierInfo.length === 0)
  
  const supplierDisplay = isAdminOwned
    ? t("admin")
    : (
        <div className="space-y-1">
          <div className="text-sm">{sale.supplierInfo[0].firstName} {sale.supplierInfo[0].lastName}</div>
          <div className="flex items-center gap-2">
            <span className="text-sm" dir="ltr">{formatPhoneNumber(sale.supplierInfo[0].phone)}</span>
            <CopyButton text={sale.supplierInfo[0].phone} size="sm" />
          </div>
        </div>
      )

  return (
    <div className={highlight ? "animate-pulse" : ""}>
      <GenericMobileCard
        id={<ReferenceNumber referenceNumber={sale.referenceNumber} size="md" />}
        title={sale.equipmentName}
        subtitle={buyerName}
        date={formatDate(sale.createdAt)}
        status={sale.status}
        fields={[
          {
            label: t("table.supplier"),
            value: supplierDisplay,
          },
          {
            label: t("table.price"),
            value: sale.salePrice,
          },
          {
            label: t("table.commission"),
            value: isAdminOwned ? t("adminOwned") : sale.commission,
            icon: !isAdminOwned ? <Coins className="w-3.5 h-3.5 text-green-600" /> : undefined,
            highlight: !isAdminOwned,
          },
        ]}
        onViewDetails={() => onViewDetails(sale)}
        viewButtonText={t("actions.view")}
      />
    </div>
  )
}
