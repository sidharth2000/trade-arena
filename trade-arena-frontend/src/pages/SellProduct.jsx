import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box, Container, Stepper, Step, StepLabel, Typography,
  Grid, Card, CardActionArea, CardContent, TextField,
  MenuItem, Button, CircularProgress, Alert, Chip, InputAdornment
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ChevronRight, Tag } from 'lucide-react'
import { productApi } from '../api/ProductApi'
import { useAuth } from '../hooks/useAuth'
import styles from './SellProduct.module.css'
import * as MdIcons from 'react-icons/md'

const STEPS = ['Choose Category', 'Choose Sub-category', 'Product Details']

function CategoryIcon({ iconName, size = 32, color }) {
  if (!iconName) return null
  const Icon = MdIcons[iconName]
  if (!Icon) return null
  return <Icon size={size} color={color} />
}

export default function SellProduct() {
  const theme = useTheme()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [activeStep, setActiveStep] = useState(0)
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [questions, setQuestions] = useState([])

  const [selectedCat, setSelectedCat] = useState(null)
  const [selectedSubCat, setSelectedSubCat] = useState(null)

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'USED',
  })

  const [answers, setAnswers] = useState({})

  const navBg = theme.palette.custom?.nav ?? theme.palette.primary.main

  // Load categories
  useEffect(() => {
    setLoading(true)
    productApi.getAllCategories()
      .then((res) => setCategories(res.payload?.categories ?? res))
      .catch(() => setError('Failed to load categories'))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectCategory = async (cat) => {
    setSelectedCat(cat)
    setSelectedSubCat(null)
    setQuestions([])
    setAnswers({})
    setLoading(true)
    try {
      const res = await productApi.getSubCategories(cat.categoryId)
      setSubCategories(res.payload?.subCategories ?? res)
    } catch {
      setError('Failed to load sub-categories')
    } finally {
      setLoading(false)
    }
    setActiveStep(1)
  }

  const handleSelectSubCategory = async (sub) => {
    setSelectedSubCat(sub)
    setLoading(true)
    try {
      const res = await productApi.getQuestionsBySubCategory(sub.categoryId)
      const qs = res.payload?.questions ?? res
      setQuestions(qs)
      setAnswers(Object.fromEntries(qs.map((q) => [q.questionId, ''])))
    } catch {
      setError('Failed to load form fields')
    } finally {
      setLoading(false)
    }
    setActiveStep(2)
  }

  const handleFormChange = (field) => (e) => {
    setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  const handleAnswerChange = (questionId) => (e) => {
    setAnswers((a) => ({ ...a, [questionId]: e.target.value }))
  }

  const handleSubmit = async () => {
    if (!user) { navigate('/login'); return }
    setSubmitting(true)
    setError('')
    try {
      const productInformation = questions.map((q) => ({
        formId: q.questionId,
        answer: answers[q.questionId] ?? '',
      }))

      const payload = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        categoryId: selectedCat.categoryId,
        subCategoryId: selectedSubCat.categoryId,
        productInformation,
        condition: form.condition,
        quickBidEnabled: false,
      }

      await productApi.createProduct(payload, user.id)
      setSuccess(true)
      setTimeout(() => navigate('/products'), 2000)
    } catch (e) {
      setError(e.response?.data?.message ?? 'Failed to create listing')
    } finally {
      setSubmitting(false)
    }
  }

  const canSubmit = form.title && form.price &&
    questions.filter((q) => q.required).every((q) => answers[q.questionId])

  const renderQuestion = (q) => {
    const label = `${q.question}${q.required ? ' *' : ''}`
    const value = answers[q.questionId] ?? ''
    const onChange = handleAnswerChange(q.questionId)

    switch (q.responseType) {
      case 'CHOICE':
        return (
          <TextField key={q.questionId} select fullWidth size="small"
            label={label} value={value} onChange={onChange} sx={{ mb: 2 }}>
            {q.options.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        )
      case 'TEXT_AREA':
        return (
          <TextField key={q.questionId} fullWidth multiline rows={3} size="small"
            label={label} placeholder={q.placeholder ?? ''} value={value}
            onChange={onChange} sx={{ mb: 2 }} />
        )
      case 'NUMBER':
        return (
          <TextField key={q.questionId} fullWidth size="small" label={label}
            type="number" placeholder={q.placeholder ?? ''} value={value}
            onChange={onChange} sx={{ mb: 2 }} />
        )
      case 'DATE':
        return (
          <TextField key={q.questionId} fullWidth size="small" label={label}
            type="date" value={value} onChange={onChange}
            InputLabelProps={{ shrink: true }} sx={{ mb: 2 }} />
        )
      case 'TEXT':
      default:
        return (
          <TextField key={q.questionId} fullWidth size="small" label={label}
            placeholder={q.placeholder ?? ''} value={value}
            onChange={onChange} sx={{ mb: 2 }} />
        )
    }
  }

  return (
    <Box sx={{ background: theme.palette.background.default, minHeight: '100vh', pb: 6 }}>

      {/* Hero banner */}
      <Box sx={{ background: navBg, py: 3, px: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h5" fontWeight={700} color="#fff"
            sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tag size={22} color="#ffe500" /> Start Selling
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5 }}>
            Reach millions of buyers on TradeArena
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
          {STEPS.map((label) => (
            <Step key={label}><StepLabel>{label}</StepLabel></Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>Listing created! Redirecting...</Alert>}

        {/* Step 0 — Category */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" fontWeight={600} mb={2}>Select a Category</Typography>
            {loading ? <CircularProgress /> : (
              <Grid container spacing={2}>
                {categories.map((cat) => (
                  <Grid item xs={6} sm={4} md={3} key={cat.categoryId}>
                    <Card className={styles.catCard}
                      sx={{ border: `2px solid ${selectedCat?.categoryId === cat.categoryId ? navBg : 'transparent'}` }}>
                      <CardActionArea onClick={() => handleSelectCategory(cat)} sx={{ p: 2.5 }}>
                        <CardContent sx={{ p: '0 !important', textAlign: 'center' }}>
                          <CategoryIcon iconName={cat.categoryIcon} size={32} color={navBg} />
                          <Typography variant="body2" fontWeight={600} mt={1}>
                            {cat.categoryName}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Step 1 — Sub-category */}
        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip label={selectedCat?.categoryName} color="primary" size="small" />
              <ChevronRight size={16} />
              <Typography variant="h6" fontWeight={600}>Select Sub-category</Typography>
            </Box>
            <Button variant="text" size="small" onClick={() => setActiveStep(0)} sx={{ mb: 2 }}>
              ← Back to categories
            </Button>
            {loading ? <CircularProgress /> : (
              <Grid container spacing={2}>
                {subCategories.map((sub) => (
                  <Grid item xs={6} sm={4} md={3} key={sub.categoryId}>
                    <Card className={styles.catCard}>
                      <CardActionArea onClick={() => handleSelectSubCategory(sub)} sx={{ p: 2.5 }}>
                        <CardContent sx={{ p: '0 !important', textAlign: 'center' }}>
                          <CategoryIcon iconName={sub.categoryIcon} size={28} color={navBg} />
                          <Typography variant="body2" fontWeight={600} mt={1}>
                            {sub.categoryName}
                          </Typography>
                        </CardContent>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {/* Step 2 — Product Details */}
        {activeStep === 2 && (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
              <Chip label={selectedCat?.categoryName} color="primary" size="small" />
              <ChevronRight size={14} />
              <Chip label={selectedSubCat?.categoryName} color="default" size="small" />
            </Box>
            <Button variant="text" size="small" onClick={() => setActiveStep(1)} sx={{ mb: 2 }}>
              ← Back to sub-categories
            </Button>

            <Grid container spacing={3}>
              {/* Left — core + dynamic fields */}
              <Grid item xs={12} md={8}>
                <Card sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle1" fontWeight={700} mb={2}>Product Information</Typography>

                  <TextField fullWidth label="Title *" value={form.title}
                    onChange={handleFormChange('title')} sx={{ mb: 2 }} size="small"
                    inputProps={{ maxLength: 150 }}
                    helperText={`${form.title.length}/150`} />

                  <TextField fullWidth label="Description" value={form.description}
                    onChange={handleFormChange('description')} sx={{ mb: 2 }} size="small"
                    multiline rows={3} inputProps={{ maxLength: 500 }} />

                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <TextField fullWidth label="Price *" value={form.price}
                        onChange={handleFormChange('price')} size="small" type="number"
                        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField fullWidth select label="Condition *" value={form.condition}
                        onChange={handleFormChange('condition')} size="small">
                        {['NEW', 'USED', 'REFURBISHED'].map((c) => (
                          <MenuItem key={c} value={c}>{c}</MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  </Grid>

                  {questions.length > 0 && (
                    <>
                      <Typography variant="subtitle2" fontWeight={600} mb={1.5} color="text.secondary">
                        Category Specifications
                      </Typography>
                      {questions.map(renderQuestion)}
                    </>
                  )}
                </Card>
              </Grid>

              {/* Right — Submit */}
              <Grid item xs={12} md={4}>
                <Card sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" fontWeight={600} mb={1} color="text.secondary">
                    Ready to list?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2.5} lineHeight={1.6}>
                    Review your details and post your listing to reach buyers instantly.
                  </Typography>
                  <Button
                    variant="contained" fullWidth size="large"
                    disabled={!canSubmit || submitting}
                    onClick={handleSubmit}
                    sx={{
                      borderRadius: 2, fontWeight: 700, fontSize: 15, py: 1.5,
                      background: navBg, '&:hover': { background: '#1a5dc8' }
                    }}>
                    {submitting ? <CircularProgress size={22} color="inherit" /> : 'Post Listing'}
                  </Button>
                </Card>
              </Grid>
            </Grid>
          </Box>
        )}
      </Container>
    </Box>
  )
}