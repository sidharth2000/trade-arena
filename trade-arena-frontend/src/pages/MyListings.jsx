import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Container, Typography, Button,
    Card, Chip, Tab, Tabs,
    Skeleton, Alert, Modal, TextField
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
    Package, Plus, Eye, Trash2,
    TrendingUp, CheckCircle2, Gavel,
    ShoppingBag, LayoutGrid, Timer, Clock
} from 'lucide-react'

import { productApi } from '../api/ProductApi'
import { useAuth } from '../hooks/useAuth'
import { auctionApi } from '../api/AuctionApi'
import styles from './MyListings.module.css'

const PAGE_SIZE = 20

const STATUS_META = {
    ACTIVE:  { color: '#16a34a', label: 'Active'  },
    AUCTION: { color: '#2563eb', label: 'Auction' },
    SOLD:    { color: '#6b7280', label: 'Sold'    },
    EXPIRED: { color: '#dc2626', label: 'Expired' },
}

const STAT_STATUSES = ['ACTIVE', 'AUCTION', 'SOLD']

// Resolves image src from product
function resolveImage(p) {
    if (p.primaryImageData) {
        return `data:${p.primaryImageMimeType ?? 'image/jpeg'};base64,${p.primaryImageData}`
    }
    const images = p.images
    if (!images?.length) return null
    const img = images.find((i) => i.isPrimary) ?? images[0]
    if (!img) return null
    if (img.data?.startsWith('data:') || img.data?.startsWith('http')) return img.data
    if (img.data) return `data:${img.mimeType ?? 'image/jpeg'};base64,${img.data}`
    return img.url ?? null
}

// Tab definitions with icons
const TABS = [
    { value: 'ACTIVE',  label: 'Active',  Icon: CheckCircle2, accent: '#16a34a' },
    { value: 'AUCTION', label: 'Auction', Icon: Gavel,        accent: '#2563eb' },
    { value: 'SOLD',    label: 'Sold',    Icon: ShoppingBag,  accent: '#6b7280' },
]

// Stat card definitions
function buildStats(counts, nav) {
    return [
        { label: 'Total',   value: counts.total,   Icon: LayoutGrid,   accent: nav       },
        { label: 'Active',  value: counts.active,  Icon: CheckCircle2, accent: '#16a34a' },
        { label: 'Auction', value: counts.auction, Icon: Timer,        accent: '#2563eb' },
        { label: 'Sold',    value: counts.sold,    Icon: ShoppingBag,  accent: '#6b7280' },
    ]
}

