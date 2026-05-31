import { createContext, useContext, useState, useCallback } from 'react'

const RefreshContext = createContext(null)

export function RefreshProvider({ children }) {
  const [tick, setTick] = useState(0)
  const triggerRefresh = useCallback(() => setTick(t => t + 1), [])
  return (
    <RefreshContext.Provider value={{ tick, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  )
}

export function useRefresh() {
  return useContext(RefreshContext)
}
