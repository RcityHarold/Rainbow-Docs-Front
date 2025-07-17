import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Alert, Card, Typography } from 'antd'
import { LockOutlined } from '@ant-design/icons'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'

const { Title, Text } = Typography

const InitializePasswordPage: React.FC = () => {
  const [form] = Form.useForm()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (!tokenFromUrl) {
      navigate('/login')
      return
    }
    setToken(tokenFromUrl)
  }, [searchParams, navigate])

  const handleSubmit = async (values: { password: string; confirmPassword: string }) => {
    if (values.password !== values.confirmPassword) {
      setError('两次输入的密码不一致')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/initialize-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: values.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || '设置密码失败')
      }

      const userData = await response.json()
      
      // 更新用户信息
      setAuth(userData, token)
      
      // 跳转到仪表板
      navigate('/dashboard', { replace: true })
      
    } catch (error: any) {
      console.error('Initialize password error:', error)
      setError(error.message || '设置密码失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <div className="text-center mb-6">
            <Title level={3}>设置账户密码</Title>
            <Text type="secondary">
              为了完善您的账户信息，请设置一个密码
            </Text>
          </div>

          {error && (
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError('')}
              className="mb-6"
            />
          )}

          <Form
            form={form}
            name="initializePassword"
            onFinish={handleSubmit}
            autoComplete="off"
            layout="vertical"
            size="large"
          >
            <Form.Item
              label="新密码"
              name="password"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码至少6位!' },
                { 
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
                  message: '密码必须包含大小写字母和数字!' 
                },
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />} 
                placeholder="请输入新密码"
              />
            </Form.Item>

            <Form.Item
              label="确认密码"
              name="confirmPassword"
              rules={[
                { required: true, message: '请确认密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入的密码不一致!'))
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined className="text-gray-400" />} 
                placeholder="请再次输入密码"
              />
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                className="w-full h-12 text-base font-medium"
              >
                {loading ? '设置中...' : '完成设置'}
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </div>
    </div>
  )
}

export default InitializePasswordPage