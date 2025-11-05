export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="h-8 sm:h-9 bg-gray-200 rounded w-full max-w-xs animate-pulse" />
          <div className="h-4 sm:h-5 bg-gray-200 rounded w-full max-w-md mt-1 sm:mt-2 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6"
            >
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="h-9 w-9 sm:h-12 sm:w-12 bg-gray-200 rounded-lg animate-pulse" />
              </div>
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-3/4 mb-1 sm:mb-2 animate-pulse" />
              <div className="h-3.5 sm:h-4 bg-gray-200 rounded w-full mb-1 animate-pulse" />
              <div className="h-3.5 sm:h-4 bg-gray-200 rounded w-5/6 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
