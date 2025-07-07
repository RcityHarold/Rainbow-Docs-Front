import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const DocumentViewPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <Title level={2}>文档查看</Title>
        <p>文档查看页面正在开发中...</p>
      </Card>
    </div>
  )
}

export default DocumentViewPage