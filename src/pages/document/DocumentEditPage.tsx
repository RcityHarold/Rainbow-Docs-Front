import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const DocumentEditPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <Title level={2}>文档编辑</Title>
        <p>文档编辑页面正在开发中...</p>
      </Card>
    </div>
  )
}

export default DocumentEditPage