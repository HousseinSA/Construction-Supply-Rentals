interface LoadingSkeletonProps {
  count?: number
  type?: 'card' | 'equipmentType'
}

export default function LoadingSkeleton({ count = 6, type = 'card' }: LoadingSkeletonProps) {
  if (type === 'equipmentType') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-100">
            <div className="relative w-full aspect-[3/2] bg-gray-200 rounded-t-2xl animate-pulse" />
            <div className="p-4 flex flex-col flex-1">
              <div className="flex-1">
                <div className="h-5 bg-gray-200 rounded mb-1.5 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded mb-1 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-3/4 mb-3 animate-pulse" />
              </div>
              <div className="flex justify-between items-center mt-auto pt-2.5 border-t border-gray-50">
                <div className="flex items-center space-x-1">
                  <div className="h-4 bg-gray-200 rounded w-6 animate-pulse" />
                  <div className="h-3 bg-gray-100 rounded w-12 animate-pulse" />
                </div>
                <div className="h-8 bg-gray-200 rounded w-28 animate-pulse" />
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
          className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col h-full border border-gray-100"
        >
          <div className="h-48 bg-gray-200 animate-pulse" />
          <div className="p-4 flex flex-col flex-1">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded mb-1.5 animate-pulse" />
              <div className="h-4 bg-gray-100 rounded mb-2 animate-pulse" />
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-gray-100 rounded mr-1 animate-pulse" />
                <div className="h-4 bg-gray-100 rounded w-20 animate-pulse" />
              </div>
            </div>
            <div className="space-y-2.5 mt-auto border-t border-gray-50 pt-2.5">
              <div className="text-center mb-2">
                <div className="h-6 bg-gray-200 rounded w-20 mx-auto mb-1 animate-pulse" />
                <div className="h-3 bg-gray-100 rounded w-16 mx-auto animate-pulse" />
              </div>
              <div className="flex gap-2">
                <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse" />
                <div className="h-8 bg-gray-200 rounded flex-1 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}