import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Box, Container, Typography, Button, Paper, Divider,
  RadioGroup, FormControlLabel, Radio, TextField, Grid,
  Chip, CircularProgress, Fade, Grow, Collapse,
  InputAdornment, IconButton
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import {
  CreditCard, Truck, Smartphone, Wallet, CheckCircle,
  ShieldCheck, Lock, ArrowLeft, ChevronRight,
  Package, Tag, Receipt, Eye, EyeOff, BadgeCheck
} from 'lucide-react'
import { productApi } from '../api/ProductApi'

/* ─── helpers ─── */
function getUser() {
  try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
}

/* ─── Payment method config ─── */
const METHODS = [
  {
    id: 'credit_card',
    label: 'Credit Card',
    sub: 'Visa, Mastercard, Amex',
    icon: CreditCard,
    color: '#2563eb',
  },
  {
    id: 'debit_card',
    label: 'Debit Card',
    sub: 'All Indian bank cards accepted',
    icon: CreditCard,
    color: '#16a34a',
  },
  {
    id: 'upi',
    label: 'UPI',
    sub: 'GPay, PhonePe, Paytm & more',
    icon: Smartphone,
    color: '#7c3aed',
  },
  {
    id: 'wallet',
    label: 'Digital Wallet',
    sub: 'Paytm, Amazon Pay, MobiKwik',
    icon: Wallet,
    color: '#d97706',
  },
  {
    id: 'cod',
    label: 'Cash on Delivery',
    sub: 'Pay when you receive the item',
    icon: Truck,
    color: '#64748b',
  },
]

/* ─── Step 1: Order Summary ─── */
function OrderSummary({ product, price, onProceed }) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navBg = theme.palette.custom?.nav ?? '#2563eb'

  const platform = (Number(price) * 0.02).toFixed(2)
  const total = (Number(price) + Number(platform)).toFixed(2)

  return (
    <Fade in timeout={400}>
      <Box>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Box sx={{
            width: 56, height: 56, borderRadius: '50%',
            background: `linear-gradient(135deg, ${navBg}, #1a5dc8)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            mx: 'auto', mb: 2, boxShadow: `0 8px 24px ${navBg}40`,
          }}>
            <Receipt size={26} color="#fff" />
          </Box>
          <Typography variant="h5" fontWeight={800} mb={0.5}>Order Summary</Typography>
          <Typography variant="body2" color="text.secondary">
            Review your purchase before paying
          </Typography>
        </Box>

        {/* Product card */}
        <Paper elevation={0} sx={{
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: 3, p: 2.5, mb: 3,
          background: isDark ? '#0f172a' : '#fafafa',
        }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <Box sx={{
              width: 64, height: 64, borderRadius: 2,
              background: isDark ? '#1e293b' : '#e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, overflow: 'hidden',
            }}>
              {product?.images?.[0]?.data ? (
                <Box component="img"
                  src={`data:${product.images[0].mimeType ?? 'image/jpeg'};base64,${product.images[0].data}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Package size={28} color="#94a3b8" />
              )}
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700} fontSize={15} lineHeight={1.35} mb={0.5}>
                {product?.title ?? 'Product'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {product?.condition && (
                  <Chip label={product.condition} size="small"
                    sx={{ fontSize: 10, height: 20, fontWeight: 600 }} />
                )}
                {product?.categoryName && (
                  <Chip label={product.categoryName} size="small" variant="outlined"
                    sx={{ fontSize: 10, height: 20 }} />
                )}
              </Box>
            </Box>
          </Box>
        </Paper>

        {/* Price breakdown */}
        <Paper elevation={0} sx={{
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: 3, overflow: 'hidden', mb: 3,
        }}>
          <Box sx={{ p: 2, background: isDark ? '#0f172a' : '#f8fafc' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary"
              sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              Price Details
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 2 }}>
            {[
              { label: 'Item price', val: `₹${Number(price).toLocaleString('en-IN')}` },
              { label: 'Platform fee (2%)', val: `₹${Number(platform).toLocaleString('en-IN')}` },
              { label: 'Delivery', val: 'Free', green: true },
            ].map(row => (
              <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25 }}>
                <Typography variant="body2" color="text.secondary">{row.label}</Typography>
                <Typography variant="body2" fontWeight={600}
                  color={row.green ? '#16a34a' : 'text.primary'}>{row.val}</Typography>
              </Box>
            ))}
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight={800} fontSize={16}>Total Amount</Typography>
              <Typography fontWeight={800} fontSize={18} color={navBg}>
                ₹{Number(total).toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Trust */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3 }}>
          {[
            { icon: <ShieldCheck size={14} />, text: 'Buyer Protected' },
            { icon: <Lock size={14} />, text: 'Secure Payment' },
            { icon: <BadgeCheck size={14} />, text: '100% Authentic' },
          ].map(item => (
            <Box key={item.text} sx={{
              display: 'flex', alignItems: 'center', gap: 0.5,
              color: '#16a34a', fontSize: 12, fontWeight: 600,
            }}>
              {item.icon}
              <Typography variant="caption" fontWeight={600} color="#16a34a">{item.text}</Typography>
            </Box>
          ))}
        </Box>

        <Button
          fullWidth variant="contained" size="large"
          onClick={onProceed}
          endIcon={<ChevronRight size={18} />}
          sx={{
            py: 1.75, fontWeight: 800, fontSize: 16, borderRadius: 2.5,
            background: `linear-gradient(135deg, ${navBg}, #1a5dc8)`,
            boxShadow: `0 6px 20px ${navBg}40`,
            '&:hover': { background: `linear-gradient(135deg, #1a5dc8, ${navBg})` },
          }}>
          Proceed to Payment
        </Button>
      </Box>
    </Fade>
  )
}

