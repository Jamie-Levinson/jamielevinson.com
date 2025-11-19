'use client'

import * as React from "react"
import { useTheme } from "next-themes"

export function DragHint() {
  const { resolvedTheme } = useTheme()
  const [position, setPosition] = React.useState({ top: 0, left: 0 })
  const [mounted, setMounted] = React.useState(false)
  const [visible, setVisible] = React.useState(true)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    // Hide on mobile devices
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    
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
    
    const handleResize = () => updatePosition()
    const handleDrag = () => setVisible(false)
    
    window.addEventListener('resize', handleResize)
    window.addEventListener('themeToggleDragged', handleDrag)
    
    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('themeToggleDragged', handleDrag)
    }
  }, [])

  if (!mounted || !visible || isMobile) return null

  return (
    <div 
      className="fixed z-40 pointer-events-none"
              style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: '220px',
                height: 'auto'
              }}
            >
              <img
                src="/drag-hint.svg"
                alt="Drag me to move theme toggle"
                className="drop-shadow-lg"
                style={{
                  width: '220px',
                  height: 'auto',
                  filter: resolvedTheme === "dark" ? "brightness(0) invert(1)" : "none"
                }}
              />
    </div>
  )
}

