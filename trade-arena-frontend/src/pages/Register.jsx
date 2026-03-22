import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Divider,
  Alert,
} from '@mui/material'
import { Eye, EyeOff } from 'lucide-react'
import ShoppingParticles from '../components/ShoppingParticles'
import styles from './Register.module.css'

export default function Register() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      // TODO: replace with real API call
      // const { data } = await api.post('/auth/register', {
      //   firstName: form.firstName,
      //   lastName: form.lastName,
      //   email: form.email,
      //   password: form.password,
      // })
      // navigate('/login')
      await new Promise(r => setTimeout(r, 800))
      setError('Backend not connected yet')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  function handleGoogle() {
    window.location.href = '/oauth2/authorization/google'
  }

  return (
    <div className={styles.page}>
      <ShoppingParticles />

      <div className={styles.card}>

        <div className={styles.logo}>
          TradeArena
          <span>buy &amp; sell smarter</span>
        </div>

        <h2 className={styles.heading}>Create account</h2>
        <p className={styles.sub}>Join TradeArena today</p>

        <button className={styles.googleBtn} onClick={handleGoogle}>
          <img
            src="https://www.google.com/favicon.ico"
            width={16}
            height={16}
            alt="Google"
          />
          Continue with Google
        </button>

        <Divider className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </Divider>

        {error && (
          <Alert severity="error" className={styles.alert}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>

          <div className={styles.nameRow}>
            <TextField
              label="First name"
              name="firstName"
              size="small"
              fullWidth
              required
              value={form.firstName}
              onChange={handleChange}
            />
            <TextField
              label="Last name"
              name="lastName"
              size="small"
              fullWidth
              required
              value={form.lastName}
              onChange={handleChange}
            />
          </div>

          <TextField
            label="Email"
            name="email"
            type="email"
            size="small"
            fullWidth
            required
            value={form.email}
            onChange={handleChange}
          />

          <TextField
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            size="small"
            fullWidth
            required
            value={form.password}
            onChange={handleChange}
            helperText="Minimum 8 characters"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowPassword(s => !s)}
                    edge="end"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Confirm password"
            name="confirmPassword"
            type={showConfirm ? 'text' : 'password'}
            size="small"
            fullWidth
            required
            value={form.confirmPassword}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setShowConfirm(s => !s)}
                    edge="end"
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Creating account…' : 'Create account'}
          </Button>

        </form>

        <p className={styles.terms}>
          By registering you agree to our{' '}
          <span>Terms of service</span> and <span>Privacy policy</span>
        </p>

        <p className={styles.switch}>
          Already have an account?{' '}
          <span onClick={() => navigate('/login')}>Sign in</span>
        </p>

      </div>
    </div>
  )
}        