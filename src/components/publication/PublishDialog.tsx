import React, { useState } from 'react'
import {
  Modal,
  Form,
  Input,
  Button,
  Switch,
  Select,
  Upload,
  message,
  Alert,
  Space,
  Typography,
  Divider,
  Tag
} from 'antd'
import {
  GlobalOutlined,
  PictureOutlined,
  SearchOutlined,
  CommentOutlined,
  CodeOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { UploadProps } from 'antd'
import { publicationService, CreatePublicationRequest } from '@/services/publicationService'

const { TextArea } = Input
const { Option } = Select
const { Title, Text, Paragraph } = Typography

interface PublishDialogProps {
  visible: boolean
  spaceId: string
  spaceName: string
  onClose: () => void
  onSuccess: (publication: any) => void
}

const PublishDialog: React.FC<PublishDialogProps> = ({
  visible,
  spaceId,
  spaceName,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [coverImageUrl, setCoverImageUrl] = useState<string>()

  const handlePublish = async (values: any) => {
    try {
      setLoading(true)

      const request: CreatePublicationRequest = {
        slug: values.slug,
        title: values.title || spaceName,
        description: values.description,
        cover_image: coverImageUrl,
        theme: values.theme || 'default',
        include_private_docs: values.include_private_docs || false,
        enable_search: values.enable_search !== false,
        enable_comments: values.enable_comments || false,
        custom_css: values.custom_css,
        custom_js: values.custom_js,
        seo_title: values.seo_title,
        seo_description: values.seo_description,
        seo_keywords: values.seo_keywords?.split(',').map((k: string) => k.trim()).filter(Boolean)
      }

      const response = await publicationService.publishSpace(spaceId, request)
      
      message.success('发布成功！')
      onSuccess(response.data)
      form.resetFields()
      setCoverImageUrl(undefined)
    } catch (error: any) {
      message.error(error.response?.data?.message || '发布失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.resetFields()
    setCoverImageUrl(undefined)
    onClose()
  }

  const uploadProps: UploadProps = {
    name: 'file',
    maxCount: 1,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/')
      if (!isImage) {
        message.error('只能上传图片文件！')
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB!')
      }
      return isImage && isLt5M
    },
    customRequest: async (options) => {
      // TODO: 实现文件上传
      // const { file } = options
      // const response = await fileService.upload(file)
      // setCoverImageUrl(response.data.url)
      message.info('封面图片上传功能即将推出')
    }
  }

  return (
    <Modal
      title={
        <Space>
          <GlobalOutlined />
          <span>发布文档集</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      width={680}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          取消
        </Button>,
        <Button
          key="publish"
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          发布
        </Button>
      ]}
    >
      <Alert
        message="发布说明"
        description="发布后，您的文档集将通过独立的URL对外公开访问。发布的内容是当前文档的快照，后续修改需要重新发布才能生效。"
        type="info"
        showIcon
        className="mb-4"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handlePublish}
        initialValues={{
          title: spaceName,
          theme: 'default',
          enable_search: true,
          enable_comments: false,
          include_private_docs: false
        }}
      >
        <Title level={5}>基本信息</Title>
        
        <Form.Item
          name="slug"
          label="访问路径"
          rules={[
            { required: true, message: '请输入访问路径' },
            { pattern: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: '只能包含小写字母、数字和连字符' },
            { min: 3, max: 50, message: '长度在 3-50 个字符之间' }
          ]}
          extra="访问地址将是：https://docs.yourdomain.com/p/您的访问路径"
        >
          <Input
            placeholder="my-awesome-docs"
            prefix={<GlobalOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="发布标题"
          rules={[{ required: true, message: '请输入发布标题' }]}
        >
          <Input placeholder="我的文档集" />
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
        >
          <TextArea
            rows={3}
            placeholder="简要描述您的文档集..."
            maxLength={500}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="cover_image"
          label="封面图片"
        >
          <Upload {...uploadProps} listType="picture-card">
            {!coverImageUrl && (
              <div>
                <PictureOutlined style={{ fontSize: 24 }} />
                <div style={{ marginTop: 8 }}>上传封面</div>
              </div>
            )}
          </Upload>
        </Form.Item>

        <Form.Item
          name="theme"
          label="主题"
        >
          <Select>
            <Option value="default">默认主题</Option>
            <Option value="dark">深色主题</Option>
            <Option value="minimal">极简主题</Option>
          </Select>
        </Form.Item>

        <Divider />
        <Title level={5}>发布设置</Title>

        <Form.Item
          name="include_private_docs"
          valuePropName="checked"
        >
          <Space>
            <Switch />
            <span>包含私有文档</span>
            <Tag color="orange">谨慎</Tag>
          </Space>
        </Form.Item>

        <Form.Item
          name="enable_search"
          valuePropName="checked"
        >
          <Space>
            <Switch defaultChecked />
            <span>启用搜索功能</span>
            <SearchOutlined />
          </Space>
        </Form.Item>

        <Form.Item
          name="enable_comments"
          valuePropName="checked"
        >
          <Space>
            <Switch />
            <span>启用评论功能</span>
            <CommentOutlined />
            <Tag color="blue">即将推出</Tag>
          </Space>
        </Form.Item>

        <Divider />
        <Title level={5}>
          高级设置
          <Text type="secondary" className="ml-2 text-sm font-normal">
            (可选)
          </Text>
        </Title>

        <Form.Item
          name="custom_css"
          label={
            <Space>
              <span>自定义 CSS</span>
              <CodeOutlined />
            </Space>
          }
        >
          <TextArea
            rows={4}
            placeholder="/* 自定义样式 */"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Form.Item
          name="custom_js"
          label={
            <Space>
              <span>自定义 JavaScript</span>
              <CodeOutlined />
            </Space>
          }
        >
          <TextArea
            rows={4}
            placeholder="// 自定义脚本"
            style={{ fontFamily: 'monospace' }}
          />
        </Form.Item>

        <Divider />
        <Title level={5}>SEO 优化</Title>

        <Form.Item
          name="seo_title"
          label="SEO 标题"
        >
          <Input placeholder="针对搜索引擎优化的标题" />
        </Form.Item>

        <Form.Item
          name="seo_description"
          label="SEO 描述"
        >
          <TextArea
            rows={2}
            placeholder="针对搜索引擎优化的描述..."
            maxLength={160}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="seo_keywords"
          label="SEO 关键词"
          extra="多个关键词用英文逗号分隔"
        >
          <Input placeholder="关键词1, 关键词2, 关键词3" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default PublishDialog