export default function MyListings() {
    const theme  = useTheme()
    const isDark = theme.palette.mode === 'dark'
    const nav    = theme.palette.custom.nav
    const navigate = useNavigate()
    const { user } = useAuth()

    // CSS variables so the module picks up theme values
    const cssVars = {
        '--nav-bg':         nav,
        '--bg-default':     theme.palette.background.default,
        '--bg-paper':       theme.palette.background.paper,
        '--text-primary':   theme.palette.text.primary,
        '--text-secondary': theme.palette.text.secondary,
        '--border':         theme.palette.divider,
        '--accent-light':   theme.palette.custom.accentLight,
    }

    // state
    const [status,   setStatus]   = useState('ACTIVE')
    const [products, setProducts] = useState([])
    const [loading,  setLoading]  = useState(false)
    const [error,    setError]    = useState('')

    // Stable counts — never recalculate from filtered list
    const [counts, setCounts] = useState({ total: 0, active: 0, auction: 0, sold: 0 })
    const statsFetched = useRef(false)

    // Auction modal
    const [auctionProduct, setAuctionProduct] = useState(null)
    const [auctionEndTime, setAuctionEndTime] = useState('')
    const [startingPrice,  setStartingPrice]  = useState('')
    const [auctionLoading, setAuctionLoading] = useState(false)

    // fetch global counts once
    const loadStats = useCallback(async () => {
        if (!user?.id || statsFetched.current) return
        statsFetched.current = true
        try {
            const results = await Promise.all(
    STAT_STATUSES.map((s) =>
        productApi
            .getMyProducts(user.id, {   // ✅ PASS USER ID
                status: s,
                page: 0,
                size: 20
            })
            .then((d) => [s, d.totalElements ?? d.content?.length ?? 0])
            .catch(() => [s, 0])
    )
)
            const map = Object.fromEntries(results)
            setCounts({
                total:   (map.ACTIVE ?? 0) + (map.AUCTION ?? 0) + (map.SOLD ?? 0),
                active:  map.ACTIVE  ?? 0,
                auction: map.AUCTION ?? 0,
                sold:    map.SOLD    ?? 0,
            })
        } catch { /* silent */ }
    }, [user])

    // fetch tab products
    const loadProducts = useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        setError('')
        try {
            const data = await productApi.getMyProducts(user.id, {   // ✅ PASS USER ID
    status,
    page: 0,
    size: PAGE_SIZE,
})
            setProducts(data.content ?? [])
        } catch {
            setError('Failed to load listings. Please try again.')
        } finally {
            setLoading(false)
        }
    }, [user, status])

    useEffect(() => { loadStats()    }, [loadStats])
    useEffect(() => { loadProducts() }, [loadProducts])

    const closeAuction = () => {
        setAuctionProduct(null)
        setAuctionEndTime('')
        setStartingPrice('')
    }

    const handleStartAuction = async () => {
        setAuctionLoading(true)
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
            await auctionApi.startAuction({
                productId:     auctionProduct.id,
                auctionEndTime,
                startingPrice: Number(startingPrice),
                sellerId:      storedUser.id,
                sellerEmail:   storedUser.email,
            })
            closeAuction()
            statsFetched.current = false
            await Promise.all([loadStats(), loadProducts()])
        } catch (err) {
            console.error(err)
            alert('Failed to start auction. Please try again.')
        } finally {
            setAuctionLoading(false)
        }
    }

    const tabCount  = { ACTIVE: counts.active, AUCTION: counts.auction, SOLD: counts.sold }
    const statCards = buildStats(counts, nav)

    return (
        <Box className={styles.page} style={cssVars}>
            <Container maxWidth="lg">

                {/* HEADER */}
                <Box className={styles.header}>
                    <Box className={styles.headerIcon}>
                        <Package size={20} color="#fff" />
                    </Box>
                    <Typography className={styles.headerTitle}>
                        My Listings
                    </Typography>
                    <Button
                        variant="contained"
                        className={styles.newBtn}
                        onClick={() => navigate('/sell')}
                        startIcon={<Plus size={15} />}
                    >
                        New Listing
                    </Button>
                </Box>

                {/* STATS */}
                <Box className={styles.statsGrid}>
                    {statCards.map(({ label, value, Icon, accent }) => (
                        <Card
                            key={label}
                            className={styles.statCard}
                            style={{ '--stat-accent': accent }}
                            elevation={0}
                        >
                            <Typography className={styles.statLabel}>
                                <Icon size={12} color={accent} />
                                {label}
                            </Typography>
                            <Typography className={styles.statValue}>
                                {value}
                            </Typography>
                        </Card>
                    ))}
                </Box>

                {/* TABS */}
                <Tabs
                    value={status}
                    onChange={(_, v) => setStatus(v)}
                    className={styles.tabBar}
                    TabIndicatorProps={{ style: { display: 'none' } }}
                >
                    {TABS.map(({ value, label, Icon, accent }) => {
                        const active = status === value
                        return (
                            <Tab
                                key={value}
                                value={value}
                                disableRipple
                                className={`${styles.tab} ${active ? styles.tabActive : ''}`}
                                label={
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <Icon size={15} color={active ? '#fff' : accent} strokeWidth={2.2} />
                                        <span>{label}</span>
                                        <span className={styles.tabCount}>{tabCount[value]}</span>
                                    </Box>
                                }
                            />
                        )
                    })}
                </Tabs>

                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {/* LIST */}
                {loading ? (
                    [...Array(4)].map((_, i) => (
                        <Skeleton
                            key={i}
                            variant="rounded"
                            height={100}
                            className={styles.skeleton}
                            sx={{ bgcolor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}
                        />
                    ))
                ) : products.length === 0 ? (
                    <Box className={styles.empty}>
                        <Box className={styles.emptyIcon}>
                            <Package size={30} color={nav} />
                        </Box>
                        <Typography className={styles.emptyTitle}>
                            No {status.charAt(0) + status.slice(1).toLowerCase()} listings
                        </Typography>
                        <Typography className={styles.emptyText}>
                            {status === 'ACTIVE'
                                ? 'Create your first listing to get started.'
                                : status === 'AUCTION'
                                ? 'Start an auction from any active listing.'
                                : 'Items you sell will appear here.'}
                        </Typography>
                    </Box>
                ) : (
                    products.map((p, idx) => {
                        const img        = resolveImage(p)
                        const meta       = STATUS_META[p.status] ?? STATUS_META.ACTIVE
                        const cardAccent = meta.color

                        return (
                            <Card
                                key={p.id}
                                className={styles.card}
                                style={{ '--card-accent': cardAccent, animationDelay: `${idx * 40}ms` }}
                                elevation={0}
                            >
                                {/* IMAGE */}
                                {img ? (
                                    <Box
                                        component="img"
                                        src={img}
                                        alt={p.title}
                                        className={styles.image}
                                    />
                                ) : (
                                    <Box
                                        className={styles.imagePlaceholder}
                                        style={{ background: isDark ? theme.palette.custom.accentLight : '#f0f4ff' }}
                                    >
                                        <Package size={26} color={nav} opacity={0.5} />
                                    </Box>
                                )}

                                {/* INFO */}
                                <Box className={styles.content}>
                                    <Typography className={styles.title}>{p.title}</Typography>
                                    <Typography className={styles.price}>
                                        ₹{Number(p.price).toLocaleString('en-IN')}
                                    </Typography>
                                    <Chip
                                        label={meta.label}
                                        size="small"
                                        className={styles.statusChip}
                                        sx={{
                                            background: `${cardAccent}18`,
                                            color: cardAccent,
                                            border: `1px solid ${cardAccent}40`,
                                        }}
                                    />
                                </Box>

                                {/* ACTIONS */}
                                <Box className={styles.actions}>
                                    <Button
                                        className={styles.actionBtn}
                                        onClick={() => navigate(`/my-listings/${p.id}`)}
                                        title="View listing"
                                    >
                                        <Eye size={15} />
                                    </Button>

                                    {p.status === 'ACTIVE' && (
                                        <Button
                                            className={`${styles.actionBtn} ${styles.auctionBtn}`}
                                            onClick={() => setAuctionProduct(p)}
                                            title="Start auction"
                                        >
                                            <Gavel size={15} />
                                        </Button>
                                    )}

                                    <Button
                                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                        title="Delete listing"
                                    >
                                        <Trash2 size={15} />
                                    </Button>
                                </Box>
                            </Card>
                        )
                    })
                )}

            </Container>

            {/* AUCTION MODAL */}
            <Modal open={!!auctionProduct} onClose={closeAuction}>
                <Box className={styles.modalBox} style={cssVars}>

                    <Box className={styles.modalHeader}>
                        <Box className={styles.modalHeaderIcon}>
                            <Gavel size={20} color="#2563eb" />
                        </Box>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography className={styles.modalTitle}>Start Auction</Typography>
                            {auctionProduct && (
                                <Typography className={styles.modalSubtitle}>
                                    {auctionProduct.title}
                                </Typography>
                            )}
                        </Box>
                    </Box>

                    <Box className={styles.modalBody}>

    {/* 🔹 Starting Price FIRST */}
    <TextField
        fullWidth
        type="number"
        label="Starting Price (₹)"
        value={startingPrice}
        onChange={(e) => setStartingPrice(e.target.value)}
        inputProps={{ min: 0 }}
        InputProps={{
            startAdornment: (
                <Typography sx={{ mr: 1, fontWeight: 800, color: nav }}>₹</Typography>
            ),
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
    />

    {/* 🔹 Auction End Time SECOND */}
    <TextField
        fullWidth
        type="datetime-local"
        label="Auction End Time"
        InputLabelProps={{ shrink: true }}
        value={auctionEndTime}
        onChange={(e) => setAuctionEndTime(e.target.value)}
        inputProps={{
            min: new Date().toISOString().slice(0, 16),
            max: new Date(new Date().setMonth(new Date().getMonth() + 1))
                .toISOString()
                .slice(0, 16),
        }}
        InputProps={{
            startAdornment: (
                <Clock size={16} color={theme.palette.text.secondary} style={{ marginRight: 8 }} />
            ),
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
    />

</Box>

                    <Box className={styles.modalFooter}>
                        <Button
                            variant="outlined"
                            className={styles.cancelBtn}
                            onClick={closeAuction}
                            disabled={auctionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            className={styles.confirmBtn}
                            disabled={!auctionEndTime || !startingPrice || auctionLoading}
                            onClick={handleStartAuction}
                            startIcon={<Gavel size={14} />}
                        >
                            {auctionLoading ? 'Starting…' : 'Start Auction'}
                        </Button>
                    </Box>

                </Box>
            </Modal>
        </Box>
    )
}