/* ─── Card form ─── */
function CardForm({ method }) {
  const [showCvv, setShowCvv] = useState(false)
  return (
    <Fade in timeout={300}>
      <Box sx={{ mt: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Cardholder Name" placeholder="Name on card"
              size="small"
              InputProps={{ sx: { borderRadius: 1.5 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth label="Card Number" placeholder="1234 5678 9012 3456"
              size="small"
              inputProps={{ maxLength: 19 }}
              onChange={e => {
                const v = e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim()
                e.target.value = v
              }}
              InputProps={{
                sx: { borderRadius: 1.5 },
                endAdornment: (
                  <InputAdornment position="end">
                    <CreditCard size={16} color="#94a3b8" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={7}>
            <TextField
              fullWidth label="Expiry" placeholder="MM / YY"
              size="small" InputProps={{ sx: { borderRadius: 1.5 } }}
            />
          </Grid>
          <Grid item xs={5}>
            <TextField
              fullWidth label="CVV" placeholder="•••"
              size="small"
              type={showCvv ? 'text' : 'password'}
              inputProps={{ maxLength: 4 }}
              InputProps={{
                sx: { borderRadius: 1.5 },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCvv(p => !p)}>
                      {showCvv ? <EyeOff size={14} /> : <Eye size={14} />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Box>
    </Fade>
  )
}

/* ─── UPI form ─── */
function UpiForm() {
  return (
    <Fade in timeout={300}>
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth label="UPI ID" placeholder="yourname@upi"
          size="small"
          InputProps={{
            sx: { borderRadius: 1.5 },
            endAdornment: (
              <InputAdornment position="end">
                <Smartphone size={16} color="#94a3b8" />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
          {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
            <Chip key={app} label={app} size="small" variant="outlined"
              sx={{ cursor: 'pointer', '&:hover': { background: '#f1f5f9' } }} />
          ))}
        </Box>
      </Box>
    </Fade>
  )
}

/* ─── Wallet form ─── */
function WalletForm() {
  const [selected, setSelected] = useState('paytm')
  return (
    <Fade in timeout={300}>
      <Box sx={{ mt: 2 }}>
        <RadioGroup value={selected} onChange={e => setSelected(e.target.value)}>
          {['Paytm', 'Amazon Pay', 'MobiKwik', 'Freecharge'].map(w => (
            <FormControlLabel key={w} value={w.toLowerCase().replace(' ', '_')}
              label={w} control={<Radio size="small" />}
              sx={{ mb: 0.5 }}
            />
          ))}
        </RadioGroup>
      </Box>
    </Fade>
  )
}

/* ─── Step 2: Payment Methods ─── */
function PaymentMethods({ price, product, onSuccess }) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navBg = theme.palette.custom?.nav ?? '#2563eb'
  const [method, setMethod] = useState('upi')
  const [paying, setPaying] = useState(false)

  const platform = (Number(price) * 0.02).toFixed(2)
  const total = (Number(price) + Number(platform)).toFixed(2)

  const handlePay = async () => {
    setPaying(true)
    // Simulate payment processing delay
    await new Promise(res => setTimeout(res, 1800))
    try {
      // Call mark-sold API
      await productApi.markAsSold(product.id)
    } catch {
      // In mock/dev, proceed anyway
    }
    // Record transaction
    try {
      const user = getUser()
      await productApi.recordTransaction({
        productId: product.id,
        userId: user?.id,
        price: product.price,
        paymentMethod: method,
      })
    } catch {
      // silently ignore if endpoint not yet live
    }
    setPaying(false)
    onSuccess({ method, total })
  }

  return (
    <Fade in timeout={400}>
      <Box>
        <Typography variant="h6" fontWeight={800} mb={0.5}>Choose Payment Method</Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Total payable: <strong>₹{Number(total).toLocaleString('en-IN')}</strong>
        </Typography>

        {METHODS.map(m => {
          const Icon = m.icon
          const active = method === m.id
          return (
            <Paper key={m.id}
              onClick={() => setMethod(m.id)}
              elevation={0}
              sx={{
                border: `2px solid ${active ? m.color : (isDark ? '#334155' : '#e2e8f0')}`,
                borderRadius: 2.5, p: 2, mb: 1.5, cursor: 'pointer',
                background: active ? `${m.color}0d` : (isDark ? '#0f172a' : '#fff'),
                transition: 'all 0.2s',
                '&:hover': { borderColor: m.color, background: `${m.color}08` },
              }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 40, height: 40, borderRadius: 2,
                  background: active ? `${m.color}20` : (isDark ? '#1e293b' : '#f1f5f9'),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'all 0.2s',
                }}>
                  <Icon size={20} color={active ? m.color : '#94a3b8'} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography fontWeight={700} fontSize={14}>{m.label}</Typography>
                  <Typography variant="caption" color="text.secondary">{m.sub}</Typography>
                </Box>
                <Radio
                  checked={active} size="small"
                  sx={{ color: m.color, '&.Mui-checked': { color: m.color }, p: 0 }}
                  onClick={e => e.stopPropagation()}
                  onChange={() => setMethod(m.id)}
                />
              </Box>

              {/* Expanded form for active method */}
              <Collapse in={active}>
                {(m.id === 'credit_card' || m.id === 'debit_card') && (
                  <CardForm method={m.id} />
                )}
                {m.id === 'upi' && <UpiForm />}
                {m.id === 'wallet' && <WalletForm />}
                {m.id === 'cod' && (
                  <Fade in timeout={300}>
                    <Box sx={{
                      mt: 2, p: 1.5, borderRadius: 1.5,
                      background: isDark ? '#1e293b' : '#f8fafc',
                      border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
                    }}>
                      <Typography variant="body2" color="text.secondary" fontSize={13}>
                        💵 Pay ₹{Number(total).toLocaleString('en-IN')} in cash when the seller delivers the item to you.
                        No advance payment required.
                      </Typography>
                    </Box>
                  </Fade>
                )}
              </Collapse>
            </Paper>
          )
        })}

        <Button
          fullWidth variant="contained" size="large"
          onClick={handlePay}
          disabled={paying}
          startIcon={paying ? <CircularProgress size={16} color="inherit" /> : <Lock size={17} />}
          sx={{
            mt: 2, py: 1.75, fontWeight: 800, fontSize: 16, borderRadius: 2.5,
            background: paying ? undefined : `linear-gradient(135deg, #16a34a, #15803d)`,
            boxShadow: paying ? undefined : '0 6px 20px rgba(22,163,74,0.35)',
            '&:hover': { background: 'linear-gradient(135deg, #15803d, #166534)' },
          }}>
          {paying ? 'Processing Payment…' : `Pay ₹${Number(total).toLocaleString('en-IN')} Securely`}
        </Button>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75, mt: 1.5 }}>
          <Lock size={12} color="#94a3b8" />
          <Typography variant="caption" color="text.secondary">
            256-bit SSL encrypted · PCI DSS compliant
          </Typography>
        </Box>
      </Box>
    </Fade>
  )
}

/* ─── Step 3: Success ─── */
function PaymentSuccess({ product, payment, price, onGoHome }) {
  const theme = useTheme()
  const navBg = theme.palette.custom?.nav ?? '#2563eb'
  const isDark = theme.palette.mode === 'dark'

  const platform = (Number(price) * 0.02).toFixed(2)
  const total = (Number(price) + Number(platform)).toFixed(2)
  const txnId = `TXN${Date.now().toString().slice(-10).toUpperCase()}`
  const methodLabel = METHODS.find(m => m.id === payment.method)?.label ?? payment.method

  return (
    <Grow in timeout={500}>
      <Box sx={{ textAlign: 'center' }}>
        {/* Success animation */}
        <Box sx={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #16a34a, #15803d)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mx: 'auto', mb: 2.5,
          boxShadow: '0 8px 32px rgba(22,163,74,0.4)',
          animation: 'pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '@keyframes pop': {
            '0%': { transform: 'scale(0)', opacity: 0 },
            '100%': { transform: 'scale(1)', opacity: 1 },
          },
        }}>
          <CheckCircle size={40} color="#fff" />
        </Box>

        <Typography variant="h5" fontWeight={800} mb={0.5} color="#16a34a">
          Payment Successful! 🎉
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Your order has been placed. The seller will be notified shortly.
        </Typography>

        {/* Transaction receipt */}
        <Paper elevation={0} sx={{
          border: `1px solid ${isDark ? '#334155' : '#e2e8f0'}`,
          borderRadius: 3, overflow: 'hidden', mb: 3, textAlign: 'left',
        }}>
          {/* Receipt header */}
          <Box sx={{
            p: 2, background: 'linear-gradient(135deg, #16a34a, #15803d)',
            display: 'flex', alignItems: 'center', gap: 1,
          }}>
            <Receipt size={18} color="#fff" />
            <Typography fontWeight={700} color="#fff" fontSize={14}>Transaction Receipt</Typography>
            <Box sx={{ flex: 1 }} />
            <Chip label="PAID" size="small"
              sx={{ background: '#fff', color: '#16a34a', fontWeight: 800, fontSize: 11, height: 22 }} />
          </Box>

          <Box sx={{ p: 2 }}>
            {/* Product */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, pb: 2, borderBottom: `1px solid ${isDark ? '#334155' : '#f1f5f9'}` }}>
              <Box sx={{
                width: 48, height: 48, borderRadius: 1.5,
                background: isDark ? '#1e293b' : '#f1f5f9',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Package size={22} color="#94a3b8" />
              </Box>
              <Box>
                <Typography fontWeight={700} fontSize={14}>{product?.title}</Typography>
                <Chip label="SOLD" size="small"
                  sx={{ mt: 0.5, background: '#fee2e2', color: '#dc2626', fontWeight: 700, fontSize: 10, height: 20 }} />
              </Box>
            </Box>

            {/* Transaction details */}
            {[
              { label: 'Transaction ID', val: txnId, mono: true },
              { label: 'Product ID', val: product?.id?.slice(0, 8) + '…', mono: true },
              { label: 'User ID', val: getUser()?.id ?? '—', mono: true },
              { label: 'Payment Method', val: methodLabel },
              { label: 'Item Price', val: `₹${Number(price).toLocaleString('en-IN')}` },
              { label: 'Platform Fee', val: `₹${Number(platform).toLocaleString('en-IN')}` },
              { label: 'Date & Time', val: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) },
            ].map(row => (
              <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.25, alignItems: 'flex-start' }}>
                <Typography variant="body2" color="text.secondary" fontSize={12}>{row.label}</Typography>
                <Typography variant="body2" fontWeight={600} fontSize={12}
                  sx={row.mono ? { fontFamily: 'monospace', background: isDark ? '#1e293b' : '#f1f5f9', px: 1, py: 0.25, borderRadius: 1, fontSize: 11 } : {}}>
                  {row.val}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography fontWeight={800}>Total Paid</Typography>
              <Typography fontWeight={800} fontSize={17} color="#16a34a">
                ₹{Number(total).toLocaleString('en-IN')}
              </Typography>
            </Box>
          </Box>
        </Paper>

        <Button fullWidth variant="contained" size="large"
          onClick={onGoHome}
          sx={{
            py: 1.5, fontWeight: 700, borderRadius: 2.5,
            background: `linear-gradient(135deg, ${navBg}, #1a5dc8)`,
          }}>
          Continue Shopping
        </Button>
      </Box>
    </Grow>
  )
}

/* ─── Main Page ─── */
export default function PaymentGatewayPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const navBg = theme.palette.custom?.nav ?? '#2563eb'

  // product + price passed via router state
  const { product, price } = location.state ?? {}

  const [step, setStep] = useState(1) // 1 = summary, 2 = methods, 3 = success
  const [paymentResult, setPaymentResult] = useState(null)

  // Guard: no product in state
  if (!product) {
    return (
      <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Package size={48} color="#94a3b8" />
          <Typography mt={2} color="text.secondary">No product selected.</Typography>
          <Button sx={{ mt: 2 }} onClick={() => navigate('/')}>Go to Products</Button>
        </Box>
      </Box>
    )
  }

  const steps = ['Order Summary', 'Payment', 'Confirmation']

  return (
    <Box sx={{ minHeight: '100vh', background: isDark ? '#0b1120' : '#f0f4f8', py: 4 }}>
      <Container maxWidth="sm">

        {/* Back button */}
        {step < 3 && (
          <Button
            startIcon={<ArrowLeft size={15} />}
            onClick={() => step === 1 ? navigate(-1) : setStep(s => s - 1)}
            sx={{ mb: 3, color: 'text.secondary', textTransform: 'none', fontSize: 13 }}>
            {step === 1 ? 'Back to product' : 'Back'}
          </Button>
        )}

        {/* Progress stepper */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          {steps.map((label, i) => {
            const n = i + 1
            const done = step > n
            const active = step === n
            return (
              <Box key={label} sx={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
                  <Box sx={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: done ? '#16a34a' : active ? navBg : (isDark ? '#1e293b' : '#e2e8f0'),
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.3s',
                    boxShadow: active ? `0 4px 12px ${navBg}40` : done ? '0 4px 12px rgba(22,163,74,0.3)' : 'none',
                  }}>
                    {done
                      ? <CheckCircle size={16} color="#fff" />
                      : <Typography sx={{ color: active ? '#fff' : '#94a3b8', fontWeight: 700, fontSize: 13 }}>{n}</Typography>
                    }
                  </Box>
                  <Typography variant="caption" fontWeight={active || done ? 700 : 400}
                    color={active ? navBg : done ? '#16a34a' : 'text.disabled'}
                    sx={{ mt: 0.5, fontSize: 10 }}>
                    {label}
                  </Typography>
                </Box>
                {i < steps.length - 1 && (
                  <Box sx={{
                    flex: 1, height: 2, mx: 1, borderRadius: 1,
                    background: step > i + 1
                      ? 'linear-gradient(90deg, #16a34a, #16a34a)'
                      : (isDark ? '#1e293b' : '#e2e8f0'),
                    transition: 'all 0.3s',
                  }} />
                )}
              </Box>
            )
          })}
        </Box>

        {/* Main card */}
        <Paper elevation={0} sx={{
          borderRadius: 4, p: { xs: 2.5, sm: 4 },
          border: `1px solid ${isDark ? '#1e293b' : '#e2e8f0'}`,
          background: isDark ? '#0f172a' : '#fff',
          boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 20px 60px rgba(0,0,0,0.08)',
        }}>
          {step === 1 && (
            <OrderSummary
              product={product}
              price={price}
              onProceed={() => setStep(2)}
            />
          )}
          {step === 2 && (
            <PaymentMethods
              price={price}
              product={product}
              onSuccess={(result) => {
                setPaymentResult(result)
                setStep(3)
              }}
            />
          )}
          {step === 3 && (
            <PaymentSuccess
              product={product}
              payment={paymentResult}
              price={price}
              onGoHome={() => navigate('/')}
            />
          )}
        </Paper>

        {/* Footer note */}
        {step < 3 && (
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="caption" color="text.disabled" fontSize={11}>
              🔒 This is a payment gateway mock for TradeArena demo purposes.
              No real transactions are processed.
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  )
}