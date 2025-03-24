'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, Badge, Modal, Button, Spin, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import { useSession } from 'next-auth/react';
import SchedulePostModal from './SchedulePostModal';

interface ScheduledPost {
  id: string;
  content: string;
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  status: 'pending' | 'published' | 'failed';
  createdAt: string;
}

export default function ScheduleCalendar() {
  const { data: session } = useSession();
  const [scheduledPosts, setScheduledPosts] = useState<ScheduledPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDatePosts, setSelectedDatePosts] = useState<ScheduledPost[]>([]);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingPost, setEditingPost] = useState<ScheduledPost | null>(null);

  // Fetch scheduled posts
  const fetchScheduledPosts = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/posts/schedule');
      if (!response.ok) throw new Error('Failed to fetch scheduled posts');
      
      const data = await response.json();
      setScheduledPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching scheduled posts:', error);
      message.error('Failed to load scheduled posts');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    fetchScheduledPosts();
  }, [fetchScheduledPosts]);

  // Handle date cell render to show badges for scheduled posts
  const dateCellRender = (value: Dayjs) => {
    const date = value.format('YYYY-MM-DD');
    const postsOnDate = scheduledPosts.filter(post => post.scheduledDate === date);
    
    return (
      <ul className="events">
        {postsOnDate.map(post => (
          <li key={post.id}>
            <Badge 
              status={post.status === 'pending' ? 'processing' : post.status === 'published' ? 'success' : 'error'} 
              text={`${post.platform} (${post.scheduledTime})`} 
            />
          </li>
        ))}
      </ul>
    );
  };

  // Handle date selection
  const handleDateSelect = (value: Dayjs) => {
    const date = value.format('YYYY-MM-DD');
    const postsOnDate = scheduledPosts.filter(post => post.scheduledDate === date);
    
    setSelectedDate(value);
    setSelectedDatePosts(postsOnDate);
    setIsModalVisible(true);
  };

  // Handle post deletion
  const handleDeletePost = async (postId: string) => {
    try {
      const response = await fetch('/api/posts/schedule', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId })
      });

      if (!response.ok) throw new Error('Failed to delete post');
      
      message.success('Post deleted successfully');
      fetchScheduledPosts();
      
      // Update the selected date posts
      if (selectedDate) {
        const date = selectedDate.format('YYYY-MM-DD');
        const updatedPosts = scheduledPosts.filter(post => 
          post.scheduledDate === date && post.id !== postId
        );
        setSelectedDatePosts(updatedPosts);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      message.error('Failed to delete post');
    }
  };

  // Handle post editing
  const handleEditPost = (post: ScheduledPost) => {
    setEditingPost(post);
    setIsEditModalVisible(true);
  };

  // Handle post publishing/scheduling
  const handlePublish = async (content: string, platform: string, scheduleInfo?: { date: string; time: string }) => {
    try {
      if (editingPost && scheduleInfo) {
        // Update existing post
        const response = await fetch('/api/posts/schedule', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPost.id,
            content,
            platform,
            scheduledDate: scheduleInfo.date,
            scheduledTime: scheduleInfo.time,
            update: true
          })
        });

        if (!response.ok) throw new Error('Failed to update post');
        
        message.success('Post updated successfully');
      } else if (scheduleInfo) {
        // Create new scheduled post
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
        
        message.success('Post scheduled successfully');
      } else {
        // Publish immediately to the selected platform
        const response = await fetch(`/api/posts/${platform}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });

        if (!response.ok) throw new Error(`Failed to publish to ${platform}`);
        
        message.success(`Published to ${platform} successfully`);
      }

      // Refresh the scheduled posts
      fetchScheduledPosts();
      setIsEditModalVisible(false);
      setEditingPost(null);
    } catch (error) {
      console.error('Error publishing/scheduling post:', error);
      message.error('Failed to publish/schedule post');
    }
  };

  return (
    <div className="schedule-calendar-container">
      <h2 className="text-2xl font-bold mb-4">Content Calendar</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Calendar 
            dateCellRender={dateCellRender} 
            onSelect={handleDateSelect}
            className="mb-4"
          />
          
          <Button 
            type="primary" 
            onClick={() => setIsEditModalVisible(true)}
            className="mb-4"
          >
            Schedule New Post
          </Button>
          
          {/* Modal for viewing posts on a specific date */}
          <Modal
            title={selectedDate ? `Posts for ${selectedDate.format('MMMM D, YYYY')}` : 'Scheduled Posts'}
            open={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            {selectedDatePosts.length === 0 ? (
              <p>No posts scheduled for this date.</p>
            ) : (
              <ul className="space-y-4">
                {selectedDatePosts.map(post => (
                  <li key={post.id} className="border p-3 rounded-md">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{post.platform} - {post.scheduledTime}</p>
                        <p className="mt-1">{post.content}</p>
                        <Badge 
                          status={post.status === 'pending' ? 'processing' : post.status === 'published' ? 'success' : 'error'} 
                          text={post.status} 
                          className="mt-2"
                        />
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          icon={<EditOutlined />} 
                          size="small"
                          onClick={() => handleEditPost(post)}
                        />
                        <Button 
                          icon={<DeleteOutlined />} 
                          size="small" 
                          danger
                          onClick={() => handleDeletePost(post.id)}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Modal>
          
          {/* Modal for creating/editing posts */}
          <SchedulePostModal
            isOpen={isEditModalVisible}
            onClose={() => {
              setIsEditModalVisible(false);
              setEditingPost(null);
            }}
            onPublish={handlePublish}
            editingPost={editingPost}
          />
        </>
      )}
    </div>
  );
}