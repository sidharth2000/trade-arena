import { createContext, useContext, useState } from 'react'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { lightTheme, darkTheme } from '../styles/theme'

const ThemeToggleContext = createContext()

export function useThemeToggle() {
  return useContext(ThemeToggleContext)
}

export function AppThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false)

  return (
    <ThemeToggleContext.Provider value={{ isDark, toggle: () => setIsDark(d => !d) }}>
      <ThemeProvider theme={isDark ? darkTheme : lightTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeToggleContext.Provider>
  )
}