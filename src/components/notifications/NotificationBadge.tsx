import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import { Badge, Tooltip } from 'antd'
import { BellOutlined, BellFilled } from '@ant-design/icons'
import notificationService from '@/services/notificationService'

interface NotificationBadgeProps {
  onClick?: () => void
  className?: string
}

export interface NotificationBadgeRef {
  refreshCount: () => void
}

const NotificationBadge = forwardRef<NotificationBadgeRef, NotificationBadgeProps>(({ onClick, className }, ref) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const fetchUnreadCount = async () => {
    try {
      setLoading(true)
      const count = await notificationService.getUnreadCount()
      setUnreadCount(count)
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUnreadCount()
    
    // 定期更新未读数量
    const interval = setInterval(fetchUnreadCount, 30000) // 每30秒更新一次
    
    return () => clearInterval(interval)
  }, [])

  // 暴露刷新方法给父组件
  useImperativeHandle(ref, () => ({
    refreshCount: fetchUnreadCount
  }))

  const handleClick = () => {
    onClick?.()
  }

  return (
    <Tooltip title="通知">
      <Badge count={unreadCount} size="small" className={className}>
        <div 
          className="cursor-pointer p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={handleClick}
        >
          {unreadCount > 0 ? (
            <BellFilled className="text-lg text-blue-600" />
          ) : (
            <BellOutlined className="text-lg text-gray-600" />
          )}
        </div>
      </Badge>
    </Tooltip>
  )
})

NotificationBadge.displayName = 'NotificationBadge'

export default NotificationBadge