import { useFontClass } from "@/src/hooks/useFontClass"

interface AuthCardProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

export default function AuthCard({ children, title, subtitle }: AuthCardProps) {
  const fontClass = useFontClass()
  
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${fontClass}`}>
      <div className="p-4 sm:p-6 lg:p-8">
        {(title || subtitle) && (
          <div className="text-center mb-8">
            {title && (
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="text-gray-600">
                {subtitle}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}