interface LoadingSkeletonProps {
  count?: number
  type?: 'card' | 'category'
}

export default function LoadingSkeleton({ count = 6, type = 'card' }: LoadingSkeletonProps) {
  if (type === 'category') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="h-40 bg-gray-200 animate-pulse" />
            <div className="p-3.5">
              <div className="h-5 bg-gray-200 rounded mb-1.5 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded mb-3 animate-pulse" />
              <div className="border-t border-gray-50 pt-2.5 flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-9 bg-gray-200 rounded w-28 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100"
        >
          <div className="h-48 bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded mb-1.5 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded mb-2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded w-24 mb-2.5 animate-pulse" />
            <div className="border-t border-gray-50 pt-2.5 mt-auto">
              <div className="h-4 bg-gray-200 rounded mb-2.5 animate-pulse" />
              <div className="flex gap-2">
                <div className="h-9 bg-gray-200 rounded flex-1 animate-pulse" />
                <div className="h-9 bg-gray-200 rounded flex-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}