import { createContext, useContext, useState } from 'react'

const WishlistContext = createContext()

export function WishlistProvider({ children }) {
    const [wishlist, setWishlist] = useState([]) // array of product ids

    const toggleWishlist = (productId) => {
        setWishlist((prev) =>
            prev.includes(productId)
                ? prev.filter((id) => id !== productId)
                : [...prev, productId]
        )
    }

    const isWishlisted = (productId) => wishlist.includes(productId)

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted, count: wishlist.length }}>
            {children}
        </WishlistContext.Provider>
    )
}

export function useWishlist() {
    return useContext(WishlistContext)
}
