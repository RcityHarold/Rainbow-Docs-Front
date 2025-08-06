import React, { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from '@/stores/authStore'

// Layout组件
import MainLayout from '@/components/layout/MainLayout'
import AuthLayout from '@/components/layout/AuthLayout'

// 页面组件
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import EmailVerificationPage from '@/pages/auth/EmailVerificationPage'
import OAuthCallbackPage from '@/pages/auth/OAuthCallbackPage'
import InitializePasswordPage from '@/pages/auth/InitializePasswordPage'
import DashboardPage from '@/pages/DashboardPage'
import SpaceDetailPage from '@/pages/space/SpaceDetailPage'
import SpaceListPage from '@/pages/space/SpaceListPage'
import SpaceMembersPage from '@/pages/space/SpaceMembersPage'
import SpaceSettingsPage from '@/pages/space/SpaceSettingsPage'
import AcceptInvitationPage from '@/pages/invitation/AcceptInvitationPage'
import DocumentViewPage from '@/pages/document/DocumentViewPage'
import DocumentByIdViewPage from '@/pages/document/DocumentByIdViewPage'
import DocumentEditPage from '@/pages/document/DocumentEditPage'
import DocumentCreatePage from '@/pages/document/DocumentCreatePage'
import DocumentListPage from '@/pages/document/DocumentListPage'
import RecentDocumentsPage from '@/pages/document/RecentDocumentsPage'
import DraftsPage from '@/pages/document/DraftsPage'
import SearchPage from '@/pages/SearchPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import NotFoundPage from '@/pages/NotFoundPage'
import NotificationsPage from '@/pages/notifications'

// 安装向导
import InstallerApp from './InstallerApp'

// 公开文档查看器
import PublicationViewer from '@/pages/public/PublicationViewer'
import PublicationHome from '@/pages/public/PublicationHome'
import PublicationPreview from '@/pages/public/PublicationPreview'

// 路由守卫组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  
  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />
  }
  
  return <>{children}</>
}

const App: React.FC = () => {
  const { refreshUser, isAuthenticated } = useAuthStore()
  const location = useLocation()
  const [loading, setLoading] = React.useState(true)
  const [needsInstallation, setNeedsInstallation] = React.useState(false)
  
  // 检查是否是公开文档路径
  const isPublicPath = location.pathname.startsWith('/p/')

  useEffect(() => {
    const initApp = async () => {
      try {
        // 首先检查是否需要安装
        const response = await fetch('/api/install/status')
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success' && data.data && !data.data.is_installed) {
            setNeedsInstallation(true)
            setLoading(false)
            return
          }
        }

        // 如果不需要安装，继续正常的认证初始化
        const token = localStorage.getItem('auth_token')
        if (token) {
          await refreshUser()
        }
      } catch (error) {
        console.error('初始化失败:', error)
        // 如果检查安装状态失败，假设需要安装
        setNeedsInstallation(true)
      } finally {
        setLoading(false)
      }
    }

    initApp()
  }, [refreshUser])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Spin size="large" tip="正在加载..." />
      </div>
    )
  }

  // 如果需要安装，显示安装向导
  if (needsInstallation) {
    return <InstallerApp />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* 公开文档查看路由（无需认证） */}
        <Route path="/p/:slug" element={<PublicationHome />} />
        <Route path="/p/:slug/:docSlug" element={<PublicationHome />} />
        
        {/* 预览路由（需要认证） */}
        <Route path="/preview/:publicationId" element={
          <ProtectedRoute>
            <PublicationPreview />
          </ProtectedRoute>
        } />
        <Route path="/preview/:publicationId/:docSlug" element={
          <ProtectedRoute>
            <PublicationPreview />
          </ProtectedRoute>
        } />
        
        {/* 公开路由 */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthLayout>
                <LoginPage />
              </AuthLayout>
            </PublicRoute>
          }
        />
        
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthLayout>
                <RegisterPage />
              </AuthLayout>
            </PublicRoute>
          }
        />
        
        <Route
          path="/verify-email/:token"
          element={
            <AuthLayout>
              <EmailVerificationPage />
            </AuthLayout>
          }
        />
        
        <Route
          path="/oauth/callback"
          element={<OAuthCallbackPage />}
        />
        
        <Route
          path="/initialize-password"
          element={<InitializePasswordPage />}
        />

        {/* 邀请接受页面（独立布局） */}
        <Route
          path="/invite/accept"
          element={<AcceptInvitationPage />}
        />

        {/* 受保护的路由 */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/spaces" element={<SpaceListPage />} />
                  <Route path="/spaces/:spaceSlug" element={<SpaceDetailPage />} />
                  <Route path="/spaces/:spaceSlug/members" element={<SpaceMembersPage />} />
                  <Route path="/spaces/:spaceSlug/settings" element={<SpaceSettingsPage />} />
                  <Route path="/spaces/:spaceSlug/docs" element={<DocumentListPage />} />
                  <Route path="/spaces/:spaceSlug/docs/new" element={<DocumentCreatePage />} />
                  <Route path="/spaces/:spaceSlug/docs/:docSlug/edit" element={<DocumentEditPage />} />
                  <Route path="/spaces/:spaceSlug/docs/:docSlug" element={<DocumentViewPage />} />
                  <Route path="/documents" element={<RecentDocumentsPage />} />
                  <Route path="/documents/drafts" element={<DraftsPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/notifications" element={<NotificationsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="/docs/:docId/edit" element={<DocumentEditPage />} />
                  <Route path="/docs/:docId" element={<DocumentByIdViewPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App