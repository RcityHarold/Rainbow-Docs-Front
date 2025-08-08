import React, { useState, useEffect } from 'react'
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Tag,
  Space,
  message,
  Popconfirm,
  Tooltip,
  Typography
} from 'antd'
import {
  UserAddOutlined,
  SettingOutlined,
  DeleteOutlined,
  MailOutlined,
  CrownOutlined,
  TeamOutlined
} from '@ant-design/icons'
import { spaceMemberService } from '@/services/spaceMemberService'
import type { SpaceMember, InviteMemberRequest, MemberRole, MemberStatus } from '@/types'

const { Title, Text } = Typography
const { Option } = Select

interface SpaceMemberManagerProps {
  spaceSlug: string
  spaceId: string
  currentUserId: string
}

const SpaceMemberManager: React.FC<SpaceMemberManagerProps> = ({
  spaceSlug,
  spaceId,
  currentUserId
}) => {
  const [members, setMembers] = useState<SpaceMember[]>([])
  const [loading, setLoading] = useState(false)
  const [inviteModalVisible, setInviteModalVisible] = useState(false)
  const [inviteForm] = Form.useForm()

  // 角色显示配置
  const roleConfig = {
    owner: { label: '所有者', color: 'gold', icon: <CrownOutlined /> },
    admin: { label: '管理员', color: 'red', icon: <SettingOutlined /> },
    editor: { label: '编辑者', color: 'blue', icon: <TeamOutlined /> },
    viewer: { label: '查看者', color: 'green', icon: <TeamOutlined /> },
    member: { label: '成员', color: 'default', icon: <TeamOutlined /> }
  }

  // 状态显示配置
  const statusConfig = {
    pending: { label: '待接受', color: 'orange' },
    accepted: { label: '已加入', color: 'green' },
    rejected: { label: '已拒绝', color: 'red' },
    removed: { label: '已移除', color: 'gray' }
  }

  useEffect(() => {
    loadMembers()
  }, [spaceSlug])

  const loadMembers = async () => {
    setLoading(true)
    try {
      const response = await spaceMemberService.getSpaceMembers(spaceSlug)
      const actualData = response?.data || []
      setMembers(actualData)
    } catch (error) {
      message.error('加载成员列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInviteMember = async (values: any) => {
    try {
      // 根据邀请类型构建请求数据
      const requestData: InviteMemberRequest = {
        role: values.role,
        message: values.message,
        expires_in_days: values.expires_in_days
      }
      
      if (values.inviteType === 'email') {
        requestData.email = values.email
      } else {
        requestData.user_id = values.user_id
      }
      
      await spaceMemberService.inviteMember(spaceSlug, requestData)
      message.success('邀请发送成功')
      setInviteModalVisible(false)
      inviteForm.resetFields()
      loadMembers()
    } catch (error) {
      message.error('邀请发送失败')
    }
  }

  const handleUpdateMemberRole = async (userId: string, newRole: MemberRole) => {
    try {
      await spaceMemberService.updateMember(spaceSlug, userId, { role: newRole })
      message.success('成员权限更新成功')
      loadMembers()
    } catch (error) {
      message.error('更新成员权限失败')
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await spaceMemberService.removeMember(spaceSlug, userId)
      message.success('成员移除成功')
      loadMembers()
    } catch (error) {
      message.error('移除成员失败')
    }
  }

  const canManageMembers = (member: SpaceMember) => {
    // 只有所有者和管理员可以管理其他成员
    // 所有者可以管理所有人，管理员不能管理所有者
    const currentMember = members.find(m => m.user_id === currentUserId)
    if (!currentMember) return false
    
    if (currentMember.role === 'owner') return true
    if (currentMember.role === 'admin' && member.role !== 'owner') return true
    
    return false
  }

  const columns = [
    {
      title: '成员',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId: string, record: SpaceMember) => (
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white mr-3">
            {userId.slice(-4).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{userId}</div>
            <div className="text-gray-500 text-sm">
              {new Date(record.invited_at).toLocaleDateString()}
            </div>
          </div>
        </div>
      )
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: MemberRole) => {
        const config = roleConfig[role]
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.label}
          </Tag>
        )
      }
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: MemberStatus) => {
        const config = statusConfig[status]
        return (
          <Tag color={config.color}>
            {config.label}
          </Tag>
        )
      }
    },
    {
      title: '加入时间',
      dataIndex: 'accepted_at',
      key: 'accepted_at',
      render: (acceptedAt: string) => 
        acceptedAt ? new Date(acceptedAt).toLocaleDateString() : '-'
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: SpaceMember) => {
        if (!canManageMembers(record) || record.user_id === currentUserId) {
          return <Text type="secondary">-</Text>
        }

        return (
          <Space size="small">
            <Select
              size="small"
              value={record.role}
              style={{ width: 100 }}
              onChange={(newRole: MemberRole) => handleUpdateMemberRole(record.user_id, newRole)}
            >
              <Option value="viewer">查看者</Option>
              <Option value="member">成员</Option>
              <Option value="editor">编辑者</Option>
              <Option value="admin">管理员</Option>
            </Select>
            <Popconfirm
              title="确认移除此成员？"
              onConfirm={() => handleRemoveMember(record.user_id)}
              okText="确认"
              cancelText="取消"
            >
              <Button 
                type="text" 
                danger 
                size="small"
                icon={<DeleteOutlined />}
              />
            </Popconfirm>
          </Space>
        )
      }
    }
  ]

  return (
    <Card
      title={
        <div className="flex items-center justify-between">
          <Space>
            <TeamOutlined />
            <span>空间成员</span>
            <Text type="secondary">({members.length})</Text>
          </Space>
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setInviteModalVisible(true)}
          >
            邀请成员
          </Button>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={members}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
        }}
      />

      {/* 邀请成员模态框 */}
      <Modal
        title="邀请新成员"
        open={inviteModalVisible}
        onCancel={() => {
          setInviteModalVisible(false)
          inviteForm.resetFields()
        }}
        footer={null}
      >
        <Form
          form={inviteForm}
          layout="vertical"
          onFinish={handleInviteMember}
        >
          <Form.Item
            label="邀请方式"
            name="inviteType"
            initialValue="email"
          >
            <Select>
              <Option value="email">通过邮箱邀请</Option>
              <Option value="userId">通过用户ID邀请</Option>
            </Select>
          </Form.Item>

          <Form.Item
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.inviteType !== currentValues.inviteType
            }
          >
            {({ getFieldValue }) => {
              const inviteType = getFieldValue('inviteType')
              return inviteType === 'email' ? (
                <Form.Item
                  label="邮箱地址"
                  name="email"
                  rules={[
                    { required: true, message: '请输入邮箱地址' },
                    { type: 'email', message: '请输入有效的邮箱地址' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="请输入邀请者的邮箱地址"
                  />
                </Form.Item>
              ) : (
                <Form.Item
                  label="用户ID"
                  name="user_id"
                  rules={[{ required: true, message: '请输入用户ID' }]}
                >
                  <Input placeholder="请输入用户ID" />
                </Form.Item>
              )
            }}
          </Form.Item>

          <Form.Item
            label="角色权限"
            name="role"
            initialValue="member"
            rules={[{ required: true, message: '请选择角色权限' }]}
          >
            <Select>
              <Option value="viewer">查看者 - 只能查看文档</Option>
              <Option value="member">成员 - 可以查看和编辑文档</Option>
              <Option value="editor">编辑者 - 可以查看和编辑文档</Option>
              <Option value="admin">管理员 - 可以管理文档和成员</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="邀请消息"
            name="message"
          >
            <Input.TextArea 
              rows={3}
              placeholder="可选：为受邀者添加一条欢迎消息"
            />
          </Form.Item>

          <Form.Item
            label="邀请有效期"
            name="expires_in_days"
            initialValue={7}
          >
            <Select>
              <Option value={1}>1天</Option>
              <Option value={3}>3天</Option>
              <Option value={7}>7天</Option>
              <Option value={14}>14天</Option>
              <Option value={30}>30天</Option>
            </Select>
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-full justify-end">
              <Button onClick={() => {
                setInviteModalVisible(false)
                inviteForm.resetFields()
              }}>
                取消
              </Button>
              <Button type="primary" htmlType="submit">
                发送邀请
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  )
}

export default SpaceMemberManager