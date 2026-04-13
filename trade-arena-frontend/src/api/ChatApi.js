import client from './client'

export const chatApi = {
  // GET /api/chat/conversations/{userId}
  getConversations: async (userId) => {
    const res = await client.get(`/api/chat/conversations/${userId}`)
    return res.data
  },

  // GET /api/chat/messages/{chatId}
  getMessages: async (chatId) => {
    const res = await client.get(`/api/chat/messages/${chatId}`)
    return res.data
  },

  // POST /api/chat/send
  sendMessage: async (payload) => {
    const res = await client.post('/api/chat/send', payload)
    return res.data
  },
}