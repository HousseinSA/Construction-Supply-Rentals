"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/src/i18n/navigation"
import { useAuthStore } from "@/src/stores"
import { 
  Plus, 
  Settings, 
  BarChart3, 
  Users,
  Truck,
  ClipboardList,
  Package,
  ShoppingCart,
  FileText,
  User
} from "lucide-react"

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const t = useTranslations("dashboard")

  const getDashboardCards = () => {
    if (user?.role === 'admin') {
      return [
        {
          title: t("admin.createEquipment"),
          description: t("admin.createEquipmentDesc"),
          icon: Plus,
          href: "/admin/equipment/create",
          color: "bg-blue-500"
        },
        {
          title: t("admin.manageEquipment"),
          description: t("admin.manageEquipmentDesc"),
          icon: Truck,
          href: "/admin/equipment",
          color: "bg-green-500"
        },
        {
          title: t("admin.bookings"),
          description: t("admin.bookingsDesc"),
          icon: ClipboardList,
          href: "/admin/bookings",
          color: "bg-orange-500"
        },
        {
          title: t("admin.users"),
          description: t("admin.usersDesc"),
          icon: Users,
          href: "/admin/users",
          color: "bg-purple-500"
        },
        {
          title: t("admin.analytics"),
          description: t("admin.analyticsDesc"),
          icon: BarChart3,
          href: "/admin/analytics",
          color: "bg-indigo-500"
        },
        {
          title: t("admin.settings"),
          description: t("admin.settingsDesc"),
          icon: Settings,
          href: "/admin/settings",
          color: "bg-gray-500"
        }
      ]
    }

    if (user?.userType === 'supplier') {
      return [
        {
          title: t("supplier.myEquipment"),
          description: t("supplier.myEquipmentDesc"),
          icon: Package,
          href: "/supplier/equipment",
          color: "bg-green-500"
        },
        {
          title: t("supplier.addEquipment"),
          description: t("supplier.addEquipmentDesc"),
          icon: Plus,
          href: "/supplier/equipment/create",
          color: "bg-blue-500"
        },
        {
          title: t("supplier.bookings"),
          description: t("supplier.bookingsDesc"),
          icon: ClipboardList,
          href: "/supplier/bookings",
          color: "bg-orange-500"
        },
        {
          title: t("supplier.profile"),
          description: t("supplier.profileDesc"),
          icon: User,
          href: "/supplier/profile",
          color: "bg-purple-500"
        }
      ]
    }

    // Renter dashboard
    return [
      {
        title: t("renter.browseEquipment"),
        description: t("renter.browseEquipmentDesc"),
        icon: Truck,
        href: "/equipment",
        color: "bg-blue-500"
      },
      {
        title: t("renter.myBookings"),
        description: t("renter.myBookingsDesc"),
        icon: ShoppingCart,
        href: "/renter/bookings",
        color: "bg-green-500"
      },
      {
        title: t("renter.requests"),
        description: t("renter.requestsDesc"),
        icon: FileText,
        href: "/renter/requests",
        color: "bg-orange-500"
      },
      {
        title: t("renter.profile"),
        description: t("renter.profileDesc"),
        icon: User,
        href: "/renter/profile",
        color: "bg-purple-500"
      }
    ]
  }

  const dashboardCards = getDashboardCards()
  const userRole = user?.role === 'admin' ? 'admin' : user?.userType || 'renter'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t(`${userRole}.title`)}
          </h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">
            {t(`${userRole}.subtitle`)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {dashboardCards.map((card) => {
            const IconComponent = card.icon
            return (
              <Link
                key={card.href}
                href={card.href}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className={`${card.color} p-2 sm:p-3 rounded-lg`}>
                    <IconComponent className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                  </div>
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
                  {card.title}
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                  {card.description}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}