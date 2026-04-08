import { RefreshCw } from "lucide-react"

interface ReloadButtonProps {
  onReload: () => void
  loading?: boolean
}

export default function ReloadButton({ onReload, loading = false }: ReloadButtonProps) {
  return (
    <button
      onClick={onReload}
      disabled={loading}
      className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Reload"
    >
      <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
    </button>
  )
}
