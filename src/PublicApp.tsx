import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import PublicationViewer from '@/pages/public/PublicationViewer'
import PublicationHome from '@/pages/public/PublicationHome'

/**
 * 公开文档查看应用
 * 无需认证即可访问
 */
const PublicApp: React.FC = () => {
  return (
    <Routes>
      {/* 发布首页 */}
      <Route path="/p/:slug" element={<PublicationHome />} />
      
      {/* 文档查看页 */}
      <Route path="/p/:slug/:docSlug" element={<PublicationViewer />} />
      
      {/* 其他路径重定向到主应用 */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default PublicApp