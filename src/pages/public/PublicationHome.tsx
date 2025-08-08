import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import {
  Layout,
  Typography,
  Spin,
  Empty,
  message,
  Menu,
  Drawer,
  Button
} from 'antd'
import {
  BookOutlined,
  FileTextOutlined,
  MenuOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { publicationService, PublicationDocumentNode, PublicationDocument } from '@/services/publicationService'
import SEO from '@/components/SEO'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import dayjs from 'dayjs'

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

type PublicationHomeParams = {
  slug: string
  docSlug?: string
}

const PublicationHome: React.FC = () => {
  const { slug, docSlug } = useParams() as PublicationHomeParams
  
  const [loading, setLoading] = useState(true)
  const [docLoading, setDocLoading] = useState(false)
  const [publication, setPublication] = useState<any>(null)
  const [documentTree, setDocumentTree] = useState<PublicationDocumentNode[]>([])
  const [currentDoc, setCurrentDoc] = useState<PublicationDocument | null>(null)
  const [selectedKey, setSelectedKey] = useState<string>('')
  const [collapsed, setCollapsed] = useState(false)
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false)

  useEffect(() => {
    if (slug) {
      loadPublication()
      loadDocumentTree()
    }
  }, [slug])

  useEffect(() => {
    if (docSlug && slug) {
      loadDocument(docSlug)
    } else if (documentTree.length > 0 && !docSlug) {
      // 如果没有指定文档，加载第一个文档
      const firstDoc = findFirstDocument(documentTree)
      if (firstDoc) {
        loadDocument(firstDoc.slug)
        setSelectedKey(firstDoc.id)
      }
    }
  }, [docSlug, documentTree, slug])

  const loadPublication = async () => {
    try {
      const response = await publicationService.getPublication(slug!)
      if (response.data?.success) {
        setPublication(response.data.data)
      }
    } catch (error) {
      message.error('加载发布信息失败')
    }
  }

  const loadDocumentTree = async () => {
    try {
      setLoading(true)
      const response = await publicationService.getPublicationTree(slug!)
      if (response?.success) {
        setDocumentTree(response.data || [])
      }
    } catch (error) {
      message.error('加载文档目录失败')
    } finally {
      setLoading(false)
    }
  }

  const loadDocument = async (docSlug: string) => {
    try {
      setDocLoading(true)
      const response = await publicationService.getPublicationDocument(slug!, docSlug)
      if (response?.success) {
        setCurrentDoc(response.data)
        // 更新选中的菜单项
        const docNode = findDocumentBySlug(documentTree, docSlug)
        if (docNode) {
          setSelectedKey(docNode.id)
        }
      }
    } catch (error) {
      message.error('加载文档内容失败')
    } finally {
      setDocLoading(false)
    }
  }

  const findFirstDocument = (nodes: PublicationDocumentNode[]): PublicationDocumentNode | null => {
    if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
      return null
    }
    for (const node of nodes) {
      if (!node.children || (node.children?.length || 0) === 0) {
        return node
      }
      const firstChild = findFirstDocument(node.children)
      if (firstChild) return firstChild
    }
    return nodes[0] || null
  }

  const findDocumentBySlug = (nodes: PublicationDocumentNode[], slug: string): PublicationDocumentNode | null => {
    for (const node of nodes) {
      if (node.slug === slug) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findDocumentBySlug(node.children, slug)
        if (found) return found
      }
    }
    return null
  }

  const handleMenuClick = (key: string) => {
    const doc = findDocumentById(documentTree, key)
    if (doc) {
      loadDocument(doc.slug)
      setMobileDrawerVisible(false)
      // 更新URL
      window.history.pushState(null, '', `/p/${slug}/${doc.slug}`)
    }
  }

  const findDocumentById = (nodes: PublicationDocumentNode[], id: string): PublicationDocumentNode | null => {
    for (const node of nodes) {
      if (node.id === id) {
        return node
      }
      if (node.children && node.children.length > 0) {
        const found = findDocumentById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const renderMenuItems = (nodes: PublicationDocumentNode[]): any[] => {
    if (!nodes || !Array.isArray(nodes)) {
      return []
    }
    return nodes.map(node => {
      if (node.children && node.children.length > 0) {
        return {
          key: node.id,
          icon: <BookOutlined />,
          label: (
            <span
              onClick={(e) => {
                e.stopPropagation()
                handleMenuClick(node.id)
              }}
              style={{ display: 'inline-block', width: '100%' }}
            >
              {node.title}
            </span>
          ),
          children: renderMenuItems(node.children)
        }
      }
      return {
        key: node.id,
        icon: <FileTextOutlined />,
        label: node.title
      }
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!publication) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty description="发布未找到" />
      </div>
    )
  }

  const menuItems = renderMenuItems(documentTree)

  const sideMenu = (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      defaultOpenKeys={documentTree.map(node => node.id)}
      style={{ height: '100%', borderRight: 0 }}
      items={menuItems}
      onClick={({ key }) => handleMenuClick(key)}
    />
  )

  return (
    <Layout className="min-h-screen">
      {/* SEO 优化 */}
      <SEO
        title={currentDoc ? `${currentDoc.title} - ${publication.title}` : `${publication.title} - 文档中心`}
        description={publication.seo_description || publication.description}
        keywords={publication.seo_keywords}
        image={publication.cover_image}
        url={window.location.href}
        type="article"
        publishedTime={publication.published_at}
        modifiedTime={publication.updated_at}
      />
      
      {/* 自定义样式 */}
      {publication.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: publication.custom_css }} />
      )}

      {/* 头部 */}
      <Header className="bg-white shadow-sm px-4 flex items-center justify-between">
        <div className="flex items-center">
          {/* 移动端菜单按钮 */}
          <Button
            className="lg:hidden mr-4"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileDrawerVisible(true)}
          />
          
          {/* 桌面端折叠按钮 */}
          <Button
            className="hidden lg:block mr-4"
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />
          
          <Title level={4} className="mb-0">
            <BookOutlined className="mr-2" />
            {publication.title}
          </Title>
        </div>
        
        <Text type="secondary">
          v{publication.version}
        </Text>
      </Header>

      <Layout>
        {/* 桌面端侧边栏 */}
        <Sider
          className="hidden lg:block"
          width={280}
          collapsedWidth={0}
          collapsed={collapsed}
          theme="light"
          style={{
            overflow: 'auto',
            height: 'calc(100vh - 64px)',
            position: 'sticky',
            top: 64,
            left: 0,
          }}
        >
          {sideMenu}
        </Sider>

        {/* 移动端抽屉 */}
        <Drawer
          title="文档目录"
          placement="left"
          onClose={() => setMobileDrawerVisible(false)}
          open={mobileDrawerVisible}
          styles={{ body: { padding: 0 } }}
          width={280}
        >
          {sideMenu}
        </Drawer>

        {/* 文档内容 */}
        <Content className="bg-white">
          <div className="max-w-4xl mx-auto px-4 py-8">
            {docLoading ? (
              <div className="flex justify-center py-12">
                <Spin size="large" tip="加载文档中..." />
              </div>
            ) : currentDoc ? (
              <article>
                <Title level={1}>{currentDoc.title}</Title>
                
                {currentDoc.excerpt && (
                  <Text type="secondary" className="text-lg block mb-6">
                    {currentDoc.excerpt}
                  </Text>
                )}
                
                <div className="prose prose-lg max-w-none">
                  <MarkdownRenderer content={currentDoc.content} />
                </div>
                
                {/* 文档信息 */}
                <div className="mt-12 pt-6 border-t border-gray-200">
                  <Text type="secondary" className="text-sm">
                    最后更新于 {dayjs(currentDoc.created_at).format('YYYY-MM-DD HH:mm')}
                  </Text>
                </div>
              </article>
            ) : (
              <Empty description="请选择要查看的文档" />
            )}
          </div>
        </Content>
      </Layout>

      {/* 自定义脚本 */}
      {publication.custom_js && (
        <script dangerouslySetInnerHTML={{ __html: publication.custom_js }} />
      )}
    </Layout>
  )
}

export default PublicationHome