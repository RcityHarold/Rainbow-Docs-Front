import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const ProfilePage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <Title level={2}>个人资料</Title>
        <p>个人资料页面正在开发中...</p>
      </Card>
    </div>
  )
}

export default ProfilePage