'use client';

import { useState, useRef } from 'react';
import { Modal } from 'antd';

interface QuickWinsProps {
  data: Array<{
    keyword: string;
    specificAction: string;
    currentMetrics: {
      position: number;
      impressions: number;
      currentClicks: number;
    };
    opportunity: {
      potentialTraffic: number;
      trafficIncrease: number;
      effort: string;
    };
  }>;
}

export default function QuickWins({ data }: QuickWinsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof data[0] | null>(null);

  const handleUseThis = (keyword: string) => {
    const textarea = document.querySelector('textarea[placeholder="What would you like to share?"]') as HTMLTextAreaElement;
    if (textarea) {
      textarea.value = keyword;
      textarea.focus();
      textarea.style.borderImage = 'linear-gradient(to right, #4F46E5, #06B6D4) 1';
      textarea.style.borderStyle = 'solid';
      textarea.style.borderWidth = '2px';
    }
  };

  const showDetails = (item: typeof data[0]) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {data.map((item, i) => (
        <div key={i} className="border rounded-lg p-4 bg-gradient-to-r from-blue-50 to-blue-100">
          <div className="flex justify-between items-center">
            <h4 className="font-medium text-gray-900">{item.keyword}</h4>
            <div className="flex gap-2">
              <button
                onClick={() => handleUseThis(item.keyword)}
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
        title={<div className="text-xl font-semibold text-gray-800 border-b pb-3">{selectedItem?.keyword}</div>}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        className="max-w-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        {selectedItem && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-gray-700 text-lg">{selectedItem.specificAction}</p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h5 className="text-lg font-semibold text-gray-800 mb-3">Current Metrics</h5>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between items-center">
                    <span>Position:</span>
                    <span className="font-medium">{selectedItem.currentMetrics.position.toFixed(1)}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Impressions:</span>
                    <span className="font-medium">{selectedItem.currentMetrics.impressions}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Current Clicks:</span>
                    <span className="font-medium">{selectedItem.currentMetrics.currentClicks}</span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                <h5 className="text-lg font-semibold text-gray-800 mb-3">Potential Impact</h5>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex justify-between items-center">
                    <span>Potential Traffic:</span>
                    <span className="font-medium text-green-600">{selectedItem.opportunity.potentialTraffic}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Traffic Increase:</span>
                    <span className="font-medium text-green-600">+{selectedItem.opportunity.trafficIncrease}</span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span>Effort Level:</span>
                    <span className="font-medium text-blue-600">{selectedItem.opportunity.effort}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}