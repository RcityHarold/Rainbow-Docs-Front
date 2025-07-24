import React from 'react'
import { Card } from 'antd'
import NotificationList from '@/components/notifications/NotificationList'
import MainLayout from '@/components/layout/MainLayout'

const NotificationsPage: React.FC = () => {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto p-6">
        <Card className="shadow-sm">
          <NotificationList />
        </Card>
      </div>
    </MainLayout>
  )
}

export default NotificationsPage