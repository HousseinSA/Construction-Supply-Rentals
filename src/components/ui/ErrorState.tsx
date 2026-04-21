import { AlertCircle, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"

interface ErrorStateProps {
  onRetry?: () => void
  icon?: React.ReactNode
}

export default function ErrorState({
  onRetry,
  icon,
}: ErrorStateProps) {
  const t = useTranslations("common.error")

  return (
    <div className="flex items-center justify-center min-h-[400px] p-8">
      <div className="text-center max-w-md">
        <div className="mb-4 flex justify-center">
          {icon || (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          )}
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("title")}
        </h3>
        <p className="text-gray-600 mb-6">
          {t("message")}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            {t("retry")}
          </button>
        )}
      </div>
    </div>
  )
}
