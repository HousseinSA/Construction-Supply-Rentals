import { formatBookingId } from "@/src/lib/format"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"

interface SalesMobileCardProps {
  sale: any
  onViewDetails: (sale: any) => void
  t: (key: string) => string
}

export default function SalesMobileCard({ sale, onViewDetails, t }: SalesMobileCardProps) {
  return (
    <GenericMobileCard
      id={formatBookingId(sale._id)}
      title={sale.equipmentName}
      date={new Date(sale.createdAt).toLocaleDateString()}
      status={sale.status}
      fields={[
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
  )
}
