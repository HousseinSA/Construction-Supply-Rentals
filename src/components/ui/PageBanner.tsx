import { ReactNode } from "react"
import BackButton from "@/components/ui/BackButton"

interface PageBannerProps {
  title: string
  showBackButton?: boolean
  className?: string
  children?: ReactNode
}

export default function PageBanner({ 
  title, 
  showBackButton = true, 
  className = "",
  children 
}: PageBannerProps) {
  return (
    <div className={`relative h-24 bg-gradient-to-r from-gray-400 to-gray-500 shadow-lg overflow-hidden ${className}`}>
      {/* Diagonal cut on the right */}
      <div className="absolute top-0 right-0 w-32 h-full bg-gray-600 transform skew-x-12 translate-x-8"></div>
      <div className="relative z-10 h-full flex items-center justify-between px-4 sm:px-6 lg:px-8 text-white max-w-7xl mx-auto">
        {showBackButton ? (
          <BackButton className="text-white hover:text-gray-200 transition-colors duration-200" fallbackRoute="/" />
        ) : (
          <div className="w-16"></div>
        )}
        
        <div className="text-center flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-white drop-shadow-md tracking-wide">
            {title}
          </h1>
          {children}
        </div>
        
        <div className="w-16"></div>
      </div>
    </div>
  )
}