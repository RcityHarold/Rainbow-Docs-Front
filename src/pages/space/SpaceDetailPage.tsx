import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Button,
  Tree,
  Breadcrumb,
  Spin,
  Empty,
  message,
  Dropdown,
  Card,
  Space,
  Statistic,
  Tag,
  Modal
} from 'antd'
import {
  FileTextOutlined,
  PlusOutlined,
  SettingOutlined,
  MoreOutlined,
  FolderOpenOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  HomeOutlined,
  TeamOutlined
} from '@ant-design/icons'
import type { DataNode, TreeProps } from 'antd/lib/tree'
import { useSpaceStore } from '@/stores/spaceStore'
import { useDocStore } from '@/stores/docStore'
import { documentService } from '@/services/documentService'
import { spaceService } from '@/services/spaceService'
import type { DocumentTreeNode, CreateDocumentRequest } from '@/types'

const { Content, Sider } = Layout
const { Title, Text } = Typography

interface SpaceParams {
  spaceSlug: string
}

const SpaceDetailPage: React.FC = () => {
  const { spaceSlug } = useParams<SpaceParams>()
  const navigate = useNavigate()
  const { currentSpace, loadSpace, loading: spaceLoading } = useSpaceStore()
  const { 
    documentTree, 
    loadDocumentTree, 
    createDocument,
    deleteDocument,
    loading: docLoading 
  } = useDocStore()
  
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null)
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [spaceStats, setSpaceStats] = useState<any>(null)

  useEffect(() => {
    if (spaceSlug) {
      loadSpace(spaceSlug)
      loadDocumentTree(spaceSlug)
      loadSpaceStats(spaceSlug)
    }
  }, [spaceSlug])

  const loadSpaceStats = async (slug: string) => {
    try {
      const response = await spaceService.getSpaceStats(slug)
      setSpaceStats(response.data)
    } catch (error) {
      console.error('Failed to load space stats:', error)
    }
  }

  const convertToTreeData = (nodes: DocumentTreeNode[]): DataNode[] => {
    return nodes.map(node => ({
      key: node.slug,
      title: (
        <div className="flex items-center justify-between group">
          <span className="flex items-center">
            <FileTextOutlined className="mr-2 text-blue-500" />
            {node.title}
            {!node.is_published && (
              <Tag size="small" color="orange" className="ml-2">
                草稿
              </Tag>
            )}
          </span>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Dropdown
              menu={{
                items: [
                  {
                    key: 'view',
                    label: '查看',
                    icon: <EyeOutlined />,
                    onClick: () => navigate(`/spaces/${spaceSlug}/docs/${node.slug}`)
                  },
                  {
                    key: 'edit',
                    label: '编辑',
                    icon: <EditOutlined />,
                    onClick: () => navigate(`/spaces/${spaceSlug}/docs/${node.slug}/edit`)
                  },
                  {
                    key: 'delete',
                    label: '删除',
                    icon: <DeleteOutlined />,
                    danger: true,
                    onClick: () => handleDeleteDocument(node.slug)
                  }
                ]
              }}
              trigger={['click']}
            >
              <Button 
                type="text" 
                size="small" 
                icon={<MoreOutlined />}
                onClick={e => e.stopPropagation()}
              />
            </Dropdown>
          </div>
        </div>
      ),
      children: node.children?.length ? convertToTreeData(node.children) : undefined,
      isLeaf: !node.children?.length
    }))
  }

  const handleDeleteDocument = (docSlug: string) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个文档吗？此操作不可恢复。',
      onOk: async () => {
        try {
          await deleteDocument(spaceSlug!, docSlug)
          message.success('文档删除成功')
        } catch (error) {
          message.error('删除文档失败')
        }
      }
    })
  }


  const onTreeSelect: TreeProps['onSelect'] = (selectedKeys) => {
    const key = selectedKeys[0] as string
    if (key) {
      setSelectedDoc(key)
      navigate(`/spaces/${spaceSlug}/docs/${key}`)
    }
  }

  const onTreeExpand: TreeProps['onExpand'] = (expandedKeys) => {
    setExpandedKeys(expandedKeys as string[])
  }

  if (spaceLoading || docLoading) {
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

  return (
    <Layout className="min-h-screen">
      {/* 侧边栏 */}
      <Sider width={300} className="bg-white border-r">
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Title level={4} className="mb-0">
              {currentSpace.name}
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`/spaces/${spaceSlug}/docs/new`)}
            >
              新建文档
            </Button>
          </div>
          
          <Text type="secondary" className="block mb-4">
            {currentSpace.description}
          </Text>

          {/* 空间统计 */}
          {spaceStats && (
            <Card size="small" className="mb-4">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div>
                  <Statistic 
                    title="文档" 
                    value={spaceStats.total_documents}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </div>
                <div>
                  <Statistic 
                    title="成员" 
                    value={spaceStats.total_members}
                    prefix={<TeamOutlined />}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </div>
              </div>
            </Card>
          )}

          {/* 文档树 */}
          <div className="document-tree">
            {documentTree.length > 0 ? (
              <Tree
                treeData={convertToTreeData(documentTree)}
                onSelect={onTreeSelect}
                onExpand={onTreeExpand}
                expandedKeys={expandedKeys}
                selectedKeys={selectedDoc ? [selectedDoc] : []}
                showLine
                showIcon
                blockNode
              />
            ) : (
              <Empty 
                description="暂无文档" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </div>
        </div>
      </Sider>

      {/* 主内容区 */}
      <Content className="bg-gray-50">
        <div className="p-6">
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
              <span className="ml-1">{currentSpace.name}</span>
            </Breadcrumb.Item>
          </Breadcrumb>

          {/* 空间信息 */}
          <Card className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <Title level={3} className="mb-2">
                  {currentSpace.name}
                </Title>
                <Text type="secondary" className="text-lg">
                  {currentSpace.description}
                </Text>
                <div className="mt-4 flex items-center space-x-4">
                  <Tag color={currentSpace.is_public ? 'green' : 'orange'}>
                    {currentSpace.is_public ? '公开' : '私有'}
                  </Tag>
                  <Text type="secondary">
                    创建时间：{new Date(currentSpace.created_at).toLocaleDateString()}
                  </Text>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button icon={<SettingOutlined />}>
                  设置
                </Button>
                <Button type="primary" icon={<PlusOutlined />}>
                  添加成员
                </Button>
              </div>
            </div>
          </Card>

          {/* 欢迎页面或选择文档提示 */}
          <Card>
            <div className="text-center py-16">
              <FolderOpenOutlined className="text-6xl text-gray-400 mb-4" />
              <Title level={3} className="text-gray-600 mb-2">
                欢迎来到 {currentSpace.name}
              </Title>
              <Text type="secondary" className="text-lg mb-6 block">
                从左侧文档列表选择一个文档开始阅读，或者创建新的文档。
              </Text>
              <Space>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => navigate(`/spaces/${spaceSlug}/docs/new`)}
                >
                  创建第一个文档
                </Button>
                <Button 
                  icon={<EyeOutlined />}
                  onClick={() => navigate(`/spaces/${spaceSlug}/docs`)}
                >
                  浏览所有文档
                </Button>
              </Space>
            </div>
          </Card>
        </div>
      </Content>

    </Layout>
  )
}

export default SpaceDetailPage