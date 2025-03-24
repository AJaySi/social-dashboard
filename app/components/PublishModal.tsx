'use client';

import { useState } from 'react';
import { signIn, useSession } from 'next-auth/react';

interface PublishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (content: string, platform: string, title?: string) => Promise<void>;
  initialContent?: string;
}

export default function PublishModal({ isOpen, onClose, onPublish, initialContent = '' }: PublishModalProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState(initialContent);
  const [title, setTitle] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      } catch (_error: unknown) {
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

    if (selectedPlatform === 'wix' && !title) {
      setError('Please enter a title for your Wix blog post');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      await onPublish(content, selectedPlatform, title);
      onClose();
    } catch (_error: unknown) {
      setError('Failed to publish content. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-md relative z-50 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Publish Content</h2>
        
        {selectedPlatform === 'wix' && (
          <div className="mb-4">
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog post title..."
            />
          </div>
        )}
        
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
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isPublishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </div>
  );
}