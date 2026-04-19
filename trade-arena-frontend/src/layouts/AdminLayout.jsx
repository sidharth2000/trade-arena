import { Outlet, useNavigate } from 'react-router-dom'
import { Home, LogOut, Shield } from 'lucide-react'

export default function AdminLayout() {
  const navigate = useNavigate()

  const handleLogout = () => {
    // same idea as Navbar
    localStorage.clear()
    navigate('/login')
  }

  const navItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    opacity: 0.9,
    padding: '6px 10px',
    borderRadius: '6px',
    transition: '0.2s',
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f7fb' }}>

      {/* Top Bar */}
      <div
        style={{
          height: '60px',
          background: '#1a2340',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >

        {/* Brand */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 700,
            letterSpacing: '0.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
          onClick={() => navigate('/admin/home')}
        >
          <Shield size={18} />
          TradeArena <span style={{ color: '#4da3ff' }}>ADMIN</span>
        </div>

        {/* Nav */}
        <div style={{ display: 'flex', gap: '8px', fontSize: '14px' }}>

          <div
            style={navItemStyle}
            onClick={() => navigate('/admin/home')}
          >
            <Home size={16} />
            Home
          </div>

          <div
            style={{ ...navItemStyle, color: '#ff6b6b' }}
            onClick={handleLogout}
          >
            <LogOut size={16} />
            Exit
          </div>

        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        <Outlet />
      </div>
    </div>
  )
}