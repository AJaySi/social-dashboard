'use client';

import { useState } from 'react';
import { Modal, Button, Tooltip, Tag, Progress } from 'antd';
import { InfoCircleOutlined, ArrowRightOutlined } from '@ant-design/icons';

interface ContentGap {
  title: string;
  description: string;
  recommendations: string[];
  searchIntent?: 'informational' | 'commercial' | 'transactional';
  metrics?: {
    searchVolume: number;
    ranking: number;
    opportunityScore: number;
  };
  relatedKeywords?: string[];
  competitorAnalysis?: {
    structure: string;
    coverage: number;
  };
  aiwrightGapsAnalysis?: {
    contentIdeas: Array<{
      title: string;
      description: string;
      targetKeywords: string[];
      contentStructure: string[];
      estimatedImpact: {
        traffic: number;
        conversion: number;
        authority: number;
      };
    }>;
    recommendations: string[];
    competitorInsights: Array<{
      strength: string;
      opportunity: string;
    }>;
  };
}

interface ContentGapsProps {
  data: ContentGap[];
}

import { analyzeContentGaps } from '../../services/openai-gaps';

export default function ContentGaps({ data }: ContentGapsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGap, setSelectedGap] = useState<ContentGap | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<{[key: string]: boolean}>({});

  const showDetails = (gap: ContentGap) => {
    setSelectedGap(gap);
    setIsModalOpen(true);
  };

  const handleUseRecommendation = (recommendation: string) => {
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

  if (!data || data.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No content gaps found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-lg font-semibold text-gray-900">Content Gap Analysis</h2>
        <p className="text-sm text-gray-600 mt-1">
          Identify opportunities to expand your content coverage
        </p>
      </div>

      <div className="space-y-4">
        {data.map((gap, index) => (
          <div
            key={index}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-colors"
          >
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-medium text-gray-800">{gap.title}</h3>
                    {gap.searchIntent && (
                      <Tag color={gap.searchIntent === 'informational' ? 'blue' : gap.searchIntent === 'commercial' ? 'green' : 'orange'}>
                        {gap.searchIntent}
                      </Tag>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{gap.description}</p>
                </div>
                <Tooltip title="View detailed analysis">
                  <Button
                    type="text"
                    icon={<InfoCircleOutlined />}
                    onClick={() => showDetails(gap)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  />
                </Tooltip>
              </div>

              {gap.metrics && (
                <div className="grid grid-cols-3 gap-4 bg-gray-50 p-3 rounded-lg">
                  <div>
                    <div className="text-xs text-gray-500">Search Volume</div>
                    <div className="text-sm font-medium">{gap.metrics.searchVolume}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Ranking</div>
                    <div className="text-sm font-medium">{gap.metrics.ranking}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Opportunity Score</div>
                    <Progress percent={gap.metrics.opportunityScore} size="small" />
                  </div>
                </div>
              )}

              {gap.relatedKeywords && gap.relatedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {gap.relatedKeywords.map((keyword, kidx) => (
                    <Tag key={kidx} color="blue">{keyword}</Tag>
                  ))}
                </div>
              )}

              {gap.competitorAnalysis && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-xs font-medium text-blue-700 mb-2">Competitor Content Structure</div>
                  <p className="text-sm text-gray-700">{gap.competitorAnalysis.structure}</p>
                  <div className="mt-2">
                    <div className="text-xs text-gray-500">Coverage</div>
                    <Progress percent={gap.competitorAnalysis.coverage} size="small" status="active" />
                  </div>
                </div>
              )}

              {gap.recommendations && gap.recommendations.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-medium text-gray-500">Recommended Actions:</div>
                  {gap.recommendations.map((recommendation, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                      <span className="text-sm text-gray-700">{recommendation}</span>
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          type="link"
                          icon={<ArrowRightOutlined />}
                          onClick={() => handleUseRecommendation(recommendation)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Use This
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          loading={isAnalyzing[gap.title]}
                          onClick={async () => {
                            setIsAnalyzing(prev => ({ ...prev, [gap.title]: true }));
                            try {
                              const analysis = await analyzeContentGaps(gap, gap.title);
                              const updatedGap = { ...gap, aiwrightGapsAnalysis: analysis };
                              setSelectedGap(updatedGap);
                              setIsModalOpen(true);
                            } catch (error) {
                              console.error('Error analyzing gaps:', error);
                            } finally {
                              setIsAnalyzing(prev => ({ ...prev, [gap.title]: false }));
                            }
                          }}
                          style={{
                            background: 'linear-gradient(to right, #3B82F6, #4F46E5)',
                            border: 'none'
                          }}
                        >
                          AIwrity Gaps
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <Modal
        title={
          <div className="text-lg font-semibold text-gray-900">
            Content Gap Details
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={800}
      >
        {selectedGap && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-gray-800">
                {selectedGap.title}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {selectedGap.description}
              </p>
            </div>

            {selectedGap.aiwrightGapsAnalysis && (
              <div className="space-y-6">
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-4">Content Ideas</h4>
                  {selectedGap.aiwrightGapsAnalysis.contentIdeas.map((idea, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
                      <h5 className="font-medium text-gray-800 mb-2">{idea.title}</h5>
                      <p className="text-sm text-gray-600 mb-3">{idea.description}</p>
                      
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <div className="text-xs text-gray-500">Traffic Impact</div>
                          <Progress percent={idea.estimatedImpact.traffic} size="small" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Conversion Impact</div>
                          <Progress percent={idea.estimatedImpact.conversion} size="small" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Authority Impact</div>
                          <Progress percent={idea.estimatedImpact.authority} size="small" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-medium text-gray-500">Content Structure:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {idea.contentStructure.map((section, sIdx) => (
                            <div key={sIdx} className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                              {section}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Competitor Insights</h4>
                  <div className="space-y-3">
                    {selectedGap.aiwrightGapsAnalysis.competitorInsights.map((insight, idx) => (
                      <div key={idx} className="bg-gray-50 p-3 rounded">
                        <div className="flex items-center gap-2 mb-2">
                          <Tag color="blue">Strength</Tag>
                          <span className="text-sm text-gray-700">{insight.strength}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tag color="green">Opportunity</Tag>
                          <span className="text-sm text-gray-700">{insight.opportunity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedGap.recommendations && selectedGap.recommendations.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Recommended Actions
                </h4>
                <div className="space-y-2">
                  {selectedGap.recommendations.map((recommendation, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <span className="text-sm text-gray-700">{recommendation}</span>
                      <Button
                        size="small"
                        type="primary"
                        onClick={() => {
                          handleUseRecommendation(recommendation);
                          setIsModalOpen(false);
                        }}
                      >
                        Use This
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
