'use client';

import { useState } from 'react';
import { Button } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import { useSession } from 'next-auth/react';
import ScheduleCalendar from '../components/ScheduleCalendar';
import SchedulePostModal from '../components/SchedulePostModal';

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Handle post publishing/scheduling
  const handlePublish = async (content: string, platform: string, scheduleInfo?: { date: string; time: string }) => {
    try {
      if (scheduleInfo) {
        // Schedule post
        const response = await fetch('/api/posts/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content,
            platform,
            scheduledDate: scheduleInfo.date,
            scheduledTime: scheduleInfo.time
          })
        });

        if (!response.ok) throw new Error('Failed to schedule post');
        
        return;
      } else {
        // Publish immediately
        const response = await fetch(`/api/posts/${platform}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });

        if (!response.ok) throw new Error(`Failed to publish to ${platform}`);
      }
    } catch (error) {
      console.error('Error publishing/scheduling post:', error);
      throw error;
    }
  };

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4">Please sign in to access the content calendar</h1>
        <p className="mb-4">You need to be signed in to view and manage your scheduled posts.</p>
        <Button type="primary" onClick={() => window.location.href = '/'}>Go to Sign In</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center">
          <CalendarOutlined className="mr-2" /> Content Calendar
        </h1>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setIsScheduleModalOpen(true)}
        >
          New Post
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <ScheduleCalendar />
      </div>

      <SchedulePostModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        onPublish={handlePublish}
      />
    </div>
  );
}