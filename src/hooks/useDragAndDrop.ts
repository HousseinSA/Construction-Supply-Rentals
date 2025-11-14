import { useState } from "react"

interface UseDragAndDropProps {
  onDrop: (files: FileList) => void
  disabled?: boolean
  maxItems?: number
  currentCount?: number
}

export function useDragAndDrop({
  onDrop,
  disabled = false,
  maxItems = 5,
  currentCount = 0,
}: UseDragAndDropProps) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled && currentCount < maxItems) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled || currentCount >= maxItems) return

    const files = e.dataTransfer.files
    if (files?.length > 0) {
      onDrop(files)
    }
  }

  return {
    isDragging,
    dragHandlers: {
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  }
}
