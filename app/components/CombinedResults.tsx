'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Spin,
  Alert,
  message,
  Progress,
  Button,
  Collapse,
  List,
  Modal,
  Badge,
  Tooltip,
  Typography
} from 'antd';
import {
  FileTextOutlined,
  SearchOutlined,
  LinkOutlined,
  LineChartOutlined,
  QuestionCircleOutlined,
  ClockCircleOutlined,
  RobotOutlined,
  ArrowDownOutlined
} from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';

// Child components (placeholders or actual imports)
import ArticleSummarizer from './ArticleSummarizer';
import ArticlePreview from './ArticlePreview';
import ContentOutlineGenerator, { OutlineSection } from './ContentOutlineGenerator';
import ContentPreview from './ContentPreview';
import SearchInsights from './search/SearchInsights';
import GSCData from './search/GSCData';
import FAQSection from './search/FAQSection';
import RelatedSearches from './search/RelatedSearches';
import CompetitorInsights from './search/CompetitorInsights';
import LoadingState from './LoadingState';
import SearchResults from './search/SearchResults';
import RelatedQuestions from './search/RelatedQuestions';

const { Text } = Typography;

type CombinedResultsProps = {
  query: string | null;
  onBack: () => void;
};

type CombinedInsights = {
  query: string;
  gsc_data: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
    pages: Array<{
      page: string;
      clicks: number;
      impressions: number;
      position: number;
    }>;
  };
  serp_data: {
    organic_results: Array<{
      position: number;
      title: string;
      link: string;
      snippet: string;
      displayed_link: string;
    }>;
    related_searches: Array<
      | string
      | {
          query: string;
          items?: Array<string | { query: string }>;
          type?: 'search';
        }
    >;
    related_questions: Array<{
      question: string;
      snippet: string;
    }>;
    total_results: number;
  };
  insights: {
    ranking_gap: {
      gsc_position: number;
      serp_positions: number[];
      position_difference: number;
    };
    content_opportunities: Array<{
      type: string;
      source_url: string;
      title: string;
      snippet: string;
      searchIntent?: 'informational' | 'commercial' | 'transactional';
      metrics?: {
        searchVolume: number;
        competition: number;
        opportunityScore: number;
      };
      keywords?: string[];
    }>;
    competitor_analysis: Array<{
      url: string;
      title: string;
      position: number;
      snippet: string;
    }>;
  };
  faqs?: Array<{
    question: string;
    answer?: string;
  }>;
};

