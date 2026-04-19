import { useNavigate } from 'react-router-dom'
import { Settings, Plus } from 'lucide-react'

export default function AdminHome() {
  const navigate = useNavigate()

  const baseStyle = {
    background: '#fff',
    borderRadius: '14px',
    padding: '22px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    border: '1px solid transparent',
    transition: 'all 0.25s ease',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  }

  const hoverStyle = {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
    border: '1px solid #4da3ff33',
  }

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
  }

  const handleEnter = (e) => {
    Object.assign(e.currentTarget.style, hoverStyle)
  }

  const handleLeave = (e) => {
    Object.assign(e.currentTarget.style, baseStyle)
  }

  return (
    <div>
      <h2 style={{ marginBottom: '6px' }}>Admin Tools</h2>
      <p style={{ marginBottom: '20px', color: '#666' }}>
        Manage platform configuration and moderation
      </p>

      <div style={gridStyle}>

        {/* Category Management */}
        <div
          style={baseStyle}
          onClick={() => navigate('/admin/category-management')}
          onMouseEnter={handleEnter}
          onMouseLeave={handleLeave}
        >
          <Settings size={28} color="#4da3ff" />
          <h3 style={{ margin: 0 }}>Category Management</h3>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            Create, edit and manage product categories
          </p>
        </div>

        {/* Coming soon */}
        <div
          style={{ ...baseStyle, opacity: 0.6, cursor: 'not-allowed' }}
        >
          <Plus size={28} color="#aaa" />
          <h3 style={{ margin: 0 }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
            More admin tools will appear here
          </p>
        </div>

        <div style={{ ...baseStyle, opacity: 0.6 }}>
          <Plus size={28} color="#aaa" />
          <h3 style={{ margin: 0 }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
            Analytics & monitoring tools
          </p>
        </div>

        <div style={{ ...baseStyle, opacity: 0.6 }}>
          <Plus size={28} color="#aaa" />
          <h3 style={{ margin: 0 }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
            User management system
          </p>
        </div>

        <div style={{ ...baseStyle, opacity: 0.6 }}>
          <Plus size={28} color="#aaa" />
          <h3 style={{ margin: 0 }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
            Auction monitoring tools
          </p>
        </div>

        <div style={{ ...baseStyle, opacity: 0.6 }}>
          <Plus size={28} color="#aaa" />
          <h3 style={{ margin: 0 }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
            System configuration
          </p>
        </div>

        <div style={{ ...baseStyle, opacity: 0.6 }}>
          <Plus size={28} color="#aaa" />
          <h3 style={{ margin: 0 }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
            Logs & debugging
          </p>
        </div>

        <div style={{ ...baseStyle, opacity: 0.6 }}>
          <Plus size={28} color="#aaa" />
          <h3 style={{ margin: 0 }}>Coming Soon</h3>
          <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
            Notification center
          </p>
        </div>

        <div style={{ ...baseStyle, opacity: 0.6 }}>
          <Plus size={28} color="#aaa" />
          <h3 style={{ margin: 0 }}>More Tools Coming</h3>
          <p style={{ margin: 0, color: '#bbb', fontSize: '14px' }}>
            This space is reserved for future modules
          </p>
        </div>

      </div>
    </div>
  )
}