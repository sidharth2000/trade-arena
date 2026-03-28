import App from './App'
import { AppThemeProvider } from './context/ThemeContext'

export default function Root() {
  return (
    <AppThemeProvider>
      <App />
    </AppThemeProvider>
  )
}