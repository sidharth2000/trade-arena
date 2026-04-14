import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box, Container, Grid, Card, CardActionArea, CardContent,
  Typography, Chip, Button, Pagination, Skeleton, Alert, Badge
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { Gavel, Package, Timer, TrendingUp } from 'lucide-react'
import { productApi } from '../api/ProductApi'
import styles from './ProductsPage.module.css'

const PAGE_SIZE = 20
const AUCTION_SIZE = 8
const CONDITION_COLORS = { NEW: '#16a34a', USED: '#f59e0b', REFURBISHED: '#2563eb' }

// Resolve image from product.images array — supports base64 or url
function resolveImage(images) {
  if (!images || images.length === 0) return null
  const img = images.find((i) => i.isPrimary) ?? images[0]
  if (!img) return null
  if (img.data?.startsWith('data:') || img.data?.startsWith('http')) return img.data
  if (img.data) return `data:${img.mimeType ?? 'image/jpeg'};base64,${img.data}`
  if (img.url) return img.url
  return null
}

function CountdownTimer({ endTime }) {
  const [remaining, setRemaining] = useState('')
  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - new Date()
      if (diff <= 0) { setRemaining('Ended'); return }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setRemaining(`${h}h ${m}m ${s}s`)
    }
    calc()
    const t = setInterval(calc, 1000)
    return () => clearInterval(t)
  }, [endTime])
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
      <Timer size={12} color="#ff6161" />
      <Typography variant="caption" sx={{ color: '#ff6161', fontWeight: 600, fontFamily: 'monospace' }}>
        {remaining}
      </Typography>
    </Box>
  )
}

