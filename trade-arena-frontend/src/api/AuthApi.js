import client from './client'

const REGISTER_URL = '/auth/register'
const LOGIN_URL = '/auth/login'

export const authApi = {
  register: async (payload) => {
    const res = await client.post(REGISTER_URL, payload)
    return res.data
  },

  verifyOtp: async (payload) => {
    const res = await client.post('/auth/verify-otp', payload)
    return res.data
  },

  login: async (payload) => {
    const res = await client.post(LOGIN_URL, payload)
    return res.data
  },
}