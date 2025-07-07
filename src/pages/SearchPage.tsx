import React from 'react'
import { Card, Typography } from 'antd'

const { Title } = Typography

const SearchPage: React.FC = () => {
  return (
    <div className="p-6">
      <Card>
        <Title level={2}>搜索页面</Title>
        <p>搜索功能正在开发中...</p>
      </Card>
    </div>
  )
}

export default SearchPage