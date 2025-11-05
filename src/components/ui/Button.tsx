interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "card-primary"
    | "card-secondary"
    | "warning"
  size?: "default" | "card"
  children: React.ReactNode
}

export default function Button({
  variant = "primary",
  size = "default",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const sizeClasses = {
    default: "py-3 px-8 rounded-xl shadow-sm",
    card: "px-3 py-2 rounded-xl text-sm shadow-sm whitespace-nowrap",
  }

  const variantClasses = {
    primary: "bg-primary hover:bg-primary-dark text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    warning: "bg-red-400 hover:bg-red-600 text-white",
    "card-primary": "bg-primary hover:bg-primary-dark text-white",
    "card-secondary": "bg-gray-50 hover:bg-gray-100 text-gray-600",
  }

  return (
    <button
      className={`font-medium transition-all duration-200 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
