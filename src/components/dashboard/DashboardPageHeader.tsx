"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import HomeButton from "../ui/HomeButton"

interface DashboardPageHeaderProps {
  title: string
  showBackButton?: boolean
}

export default function DashboardPageHeader({ 
  title,
  showBackButton = true 
}: DashboardPageHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-4 flex-1">
        {showBackButton && (
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-primary">
            {title}
          </h1>
        </div>
      </div>
      <HomeButton />
    </div>
  )
}