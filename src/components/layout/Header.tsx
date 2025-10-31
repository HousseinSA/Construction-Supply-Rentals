"use client"

import { useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Menu, X, Phone } from "lucide-react"
import LanguageSwitcher from "@/components/ui/LanguageSwitcher"
import AuthButtons from "@/components/ui/AuthButtons"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const locale = useLocale()
  const t = useTranslations("common")

  const getFontClass = () => {
    switch (locale) {
      case "ar":
        return "font-arabic"
      case "fr":
        return "font-french"
      default:
        return "font-english"
    }
  }

  return (
    <header
      className={`bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm ${getFontClass()}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg">
              LOGO
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 text-gray-700">
              <span>
                <Phone size={20} />
              </span>
              <span className="font-medium">{t("phone")}</span>
            </div>
            <LanguageSwitcher />
            <div className="hidden md:block">
              <AuthButtons />
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 text-gray-700 px-2 py-1 md:hidden">
                <span>
                  <Phone size={16} />
                </span>
                <span className="font-medium">{t("phone")}</span>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <AuthButtons />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
