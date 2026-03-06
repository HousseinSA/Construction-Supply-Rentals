import { useEquipmentStore } from "@/src/stores/equipmentStore"
import { Table, TableHeader, TableBody, TableHead } from "../../ui/Table"
import { EquipmentWithSupplier } from "@/src/lib/models/equipment"
import EquipmentTableRow from "./EquipmentTableRow"
import EquipmentMobileCard from "./EquipmentMobileCard"
import Pagination from "../../ui/Pagination"

interface EquipmentListProps {
  equipment: EquipmentWithSupplier[]
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onStatusChange: (id: string, action: "approve" | "reject") => void
  t: any
}

export default function EquipmentList({
  equipment,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onStatusChange,
  t,
}: EquipmentListProps) {
  const isSupplier = useEquipmentStore((state) => state.isSupplier)

  return (
    <>
      <div className="hidden xl:block">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("location")}</TableHead>
              <TableHead>{t("price")}</TableHead>
              {!isSupplier && <TableHead>{t("supplierInfo")}</TableHead>}
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
                onStatusChange={onStatusChange}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="xl:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
        {equipment.map((item) => (
          <EquipmentMobileCard
            key={item._id?.toString()}
            item={item}
            onStatusChange={onStatusChange}
          />
        ))}
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
