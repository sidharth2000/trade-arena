import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Grid, Typography, Chip, Divider,
  Paper, Skeleton, Alert, Breadcrumbs, Link, IconButton,
  Table, TableBody, TableHead, TableRow, TableCell, Tabs, Tab
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ChevronRight, ChevronLeft, Package, ArrowLeft,
  Gavel, Clock, TrendingDown
} from 'lucide-react'
import { productApi } from '../api/ProductApi'
import { auctionApi } from '../api/AuctionApi'

// ── Status config ──────────────────────────────────────────────────
const STATUS_META = {
  ACTIVE:       { label: 'Active',       color: '#16a34a', bg: '#dcfce7', dot: '#16a34a' },
  AUCTION:      { label: 'Live Auction', color: '#2563eb', bg: '#dbeafe', dot: '#2563eb' },
  SOLD:         { label: 'Sold',         color: '#475569', bg: '#f1f5f9', dot: '#94a3b8' },
  AUCTION_SOLD: { label: 'Auction Sold', color: '#7c3aed', bg: '#ede9fe', dot: '#7c3aed' },
  EXPIRED:      { label: 'Expired',      color: '#b91c1c', bg: '#fee2e2', dot: '#ef4444' },
  REMOVED:      { label: 'Removed',      color: '#92400e', bg: '#fef9c3', dot: '#d97706' },
}

const HAS_BIDS = ['AUCTION', 'AUCTION_SOLD']

// ── Image resolver ──────────────────────────────────────────────────
function resolveImage(img) {
  if (!img) return null
  if (img.data?.startsWith('data:') || img.data?.startsWith('http')) return img.data
  if (img.data) return `data:${img.mimeType ?? 'image/jpeg'};base64,${img.data}`
  if (img.url) return img.url
  return null
}

// ── Countdown timer ─────────────────────────────────────────────────
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
        ended: false
      })
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [endTime])

  if (rem.ended) return (
    <Chip
      label="Auction Ended"
      size="small"
      sx={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700 }}
    />
  )

  return (
    <Box sx={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {[
        { v: rem.h, label: 'HRS' },
        { v: rem.m, label: 'MIN' },
        { v: rem.s, label: 'SEC' },
      ].map(({ v, label }, i) => (
        <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{
            minWidth: 52, textAlign: 'center', background: '#1a1a1a',
            borderRadius: 1.5, py: 0.75, px: 1
          }}>
            <Typography sx={{ color: '#fff', fontFamily: 'monospace', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
              {String(v).padStart(2, '0')}
            </Typography>
            <Typography sx={{ color: '#aaa', fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>
              {label}
            </Typography>
          </Box>
          {i < 2 && (
            <Typography sx={{ color: '#ff6161', fontWeight: 800, fontSize: 20 }}>:</Typography>
          )}
        </Box>
      ))}
    </Box>
  )
}

// ── Bid list ────────────────────────────────────────────────────────
function BidList({ bids, loading }) {
  if (loading) {
    return (
      <Box>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} height={44} sx={{ mb: 0.5 }} />
        ))}
      </Box>
    )
  }

  if (!bids || bids.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 5 }}>
        <TrendingDown size={36} color="#ccc" />
        <Typography mt={1.5} color="text.secondary" fontSize={14}>
          No bids placed yet
        </Typography>
      </Box>
    )
  }

  // sort highest to lowest
  const sorted = [...bids].sort((a, b) => b.amount - a.amount)

  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ background: (theme) => theme.palette.background.default }}>
          <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', width: 40 }}>#</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>Bidder</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary' }}>Placed at</TableCell>
          <TableCell sx={{ fontWeight: 600, fontSize: 12, color: 'text.secondary', textAlign: 'right' }}>Amount</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((bid, i) => {
          const isTop = i === 0
          return (
            <TableRow
              key={bid.id ?? i}
              sx={{
                background: isTop ? '#eff6ff' : 'transparent',
                '&:last-child td': { border: 0 },
                '&:hover td': { background: (theme) => theme.palette.action.hover }
              }}
            >
              <TableCell sx={{ fontSize: 13 }}>
                {isTop ? '👑' : i + 1}
              </TableCell>
              <TableCell sx={{ fontSize: 13, color: 'text.primary' }}>
                {bid.bidderId ?? `user_${String(bid.id ?? i).slice(-4)}`}
              </TableCell>
              <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                {bid.placedAt
                  ? new Date(bid.placedAt).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })
                  : '—'}
              </TableCell>
              <TableCell sx={{ textAlign: 'right' }}>
                <Typography
                  fontSize={14}
                  fontWeight={700}
                  color={isTop ? '#1d4ed8' : '#2563eb'}
                >
                  ₹{Number(bid.amount).toLocaleString('en-IN')}
                </Typography>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

// ── Page skeleton ───────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 2 }} />
        </Grid>
        <Grid item xs={12} md={7}>
          <Skeleton variant="text" height={40} width="80%" />
          <Skeleton variant="text" height={24} width="40%" sx={{ mt: 1 }} />
          <Skeleton variant="text" height={48} width="30%" sx={{ mt: 2 }} />
          <Skeleton variant="rectangular" height={120} sx={{ mt: 3, borderRadius: 2 }} />
        </Grid>
      </Grid>
    </Container>
  )
}

