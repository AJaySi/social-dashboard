'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Typography, Tabs, Progress, Divider, Button, Tag, Space, Input, Alert, Modal } from 'antd';
import { CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, EditOutlined, RocketOutlined, ArrowLeftOutlined, SaveOutlined, LineChartOutlined, FileTextOutlined, BulbOutlined } from '@ant-design/icons';
import PublishModal from '../components/PublishModal';
import { useSession } from 'next-auth/react';

const { Title, Text } = Typography;
const { TextArea } = Input;

type QualityMetric = {
  name: string;
  score: number;
  description: string;
  status: 'success' | 'warning' | 'error' | 'normal';
  suggestions?: string[];
};

type ContentSection = {
  id: string;
  title: string;
  content: string;
  metrics?: {
    uniquenessScore?: number;
    contextualScore?: number;
    coherenceScore?: number;
    thematicScore?: number;
    narrativeFlowScore?: number;
  };
};

export default function ContentQualityAssessment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlatform, setSelectedPlatform] = useState<string>(''); // Add this state
  const [content, setContent] = useState<string>('');
  const [sections, setSections] = useState<ContentSection[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editedContent, setEditedContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);
  const [overallScore, setOverallScore] = useState(0);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [seoMetrics, setSeoMetrics] = useState<QualityMetric[]>([]);
  const [readabilityMetrics, setReadabilityMetrics] = useState<QualityMetric[]>([]);
  const [engagementMetrics, setEngagementMetrics] = useState<QualityMetric[]>([]);
  const [improvementSuggestions, setImprovementSuggestions] = useState<string[]>([]);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const { data: session } = useSession();
  
  const analyzeContent = useCallback(async (contentText: string, contentSections: ContentSection[]) => {
    setIsAnalyzing(true);
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Calculate overall score based on section metrics
      const sectionScores = contentSections.map(section => {
        const metrics = section.metrics || {};
        const scores = [
          metrics.uniquenessScore || 0,
          metrics.contextualScore || 0,
          metrics.coherenceScore || 0,
          metrics.thematicScore || 0,
          metrics.narrativeFlowScore || 0
        ];
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
      });
      
      const calculatedOverallScore = Math.round(
        sectionScores.reduce((sum, score) => sum + score, 0) / sectionScores.length
      );
      
      setOverallScore(calculatedOverallScore);
      
      // Set mock quality metrics
      setQualityMetrics([
        {
          name: 'Content Coherence',
          score: 87,
          description: 'Measures how well ideas flow and connect throughout the content',
          status: 'success',
          suggestions: ['Strengthen transitions between paragraphs 3 and 4']
        },
        {
          name: 'Thematic Consistency',
          score: 82,
          description: 'Evaluates how well the content maintains key themes throughout',
          status: 'success',
          suggestions: ['Reinforce the main theme in the conclusion']
        },
        {
          name: 'Content Uniqueness',
          score: 78,
          description: 'Measures originality compared to similar content',
          status: 'normal',
          suggestions: ['Add more unique insights in section 2']
        },
        {
          name: 'Narrative Flow',
          score: 85,
          description: 'Evaluates the storytelling quality and progression',
          status: 'success',
          suggestions: ['Improve the story arc in the middle section']
        }
      ]);
      
      // Set mock SEO metrics
      setSeoMetrics([
        {
          name: 'Keyword Optimization',
          score: 72,
          description: 'Measures effective use of target keywords',
          status: 'normal',
          suggestions: ['Increase keyword density in the introduction', 'Add more semantic variations of keywords']
        },
        {
          name: 'Meta Information',
          score: 65,
          description: 'Evaluates title, description, and heading structure',
          status: 'warning',
          suggestions: ['Add H2 and H3 headings to break up content', 'Optimize meta description']
        },
        {
          name: 'Internal Linking',
          score: 58,
          description: 'Measures effective use of internal links',
          status: 'warning',
          suggestions: ['Add 2-3 relevant internal links', 'Use descriptive anchor text']
        },
        {
          name: 'Content Length',
          score: 88,
          description: 'Evaluates if content length is appropriate for the topic',
          status: 'success',
          suggestions: []
        }
      ]);
      
      // Set mock readability metrics
      setReadabilityMetrics([
        {
          name: 'Reading Ease',
          score: 76,
          description: 'Measures how easy the content is to read',
          status: 'normal',
          suggestions: ['Simplify sentences in paragraph 5', 'Break up long paragraphs']
        },
        {
          name: 'Sentence Structure',
          score: 82,
          description: 'Evaluates sentence length and variety',
          status: 'success',
          suggestions: ['Add more sentence variety in section 2']
        },
        {
          name: 'Vocabulary Level',
          score: 79,
          description: 'Measures appropriateness of vocabulary for target audience',
          status: 'normal',
          suggestions: ['Replace technical terms with simpler alternatives where possible']
        },
        {
          name: 'Content Structure',
          score: 85,
          description: 'Evaluates logical organization and formatting',
          status: 'success',
          suggestions: ['Add more bullet points for key takeaways']
        }
      ]);
      
      // Set mock engagement metrics
      setEngagementMetrics([
        {
          name: 'Hook Strength',
          score: 68,
          description: 'Measures how effectively the content grabs attention',
          status: 'warning',
          suggestions: ['Make the introduction more compelling', 'Start with a surprising fact or question']
        },
        {
          name: 'Call to Action',
          score: 62,
          description: 'Evaluates effectiveness of calls to action',
          status: 'warning',
          suggestions: ['Add stronger call to action at the end', 'Include mid-content CTAs']
        },
        {
          name: 'Emotional Appeal',
          score: 75,
          description: 'Measures emotional connection with readers',
          status: 'normal',
          suggestions: ['Add more relatable examples', 'Use more emotionally resonant language']
        },
        {
          name: 'Visual Elements',
          score: 55,
          description: 'Evaluates use of visual elements to enhance engagement',
          status: 'error',
          suggestions: ['Add relevant images or infographics', 'Include data visualizations for statistics']
        }
      ]);
      
      // Compile improvement suggestions
      const allSuggestions = [
        ...qualityMetrics.flatMap(m => m.suggestions || []),
        ...seoMetrics.flatMap(m => m.suggestions || []),
        ...readabilityMetrics.flatMap(m => m.suggestions || []),
        ...engagementMetrics.flatMap(m => m.suggestions || [])
      ];
      
      // Prioritize suggestions based on metric scores
      const prioritizedSuggestions = [
        'Strengthen your introduction with a more compelling hook',
        'Add 2-3 relevant internal links with descriptive anchor text',
        'Include visual elements like images or infographics',
        'Add a stronger call to action at the end of your content',
        'Break up long paragraphs and add more H2/H3 headings',
        'Increase keyword density in the introduction',
        'Add more unique insights and original perspectives',
        'Improve transitions between sections for better flow'
      ];
      
      setImprovementSuggestions(prioritizedSuggestions);
    } catch (error) {
      console.error('Error analyzing content:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const sampleSections: ContentSection[] = [
          {
            id: '1',
            title: 'Introduction',
            content: 'Welcome to our comprehensive guide on content optimization. In this article, we will explore the key strategies for creating high-quality content that resonates with your audience and performs well in search engines. Content quality is a critical factor in determining the success of your digital marketing efforts.'
          },
          {
            id: '2',
            title: 'Understanding Content Quality',
            content: 'Content quality encompasses several dimensions including relevance, accuracy, comprehensiveness, and readability. High-quality content addresses the needs and questions of your target audience while providing unique insights and value. It is well-structured, easy to navigate, and free from grammatical errors.'
          },
          {
            id: '3',
            title: 'Conclusion',
            content: 'Improving your content quality is an ongoing process that requires attention to detail and a deep understanding of your audience. By implementing the strategies discussed in this article, you can create content that not only ranks well in search engines but also provides genuine value to your readers. Remember to regularly analyze and refine your content based on performance metrics and user feedback.'
          }
        ];
        
        // Combine all section content
        const combinedContent = sampleSections.map(section => 
          `${section.title}\n\n${section.content}`
        ).join('\n\n');
        
        setSections(sampleSections);
        setContent(combinedContent);
        setEditedContent(combinedContent);
        
        await analyzeContent(combinedContent, sampleSections);
      } catch (error) {
        console.error('Error loading content:', error);
      }
    };
    
    loadContent();
  }, [analyzeContent]);
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = async () => {
    setIsEditing(false);
    setContent(editedContent);
    
    // Re-analyze content after editing
    setIsAnalyzing(true);
    await analyzeContent(editedContent, sections);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
    setEditedContent(content);
  };
  
  const handleBackToPreview = () => {
    // In a real implementation, this would navigate back to the ContentPreview component
    router.back();
  };
  
  const handlePublish = () => {
    if (!session) {
      // Show sign-in prompt
      alert('Please sign in to publish content');
      return;
    }
    setIsPublishModalOpen(true);
  };
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#52c41a';
    if (score >= 70) return '#1890ff';
    if (score >= 60) return '#faad14';
    return '#f5222d';
  };
  
  const getScoreStatus = (score: number): 'success' | 'normal' | 'warning' | 'error' => {
    if (score >= 80) return 'success';
    if (score >= 70) return 'normal';
    if (score >= 60) return 'warning';
    return 'error';
  };
  
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackToPreview}
            className="flex items-center"
          >
            Back to Preview
          </Button>
          <Title level={3} className="m-0">Content Quality Assessment</Title>
        </div>
        <Button 
          type="primary" 
          icon={<RocketOutlined />}
          onClick={() => setIsPublishModalOpen(true)}
          className="relative bg-orange-500 text-white font-bold px-6 py-2 rounded-full shadow-md hover:bg-orange-600 active:scale-95 transition-all focus:outline-none"
          style={{
            boxShadow: "0px 4px 10px rgba(255, 102, 0, 0.5)",
          }}
        >
          Proceed to Publish
        </Button>

        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
          onPublish={async (platform: string, content: string) => {
            try {
              if (!session) {
                throw new Error('Please sign in to publish content');
              }

              const response = await fetch(`/api/posts/${platform}`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${session.accessToken}` 
                },
                body: JSON.stringify({ 
                  content,
                  platform,
                  metadata: {
                    qualityScore: overallScore,
                    seoScore: seoMetrics.reduce((acc, m) => acc + m.score, 0) / seoMetrics.length,
                    readabilityScore: readabilityMetrics.reduce((acc, m) => acc + m.score, 0) / readabilityMetrics.length
                  }
                })
              });
              
              if (!response.ok) {
                throw new Error('Failed to publish content');
              }
              
              setIsPublishModalOpen(false);
              // Show success message or redirect
              router.push('/dashboard');
            } catch (error) {
              console.error('Error publishing content:', error);
              throw error;
            }
          }}
          initialContent={isEditing ? editedContent : content}
        />
      </div>
      
      {isAnalyzing ? (
        <Card className="shadow-md text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <Title level={4}>Analyzing Content Quality</Title>
          <Text type="secondary">We&apos;re evaluating your content across multiple dimensions including SEO, readability, and engagement metrics.</Text>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md">
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab="Overview" key="overview">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <Title level={4} className="m-0">Overall Content Quality</Title>
                        <Text type="secondary">Based on analysis across multiple dimensions</Text>
                      </div>
                      <div className="text-center">
                        <Progress
                          type="circle"
                          percent={overallScore}
                          width={80}
                          strokeColor={getScoreColor(overallScore)}
                          format={percent => (
                            <span className="text-lg font-semibold">{percent}</span>
                          )}
                        />
                        <div className="mt-2">
                          <Tag color={getScoreStatus(overallScore)}>
                            {overallScore >= 80 ? 'Excellent' :
                             overallScore >= 70 ? 'Good' :
                             overallScore >= 60 ? 'Average' : 'Needs Improvement'}
                          </Tag>
                        </div>
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Content Quality Metrics */}
                      <div>
                        <Title level={5} className="mb-4">Content Quality</Title>
                        {qualityMetrics.map((metric, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <Text strong>{metric.name}</Text>
                              <Text
                                style={{ color: getScoreColor(metric.score) }}
                                strong
                              >
                                {metric.score}%
                              </Text>
                            </div>
                            <Progress
                              percent={metric.score}
                              status={metric.status}
                              size="small"
                              strokeColor={getScoreColor(metric.score)}
                            />
                            <Text type="secondary" className="text-xs">{metric.description}</Text>
                          </div>
                        ))}
                      </div>
                      
                      {/* SEO Metrics */}
                      <div>
                        <Title level={5} className="mb-4">SEO Optimization</Title>
                        {seoMetrics.map((metric, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <Text strong>{metric.name}</Text>
                              <Text
                                style={{ color: getScoreColor(metric.score) }}
                                strong
                              >
                                {metric.score}%
                              </Text>
                            </div>
                            <Progress
                              percent={metric.score}
                              status={metric.status}
                              size="small"
                              strokeColor={getScoreColor(metric.score)}
                            />
                            <Text type="secondary" className="text-xs">{metric.description}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <Divider />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Readability Metrics */}
                      <div>
                        <Title level={5} className="mb-4">Readability</Title>
                        {readabilityMetrics.map((metric, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <Text strong>{metric.name}</Text>
                              <Text
                                style={{ color: getScoreColor(metric.score) }}
                                strong
                              >
                                {metric.score}%
                              </Text>
                            </div>
                            <Progress
                              percent={metric.score}
                              status={metric.status === 'warning' ? 'exception' : metric.status}
                              size="small"
                              strokeColor={getScoreColor(metric.score)}
                            />
                            <Text type="secondary" className="text-xs">{metric.description}</Text>
                          </div>
                        ))}
                      </div>
                      
                      {/* Engagement Metrics */}
                      <div>
                        <Title level={5} className="mb-4">Engagement Potential</Title>
                        {engagementMetrics.map((metric, index) => (
                          <div key={index} className="mb-4">
                            <div className="flex justify-between items-center mb-1">
                              <Text strong>{metric.name}</Text>
                              <Text
                                style={{ color: getScoreColor(metric.score) }}
                                strong
                              >
                                {metric.score}%
                              </Text>
                            </div>
                            <Progress
                              percent={metric.score}
                              status={metric.status}
                              size="small"
                              strokeColor={getScoreColor(metric.score)}
                            />
                            <Text type="secondary" className="text-xs">{metric.description}</Text>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>
                
                <Tabs.TabPane tab="Content Editor" key="editor">
                  <div className="p-4">
                    <div className="flex justify-between items-center mb-4">
                      <Title level={4} className="m-0">Edit Content</Title>
                      <Space>
                        {isEditing ? (
                          <>
                            <Button onClick={handleCancel}>Cancel</Button>
                            <Button type="primary" icon={<SaveOutlined />} onClick={handleSave}>
                              Save Changes
                            </Button>
                          </>
                        ) : (
                          <Button type="primary" icon={<EditOutlined />} onClick={handleEdit}>
                            Edit Content
                          </Button>
                        )}
                      </Space>
                    </div>
                    
                    {isEditing ? (
                      <TextArea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={20}
                        className="mb-4"
                      />
                    ) : (
                      <div className="border rounded-md p-4 bg-gray-50 mb-4 whitespace-pre-wrap">
                        {content}
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Title level={5}>Section Metrics</Title>
                      <div className="space-y-4 mt-4">
                        {sections.map((section, index) => (
                          <Card key={index} size="small" className="shadow-sm">
                            <div className="flex justify-between items-start">
                              <div>
                                <Text strong>{section.title}</Text>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {section.metrics?.uniquenessScore && (
                                    <Tag color="blue">
                                      Uniqueness: {section.metrics.uniquenessScore}%
                                    </Tag>
                                  )}
                                  {section.metrics?.contextualScore && (
                                    <Tag color="green">
                                      Flow: {section.metrics.contextualScore}%
                                    </Tag>
                                  )}
                                  {section.metrics?.coherenceScore && (
                                    <Tag color="purple">
                                      Coherence: {section.metrics.coherenceScore}%
                                    </Tag>
                                  )}
                                </div>
                              </div>
                              <Button 
                                size="small" 
                                type="link" 
                                icon={<EditOutlined />}
                                onClick={() => {
                                  // Scroll to editor and focus on this section
                                  setActiveTab('editor');
                                  handleEdit();
                                }}
                              >
                                Edit
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </Tabs.TabPane>
                
                <Tabs.TabPane tab="Improvement Suggestions" key="suggestions">
                  <div className="p-4">
                    <Title level={4} className="mb-4">Prioritized Improvement Suggestions</Title>
                    <Alert
                      message="These suggestions are prioritized based on their potential impact on your content quality."
                      type="info"
                      showIcon
                      className="mb-6"
                    />
                    
                    <div className="space-y-4">
                      {improvementSuggestions.map((suggestion, index) => (
                        <Card 
                          key={index} 
                          className="shadow-sm hover:shadow-md transition-shadow"
                          actions={[
                            <Button 
                              key="apply" 
                              type="link" 
                              onClick={() => {
                                // Apply suggestion (in a real implementation)
                                setActiveTab('editor');
                                handleEdit();
                              }}
                            >
                              Apply Suggestion
                            </Button>
                          ]}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-1">
                              {index < 3 ? (
                                <RocketOutlined className="text-red-500 text-lg" />
                              ) : index < 6 ? (
                                <BulbOutlined className="text-yellow-500 text-lg" />
                              ) : (
                                <InfoCircleOutlined className="text-blue-500 text-lg" />
                              )}
                            </div>
                            <div>
                              <Text strong>{suggestion}</Text>
                              <div className="mt-1">
                                <Tag color={index < 3 ? 'red' : index < 6 ? 'orange' : 'blue'}>
                                  {index < 3 ? 'High Impact' : index < 6 ? 'Medium Impact' : 'Enhancement'}
                                </Tag>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                </Tabs.TabPane>
              </Tabs>
            </Card>
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-md">
              <Title level={4}>Content Summary</Title>
              <Divider />
              
              <div className="space-y-4">
                <div>
                  <Text type="secondary">Overall Quality Score</Text>
                  <div className="flex items-center mt-1">
                    <Progress 
                      percent={overallScore} 
                      size="small" 
                      status={getScoreStatus(overallScore)}
                      className="flex-1 mr-2" 
                    />
                    <Tag color={getScoreStatus(overallScore)}>{overallScore}%</Tag>
                  </div>
                </div>
                
                <div>
                  <Text type="secondary">Word Count</Text>
                  <div className="mt-1">
                    <Tag icon={<FileTextOutlined />} color="blue">
                      {content.split(/\s+/).length} words
                    </Tag>
                  </div>
                </div>
                
                <div>
                  <Text type="secondary">Sections</Text>
                  <div className="mt-1">
                    <Tag icon={<FileTextOutlined />} color="purple">
                      {sections.length} sections
                    </Tag>
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <Title level={5}>Areas to Improve</Title>
                  <div className="space-y-2 mt-2">
                    {[
                      ...seoMetrics,
                      ...readabilityMetrics,
                      ...engagementMetrics,
                      ...qualityMetrics
                    ]
                      .filter(metric => metric.score < 70)
                      .sort((a, b) => a.score - b.score)
                      .slice(0, 3)
                      .map((metric, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <Text className="flex items-center">
                            <WarningOutlined className="mr-2 text-yellow-500" />
                            {metric.name}
                          </Text>
                          <Tag color="orange">{metric.score}%</Tag>
                        </div>
                      ))}
                    
                    {[
                      ...seoMetrics,
                      ...readabilityMetrics,
                      ...engagementMetrics,
                      ...qualityMetrics
                    ].filter(metric => metric.score < 70).length === 0 && (
                      <div className="text-center py-2">
                        <CheckCircleOutlined className="text-green-500 text-xl mb-2" />
                        <Text>All metrics are above 70%!</Text>
                      </div>
                    )}
                  </div>
                </div>
                
                <Divider />
                
                <div>
                  <Title level={5}>Actions</Title>
                  <div className="space-y-3 mt-3">
                    <Button 
                      type="primary" 
                      icon={<EditOutlined />} 
                      block
                      onClick={() => {
                        setActiveTab('editor');
                        handleEdit();
                      }}
                    >
                      Edit Content
                    </Button>
                    
                    <Button 
                      icon={<LineChartOutlined />} 
                      block
                      onClick={() => setActiveTab('overview')}
                    >
                      View Detailed Metrics
                    </Button>
                    
                    <Button 
                      icon={<BulbOutlined />} 
                      block
                      onClick={() => setActiveTab('suggestions')}
                    >
                      View Improvement Suggestions
                    </Button>
                    
                    <Divider />
                    
                    <Button 
                      type="primary" 
                      icon={<RocketOutlined />} 
                      block
                      onClick={handlePublish}
                      className="bg-gradient-to-r from-blue-400 to-blue-600"
                    >
                      Proceed to Publish
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
            
            <Card className="shadow-md">
              <Title level={4}>Publishing Options</Title>
              <Divider />
              
              <div className="space-y-4">
                <div>
                  <Text strong>Schedule Publication</Text>
                  <div className="mt-2">
                    <Button block>Set Publication Date</Button>
                  </div>
                </div>
                
                <div>
                  <Text strong>Distribution Channels</Text>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <Text>Website</Text>
                      <Tag color="green">Ready</Tag>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text>Social Media</Text>
                      <Tag color="blue">Optional</Tag>
                    </div>
                    <div className="flex items-center justify-between">
                      <Text>Email Newsletter</Text>
                      <Tag color="blue">Optional</Tag>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );