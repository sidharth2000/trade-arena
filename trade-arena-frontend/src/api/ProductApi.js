import client from './client'

export const productApi = {
  // GET /api/products?page=0&size=20&status=ACTIVE
  getProducts: async (params = {}) => {
    const res = await client.get('/api/products', { params })
    return res.data
  },

  // GET /api/products/{id}
  getProductById: async (id) => {
    const res = await client.get(`/api/products/${id}`)
    return res.data
  },

  // POST /api/products  — requires X-User-Id header
  createProduct: async (payload, userId) => {
    const res = await client.post('/api/products', payload, {
      headers: { 'X-User-Id': userId },
    })
    return res.data
  },

  // PATCH /api/products/{id}/remove
  removeProduct: async (id, userId) => {
    const res = await client.patch(`/api/products/${id}/remove`, null, {
      headers: { 'X-User-Id': userId },
    })
    return res.data
  },
}