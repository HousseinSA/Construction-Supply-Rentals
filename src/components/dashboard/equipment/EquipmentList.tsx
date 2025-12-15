import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { Table, TableHeader, TableBody, TableHead } from "../../ui/Table"
import { EquipmentWithSupplier } from "@/src/stores/equipmentStore"
import EquipmentTableRow from "./EquipmentTableRow"
import EquipmentMobileCard from "./EquipmentMobileCard"
import Pagination from "../../ui/Pagination"

interface EquipmentListProps {
  equipment: EquipmentWithSupplier[]
  updating: string | null
  navigating: string | null
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onStatusChange: (id: string, action: "approve" | "reject") => void
  onAvailabilityChange: (id: string, isAvailable: boolean) => void
  onNavigate: (url: string, id: string) => void
  onPageChange: (page: number) => void
  t: any
}

export default function EquipmentList({
  equipment,
  updating,
  navigating,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onStatusChange,
  onAvailabilityChange,
  onNavigate,
  onPageChange,
  t,
}: EquipmentListProps) {
  const { getPriceData, formatPrice } = usePriceFormatter()

  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("location")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              <TableHead>{t("supplierInfo")}</TableHead>
              <TableHead align="center">{t("createdAt")}</TableHead>
              <TableHead align="center">{t("status")}</TableHead>
              <TableHead align="center">{t("availability")}</TableHead>
              <TableHead align="center">{t("actions")}</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {equipment.map((item) => (
              <EquipmentTableRow
                key={item._id?.toString()}
                item={item}
                updating={updating}
                navigating={navigating}
                onStatusChange={onStatusChange}
                onAvailabilityChange={onAvailabilityChange}
                onNavigate={onNavigate}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {equipment.map((item) => {
          const priceData = getPriceData(
            item.pricing,
            item.listingType === "forSale"
          )
          const { displayPrice, displayUnit } = formatPrice(
            priceData.rate,
            priceData.unit
          )

          return (
            <EquipmentMobileCard
              key={item._id?.toString()}
              item={item}
              updating={updating}
              navigating={navigating}
              displayPrice={displayPrice}
              displayUnit={displayUnit}
              onStatusChange={onStatusChange}
              onAvailabilityChange={onAvailabilityChange}
              onNavigate={onNavigate}
              t={t}
            />
          )
        })}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        showInfo={true}
      />
    </>
  )
}
