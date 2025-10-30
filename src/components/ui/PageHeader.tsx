interface PageHeaderProps {
  title: string
  subtitle?: string
  height?: "sm" | "md" | "lg"
}

export default function PageHeader({ title, subtitle, height = "sm" }: PageHeaderProps) {
  const heightClasses = {
    sm: "h-32",
    md: "h-48", 
    lg: "h-64"
  }

  const titleClasses = {
    sm: "text-3xl",
    md: "text-4xl",
    lg: "text-4xl"
  }

  return (
    <div className={`relative ${heightClasses[height]} bg-gradient-to-r from-primary to-primary-dark`}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
        <div>
          <h1 className={`${titleClasses[height]} font-bold ${subtitle ? "mb-4" : "mb-2"}`}>
            {title}
          </h1>
          {subtitle && (
            <p className="text-xl opacity-90">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}