import BackButton from "@/components/ui/BackButton"

interface PageHeaderProps {
  title: string
  fallbackRoute?: string
}

export default function PageHeader({ title, fallbackRoute = "/" }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <BackButton className="text-gray-600 hover:text-primary transition-colors" fallbackRoute={fallbackRoute} />
        
        <h1 className="text-base sm:text-lg font-semibold text-gray-800 flex-1 text-center">
          {title}
        </h1>
        
        <div className="w-12"></div>
      </div>
    </div>
  )
}