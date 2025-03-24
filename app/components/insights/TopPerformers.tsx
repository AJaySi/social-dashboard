'use client';

import { useState } from 'react';
import { Card, Tag, Tooltip, Modal, Button } from 'antd';
import { LineChartOutlined, EyeOutlined, CiOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { generateActionableInsights } from '@/app/services/insights';
import ReactMarkdown from 'react-markdown';

interface TopPerformersProps {
  data: Array<{
    keyword: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    recommendations?: string[];
  }>;
}

export default function TopPerformers({ data }: TopPerformersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insights, setInsights] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWhatsThisClick = async () => {
    setIsLoading(true);
    setIsModalOpen(true);
    try {
      const insightText = await generateActionableInsights(data);
      setInsights(insightText);
    } catch (error) {
      console.error('Error generating insights:', error);
      setInsights('Failed to generate insights. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <Button
          onClick={handleWhatsThisClick}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
          icon={
            <div className="flex items-center gap-1">
              <Image src="/favicon.ico" alt="ALwrity" width={16} height={16} />
              <QuestionCircleOutlined />
            </div>
          }
        >
          What&apos;s This
        </Button>
      </div>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Image src="/favicon.ico" alt="ALwrity" width={24} height={24} />
            <span>Actionable Insights</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Generating insights...</p>
          </div>
        ) : (
          <div className="prose max-w-none markdown-content">
            <ReactMarkdown
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-gray-800">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 text-gray-700">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-medium mb-2 text-gray-600">{children}</h3>,
                p: ({ children }) => <p className="mb-4 text-gray-600">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-6 mb-4 space-y-2">{children}</ul>,
                li: ({ children }) => <li className="text-gray-600">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 text-gray-600 bg-blue-50">
                    {children}
                  </blockquote>
                ),
                strong: ({ children }) => <strong className="font-semibold text-gray-800">{children}</strong>
              }}
            >
              {insights}
            </ReactMarkdown>
          </div>
        )}
      </Modal>
      {data.map((item, i) => (
        <Card key={i} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-1">{item.keyword}</h4>
                <div className="flex gap-2 mb-2">
                  <Tooltip title="Average position in search results">
                    <Tag color="blue" icon={<LineChartOutlined />}>
                      Position {(item.position || 0).toFixed(1)}
                    </Tag>
                  </Tooltip>
                  <Tooltip title="Click-through rate">
                    <Tag color="green">
                      CTR {((item.ctr || 0) * 100).toFixed(2)}%
                    </Tag>
                  </Tooltip>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Tooltip title="Total clicks">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="flex items-center justify-center gap-2">
                    <CiOutlined className="text-blue-500" />
                    <span className="text-sm text-gray-500">Clicks</span>
                  </div>
                  <div className="text-lg font-semibold text-blue-600">
                    {(item.clicks || 0).toLocaleString()}
                  </div>
                </div>
              </Tooltip>
              <Tooltip title="Total impressions">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="flex items-center justify-center gap-2">
                    <EyeOutlined className="text-green-500" />
                    <span className="text-sm text-gray-500">Impressions</span>
                  </div>
                  <div className="text-lg font-semibold text-green-600">
                    {(item.impressions || 0).toLocaleString()}
                  </div>
                </div>
              </Tooltip>
            </div>

            {item.recommendations && item.recommendations.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 italic">
                  {item.recommendations[0]}
                </p>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}