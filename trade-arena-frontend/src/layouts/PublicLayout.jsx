import Navbar from '../components/Navbar'
import { Outlet } from 'react-router-dom'

export default function PublicLayout({ onToggleTheme, isDark }) {
  return (
    <>
      <Navbar onToggleTheme={onToggleTheme} isDark={isDark} />
      <Outlet />
    </>
  )
}