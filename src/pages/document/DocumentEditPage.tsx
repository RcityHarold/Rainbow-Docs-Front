import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Layout,
  Typography,
  Button,
  Breadcrumb,
  Spin,
  Empty,
  Card,
  Input,
  Switch,
  message,
  Form,
  Space,
  Tabs,
  Affix,
  Modal
} from 'antd'
import {
  SaveOutlined,
  EyeOutlined,
  HomeOutlined,
  FolderOpenOutlined,
  FileTextOutlined,
  SettingOutlined,
  ArrowLeftOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useDocStore } from '@/stores/docStore'
import { useSpaceStore } from '@/stores/spaceStore'
import type { RouteParams } from '@/types'
import ReactMarkdown from 'react-markdown'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import debounce from 'lodash/debounce'

const { Content } = Layout
const { Title, Text } = Typography
const { TextArea } = Input
const { TabPane } = Tabs

interface DocumentParams extends RouteParams {
  spaceSlug?: string
  docSlug?: string
  docId?: string
}

const DocumentEditPage: React.FC = () => {
  const { spaceSlug, docSlug, docId } = useParams<DocumentParams>()
  const navigate = useNavigate()
  const { 
    currentDocument, 
    currentSpace,
    loadDocument, 
    loadDocumentById,
    updateDocument,
    updateDocumentById,
    loading,
    saving,
    hasUnsavedChanges,
    editingContent,
    updateEditingContent,
    startEditing,
    stopEditing
  } = useDocStore()
  const { loadSpace } = useSpaceStore()
  
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('edit')
  const [isSettingsVisible, setIsSettingsVisible] = useState(false)
  const [autoSave, setAutoSave] = useState(true)

  // 防抖保存函数
  const debouncedSave = useCallback(
    debounce(async (content: string) => {
      if (autoSave && hasUnsavedChanges && currentDocument) {
        try {
          if (docId) {
            // 使用ID模式
            await updateDocumentById(docId, { content })
          } else if (currentSpace && spaceSlug && docSlug) {
            // 使用传统模式
            await updateDocument(currentSpace.slug, currentDocument.slug, { content })
          }
          message.success('自动保存成功', 1)
        } catch (error) {
          message.error('自动保存失败', 1)
        }
      }
    }, 3000),
    [autoSave, hasUnsavedChanges, currentDocument, currentSpace, updateDocument, updateDocumentById, docId, spaceSlug, docSlug]
  )

  useEffect(() => {
    if (docId) {
      // 使用ID模式加载文档
      loadDocumentById(docId)
    } else if (spaceSlug && docSlug) {
      // 使用传统模式加载文档
      loadSpace(spaceSlug)
      loadDocument(spaceSlug, docSlug)
    }
  }, [spaceSlug, docSlug, docId])

  useEffect(() => {
    if (currentDocument) {
      startEditing()
      form.setFieldsValue({
        title: currentDocument.title,
        is_published: currentDocument.is_published
      })
    }
  }, [currentDocument])

  useEffect(() => {
    if (editingContent && autoSave) {
      debouncedSave(editingContent)
    }
  }, [editingContent, autoSave, debouncedSave])

  // 监听页面离开事件
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ''
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [hasUnsavedChanges])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateEditingContent(e.target.value)
  }

  const handleSave = async () => {
    if (!currentDocument || !currentSpace) return

    try {
      const values = await form.validateFields()
      await updateDocument(currentSpace.slug, currentDocument.slug, {
        title: values.title,
        content: editingContent,
        is_published: values.is_published
      })
      message.success('保存成功')
    } catch (error) {
      message.error('保存失败')
    }
  }

  const handlePreview = () => {
    navigate(`/spaces/${spaceSlug}/docs/${docSlug}`)
  }

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Modal.confirm({
        title: '确认离开',
        icon: <ExclamationCircleOutlined />,
        content: '您有未保存的更改，确定要离开吗？',
        onOk: () => {
          stopEditing()
          navigate(`/spaces/${spaceSlug}/docs/${docSlug}`)
        }
      })
    } else {
      navigate(`/spaces/${spaceSlug}/docs/${docSlug}`)
    }
  }

  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || '')
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (!currentDocument) {
    return (
      <div className="flex items-center justify-center h-96">
        <Empty description="文档未找到" />
      </div>
    )
  }

  return (
    <Layout className="min-h-screen bg-white">
      <Content>
        <div className="p-6">
          {/* 顶部工具栏 */}
          <Affix offsetTop={0}>
            <Card className="mb-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button 
                    icon={<ArrowLeftOutlined />}
                    onClick={handleBack}
                  >
                    返回
                  </Button>
                  
                  <Breadcrumb>
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
                        onClick={() => navigate(`/spaces/${spaceSlug}`)}
                      >
                        {currentSpace?.name}
                      </span>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                      <FileTextOutlined />
                      <span className="ml-1">编辑: {currentDocument.title}</span>
                    </Breadcrumb.Item>
                  </Breadcrumb>
                </div>

                <div className="flex items-center space-x-2">
                  {hasUnsavedChanges && (
                    <Text type="warning" className="mr-2">
                      有未保存的更改
                    </Text>
                  )}
                  
                  <Button
                    icon={<SettingOutlined />}
                    onClick={() => setIsSettingsVisible(true)}
                  >
                    设置
                  </Button>
                  
                  <Button
                    icon={<EyeOutlined />}
                    onClick={handlePreview}
                  >
                    预览
                  </Button>
                  
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saving}
                    onClick={handleSave}
                  >
                    {saving ? '保存中...' : '保存'}
                  </Button>
                </div>
              </div>
            </Card>
          </Affix>

          {/* 编辑区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左侧编辑器 */}
            <div>
              <Card title="编辑器" className="h-full">
                <Form form={form} layout="vertical">
                  <Form.Item
                    label="文档标题"
                    name="title"
                    rules={[{ required: true, message: '请输入文档标题' }]}
                  >
                    <Input placeholder="请输入文档标题" />
                  </Form.Item>

                  <Form.Item
                    label="发布状态"
                    name="is_published"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="已发布" 
                      unCheckedChildren="草稿" 
                    />
                  </Form.Item>

                  <Form.Item label="文档内容">
                    <TextArea
                      value={editingContent}
                      onChange={handleContentChange}
                      placeholder="请输入文档内容（支持 Markdown）"
                      rows={20}
                      className="font-mono"
                    />
                  </Form.Item>
                </Form>
              </Card>
            </div>

            {/* 右侧预览 */}
            <div>
              <Card title="预览" className="h-full">
                <div className="markdown-content prose prose-lg max-w-none">
                  <ReactMarkdown
                    components={markdownComponents}
                  >
                    {editingContent || '# 开始编写\n\n在左侧编辑器中输入内容，右侧将实时预览。'}
                  </ReactMarkdown>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Content>

      {/* 设置模态框 */}
      <Modal
        title="编辑器设置"
        open={isSettingsVisible}
        onCancel={() => setIsSettingsVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsSettingsVisible(false)}>
            关闭
          </Button>
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="自动保存">
            <Switch 
              checked={autoSave}
              onChange={setAutoSave}
              checkedChildren="开启" 
              unCheckedChildren="关闭"
            />
            <div className="text-gray-500 text-sm mt-1">
              开启后将每3秒自动保存一次
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </Layout>
  )
}

export default DocumentEditPage