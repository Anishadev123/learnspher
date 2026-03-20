"use client"

import { createContext, useContext, useEffect, useState } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light")
  const [mounted, setMounted] = useState(false)

  // Initialize theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light"
    setTheme(savedTheme)
    document.documentElement.setAttribute("data-theme", savedTheme)
    setMounted(true)
  }, [])

  // Update theme and localStorage when theme changes
  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute("data-theme", theme)
      localStorage.setItem("theme", theme)
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
