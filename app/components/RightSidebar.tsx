'use client';

import { useState } from 'react';
import { Collapse, Tooltip, Modal, Layout, Progress } from 'antd';
import { BarChartOutlined, RocketOutlined, FileSearchOutlined, LineChartOutlined, ToolOutlined, SyncOutlined, HistoryOutlined } from '@ant-design/icons';
import Image from 'next/image';
import { useSession, signIn } from 'next-auth/react';
import TopPerformers from './insights/TopPerformers';
import QuickWins from './insights/QuickWins';
import ContentGaps from './insights/ContentGaps';
import GrowthOpportunities from './insights/GrowthOpportunities';
import OptimizationOpportunities from './insights/OptimizationOpportunities';
import TrendsVisualization from './insights/TrendsVisualization';
import ContentVersioning from './ContentVersioning';

// Add these type definitions at the top of the file, after the imports
type GSCDataItem = {
  keyword: string;
  currentPosition: number;
  impressions: number;
  potentialTraffic: number;
  opportunity?: {
    trafficGain: number;
    effort: string;
    impactPotential: string;
  };
  recommendation: string;
};

type Insight = {
  type: string;
  title: string;
  description: string;
  data: GSCDataItem[]; // Update this from unknown[] to GSCDataItem[]
};

interface RightSidebarProps {
  insights: Insight[];
  onRefresh?: () => Promise<void>;
  currentContent?: string;
}

const { Sider } = Layout;

