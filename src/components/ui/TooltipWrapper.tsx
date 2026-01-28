import { ReactNode } from "react"
import { useTooltip } from "@/src/hooks/useTooltip"

interface TooltipWrapperProps {
  content: ReactNode
  children: ReactNode
  position?: "top" | "bottom"
  className?: string
}

export default function TooltipWrapper({
  content,
  children,
  position = "top",
  className = "",
}: TooltipWrapperProps) {
  const { ref, isOpen, open, close, toggle } = useTooltip()

  return (
    <div
      ref={ref}
      className={`relative inline-block ${className}`}
      onMouseEnter={open}
      onMouseLeave={close}
    >
      <div onClick={toggle}>{children}</div>
      {isOpen && (
        <div
          className={`absolute ${
            position === "top"
              ? "bottom-full mb-2"
              : "top-full mt-2"
          } left-1/2 transform -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg z-[9999] shadow-xl whitespace-nowrap`}
        >
          {content}
          <div
            className={`absolute ${
              position === "top"
                ? "top-full -mt-1 border-t-gray-900"
                : "bottom-full -mb-1 border-b-gray-900"
            } left-1/2 transform -translate-x-1/2 border-4 border-transparent`}
          ></div>
        </div>
      )}
    </div>
  )
}
