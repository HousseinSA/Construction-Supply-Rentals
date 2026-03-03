interface TableLoadingProps {
  message?: string
}

export default function TableLoading({ message = "Loading..." }: TableLoadingProps) {
  return (
    <div className="p-12 text-center">
      <div className="animate-pulse text-gray-600 font-medium">
        {message}
      </div>
    </div>
  )
}
