'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

export type Theme = 'day' | 'night'
type Ctx = { theme: Theme; toggle: () => void; setTheme: (t: Theme) => void }

const ThemeContext = createContext<Ctx>({ theme: 'day', toggle: () => {}, setTheme: () => {} })
export const useTheme = () => useContext(ThemeContext)

const KEY = 'innhaus-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('day')
  const mounted = useRef(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Theme | null
      // Sync React with the theme the <head> script already applied from localStorage.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved === 'night' || saved === 'day') setThemeState(saved)
    } catch {
      /* storage may be unavailable */
    }
  }, [])

  useEffect(() => {
    // Skip the first run: the inline script in <head> already applied the saved theme.
    if (!mounted.current) {
      mounted.current = true
      return
    }
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem(KEY, theme)
    } catch {
      /* ignore */
    }
  }, [theme])

  const setTheme = useCallback((t: Theme) => {
    const root = document.documentElement
    root.classList.add('theme-shift')
    setThemeState(t)
    window.setTimeout(() => root.classList.remove('theme-shift'), 900)
  }, [])

  const toggle = useCallback(() => setTheme(theme === 'day' ? 'night' : 'day'), [theme, setTheme])

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>
}
