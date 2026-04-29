import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Grid, Typography, Button, Chip, Divider,
  Paper, Skeleton, Alert, Breadcrumbs, Link, IconButton,
  Table, TableBody, TableHead, TableRow, TableCell,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, InputAdornment, CircularProgress
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ChevronRight, ChevronLeft, Package, Shield, RefreshCw,
  Truck, MessageCircle, Share2, Heart, Clock, Gavel,
  ArrowLeft, X, CheckCircle, AlertCircle,
  Trophy, Users, TrendingUp, Ban, HelpCircle
} from 'lucide-react'
import { productApi } from '../api/ProductApi'
import { useAuth } from '../hooks/useAuth'
import styles from './ProductDetailPage.module.css'
import { auctionApi } from '../api/AuctionApi'

/* ─────────────────────────────────────────────
   Constants & helpers
───────────────────────────────────────────── */
const CONDITION_META = {
  NEW:         { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  USED:        { color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  REFURBISHED: { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
}

function resolveImage(img) {
  if (!img) return null
  if (img.data?.startsWith('data:') || img.data?.startsWith('http')) return img.data
  if (img.data) return `data:${img.mimeType ?? 'image/jpeg'};base64,${img.data}`
  if (img.url) return img.url
  return null
}

function getCurrentUserId() {
  try {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored)?.id : null
  } catch { return null }
}

/* ─────────────────────────────────────────────
   Countdown Timer
───────────────────────────────────────────── */
function CountdownTimer({ endTime }) {
  const [rem, setRem] = useState({ h: 0, m: 0, s: 0, ended: false })
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date()
      if (diff <= 0) { setRem({ h: 0, m: 0, s: 0, ended: true }); return }
      setRem({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        ended: false,
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [endTime])

  if (rem.ended) return (
    <Chip label="Auction Ended" size="small"
      sx={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
  )

  return (
    <Box sx={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {[{ v: rem.h, label: 'HRS' }, { v: rem.m, label: 'MIN' }, { v: rem.s, label: 'SEC' }]
        .map(({ v, label }, i) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{
              minWidth: 52, textAlign: 'center', background: '#1a1a1a',
              borderRadius: 1.5, py: 0.75, px: 1,
            }}>
              <Typography sx={{ color: '#fff', fontFamily: 'monospace', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
                {String(v).padStart(2, '0')}
              </Typography>
              <Typography sx={{ color: '#aaa', fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>{label}</Typography>
            </Box>
            {i < 2 && (
              <Typography sx={{ color: '#ff6161', fontWeight: 800, fontSize: 20, mx: 0.25 }}>:</Typography>
            )}
          </Box>
        ))}
    </Box>
  )
}

/* ─────────────────────────────────────────────
   Bid Leaderboard
───────────────────────────────────────────── */
function BidLeaderboard({ bids = [], auctionStatus, navBg, isDark }) {
  const currentUserId = getCurrentUserId()

  // Sort descending by amount, deduplicate per bidder keeping their highest
  const ranked = useMemo(() => {
    const byBidder = {}
    bids.forEach(bid => {
      const key = bid.bidderId
      if (!byBidder[key] || Number(bid.amount) > Number(byBidder[key].amount)) {
        byBidder[key] = bid
      }
    })
    return Object.values(byBidder)
      .sort((a, b) => Number(b.amount) - Number(a.amount))
  }, [bids])

  if (!bids.length) return null

  const rankIcon = (i) => {
    if (i === 0) return <Trophy size={14} color="#f59e0b" />
    if (i === 1) return <Trophy size={14} color="#94a3b8" />
    if (i === 2) return <Trophy size={14} color="#cd7f32" />
    return <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary' }}>#{i + 1}</Typography>
  }

  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Box sx={{ width: 3, height: 20, background: navBg, borderRadius: 2 }} />
        <Typography variant="subtitle1" fontWeight={700}>Bid Leaderboard</Typography>
        <Chip
          label={`${bids.length} bid${bids.length !== 1 ? 's' : ''}`}
          size="small"
          icon={<Users size={11} />}
          sx={{ fontSize: 11, height: 22, ml: 0.5, background: isDark ? '#1e293b' : '#f1f5f9' }}
        />
      </Box>

      <Paper elevation={0} sx={{
        border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
        borderRadius: 2, overflow: 'hidden',
      }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ background: isDark ? '#0f172a' : '#f8fafc' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', py: 1.25, width: 48 }}>RANK</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', py: 1.25 }}>BIDDER</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', py: 1.25 }}>AMOUNT</TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, fontSize: 11, color: 'text.secondary', py: 1.25, width: 90 }}>TIME</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ranked.map((bid, i) => {
              const isMe = String(bid.bidderId) === String(currentUserId)
              const isTop = i === 0

              return (
                <TableRow
                  key={bid.bidId ?? i}
                  sx={{
                    background: isMe
                      ? isDark ? 'rgba(37,99,235,0.18)' : 'rgba(37,99,235,0.06)'
                      : isTop
                        ? isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.05)'
                        : 'transparent',
                    '&:last-child td': { border: 0 },
                    ...(isMe && {
                      outline: `2px solid ${navBg}`,
                      outlineOffset: '-2px',
                    }),
                  }}
                >
                  <TableCell sx={{ py: 1.25 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {rankIcon(i)}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ py: 1.25 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box sx={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: isMe
                          ? `linear-gradient(135deg, ${navBg}, #1a5dc8)`
                          : isDark ? '#334155' : '#e2e8f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Typography sx={{
                          fontSize: 11, fontWeight: 800,
                          color: isMe ? '#fff' : 'text.secondary',
                        }}>
                          {isMe ? 'ME' : `B${i + 1}`}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" fontWeight={isMe ? 700 : 500} fontSize={13}>
                          {isMe ? 'You' : `Bidder #${i + 1}`}
                        </Typography>
                        {isTop && auctionStatus === 'ENDED' && (
                          <Typography sx={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>
                            Highest Bid
                          </Typography>
                        )}
                        {isMe && !isTop && (
                          <Typography sx={{ fontSize: 10, color: navBg, fontWeight: 600 }}>
                            Your best bid
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell align="right" sx={{ py: 1.25 }}>
                    <Typography fontWeight={700} fontSize={14} color={isTop ? '#f59e0b' : 'text.primary'}>
                      ₹{Number(bid.amount).toLocaleString('en-IN')}
                    </Typography>
                  </TableCell>

                  <TableCell align="right" sx={{ py: 1.25 }}>
                    <Typography variant="caption" color="text.secondary">
                      {bid.placedAt
                        ? new Date(bid.placedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  )
}

/* ─────────────────────────────────────────────
   Auction Info Block (timer + status messaging)
───────────────────────────────────────────── */
function AuctionInfoBlock({ product, auctionDetail, navBg, isDark }) {
  const auctionStatus = auctionDetail?.status

  // ── ACTIVE auction ──
  if (auctionStatus === 'ACTIVE') {
    const endTime = auctionDetail?.endTime ?? product?.quickBidEndTime
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <Clock size={15} color="#ff6161" />
          <Typography variant="body2" fontWeight={700} color="#ff6161">Auction ends in</Typography>
        </Box>
        {endTime && <CountdownTimer endTime={endTime} />}
      </Box>
    )
  }

  // ── ENDED auction ──
  if (auctionStatus === 'ENDED') {
    const endedAt = auctionDetail?.endTime
      ? new Date(auctionDetail.endTime).toLocaleString('en-IN', {
          day: 'numeric', month: 'short', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : null

    const bids = auctionDetail?.bids ?? []
    const highestBid = bids.length
      ? Math.max(...bids.map(b => Number(b.amount)))
      : null

    return (
      <Box sx={{ mb: 3 }}>
        {/* Ended badge */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
          <Chip
            label="Auction Ended"
            size="small"
            sx={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 11 }}
          />
          {endedAt && (
            <Typography variant="caption" color="text.secondary">
              Ended {endedAt}
            </Typography>
          )}
        </Box>

        {/* Highest bid + awaiting notice */}
        {highestBid !== null && (
          <Paper elevation={0} sx={{
            border: `1px solid ${isDark ? '#854d0e' : '#fde68a'}`,
            background: isDark ? 'rgba(120,53,15,0.2)' : '#fffbeb',
            borderRadius: 2, p: 2, display: 'flex', alignItems: 'flex-start', gap: 1.5,
          }}>
            <TrendingUp size={20} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
            <Box>
              <Typography variant="body2" fontWeight={700} color="#b45309" mb={0.25}>
                Highest bid: ₹{Number(highestBid).toLocaleString('en-IN')}
              </Typography>
              <Typography variant="caption" color="#92400e">
                Awaiting seller confirmation — the seller will review all bids and confirm the winner shortly.
              </Typography>
            </Box>
          </Paper>
        )}

        {!bids.length && (
          <Paper elevation={0} sx={{
            border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
            background: isDark ? '#0f172a' : '#f8fafc',
            borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
          }}>
            <HelpCircle size={18} color="#94a3b8" />
            <Typography variant="body2" color="text.secondary">
              No bids were placed in this auction.
            </Typography>
          </Paper>
        )}
      </Box>
    )
  }

  // ── PENDING_PAYMENT ──
  if (auctionStatus === 'PENDING_PAYMENT') {
    return (
      <Box sx={{ mb: 3 }}>
        <Paper elevation={0} sx={{
          border: `1px solid #bfdbfe`,
          background: '#eff6ff',
          borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1.5,
        }}>
          <CheckCircle size={18} color="#2563eb" />
          <Box>
            <Typography variant="body2" fontWeight={700} color="#1d4ed8">Winner confirmed</Typography>
            <Typography variant="caption" color="#1e40af">Auction is closed — awaiting payment from winner.</Typography>
          </Box>
        </Paper>
      </Box>
    )
  }

  // ── COMPLETED / CANCELLED / fallback ──
  if (auctionStatus === 'COMPLETED') {
    return (
      <Box sx={{ mb: 3 }}>
        <Chip label="Auction Completed" size="small"
          sx={{ background: '#f0fdf4', color: '#16a34a', fontWeight: 700, border: '1px solid #bbf7d0' }} />
      </Box>
    )
  }

  if (auctionStatus === 'CANCELLED') {
    return (
      <Box sx={{ mb: 3 }}>
        <Chip label="Auction Cancelled" size="small"
          sx={{ background: '#fef2f2', color: '#dc2626', fontWeight: 700, border: '1px solid #fecaca' }} />
      </Box>
    )
  }

  // product-level fallback (no auction detail yet loaded)
  if (product?.quickBidEndTime) {
    return (
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
          <Clock size={15} color="#ff6161" />
          <Typography variant="body2" fontWeight={700} color="#ff6161">Auction ends in</Typography>
        </Box>
        <CountdownTimer endTime={product.quickBidEndTime} />
      </Box>
    )
  }

  return null
}

/* ─────────────────────────────────────────────
   Bid Modal
───────────────────────────────────────────── */
function BidModal({ open, onClose, product, auctionDetail, navBg }) {
  const startingPrice = auctionDetail?.startingPrice ?? product?.quickBidStartingPrice ?? product?.price ?? 0

  const bids = auctionDetail?.bids ?? []
  const currentHighest = bids.length
    ? Math.max(...bids.map(b => Number(b.amount)))
    : Number(startingPrice)

  const minRequired = currentHighest  // must be strictly GREATER than this

  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')
  const [success, setSuccess] = useState(false)

  const numAmount = parseFloat(amount)
  const isValidNumber = !isNaN(numAmount) && amount.trim() !== ''
  const isHighEnough = isValidNumber && numAmount > minRequired
  const canConfirm = isHighEnough && !submitting

  const handleClose = () => {
    if (submitting) return
    setAmount(''); setApiError(''); setSuccess(false)
    onClose()
  }

  const handleConfirm = async () => {
    if (!canConfirm) return
    setApiError('')
    setSubmitting(true)
    try {
      const stored = localStorage.getItem('user')
      const userObj = stored ? JSON.parse(stored) : null
      const bidderId = userObj?.id
      if (!bidderId) { setApiError('Could not identify bidder. Please log in again.'); return }
      await auctionApi.placeBid({ productId: product.id, bidderId, amount: numAmount })
      setSuccess(true)
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  let validationNode = null
  if (success) {
    validationNode = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 1.5, background: '#f0fdf4', mb: 2 }}>
        <CheckCircle size={16} color="#16a34a" />
        <Typography variant="body2" color="#16a34a" fontWeight={600}>Bid placed successfully!</Typography>
      </Box>
    )
  } else if (isValidNumber && !isHighEnough) {
    validationNode = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 1.5, background: '#fff7ed', mb: 2 }}>
        <AlertCircle size={16} color="#d97706" />
        <Typography variant="body2" color="#d97706" fontWeight={600}>
          Bid must be higher than ₹{Number(minRequired).toLocaleString('en-IN')}
        </Typography>
      </Box>
    )
  } else if (isHighEnough) {
    validationNode = (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 1.5, background: '#f0fdf4', mb: 2 }}>
        <CheckCircle size={16} color="#16a34a" />
        <Typography variant="body2" color="#16a34a" fontWeight={600}>
          Valid bid — higher than current highest (₹{Number(minRequired).toLocaleString('en-IN')})
        </Typography>
      </Box>
    )
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth
      PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>

      <DialogTitle sx={{ pb: 0.5, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Box>
          <Typography fontWeight={700} fontSize={18}>Place a bid</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.25}>
            Starting price: ₹{Number(startingPrice).toLocaleString('en-IN')}
          </Typography>
        </Box>
        <IconButton size="small" onClick={handleClose} sx={{ mt: -0.5, mr: -0.5 }}>
          <X size={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Current highest bid callout */}
        {bids.length > 0 && (
          <Box sx={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            p: 1.5, mb: 2, borderRadius: 2,
            background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: '1px solid #fbbf24',
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <TrendingUp size={15} color="#92400e" />
              <Typography variant="body2" fontWeight={600} color="#92400e">Current highest bid</Typography>
            </Box>
            <Typography fontWeight={800} fontSize={16} color="#78350f">
              ₹{Number(currentHighest).toLocaleString('en-IN')}
            </Typography>
          </Box>
        )}

        <Typography variant="body2" color="text.secondary" mb={0.75} fontWeight={600}>
          Your bid amount
        </Typography>

        <TextField
          fullWidth type="number"
          placeholder={`Min. ₹${Number(minRequired + 1).toLocaleString('en-IN')}`}
          value={amount}
          onChange={e => { setAmount(e.target.value); setApiError(''); setSuccess(false) }}
          disabled={submitting || success}
          inputProps={{ min: minRequired + 0.01, step: 0.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Typography fontWeight={600} color="text.secondary">₹</Typography>
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 1.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              ...(isHighEnough && !success && {
                '& fieldset': { borderColor: '#16a34a' },
                '&:hover fieldset': { borderColor: '#16a34a' },
              }),
              ...(isValidNumber && !isHighEnough && {
                '& fieldset': { borderColor: '#d97706' },
                '&:hover fieldset': { borderColor: '#d97706' },
              }),
            }
          }}
        />

        {validationNode}

        {apiError && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 1.25, borderRadius: 1.5, background: '#fff1f2', mb: 1 }}>
            <AlertCircle size={16} color="#dc2626" />
            <Typography variant="body2" color="#dc2626" fontWeight={600}>{apiError}</Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        {success ? (
          <Button fullWidth variant="contained" onClick={handleClose}
            sx={{ borderRadius: 2, py: 1.25, fontWeight: 700, background: '#16a34a', '&:hover': { background: '#15803d' } }}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="outlined" onClick={handleClose} disabled={submitting}
              sx={{ flex: 1, borderRadius: 2, py: 1.25, fontWeight: 700, textTransform: 'none' }}>
              Cancel
            </Button>
            <Button variant="contained" disabled={!canConfirm} onClick={handleConfirm}
              startIcon={submitting ? <CircularProgress size={15} color="inherit" /> : <Gavel size={15} />}
              sx={{
                flex: 1, borderRadius: 2, py: 1.25, fontWeight: 700, textTransform: 'none',
                background: navBg,
                '&:hover': { background: '#1a5dc8' },
                '&:disabled': { background: '#c7d2e8', color: '#fff' },
              }}>
              {submitting ? 'Placing…' : 'Confirm bid'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}

/* ─────────────────────────────────────────────
   Page Skeleton
───────────────────────────────────────────── */
function PageSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Skeleton variant="rectangular" height={420} sx={{ borderRadius: 2 }} />
          <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} variant="rectangular" width={68} height={68} sx={{ borderRadius: 1 }} />
            ))}
          </Box>
        </Grid>
        <Grid item xs={12} md={7}>
          <Skeleton variant="text" height={44} width="85%" />
          <Skeleton variant="text" height={28} width="45%" sx={{ mt: 1 }} />
          <Skeleton variant="text" height={56} width="32%" sx={{ mt: 2 }} />
          <Skeleton variant="rectangular" height={56} sx={{ mt: 3, borderRadius: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ mt: 2, borderRadius: 2 }} />
        </Grid>
      </Grid>
    </Container>
  )
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const { user } = useAuth()
  const navBg = theme.palette.custom.nav
  const isDark = theme.palette.mode === 'dark'

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bidModalOpen, setBidModalOpen] = useState(false)

  // Auction detail state
  const [auctionDetail, setAuctionDetail] = useState(null)
  const [auctionLoading, setAuctionLoading] = useState(false)

  // Fetch product
  useEffect(() => {
    let cancelled = false
    const fetchProduct = async () => {
      setLoading(true); setError('')
      try {
        const data = await productApi.getProductById(id)
        if (!cancelled) setProduct(data)
      } catch {
        if (!cancelled) setError('Failed to load product. Please try again.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProduct()
    return () => { cancelled = true }
  }, [id])

  // Fetch auction detail when product status is AUCTION
  useEffect(() => {
    if (!product || product.status !== 'AUCTION') return
    let cancelled = false
    const fetchAuction = async () => {
      setAuctionLoading(true)
      try {
        const data = await auctionApi.getAuctionByProductId(product.id)
        if (!cancelled) setAuctionDetail(data)
      } catch {
        // Silently fail — page still works, just no auction detail
      } finally {
        if (!cancelled) setAuctionLoading(false)
      }
    }
    fetchAuction()
    return () => { cancelled = true }
  }, [product])

  if (loading) return <PageSkeleton />

  if (error || !product) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>{error || 'Product not found'}</Alert>
      <Button startIcon={<ArrowLeft size={16} />} onClick={() => navigate('/')}>
        Back to listings
      </Button>
    </Container>
  )

  const images = product.images ?? []
  const imgSrc = resolveImage(images[activeImg])
  const isAuction = product.status === 'AUCTION'

  const auctionStatus = auctionDetail?.status  // 'ACTIVE' | 'ENDED' | 'PENDING_PAYMENT' | 'COMPLETED' | 'CANCELLED' | null

  // Place bid is enabled ONLY when auction status from API is ACTIVE
  const canPlaceBid = isAuction && auctionStatus === 'ACTIVE'

  // Price display
  const price = isAuction
    ? (auctionDetail?.startingPrice ?? product?.quickBidStartingPrice ?? product?.price)
    : product.price

  const condMeta = CONDITION_META[product.condition] ?? { color: '#666', bg: '#f5f5f5', border: '#e0e0e0' }

  const handleShare = async () => {
    await navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Box sx={{ background: theme.palette.background.default, minHeight: '100vh', pb: 8 }}>

      {/* Bid Modal — only rendered for auctions */}
      {isAuction && (
        <BidModal
          open={bidModalOpen}
          onClose={() => setBidModalOpen(false)}
          product={product}
          auctionDetail={auctionDetail}
          navBg={navBg}
        />
      )}

      {/* ── Breadcrumb bar ── */}
      <Box sx={{
        background: isDark ? '#111827' : '#fff',
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 1.25,
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Breadcrumbs separator={<ChevronRight size={13} />} sx={{ fontSize: 13 }}>
              <Link underline="hover" color="inherit" onClick={() => navigate('/')} sx={{ cursor: 'pointer' }}>Home</Link>
              {product.categoryName && (
                <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }}>{product.categoryName}</Link>
              )}
              {product.subCategoryName && (
                <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }}>{product.subCategoryName}</Link>
              )}
              <Typography color="text.primary" fontSize={13} noWrap sx={{ maxWidth: 220 }}>
                {product.title}
              </Typography>
            </Breadcrumbs>
            <Button size="small" startIcon={<ArrowLeft size={14} />} onClick={() => navigate(-1)}
              sx={{ fontSize: 12, textTransform: 'none', color: 'text.secondary' }}>
              Back
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Grid container spacing={4}>

          {/* ══ LEFT — Image Gallery ══ */}
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'sticky', top: 80 }}>
              <Paper elevation={0} sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3, overflow: 'hidden',
                background: isDark ? '#1a2340' : '#fafafa',
                position: 'relative',
              }}>
                <Box sx={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                  {imgSrc ? (
                    <Box component="img" src={imgSrc} alt={product.title}
                      sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', p: 3, transition: 'opacity 0.2s' }} />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#ccc' }}>
                      <Package size={88} />
                      <Typography variant="caption" display="block" mt={1}>No image available</Typography>
                    </Box>
                  )}

                  <IconButton onClick={() => setWishlisted(!wishlisted)} sx={{
                    position: 'absolute', top: 12, right: 12,
                    background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                    '&:hover': { background: '#fff5f5' },
                  }}>
                    <Heart size={19} fill={wishlisted ? '#ff6161' : 'none'} color={wishlisted ? '#ff6161' : '#bbb'} />
                  </IconButton>

                  {images.length > 1 && (
                    <>
                      <IconButton onClick={() => setActiveImg(i => Math.max(0, i - 1))} disabled={activeImg === 0}
                        sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:disabled': { opacity: 0.25 }, width: 32, height: 32 }}>
                        <ChevronLeft size={16} />
                      </IconButton>
                      <IconButton onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))} disabled={activeImg === images.length - 1}
                        sx={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', '&:disabled': { opacity: 0.25 }, width: 32, height: 32 }}>
                        <ChevronRight size={16} />
                      </IconButton>
                    </>
                  )}
                </Box>

                {images.length > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, pb: 1.5 }}>
                    {images.map((_, i) => (
                      <Box key={i} onClick={() => setActiveImg(i)} sx={{
                        width: i === activeImg ? 18 : 7, height: 7, borderRadius: 4, cursor: 'pointer',
                        background: i === activeImg ? navBg : '#ddd', transition: 'all 0.2s',
                      }} />
                    ))}
                  </Box>
                )}
              </Paper>

              {images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  {images.map((img, i) => {
                    const src = resolveImage(img)
                    return (
                      <Box key={i} onClick={() => setActiveImg(i)} sx={{
                        width: 68, height: 68, borderRadius: 1.5, overflow: 'hidden',
                        border: `2px solid ${i === activeImg ? navBg : theme.palette.divider}`,
                        cursor: 'pointer', background: '#fafafa',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 0.15s',
                        '&:hover': { borderColor: navBg },
                      }}>
                        {src
                          ? <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={22} color="#ccc" />
                        }
                      </Box>
                    )
                  })}
                </Box>
              )}

              <Button size="small" startIcon={<Share2 size={13} />} onClick={handleShare}
                sx={{ mt: 1.5, color: 'text.secondary', textTransform: 'none', fontSize: 12 }}>
                {copied ? 'Link copied!' : 'Share listing'}
              </Button>
            </Box>
          </Grid>

          {/* ══ RIGHT — Product Info ══ */}
          <Grid item xs={12} md={7}>

            {/* Badges */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
              {isAuction && (
                <Chip
                  label={auctionStatus === 'ACTIVE' ? 'LIVE AUCTION' : 'AUCTION'}
                  size="small"
                  icon={<Gavel size={11} />}
                  sx={{
                    background: auctionStatus === 'ACTIVE' ? navBg : '#64748b',
                    color: '#fff', fontWeight: 700, fontSize: 10,
                    '& .MuiChip-icon': { color: auctionStatus === 'ACTIVE' ? '#ffe500' : '#fff' },
                  }}
                />
              )}
              {product.condition && (
                <Chip label={product.condition} size="small" sx={{
                  background: condMeta.bg, color: condMeta.color,
                  border: `1px solid ${condMeta.border}`, fontWeight: 700, fontSize: 11,
                }} />
              )}
            </Box>

            {/* Title */}
            <Typography variant="h5" fontWeight={700} lineHeight={1.35} mb={0.75}>
              {product.title}
            </Typography>

            {/* Category path */}
            {product.subCategoryName && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                {product.categoryName} › {product.subCategoryName}
              </Typography>
            )}

            <Divider sx={{ mb: 2.5 }} />

            {/* Price block */}
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
                {isAuction ? 'STARTING BID' : 'PRICE'}
              </Typography>
              <Typography variant="h3" fontWeight={800} color={navBg} lineHeight={1.1} mt={0.25}>
                ₹{Number(price).toLocaleString('en-IN')}
              </Typography>
            </Box>

            {/* Auction info block (timer / ended state) */}
            {isAuction && (
              auctionLoading ? (
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={14} />
                  <Typography variant="caption" color="text.secondary">Loading auction info…</Typography>
                </Box>
              ) : (
                <AuctionInfoBlock
                  product={product}
                  auctionDetail={auctionDetail}
                  navBg={navBg}
                  isDark={isDark}
                />
              )
            )}

            {/* Description */}
            {product.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={700} mb={0.75}>About this item</Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.75}>
                  {product.description}
                </Typography>
              </Box>
            )}

            {/* Action buttons */}
            <Box sx={{ display: 'flex', gap: 1.5, mb: 3, flexWrap: 'wrap' }}>
              {isAuction ? (
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<Gavel size={17} />}
                  onClick={() => canPlaceBid && setBidModalOpen(true)}
                  disabled={!canPlaceBid}
                  sx={{
                    flex: 1, minWidth: 148, py: 1.5, fontWeight: 700, fontSize: 15,
                    borderRadius: 2,
                    ...(canPlaceBid
                      ? { background: navBg, '&:hover': { background: '#1a5dc8' } }
                      : {}
                    ),
                  }}
                >
                  {auctionStatus === 'ENDED' ? 'Bidding Closed' : 'Place Bid'}
                </Button>
              ) : (
                <Button variant="contained" size="large"
                  onClick={() => navigate('/payment', { state: { product, price } })}
                  sx={{
                    flex: 1, minWidth: 148, py: 1.5, fontWeight: 700, fontSize: 15,
                    borderRadius: 2, background: '#ff9f00',
                    '&:hover': { background: '#e68e00' }, color: '#fff',
                  }}>
                  Buy Now
                </Button>
              )}

              <Button variant="outlined" size="large" startIcon={<MessageCircle size={17} />}
                onClick={() => navigate('/chat')}
                sx={{
                  flex: 1, minWidth: 148, py: 1.5, fontWeight: 700, fontSize: 15,
                  borderRadius: 2, borderColor: navBg, color: navBg,
                  '&:hover': { background: `${navBg}0d` },
                }}>
                Chat with Seller
              </Button>
            </Box>

            {/* Trust badges */}
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2, mb: 3 }}>
              <Grid container>
                {[
                  { icon: <Shield size={20} color="#16a34a" />, title: 'Secure', sub: 'Buyer protection' },
                  { icon: <RefreshCw size={20} color={navBg} />, title: 'Easy Returns', sub: 'Within 7 days' },
                  { icon: <Truck size={20} color="#f59e0b" />, title: 'Fast Ship', sub: 'Seller ships fast' },
                ].map((b, i) => (
                  <Grid item xs={4} key={b.title}
                    sx={{ borderRight: i < 2 ? `1px solid ${theme.palette.divider}` : 'none', px: 1, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      {b.icon}
                      <Typography variant="caption" fontWeight={700} fontSize={11}>{b.title}</Typography>
                      <Typography variant="caption" color="text.secondary" fontSize={10}>{b.sub}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* ── Bid Leaderboard (auction only, when bids exist) ── */}
            {isAuction && !auctionLoading && (auctionDetail?.bids?.length > 0) && (
              <BidLeaderboard
                bids={auctionDetail.bids}
                auctionStatus={auctionStatus}
                navBg={navBg}
                isDark={isDark}
              />
            )}

            {/* Specifications */}
            {product.productInformation?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box sx={{ width: 3, height: 20, background: navBg, borderRadius: 2 }} />
                  <Typography variant="subtitle1" fontWeight={700}>Specifications</Typography>
                </Box>
                <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
                  <Table size="small">
                    <TableBody>
                      {product.productInformation.map((info, i) => (
                        <TableRow key={i} sx={{
                          '&:last-child td': { border: 0 },
                          background: i % 2 === 0
                            ? (isDark ? 'rgba(255,255,255,0.03)' : '#fafafa')
                            : 'transparent',
                        }}>
                          <TableCell sx={{
                            fontWeight: 600, color: 'text.secondary', width: '38%', fontSize: 13, py: 1.5,
                            borderRight: `1px solid ${theme.palette.divider}`,
                          }}>
                            {info.label ?? `Spec ${i + 1}`}
                          </TableCell>
                          <TableCell sx={{ fontSize: 13, py: 1.5, fontWeight: 500 }}>{info.answer}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* Seller card */}
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, p: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Seller Information</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${navBg}, #1a5dc8)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0,
                }}>
                  {product.sellerName?.[0]?.toUpperCase() ?? 'S'}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {product.sellerName ?? `Seller #${product.sellerId}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Listed on {product.createdAt
                      ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'TradeArena'}
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" startIcon={<MessageCircle size={13} />}
                  onClick={() => navigate('/chat')}
                  sx={{ fontSize: 12, textTransform: 'none', borderColor: navBg, color: navBg }}>
                  Message
                </Button>
              </Box>
            </Paper>

          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}