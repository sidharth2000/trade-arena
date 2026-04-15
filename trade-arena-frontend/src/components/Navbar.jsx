import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar, Toolbar, IconButton, Button, Badge,
  Popover, List, ListItem, Divider, Typography,
  Box, CircularProgress, Menu, MenuItem, Avatar,
} from '@mui/material'
import { Search, Moon, Sun, Tag, Bell, MessageCircle, Check, CheckCheck, LogOut, Heart, User, ShoppingBag } from 'lucide-react'
import { useTheme } from '@mui/material/styles'
import { useThemeToggle } from '../context/ThemeContext'
import { notificationApi } from '../api/NotificationApi'
import { useAuth } from '../hooks/useAuth'
import { useWishlist } from '../context/WishlistContext'
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

const isRead = (n) => n.isRead === true || n.read === true
const getId = (n) => n.notificationId ?? n.id

function timeAgo(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  if (diff < 60000) return 'just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return new Date(ts).toLocaleDateString()
}

// Get initials from email e.g. "john@gmail.com" → "J"
function getInitials(user) {
  if (!user) return '?'
  if (user.name) return user.name.charAt(0).toUpperCase()
  if (user.email) return user.email.charAt(0).toUpperCase()
  return '?'
}

export default function Navbar() {
  const navigate = useNavigate()
  const theme = useTheme()
  const { isDark, toggle } = useThemeToggle()
  const { user } = useAuth()
  const { count: wishlistCount } = useWishlist()
  const [query, setQuery] = useState('')

  // ── Notification state ──
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifAnchor, setNotifAnchor] = useState(null)
  const [loadingNotifs, setLoadingNotifs] = useState(false)
  const esRef = useRef(null)
  const userIdRef = useRef(null)

  // ── Profile dropdown state ──
  const [profileAnchor, setProfileAnchor] = useState(null)

  const loadNotifications = useCallback(async (uid) => {
    if (!uid) return
    setLoadingNotifs(true)
    try {
      const data = await notificationApi.getByUser(uid)
      const list = Array.isArray(data) ? data : (data.content ?? [])
      setNotifications(list)
      setUnreadCount(list.filter((n) => !isRead(n)).length)
    } catch (err) {
      console.error('[Notifications] load error:', err)
    } finally {
      setLoadingNotifs(false)
    }
  }, [])

  useEffect(() => {
    const uid = user?.id
    userIdRef.current = uid

    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }

    if (!uid) {
      setNotifications([])
      setUnreadCount(0)
      return
    }

    loadNotifications(uid)

    const es = notificationApi.subscribe(uid, (incoming) => {
      console.log('[SSE] notification received:', incoming)
      setNotifications((prev) => {
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

  const handleOpenNotif = (e) => {
    setNotifAnchor(e.currentTarget)
    loadNotifications(user?.id)
  }
  const handleCloseNotif = () => setNotifAnchor(null)

  const handleMarkRead = async (notifId) => {
    if (!notifId) return
    try {
      await notificationApi.markRead(notifId)
      setNotifications((prev) =>
          prev.map((n) => getId(n) === notifId ? { ...n, isRead: true, read: true } : n)
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch (err) {
      console.error('[Notifications] markRead error:', err)
    }
  }

  const handleMarkAll = async () => {
    if (!user?.id) return
    try {
      await notificationApi.markAllRead(user.id)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, read: true })))
      setUnreadCount(0)
    } catch (err) {
      console.error('[Notifications] markAllRead error:', err)
    }
  }

  const handleSearch = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/products?search=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleLogout = () => {
    if (esRef.current) {
      esRef.current.close()
      esRef.current = null
    }
    setProfileAnchor(null)
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
                    {/* Bell */}
                    <IconButton className={styles.iconBtn} onClick={handleOpenNotif}>
                      <Badge badgeContent={unreadCount} color="error" max={99}>
                        <Bell size={20} color="#fff" />
                      </Badge>
                    </IconButton>

                    {/* Chat */}
                    <IconButton className={styles.iconBtn} onClick={() => navigate('/chat')}>
                      <MessageCircle size={20} color="#fff" />
                    </IconButton>

                    {/* ✅ Wishlist with badge count */}
                    <IconButton className={styles.iconBtn} onClick={() => navigate('/wishlist')} title="Wishlist">
                      <Badge badgeContent={wishlistCount} color="error" max={99}>
                        <Heart size={20} color="#fff" />
                      </Badge>
                    </IconButton>

                    {/* ✅ Profile avatar — opens dropdown */}
                    <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ p: 0.5 }}>
                      <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: '#ff6161',
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                      >
                        {getInitials(user)}
                      </Avatar>
                    </IconButton>

                    <Button className={styles.sellBtn} startIcon={<Tag size={14} />}
                            onClick={() => navigate('/sell')}>
                      Sell
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

        {/* ── Profile Dropdown Menu ── */}
        <Menu
            anchorEl={profileAnchor}
            open={Boolean(profileAnchor)}
            onClose={() => setProfileAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                mt: 1,
                minWidth: 200,
                borderRadius: 2,
                boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
              }
            }}
        >
          {/* User info header */}
          <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
            <Typography variant="body2" fontWeight={700} noWrap>
              {user?.name ?? user?.email ?? 'My Account'}
            </Typography>
            {user?.email && user?.name && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user.email}
                </Typography>
            )}
          </Box>

          <MenuItem onClick={() => { setProfileAnchor(null); navigate('/profile') }}
                    sx={{ gap: 1.5, py: 1.2 }}>
            <User size={16} color="#666" />
            <Typography variant="body2">My Profile</Typography>
          </MenuItem>

          <MenuItem onClick={() => { setProfileAnchor(null); navigate('/orders') }}
                    sx={{ gap: 1.5, py: 1.2 }}>
            <ShoppingBag size={16} color="#666" />
            <Typography variant="body2">My Orders</Typography>
          </MenuItem>

          <Divider />

          <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1.2 }}>
            <LogOut size={16} color="#ff6161" />
            <Typography variant="body2" color="#ff6161">Logout</Typography>
          </MenuItem>
        </Menu>

        {/* ── Notification Popover ── */}
        <Popover
            open={Boolean(notifAnchor)}
            anchorEl={notifAnchor}
            onClose={handleCloseNotif}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{ className: styles.notifPopover }}
        >
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
                        <Box className={styles.notifDot} style={{ background: accent }} />

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
