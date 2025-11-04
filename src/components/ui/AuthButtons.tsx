"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { User, LogIn, LogOut } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { useSession, signOut } from "next-auth/react"

export default function AuthButtons() {
  const t = useTranslations("common")
  const { data: session } = useSession()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = () => {
    signOut({ callbackUrl: "/" })
    setShowLogoutModal(false)
  }

  if (session?.user) {
    return (
      <>
        <div className="relative">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
          >
            <User size={16} />
            <span className="hidden sm:inline">{session.user.name}</span>
          </button>
        </div>

        {showLogoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t("logoutConfirm")}
              </h3>
              <p className="text-gray-600 mb-6">{t("logoutMessage")}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("cancel")}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  {t("logout")}
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/auth/login"
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
      >
        <LogIn size={16} />
        <span>{t("login")}</span>
      </Link>

      <Link
        href="/auth/register"
        className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-dark transition-colors"
      >
        <User size={16} />
        <span>{t("signup")}</span>
      </Link>
    </div>
  )
}
