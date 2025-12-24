"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { ThemeToggleButton } from "@/components/ui/theme-toggle-button"

const BUTTON_SIZE = 48

// Helper function to clamp position within screen bounds
const clampToBounds = (x: number, y: number) => {
  // Check if window exists (SSR safety)
  if (globalThis.window === undefined) return { x, y }
  
  const minX = 0
  const maxX = globalThis.window.innerWidth - BUTTON_SIZE
  const minY = 0
  const maxY = globalThis.window.innerHeight - BUTTON_SIZE
  
  return {
    x: Math.max(minX, Math.min(maxX, x)),
    y: Math.max(minY, Math.min(maxY, y))
  }
}

export function ThemeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [position, setPosition] = React.useState<{x: number, y: number} | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 })
  const [initialMousePos, setInitialMousePos] = React.useState({ x: 0, y: 0 })
  const [hasBeenDragged, setHasBeenDragged] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const buttonRef = React.useRef<HTMLDivElement>(null)

  // Initialize position on mount and handle resize
  React.useEffect(() => {
    setMounted(true)
    setIsMobile('ontouchstart' in globalThis || navigator.maxTouchPoints > 0)
    
    const updatePosition = () => {
      const placeholder = document.getElementById('theme-toggle-placeholder')
      if (placeholder) {
        const rect = placeholder.getBoundingClientRect()
        setPosition({ 
          x: rect.left + rect.width / 2 - BUTTON_SIZE / 2,
          y: rect.top + rect.height / 2 - BUTTON_SIZE / 2
        })
        return true
      }
      return false
    }
    
    // Initial position
    const found = updatePosition()
    
    if (!found && globalThis.window) {
        const containerWidth = Math.min(globalThis.window.innerWidth, 1152)
        const margin = (globalThis.window.innerWidth - containerWidth) / 2
        const safeX = globalThis.window.innerWidth - margin - 24 - BUTTON_SIZE 
        setPosition({ 
            x: Math.max(20, safeX), 
            y: 28
        })
        setTimeout(updatePosition, 100)
    }
    
    // Only clamp to screen bounds on resize, don't snap back to placeholder
    const handleResize = () => {
      setPosition(p => p ? clampToBounds(p.x, p.y) : null)
    }

    globalThis.window?.addEventListener('resize', handleResize)
    
    return () => {
      globalThis.window?.removeEventListener('resize', handleResize)
    }
  }, [])

  // Drag handling
  const handleMouseDown = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current || isMobile) return
    const rect = buttonRef.current.getBoundingClientRect()
    setIsDragging(true)
    setDragStart({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    setInitialMousePos({ x: e.clientX, y: e.clientY })
    e.preventDefault() 
  }, [isMobile])

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return
    
    const moveThreshold = 5
    const moveX = Math.abs(e.clientX - initialMousePos.x)
    const moveY = Math.abs(e.clientY - initialMousePos.y)
    
    if (!hasBeenDragged && (moveX > moveThreshold || moveY > moveThreshold)) {
      setHasBeenDragged(true)
      globalThis.window?.dispatchEvent(new Event('themeToggleDragged'))
    }
    
    setPosition(clampToBounds(e.clientX - dragStart.x, e.clientY - dragStart.y))
  }, [isDragging, dragStart, initialMousePos, hasBeenDragged])

  const handleMouseUp = React.useCallback(() => {
    setIsDragging(false)
  }, [])

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
    if (hasBeenDragged && isDragging) return
    const currentTheme = resolvedTheme || "light"
    setTheme(currentTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme, hasBeenDragged, isDragging])

  const getButtonCenter = React.useCallback(() => {
    if (!buttonRef.current || !position) {
      return { 
        x: position ? `${position.x + BUTTON_SIZE / 2}px` : '0px', 
        y: position ? `${position.y + BUTTON_SIZE / 2}px` : '0px'
      }
    }
    const rect = buttonRef.current.getBoundingClientRect()
    return { 
      x: `${rect.left + rect.width / 2}px`, 
      y: `${rect.top + rect.height / 2}px` 
    }
  }, [position])

  if (!mounted || !position) {
    return null
  }

  const getCursorStyle = () => {
    if (isMobile) return "pointer"
    return isDragging ? "grabbing" : "grab"
  }

  return (
    <div
      ref={buttonRef}
      role="none"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: getCursorStyle(),
        zIndex: 1000,
        userSelect: "none",
        touchAction: "none",
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
