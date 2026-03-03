interface PageLoadingProps {
  message?: string
  className?: string
}

export default function PageLoading({ message = "Loading...", className = "" }: PageLoadingProps) {
  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  )
}
