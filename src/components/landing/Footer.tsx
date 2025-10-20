import { Phone } from "lucide-react"
import { useTranslations } from "next-intl"

export default function Footer() {
  const t = useTranslations("landing")

  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <div>
          <h3 className="text-lg font-semibold mb-2">{t("footer.support")}</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span>📧</span>
              <span>support@constructionrental.mr</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span>
                {" "}
                <Phone size={16} />
              </span>
              <span>+222 11 11 11 11</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
