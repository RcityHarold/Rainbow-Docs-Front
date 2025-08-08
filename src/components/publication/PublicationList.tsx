import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Tooltip,
  message,
  Modal,
  Typography,
  Dropdown,
  Menu,
  Badge,
  Empty,
  Spin,
  Input
} from 'antd'
import {
  GlobalOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CopyOutlined,
  MoreOutlined,
  SearchOutlined,
  CloudUploadOutlined,
  StopOutlined,
  LinkOutlined,
  BarChartOutlined
} from '@ant-design/icons'
import { publicationService, Publication } from '@/services/publicationService'
import type { ColumnsType } from 'antd/es/table'
import dayjs from 'dayjs'

const { Title, Text, Paragraph } = Typography
const { confirm } = Modal

interface PublicationListProps {
  spaceId: string
  spaceName: string
  onPublish: () => void
}

const PublicationList: React.FC<PublicationListProps> = ({
  spaceId,
  spaceName,
  onPublish
}) => {
  const [loading, setLoading] = useState(false)
  const [publications, setPublications] = useState<Publication[]>([])
  const [selectedPublication, setSelectedPublication] = useState<Publication>()
  const [republishing, setRepublishing] = useState(false)

  useEffect(() => {
    fetchPublications()
  }, [spaceId])

  const fetchPublications = async () => {
    try {
      setLoading(true)
      const response = await publicationService.listPublications(spaceId, true)
      // 处理后端返回的数据结构：{success: true, data: [...], message: "..."}
      const publicationsData = response?.data || []
      setPublications(Array.isArray(publicationsData) ? publicationsData : [])
    } catch (error: any) {
      message.error('获取发布列表失败')
      setPublications([]) // 确保在错误时设置为空数组
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
    message.success('链接已复制到剪贴板')
  }

  const handleRepublish = async (publication: Publication) => {
    confirm({
      title: '确认重新发布',
      content: (
        <div>
          <Paragraph>
            重新发布将更新文档内容到最新版本。访问链接保持不变。
          </Paragraph>
          <Input.TextArea
            placeholder="请输入更新说明（可选）"
            rows={3}
            id="change-summary"
          />
        </div>
      ),
      okText: '重新发布',
      cancelText: '取消',
      onOk: async () => {
        const changeSummary = (document.getElementById('change-summary') as HTMLTextAreaElement)?.value
        
        try {
          setRepublishing(true)
          await publicationService.republish(publication.id, changeSummary)
          message.success('重新发布成功')
          fetchPublications()
        } catch (error: any) {
          message.error(error.response?.data?.message || '重新发布失败')
        } finally {
          setRepublishing(false)
        }
      }
    })
  }

  const handleUnpublish = async (publication: Publication) => {
    confirm({
      title: '确认取消发布',
      content: '取消发布后，文档集将无法通过公开链接访问。您可以随时重新发布。',
      okText: '取消发布',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await publicationService.unpublish(publication.id)
          message.success('已取消发布')
          fetchPublications()
        } catch (error: any) {
          message.error(error.response?.data?.message || '操作失败')
        }
      }
    })
  }

  const handleDelete = async (publication: Publication) => {
    confirm({
      title: '确认删除发布',
      content: '删除后将无法恢复，且公开链接将失效。建议使用"取消发布"功能。',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await publicationService.deletePublication(publication.id)
          message.success('发布已删除')
          fetchPublications()
        } catch (error: any) {
          message.error(error.response?.data?.message || '删除失败')
        }
      }
    })
  }

  const getActionMenu = (record: Publication) => (
    <Menu>
      <Menu.Item
        key="view"
        icon={<EyeOutlined />}
        onClick={() => window.open(record.public_url, '_blank')}
      >
        查看发布
      </Menu.Item>
      <Menu.Item
        key="copy"
        icon={<CopyOutlined />}
        onClick={() => handleCopyUrl(record.public_url)}
      >
        复制链接
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item
        key="republish"
        icon={<CloudUploadOutlined />}
        onClick={() => handleRepublish(record)}
        disabled={!record.is_active}
      >
        重新发布
      </Menu.Item>
      <Menu.Item
        key="edit"
        icon={<EditOutlined />}
        disabled
      >
        编辑设置
      </Menu.Item>
      <Menu.Divider />
      {record.is_active ? (
        <Menu.Item
          key="unpublish"
          icon={<StopOutlined />}
          onClick={() => handleUnpublish(record)}
        >
          取消发布
        </Menu.Item>
      ) : (
        <Menu.Item
          key="restore"
          icon={<CloudUploadOutlined />}
          onClick={() => message.info('恢复发布功能即将推出')}
        >
          恢复发布
        </Menu.Item>
      )}
      <Menu.Item
        key="delete"
        icon={<DeleteOutlined />}
        danger
        onClick={() => handleDelete(record)}
      >
        删除发布
      </Menu.Item>
    </Menu>
  )

  const columns: ColumnsType<Publication> = [
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          {record.description && (
            <Text type="secondary" className="text-sm">
              {record.description}
            </Text>
          )}
        </div>
      )
    },
    {
      title: '访问路径',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => (
        <Space>
          <LinkOutlined />
          <code className="bg-gray-100 px-2 py-1 rounded">/p/{slug}</code>
        </Space>
      )
    },
    {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      align: 'center',
      render: (version) => <Tag>v{version}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        isActive ? (
          <Badge status="success" text="已发布" />
        ) : (
          <Badge status="default" text="已取消" />
        )
      )
    },
    {
      title: '文档数',
      dataIndex: 'document_count',
      key: 'document_count',
      width: 100,
      align: 'center'
    },
    {
      title: '浏览量',
      dataIndex: 'total_views',
      key: 'total_views',
      width: 100,
      align: 'center',
      render: (views) => (
        <Space>
          <BarChartOutlined />
          {views || 0}
        </Space>
      )
    },
    {
      title: '发布时间',
      dataIndex: 'published_at',
      key: 'published_at',
      width: 160,
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Tooltip title="查看发布">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => window.open(record.public_url, '_blank')}
            />
          </Tooltip>
          <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
            <Button
              type="link"
              size="small"
              icon={<MoreOutlined />}
            />
          </Dropdown>
        </Space>
      )
    }
  ]

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  return (
    <Card
      title={
        <Space>
          <GlobalOutlined />
          <span>发布管理</span>
          <Tag color="blue">{publications.length} 个发布</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchPublications}
          >
            刷新
          </Button>
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={onPublish}
          >
            发布文档集
          </Button>
        </Space>
      }
    >
      {publications.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="还没有发布任何文档集"
          className="py-12"
        >
          <Button
            type="primary"
            icon={<CloudUploadOutlined />}
            onClick={onPublish}
          >
            发布第一个文档集
          </Button>
        </Empty>
      ) : (
        <Table
          columns={columns}
          dataSource={publications}
          rowKey="id"
          loading={republishing}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个发布`
          }}
        />
      )}
    </Card>
  )
}

export default PublicationList