"use client"

import { createContext, useContext, useState, useCallback } from "react"

const CreditsContext = createContext()

export function CreditsProvider({ children }) {
  const [usedCredits, setUsedCredits] = useState(2)
  const TOTAL_CREDITS = 5

  const availableCredits = TOTAL_CREDITS - usedCredits
  const hasCreditsAvailable = availableCredits > 0

  const deductCredit = useCallback(() => {
    if (availableCredits > 0) {
      setUsedCredits((prev) => prev + 1)
      return true
    }
    return false
  }, [availableCredits])

  return (
    <CreditsContext.Provider
      value={{
        usedCredits,
        availableCredits,
        totalCredits: TOTAL_CREDITS,
        hasCreditsAvailable,
        deductCredit,
      }}
    >
      {children}
    </CreditsContext.Provider>
  )
}

export function useCredits() {
  const context = useContext(CreditsContext)
  if (!context) {
    throw new Error("useCredits must be used within CreditsProvider")
  }
  return context
}
