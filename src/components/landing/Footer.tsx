import { MailIcon } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import WhatsAppLink from "@/components/ui/WhatsAppLink"

export default function Footer() {
  const t = useTranslations("landing")
  const locale = useLocale()

  return (
    <footer className="relative bg-gradient-to-r from-gray-400 to-gray-500 text-white py-6 shadow-lg overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-full bg-gray-600 transform skew-x-12 translate-x-8"></div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <a
              href="mailto:Kriliyengin@gmail.com"
              className="flex items-center gap-2 text-white hover:text-gray-200 transition-colors group"
            >
              <MailIcon className="group-hover:scale-110 transition-transform" size={18} />
              <span className="text-sm">Kriliyengin@gmail.com</span>
            </a>
            <WhatsAppLink
              className={`text-white hover:text-gray-200 [&>svg]:text-white transition-colors ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
              iconSize={18}
            />
          </div>
          <div className="text-sm text-white text-center sm:text-right">
            <p>© {new Date().getFullYear()} Kriliy Engin</p>
            <p className="text-xs text-gray-100 mt-1">by <a href="https://technotrans-sarl.com/" target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline transition-all">TECHNO-TRANS</a></p>
          </div>
        </div>
      </div>
    </footer>
  )
}
