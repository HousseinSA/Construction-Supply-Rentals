interface CustomCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  variant?: "default" | "card"
}

export default function CustomCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
  variant = "default",
}: CustomCheckboxProps) {
  const content = (
    <>
      <div
        className={`w-6 h-6 rounded-full border-2 relative flex-shrink-0 transition-all ${
          checked
            ? "border-primary"
            : "border-gray-300 group-hover:border-gray-400"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {checked && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary" />
        )}
      </div>
      {label && (
        <div className="text-left">
          <h3 className="font-semibold text-gray-900">{label}</h3>
        </div>
      )}
    </>
  )

  if (variant === "card") {
    return (
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`p-4 border-2 rounded-xl transition-all duration-200 ${
          checked
            ? "border-primary bg-primary/5"
            : "border-gray-200 hover:border-gray-300"
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <div className="flex items-center gap-3">{content}</div>
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className="flex items-center gap-2 group"
    >
      {content}
    </button>
  )
}
