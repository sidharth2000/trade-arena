import client from './client'

export const notificationApi = {
  getByUser: async (userId) => {
    const res = await client.get(`/api/notifications/user/${userId}`)
    return res.data
  },

  markRead: async (notificationId) => {
    const res = await client.put(`/api/notifications/${notificationId}/read`)
    return res.data
  },

  markAllRead: async (userId) => {
    const res = await client.put(`/api/notifications/user/${userId}/read-all`)
    return res.data
  },

  // SSE stream — returns EventSource instance; caller must close it
  subscribe: (userId, onMessage) => {
    const token = localStorage.getItem('token')
    const url = `http://localhost:8085/api/notifications/stream/${userId}`
    const es = new EventSource(url)
    es.onmessage = (e) => {
      try {
        onMessage(JSON.parse(e.data))
      } catch {
        // ignore parse errors
      }
    }
    return es
  },
}