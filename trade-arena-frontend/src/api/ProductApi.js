// All product calls go DIRECTLY to port 8083
// Reason: gateway + product service both add CORS headers causing double header issue
const PRODUCT_BASE = 'http://localhost:8080/api/products'

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

  /**
   * POST /api/products — multipart/form-data direct to 8083
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
        // No Content-Type — browser sets multipart boundary automatically
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
}