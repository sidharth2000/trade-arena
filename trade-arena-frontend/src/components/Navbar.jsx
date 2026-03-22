import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Button, Badge } from '@mui/material'
import { Search, ShoppingBag, Moon, Sun, Tag } from 'lucide-react'
import { useTheme } from '@mui/material/styles'
import { useThemeToggle } from '../context/ThemeContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { isDark, toggle } = useThemeToggle()
  const [query, setQuery] = useState('')

  return (
    <AppBar position="sticky" className={styles.nav}
      style={{ '--nav-bg': theme.palette.custom.nav }}>
      <Toolbar className={styles.toolbar}>

        <div className={styles.logo} onClick={() => navigate('/')}>
          <div className={styles.logoMain}>TradeArena</div>
          <div className={styles.logoSub}>buy &amp; sell smarter</div>
        </div>

        <div className={styles.search}>
          <input
            className={styles.searchInput}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for products, categories..."
          />
          <button className={styles.searchBtn}>
            <Search size={16} color="#fff" strokeWidth={2.5} />
          </button>
        </div>

        <div className={styles.spacer} />

        <div className={styles.actions}>
          <IconButton className={styles.themeBtn} onClick={toggle}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </IconButton>

          <Button
            className={styles.loginBtn}
            onClick={() => navigate('/login')}
            style={{ color: theme.palette.custom.nav }}
          >
            Login
          </Button>

          <Button
            className={styles.sellBtn}
            startIcon={<Tag size={14} />}
          >
            Sell
          </Button>

          <div className={styles.cart} onClick={() => navigate('/cart')}>
            <Badge badgeContent={0} color="error">
              <ShoppingBag size={20} color="#fff" />
            </Badge>
            <span className={styles.cartLabel}>Cart</span>
          </div>
        </div>

      </Toolbar>
    </AppBar>
  )
}