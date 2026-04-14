// All notification calls go DIRECTLY to port 8085
// Reason: gateway causes CORS issues on PUT and strips responses on GET
const NOTIF_BASE = 'http://localhost:8085/api/notifications'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token
    ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
    : {}
}

export const notificationApi = {

  // GET all notifications for a user
  getByUser: async (userId) => {
    const res = await fetch(`${NOTIF_BASE}/user/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    })
    if (!res.ok) throw new Error(`getByUser failed: ${res.status}`)
    return res.json()
  },

  // PUT mark single notification as read
  markRead: async (notificationId) => {
    const res = await fetch(`${NOTIF_BASE}/${notificationId}/read`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    })
    if (!res.ok) throw new Error(`markRead failed: ${res.status}`)
    return res.json()
  },

  // PUT mark all as read
  markAllRead: async (userId) => {
    const res = await fetch(`${NOTIF_BASE}/user/${userId}/read-all`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    })
    if (!res.ok) throw new Error(`markAllRead failed: ${res.status}`)
    return res.json()
  },

  /**
   * SSE stream — direct to 8085.
   * Backend sends named events → must use addEventListener("notification")
   */
  subscribe: (userId, onMessage) => {
    const url = `${NOTIF_BASE}/stream/${userId}`
    const es = new EventSource(url)

    es.addEventListener('notification', (e) => {
      try {
        const parsed = JSON.parse(e.data)
        console.log('[SSE] notification received:', parsed)
        onMessage(parsed)
      } catch (err) {
        console.error('[SSE] parse error:', err)
      }
    })

    es.addEventListener('connected', (e) => {
      console.log('[SSE] connected:', e.data)
    })

    // Fallback for unnamed events
    es.onmessage = (e) => {
      try { onMessage(JSON.parse(e.data)) } catch { /* ignore */ }
    }

    es.onerror = (err) => console.error('[SSE] error:', err)

    return es
  },
}