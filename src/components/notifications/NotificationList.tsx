import React, { useState, useEffect } from 'react'
import { List, Button, Typography, Empty, Spin, message, Modal, Divider } from 'antd'
import { 
  CheckOutlined, 
  DeleteOutlined, 
  TeamOutlined,
  FileTextOutlined,
  CommentOutlined,
  SettingOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { Notification, NotificationType } from '@/types'
import notificationService from '@/services/notificationService'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'

dayjs.extend(relativeTime)
dayjs.locale('zh-cn')

const { Text, Title } = Typography
const { confirm } = Modal

interface NotificationListProps {
  onNotificationUpdate?: () => void
}

const NotificationList: React.FC<NotificationListProps> = ({ onNotificationUpdate }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'space_invitation':
        return <TeamOutlined className="text-blue-500" />
      case 'document_shared':
      case 'document_update':
        return <FileTextOutlined className="text-green-500" />
      case 'comment_mention':
        return <CommentOutlined className="text-orange-500" />
      case 'system':
        return <SettingOutlined className="text-purple-500" />
      default:
        return <SettingOutlined className="text-gray-500" />
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications({ page, limit })
      setNotifications(response.notifications)
      setTotal(response.total)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
      message.error('获取通知失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [page])

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n)
      )
      onNotificationUpdate?.()
      message.success('已标记为已读')
    } catch (error) {
      console.error('Failed to mark as read:', error)
      message.error('标记已读失败')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      const count = await notificationService.markAllAsRead()
      setNotifications(prev => 
        prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() }))
      )
      onNotificationUpdate?.()
      message.success(`已标记 ${count} 条通知为已读`)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      message.error('批量标记已读失败')
    }
  }

  const handleDelete = async (notificationId: string) => {
    confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这条通知吗？',
      okText: '删除',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          await notificationService.deleteNotification(notificationId)
          setNotifications(prev => prev.filter(n => n.id !== notificationId))
          setTotal(prev => prev - 1)
          onNotificationUpdate?.()
          message.success('通知已删除')
        } catch (error) {
          console.error('Failed to delete notification:', error)
          message.error('删除通知失败')
        }
      }
    })
  }

  const handleSpaceInvitation = async (notification: Notification, accept: boolean) => {
    try {
      const inviteToken = notification.data?.invite_token
      if (!inviteToken) {
        message.error('邀请令牌无效')
        return
      }

      await notificationService.handleSpaceInvitation(notification.id, inviteToken, accept)
      
      if (accept) {
        message.success('已接受空间邀请')
        // 可以在这里跳转到空间页面
      } else {
        message.info('已拒绝空间邀请')
      }
      
      // 从列表中移除或标记为已处理
      setNotifications(prev => prev.filter(n => n.id !== notification.id))
      onNotificationUpdate?.()
    } catch (error) {
      console.error('Failed to handle space invitation:', error)
      message.error(accept ? '接受邀请失败' : '拒绝邀请失败')
    }
  }

  const renderNotificationActions = (notification: Notification) => {
    const actions = []

    // 空间邀请特殊处理
    if (notification.type === 'space_invitation' && !notification.is_read) {
      actions.push(
        <Button 
          key="accept" 
          type="primary" 
          size="small"
          onClick={() => handleSpaceInvitation(notification, true)}
        >
          接受
        </Button>
      )
      actions.push(
        <Button 
          key="reject" 
          size="small"
          onClick={() => handleSpaceInvitation(notification, false)}
        >
          拒绝
        </Button>
      )
    }

    // 标记已读按钮
    if (!notification.is_read) {
      actions.push(
        <Button
          key="read"
          type="text"
          size="small"
          icon={<CheckOutlined />}
          onClick={() => handleMarkAsRead(notification.id)}
        >
          标记已读
        </Button>
      )
    }

    // 删除按钮
    actions.push(
      <Button
        key="delete"
        type="text"
        size="small"
        danger
        icon={<DeleteOutlined />}
        onClick={() => handleDelete(notification.id)}
      >
        删除
      </Button>
    )

    return actions
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="notification-list">
      <div className="flex justify-between items-center mb-4">
        <Title level={4} className="m-0">通知中心</Title>
        {unreadCount > 0 && (
          <Button type="link" onClick={handleMarkAllAsRead}>
            全部标记为已读
          </Button>
        )}
      </div>

      <Spin spinning={loading}>
        {notifications.length === 0 ? (
          <Empty 
            description="暂无通知" 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <List
            itemLayout="vertical"
            dataSource={notifications}
            pagination={{
              current: page,
              total,
              pageSize: limit,
              onChange: setPage,
              showSizeChanger: false,
              showQuickJumper: false,
              showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
            }}
            renderItem={(notification) => (
              <List.Item
                key={notification.id}
                className={`${!notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''} mb-2 rounded p-3`}
                actions={renderNotificationActions(notification)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <Text strong className={!notification.is_read ? 'text-blue-900' : 'text-gray-900'}>
                        {notification.title}
                      </Text>
                      <Text type="secondary" className="text-xs">
                        {dayjs(notification.created_at).fromNow()}
                      </Text>
                    </div>
                    <Text className={!notification.is_read ? 'text-blue-800' : 'text-gray-600'}>
                      {notification.content}
                    </Text>
                    {notification.read_at && (
                      <Text type="secondary" className="text-xs block mt-1">
                        已读于 {dayjs(notification.read_at).fromNow()}
                      </Text>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
          />
        )}
      </Spin>
    </div>
  )
}

export default NotificationList