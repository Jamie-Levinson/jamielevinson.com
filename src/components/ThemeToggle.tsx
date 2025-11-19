"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"

const BUTTON_SIZE = 48

// Helper function to clamp position within screen bounds
const clampToBounds = (x: number, y: number) => {
  const minX = 0
  const maxX = window.innerWidth - BUTTON_SIZE
  const minY = 0
  const maxY = window.innerHeight - BUTTON_SIZE
  
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y))
  }
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [initialMousePos, setInitialMousePos] = React.useState({ x: 0, y: 0 })
  const [hasTriggeredDragHint, setHasTriggeredDragHint] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const buttonRef = React.useRef<HTMLDivElement>(null)

  // Initialize position on mount and handle resize
  React.useEffect(() => {
    setMounted(true) // Prevent hydration mismatch
    // Detect if mobile/touch device
    setIsMobile('ontouchstart' in window || navigator.maxTouchPoints > 0)
    
    const initializePosition = () => {
      const placeholder = document.getElementById('theme-toggle-placeholder')
      if (placeholder) {
        const rect = placeholder.getBoundingClientRect()
        setPosition({ 
          x: rect.left + rect.width / 2 - BUTTON_SIZE / 2,
          y: rect.top + rect.height / 2 - BUTTON_SIZE / 2
        })
      }
    }
    
    initializePosition()
    const handleResize = () => {
      setPosition(p => clampToBounds(p.x, p.y))
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Drag handling (only on desktop)
  const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current || isMobile) return
    const rect = buttonRef.current.getBoundingClientRect()
    setIsDragging(true)
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setInitialMousePos({ x: e.clientX, y: e.clientY })
  }, [isMobile])

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    // Check if actually moved significantly (not just a click)
    const moveThreshold = 10 // pixels
    const moveX = Math.abs(e.clientX - initialMousePos.x)
    const moveY = Math.abs(e.clientY - initialMousePos.y)
    
    if (!hasTriggeredDragHint && (moveX > moveThreshold || moveY > moveThreshold)) {
      setHasTriggeredDragHint(true)
      // Dispatch event to hide drag hint on actual drag
      window.dispatchEvent(new Event('themeToggleDragged'))
    }
    
    setPosition(clampToBounds(e.clientX - dragStart.x, e.clientY - dragStart.y))
  }, [isDragging, dragStart, initialMousePos, hasTriggeredDragHint])


  const handleMouseUp = React.useCallback(() => setIsDragging(false), [])

  React.useEffect(() => {
    if (!isDragging || isMobile) return
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, isMobile])

  const handleThemeToggle = React.useCallback(() => {
    const currentTheme = resolvedTheme || "light"
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  const getButtonCenter = React.useCallback(() => {
    if (!buttonRef.current) {
      // Fallback: use position state if ref not ready
      return { 
        x: `${position.x + BUTTON_SIZE / 2}px`, 
        y: `${position.y + BUTTON_SIZE / 2}px` 
      }
    }
    const rect = buttonRef.current.getBoundingClientRect()
    return { 
      x: `${rect.left + rect.width / 2}px`, 
      y: `${rect.top + rect.height / 2}px` 
    }
  }, [position])

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
            <div
              ref={buttonRef}
              style={{
                position: "fixed",
                left: `${position.x}px`,
                top: `${position.y}px`,
                cursor: isMobile ? "pointer" : (isDragging ? "grabbing" : "grab"),
                zIndex: 1000,
                userSelect: "none",
              }}
              onMouseDown={handleMouseDown}
            >
      <ThemeToggleButton
        theme={(resolvedTheme || "light") as "light" | "dark"}
        onClick={handleThemeToggle}
        start={getButtonCenter()}
        key={`${position.x}-${position.y}`}
      />
    </div>
  )
}
