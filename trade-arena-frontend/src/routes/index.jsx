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
import MyListings from '../pages/MyListings'
import SellerProductDetailPage from '../pages/SellerProductDetailPage'
import AdminHome from '../pages/admin/AdminHome'

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
            { path: 'my-listings', element: <MyListings /> },
            { path: 'chat', element: <ChatPage /> },
            { path: 'my-listings/:id', element: <SellerProductDetailPage /> },
        ],
    },
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            { index: true, element: <Navigate to="/admin/home" replace /> },
            { path: 'home', element: <AdminHome/> },
            { path: 'category-management', element: <CategoryConfiguration /> },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
])

export default router