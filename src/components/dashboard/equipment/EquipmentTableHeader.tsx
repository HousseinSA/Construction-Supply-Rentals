import { useTranslations } from "next-intl"

interface EquipmentTableHeaderProps {
  headerAlign: string
}

export default function EquipmentTableHeader({ headerAlign }: EquipmentTableHeaderProps) {
  const t = useTranslations("dashboard.equipment")

  return (
    <thead className="bg-gray-50 border-b">
      <tr>
        <th className={`px-6 py-4 ${headerAlign} text-sm font-semibold text-gray-700 sticky left-0 z-10 bg-gray-50`}>
          {t("name")}
        </th>
        <th className={`px-6 py-4 ${headerAlign} text-sm font-semibold text-gray-700`}>
          {t("location")}
        </th>
        <th className={`px-6 py-4 ${headerAlign} text-sm font-semibold text-gray-700`}>
          {t("price")}
        </th>
        <th className={`px-6 py-4 ${headerAlign} text-sm font-semibold text-gray-700`}>
          {t("supplierInfo")}
        </th>
        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
          {t("createdAt")}
        </th>
        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
          {t("status")}
        </th>
        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
          {t("availability")}
        </th>
        <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">
          {t("actions")}
        </th>
      </tr>
    </thead>
  )
}