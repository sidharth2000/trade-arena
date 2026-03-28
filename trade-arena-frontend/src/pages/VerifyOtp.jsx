import { useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Button, Alert } from '@mui/material'
import { authApi } from '../api/AuthApi'
import ShoppingParticles from '../components/ShoppingParticles'
import styles from './VerifyOtp.module.css'

export default function VerifyOtp() {
    const navigate = useNavigate()
    const location = useLocation()

    const email = location.state?.email

    const [otp, setOtp] = useState(['', '', '', ''])
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const inputsRef = useRef([])

    function handleChange(value, index) {
        if (!/^\d*$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        if (value && index < 3) {
            inputsRef.current[index + 1].focus()
        }
    }

    function handleKeyDown(e, index) {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputsRef.current[index - 1].focus()
        }
    }

    async function handleVerify() {
        setError('')

        const code = otp.join('')

        if (code.length !== 4) {
            setError('Enter 4 digit OTP')
            return
        }

        setLoading(true)

        try {
            await authApi.verifyOtp({
                email,
                otp: code,
            })

            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.message || 'OTP verification failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className={styles.page}>
            <ShoppingParticles />
            <div className={styles.card}>

                <div className={styles.logo}>
                    TradeArena
                    <span>buy & sell smarter</span>
                </div>

                <h2 className={styles.heading}>Enter OTP</h2>
                <p className={styles.sub}>
                    We sent a code to <b>{email}</b>
                </p>

                {error && <Alert severity="error">{error}</Alert>}

                <div className={styles.otpBox}>
                    {otp.map((digit, i) => (
                        <input
                            key={i}
                            ref={(el) => (inputsRef.current[i] = el)}
                            value={digit}
                            maxLength={1}
                            onChange={(e) => handleChange(e.target.value, i)}
                            onKeyDown={(e) => handleKeyDown(e, i)}
                            className={styles.otpInput}
                        />
                    ))}
                </div>

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleVerify}
                    disabled={loading}
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>

            </div>
        </div>
    )
}