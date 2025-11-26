import { useTranslations } from "next-intl"

type UserRole = "renter" | "supplier"

interface RoleSelectorProps {
  selectedRole: UserRole
  onRoleChange: (role: UserRole) => void
}

export default function RoleSelector({ selectedRole, onRoleChange }: RoleSelectorProps) {
  const t = useTranslations("auth")

  return (
    <div className=" sm:p-2 lg:p-4 border-b border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        {t("register.selectRole")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onRoleChange("renter")}
          className={`p-2 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedRole === "renter"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full border-2 mr-4 rtl:mr-0 rtl:ml-4 ${
              selectedRole === "renter" ? "border-primary bg-primary" : "border-gray-300"
            }`} />/2

            
            <h3 className="text-lg font-medium text-gray-800">
              {t("register.renter.title")}
            </h3>
          </div>
        </button>

        <button
          type="button"
          onClick={() => onRoleChange("supplier")}
          className={`p-2 rounded-xl border-2 transition-all duration-200 text-left ${
            selectedRole === "supplier"
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full border-2 mr-4 rtl:mr-0 rtl:ml-4 ${
              selectedRole === "supplier" ? "border-primary bg-primary" : "border-gray-300"
            }`} />
            <h3 className="text-lg font-medium text-gray-800">
              {t("register.supplier.title")}
            </h3>
          </div>
        </button>
      </div>
    </div>
  )
}