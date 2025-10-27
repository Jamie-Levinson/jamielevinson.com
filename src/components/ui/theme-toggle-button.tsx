"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"

interface ThemeToggleButtonProps {
  theme: "light" | "dark"
  onClick: () => void
  variant?: "circle" | "circle-blur"
  start?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right"
}

export function ThemeToggleButton({
  theme,
  onClick,
  variant = "circle-blur",
  start = "top-right",
}: ThemeToggleButtonProps) {
  const handleClick = React.useCallback(() => {
    // Inject animation styles for this specific transition
    const styleId = `theme-transition-${Date.now()}`
    const style = document.createElement("style")
    style.id = styleId

    // Generate animation CSS based on variant
    let css = ""
    const positions = {
      center: "center",
      "top-left": "top left",
      "top-right": "top right",
      "bottom-left": "bottom left",
      "bottom-right": "bottom right",
    }

    if (variant === "circle" || variant === "circle-blur") {
      const cx = start === "center" ? "50" : start.includes("left") ? "0" : "100"
      const cy = start === "center" ? "50" : start.includes("top") ? "0" : "100"

      if (variant === "circle-blur") {
        css = `
          @supports (view-transition-name: none) {
            ::view-transition-old(root) { 
              animation: none;
            }
            ::view-transition-new(root) {
              animation: circle-blur-expand 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              transform-origin: ${positions[start]};
              filter: blur(0);
            }
            @keyframes circle-blur-expand {
              from {
                clip-path: circle(0% at ${cx}% ${cy}%);
                filter: blur(3px);
              }
              to {
                clip-path: circle(150% at ${cx}% ${cy}%);
                filter: blur(0);
              }
            }
          }
        `
      } else {
        css = `
          @supports (view-transition-name: none) {
            ::view-transition-old(root) { 
              animation: none;
            }
            ::view-transition-new(root) {
              animation: circle-expand 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94);
              transform-origin: ${positions[start]};
            }
            @keyframes circle-expand {
              from {
                clip-path: circle(0% at ${cx}% ${cy}%);
              }
              to {
                clip-path: circle(150% at ${cx}% ${cy}%);
              }
            }
          }
        `
      }
    }

    if (css) {
      style.textContent = css
      document.head.appendChild(style)

      // Clean up animation styles after transition
      setTimeout(() => {
        const styleEl = document.getElementById(styleId)
        if (styleEl) {
          styleEl.remove()
        }
      }, 500)
    }

    // Use View Transitions API if available
    if ("startViewTransition" in document) {
      // @ts-ignore - startViewTransition is not in types yet
      document.startViewTransition(() => {
        onClick()
      })
    } else {
      onClick()
    }
  }, [onClick, variant, start])

  return (
    <button
      onClick={handleClick}
      className="relative p-2 rounded-full border border-border bg-background hover:bg-accent/10 transition-colors duration-200 focus:outline-none active:outline-none"
      style={{ WebkitTapHighlightColor: 'transparent' }}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
    >
      <div className="relative w-4 h-4">
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

