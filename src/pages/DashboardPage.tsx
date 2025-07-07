import React, { useEffect, useState } from 'react'
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  List, 
  Avatar, 
  Button, 
  Typography, 
  Space,
  Tag,
  Empty,
  Spin
} from 'antd'
import { 
  FileTextOutlined, 
  FolderOutlined, 
  EyeOutlined, 
  ClockCircleOutlined,
  PlusOutlined,
  StarOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

// 扩展dayjs
dayjs.extend(relativeTime)

const { Title, Text } = Typography

// 模拟数据接口
interface DashboardStats {
  totalSpaces: number
  totalDocuments: number
  totalViews: number
  totalMembers: number
}

interface RecentDocument {
  id: string
  title: string
  space: string
  lastModified: string
  author: string
  status: 'published' | 'draft'
}

interface RecentSpace {
  id: string
  name: string
  description: string
  documentCount: number
  memberCount: number
  lastActivity: string
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalSpaces: 0,
    totalDocuments: 0,
    totalViews: 0,
    totalMembers: 0,
  })

  // 模拟最近文档数据
  const [recentDocuments] = useState<RecentDocument[]>([
    {
      id: '1',
      title: 'API 接口文档',
      space: '开发团队',
      lastModified: '2024-01-15T10:30:00Z',
      author: 'Alice',
      status: 'published',
    },
    {
      id: '2',
      title: '产品需求文档',
      space: '产品团队',
      lastModified: '2024-01-15T09:15:00Z',
      author: 'Bob',
      status: 'draft',
    },
    {
      id: '3',
      title: '部署指南',
      space: '运维团队',
      lastModified: '2024-01-14T16:45:00Z',
      author: 'Charlie',
      status: 'published',
    },
  ])

  // 模拟最近空间数据
  const [recentSpaces] = useState<RecentSpace[]>([
    {
      id: '1',
      name: '开发团队',
      description: '技术文档和API参考',
      documentCount: 25,
      memberCount: 8,
      lastActivity: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      name: '产品团队',
      description: '产品规划和需求文档',
      documentCount: 18,
      memberCount: 6,
      lastActivity: '2024-01-15T09:15:00Z',
    },
    {
      id: '3',
      name: '运维团队',
      description: '运维手册和部署指南',
      documentCount: 12,
      memberCount: 4,
      lastActivity: '2024-01-14T16:45:00Z',
    },
  ])

  useEffect(() => {
    // 模拟加载数据
    const loadDashboardData = async () => {
      try {
        // 这里应该调用真实的API
        setStats({
          totalSpaces: 12,
          totalDocuments: 156,
          totalViews: 2543,
          totalMembers: 28,
        })
      } catch (error) {
        console.error('加载仪表板数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <Spin size="large" tip="正在加载仪表板..." />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* 欢迎区域 */}
      <div className="mb-8">
        <Title level={2} className="mb-2">
          欢迎回来，{user?.display_name || user?.username}！
        </Title>
        <Text className="text-gray-600 text-lg">
          今天是 {dayjs().format('YYYY年MM月DD日')}，开始您的工作吧
        </Text>
      </div>

      {/* 统计数据 */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="空间总数"
              value={stats.totalSpaces}
              prefix={<FolderOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="文档总数"
              value={stats.totalDocuments}
              prefix={<FileTextOutlined className="text-green-500" />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总浏览量"
              value={stats.totalViews}
              prefix={<EyeOutlined className="text-orange-500" />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="团队成员"
              value={stats.totalMembers}
              prefix={<TeamOutlined className="text-purple-500" />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* 最近文档 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined />
                最近文档
              </Space>
            }
            extra={
              <Button 
                type="link" 
                onClick={() => navigate('/documents')}
              >
                查看全部
              </Button>
            }
            className="h-full"
          >
            <List
              dataSource={recentDocuments}
              renderItem={(doc) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => navigate(`/spaces/dev/docs/${doc.id}`)}
                    >
                      查看
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<FileTextOutlined />} 
                        className="bg-blue-100 text-blue-600"
                      />
                    }
                    title={
                      <div className="flex items-center space-x-2">
                        <span>{doc.title}</span>
                        <Tag 
                          color={doc.status === 'published' ? 'green' : 'orange'}
                          size="small"
                        >
                          {doc.status === 'published' ? '已发布' : '草稿'}
                        </Tag>
                      </div>
                    }
                    description={
                      <div className="text-gray-500 space-y-1">
                        <div>空间：{doc.space}</div>
                        <div>
                          {dayjs(doc.lastModified).fromNow()} · {doc.author}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            
            {recentDocuments.length === 0 && (
              <Empty 
                description="暂无最近文档"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>

        {/* 最近空间 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <FolderOutlined />
                最近空间
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/spaces/create')}
              >
                创建空间
              </Button>
            }
            className="h-full"
          >
            <List
              dataSource={recentSpaces}
              renderItem={(space) => (
                <List.Item
                  actions={[
                    <Button 
                      type="link" 
                      size="small"
                      onClick={() => navigate(`/spaces/${space.id}`)}
                    >
                      进入
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<FolderOutlined />} 
                        className="bg-green-100 text-green-600"
                      />
                    }
                    title={
                      <div className="flex items-center space-x-2">
                        <span>{space.name}</span>
                        <StarOutlined className="text-yellow-500" />
                      </div>
                    }
                    description={
                      <div className="text-gray-500 space-y-1">
                        <div>{space.description}</div>
                        <div className="flex space-x-4 text-sm">
                          <span>{space.documentCount} 篇文档</span>
                          <span>{space.memberCount} 名成员</span>
                        </div>
                        <div>
                          最后活动：{dayjs(space.lastActivity).fromNow()}
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
            
            {recentSpaces.length === 0 && (
              <Empty 
                description="暂无空间"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 快速操作 */}
      <Card title="快速操作" className="mt-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              type="dashed" 
              className="w-full h-24 flex flex-col items-center justify-center"
              onClick={() => navigate('/spaces/create')}
            >
              <PlusOutlined className="text-2xl mb-2" />
              <span>创建空间</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              type="dashed" 
              className="w-full h-24 flex flex-col items-center justify-center"
              onClick={() => navigate('/documents/create')}
            >
              <FileTextOutlined className="text-2xl mb-2" />
              <span>创建文档</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              type="dashed" 
              className="w-full h-24 flex flex-col items-center justify-center"
              onClick={() => navigate('/search')}
            >
              <EyeOutlined className="text-2xl mb-2" />
              <span>搜索文档</span>
            </Button>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Button 
              type="dashed" 
              className="w-full h-24 flex flex-col items-center justify-center"
              onClick={() => navigate('/profile')}
            >
              <StarOutlined className="text-2xl mb-2" />
              <span>个人中心</span>
            </Button>
          </Col>
        </Row>
      </Card>
    </div>
  )
}

export default DashboardPage