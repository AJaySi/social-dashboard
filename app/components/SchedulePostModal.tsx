'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { DatePicker, TimePicker, Switch, message } from 'antd';
import { SendOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

interface SchedulePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (content: string, platform: string, scheduleInfo?: { date: string; time: string }) => Promise<void>;
  editingPost?: {
    id: string;
    content: string;
    platform: string;
    scheduledDate: string;
    scheduledTime: string;
    status: 'pending' | 'published' | 'failed';
    createdAt: string;
  } | null;
}

export default function SchedulePostModal({ isOpen, onClose, onPublish, editingPost }: SchedulePostModalProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState(editingPost?.content || '');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(editingPost?.platform || null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isScheduled, setIsScheduled] = useState(!!editingPost?.scheduledDate);
  const [scheduledDate, setScheduledDate] = useState<Dayjs | null>(
    editingPost?.scheduledDate ? dayjs(editingPost.scheduledDate) : dayjs().add(1, 'day')
  );
  const [scheduledTime, setScheduledTime] = useState<Dayjs | null>(
    editingPost?.scheduledTime ? dayjs(editingPost.scheduledTime, 'HH:mm') : dayjs().hour(9).minute(0)
  );

  if (!isOpen) return null;

  const platforms = [
    { id: 'google', name: 'Google', icon: '🔍' },
    { id: 'wix', name: 'Wix', icon: '🌐' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' }
  ];

  const handlePlatformSelect = async (platformId: string) => {
    setSelectedPlatform(platformId);
    if (!session) {
      try {
        await signIn(platformId);
      } catch (error: unknown) {
        setError('Authentication failed. Please try again.');
      }
    }
  };

  const handlePublish = async () => {
    if (!content) {
      setError('Please enter content to publish');
      return;
    }

    if (!selectedPlatform) {
      setError('Please select a platform');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      if (isScheduled && scheduledDate && scheduledTime) {
        // Check if the scheduled time is in the past
        const scheduledDateTime = dayjs(`${scheduledDate.format('YYYY-MM-DD')} ${scheduledTime.format('HH:mm')}`);
        if (scheduledDateTime.isBefore(dayjs())) {
          setError('Cannot schedule posts in the past');
          setIsPublishing(false);
          return;
        }

        await onPublish(content, selectedPlatform, {
          date: scheduledDate.format('YYYY-MM-DD'),
          time: scheduledTime.format('HH:mm')
        });
        message.success('Post scheduled successfully');
      } else {
        await onPublish(content, selectedPlatform);
        message.success('Post published successfully');
      }
      onClose();
    } catch (error: unknown) {
      setError('Failed to publish content. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleScheduleToggle = (checked: boolean) => {
    setIsScheduled(checked);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isScheduled ? 'Schedule Content' : 'Publish Content'}
        </h2>
        
        <div className="mb-4">
          <textarea
            className="w-full p-2 border rounded-md"
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter your content here..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          {platforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => handlePlatformSelect(platform.id)}
              className={`p-4 border rounded-md flex items-center justify-center gap-2 ${selectedPlatform === platform.id ? 'border-blue-500 bg-blue-50' : ''}`}
            >
              <span>{platform.icon}</span>
              <span>{platform.name}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center">
              <CalendarOutlined className="mr-2" />
              <span>Schedule for later</span>
            </span>
            <Switch checked={isScheduled} onChange={handleScheduleToggle} />
          </div>

          {isScheduled && (
            <div className="mt-3 p-3 border rounded-md bg-gray-50">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <DatePicker
                    className="w-full"
                    value={scheduledDate}
                    onChange={setScheduledDate}
                    disabledDate={(current) => current && current < dayjs().startOf('day')}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <TimePicker
                    className="w-full"
                    value={scheduledTime}
                    onChange={setScheduledTime}
                    format="HH:mm"
                    minuteStep={15}
                  />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={!selectedPlatform || !content || isPublishing}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isPublishing ? 'Publishing...' : isScheduled ? 'Schedule' : 'Publish'}
              {isScheduled ? <CalendarOutlined /> : <SendOutlined />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
