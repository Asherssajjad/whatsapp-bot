/**
 * API client for backend. Uses Bearer token from localStorage.
 */
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || ''

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Auth
export const register = (data) => api.post('/api/auth/register', data)
export const login = (data) => api.post('/api/auth/login', data)

// User: conversations
export const listConversations = (params) => api.get('/api/conversations', { params })
export const getConversation = (id) => api.get(`/api/conversations/${id}`)

// User: leads
export const listLeads = (params) => api.get('/api/leads', { params })
export const updateLead = (id, data) => api.patch(`/api/leads/${id}`, data)
export const exportLeadsCsv = () => api.get('/api/leads/export/csv', { responseType: 'blob' })

// User: settings (conversation flow)
export const getConversationFlow = () => api.get('/api/settings/conversation-flow')
export const updateConversationFlow = (data) => api.patch('/api/settings/conversation-flow', data)

// User: notifications
export const listNotifications = (params) => api.get('/api/notifications', { params })
export const markNotificationRead = (id) => api.post(`/api/notifications/${id}/read`)

// User: WhatsApp accounts
export const listMyWhatsAppAccounts = () => api.get('/api/accounts/whatsapp')

// Admin
export const adminListUsers = (params) => api.get('/api/admin/users', { params })
export const adminCreateUser = (data) => api.post('/api/admin/users', data)
export const adminUpdateUser = (id, data) => api.patch(`/api/admin/users/${id}`, data)
export const adminUsage = (params) => api.get('/api/admin/usage', { params })
export const adminAssignWhatsApp = (body) => api.post('/api/admin/whatsapp-accounts', body)
export const adminWebhookLogs = (params) => api.get('/api/admin/webhook-logs', { params })
