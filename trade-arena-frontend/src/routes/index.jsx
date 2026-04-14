import { createBrowserRouter, Navigate } from 'react-router-dom'
import PublicLayout from '../layouts/PublicLayout'
import AdminLayout from '../layouts/AdminLayout'

import Login from '../pages/Login'
import Register from '../pages/Register'
import VerifyOtp from '../pages/VerifyOtp'
import SellProduct from '../pages/SellProduct'
import ChatPage from '../pages/ChatPage'
import ProductsPage from '../pages/ProductsPage'
import ProductDetailPage from '../pages/ProductDetailPage'

import CategoryConfiguration from '../pages/admin/CategoryConfiguration'

const router = createBrowserRouter([
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        path: '/verify-user',
        element: <VerifyOtp />,
    },
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            { index: true, element: <ProductsPage /> },
            { path: 'products', element: <ProductsPage /> },
            { path: 'products/:id', element: <ProductDetailPage /> },
            { path: 'sell', element: <SellProduct /> },
            { path: 'chat', element: <ChatPage /> },
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
        element: <Navigate to="/" replace />,
    },
])

export default router