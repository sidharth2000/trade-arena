import { Heart } from 'lucide-react'
import { useWishlist } from '../context/WishlistContext'

export default function ProductCard({ product }) {
    const { toggleWishlist, isWishlisted } = useWishlist()
    const liked = isWishlisted(product.id)

    return (
        <div style={{
            border: '1px solid #ddd',
            padding: '10px',
            borderRadius: '10px',
            width: '200px',
            position: 'relative',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            transition: 'box-shadow 0.2s',
        }}>

            {/* ❤️ Wishlist button */}
            <button
                onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id) }}
                style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(255,255,255,0.85)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                    zIndex: 1,
                }}
                title={liked ? 'Remove from wishlist' : 'Add to wishlist'}
            >
                <Heart
                    size={16}
                    color={liked ? '#ff6161' : '#aaa'}
                    fill={liked ? '#ff6161' : 'none'}
                    style={{ transition: 'all 0.2s' }}
                />
            </button>

            <img
                src={product.image}
                alt="product"
                style={{ width: '100%', borderRadius: '8px' }}
            />

            <h3 style={{ margin: '8px 0 4px', fontSize: '14px' }}>{product.title}</h3>
            <p style={{ margin: 0, fontWeight: 600, color: '#ff6161' }}>₹{product.price}</p>

        </div>
    )
}