// ── Main component ──────────────────────────────────────────────────
export default function SellerProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const theme = useTheme()
  const navBg = theme.palette.custom?.nav ?? '#2563eb'
  const isDark = theme.palette.mode === 'dark'

  const [product, setProduct] = useState(null)
  const [bids, setBids] = useState([])
  const [loading, setLoading] = useState(true)
  const [bidsLoading, setBidsLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeImg, setActiveImg] = useState(0)
  const [tab, setTab] = useState('info')   // 'bids' | 'info' | 'specs'

  // ── fetch product ──
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await productApi.getProductById(id)
        if (cancelled) return
        setProduct(data)

        // set default tab — bids first for auction products
        if (HAS_BIDS.includes(data.status)) {
          setTab('bids')
        } else {
          setTab('info')
        }
      } catch {
        if (!cancelled) setError('Failed to load product.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [id])

  // ── fetch bids when product is auction type ──
  useEffect(() => {
    if (!product || !HAS_BIDS.includes(product.status)) return
    let cancelled = false
    const loadBids = async () => {
      setBidsLoading(true)
      try {
        const data = await auctionApi.getBidsByProduct(product.id)
        if (!cancelled) setBids(data ?? [])
      } catch {
        if (!cancelled) setBids([])
      } finally {
        if (!cancelled) setBidsLoading(false)
      }
    }
    loadBids()
    return () => { cancelled = true }
  }, [product])

  if (loading) return <PageSkeleton />

  if (error || !product) return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Alert severity="error" sx={{ mb: 2 }}>{error || 'Product not found'}</Alert>
    </Container>
  )

  const images = product.images ?? []
  const imgSrc = resolveImage(images[activeImg])
  const statusMeta = STATUS_META[product.status] ?? { label: product.status, color: '#666', bg: '#f5f5f5' }
  const isAuctionType = HAS_BIDS.includes(product.status)
  const price = isAuctionType
    ? (product.quickBidStartingPrice ?? product.price)
    : product.price

  // build tabs based on status
  const tabs = [
    ...(isAuctionType ? [{ value: 'bids', label: `Bids (${bids.length})` }] : []),
    { value: 'info', label: 'Details' },
    ...(product.productInformation?.length > 0 ? [{ value: 'specs', label: 'Specifications' }] : []),
  ]

  return (
    <Box sx={{ background: theme.palette.background.default, minHeight: '100vh', pb: 8 }}>

      {/* ── Breadcrumb bar ── */}
      <Box sx={{
        background: isDark ? '#111827' : '#fff',
        borderBottom: `1px solid ${theme.palette.divider}`,
        py: 1.25
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Breadcrumbs separator={<ChevronRight size={13} />} sx={{ fontSize: 13 }}>
              <Link
                underline="hover"
                color="inherit"
                onClick={() => navigate('/my-listings')}
                sx={{ cursor: 'pointer', fontSize: 13 }}
              >
                My Listings
              </Link>
              <Typography color="text.primary" fontSize={13} noWrap sx={{ maxWidth: 260 }}>
                {product.title}
              </Typography>
            </Breadcrumbs>
            <Box
              component="button"
              onClick={() => navigate(-1)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                fontSize: 12, color: 'text.secondary', background: 'none',
                border: `0.5px solid ${theme.palette.divider}`,
                borderRadius: 1.5, px: 1.5, py: 0.75, cursor: 'pointer',
                '&:hover': { background: theme.palette.action.hover }
              }}
            >
              <ArrowLeft size={13} /> Back
            </Box>
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
                // dim image for non-active statuses
                opacity: ['SOLD', 'AUCTION_SOLD', 'EXPIRED', 'REMOVED'].includes(product.status) ? 0.6 : 1,
                transition: 'opacity 0.2s'
              }}>
                <Box sx={{
                  height: 360, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  {imgSrc ? (
                    <Box
                      component="img"
                      src={imgSrc}
                      alt={product.title}
                      sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', p: 3 }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#ccc' }}>
                      <Package size={72} />
                      <Typography variant="caption" display="block" mt={1}>No image</Typography>
                    </Box>
                  )}

                  {images.length > 1 && (
                    <>
                      <IconButton
                        onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                        disabled={activeImg === 0}
                        sx={{
                          position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)',
                          background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:disabled': { opacity: 0.25 }, width: 30, height: 30
                        }}>
                        <ChevronLeft size={15} />
                      </IconButton>
                      <IconButton
                        onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
                        disabled={activeImg === images.length - 1}
                        sx={{
                          position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                          background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:disabled': { opacity: 0.25 }, width: 30, height: 30
                        }}>
                        <ChevronRight size={15} />
                      </IconButton>
                    </>
                  )}
                </Box>

                {images.length > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, pb: 1.5 }}>
                    {images.map((_, i) => (
                      <Box key={i} onClick={() => setActiveImg(i)} sx={{
                        width: i === activeImg ? 18 : 7, height: 7,
                        borderRadius: 4, cursor: 'pointer',
                        background: i === activeImg ? navBg : '#ddd',
                        transition: 'all 0.2s'
                      }} />
                    ))}
                  </Box>
                )}
              </Paper>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 1.5, flexWrap: 'wrap' }}>
                  {images.map((img, i) => {
                    const src = resolveImage(img)
                    return (
                      <Box
                        key={i}
                        onClick={() => setActiveImg(i)}
                        sx={{
                          width: 60, height: 60, borderRadius: 1.5, overflow: 'hidden',
                          border: `2px solid ${i === activeImg ? navBg : theme.palette.divider}`,
                          cursor: 'pointer', background: '#fafafa',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'border-color 0.15s',
                          '&:hover': { borderColor: navBg }
                        }}>
                        {src
                          ? <Box component="img" src={src} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={20} color="#ccc" />
                        }
                      </Box>
                    )
                  })}
                </Box>
              )}
            </Box>
          </Grid>

          {/* ══ RIGHT — Info + Tabs ══ */}
          <Grid item xs={12} md={7}>

            {/* Status badge */}
            <Chip
              label={statusMeta.label}
              size="small"
              icon={
                <Box sx={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: statusMeta.dot, ml: '6px !important'
                }} />
              }
              sx={{
                mb: 1.5,
                background: statusMeta.bg,
                color: statusMeta.color,
                fontWeight: 700,
                fontSize: 11
              }}
            />

            {/* Title */}
            <Typography variant="h5" fontWeight={700} lineHeight={1.35} mb={0.5}>
              {product.title}
            </Typography>

            {product.subCategoryName && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                {product.categoryName} › {product.subCategoryName}
              </Typography>
            )}

            <Divider sx={{ mb: 2 }} />

            {/* Price */}
            <Box mb={2}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={0.5}>
                {isAuctionType ? 'STARTING BID' : 'LISTED PRICE'}
              </Typography>
              <Typography variant="h3" fontWeight={800} color={navBg} lineHeight={1.1} mt={0.25}>
                ₹{Number(price).toLocaleString('en-IN')}
              </Typography>
            </Box>

            {/* Auction countdown (only for live AUCTION) */}
            {product.status === 'AUCTION' && product.quickBidEndTime && (
              <Box mb={2.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                  <Clock size={14} color="#ff6161" />
                  <Typography variant="body2" fontWeight={700} color="#ff6161">
                    Auction ends in
                  </Typography>
                </Box>
                <CountdownTimer endTime={product.quickBidEndTime} />
              </Box>
            )}

            {/* Seller note */}
            <Paper elevation={0} sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2, p: 1.5, mb: 2.5,
              background: isDark ? 'rgba(37,99,235,0.08)' : '#eff6ff',
              display: 'flex', alignItems: 'flex-start', gap: 1
            }}>
              <Box sx={{
                width: 18, height: 18, borderRadius: '50%',
                background: '#dbeafe', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, mt: 0.1
              }}>
                <Typography sx={{ fontSize: 10, color: '#1d4ed8', fontWeight: 700 }}>i</Typography>
              </Box>
              <Typography variant="body2" color="#1d4ed8" fontSize={13}>
                {product.status === 'SOLD' || product.status === 'AUCTION_SOLD'
                  ? 'This listing is closed. No further actions available.'
                  : product.status === 'EXPIRED' || product.status === 'REMOVED'
                  ? 'This listing is no longer active.'
                  : 'This is your listing — you are viewing it as the seller.'}
              </Typography>
            </Paper>

            {/* ── Tabs ── */}
            <Paper elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2, overflow: 'hidden' }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  minHeight: 44,
                  '& .MuiTab-root': { minHeight: 44, fontSize: 13, fontWeight: 600, textTransform: 'none' },
                  '& .Mui-selected': { color: navBg },
                  '& .MuiTabs-indicator': { background: navBg }
                }}
              >
                {tabs.map(t => (
                  <Tab key={t.value} value={t.value} label={t.label} />
                ))}
              </Tabs>

              <Box sx={{ p: 2 }}>

                {/* BIDS TAB — only for AUCTION / AUCTION_SOLD */}
                {tab === 'bids' && (
                  <BidList bids={bids} loading={bidsLoading} />
                )}

                {/* DETAILS TAB */}
                {tab === 'info' && (
                  <Box>
                    {[
                      { label: 'Condition', value: product.condition },
                      { label: 'Listed on', value: product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : null },
                      { label: 'Seller ID', value: product.sellerId },
                      ...(product.status === 'SOLD' || product.status === 'AUCTION_SOLD'
                        ? [{ label: 'Final price', value: `₹${Number(product.price).toLocaleString('en-IN')}` }]
                        : [])
                    ].filter(r => r.value).map((row, i) => (
                      <Box key={i} sx={{
                        display: 'flex', justifyContent: 'space-between',
                        py: 1, borderBottom: `0.5px solid ${theme.palette.divider}`,
                        '&:last-child': { borderBottom: 'none' }
                      }}>
                        <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                        <Typography variant="body2" fontWeight={600}>{row.value}</Typography>
                      </Box>
                    ))}

                    {product.description && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" fontWeight={700} mb={0.75}>Description</Typography>
                        <Typography variant="body2" color="text.secondary" lineHeight={1.75}>
                          {product.description}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* SPECS TAB */}
                {tab === 'specs' && product.productInformation?.length > 0 && (
                  <Table size="small">
                    <TableBody>
                      {product.productInformation.map((info, i) => (
                        <TableRow
                          key={i}
                          sx={{
                            '&:last-child td': { border: 0 },
                            background: i % 2 === 0
                              ? (isDark ? 'rgba(255,255,255,0.02)' : '#fafafa')
                              : 'transparent'
                          }}
                        >
                          <TableCell sx={{
                            fontWeight: 600, color: 'text.secondary',
                            width: '38%', fontSize: 13, py: 1.25,
                            borderRight: `1px solid ${theme.palette.divider}`
                          }}>
                            {info.label ?? `Spec ${i + 1}`}
                          </TableCell>
                          <TableCell sx={{ fontSize: 13, py: 1.25, fontWeight: 500 }}>
                            {info.answer}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}

              </Box>
            </Paper>

          </Grid>
        </Grid>
      </Container>
    </Box>
  )
}
