'use client'

import * as React from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

export function DragHint() {
  const { resolvedTheme } = useTheme()
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Hide on mobile devices
    setIsMobile('ontouchstart' in globalThis || navigator.maxTouchPoints > 0)
    
    const updatePosition = () => {
      const placeholder = document.getElementById('theme-toggle-placeholder')
      if (placeholder) {
        const rect = placeholder.getBoundingClientRect()
        // Position under initial position of theme toggle
        setPosition({
          top: rect.top + 20,
          left: rect.left - 120
        })
      }
    }

    updatePosition()
    
    // Single retry for safety against hydration timing
    setTimeout(updatePosition, 100)
    
    const handleResize = () => updatePosition()
    const handleDrag = () => setVisible(false)
    
    globalThis.addEventListener('resize', handleResize)
    globalThis.addEventListener('themeToggleDragged', handleDrag)
    
    return () => {
      globalThis.removeEventListener('resize', handleResize)
      globalThis.removeEventListener('themeToggleDragged', handleDrag)
    }
  }, [])

  if (!mounted || !visible || isMobile) return null

  return (
    <div 
      className="fixed z-40 pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Image
        src="/drag-hint.svg"
        alt="Drag me to move theme toggle"
        width={220}
        height={60}
        className="drop-shadow-lg"
        style={{
          filter: resolvedTheme === "dark" ? "brightness(0) invert(1)" : "none"
        }}
        unoptimized
      />
    </div>
  )
}
