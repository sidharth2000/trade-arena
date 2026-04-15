import App from './App'
import { AppThemeProvider } from './context/ThemeContext'
import { WishlistProvider } from './context/WishlistContext'

export default function Root() {
    return (
        <AppThemeProvider>
            <WishlistProvider>
                <App />
            </WishlistProvider>
        </AppThemeProvider>
    )
}
