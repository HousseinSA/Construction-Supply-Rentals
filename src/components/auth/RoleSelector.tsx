import { useTranslations } from "next-intl"

type UserRole = "renter" | "supplier"

interface RoleSelectorProps {
  selectedRole: UserRole
  onRoleChange: (role: UserRole) => void
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const t = useTranslations("auth")

  return (
    <div className="p-4 sm:p-6 lg:p-8 border-b border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        {t("register.selectRole")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onRoleChange("renter")}
          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedRole === "renter"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center mb-3">
            <div className={`w-4 h-4 rounded-full border-2 mr-4 rtl:mr-0 rtl:ml-4 ${
              selectedRole === "renter" ? "border-primary bg-primary" : "border-gray-300"
            }`} />
            <h3 className="text-lg font-medium text-gray-800">
              {t("register.renter.title")}
            </h3>
          </div>
          <p className="text-sm text-gray-600">{t("register.renter.description")}</p>
        </button>

        <button
          type="button"
          onClick={() => onRoleChange("supplier")}
          className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedRole === "supplier"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center mb-3">
            <div className={`w-4 h-4 rounded-full border-2 mr-4 rtl:mr-0 rtl:ml-4 ${
              selectedRole === "supplier" ? "border-primary bg-primary" : "border-gray-300"
            }`} />
            <h3 className="text-lg font-medium text-gray-800">
              {t("register.supplier.title")}
            </h3>
          </div>
          <p className="text-sm text-gray-600">{t("register.supplier.description")}</p>
        </button>
      </div>
    </div>
  )
}