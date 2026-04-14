import { useMemo } from 'react'

function parseJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export function useAuth() {
  const token = localStorage.getItem('token')
  const user = useMemo(() => {
    if (!token) return null
    const payload = parseJwt(token)
    return payload
      ? { id: payload.userId ?? payload.sub, email: payload.email, role: payload.role }
      : null
  }, [token])

  return { user, token, isLoggedIn: !!user }
}