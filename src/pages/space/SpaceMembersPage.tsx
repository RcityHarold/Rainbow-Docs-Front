import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Breadcrumb,
  Spin,
  Empty
} from 'antd'
import {
  HomeOutlined,
  FolderOpenOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { useSpaceStore } from '@/stores/spaceStore'
import { useAuthStore } from '@/stores/authStore'
import SpaceMemberManager from '@/components/space/SpaceMemberManager'

const { Content } = Layout
const { Title } = Typography

interface SpaceParams {
  spaceSlug: string
}

const SpaceMembersPage: React.FC = () => {
  const { spaceSlug } = useParams<SpaceParams>()
  const navigate = useNavigate()
  const { currentSpace, loadSpace, loading: spaceLoading } = useSpaceStore()
  const { user } = useAuthStore()

  useEffect(() => {
    if (spaceSlug) {
      loadSpace(spaceSlug)
    }
  }, [spaceSlug])

  if (spaceLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!currentSpace) {
    return (
      <div className="flex items-center justify-center h-96">
        <Empty description="空间未找到" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <Empty description="用户未登录" />
      </div>
    )
  }

  return (
    <Layout className="min-h-screen bg-white">
      <Content className="p-6">
        {/* 面包屑导航 */}
        <Breadcrumb className="mb-6">
          <Breadcrumb.Item>
            <HomeOutlined />
            <span 
              className="cursor-pointer ml-1"
              onClick={() => navigate('/dashboard')}
            >
              首页
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <FolderOpenOutlined />
            <span 
              className="cursor-pointer ml-1"
              onClick={() => navigate('/spaces')}
            >
              空间管理
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span 
              className="cursor-pointer"
              onClick={() => navigate(`/spaces/${spaceSlug}`)}
            >
              {currentSpace.name}
            </span>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <TeamOutlined />
            <span className="ml-1">成员管理</span>
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* 页面标题 */}
        <div className="mb-6">
          <Title level={2} className="mb-2">
            {currentSpace.name} - 成员管理
          </Title>
        </div>

        {/* 成员管理组件 */}
        <SpaceMemberManager 
          spaceSlug={spaceSlug!}
          spaceId={currentSpace.id}
          currentUserId={user.id}
        />
      </Content>
    </Layout>
  )
}

export default SpaceMembersPage