function ProductCard({ product, onClick }) {
  const theme = useTheme()
  const navBg = theme.palette.custom.nav
  const isAuction = product.status === 'AUCTION'
  const price = product.quickBidStartingPrice ?? product.price
  const imgSrc = product.primaryImageData        // ← new
    ? `data:${product.primaryImageMimeType ?? 'image/jpeg'};base64,${product.primaryImageData}`
    : resolveImage(product.images)

  return (
    <Card
      className={`${styles.productCard} ${isAuction ? styles.auctionCard : ''}`}
      sx={{ border: isAuction ? `2px solid ${navBg}` : '2px solid transparent' }}
      onClick={onClick}
    >
      <CardActionArea>
        {/* Image area */}
        <Box sx={{
          height: 180, position: 'relative', overflow: 'hidden',
          background: isAuction ? `linear-gradient(135deg,${navBg}22,${navBg}44)` : '#f5f5f5',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {imgSrc ? (
            <Box
              component="img" src={imgSrc} alt={product.title}
              sx={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.3s', '&:hover': { transform: 'scale(1.06)' }
              }}
            />
          ) : (
            <Package size={48} color={isAuction ? navBg : '#ccc'} />
          )}
          {isAuction && (
            <Chip
              label="LIVE AUCTION" size="small" icon={<Gavel size={11} />}
              sx={{
                position: 'absolute', top: 8, left: 8,
                background: navBg, color: '#fff', fontWeight: 700, fontSize: 10,
                '& .MuiChip-icon': { color: '#ffe500' }
              }}
            />
          )}
          {product.condition && (
            <Chip
              label={product.condition} size="small"
              sx={{
                position: 'absolute', top: 8, right: 8,
                background: CONDITION_COLORS[product.condition] ?? '#888',
                color: '#fff', fontWeight: 600, fontSize: 10
              }}
            />
          )}
        </Box>

        <CardContent sx={{ p: 1.5, pb: '12px !important' }}>
          <Typography variant="body2" fontWeight={600} noWrap mb={0.25}>{product.title}</Typography>
          <Typography variant="subtitle2" fontWeight={700} color={navBg}>
            ₹{Number(price).toLocaleString('en-IN')}
          </Typography>
          {isAuction && product.quickBidEndTime && <CountdownTimer endTime={product.quickBidEndTime} />}
          {product.subCategoryName && (
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
              {product.subCategoryName}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

function ProductCardSkeleton() {
  return (
    <Card sx={{ borderRadius: 2 }}>
      <Skeleton variant="rectangular" height={180} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="40%" />
      </Box>
    </Card>
  )
}

export default function ProductsPage() {
  const theme = useTheme()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const navBg = theme.palette.custom.nav

  const [auctionProducts, setAuctionProducts] = useState([])
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [auctionLoading, setAuctionLoading] = useState(false)
  const [error, setError] = useState('')

  const searchTerm = searchParams.get('search') ?? ''

  const loadAuctions = useCallback(async () => {
    setAuctionLoading(true)
    try {
      const data = await productApi.getProducts({ status: 'AUCTION', page: 0, size: AUCTION_SIZE })
      setAuctionProducts(data.content ?? [])
    } catch { /* silent */ } finally { setAuctionLoading(false) }
  }, [])

  const loadProducts = useCallback(async (pg) => {
    setLoading(true); setError('')
    try {
      const params = { status: 'ACTIVE', page: pg - 1, size: PAGE_SIZE }
      if (searchTerm) params.search = searchTerm
      const data = await productApi.getProducts(params)
      setProducts(data.content ?? [])
      setTotalPages(data.totalPages ?? 1)
    } catch { setError('Failed to load products') }
    finally { setLoading(false) }
  }, [searchTerm])

  useEffect(() => { loadAuctions() }, [loadAuctions])
  useEffect(() => { setPage(1); loadProducts(1) }, [loadProducts])

  const handlePageChange = (_, v) => {
    setPage(v); loadProducts(v)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Box sx={{ background: theme.palette.background.default, minHeight: '100vh', pb: 6 }}>

      {searchTerm && (
        <Box sx={{ background: navBg, py: 1.5 }}>
          <Container maxWidth="lg">
            <Typography variant="body2" color="rgba(255,255,255,0.85)">
              Results for: <strong>"{searchTerm}"</strong>
            </Typography>
          </Container>
        </Box>
      )}

      <Container maxWidth="lg" sx={{ mt: 3 }}>

        {/* ── Live Auctions ── */}
        {(auctionLoading || auctionProducts.length > 0) && (
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <Box sx={{ width: 4, height: 24, background: '#ff6161', borderRadius: 2 }} />
              <Gavel size={20} color={navBg} />
              <Typography variant="h6" fontWeight={700}>Live Auctions</Typography>
              <Badge badgeContent={auctionProducts.length} color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: 11, fontWeight: 700 } }} />
              <Box sx={{ flex: 1 }} />
              <Button size="small" variant="outlined" startIcon={<TrendingUp size={14} />}
                onClick={() => navigate('/products?status=AUCTION')}
                sx={{ fontSize: 12, textTransform: 'none', borderColor: navBg, color: navBg }}>
                View all
              </Button>
            </Box>
            {auctionLoading ? (
              <Grid container spacing={2}>
                {[...Array(4)].map((_, i) => (
                  <Grid item xs={6} sm={4} md={3} key={i}><ProductCardSkeleton /></Grid>
                ))}
              </Grid>
            ) : (
              <Grid container spacing={2}>
                {auctionProducts.map((p) => (
                  <Grid item xs={6} sm={4} md={3} key={p.id}>
                    <ProductCard product={p} onClick={() => navigate(`/products/${p.id}`)} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {auctionProducts.length > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Box sx={{ flex: 1, height: 1, background: theme.palette.divider }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600} letterSpacing={1}>
              ALL PRODUCTS
            </Typography>
            <Box sx={{ flex: 1, height: 1, background: theme.palette.divider }} />
          </Box>
        )}

        {/* ── All Products ── */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Box sx={{ width: 4, height: 24, background: navBg, borderRadius: 2 }} />
          <Package size={20} color={navBg} />
          <Typography variant="h6" fontWeight={700}>
            {searchTerm ? `Search: "${searchTerm}"` : 'All Listings'}
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Grid container spacing={2}>
            {[...Array(12)].map((_, i) => (
              <Grid item xs={6} sm={4} md={2.4} key={i}><ProductCardSkeleton /></Grid>
            ))}
          </Grid>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Package size={64} color="#ddd" />
            <Typography variant="h6" color="text.secondary" mt={2}>No products found</Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              {searchTerm ? 'Try a different search term' : 'Be the first to list something!'}
            </Typography>
            <Button variant="contained" sx={{ background: navBg }} onClick={() => navigate('/sell')}>
              Post a Listing
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {products.map((p) => (
                <Grid item xs={6} sm={4} md={2.4} key={p.id}>
                  <ProductCard product={p} onClick={() => navigate(`/products/${p.id}`)} />
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination count={totalPages} page={page} onChange={handlePageChange}
                  color="primary" shape="rounded" showFirstButton showLastButton />
              </Box>
            )}
          </>
        )}
      </Container>
    </Box>
  )
}