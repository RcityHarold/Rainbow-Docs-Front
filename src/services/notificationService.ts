import api from './api'
import { Notification, NotificationListQuery, NotificationListResponse } from '@/types'

class NotificationService {
  // 获取通知列表
  async getNotifications(query?: NotificationListQuery): Promise<NotificationListResponse> {
    const params = new URLSearchParams()
    if (query?.page) params.append('page', query.page.toString())
    if (query?.limit) params.append('limit', query.limit.toString())
    if (query?.unread_only !== undefined) params.append('unread_only', query.unread_only.toString())
    
    const response = await api.get(`/docs/notifications?${params.toString()}`)
    return response.data.data
  }

  // 获取未读通知数量
  async getUnreadCount(): Promise<number> {
    const response = await api.get('/docs/notifications/unread-count')
    return response.data.data.count
  }

  // 标记通知为已读
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await api.put(`/docs/notifications/${notificationId}`)
    return response.data.data
  }

  // 标记所有通知为已读
  async markAllAsRead(): Promise<number> {
    const response = await api.post('/docs/notifications/mark-all-read')
    return response.data.data.updated_count
  }

  // 删除通知
  async deleteNotification(notificationId: string): Promise<void> {
    await api.delete(`/docs/notifications/${notificationId}`)
  }

  // 处理空间邀请通知
  async handleSpaceInvitation(notification: Notification, accept: boolean): Promise<void> {
    if (accept && notification.invite_token) {
      // 接受邀请 - 使用新的独立字段
      await api.post('/docs/spaces/invitations/accept', { invite_token: notification.invite_token })
    }
    // 标记通知为已读
    await this.markAsRead(notification.id)
  }

  // 获取邀请令牌 - 支持新旧版本
  getInviteToken(notification: Notification): string | null {
    // 优先使用新的独立字段
    if (notification.invite_token) {
      return notification.invite_token
    }
    // 回退到旧的data字段（兼容性）
    if (notification.data?.invite_token) {
      return notification.data.invite_token
    }
    return null
  }
}

export default new NotificationService()