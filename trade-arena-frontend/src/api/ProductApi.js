// All product calls go through the gateway at port 8080
const PRODUCT_BASE = 'http://localhost:8080/api/products'
const TRANSACTION_BASE = 'http://localhost:8080/api/transactions'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token
    ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
    : {}
}

async function get(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
  })
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`)
  return res.json()
}

export const productApi = {

  // GET /api/products
  getProducts: async (params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString()
    return get(`${PRODUCT_BASE}${query ? '?' + query : ''}`)
  },

  // GET /api/products/id/{id}
  getProductById: async (id) => {
    return get(`${PRODUCT_BASE}/id/${id}`)
  },

  getMyProducts: async (userId, params = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null)
    ).toString()

    const res = await fetch(`${PRODUCT_BASE}/my${query ? '?' + query : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': String(userId),
        ...authHeaders(),
      },
    })

    if (!res.ok) throw new Error(`getMyProducts failed: ${res.status}`)
    return res.json()
  },

  /**
   * POST /api/products — multipart/form-data
   */
  createProduct: async (payload, userId, images = []) => {
    const formData = new FormData()

    const jsonBlob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
    formData.append('data', jsonBlob)

    if (images && images.length > 0) {
      images.forEach((file) => formData.append('images', file))
    }

    const res = await fetch(PRODUCT_BASE, {
      method: 'POST',
      headers: {
        'X-User-Id': String(userId),
        ...authHeaders(),
      },
      body: formData,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: 'Failed to create listing' }))
      throw { response: { data: err } }
    }

    return res.json()
  },

  // PATCH /api/products/id/{id}/remove
  removeProduct: async (id, userId) => {
    const res = await fetch(`${PRODUCT_BASE}/id/${id}/remove`, {
      method: 'PATCH',
      headers: { 'X-User-Id': String(userId), ...authHeaders() },
    })
    if (!res.ok) throw new Error(`removeProduct failed: ${res.status}`)
    return res.json()
  },

  // PUT /api/products/id/{id}/mark-sold
  markAsSold: async (id) => {
    const res = await fetch(`${PRODUCT_BASE}/id/${id}/mark-sold`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    })
    if (!res.ok) throw new Error(`markAsSold failed: ${res.status}`)
    return res.status === 204 ? null : res.json()
  },

  // GET /api/products/categories
  getAllCategories: async () => {
    return get(`${PRODUCT_BASE}/categories`)
  },

  // GET /api/products/categories/{id}/subcategories
  getSubCategories: async (parentCategoryId) => {
    return get(`${PRODUCT_BASE}/categories/${parentCategoryId}/subcategories`)
  },

  // GET /api/products/subcategories/{id}/questions
  getQuestionsBySubCategory: async (subCategoryId) => {
    return get(`${PRODUCT_BASE}/subcategories/${subCategoryId}/questions`)
  },

  // ─── Transaction APIs ──────────────────────────────────────

  /**
   * POST /api/transactions
   * Records a payment and marks the product as SOLD on the backend.
   */
  recordTransaction: async ({ productId, userId, price, paymentMethod }) => {
    const res = await fetch(TRANSACTION_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ productId, userId, price, paymentMethod }),
    })
    if (!res.ok) throw new Error(`recordTransaction failed: ${res.status}`)
    return res.json()
  },

  // GET /api/transactions/product/{productId}
  getTransactionsByProduct: async (productId) => {
    return get(`${TRANSACTION_BASE}/product/${productId}`)
  },

  // GET /api/transactions/user/{userId}
  getTransactionsByUser: async (userId) => {
    return get(`${TRANSACTION_BASE}/user/${userId}`)
  },
}