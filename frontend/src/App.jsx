import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout'
import AdminLayout from './components/Layout/AdminLayout'

// Public
import Login from './pages/Login'
import Signup from './pages/Signup'
import DemoUserDashboard from './pages/DemoUserDashboard'
import DemoAdminDashboard from './pages/DemoAdminDashboard'

// User
import Dashboard from './pages/Dashboard'
import Conversations from './pages/Conversations'
import ConversationDetail from './pages/ConversationDetail'
import Leads from './pages/Leads'
import Settings from './pages/Settings'
import Notifications from './pages/Notifications'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminUsage from './pages/admin/AdminUsage'
import AdminWhatsApp from './pages/admin/AdminWhatsApp'
import AdminLogs from './pages/admin/AdminLogs'

function ProtectedRoute({ children, adminOnly }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/demo" element={<DemoUserDashboard />} />
      <Route path="/demo/admin" element={<DemoAdminDashboard />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="conversations" element={<Conversations />} />
        <Route path="conversations/:id" element={<ConversationDetail />} />
        <Route path="leads" element={<Leads />} />
        <Route path="settings" element={<Settings />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="usage" element={<AdminUsage />} />
        <Route path="whatsapp" element={<AdminWhatsApp />} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
