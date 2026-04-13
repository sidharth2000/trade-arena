import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppBar, Toolbar, IconButton, Button, Badge, Popover, List, ListItem, Divider, Typography, Box, CircularProgress } from '@mui/material'
import { Search, Moon, Sun, Tag, Bell, MessageCircle, Check, CheckCheck } from 'lucide-react'
import { useTheme } from '@mui/material/styles'
import { useThemeToggle } from '../context/ThemeContext'
import { notificationApi } from '../api/NotificationApi'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'

const TYPE_COLORS = {
  OUTBID: '#f59e0b',
  AUCTION_WIN: '#16a34a',
  PAYMENT_REMINDER: '#ea580c',
  PAYMENT_SUCCESS: '#16a34a',
  ACCOUNT_RESTRICTED: '#dc2626',
  FALLBACK_OFFER: '#2563eb',
  BID_PLACED: '#7c3aed',
  NEW_LISTING: '#2874f0',
  AUCTION_ENDED: '#64748b',
}

export default function Navbar() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { isDark, toggle } = useThemeToggle()
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  // Notification state
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifAnchor, setNotifAnchor] = useState(null)
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const esRef = useRef(null)

  const loadNotifications = useCallback(async () => {
    if (!user?.id) return
    setLoadingNotifs(true)
    try {
      const data = await notificationApi.getByUser(user.id)
      const list = Array.isArray(data) ? data : data.content ?? []
      setNotifications(list)
      setUnreadCount(list.filter((n) => !n.read).length)
    } catch {
      // ignore
    } finally {
      setLoadingNotifs(false)
    }
  }, [user?.id])

  // SSE subscription
  useEffect(() => {
    if (!user?.id) return
    loadNotifications()
    const es = notificationApi.subscribe(user.id, (incoming) => {
      setNotifications((prev) => [incoming, ...prev])
      setUnreadCount((c) => c + 1)
    })
    esRef.current = es
    return () => es.close()
  }, [user?.id, loadNotifications])

  const handleOpenNotif = (e) => {
    setNotifAnchor(e.currentTarget)
    loadNotifications()
  }
  const handleCloseNotif = () => setNotifAnchor(null)

  const handleMarkRead = async (id) => {
    await notificationApi.markRead(id)
    setNotifications((prev) =>
      prev.map((n) => (n.id === id || n.notificationId === id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  const handleMarkAll = async () => {
    if (!user?.id) return
    await notificationApi.markAllRead(user.id)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <>
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
              onKeyDown={handleSearch}
              placeholder="Search for products, categories..."
            />
            <button className={styles.searchBtn} onClick={() => query.trim() && navigate(`/products?search=${encodeURIComponent(query.trim())}`)}>
              <Search size={16} color="#fff" strokeWidth={2.5} />
            </button>
          </div>

          <div className={styles.spacer} />

          <div className={styles.actions}>
            <IconButton className={styles.themeBtn} onClick={toggle}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </IconButton>

            {user ? (
              <>
                {/* Notification Bell */}
                <IconButton className={styles.iconBtn} onClick={handleOpenNotif}>
                  <Badge badgeContent={unreadCount} color="error" max={99}>
                    <Bell size={20} color="#fff" />
                  </Badge>
                </IconButton>

                {/* Chat */}
                <IconButton className={styles.iconBtn} onClick={() => navigate('/chat')}>
                  <MessageCircle size={20} color="#fff" />
                </IconButton>

                <Button
                  className={styles.sellBtn}
                  startIcon={<Tag size={14} />}
                  onClick={() => navigate('/sell')}
                >
                  Sell
                </Button>
              </>
            ) : (
              <>
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
                  onClick={() => navigate('/sell')}
                >
                  Sell
                </Button>
              </>
            )}
          </div>

        </Toolbar>
      </AppBar>

      {/* Notification Popover */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={handleCloseNotif}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ className: styles.notifPopover }}
      >
        <Box className={styles.notifHeader}>
          <Typography variant="subtitle1" fontWeight={700}>Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" startIcon={<CheckCheck size={14} />} onClick={handleMarkAll}
              sx={{ fontSize: 11, textTransform: 'none' }}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {loadingNotifs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Bell size={32} color="#ccc" />
            <Typography variant="body2" color="text.secondary" mt={1}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding className={styles.notifList}>
            {notifications.slice(0, 20).map((n, i) => {
              const nId = n.notificationId ?? n.id
              const accent = TYPE_COLORS[n.type] ?? '#2874f0'
              return (
                <ListItem
                  key={nId ?? i}
                  className={`${styles.notifItem} ${!n.read ? styles.notifUnread : ''}`}
                  onClick={() => !n.read && handleMarkRead(nId)}
                >
                  <Box className={styles.notifDot} style={{ background: accent }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={n.read ? 400 : 600}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {n.type?.replace(/_/g, ' ')}
                    </Typography>
                  </Box>
                  {!n.read && (
                    <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleMarkRead(nId) }}>
                      <Check size={14} />
                    </IconButton>
                  )}
                </ListItem>
              )
            })}
          </List>
        )}
      </Popover>
    </>
  )
}