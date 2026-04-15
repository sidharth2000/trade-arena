import { useNavigate } from 'react-router-dom'
import {
        AppBar,
        Toolbar,
        IconButton,
        Button
        } from '@mui/material'
import {
        Search,
        Moon,
        Sun,
        Tag,
        User,
        Heart
        } from 'lucide-react'
import { useTheme } from '@mui/material/styles'
import { useThemeToggle } from '../context/ThemeContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { isDark, toggle } = useThemeToggle()

  const navBg = theme.palette.custom?.nav || '#2874f0'

    return (
            <AppBar
    position="sticky"
    className={styles.nav}
    style={{ '--nav-bg': navBg }}
    >
      <Toolbar className={styles.toolbar}>

            {/* Logo */}
            <div
    className={styles.logo}
    onClick={() => navigate('/')}
            >
            <div className={styles.logoMain}>TradeArena</div>
            <div className={styles.logoSub}>buy & sell smarter</div>
            </div>

            {/* Search */}
            <div className={styles.search}>
            <input
    className={styles.searchInput}
    placeholder="Search for products, categories..."
            />
            <button className={styles.searchBtn}>
            <Search size={16} color="#fff" />
            </button>
            </div>

            <div className={styles.spacer} />

            {/* Actions */}
            <div className={styles.actions}>

            {/* Theme toggle */}
            <IconButton onClick={toggle}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>

            {/* ❤️ Wishlist icon */}
            <IconButton>
            <Heart size={20} color="#fff" />
            </IconButton>

            {/* 👤 Profile icon */}
            <IconButton>
            <User size={20} color="#fff" />
            </IconButton>

            {/* Sell button */}
            <Button
    startIcon={<Tag size={14} />}
    onClick={() => navigate('/sell')}
            >
            Sell
            </Button>

            {/* Login button */}
            <Button onClick={() => navigate('/login')}>
            Login
            </Button>

            </div>

            </Toolbar>
            </AppBar>
  )
}