'use client';

import { useState } from 'react';
import { Modal, Card } from 'antd';

interface GSCDataItem {
  type: string;
  title: string;
  description: string;
  recommendations: string[];
}

interface QuickWinsProps {
  data: GSCDataItem[];
}

export default function QuickWins({ data }: QuickWinsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GSCDataItem | null>(null);

  const handleUseThis = (recommendation: string) => {
    const textarea = document.querySelector('textarea[placeholder="Start writing your content here..."]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = recommendation;
      textarea.focus();
      textarea.style.borderImage = 'linear-gradient(to right, #4F46E5, #06B6D4) 1';
      textarea.style.borderStyle = 'solid';
      textarea.style.borderWidth = '2px';
    }
  };

  const showDetails = (item: GSCDataItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <Card
          key={i}
          className="hover:shadow-md transition-shadow duration-200"
          styles={{ body: { padding: '16px', background: 'linear-gradient(to right, #EEF2FF, #E0E7FF)' } }}
        >
          <div className="flex flex-col space-y-3">
            <h4 className="font-medium text-gray-900">{item.title}</h4>
            <p className="text-sm text-gray-700">{item.description}</p>
            <ul className="space-y-1 text-sm text-gray-600 list-disc pl-5">
              {item.recommendations.map((rec, idx) => (
                <li key={idx} className="flex justify-between items-start">
                  <span>{rec}</span>
                  <button
                    onClick={() => handleUseThis(rec)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Use This
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => showDetails(item)}
              className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Details
            </button>
          </div>
        </Card>
      ))}

      <Modal
        title={
          <div className="text-xl font-semibold text-gray-800 border-b pb-3">
            {selectedItem?.title}
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="max-w-2xl"
        styles={{ body: { padding: '24px' } }}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-gray-700 text-lg">{selectedItem.description}</p>
            </div>
            <ul className="space-y-2 text-gray-600 list-disc pl-5">
              {selectedItem.recommendations.map((rec, idx) => (
                <li key={idx}>{rec}</li>
              ))}
            </ul>
          </div>
        )}
      </Modal>
    </div>
  );
}
