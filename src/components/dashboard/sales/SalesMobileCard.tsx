import { Coins } from "lucide-react"
import { formatDate } from "@/src/lib/table-utils"
import { SaleWithDetails } from "@/src/stores/salesStore"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"
import ReferenceNumber from "@/src/components/ui/ReferenceNumber"
import PriceDisplay from "@/src/components/ui/PriceDisplay"

interface SalesMobileCardProps {
  sale: SaleWithDetails
  onViewDetails: (sale: SaleWithDetails) => void
  t: (key: string) => string
  highlight?: boolean
  isAdminView?: boolean
}

export default function SalesMobileCard({ sale, onViewDetails, t, highlight = false, isAdminView = true }: SalesMobileCardProps) {
  const buyerName = sale.buyerInfo?.[0] 
    ? `${sale.buyerInfo[0].firstName} ${sale.buyerInfo[0].lastName}`
    : "N/A"
  const buyerPhone = sale.buyerInfo?.[0]?.phone
  const isAdminOwned = sale.isAdminOwned || (!sale.supplierInfo || sale.supplierInfo.length === 0)
  
  const supplierName = isAdminOwned
    ? t("admin")
    : sale.supplierInfo?.[0] ? `${sale.supplierInfo[0].firstName} ${sale.supplierInfo[0].lastName}` : "N/A"
  const supplierPhone = !isAdminOwned && sale.supplierInfo?.[0]?.phone ? sale.supplierInfo[0].phone : undefined

  return (
    <div className={highlight ? "animate-pulse" : ""}>
      <GenericMobileCard
        id={ 
          <ReferenceNumber referenceNumber={sale.referenceNumber} size="md" />
        }
        title={sale.equipmentName}
        subtitle={buyerName}
        phoneNumber={buyerPhone}
        supplierNumber={supplierPhone}
        supplierName={supplierName}
        date={formatDate(sale.createdAt)}
        status={sale.status}
        isAdminView={isAdminView}
        fields={[
          {
            label: t("table.price"),
            value: <PriceDisplay amount={sale.salePrice} />,
          },
          {
            label: t("table.commission"),
            value: <PriceDisplay amount={sale.commission} variant="commission" />,
            icon: <Coins className="w-3.5 h-3.5 text-green-600" />,
            highlight: true,
          },
          {
            label: t("table.supplier"),
            value: supplierName,
            secondaryValue: supplierPhone && supplierName !== t("admin") ? supplierPhone : undefined,
          },
        ]}
        onViewDetails={() => onViewDetails(sale)}
        viewButtonText={t("actions.view")}
      />
    </div>
  )
}
