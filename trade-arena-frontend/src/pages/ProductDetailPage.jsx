import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box, Container, Grid, Typography, Button, Chip, Divider,
  Paper, Skeleton, Alert, Breadcrumbs, Link, IconButton,
  Table, TableBody, TableRow, TableCell
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  ChevronRight, ChevronLeft, Package, Shield, RefreshCw,
  Truck, MessageCircle, Share2, Heart, Clock, Gavel,
  Timer, Tag, ArrowLeft, Star
} from 'lucide-react'
import { productApi } from '../api/ProductApi'
import { useAuth } from '../hooks/useAuth'
import styles from './ProductDetailPage.module.css'

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
    <Chip label="Auction Ended" size="small" sx={{ background: '#fee2e2', color: '#dc2626', fontWeight: 700 }} />
  )

  return (
    <Box sx={{ display: 'inline-flex', gap: 1, alignItems: 'center' }}>
      {[
        { v: rem.h, label: 'HRS' },
        { v: rem.m, label: 'MIN' },
        { v: rem.s, label: 'SEC' },
      ].map(({ v, label }, i) => (
        <Box key={label}>
          <Box sx={{
            minWidth: 52, textAlign: 'center', background: '#1a1a1a',
            borderRadius: 1.5, py: 0.75, px: 1
          }}>
            <Typography sx={{ color: '#fff', fontFamily: 'monospace', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>
              {String(v).padStart(2, '0')}
            </Typography>
            <Typography sx={{ color: '#aaa', fontSize: 9, fontWeight: 600, letterSpacing: 1 }}>{label}</Typography>
          </Box>
          {i < 2 && <Typography sx={{ color: '#ff6161', fontWeight: 800, fontSize: 20, mx: 0.25 }}>:</Typography>}
        </Box>
      ))}
    </Box>
  )
}

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

  useEffect(() => {
    setLoading(true); setError('')
    productApi.getProductById(id)
      .then(setProduct)
      .catch(() => setError('Failed to load product. Please try again.'))
      .finally(() => setLoading(false))
  }, [id])

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
  const price = isAuction
    ? (product.quickBidStartingPrice ?? product.price)
    : product.price
  const condMeta = CONDITION_META[product.condition] ?? { color: '#666', bg: '#f5f5f5', border: '#e0e0e0' }

  const handleShare = async () => {
    await navigator.clipboard?.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
              <Link underline="hover" color="inherit" onClick={() => navigate('/')}
                sx={{ cursor: 'pointer' }}>Home</Link>
              {product.categoryName && (
                <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }}>
                  {product.categoryName}
                </Link>
              )}
              {product.subCategoryName && (
                <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }}>
                  {product.subCategoryName}
                </Link>
              )}
              <Typography color="text.primary" fontSize={13} noWrap sx={{ maxWidth: 220 }}>
                {product.title}
              </Typography>
            </Breadcrumbs>
            <Button size="small" startIcon={<ArrowLeft size={14} />}
              onClick={() => navigate(-1)}
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

              {/* Main image frame */}
              <Paper elevation={0} sx={{
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 3, overflow: 'hidden',
                background: isDark ? '#1a2340' : '#fafafa',
                position: 'relative'
              }}>
                <Box sx={{
                  height: 420, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative'
                }}>
                  {imgSrc ? (
                    <Box component="img" src={imgSrc} alt={product.title}
                      sx={{
                        maxWidth: '100%', maxHeight: '100%',
                        objectFit: 'contain', p: 3,
                        transition: 'opacity 0.2s',
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: 'center', color: '#ccc' }}>
                      <Package size={88} />
                      <Typography variant="caption" display="block" mt={1}>
                        No image available
                      </Typography>
                    </Box>
                  )}

                  {/* Wishlist btn */}
                  <IconButton onClick={() => setWishlisted(!wishlisted)}
                    sx={{
                      position: 'absolute', top: 12, right: 12,
                      background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
                      '&:hover': { background: '#fff5f5' }
                    }}>
                    <Heart size={19}
                      fill={wishlisted ? '#ff6161' : 'none'}
                      color={wishlisted ? '#ff6161' : '#bbb'} />
                  </IconButton>

                  {/* Arrow nav */}
                  {images.length > 1 && (
                    <>
                      <IconButton
                        onClick={() => setActiveImg(i => Math.max(0, i - 1))}
                        disabled={activeImg === 0}
                        sx={{
                          position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                          background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:disabled': { opacity: 0.25 }, width: 32, height: 32
                        }}>
                        <ChevronLeft size={16} />
                      </IconButton>
                      <IconButton
                        onClick={() => setActiveImg(i => Math.min(images.length - 1, i + 1))}
                        disabled={activeImg === images.length - 1}
                        sx={{
                          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                          background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          '&:disabled': { opacity: 0.25 }, width: 32, height: 32
                        }}>
                        <ChevronRight size={16} />
                      </IconButton>
                    </>
                  )}
                </Box>

                {/* Image counter dots */}
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
                      <Box key={i} onClick={() => setActiveImg(i)}
                        sx={{
                          width: 68, height: 68, borderRadius: 1.5, overflow: 'hidden',
                          border: `2px solid ${i === activeImg ? navBg : theme.palette.divider}`,
                          cursor: 'pointer', background: '#fafafa',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'border-color 0.15s',
                          '&:hover': { borderColor: navBg }
                        }}>
                        {src
                          ? <Box component="img" src={src} alt=""
                            sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <Package size={22} color="#ccc" />
                        }
                      </Box>
                    )
                  })}
                </Box>
              )}

              {/* Share */}
              <Button size="small" startIcon={<Share2 size={13} />} onClick={handleShare}
                sx={{ mt: 1.5, color: 'text.secondary', textTransform: 'none', fontSize: 12 }}>
                {copied ? 'Link copied!' : 'Share listing'}
              </Button>
            </Box>
          </Grid>

          {/* ══ RIGHT — Product Info ══ */}
          <Grid item xs={12} md={7}>

            {/* Badges row */}
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 1.5 }}>
              {isAuction && (
                <Chip label="LIVE AUCTION" size="small" icon={<Gavel size={11} />}
                  sx={{
                    background: navBg, color: '#fff', fontWeight: 700, fontSize: 10,
                    '& .MuiChip-icon': { color: '#ffe500' }
                  }} />
              )}
              {product.condition && (
                <Chip label={product.condition} size="small"
                  sx={{
                    background: condMeta.bg, color: condMeta.color,
                    border: `1px solid ${condMeta.border}`, fontWeight: 700, fontSize: 11
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

            {/* Auction timer */}
            {isAuction && product.quickBidEndTime && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1.25 }}>
                  <Clock size={15} color="#ff6161" />
                  <Typography variant="body2" fontWeight={700} color="#ff6161">Auction ends in</Typography>
                </Box>
                <CountdownTimer endTime={product.quickBidEndTime} />
              </Box>
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
                <Button variant="contained" size="large" startIcon={<Gavel size={17} />}
                  sx={{
                    flex: 1, minWidth: 148, py: 1.5, fontWeight: 700, fontSize: 15,
                    borderRadius: 2, background: navBg,
                    '&:hover': { background: '#1a5dc8' }
                  }}>
                  Place Bid
                </Button>
              ) : (
                <Button variant="contained" size="large"
                  sx={{
                    flex: 1, minWidth: 148, py: 1.5, fontWeight: 700, fontSize: 15,
                    borderRadius: 2, background: '#ff9f00',
                    '&:hover': { background: '#e68e00' },
                    color: '#fff'
                  }}>
                  Buy Now
                </Button>
              )}

              <Button variant="outlined" size="large" startIcon={<MessageCircle size={17} />}
                onClick={() => navigate('/chat')}
                sx={{
                  flex: 1, minWidth: 148, py: 1.5, fontWeight: 700, fontSize: 15,
                  borderRadius: 2, borderColor: navBg, color: navBg,
                  '&:hover': { background: `${navBg}0d` }
                }}>
                Chat with Seller
              </Button>
            </Box>

            {/* Trust badges */}
            <Paper elevation={0} sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2, p: 2, mb: 3
            }}>
              <Grid container>
                {[
                  { icon: <Shield size={20} color="#16a34a" />, title: 'Secure', sub: 'Buyer protection' },
                  { icon: <RefreshCw size={20} color={navBg} />, title: 'Easy Returns', sub: 'Within 7 days' },
                  { icon: <Truck size={20} color="#f59e0b" />, title: 'Fast Ship', sub: 'Seller ships fast' },
                ].map((b, i) => (
                  <Grid item xs={4} key={b.title}
                    sx={{ borderRight: i < 2 ? `1px solid ${theme.palette.divider}` : 'none',
                      px: 1, textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                      {b.icon}
                      <Typography variant="caption" fontWeight={700} fontSize={11}>{b.title}</Typography>
                      <Typography variant="caption" color="text.secondary" fontSize={10}>{b.sub}</Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Specifications */}
            {product.productInformation?.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <Box sx={{ width: 3, height: 20, background: navBg, borderRadius: 2 }} />
                  <Typography variant="subtitle1" fontWeight={700}>Specifications</Typography>
                </Box>
                <Paper elevation={0} sx={{
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2, overflow: 'hidden'
                }}>
                  <Table size="small">
                    <TableBody>
                      {product.productInformation.map((info, i) => (
                        <TableRow key={i} sx={{
                          '&:last-child td': { border: 0 },
                          background: i % 2 === 0
                            ? (isDark ? 'rgba(255,255,255,0.03)' : '#fafafa')
                            : 'transparent'
                        }}>
                          <TableCell sx={{
                            fontWeight: 600, color: 'text.secondary',
                            width: '38%', fontSize: 13, py: 1.5,
                            borderRight: `1px solid ${theme.palette.divider}`
                          }}>
                            {info.label ?? `Spec ${i + 1}`}
                          </TableCell>
                          <TableCell sx={{ fontSize: 13, py: 1.5, fontWeight: 500 }}>
                            {info.answer}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Paper>
              </Box>
            )}

            {/* Seller card */}
            <Paper elevation={0} sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 2, p: 2.5
            }}>
              <Typography variant="subtitle2" fontWeight={700} mb={1.5}>Seller Information</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${navBg}, #1a5dc8)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 800, fontSize: 18, flexShrink: 0
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
                <Button size="small" variant="outlined"
                  startIcon={<MessageCircle size={13} />}
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