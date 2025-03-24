'use client';

import { useState } from 'react';
import { Modal } from 'antd';

interface KeywordOpportunitiesProps {
  data: Array<{
    title: string;
    description: string;
    recommendations: string[];
  }>;
}

export default function KeywordOpportunities({ data }: KeywordOpportunitiesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const handleUseThis = (recommendation: string) => {
    const textarea = document.querySelector(
      'textarea[placeholder="What would you like to share?"]'
    ) as HTMLTextAreaElement;

    if (textarea) {
      textarea.value = recommendation;
      textarea.focus();
      textarea.style.borderImage = 'linear-gradient(to right, #4F46E5, #06B6D4) 1';
      textarea.style.borderStyle = 'solid';
      textarea.style.borderWidth = '2px';
    }
  };

  const showDetails = (recommendation: string) => {
    setSelectedItem(recommendation);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-800">{data[0].title}</h3>
      <p className="text-gray-600">{data[0].description}</p>

      {data[0].recommendations.map((item, i) => (
        <div
          key={i}
          className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100"
        >
          <div className="flex justify-between items-center">
            <p className="text-gray-800">{item}</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleUseThis(item)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Use This
              </button>
              <button
                onClick={() => showDetails(item)}
                className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      ))}

      <Modal
        title={<div className="text-xl font-semibold text-gray-800 border-b pb-3">Details</div>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="max-w-2xl"
      >
        {selectedItem && (
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h5 className="text-lg font-semibold text-gray-800 mb-3">Recommendation Details</h5>
            <p className="text-gray-700">{selectedItem}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
