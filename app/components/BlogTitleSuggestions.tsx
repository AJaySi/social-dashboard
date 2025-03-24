'use client';

import { useState, useEffect } from 'react';
import { Modal, Card, Button, Tooltip, Progress, Badge, Collapse, Tabs } from 'antd';
import { EditOutlined, CheckOutlined, RocketOutlined, LineChartOutlined, QuestionCircleOutlined, CaretRightOutlined, TrophyOutlined, RiseOutlined, AimOutlined } from '@ant-design/icons';

type BlogTitleSuggestion = {
  title: string;
  metrics: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  insights: Array<{
    type: string;
    description: string;
    score: number;
  }>;
  relevanceScore?: number;
};

type GSCInsight = {
  keyword: string;
  metrics: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  type: string;
  title: string;
};

type BlogTitleSuggestionsProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectTitle: (title: string) => void;
  currentContent: string;
  gscInsights: GSCInsight[];
};

export default function BlogTitleSuggestions({
  isOpen,
  onClose,
  onSelectTitle,
  currentContent,
  gscInsights
}: BlogTitleSuggestionsProps) {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<BlogTitleSuggestion[]>([]);
  const [activeTab, setActiveTab] = useState('quick_wins');

  const generateRelevanceScore = (title: string, content: string): number => {
    const contentKeywords = content.toLowerCase().split(/\s+/);
    const titleKeywords = title.toLowerCase().split(/\s+/);
    const commonWords = titleKeywords.filter(word => contentKeywords.includes(word));
    return Math.min(100, (commonWords.length / titleKeywords.length) * 100);
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentContent || !isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/suggestions/blog-titles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: currentContent,
            gscInsights,
            category: activeTab
          })
        });
        
        if (!response.ok) throw new Error('Failed to fetch suggestions');
        
        const data = await response.json();
        setSuggestions(data.map((suggestion: BlogTitleSuggestion) => ({
          ...suggestion,
          relevanceScore: generateRelevanceScore(suggestion.title, currentContent)
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [currentContent, gscInsights, activeTab, isOpen]);

  const handleRefineSuggestion = async (title: string) => {
    setIsRefining(true);
    setSelectedTitle(title);
    
    try {
      const response = await fetch('/api/suggestions/refine-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content: currentContent,
          gscInsights
        })
      });

      if (!response.ok) throw new Error('Failed to refine title');
      
      const data = await response.json();
      setSuggestions(prev => prev.map(suggestion => 
        suggestion.title === title ? { ...suggestion, ...data } : suggestion
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine title');
    } finally {
      setIsRefining(false);
      setSelectedTitle(null);
    }
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <EditOutlined className="text-blue-600" />
          <span>Blog Title Suggestions</span>
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={800}
      className="blog-title-suggestions-modal"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 p-4">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 border rounded-lg space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'quick_wins',
                  label: (
                    <span className="flex items-center">
                      <RocketOutlined className="mr-2" />
                      Quick Wins
                    </span>
                  ),
                },
                {
                  key: 'trending',
                  label: (
                    <span className="flex items-center">
                      <LineChartOutlined className="mr-2" />
                      Trending
                    </span>
                  ),
                },
                {
                  key: 'optimized',
                  label: (
                    <span className="flex items-center">
                      <TrophyOutlined className="mr-2" />
                      Optimized
                    </span>
                  ),
                },
              ]}
            />

            {suggestions.length > 0 ? (
              <div className="space-y-4">
                {suggestions.map((suggestion, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-md transition-shadow"
                    actions={[
                      <Tooltip key="select" title="Use this title">
                        <Button
                          type="primary"
                          icon={<CheckOutlined />}
                          onClick={() => onSelectTitle(suggestion.title)}
                          className="bg-blue-500"
                        >
                          Select
                        </Button>
                      </Tooltip>,
                      <Tooltip key="refine" title="Refine this suggestion">
                        <Button
                          icon={<EditOutlined />}
                          onClick={() => handleRefineSuggestion(suggestion.title)}
                          loading={isRefining && selectedTitle === suggestion.title}
                        >
                          Refine
                        </Button>
                      </Tooltip>,
                    ]}
                  >
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold">{suggestion.title}</h3>
                      
                      <div className="flex items-center gap-4 mb-3 flex-wrap">
                        <Badge
                          color="#1890ff"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:shadow-sm transition-shadow cursor-default bg-blue-50"
                        >
                          <RiseOutlined className="text-[#1890ff]" />
                          <span className="font-medium">{suggestion.metrics.clicks} clicks</span>
                        </Badge>
                        <Badge
                          color="#52c41a"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:shadow-sm transition-shadow cursor-default bg-green-50"
                        >
                          <AimOutlined className="text-[#52c41a]" />
                          <span className="font-medium">{suggestion.metrics.impressions} impressions</span>
                        </Badge>
                        <Badge
                          color="#722ed1"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:shadow-sm transition-shadow cursor-default bg-purple-50"
                        >
                          <TrophyOutlined className="text-[#722ed1]" />
                          <span className="font-medium">{(suggestion.metrics.ctr * 100).toFixed(1)}% CTR</span>
                        </Badge>
                        <Tooltip title="Content relevance score based on keyword matching" placement="top">
                          <Badge
                            color="#13c2c2"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:shadow-sm transition-shadow cursor-help bg-cyan-50"
                          >
                            <QuestionCircleOutlined className="text-[#13c2c2]" />
                            <span className="font-medium">{suggestion.relevanceScore?.toFixed(1)}% relevance</span>
                          </Badge>
                        </Tooltip>
                      </div>
                      <Collapse
                        ghost
                        expandIcon={({ isActive }) => (
                          <CaretRightOutlined rotate={isActive ? 90 : 0} />
                        )}
                        items={[
                          {
                            key: '1',
                            header: (
                              <span className="flex items-center">
                                <QuestionCircleOutlined className="mr-2 animate-pulse text-blue-500" />
                                Why this suggestion?
                              </span>
                            ),
                            children: (
                              <div className="space-y-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                  <h4 className="text-sm font-medium text-blue-700 mb-2">Content Relevance</h4>
                                  <Progress
                                    percent={suggestion.relevanceScore}
                                    size="small"
                                    status="active"
                                    strokeColor={{
                                      '0%': '#108ee9',
                                      '100%': '#87d068',
                                    }}
                                  />
                                  <p className="text-xs text-gray-600 mt-1">
                                    Based on keyword matching with your content
                                  </p>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg">
                                  <h4 className="text-sm font-medium text-gray-700 mb-2">Performance Metrics</h4>
                                  <div className="grid grid-cols-2 gap-2">
                                    <div>
                                      <p className="text-xs text-gray-500">CTR</p>
                                      <p className="text-sm font-medium">{(suggestion.metrics.ctr * 100).toFixed(1)}%</p>
                                    </div>
                                    <div>
                                      <p className="text-xs text-gray-500">Position</p>
                                      <p className="text-sm font-medium">{suggestion.metrics.position}</p>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-700">Optimization Insights</h4>
                                  {suggestion.insights?.map((insight, i) => (
                                    <div key={i} className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-100">
                                      <div className="flex items-center space-x-2">
                                        <RiseOutlined className="text-blue-500" />
                                        <span className="text-sm">{insight.description}</span>
                                      </div>
                                      <Badge
                                        count={`${insight.score}%`}
                                        style={{ backgroundColor: '#1890ff' }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )
                          }
                        ]}
                      />
                      
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No suggestions available for the current content.
                Try adjusting your content or refreshing the suggestions.
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}