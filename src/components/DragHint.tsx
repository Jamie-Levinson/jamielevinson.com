'use client'

import * as React from "react"
import { useTheme } from "next-themes"
import Image from "next/image"

export function DragHint() {
  const { theme } = useTheme()
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)
  const [visible, setVisible] = React.useState(true)

  React.useEffect(() => {
    setMounted(true)
    
    const updatePosition = () => {
      const placeholder = document.getElementById('theme-toggle-placeholder')
      if (placeholder) {
        const rect = placeholder.getBoundingClientRect()
        // Position under initial position of theme toggle
        setPosition({
          top: rect.top + 25,
          left: rect.left - 100
        })
      }
    }

    updatePosition()
    
    const handleResize = () => updatePosition()
    const handleDrag = () => setVisible(false)
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('themeToggleDragged', handleDrag)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('themeToggleDragged', handleDrag)
    }
  }, [])

  if (!mounted || !visible) return null

  return (
    <div 
      className="fixed z-40 pointer-events-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '200px',
        height: 'auto'
      }}
    >
      <img
        src="/drag-hint.svg"
        alt="Drag me to move theme toggle"
        className="drop-shadow-lg"
        style={{
          width: '200px',
          height: 'auto',
          filter: theme === "dark" ? "brightness(0) invert(1)" : "none"
        }}
      />
    </div>
  )
}

