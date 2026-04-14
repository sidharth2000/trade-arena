import { useState, useEffect } from 'react'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

function buildUser(token) {
  if (!token) return null
  const payload = parseJwt(token)
  if (!payload) return null
  return {
    id: payload.userId ?? payload.sub,
    email: payload.email,
    role: payload.role,
  }
}

export function useAuth() {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(() => buildUser(localStorage.getItem('token')))

  useEffect(() => {
    const sync = () => {
      const t = localStorage.getItem('token')
      setToken(t)
      setUser(buildUser(t))
    }

    // Patch localStorage so same-tab login/logout triggers re-render
    const _set = localStorage.setItem.bind(localStorage)
    const _remove = localStorage.removeItem.bind(localStorage)
    const _clear = localStorage.clear.bind(localStorage)

    localStorage.setItem = (key, value) => {
      _set(key, value)
      if (key === 'token') sync()
    }
    localStorage.removeItem = (key) => {
      _remove(key)
      if (key === 'token') sync()
    }
    localStorage.clear = () => {
      _clear()
      sync()
    }

    // Cross-tab support
    window.addEventListener('storage', sync)

    return () => {
      window.removeEventListener('storage', sync)
      localStorage.setItem = _set
      localStorage.removeItem = _remove
      localStorage.clear = _clear
    }
  }, [])

  return { user, token, isLoggedIn: !!user }
}