import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    Box, Container, Typography, Button,
    Grid, Card, Chip, Tabs, Tab,
    Skeleton, Alert, Modal, TextField
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
    Package, Plus, Eye, Trash2, TrendingUp
} from 'lucide-react'

import { productApi } from '../api/ProductApi'
import { useAuth } from '../hooks/useAuth'
import { auctionApi } from '../api/AuctionApi'

const PAGE_SIZE = 20

const STATUS_COLORS = {
    ACTIVE: '#16a34a',
    AUCTION: '#2563eb',
    SOLD: '#6b7280',
    EXPIRED: '#dc2626'
}

// ── BIDDING API (inline for single-file request) ──
const BIDDING_BASE = 'http://localhost:8080/api/auction'

function authHeaders() {
    const token = localStorage.getItem('token')
    return token
        ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
        : {}
}



// ── image resolver ──
function resolveImage(images) {
    if (!images || images.length === 0) return null
    const img = images.find((i) => i.isPrimary) ?? images[0]
    if (!img) return null
    if (img.data?.startsWith('data:') || img.data?.startsWith('http')) return img.data
    if (img.data) return `data:${img.mimeType ?? 'image/jpeg'};base64,${img.data}`
    if (img.url) return img.url
    return null
}

export default function MyListings() {
    const theme = useTheme()
    const navBg = theme.palette.custom.nav
    const navigate = useNavigate()
    const { user } = useAuth()

    const [products, setProducts] = useState([])
    const [status, setStatus] = useState('ACTIVE')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // ── auction modal state ──
    const [auctionProduct, setAuctionProduct] = useState(null)
    const [auctionEndTime, setAuctionEndTime] = useState('')
    const [startingPrice, setStartingPrice] = useState('')

    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        auction: 0,
        sold: 0
    })

    // ── load products ──
    const loadProducts = useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        setError('')

        try {
            const data = await productApi.getProducts({
                sellerId: user.id,
                status,
                page: 0,
                size: PAGE_SIZE
            })

            const list = data.content ?? []
            setProducts(list)

            setStats({
                total: list.length,
                active: list.filter(p => p.status === 'ACTIVE').length,
                auction: list.filter(p => p.status === 'AUCTION').length,
                sold: list.filter(p => p.status === 'SOLD').length
            })

        } catch (e) {
            setError('Failed to load listings')
        } finally {
            setLoading(false)
        }
    }, [user, status])

    useEffect(() => {
        loadProducts()
    }, [loadProducts])

    // ── close modal ──
    const closeAuction = () => {
        setAuctionProduct(null)
        setAuctionEndTime('')
        setStartingPrice('')
    }

    // ── confirm auction ──
    const handleStartAuction = async () => {
        try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}')

            await auctionApi.startAuction({
                productId: auctionProduct.id,
                auctionEndTime,
                startingPrice: Number(startingPrice),
                sellerId: storedUser.id,
                sellerEmail: storedUser.email
            })

            closeAuction()
            loadProducts()
        } catch (err) {
            console.error(err)
            alert('Failed to start auction')
        }
    }

    return (
        <Box sx={{ background: theme.palette.background.default, minHeight: '100vh', py: 4 }}>
            <Container maxWidth="lg">

                {/* ───────── HEADER ───────── */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Package size={22} color={navBg} />

                    <Typography variant="h5" fontWeight={700} ml={1}>
                        My Listings
                    </Typography>

                    <Box sx={{ flex: 1 }} />

                    <Button
                        variant="contained"
                        startIcon={<Plus size={16} />}
                        onClick={() => navigate('/sell')}
                        sx={{ background: navBg }}
                    >
                        New Listing
                    </Button>
                </Box>

                {/* ───────── STATS ───────── */}
                <Grid container spacing={2} mb={2}>
                    {[
                        { label: 'Total', value: stats.total },
                        { label: 'Active', value: stats.active },
                        { label: 'Auction', value: stats.auction },
                        { label: 'Sold', value: stats.sold }
                    ].map((s, i) => (
                        <Grid item xs={6} sm={3} key={i}>
                            <Card sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                                <Typography variant="caption">{s.label}</Typography>
                                <Typography variant="h6" fontWeight={700}>
                                    {s.value}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* ───────── FILTER ───────── */}
                <Tabs value={status} onChange={(_, v) => setStatus(v)} sx={{ mb: 3 }}>
                    <Tab label="Active" value="ACTIVE" />
                    <Tab label="Auction" value="AUCTION" />
                    <Tab label="Sold" value="SOLD" />
                </Tabs>

                {error && <Alert severity="error">{error}</Alert>}

                {/* ───────── LIST ───────── */}
                {loading ? (
                    [...Array(5)].map((_, i) => (
                        <Skeleton key={i} height={90} sx={{ mb: 2 }} />
                    ))
                ) : products.length === 0 ? (
                    <Box textAlign="center" py={6}>
                        <Package size={48} color="#ccc" />
                        <Typography mt={2}>No listings found</Typography>
                    </Box>
                ) : (
                    products.map((p) => {
                        const img =
                            p.primaryImageData
                                ? `data:${p.primaryImageMimeType ?? 'image/jpeg'};base64,${p.primaryImageData}`
                                : resolveImage(p.images)

                        return (
                            <Card
                                key={p.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    p: 2,
                                    mb: 2,
                                    borderRadius: 2
                                }}
                            >

                                {/* IMAGE */}
                                <Box
                                    component="img"
                                    src={img}
                                    sx={{ width: 70, height: 70, borderRadius: 2, objectFit: 'cover' }}
                                />

                                {/* INFO */}
                                <Box sx={{ flex: 1 }}>
                                    <Typography fontWeight={600}>{p.title}</Typography>
                                    <Typography variant="body2">₹{p.price}</Typography>

                                    <Chip
                                        label={p.status}
                                        size="small"
                                        sx={{
                                            mt: 0.5,
                                            background: STATUS_COLORS[p.status],
                                            color: '#fff'
                                        }}
                                    />
                                </Box>

                                {/* ACTIONS */}
                                <Box sx={{ display: 'flex', gap: 1 }}>

                                    <Button onClick={() => navigate(`/my-listings/${p.id}`)}>
                                        <Eye size={16} />
                                    </Button>

                                    {/* QUICK BID ONLY FOR ACTIVE */}
                                    {p.status === 'ACTIVE' && (
                                        <Button onClick={() => setAuctionProduct(p)}>
                                            <TrendingUp size={16} />
                                        </Button>
                                    )}

                                    <Button color="error">
                                        <Trash2 size={16} />
                                    </Button>

                                </Box>

                            </Card>
                        )
                    })
                )}

            </Container>

            {/* ───────── AUCTION MODAL ───────── */}
            <Modal open={!!auctionProduct} onClose={closeAuction}>
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: '#fff',
                    p: 3,
                    borderRadius: 2
                }}>

                    <Typography fontWeight={700} mb={2}>
                        Start Quick Bid
                    </Typography>

                    <TextField
                        fullWidth
                        type="datetime-local"
                        label="Auction End Time"
                        InputLabelProps={{ shrink: true }}
                        sx={{ mb: 2 }}
                        onChange={(e) => setAuctionEndTime(e.target.value)}
                    />

                    <TextField
                        fullWidth
                        type="number"
                        label="Starting Price"
                        sx={{ mb: 2 }}
                        onChange={(e) => setStartingPrice(e.target.value)}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                        <Button onClick={closeAuction}>Cancel</Button>
                        <Button variant="contained" onClick={handleStartAuction}>
                            Confirm
                        </Button>
                    </Box>

                </Box>
            </Modal>

        </Box>
    )
}