"use client"

import { useEffect } from "react"

export default function ImageLoadHandler() {
  useEffect(() => {
    const handleImageLoad = (e: Event) => {
      const img = e.target as HTMLImageElement
      img.classList.add("loaded")
    }

    document.addEventListener("load", handleImageLoad, true)
    return () => document.removeEventListener("load", handleImageLoad, true)
  }, [])

  return null
}