export default function CombinedResults({ query, onBack }: CombinedResultsProps) {
  const [activePanel, setActivePanel] = useState<'search' | 'content'>('search');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CombinedInsights | null>(null);

  useEffect(() => {
    const initializeData = async () => {
      if (!query) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/insights/combined?q=${encodeURIComponent(query)}`);
        if (!response.ok) throw new Error('Failed to fetch insights');
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load insights');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeData();
  }, [query]);

  // For simulating a progress bar or messages
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingProgress, setLoadingProgress] = useState(0);

  // For outlines and content generation
  const [generatedOutline, setGeneratedOutline] = useState<OutlineSection[]>([]);
  const [showContentPreview, setShowContentPreview] = useState(false);

  // Outline modal
  const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false);
  const [isOutlineModalOpen2, setIsOutlineModalOpen2] = useState(false);

  const handleOutlineCreate = () => {
    setIsOutlineModalOpen2(true);
  };

  const handleGenerateContent = useCallback(() => {
    if (generatedOutline.length === 0) {
      message.error('Please generate an outline first');
      return;
    }

    // Close outline modals
    setIsOutlineModalOpen(false);
    setIsOutlineModalOpen2(false);
    
    // Show content preview and hide search results
    setShowContentPreview(true);
    setActivePanel('content');
  }, [generatedOutline]);

  // Render main content based on current state
  const renderMainContent = () => {
    if (showContentPreview && generatedOutline.length > 0) {
      const transformedOutline = generatedOutline.map((section, index) => ({
        id: section.id || `section-${index}`,
        title: section.title,
        keywords: section.keywords || [],
        estimatedWordCount: section.estimatedWordCount || 500,
        sectionType: section.type || 'content',
        optimizationScore: section.optimizationScore || 85,
        content: section.content || ''
      }));
  
      return (
        <div className="content-preview-container w-full h-full">
          <div className="flex items-center mb-4">
            <Button 
              onClick={() => {
                setShowContentPreview(false);
                setActivePanel('search');
              }}
              icon={<ArrowDownOutlined />}
              className="mr-2"
            >
              Back to Search
            </Button>
          </div>
          <ContentPreview
            outline={transformedOutline}
            onContentUpdate={async (sectionId: string, newContent: string) => {
              const updatedOutline = generatedOutline.map(section =>
                section.id === sectionId ? { ...section, content: newContent } : section
              );
              setGeneratedOutline(updatedOutline);
            }}
            onGenerateContent={async (sectionId: string, context: any) => {
              try {
                const response = await fetch('/api/content/generate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ sectionId, context })
                });
                if (!response.ok) throw new Error('Failed to generate content');
                const data = await response.json();
                return data.content;
              } catch (error) {
                console.error('Error generating content:', error);
                message.error('Failed to generate content');
                throw error;
              }
            }}
          />
        </div>
      );
    }
  
    // Only render search results when not showing content preview
    return (
      <div className="space-y-4">
        {activePanel === 'search' && data && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-4">
                <SearchResults
                  organicResults={data.serp_data.organic_results}
                  totalResults={data.serp_data.total_results}
                />
                <FAQSection
                  relatedQuestions={data.serp_data.related_questions}
                />
                <RelatedSearches
                  searches={data.serp_data.related_searches}
                />
              </div>
              <div className="space-y-4">
                <SearchInsights
                  gscData={data.gsc_data}
                  rankingGap={data.insights.ranking_gap}
                />
                <CompetitorInsights
                  contentOpportunities={data.insights.content_opportunities}
                  competitorAnalysis={data.insights.competitor_analysis}
                />
              </div>
            </div>
          </>
        )}
      </div>
    );
  };


  // Once we have an outline from Outline Generator
  const handleOutlineGenerated = useCallback((outline: OutlineSection[]) => {
    setGeneratedOutline(outline);
    // Keep modal open until user explicitly closes it
  }, []);

  // Summaries
  const [selectedArticle, setSelectedArticle] = useState<{
    title: string;
    summary: string;
  } | null>(null);

  // Summarizing states
  const [isSummarizing, setIsSummarizing] = useState<Record<string, boolean>>({});
  
  // Summary progress tracking
  const [summaryProgress, setSummaryProgress] = useState<Record<string, number>>({});
  const [summaryStage, setSummaryStage] = useState<Record<string, string>>({});
  
  // Cache for summarized articles
  const [summaryCache, setSummaryCache] = useState<Record<string, { title: string; summary: string }>>({});

  // Handle article summarization
  const handleSummarize = useCallback(async (url: string, title: string) => {
    if (isSummarizing[url]) return;
    
    // Check if we already have the summary in cache
    if (summaryCache[url]) {
      setSelectedArticle(summaryCache[url]);
      return;
    }

    try {
      setIsSummarizing((prev) => ({ ...prev, [url]: true }));
      setSummaryProgress((prev) => ({ ...prev, [url]: 10 }));
      setSummaryStage((prev) => ({ ...prev, [url]: 'Fetching URL content...' }));

      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      setSummaryProgress((prev) => ({ ...prev, [url]: 50 }));
      setSummaryStage((prev) => ({ ...prev, [url]: 'Summarizing with AI...' }));

      if (!response.ok) {
        throw new Error('Failed to summarize article');
      }

      const data = await response.json();
      setSummaryProgress((prev) => ({ ...prev, [url]: 100 }));
      setSummaryStage((prev) => ({ ...prev, [url]: 'Complete!' }));
      
      // Store in cache
      const articleData = { title, summary: data.summary };
      setSummaryCache((prev) => ({ ...prev, [url]: articleData }));
      setSelectedArticle(articleData);
    } catch (error) {
      console.error('Error summarizing article:', error);
      message.error('Failed to summarize article');
      setSummaryProgress((prev) => ({ ...prev, [url]: 0 }));
      setSummaryStage((prev) => ({ ...prev, [url]: '' }));
    } finally {
      // Clear progress after a short delay
      setTimeout(() => {
        setSummaryProgress((prev) => ({ ...prev, [url]: 0 }));
        setSummaryStage((prev) => ({ ...prev, [url]: '' }));
      }, 1000);
      setIsSummarizing((prev) => ({ ...prev, [url]: false }));
    }
  }, [isSummarizing, summaryCache]);

  // --- UTILS: Generate FAQs from related questions or searches
  const generateFAQs = useCallback(
    async (
      relatedQuestions: Array<{ question: string; snippet?: string }>,
      relatedSearches: Array<string | { query: string }>,
      userQuery: string
    ) => {
      try {
        // If we have related questions, try generating from them
        if (relatedQuestions && relatedQuestions.length > 0) {
          const response = await fetch('/api/generate-faqs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              relatedQuestions,
              query: userQuery
            })
          });

          if (!response.ok) {
            console.warn('Failed to generate FAQs from related questions, falling back to searches');
          } else {
            const generatedFaqs = await response.json();
            return generatedFaqs.slice(0, 5); // Limit to 5
          }
        }

        // Otherwise, try from related searches
        if (relatedSearches && relatedSearches.length > 0) {
          // Extract queries
          const searchQueries = relatedSearches
            .map((item) => {
              if (typeof item === 'string') {
                return item;
              } else if ('query' in item) {
                return item.query;
              }
              return null;
            })
            .filter((q): q is string => !!q);

          if (searchQueries.length === 0) return [];

          const response = await fetch('/api/generate-faqs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              relatedSearches: searchQueries,
              query: userQuery,
              generateFromSearches: true
            })
          });

          if (!response.ok) {
            console.warn('Failed to generate FAQs from related searches');
            return [];
          }

          const generatedFaqs = await response.json();
          return generatedFaqs.slice(0, 5);
        }

        // If no fallback
        return [];
      } catch (error) {
        console.error('Error generating FAQs:', error);
        return [];
      }
    },
    []
  );


  // FETCH Combined Insights
  useEffect(() => {
    let isSubscribed = true;

    const fetchCombinedInsights = async () => {
      if (!query) return;

      setIsLoading(true);
      setError(null);
      setLoadingProgress(0);
      setLoadingMessage('Initializing search...');
      let updateProgress: NodeJS.Timeout | null = null;

      try {
        updateProgress = setInterval(() => {
          if (!isSubscribed) {
            if (updateProgress) clearInterval(updateProgress);
            return;
          }
          setLoadingProgress((prev) => {
            if (prev >= 90) return prev;

            const increment = Math.floor(Math.random() * 15) + 5;
            const newProgress = Math.min(90, prev + increment);

            if (newProgress < 30) {
              setLoadingMessage('Fetching search data...');
            } else if (newProgress < 60) {
              setLoadingMessage('Analyzing results...');
            } else {
              setLoadingMessage('Preparing insights...');
            }

            return newProgress;
          });
        }, 800);

        const response = await fetch(`/api/insights/combined?q=${encodeURIComponent(query)}`, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });

        let errorData;
        if (!response.ok) {
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = { error: response.statusText || 'Unknown error' };
          }

          if (response.status === 429) {
            const retryAfter = errorData.retryAfter || 60;
            setError(`Rate limit exceeded. Retrying automatically in ${retryAfter} seconds...`);
            setLoadingMessage(`Waiting for rate limit to reset (${retryAfter}s)`);
            setLoadingProgress(0);
            
            // Set up a countdown timer with progress bar
            let countdown = retryAfter;
            const totalTime = retryAfter;
            const countdownInterval = setInterval(() => {
              countdown -= 1;
              // Update progress bar to show countdown progress
              const progressPercent = Math.round(((totalTime - countdown) / totalTime) * 100);
              setLoadingProgress(progressPercent);
              
              if (countdown <= 0) {
                clearInterval(countdownInterval);
                // Auto-retry when countdown reaches zero
                if (isSubscribed) {
                  setError(null);
                  setLoadingMessage('Retrying request...');
                  fetchCombinedInsights();
                }
              } else {
                setError(`Rate limit exceeded. Retrying automatically in ${countdown} seconds...`);
                setLoadingMessage(`Waiting for rate limit to reset (${countdown}s)`);
              }
            }, 1000);
            
            return; // Exit the function without throwing an error
          } else if (response.status === 503) {
            throw new Error('External service is temporarily unavailable. Please try again later');
          } else if (response.status === 401) {
            throw new Error('Authentication failed. Please sign in again.');
          }
          throw new Error(errorData.error || `Failed to fetch insights: ${response.status}`);
        }

        const combinedData = await response.json();
        if (!combinedData || typeof combinedData !== 'object') {
          throw new Error('Invalid response format from server');
        }

        if (!isSubscribed) return;

        // Generate FAQs after fetching combined data
        const faqs = await generateFAQs(
          combinedData?.serp_data?.related_questions || [],
          combinedData?.serp_data?.related_searches || [],
          query
        );

        if (!isSubscribed) return;

        setData({ ...combinedData, faqs });
        setLoadingProgress(100);
        setLoadingMessage('Complete!');
      } catch (err) {
        if (!isSubscribed) return;
        console.error('Error fetching combined insights:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        if (!isSubscribed) return;
        if (updateProgress) clearInterval(updateProgress);
        setIsLoading(false);
        setTimeout(() => {
          setLoadingProgress(0);
          setLoadingMessage('');
        }, 500);
      }
    };

    fetchCombinedInsights();

    return () => {
      isSubscribed = false;
    };
  }, [query, generateFAQs]);



  // Update content in outline
  const handleContentUpdate = useCallback(async (sectionId: string, newContent: string) => {
    setGeneratedOutline((prevOutline) =>
      prevOutline.map((section) =>
        section.id === sectionId ? { ...section, content: newContent } : section
      )
    );
    return Promise.resolve();
  }, []);

  // Generate content for a single section
  const handleContentGenerate = useCallback(
    async (sectionId: string, context: any) => {
      try {
        const response = await fetch('/api/content/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...context,
            estimatedWordCount: generatedOutline.find((sec) => sec.id === sectionId)?.estimatedWordCount,
            provider: (process.env.DEFAULT_AI_PROVIDER || 'gemini') as 'openai' | 'gemini'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to generate content');
        }

        const data = await response.json();
        return data.content;
      } catch (error) {
        console.error('Error generating content:', error);
        throw error;
      }
    },
    [generatedOutline]
  );

  const isReady = !isLoading && !error && data;

  return (
    <div className="space-y-4">
      {/* Error Handling */}
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          closable
          className="mb-4"
        />
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-8">
          <Spin size="large" />
          {loadingMessage && (
            <div className="mt-4 text-center">
              <p>{loadingMessage}</p>
              {loadingProgress > 0 && (
                <Progress percent={loadingProgress} status="active" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      {isReady && data && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              {query ? `Web Search Results: "${query}"` : 'Combined Results'}
            </h2>
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                className="hover:text-blue-600 transition-colors px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                Back to Search
              </Button>
              <Button
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 active:scale-95 transform transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center space-x-2"
                onClick={handleOutlineCreate}
              >
                <FileTextOutlined />
                <span>Confirm & Create Outline</span>
              </Button>
            </div>
          </div>

          {/* Example usage of data */}
          <SearchResults
            organicResults={data.serp_data.organic_results}
            totalResults={data.serp_data.total_results}
            onSummarize={handleSummarize}
            isSummarizing={isSummarizing}
            summaryProgress={summaryProgress}
            summaryStage={summaryStage}
          />

          <GSCData data={data.gsc_data} />

          <SearchInsights
            gscData={data.gsc_data}
            rankingGap={data.insights.ranking_gap}
          />

          <CompetitorInsights
            contentOpportunities={data.insights.content_opportunities}
            competitorAnalysis={data.insights.competitor_analysis}
          />

          <RelatedQuestions questions={data.serp_data.related_questions} />

          <RelatedSearches searches={data.serp_data.related_searches} />

          {/* Summaries */}
          <ArticleSummarizer onArticleSelect={setSelectedArticle} />

          {/* Outline Modal */}
          <Modal
            title="Content Outline Generator"
            open={isOutlineModalOpen2}
            onCancel={() => setIsOutlineModalOpen2(false)}
            width={1200}
            footer={
              <div className="flex justify-end space-x-4">
                <Button onClick={() => setIsOutlineModalOpen2(false)}>
                  Cancel
                </Button>
                <Button
                  type="primary"
                  onClick={handleGenerateContent}
                  disabled={!generatedOutline.length}
                >
                  Generate Content
                </Button>
              </div>
            }
          >
            <ContentOutlineGenerator
              selectedTitle={data?.serp_data?.organic_results?.[0]?.title ?? null}
              selectedQuery={query}
              gscInsights={
                data?.gsc_data
                  ? [
                      {
                        query: data.query,
                        clicks: data.gsc_data.clicks,
                        impressions: data.gsc_data.impressions,
                        ctr: data.gsc_data.ctr,
                        position: data.gsc_data.position
                      }
                    ]
                  : []
              }
              onOutlineGenerated={handleOutlineGenerated}
            />
          </Modal>

          {/* Content Preview Modal */}
          {showContentPreview && (
            <ContentPreview
              outline={generatedOutline}
              onContentUpdate={handleContentUpdate}
              onGenerateContent={handleContentGenerate}
            />
          )}

          {/* Summarized Article Modal */}
          {selectedArticle && (
            <Modal
              title={selectedArticle.title}
              open={!!selectedArticle}
              onCancel={() => setSelectedArticle(null)}
              footer={null}
              width={800}
            >
              <div className="prose max-w-none">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mb-4 text-gray-800">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-xl font-semibold mb-3 text-gray-700">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-lg font-medium mb-2 text-gray-600">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => (
                      <p className="mb-4 text-gray-600">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-6 mb-4 space-y-2">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="text-gray-600">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 mb-4 text-gray-600 bg-blue-50">
                        {children}
                      </blockquote>
                    ),
                    code: ({
                      inline,
                      className,
                      children,
                      ...props
                    }: {
                      inline?: boolean;
                      className?: string;
                      children: React.ReactNode;
                    } & React.HTMLAttributes<HTMLElement>) => {
                      if (inline) {
                        return (
                          <code
                            className="bg-gray-100 rounded px-1 py-0.5 text-sm font-mono"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }
                      return (
                        <pre className="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto">
                          <code className={className} {...props}>
                            {children}
                          </code>
                        </pre>
                      );
                    },
                    strong: ({ children }) => (
                      <strong className="font-semibold text-gray-800">
                        {children}
                      </strong>
                    ),
                    em: ({ children }) => (
                      <em className="italic text-gray-700">{children}</em>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        className="text-blue-600 hover:text-blue-800 underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {children}
                      </a>
                    )
                  }}
                >
                  {selectedArticle.summary}
                </ReactMarkdown>
              </div>
            </Modal>
          )}
        </>
      )}
    </div>
  );
}