export default function RightSidebar({ insights, onRefresh, currentContent = '' }: RightSidebarProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [isContentAnalyzerModalOpen, setIsContentAnalyzerModalOpen] = useState(false);
  // Remove unused state variables
  const { data: session } = useSession();

  console.log('RightSidebar rendered with insights:', insights);
  console.log('Session state:', { 
    isAuthenticated: !!session,
    provider: session?.provider,
    error: session?.error
  });

  const handleRefresh = async () => {
    if (onRefresh) {
      console.log('Refreshing insights...');
      setIsRefreshing(true);
      setLoadingProgress(0);
      setLoadingMessage('Connecting to Google Search Console...');

      // Simulate progress updates
      const updateProgress = () => {
        setLoadingProgress(prev => {
          if (prev < 30) {
            setLoadingMessage('Fetching search analytics data...');
            return prev + 10;
          } else if (prev < 60) {
            setLoadingMessage('Processing keyword insights...');
            return prev + 15;
          } else if (prev < 90) {
            setLoadingMessage('Analyzing performance metrics...');
            return prev + 20;
          }
          return prev;
        });
      };

      const progressInterval = setInterval(updateProgress, 800);

      try {
        await onRefresh();
        setLoadingProgress(100);
        setLoadingMessage('Insights updated successfully!');
      } catch {
        setLoadingMessage('Error updating insights. Please try again.');
      } finally {
        clearInterval(progressInterval);
        setTimeout(() => {
          setIsRefreshing(false);
          setLoadingProgress(0);
          setLoadingMessage('');
        }, 1000);
      }
    }
  };

  const getInsightByType = (type: string) => {
    return insights?.find(insight => insight.type === type);
  };

  const getIconByType = (type: string) => {
    switch (type) {
      case 'top_performers':
        return <BarChartOutlined />;
      case 'quick_wins':
        return <RocketOutlined />;
      case 'content_ideas':
        return <FileSearchOutlined />;
      case 'growth_opportunities':
        return <LineChartOutlined />;
      case 'optimization_opportunities':
        return <ToolOutlined />;
      case 'trends':
        return <LineChartOutlined />;
      default:
        return null;
    }
  };

  const getTooltipContent = (type: string) => {
    switch (type) {
      case 'top_performers':
        return 'View your best performing content';
      case 'quick_wins':
        return 'Opportunities for rapid improvement';
      case 'content_gaps':
        return 'Areas needing content expansion';
      case 'growth_opportunities':
        return 'Potential areas for traffic growth';
      case 'optimization_opportunities':
        return 'Pages needing SEO improvements';
      case 'trends':
        return 'Historical performance trends';
      default:
        return '';
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
    <Sider
      className="h-screen bg-gradient-to-br from-white via-blue-50/80 to-blue-50 border-l border-gray-200 overflow-y-auto fixed right-0 top-0 shadow-md shadow-blue-50/20"
      width={320}
      collapsible
      defaultCollapsed={false}
      collapsedWidth={64}
      trigger={null}
    >
      <div className="p-4">
        <div className="flex flex-col space-y-3 mb-6 border-b border-gray-200/50 pb-3">
          <button
            onClick={() => window.location.href = '/content-ideator'}
            className="flex items-center justify-center w-full px-6 py-2 bg-gradient-to-r from-blue-400 to-purple-400 text-white rounded-md hover:from-blue-500 hover:to-purple-500 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105"
          >
            ALwrity Content AIdeator
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-semibold text-blue-900">GSC Insights</h2>
              <button
                onClick={handleRefresh}
                className={`p-1 text-blue-600 hover:text-blue-800 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
                disabled={isRefreshing}
              >
                <SyncOutlined />
              </button>
            </div>
            <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsContentAnalyzerModalOpen(true)}
              className="flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="Content Performance Analyzer"
            >
              <HistoryOutlined />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center px-3 py-1 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-md hover:from-blue-500 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <Image
                src="/favicon.ico"
                alt="ALwrity"
                width={16}
                height={16}
                className="mr-2 opacity-90"
              />
              Ask ALwrity
            </button>
            </div>
          </div>
        </div>

        {isRefreshing && (
          <div className="mb-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{loadingMessage}</span>
                <span className="text-sm font-medium text-blue-600">{loadingProgress}%</span>
              </div>
              <Progress
                percent={loadingProgress}
                status="active"
                strokeColor={{
                  from: '#4F46E5',
                  to: '#06B6D4',
                }}
                showInfo={false}
              />
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Collapse
            defaultActiveKey={['top_performers']}
            className="bg-transparent border-0 shadow-lg"
            items={(['top_performers', 'quick_wins', 'content_gaps', 'growth_opportunities', 'optimization_opportunities', 'trends'].map((type) => {
              const insight = getInsightByType(type);
              if (!insight) return null;
              
              return {
                key: type,
                label: (
                  <Tooltip title={getTooltipContent(type)} placement="left">
                    <div className="flex items-center space-x-2 group">
                      <span className="text-blue-600 group-hover:text-blue-800 transition-colors">
                        {getIconByType(type)}
                      </span>
                      <span className="font-medium text-blue-900 group-hover:text-blue-800 transition-colors">{insight.title}</span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full ml-auto group-hover:bg-blue-200 transition-colors">
                        {insight.data.length}
                      </span>
                    </div>
                  </Tooltip>
                ),
                children: (
                  <div className="p-2">
                    {type === 'top_performers' && <TopPerformers data={insight.data.map(item => ({
                      keyword: item.keyword,
                      clicks: 0, // Default value since GSCDataItem doesn't have clicks
                      impressions: item.impressions,
                      ctr: 0, // Default value since GSCDataItem doesn't have ctr
                      position: item.currentPosition,
                      recommendations: item.recommendation ? [item.recommendation] : undefined
                    }))} />}
                    {type === 'quick_wins' && <QuickWins data={insight.data.map(item => ({
                      keyword: item.keyword,
                      currentPosition: item.currentPosition,
                      impressions: item.impressions,
                      potentialTraffic: item.potentialTraffic,
                      opportunity: item.opportunity,
                      recommendation: item.recommendation,
                      type: 'quick_win',
                      title: 'Quick Win Opportunity',
                      description: `Opportunity for ${item.keyword}`,
                      recommendations: [item.recommendation]
                    }))} />}
                    {type === 'content_gaps' && <ContentGaps data={insight.data.map(item => ({
                      keyword: item.keyword,
                      currentPosition: item.currentPosition,
                      impressions: item.impressions,
                      title: `Content Gap for ${item.keyword}`,
                      description: `Missing content opportunity for keyword: ${item.keyword}`,
                      recommendations: [item.recommendation]
                    }))} />}
                    {type === 'growth_opportunities' && <GrowthOpportunities data={insight.data.map(item => ({
                      title: `Growth Opportunity for ${item.keyword}`,
                      description: `Potential traffic gain: ${item.potentialTraffic}`,
                      recommendations: [item.recommendation]
                    }))} />}
                    {type === 'optimization_opportunities' && <OptimizationOpportunities data={insight.data as GSCDataItem[]} />}
                    {type === 'trends' && <TrendsVisualization data={insight.data.map(item => ({
                      date: new Date().toISOString(), // Default date since GSCDataItem doesn't have date
                      clicks: 0, // Default value since GSCDataItem doesn't have clicks
                      impressions: item.impressions,
                      ctr: 0, // Default value since GSCDataItem doesn't have ctr
                      position: item.currentPosition
                    }))} />}
                  </div>
                ),
                className: "mb-2 rounded-lg border border-blue-200 overflow-hidden hover:border-blue-300 transition-colors bg-gradient-to-r from-white to-blue-50 shadow-md hover:shadow-lg hover:shadow-blue-100/50"
              };
            })).filter((item): item is NonNullable<typeof item> => item !== null)}
          />
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
          styles={{ body: { padding: '24px' } }}
        >
          <div className="space-y-6 py-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Top Performers</h3>
              <p className="text-gray-600">
                These are your website&apos;s star players! This section shows your most successful content and keywords that are already doing great in search results. It helps you understand what&apos;s working well so you can create more content like this.
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
                These are topics your audience is interested in, but you haven&apos;t fully covered yet. It&apos;s like finding missing pieces in your content puzzle that could help attract more readers to your website.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Growth Opportunities</h3>
              <p className="text-gray-600">
                These are potential goldmines for your website! This section identifies keywords and topics that could bring significant traffic if you focus on them. It&apos;s like spotting future trends before they become big.
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

      {/* Content Performance Analyzer Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <HistoryOutlined className="mr-2 text-blue-600" />

            <span>Content Performance Analyzer</span>
          </div>
        }
        open={isContentAnalyzerModalOpen}
        onCancel={() => setIsContentAnalyzerModalOpen(false)}
        footer={null}
        width={800}
        styles={{ body: { padding: '24px' } }}
      >
        <ContentVersioning 
          currentContent={currentContent} 
          onSaveVersion={() => {
            // You can add any additional functionality here if needed
          }} 
        />
      </Modal>
    </Sider>
  );
}