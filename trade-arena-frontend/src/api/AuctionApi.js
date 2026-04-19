const AUCTION_BASE = 'http://localhost:8086/api/auction'

function authHeaders() {
  const token = localStorage.getItem('token')
  return token
    ? { Authorization: token.startsWith('Bearer ') ? token : `Bearer ${token}` }
    : {}
}

async function get(url) {
  const res = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    }
  })

  if (!res.ok) throw new Error(`GET failed: ${res.status}`)
  return res.json()
}

export const auctionApi = {

  startAuction: async (payload) => {
    const res = await fetch(`${AUCTION_BASE}/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw err
    }

    return res.json()
  },

  placeBid: async (payload) => {
    const res = await fetch(`${AUCTION_BASE}/placebid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw err
    }

    return res.json()
  },

  // 🔥 NEW CORE API YOU ASKED FOR
  getAuctionByProductId: async (productId) => {
    return get(`${AUCTION_BASE}/product/${productId}`)
  }

}