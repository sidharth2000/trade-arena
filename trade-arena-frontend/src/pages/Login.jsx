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
import styles from './Login.module.css'
import { authApi } from '../api/AuthApi'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await authApi.login({ email, password })

      if (res.payload) {
        const { token, email: userEmail, role, id } = res.payload

        const cleanToken = token.replace('Bearer ', '')

        localStorage.setItem('token', cleanToken)
        localStorage.setItem(
          'user',
          JSON.stringify({ email: userEmail, role, id })
        )

        if (role === 'ADMIN') {
          navigate('/admin/home')
        } else {
          navigate('/')
        }
      } else {
        setError(res.message || 'Invalid email or password')
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Login failed'
      )
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

        <h2 className={styles.heading}>Welcome back</h2>
        <p className={styles.sub}>Sign in to your account</p>

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
          <TextField
            label="Email"
            type="email"
            size="small"
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            type={showPassword ? 'text' : 'password'}
            size="small"
            fullWidth
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
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

          <p className={styles.forgot}>Forgot password?</p>

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading}
            className={styles.submitBtn}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className={styles.switch}>
          No account?{' '}
          <span onClick={() => navigate('/register')}>
            Register here
          </span>
        </p>

      </div>
    </div>
  )
}