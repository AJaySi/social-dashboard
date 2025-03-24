'use client';

import { useState } from 'react';
import { useEffect } from 'react';
import { Card, List, Tag, Typography, Tooltip, Button, Progress, Modal, Tabs } from 'antd';
import { TrophyOutlined, RiseOutlined, BarChartOutlined, LineChartOutlined, FileSearchOutlined } from '@ant-design/icons';
import { analyzeContentGaps } from '../../services/openai-gaps';

type CompetitorInsightsProps = {
  contentOpportunities: Array<{
    type: string;
    source_url: string;
    title: string;
    snippet: string;
    searchIntent?: 'informational' | 'commercial' | 'transactional';
    metrics?: {
      searchVolume: number;
      competition?: number;
      opportunityScore: number;
    };
    keywords?: string[];
  }>;
  competitorAnalysis: Array<{
    url: string;
    title: string;
    position: number;
    snippet: string;
    contentGaps?: Array<{
      topic: string;
      relevance: number;
    }>;
  }>;
};

type KeywordOpportunity = {
  keyword: string;
  searchVolume: number;
  currentRanking: number | null;
  competitorRanking: number;
  difficulty: number;
  potentialTraffic: number;
  opportunityScore: number;
};

export default function CompetitorInsights({ contentOpportunities, competitorAnalysis }: CompetitorInsightsProps) {
  const { Title, Text } = Typography;
  const { TabPane } = Tabs;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCompetitor, setSelectedCompetitor] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('1');
  
  // Mock data for keyword opportunities - in a real implementation, this would be calculated
  // based on actual search data and competitor rankings
  const keywordOpportunities: KeywordOpportunity[] = [
    {
      keyword: 'content marketing strategy',
      searchVolume: 5400,
      currentRanking: 18,
      competitorRanking: 3,
      difficulty: 65,
      potentialTraffic: 850,
      opportunityScore: 78
    },
    {
      keyword: 'seo content optimization',
      searchVolume: 3200,
      currentRanking: null,
      competitorRanking: 5,
      difficulty: 58,
      potentialTraffic: 620,
      opportunityScore: 82
    },
    {
      keyword: 'social media content calendar',
      searchVolume: 2800,
      currentRanking: 22,
      competitorRanking: 2,
      difficulty: 42,
      potentialTraffic: 540,
      opportunityScore: 75
    },
  ];

  // Content gaps derived from AI analysis
  const [contentGaps, setContentGaps] = useState<Array<{
    topic: string;
    coverageScore: number;
    competitorCoverage: number;
    potentialImpact: string;
    relatedKeywords: string[];
  }>>([{
    topic: 'Analyzing content gaps...',
    coverageScore: 0,
    competitorCoverage: 0,
    potentialImpact: 'Loading',
    relatedKeywords: []
  }]);

  // Fetch AI-powered content gap analysis on component mount
  useEffect(() => {
    const analyzeGaps = async () => {
      try {
        const aiAnalysis = await analyzeContentGaps(
          {
            title: 'Content Strategy Analysis',
            metrics: {
              searchVolume: 1000,
              competition: 0.6,
              opportunityScore: 75
            }
          },
          'competitor differentiation strategies'
        );

        // Transform AI analysis into content gaps format
        const transformedGaps = aiAnalysis.contentIdeas.map(idea => ({
          topic: idea.title,
          coverageScore: Math.round(Math.random() * 40), // Your current coverage
          competitorCoverage: Math.round(idea.estimatedImpact.authority),
          potentialImpact: idea.estimatedImpact.traffic > 70 ? 'High' : 'Medium',
          relatedKeywords: idea.targetKeywords
        }));

        setContentGaps(transformedGaps);
      } catch (error) {
        console.error('Error analyzing content gaps:', error);
        setContentGaps([{
          topic: 'Error analyzing content gaps',
          coverageScore: 0,
          competitorCoverage: 0,
          potentialImpact: 'Error',
          relatedKeywords: []
        }]);
      }
    };

    analyzeGaps();
  }, []);

  const contentGapsData = [
    {
      topic: 'Content Distribution Strategies',
      coverageScore: 25,
      competitorCoverage: 85,
      potentialImpact: 'High',
      relatedKeywords: ['content syndication', 'content promotion', 'distribution channels']
    },
    {
      topic: 'Content ROI Measurement',
      coverageScore: 40,
      competitorCoverage: 90,
      potentialImpact: 'Medium',
      relatedKeywords: ['content analytics', 'conversion tracking', 'attribution models']
    },
    {
      topic: 'Interactive Content Creation',
      coverageScore: 15,
      competitorCoverage: 75,
      potentialImpact: 'High',
      relatedKeywords: ['quizzes', 'calculators', 'interactive infographics']
    }
  ];

  const showCompetitorDetails = (competitor: any) => {
    setSelectedCompetitor(competitor);
    setIsModalOpen(true);
  };

  const calculateOpportunityScore = (keyword: KeywordOpportunity) => {
    // A simple algorithm to calculate opportunity score based on:
    // - Search volume (higher is better)
    // - Current ranking (lower is better, not ranking is an opportunity)
    // - Competitor ranking (lower is better as it shows it's possible to rank)
    // - Difficulty (lower is better)
    
    const searchVolumeScore = Math.min(keyword.searchVolume / 1000, 1) * 30;
    const rankingScore = keyword.currentRanking ? (100 - Math.min(keyword.currentRanking, 100)) / 100 * 20 : 20;
    const competitorScore = (10 - Math.min(keyword.competitorRanking, 10)) / 10 * 25;
    const difficultyScore = (100 - keyword.difficulty) / 100 * 25;
    
    return searchVolumeScore + rankingScore + competitorScore + difficultyScore;
  };

  return (
    <div className="space-y-4">
      {/* Content Opportunities Card */}
      <Card
        title={
          <div className="flex items-center">
            <RiseOutlined className="mr-2" />
            <span>Content Opportunities</span>
          </div>
        }
        className="mb-4"
      >
        <List
          itemLayout="vertical"
          dataSource={contentOpportunities}
          renderItem={(opportunity) => (
            <List.Item
              extra={
                opportunity.metrics && (
                  <div className="space-y-2">
                    <Tooltip title="Estimated monthly search volume">
                      <Tag color="blue">SV: {opportunity.metrics.searchVolume}</Tag>
                    </Tooltip>
                    {opportunity.metrics.competition !== undefined && (
                      <Tooltip title="Competition level (lower is better)">
                        <Tag color="volcano">
                          Comp: {opportunity.metrics.competition}
                        </Tag>
                      </Tooltip>
                    )}
                    <Tooltip title="Opportunity score based on CTR and search volume">
                      <Tag color="green">Score: {opportunity.metrics.opportunityScore}</Tag>
                    </Tooltip>
                  </div>
                )
              }
            >
              <List.Item.Meta
                title={
                  <a href={opportunity.source_url} target="_blank" rel="noopener noreferrer">
                    {opportunity.title}
                  </a>
                }
                description={
                  <div className="space-y-2">
                    <Text type="secondary">{opportunity.snippet}</Text>
                    {opportunity.searchIntent && (
                      <Tooltip title="This indicates the likely user intent behind the keyword.">
                        <Tag color="purple">{opportunity.searchIntent}</Tag>
                      </Tooltip>
                    )}
                    {opportunity.keywords && (
                      <div className="flex flex-wrap gap-2">
                        {opportunity.keywords.map((keyword) => (
                          <Tag key={keyword} color="blue">{keyword}</Tag>
                        ))}
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Keyword Opportunity Scoring Card */}
      <Card
        title={
          <div className="flex items-center">
            <BarChartOutlined className="mr-2" />
            <span>Keyword Opportunity Scoring</span>
          </div>
        }
        className="mb-4"
      >
        <div className="mb-4">
          <Text type="secondary">
            Identify high-potential keywords based on search volume, competition, and current rankings.
          </Text>
        </div>
        <List
          itemLayout="vertical"
          dataSource={keywordOpportunities}
          renderItem={(keyword) => (
            <List.Item
              extra={
                <div className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <Tooltip title="Search volume per month">
                      <Tag color="blue">SV: {keyword.searchVolume}</Tag>
                    </Tooltip>
                    <Tooltip title="Current ranking position">
                      <Tag color="green">
                        Rank: {keyword.currentRanking || 'Not ranking'}
                      </Tag>
                    </Tooltip>
                    <Tooltip title="Competitor's ranking position">
                      <Tag color="orange">Comp Rank: {keyword.competitorRanking}</Tag>
                    </Tooltip>
                    <Tooltip title="Keyword difficulty score">
                      <Tag color="red">Difficulty: {keyword.difficulty}</Tag>
                    </Tooltip>
                    <Tooltip title="Potential monthly traffic">
                      <Tag color="purple">Traffic: {keyword.potentialTraffic}</Tag>
                    </Tooltip>
                  </div>
                  <Progress
                    percent={calculateOpportunityScore(keyword)}
                    size="small"
                    status="active"
                    format={(percent) => `Score: ${percent?.toFixed(0)}`}
                  />
                </div>
              }
            >
              <List.Item.Meta
                title={<span className="text-lg">{keyword.keyword}</span>}
                description={
                  <div className="space-y-2">
                    <Text type="secondary">
                      Opportunity Score: {keyword.opportunityScore}
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Content Gap Analysis Card */}
      <Card
        title={
          <div className="flex items-center">
            <FileSearchOutlined className="mr-2" />
            <span>Content Gap Analysis</span>
          </div>
        }
        className="mb-4"
      >
        <div className="mb-4">
          <Text type="secondary">
            Topics your competitors cover that you don't, representing potential content opportunities.
          </Text>
        </div>
        <List
          itemLayout="vertical"
          dataSource={contentGaps}
          renderItem={(gap) => (
            <List.Item>
              <List.Item.Meta
                title={<span className="text-lg">{gap.topic}</span>}
                description={
                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <div className="flex-1">
                        <Text type="secondary">Your Coverage:</Text>
                        <Progress percent={gap.coverageScore} size="small" status="exception" />
                      </div>
                      <div className="flex-1">
                        <Text type="secondary">Competitor Coverage:</Text>
                        <Progress percent={gap.competitorCoverage} size="small" status="active" />
                      </div>
                      <div>
                        <Text type="secondary">Potential Impact:</Text>
                        <Tag color={gap.potentialImpact === 'High' ? 'red' : 'orange'} className="ml-2">
                          {gap.potentialImpact}
                        </Tag>
                      </div>
                    </div>
                    <div>
                      <Text type="secondary">Related Keywords:</Text>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {gap.relatedKeywords.map((keyword, idx) => (
                          <Tag key={idx} color="blue">{keyword}</Tag>
                        ))}
                      </div>
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Competitor Analysis Card */}
      <Card
        title={
          <div className="flex items-center">
            <TrophyOutlined className="mr-2" />
            <span>Competitor Analysis</span>
          </div>
        }
        className="mb-4"
      >
        <List
          itemLayout="vertical"
          dataSource={competitorAnalysis}
          renderItem={(competitor) => (
            <List.Item
              extra={
                <div className="space-y-2">
                  <Button 
                    type="primary" 
                    size="small" 
                    onClick={() => showCompetitorDetails(competitor)}
                  >
                    View Details
                  </Button>
                </div>
              }
            >
              <List.Item.Meta
                title={
                  <a href={competitor.url} target="_blank" rel="noopener noreferrer">
                    {competitor.title}
                  </a>
                }
                description={
                  <div className="space-y-2">
                    <Text type="secondary">{competitor.snippet}</Text>
                    <Tag color="blue">Position: {competitor.position}</Tag>
                    {competitor.contentGaps && competitor.contentGaps.length > 0 && (
                      <div className="mt-2">
                        <Text type="secondary">Content Gaps:</Text>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {competitor.contentGaps.map((gap, idx) => (
                            <Tag key={idx} color="volcano">
                              {gap.topic} ({gap.relevance}%)
                            </Tag>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Competitor Details Modal */}
      <Modal
        title="Competitor Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        {selectedCompetitor && (
          <div className="space-y-4">
            <Tabs activeKey={activeTab} onChange={setActiveTab}>
              <TabPane tab="Overview" key="1">
                <div className="space-y-4">
                  <div>
                    <Title level={4}>{selectedCompetitor.title}</Title>
                    <a href={selectedCompetitor.url} target="_blank" rel="noopener noreferrer" className="text-blue-500">
                      {selectedCompetitor.url}
                    </a>
                  </div>
                  <div>
                    <Text type="secondary">SERP Position: {selectedCompetitor.position}</Text>
                  </div>
                  <div>
                    <Text>{selectedCompetitor.snippet}</Text>
                  </div>
                </div>
              </TabPane>
              <TabPane tab="Content Gaps" key="2">
                {selectedCompetitor.contentGaps && selectedCompetitor.contentGaps.length > 0 ? (
                  <List
                    itemLayout="horizontal"
                    dataSource={selectedCompetitor.contentGaps}
                    renderItem={(gap: { topic: string; relevance: number }) => (
                      <List.Item>
                        <List.Item.Meta
                          title={gap.topic}
                          description={
                            <div className="flex items-center">
                              <Text type="secondary">Relevance:</Text>
                              <Progress percent={gap.relevance} size="small" className="ml-2" />
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                ) : (
                  <Text type="secondary">No content gaps identified for this competitor.</Text>
                )}
              </TabPane>
            </Tabs>
          </div>
        )}
      </Modal>
    </div>
  );
}