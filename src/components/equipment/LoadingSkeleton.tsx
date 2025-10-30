interface LoadingSkeletonProps {
  count?: number
  type?: 'card' | 'category'
}

export default function LoadingSkeleton({ count = 6, type = 'card' }: LoadingSkeletonProps) {
  if (type === 'category') {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
            <div className="h-16 bg-gray-200 rounded mb-3 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded animate-pulse" />
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
          className="bg-white rounded-lg shadow-md overflow-hidden"
        >
          <div className="h-48 bg-gray-200 animate-pulse" />
          <div className="p-4">
            <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
            <div className="h-4 bg-gray-100 rounded mb-4 animate-pulse" />
            <div className="h-10 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}