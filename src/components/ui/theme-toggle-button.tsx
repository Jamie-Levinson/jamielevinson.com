"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleButtonProps {
  theme: "light" | "dark"
  onClick: () => void
  start?: { x: string; y: string } | string
}

export function ThemeToggleButton({
  theme,
  onClick,
  start = "top-right",
}: ThemeToggleButtonProps) {
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  
  const handleClick = React.useCallback(() => {
    const styleId = `theme-transition-${Date.now()}`
    const style = document.createElement("style")
    style.id = styleId

    // Handle custom coordinates - calculate at click time to ensure accuracy
    let cx: string, cy: string
    let transformOrigin: string
    
    if (typeof start === "object") {
      // Try to get actual button position if available (more accurate)
      let actualX = start.x
      let actualY = start.y
      
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect()
        actualX = `${rect.left + rect.width / 2}px`
        actualY = `${rect.top + rect.height / 2}px`
      }
      
      // Convert pixel coordinates to viewport percentages
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight
      
      const xMatch = actualX.match(/[\d.]+/)
      const yMatch = actualY.match(/[\d.]+/)
      
      if (xMatch && yMatch) {
        const xNum = parseFloat(xMatch[0])
        const yNum = parseFloat(yMatch[0])
        
        cx = actualX.includes('%') ? xNum.toString() : ((xNum / viewportWidth) * 100).toString()
        cy = actualY.includes('%') ? yNum.toString() : ((yNum / viewportHeight) * 100).toString()
        transformOrigin = `${actualX} ${actualY}`
      } else {
        cx = "50"
        cy = "50"
        transformOrigin = "50% 50%"
      }
    } else {
      // Fallback for string (shouldn't be used but keeps types happy)
      cx = "50"
      cy = "50"
      transformOrigin = "50% 50%"
    }

    const css = `
      @supports (view-transition-name: none) {
        ::view-transition-old(root) { 
          animation: none;
          z-index: 1;
        }
        ::view-transition-new(root) {
          animation: circle-blur-expand 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: ${transformOrigin};
          filter: blur(0);
          z-index: 9999;
        }
        @keyframes circle-blur-expand {
          from {
            clip-path: circle(0.1% at ${cx}% ${cy}%);
            filter: blur(5px);
          }
          to {
            clip-path: circle(141.42% at ${cx}% ${cy}%);
            filter: blur(0);
          }
        }
      }
    `

    style.textContent = css
    document.head.appendChild(style)

    setTimeout(() => {
      const styleEl = document.getElementById(styleId)
      if (styleEl) styleEl.remove()
    }, 600)

    // Use View Transitions API if available
    if ("startViewTransition" in document) {
      document.startViewTransition(() => onClick())
    } else {
      onClick()
    }
  }, [onClick, start])

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className="relative p-3 rounded-full border border-border bg-background hover:bg-accent/10 transition-colors duration-200 focus:outline-none active:outline-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={`Toggle dark/light mode`}
    >
      <div className="relative w-6 h-6">
        {theme === "light" ? (
          <Sun className="w-full h-full text-foreground" />
        ) : (
          <Moon className="w-full h-full text-foreground" />
        )}
      </div>
    </button>
  )
}

export function useThemeTransition() {
  return {
    startTransition: (callback: () => void) => {
      callback()
    },
  }
}
