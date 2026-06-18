import { memo } from "react"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ColoredIcon } from "@/src/components/ui/EquipmentImage"

interface ActionLinksProps {
  t: (key: string) => string
}

const ICON_BG_PRIMARY = "bg-primary/10"
const ICON_BG_PRIMARY_HOVER = "group-hover:bg-primary/20"
const ICON_BG_AMBER = "bg-amber-100"
const ICON_BG_AMBER_HOVER = "group-hover:bg-amber-200"

function ActionLinks({ t }: ActionLinksProps) {
  const params = useParams()
  const locale = (params?.locale as string) || "fr"

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link
        href={`/${locale}/bookings`}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${ICON_BG_PRIMARY} p-3 rounded-full ${ICON_BG_PRIMARY_HOVER} transition-colors`}>
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("myBookings")}
              </h3>
              <p className="text-sm text-gray-600">{t("viewBookings")}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
        </div>
      </Link>

      <Link
        href={`/${locale}/equipment`}
        className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${ICON_BG_AMBER} p-3 rounded-full ${ICON_BG_AMBER_HOVER} transition-colors`}>
              <ColoredIcon alt="Equipment" size={24} color="amber" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {t("moreEquipment")}
              </h3>
              <p className="text-sm text-gray-600">{t("browseEquipment")}</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </div>
      </Link>
    </div>
  )
}

export default memo(ActionLinks)
