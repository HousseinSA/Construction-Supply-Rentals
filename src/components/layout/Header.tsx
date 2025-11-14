"use client"

import { useEffect, useState, useRef } from "react"
import { useTranslations, useLocale } from "next-intl"
import { Menu, X } from "lucide-react"
import LanguageSwitcher from "@/components/ui/LanguageSwitcher"
import AuthButtons from "@/components/ui/AuthButtons"
import WhatsAppLink from "@/components/ui/WhatsAppLink"
import Image from "next/image"
import { Link } from "@/i18n/navigation"

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [logoWidth, setLogoWidth] = useState(155)
  const locale = useLocale()
  const t = useTranslations("common")
  const mobileMenuRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    const updateWidth = () => {
      if (window.innerWidth < 640) {
        setLogoWidth(100)
      } else if (window.innerWidth < 1024) {
        setLogoWidth(130)
      } else {
        setLogoWidth(155)
      }
    }

    updateWidth()
    window.addEventListener("resize", updateWidth)
    return () => window.removeEventListener("resize", updateWidth)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false)
      }
    }

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobileMenuOpen])

  return (
    <header
      className={`bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm ${getFontClass()}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16  ">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center rounded-lg">
              <Image
                width={logoWidth}
                height={100}
                src={"/Kriliy-engin-logo.png"}
                alt="krilly engin logo"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/equipment?listingType=forSale"
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-amber-500 text-white text-sm font-medium rounded-lg hover:from-[var(--primary-dark)] hover:to-amber-600 transition-all duration-300"
            >
              {t("equipmentForSale")}
            </Link>
            <WhatsAppLink
              className={`hidden md:flex text-gray-700 hover:text-green-600 [&>svg]:text-green-600 ${
                locale === "ar" ? "flex-row-reverse" : ""
              }`}
              displayText={t("phone")}
            />
            <LanguageSwitcher
              onLanguageChange={() => setIsMobileMenuOpen(false)}
            />
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
          <div
            ref={mobileMenuRef}
            className="md:hidden border-t border-gray-200 py-4"
          >
            <nav className="flex flex-col space-y-3">
              <Link
                href="/equipment?listingType=forSale"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 mx-4 px-4 py-3 bg-gradient-to-r from-[var(--primary)] to-amber-500 text-white rounded-lg hover:from-[var(--primary-dark)] hover:to-amber-600 transition-all duration-300 font-medium text-center"
              >
                {t("equipmentForSale")}
              </Link>
              <div className="flex justify-center px-4">
                <WhatsAppLink
                  className={`text-gray-700 hover:text-green-600 [&>svg]:text-green-600 ${
                    locale === "ar" ? "flex-row-reverse" : ""
                  }`}
                  displayText={t("phone")}
                  iconSize={18}
                />
              </div>
              <div className="pt-3 border-t border-gray-200 px-4">
                <AuthButtons onActionClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
