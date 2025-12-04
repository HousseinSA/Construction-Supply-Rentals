"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { useFontClass } from "@/src/hooks/useFontClass"

interface DropdownOption {
  value: string
  label: string
}

interface DropdownProps {
  label?: string
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  required?: boolean
  compact?: boolean
  noBorder?: boolean
}

export default function Dropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select option",
  disabled = false,
  className = "",
  required = false,
  compact = false,
  noBorder = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const fontClass = useFontClass()

  const selectedOption = options.find((option) => option.value === value)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleScroll = () => {
      if (isOpen) setIsOpen(false)
    }

    document.addEventListener("mousedown", handleClickOutside)
    window.addEventListener("scroll", handleScroll, true)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      window.removeEventListener("scroll", handleScroll, true)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setMenuPosition({
        top: rect.bottom,
        left: rect.left,
        width: rect.width,
      })
    }
  }, [isOpen])

  const handleSelect = (optionValue: string) => {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <div className={`relative ${className} ${fontClass}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      <button
        ref={buttonRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full ${
            compact ? "px-3 py-2 text-sm" : "px-4 py-3"
          } text-left bg-white ${
          noBorder ? "border-0" : "border border-gray-300"
        } ${compact ? "rounded-lg" : "rounded-xl"}
          ${
            noBorder
              ? ""
              : "focus:ring-2 focus:ring-primary focus:border-primary"
          } focus:outline-none
          transition-all duration-200 flex items-center justify-between
          ${
            disabled
              ? "bg-gray-50 cursor-not-allowed"
              : noBorder
              ? "cursor-pointer"
              : "hover:border-gray-400 cursor-pointer"
          }
          ${isOpen && !noBorder ? "ring-2 ring-primary border-primary" : ""}
        `}
      >
        <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`${
            compact ? "h-4 w-4" : "h-5 w-5"
          } text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`fixed z-[9999] bg-white border border-gray-200 ${
            compact ? "rounded-lg" : "rounded-xl"
          } shadow-lg max-h-60 overflow-auto`}
          style={{
            top: `${menuPosition.top + 4}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`,
          }}
        >
          {options.length === 0 ? (
            <div
              className={`${
                compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
              } text-gray-500`}
            >
              No options available
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full ${
                    compact ? "px-3 py-2 text-sm" : "px-4 py-3"
                  } hover:bg-gray-50 transition-colors duration-150
                  ${
                    compact
                      ? "first:rounded-t-lg last:rounded-b-lg"
                      : "first:rounded-t-xl last:rounded-b-xl"
                  }
                  ${
                    value === option.value
                      ? "bg-primary/5 text-primary font-medium"
                      : "text-gray-900"
                  }
                  ${fontClass.includes("arabic") ? "text-right" : "text-left"}
                `}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
