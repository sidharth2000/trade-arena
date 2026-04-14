import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, IconButton, Button, Badge,
  Popover, List, ListItem, Divider, Typography,
  Box, CircularProgress,
} from '@mui/material'
import { Search, Moon, Sun, Tag, Bell, MessageCircle, Check, CheckCheck, LogOut } from 'lucide-react'
import { useTheme } from '@mui/material/styles'
import { useThemeToggle } from '../context/ThemeContext'
import { notificationApi } from '../api/NotificationApi'
import { useAuth } from '../hooks/useAuth'
import styles from './Navbar.module.css'

const TYPE_COLORS = {
  OUTBID:             '#f59e0b',
  AUCTION_WIN:        '#16a34a',
  PAYMENT_REMINDER:   '#ea580c',
  PAYMENT_SUCCESS:    '#16a34a',
  ACCOUNT_RESTRICTED: '#dc2626',
  FALLBACK_OFFER:     '#2563eb',
  BID_PLACED:         '#7c3aed',
  NEW_LISTING:        '#2874f0',
  AUCTION_ENDED:      '#64748b',
}

// The backend returns isRead (not read) — handle both just in case
const isRead = (n) => n.isRead === true || n.read === true

// Extract the notification ID reliably
const getId = (n) => n.notificationId ?? n.id

// Format timestamp
function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

export default function Navbar() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { isDark, toggle } = useThemeToggle()
  const { user } = useAuth()
  const [query, setQuery] = useState('')

  // ── Notification state ──
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifAnchor, setNotifAnchor] = useState(null)
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const esRef = useRef(null)
  const userIdRef = useRef(null)

  // ── Load all notifications from backend ──
  const loadNotifications = useCallback(async (uid) => {
    if (!uid) return
    setLoadingNotifs(true)
    try {
      const data = await notificationApi.getByUser(uid)
      // Backend returns plain array
      const list = Array.isArray(data) ? data : (data.content ?? [])
      setNotifications(list)
      setUnreadCount(list.filter((n) => !isRead(n)).length)
    } catch (err) {
      console.error('[Notifications] load error:', err)
    } finally {
      setLoadingNotifs(false)
    }
  }, [])

  // ── Subscribe to SSE + load notifications whenever userId changes ──
  useEffect(() => {
    const uid = user?.id
    userIdRef.current = uid

    // Close old SSE connection
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    // Clear notifications on logout
    if (!uid) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    // Load existing notifications
    loadNotifications(uid)

    // Open SSE stream
    const es = notificationApi.subscribe(uid, (incoming) => {
      console.log('[SSE] notification received:', incoming)
      // Add new notification to the top of the list
      setNotifications((prev) => {
        // Avoid duplicates
        const exists = prev.some((n) => getId(n) === getId(incoming))
        if (exists) return prev
        return [incoming, ...prev]
      })
      setUnreadCount((c) => c + 1)
    })

    es.onerror = (err) => console.error('[SSE] error:', err)
    esRef.current = es

    return () => {
      es.close()
      esRef.current = null
    }
  }, [user?.id, loadNotifications])

  // ── Open popover ──
  const handleOpenNotif = (e) => {
    setNotifAnchor(e.currentTarget)
    // Refresh list when opening
    loadNotifications(user?.id)
  }

  const handleCloseNotif = () => setNotifAnchor(null)

  // ── Mark single notification as read ──
  const handleMarkRead = async (notifId) => {
    if (!notifId) return
    try {
      await notificationApi.markRead(notifId)
      // Update local state — keep notification in list, just flip isRead
      setNotifications((prev) =>
        prev.map((n) =>
          getId(n) === notifId
            ? { ...n, isRead: true, read: true }
            : n
        )
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err) {
      console.error('[Notifications] markRead error:', err)
    }
  }

  // ── Mark all as read ──
  const handleMarkAll = async () => {
    if (!user?.id) return
    try {
      await notificationApi.markAllRead(user.id)
      // Update local state — keep all notifications, flip all isRead
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, read: true }))
      )
      setUnreadCount(0)
    } catch (err) {
      console.error('[Notifications] markAllRead error:', err)
    }
  }

  // ── Search ──
  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`)
    }
  }

  // ── Logout ──
  const handleLogout = () => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    localStorage.clear()
    navigate('/login')
  }

  const navBg = theme.palette.custom.nav

  return (
    <>
      <AppBar position="sticky" className={styles.nav}
        style={{ '--nav-bg': navBg }}>
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
            <button className={styles.searchBtn}
              onClick={() => query.trim() && navigate(`/products?search=${encodeURIComponent(query.trim())}`)}>
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
                {/* Bell icon with unread badge */}
                <IconButton className={styles.iconBtn} onClick={handleOpenNotif}>
                  <Badge badgeContent={unreadCount} color="error" max={99}>
                    <Bell size={20} color="#fff" />
                  </Badge>
                </IconButton>

                <IconButton className={styles.iconBtn} onClick={() => navigate('/chat')}>
                  <MessageCircle size={20} color="#fff" />
                </IconButton>

                <Button className={styles.sellBtn} startIcon={<Tag size={14} />}
                  onClick={() => navigate('/sell')}>
                  Sell
                </Button>

                <Button className={styles.loginBtn} onClick={handleLogout}
                  startIcon={<LogOut size={16} />}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button className={styles.loginBtn}
                  onClick={() => navigate('/login')}
                  style={{ color: navBg }}>
                  Login
                </Button>
                <Button className={styles.sellBtn} startIcon={<Tag size={14} />}
                  onClick={() => navigate('/sell')}>
                  Sell
                </Button>
              </>
            )}
          </div>
        </Toolbar>
      </AppBar>

      {/* ── Notification Popover ── */}
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={handleCloseNotif}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{ className: styles.notifPopover }}
      >
        {/* Header */}
        <Box className={styles.notifHeader}>
          <Typography variant="subtitle1" fontWeight={700}>
            Notifications
            {unreadCount > 0 && (
              <Box component="span" sx={{
                ml: 1, px: 1, py: 0.25, borderRadius: 10,
                background: '#ff6161', color: '#fff',
                fontSize: 11, fontWeight: 700
              }}>
                {unreadCount} unread
              </Box>
            )}
          </Typography>

          {unreadCount > 0 && (
            <Button size="small" startIcon={<CheckCheck size={14} />}
              onClick={handleMarkAll}
              sx={{ fontSize: 11, textTransform: 'none', color: navBg }}>
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Body */}
        {loadingNotifs ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Bell size={36} color="#ccc" />
            <Typography variant="body2" color="text.secondary" mt={1}>
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List disablePadding className={styles.notifList}>
            {notifications.map((n, i) => {
              const nId = getId(n)
              const read = isRead(n)
              const accent = TYPE_COLORS[n.type] ?? navBg

              return (
                <ListItem key={nId ?? i}
                  className={`${styles.notifItem} ${!read ? styles.notifUnread : ''}`}
                >
                  {/* Colour dot */}
                  <Box className={styles.notifDot} style={{ background: accent }} />

                  {/* Content */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={read ? 400 : 600}
                      sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.message}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.25 }}>
                      <Typography variant="caption" color="text.secondary">
                        {n.type?.replace(/_/g, ' ')}
                      </Typography>
                      {n.timestamp && (
                        <Typography variant="caption" color="text.secondary">
                          · {timeAgo(n.timestamp)}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Tick button — only show for unread */}
                  {!read && (
                    <IconButton size="small" title="Mark as read"
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(nId) }}
                      sx={{ ml: 0.5, flexShrink: 0 }}>
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