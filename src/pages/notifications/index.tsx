import React from 'react'
import { Card } from 'antd'
import NotificationList from '@/components/notifications/NotificationList'

const NotificationsPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="shadow-sm">
        <NotificationList />
      </Card>
    </div>
  )
}

export default NotificationsPage