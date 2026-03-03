'use client'

import { useEffect, useState } from 'react'

export default function StructuredData({ data }: { data: any }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <script 
      type="application/ld+json" 
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} 
    />
  )
}
