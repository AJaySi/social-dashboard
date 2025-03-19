'use client';

import { useState } from 'react';
import { Collapse, Tooltip, Modal } from 'antd';
import { BarChartOutlined, RocketOutlined, FileSearchOutlined, LineChartOutlined, ToolOutlined, SyncOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import TopPerformers from './insights/TopPerformers';
import QuickWins from './insights/QuickWins';
import ContentGaps from './insights/ContentGaps';
import GrowthOpportunities from './insights/GrowthOpportunities';
import OptimizationOpportunities from './insights/OptimizationOpportunities';

type Insight = {
  type: string;
  title: string;
  description: string;
  data: any[];
};

interface RightSidebarProps {
  insights: Insight[];
  onRefresh?: () => Promise<void>;
}

export default function RightSidebar({ insights, onRefresh }: RightSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data: session } = useSession();

  const handleRefresh = async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
  };

  const getInsightByType = (type: string) => {
    return insights.find(insight => insight.type === type);
  };

  const getTooltipContent = (type: string) => {
    switch (type) {
      case 'top_performers':
        return 'View your best performing content and keywords';
      case 'quick_wins':
        return 'Opportunities for rapid improvement in rankings';
      case 'content_gaps':
        return 'Identify areas where content could be expanded';
      case 'growth_opportunities':
        return 'Discover potential areas for traffic growth';
      case 'optimization_opportunities':
        return 'Find pages that need SEO improvements';
      default:
        return '';
    }
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'top_performers':
        return <BarChartOutlined className="text-blue-500" />;
      case 'quick_wins':
        return <RocketOutlined className="text-green-500" />;
      case 'content_gaps':
        return <FileSearchOutlined className="text-yellow-500" />;
      case 'growth_opportunities':
        return <LineChartOutlined className="text-green-500" />;
      case 'optimization_opportunities':
        return <ToolOutlined className="text-purple-500" />;
      default:
        return null;
    }
  };

  if (!session || session.provider !== 'google') {
    const isSessionExpired = session?.error === 'Session expired. Please sign in again.';
    return (
      <div className="w-80 min-w-[320px] h-screen bg-white border-l border-gray-200 p-4 overflow-y-auto">
        <div className="flex flex-col items-center justify-center h-full space-y-4">
          <Image
            src="/favicon.ico"
            alt="ALwrity"
            width={48}
            height={48}
            className="opacity-50"
          />
          <h3 className="text-lg font-semibold text-gray-600">{isSessionExpired ? 'Session Expired' : 'Connect to Google Search Console'}</h3>
          <p className="text-sm text-gray-500 text-center mb-4">
            {isSessionExpired
              ? 'Your session has expired. Please reconnect to continue viewing insights.'
              : 'Connect your Google account to view insights from Google Search Console'
            }
          </p>
          <button
            onClick={() => signIn('google', { callbackUrl: window.location.origin })}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            {isSessionExpired ? 'Reconnect to GSC' : 'Connect to GSC'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 min-w-[320px] h-screen bg-white border-l border-gray-200 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-6 border-b pb-3">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold text-gray-800">GSC Insights</h2>
          <button
            onClick={handleRefresh}
            className={`p-1 text-gray-500 hover:text-blue-500 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            disabled={isRefreshing}
          >
            <SyncOutlined />
          </button>
        </div>
        <h2 className="text-xl font-semibold text-gray-800">GSC Insights</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
        >
          <Image
            src="/favicon.ico"
            alt="ALwrity"
            width={16}
            height={16}
            className="mr-2"
          />
          Ask ALwrity
        </button>
      </div>

      <div className="space-y-4">
        <Collapse defaultActiveKey={['top_performers']} className="bg-transparent border-0 shadow-sm">
          {['top_performers', 'quick_wins', 'content_gaps', 'growth_opportunities', 'optimization_opportunities'].map((type) => {
            const insight = getInsightByType(type);
            if (!insight) return null;

            return (
              <Collapse.Panel
                key={type}
                header={
                  <Tooltip title={getTooltipContent(type)} placement="left">
                    <div className="flex items-center space-x-2">
                      {getIconByType(type)}
                      <span className="font-medium">{insight.title}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full ml-auto">
                        {insight.data.length}
                      </span>
                    </div>
                  </Tooltip>
                }
                className="mb-2 rounded-lg border border-gray-200 overflow-hidden hover:border-blue-200 transition-colors"
              >
                <div className="p-2">
                  {type === 'top_performers' && <TopPerformers data={insight.data} />}
                  {type === 'quick_wins' && <QuickWins data={insight.data} />}
                  {type === 'content_gaps' && <ContentGaps data={insight.data} />}
                  {type === 'growth_opportunities' && <GrowthOpportunities data={insight.data} />}
                  {type === 'optimization_opportunities' && <OptimizationOpportunities data={insight.data} />}
                </div>
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </div>

      <Modal
        title={
          <div className="flex items-center">
            <Image
              src="/favicon.ico"
              alt="ALwrity"
              width={24}
              height={24}
              className="mr-2"
            />
            <span>Understanding GSC Insights</span>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={600}
      >
        <div className="space-y-6 py-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Top Performers</h3>
            <p className="text-gray-600">
              These are your website's star players! This section shows your most successful content and keywords that are already doing great in search results. It helps you understand what's working well so you can create more content like this.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Quick Wins</h3>
            <p className="text-gray-600">
              Think of these as low-hanging fruit - pages that are almost there but need a little push. With some small improvements, these pages could jump to higher positions in search results and bring in more visitors quickly.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Content Gaps</h3>
            <p className="text-gray-600">
              These are topics your audience is interested in, but you haven't fully covered yet. It's like finding missing pieces in your content puzzle that could help attract more readers to your website.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Growth Opportunities</h3>
            <p className="text-gray-600">
              These are potential goldmines for your website! This section identifies keywords and topics that could bring significant traffic if you focus on them. It's like spotting future trends before they become big.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-2">Optimization Opportunities</h3>
            <p className="text-gray-600">
              These are pages that need some TLC (Tender Loving Care). By making suggested improvements to these pages, you can help them perform better in search results and attract more visitors.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}