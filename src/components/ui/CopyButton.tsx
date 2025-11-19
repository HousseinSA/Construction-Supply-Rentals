'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CopyButtonProps {
  text: string
  size?: 'sm' | 'md'
  className?: string
}

export default function CopyButton({ text, size = 'md', className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'

  return (
    <button
      onClick={handleCopy}
      className={`p-1.5 hover:bg-gray-100 rounded transition-colors ${className}`}
      title="Copy"
    >
      {copied ? (
        <Check className={`${iconSize} text-green-600`} />
      ) : (
        <Copy className={`${iconSize} text-gray-500`} />
      )}
    </button>
  )
}
