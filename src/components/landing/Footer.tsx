import { MailIcon } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import WhatsAppLink from "@/components/ui/WhatsAppLink"

export default function Footer() {
  const t = useTranslations("landing")
  const locale = useLocale()

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("footer.support")}</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span>
                <MailIcon className="text-primary" size={16} />
              </span>
              <a
                href="mailto:Kriliyengin@gmail.com"
                className="hover:underline"
              >
                Kriliyengin@gmail.com
              </a>
            </div>
            <div className="flex items-center justify-center gap-2">
              <WhatsAppLink
                className={`text-white hover:text-green-300 [&>svg]:text-green-400 ${locale === 'ar' ? 'flex-row-reverse' : ''}`}
                iconSize={16}
                phoneNumber="22245111111"
                displayText="+222 45 11 11 11"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
