import { useTranslations } from "next-intl"
import CopyButton from "@/src/components/ui/CopyButton"
import { formatPhoneNumber } from "@/src/lib/format"
import { User } from "@/src/lib/models/user"
import { memo } from "react"

interface SupplierCellProps {
  createdBy: string
  supplier?: User
}

function SupplierCell({ createdBy, supplier }: SupplierCellProps) {
  const tCommon = useTranslations("common")

  return (
    <td className="px-6 py-4">
      {createdBy === "admin" ? (
        <span className="text-sm font-medium text-blue-700 whitespace-nowrap">
          {tCommon("admin")}
        </span>
      ) : supplier ? (
        <div className="space-y-1.5">
          <div className="font-medium text-gray-900 text-sm whitespace-nowrap">
            {supplier.firstName} {supplier.lastName}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 whitespace-nowrap" dir="ltr">
              {formatPhoneNumber(supplier.phone)}
            </span>
            <CopyButton text={supplier.phone} size="sm" />
          </div>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">-</span>
      )}
    </td>
  )
}

export default memo(SupplierCell)
