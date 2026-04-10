import { createBrowserRouter, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'

import Login from '../pages/Login'
import Register from '../pages/Register'
import VerifyOtp from '../pages/VerifyOtp'

import CategoryConfiguration from '../pages/admin/CategoryConfiguration'

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register/>,
    },
    {
        path: '/verify-user',
        element: <VerifyOtp/>,
    },
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            { index: true, element: <div>Home page</div> },
        ],
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            { index: true, element: <Navigate to="/admin/dashboard" replace /> },
            { path: 'dashboard', element: <div>Dashboard</div> },
            { path: 'category-configuration', element: <CategoryConfiguration /> },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/login" replace />,
    },
])

export default router