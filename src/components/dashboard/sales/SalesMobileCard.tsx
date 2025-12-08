import { formatBookingId } from "@/src/lib/format"
import { formatReferenceNumber } from "@/src/lib/format-reference"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"

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
  const supplierName = sale.supplierInfo?.[0]
    ? `${sale.supplierInfo[0].firstName} ${sale.supplierInfo[0].lastName}`
    : t("admin")

  return (
    <div className={highlight ? "animate-pulse" : ""}>
      <GenericMobileCard
      id={formatReferenceNumber(sale.referenceNumber)}
      title={sale.equipmentName}
      subtitle={buyerName}
      date={new Date(sale.createdAt).toLocaleDateString()}
      status={sale.status}
      fields={[
        {
          label: t("table.supplier"),
          value: supplierName,
        },
        {
          label: t("table.price"),
          value: sale.salePrice,
        },
        {
          label: t("table.commission"),
          value: sale.commission,
          highlight: true,
        },
      ]}
        onViewDetails={() => onViewDetails(sale)}
        viewButtonText={t("actions.view")}
      />
    </div>
  )
}
