import React from 'react'
import { Layout } from 'antd'

const { Content } = Layout

interface AuthLayoutProps {
  children: React.ReactNode
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Content className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo区域 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
              <span className="text-white font-bold text-2xl">R</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rainbow Docs</h1>
            <p className="text-gray-600">智能文档管理系统</p>
          </div>

          {/* 内容区域 */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {children}
          </div>

          {/* 底部信息 */}
          <div className="text-center mt-8 text-sm text-gray-500">
            <p>© 2024 Rainbow Docs. All rights reserved.</p>
          </div>
        </div>
      </Content>
    </Layout>
  )
}

export default AuthLayout