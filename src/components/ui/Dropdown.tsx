"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Lock } from "lucide-react"
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
  useAbsolutePosition?: boolean
  priceDisplay?: boolean
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
  useAbsolutePosition = false,
  priceDisplay = false,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  })
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
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

    const handleScroll = (event: Event) => {
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
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
          } ${fontClass.includes("arabic") ? "text-right" : "text-left"} bg-white ${
          noBorder ? "border-0" : "border border-gray-300"
        } ${compact ? "rounded-lg" : "rounded-xl"}
          ${
            noBorder
              ? ""
              : "focus:ring-2 focus:ring-primary focus:border-primary"
          } focus:outline-none
          transition-all duration-200 flex items-center justify-between gap-2
          ${
            disabled
              ? "bg-gray-200 cursor-not-allowed text-gray-500 border-gray-300"
              : noBorder
              ? "cursor-pointer hover:bg-gray-50"
              : "hover:border-gray-400 cursor-pointer"
          }
          ${isOpen && !noBorder ? "ring-2 ring-primary border-primary" : ""}
          ${noBorder && isOpen ? "bg-gray-50" : ""}
        `}
      >
        <span className={`flex-1 ${selectedOption && !disabled ? "text-gray-900" : "text-gray-500"}`}>
          {priceDisplay && selectedOption ? (
            <span dir="ltr">{selectedOption.label}</span>
          ) : (
            selectedOption ? selectedOption.label : placeholder
          )}
        </span>
        {disabled ? (
          <Lock className={`${
            compact ? "h-4 w-4" : "h-5 w-5"
          } text-gray-400 flex-shrink-0`} />
        ) : (
          <ChevronDown
            className={`${
              compact ? "h-4 w-4" : "h-5 w-5"
            } text-gray-400 flex-shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {isOpen && (
        <div
          ref={menuRef}
          className={`${useAbsolutePosition ? 'absolute' : 'fixed'} z-[99999] bg-white border border-gray-200 ${
            compact ? "rounded-lg" : "rounded-xl"
          } shadow-lg max-h-60 overflow-auto ${
            useAbsolutePosition ? 'top-full mt-1 left-0 right-0' : ''
          }`}
          style={useAbsolutePosition ? {} : {
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
                {priceDisplay ? <span dir="ltr">{option.label}</span> : option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
