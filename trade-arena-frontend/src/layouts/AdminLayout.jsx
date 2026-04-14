import { Outlet } from 'react-router-dom'

export default function AdminLayout() {
  return (
    <div>
      <div style={{ padding: '16px', background: '#1a2340', color: '#fff' }}>
        Admin sidebar coming soon
      </div>
      <div style={{ padding: '24px' }}>
        <Outlet />
      </div>
    </div>
  )
}