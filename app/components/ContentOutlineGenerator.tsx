'use client';

import { useState, useEffect } from 'react';
import { Card, Button, Modal, Input, List, Tag, Tooltip, Space, Typography, Collapse, Tabs, Select, Alert, Progress } from 'antd';
import ContentPersonalizationForm, { ContentPersonalizationPreferences } from './ContentPersonalizationForm';
import { PlusOutlined, EditOutlined, DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, SearchOutlined, LineChartOutlined, QuestionOutlined, FireOutlined, BulbOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';

export type OutlineSection = {
  id: string;
  title: string;
  keywords: string[];
  estimatedWordCount: number;
  searchMetrics?: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  relatedQuestions?: string[];
  keyPoints?: string[];
  sectionType: string;
  optimizationScore: number;
  content?: string;
  uniquenessScore?: number;
  contextualScore?: number;
};

type ContentOutlineGeneratorProps = {
  selectedTitle?: string | null;
  selectedQuery?: string | null;
  gscInsights: any[];
  onOutlineGenerated: (outline: OutlineSection[], personalizationPreferences?: ContentPersonalizationPreferences) => void;
};

type KeywordSuggestion = {
  keyword: string;
  searchVolume?: number;
  competition?: number;
  relevance: number;
};

type RelatedQuestion = {
  question: string;
  answer?: string;
};

export default function ContentOutlineGenerator({
  selectedTitle,
  selectedQuery,
  gscInsights,
  onOutlineGenerated
}: ContentOutlineGeneratorProps) {
  const [outline, setOutline] = useState<OutlineSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editModal, setEditModal] = useState({
    visible: false,
    section: null as OutlineSection | null
  });
  const [keywordSuggestions, setKeywordSuggestions] = useState<KeywordSuggestion[]>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<RelatedQuestion[]>([]);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [activeTab, setActiveTab] = useState('section');
  const [outlineScore, setOutlineScore] = useState(0);
  const [personalizationPreferences, setPersonalizationPreferences] = useState<ContentPersonalizationPreferences | null>(null);
  const [showPersonalizationForm, setShowPersonalizationForm] = useState(false);

  useEffect(() => {
    if (selectedTitle || selectedQuery) {
      generateInitialOutline();
    }
  }, [selectedTitle, selectedQuery]);

  useEffect(() => {
    // Calculate overall outline score based on section optimization scores
    if (outline.length > 0) {
      const totalScore = outline.reduce((sum, section) => {
        return sum + (section.optimizationScore || 0);
      }, 0);
      setOutlineScore(Math.round(totalScore / outline.length));
    } else {
      setOutlineScore(0);
    }
  }, [outline]);

  const generateInitialOutline = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/suggestions/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTitle,
          query: selectedQuery,
          gscInsights,
          outlineStructure: {
            requireIntroduction: true,
            requireConclusion: true,
            minBodySections: 4,
            maxBodySections: 7,
            includeKeyPoints: true,
            includeRelatedQuestions: true,
            sectionTypes: ['introduction', 'body', 'case_study', 'faq', 'conclusion']
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate outline');
      }

      const data = await response.json();
      
      if (!data.sections || !Array.isArray(data.sections)) {
        console.error('Invalid outline data structure:', data);
        throw new Error('Invalid outline data received');
      }

      // Add optimization scores to each section
      const sectionsWithScores = data.sections.map((section: OutlineSection) => ({
        ...section,
        optimizationScore: calculateSectionScore(section)
      }));

      setOutline(sectionsWithScores);
      onOutlineGenerated(sectionsWithScores, personalizationPreferences || undefined);
    } catch (error) {
      console.error('Error generating outline:', error);
      // Create default sections if API call fails
      const defaultSections = [
        {
          id: Date.now().toString() + '-intro',
          title: 'Introduction',
          keywords: selectedTitle ? selectedTitle.split(' ').filter(w => w.length > 3) : [],
          estimatedWordCount: 300,
          sectionType: 'introduction',
          optimizationScore: 70
        },
        {
          id: Date.now().toString() + '-body1',
          title: 'Key Concepts and Definitions',
          keywords: [],
          estimatedWordCount: 500,
          sectionType: 'body',
          optimizationScore: 60
        },
        {
          id: Date.now().toString() + '-body2',
          title: 'Main Benefits and Applications',
          keywords: [],
          estimatedWordCount: 600,
          sectionType: 'body',
          optimizationScore: 60
        },
        {
          id: Date.now().toString() + '-body3',
          title: 'Best Practices and Implementation',
          keywords: [],
          estimatedWordCount: 700,
          sectionType: 'body',
          optimizationScore: 60
        },
        {
          id: Date.now().toString() + '-conclusion',
          title: 'Conclusion',
          keywords: [],
          estimatedWordCount: 250,
          sectionType: 'conclusion',
          optimizationScore: 65
        }
      ];
      setOutline(defaultSections as OutlineSection[]);
      onOutlineGenerated(defaultSections as OutlineSection[]);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculateSectionScore = (section: OutlineSection): number => {
    let score = 50; // Base score
    
    // Add points for having keywords
    if (section.keywords && section.keywords.length > 0) {
      score += Math.min(section.keywords.length * 5, 20);
    }
    
    // Add points for search metrics if available
    if (section.searchMetrics) {
      // Higher clicks and impressions increase score
      if (section.searchMetrics.clicks > 0) {
        score += Math.min(section.searchMetrics.clicks, 10);
      }
      // Better position (lower number) increases score
      if (section.searchMetrics.position < 10) {
        score += 10 - Math.floor(section.searchMetrics.position);
      }
    }
    
    // Add points for having related questions
    if (section.relatedQuestions && section.relatedQuestions.length > 0) {
      score += Math.min(section.relatedQuestions.length * 3, 10);
    }
    
    // Cap the score at 100
    return Math.min(score, 100);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === outline.length - 1)
    ) {
      return; // Can't move further in this direction
    }

    const items = Array.from(outline);
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap the items
    [items[index], items[newIndex]] = [items[newIndex], items[index]];

    setOutline(items);
    onOutlineGenerated(items);
  };

  const handleEditSection = (section: OutlineSection) => {
    setEditModal({
      visible: true,
      section: { ...section }
    });
    
    // Load keyword suggestions when editing a section
    fetchKeywordSuggestions(section.title);
    
    // Load related questions
    fetchRelatedQuestions(section.title);
    
    setActiveTab('section');
  };

  const fetchKeywordSuggestions = async (sectionTitle: string) => {
    setIsLoadingKeywords(true);
    try {
      // Simulate API call for keyword suggestions
      // In a real implementation, this would call an actual API endpoint
      setTimeout(() => {
        const baseKeywords = sectionTitle.toLowerCase().split(' ');
        const suggestions: KeywordSuggestion[] = [
          ...baseKeywords.map(word => ({
            keyword: word,
            searchVolume: Math.floor(Math.random() * 1000) + 100,
            competition: Math.random(),
            relevance: Math.random() * 0.5 + 0.5
          })),
          {
            keyword: `${baseKeywords[0]} guide`,
            searchVolume: Math.floor(Math.random() * 2000) + 500,
            competition: Math.random() * 0.7,
            relevance: 0.9
          },
          {
            keyword: `best ${baseKeywords[0]}`,
            searchVolume: Math.floor(Math.random() * 3000) + 1000,
            competition: Math.random() * 0.8 + 0.2,
            relevance: 0.85
          },
          {
            keyword: `${baseKeywords[0]} tips`,
            searchVolume: Math.floor(Math.random() * 1500) + 300,
            competition: Math.random() * 0.6,
            relevance: 0.75
          },
          {
            keyword: `${baseKeywords[0]} examples`,
            searchVolume: Math.floor(Math.random() * 1200) + 200,
            competition: Math.random() * 0.5,
            relevance: 0.8
          }
        ];
        
        setKeywordSuggestions(suggestions);
        setIsLoadingKeywords(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching keyword suggestions:', error);
      setIsLoadingKeywords(false);
    }
  };

  const fetchRelatedQuestions = async (sectionTitle: string) => {
    try {
      // Simulate API call for related questions
      // In a real implementation, this would call an actual API endpoint
      setTimeout(() => {
        const baseQuestion = sectionTitle.toLowerCase();
        const questions: RelatedQuestion[] = [
          {
            question: `What is ${baseQuestion}?`,
            answer: ''
          },
          {
            question: `How does ${baseQuestion} work?`,
            answer: ''
          },
          {
            question: `Why is ${baseQuestion} important?`,
            answer: ''
          },
          {
            question: `What are the benefits of ${baseQuestion}?`,
            answer: ''
          },
          {
            question: `What are common problems with ${baseQuestion}?`,
            answer: ''
          }
        ];
        
        setRelatedQuestions(questions);
      }, 800);
    } catch (error) {
      console.error('Error fetching related questions:', error);
    }
  };

  const handleSaveSection = (editedSection: OutlineSection) => {
    // Recalculate optimization score for the edited section
    const sectionWithScore = {
      ...editedSection,
      optimizationScore: calculateSectionScore(editedSection)
    };
    
    const updatedOutline = outline.map(section =>
      section.id === sectionWithScore.id ? sectionWithScore : section
    );
    
    setOutline(updatedOutline);
    onOutlineGenerated(updatedOutline);
    setEditModal({ visible: false, section: null });
  };

  const handleDeleteSection = (sectionId: string) => {
    const updatedOutline = outline.filter(section => section.id !== sectionId);
    setOutline(updatedOutline);
    onOutlineGenerated(updatedOutline);
  };

  const handleAddSection = () => {
    const newSection: OutlineSection = {
      id: Date.now().toString(),
      title: 'New Section',
      keywords: [],
      estimatedWordCount: 300,
      optimizationScore: 50 // Default score for new sections
    };
    setOutline([...outline, newSection]);
    handleEditSection(newSection);
  };

  const handleAddKeywordToSection = (keyword: string) => {
    if (!editModal.section) return;
    
    // Only add the keyword if it's not already in the list
    if (!editModal.section.keywords.includes(keyword)) {
      const updatedSection = {
        ...editModal.section,
        keywords: [...editModal.section.keywords, keyword]
      };
      
      setEditModal({
        ...editModal,
        section: updatedSection
      });
    }
  };

  const handleAddQuestionToSection = (question: string) => {
    if (!editModal.section) return;
    
    // Initialize relatedQuestions array if it doesn't exist
    const currentQuestions = editModal.section.relatedQuestions || [];
    
    // Only add the question if it's not already in the list
    if (!currentQuestions.includes(question)) {
      const updatedSection = {
        ...editModal.section,
        relatedQuestions: [...currentQuestions, question]
      };
      
      setEditModal({
        ...editModal,
        section: updatedSection
      });
    }
  };

  const handlePersonalizationPreferencesChange = (preferences: ContentPersonalizationPreferences) => {
    setPersonalizationPreferences(preferences);
  };

  const handleSavePersonalizationPreferences = (preferences: ContentPersonalizationPreferences) => {
    setPersonalizationPreferences(preferences);
    setShowPersonalizationForm(false);
    // Re-generate with new preferences if outline already exists
    if (outline.length > 0) {
      onOutlineGenerated(outline, preferences);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Typography.Title level={2}>Finalize Your Content Outline</Typography.Title>
          <Button 
            type="primary" 
            onClick={() => setShowPersonalizationForm(true)}
            className="ml-2"
          >
            Personalize Content
          </Button>
          {outlineScore > 0 && (
            <Tooltip title="Overall optimization score based on keywords, search metrics, and content structure">
              <div className="flex items-center space-x-2">
                <Progress
                  type="circle"
                  percent={outlineScore}
                  size={40}
                  strokeColor={{
                    '0%': '#108ee9',
                    '100%': '#87d068',
                  }}
                />
                <span className="text-sm text-gray-600">Optimization Score</span>
              </div>
            </Tooltip>
          )}
        </div>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddSection}
          >
            Add Section
          </Button>
          <Button
            onClick={generateInitialOutline}
            icon={<SearchOutlined />}
            loading={isGenerating}
          >
            Regenerate Outline
          </Button>
        </Space>
      </div>

      {outline.length === 0 && !isGenerating && (
        <Alert
          message="No outline sections yet"
          description="Click 'Regenerate Outline' to create sections based on your selected title or query, or add sections manually."
          type="info"
          showIcon
        />
      )}

      {isGenerating && (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <Progress type="circle" percent={Math.floor(Math.random() * 100)} />
          <Typography.Text className="text-gray-600">Analyzing search data and generating optimized outline...</Typography.Text>
        </div>
      )}

      <div className="space-y-4">
        {outline.map((section, index) => {
          const sectionTypeIcon = getSectionTypeIcon(section.sectionType || 'body');
          const borderColorClass = getSectionBorderColor(section.sectionType || 'body');
          const indentLevel = getSectionIndentLevel(section.sectionType || 'body');

          return (
            <div key={section.id} className="relative">
              {index > 0 && (
                <div className="absolute -top-4 left-8 w-0.5 h-4 bg-gray-300" />
              )}
              <div
                className={`section-container p-4 rounded-lg border-l-4 ${borderColorClass} bg-gradient-to-r from-blue-50 to-white transition-all duration-300 hover:shadow-lg`}
                style={{ marginLeft: `${indentLevel * 20}px` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl transform scale-125" role="img" aria-label={section.sectionType}>
                      {sectionTypeIcon}
                    </span>
                    <Typography.Title
                      level={getSectionHeadingLevel(section.sectionType || 'body')}
                      className="m-0"
                    >
                      {section.title}
                    </Typography.Title>
                  </div>
                  <div className="flex space-x-3 bg-white/80 px-3 py-1.5 rounded-lg shadow-sm">
                    <Tooltip title="Move up">
                      <Button
                        type="text"
                        icon={<ArrowUpOutlined className="text-lg" />}
                        onClick={() => handleMoveSection(index, 'up')}
                        disabled={index === 0}
                        size="small"
                        className="hover:bg-blue-50"
                      />
                    </Tooltip>
                    <Tooltip title="Move down">
                      <Button
                        type="text"
                        icon={<ArrowDownOutlined className="text-lg" />}
                        onClick={() => handleMoveSection(index, 'down')}
                        disabled={index === outline.length - 1}
                        size="small"
                        className="hover:bg-blue-50"
                      />
                    </Tooltip>
                    <Tooltip title="Edit section">
                      <Button
                        type="text"
                        icon={<EditOutlined className="text-lg" />}
                        onClick={() => handleEditSection(section)}
                        size="small"
                        className="hover:bg-blue-50"
                      />
                    </Tooltip>
                    <Tooltip title="Delete section">
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined className="text-lg" />}
                        onClick={() => handleDeleteSection(section.id)}
                        size="small"
                        className="hover:bg-red-50"
                      />
                    </Tooltip>
                  </div>
                </div>

                <div className="mt-4 ml-12">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-gray-600 text-sm">Keywords:</span>
                    {section.keywords.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {section.keywords.map((keyword, i) => (
                          <Tag key={i} color="blue">{keyword}</Tag>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm italic">No keywords added</span>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <span className="text-gray-600 text-sm">Word count:</span>
                      <span className="text-gray-800">{section.estimatedWordCount}</span>
                    </div>

                    {section.optimizationScore !== undefined && (
                      <Tooltip title="Section optimization score based on keywords and content structure">
                        <div className="flex items-center space-x-1">
                          <Progress
                            type="circle"
                            percent={section.optimizationScore}
                            size={24}
                            strokeWidth={10}
                            strokeColor={{
                              '0%': '#ff4d4f',
                              '50%': '#faad14',
                              '100%': '#52c41a',
                            }}
                          />
                          <span className="text-xs text-gray-500">{section.optimizationScore}%</span>
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <Modal
        title="Edit Section"
        open={editModal.visible}
        onCancel={() => setEditModal({ visible: false, section: null })}
        footer={[
          <Button key="cancel" onClick={() => setEditModal({ visible: false, section: null })}>
            Cancel
          </Button>,
          <Button
            key="save"
            type="primary"
            onClick={() => editModal.section && handleSaveSection(editModal.section)}
          >
            Save
          </Button>
        ]}
        width={700}
      >
        {editModal.section && (
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'section',
                label: 'Section Details',
                children: (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Title
                      </label>
                      <Input
                        value={editModal.section.title}
                        onChange={(e) => setEditModal({
                          ...editModal,
                          section: { ...editModal.section!, title: e.target.value }
                        })}
                        placeholder="Enter section title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Word Count
                      </label>
                      <Input
                        type="number"
                        value={editModal.section.estimatedWordCount}
                        onChange={(e) => setEditModal({
                          ...editModal,
                          section: { ...editModal.section!, estimatedWordCount: parseInt(e.target.value) || 0 }
                        })}
                        placeholder="Enter estimated word count"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Section Type
                      </label>
                      <Select
                        value={editModal.section.sectionType}
                        onChange={(value) => setEditModal({
                          ...editModal,
                          section: { ...editModal.section!, sectionType: value }
                        })}
                        style={{ width: '100%' }}
                        placeholder="Select section type"
                      >
                        <Select.Option value="introduction">Introduction</Select.Option>
                        <Select.Option value="body">Body</Select.Option>
                        <Select.Option value="conclusion">Conclusion</Select.Option>
                        <Select.Option value="faq">FAQ</Select.Option>
                        <Select.Option value="case_study">Case Study</Select.Option>
                      </Select>
                    </div>
                  </div>
                )
              },
              {
                key: 'keywords',
                label: 'Keyword Suggestions',
                children: (
                  <div className="space-y-4">
                    <Alert
                      message="Keyword Suggestions"
                      description="Click on any keyword to add it to your section."
                      type="info"
                      showIcon
                    />
                    
                    {isLoadingKeywords ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                      </div>
                    ) : (
                      <List
                        dataSource={keywordSuggestions}
                        renderItem={(item) => (
                          <List.Item
                            actions={[
                              <Button 
                                key="add" 
                                type="link" 
                                onClick={() => handleAddKeywordToSection(item.keyword)}
                                disabled={editModal.section?.keywords.includes(item.keyword)}
                              >
                                {editModal.section?.keywords.includes(item.keyword) ? 'Added' : 'Add'}
                              </Button>
                            ]}
                          >
                            <List.Item.Meta
                              title={item.keyword}
                              description={
                                <div className="flex items-center space-x-4">
                                  {item.searchVolume && (
                                    <span className="text-xs text-gray-500">
                                      <LineChartOutlined /> {item.searchVolume} searches/mo
                                    </span>
                                  )}
                                  {item.competition !== undefined && (
                                    <span className="text-xs text-gray-500">
                                      <FireOutlined /> {Math.round(item.competition * 100)}% competition
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500">
                                    <CheckCircleOutlined /> {Math.round(item.relevance * 100)}% relevant
                                  </span>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    )}
                  </div>
                )
              },
              {
                key: 'questions',
                label: 'Related Questions',
                children: (
                  <div className="space-y-4">
                    <Alert
                      message="Related Questions"
                      description="Click on any question to add it to your section."
                      type="info"
                      showIcon
                    />
                    
                    <List
                      dataSource={relatedQuestions}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button 
                              key="add" 
                              type="link" 
                              onClick={() => handleAddQuestionToSection(item.question)}
                              disabled={editModal.section?.relatedQuestions?.includes(item.question)}
                            >
                              {editModal.section?.relatedQuestions?.includes(item.question) ? 'Added' : 'Add'}
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={item.question}
                            description={item.answer || <span className="text-gray-400 italic">No answer provided</span>}
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                )
              }
            ]}
          />
        )}
      </Modal>

      {/* Content Personalization Modal */}
      <Modal
        title="Content Personalization"
        open={showPersonalizationForm}
        onCancel={() => setShowPersonalizationForm(false)}
        footer={null}
        width={700}
      >
        <ContentPersonalizationForm
          onPreferencesChange={handlePersonalizationPreferencesChange}
          initialPreferences={personalizationPreferences || undefined}
          onSave={handleSavePersonalizationPreferences}
        />
      </Modal>
    </div>
  );
}

function getSectionTypeIcon(sectionType: string): string {
  switch (sectionType) {
    case 'introduction':
      return '📝';
    case 'conclusion':
      return '🎯';
    case 'body':
      return '📄';
    case 'faq':
      return '❓';
    case 'case_study':
      return '📊';
    default:
      return '📑';
  }
}

function getSectionBorderColor(sectionType: string): string {
  switch (sectionType) {
    case 'introduction':
      return 'border-blue-500';
    case 'conclusion':
      return 'border-green-500';
    case 'body':
      return 'border-purple-500';
    case 'faq':
      return 'border-orange-500';
    case 'case_study':
      return 'border-yellow-500';
    default:
      return 'border-gray-500';
  }
}

function getSectionIndentLevel(sectionType: string): number {
  switch (sectionType) {
    case 'introduction':
    case 'conclusion':
      return 0;
    case 'body':
      return 1;
    case 'faq':
    case 'case_study':
      return 2;
    default:
      return 0;
  }
}

function getSectionHeadingLevel(sectionType: string): 1 | 2 | 3 | 4 | 5 {
  switch (sectionType) {
    case 'introduction':
      return 1;
    case 'conclusion':
      return 2;
    case 'faq':
      return 3;
    default:
      return 3;
  }
}