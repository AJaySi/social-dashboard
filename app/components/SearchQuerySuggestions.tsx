'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Tag, Button, Modal, Badge, Tooltip, Collapse } from 'antd';
import { EditOutlined, CheckOutlined, SearchOutlined, CaretRightOutlined } from '@ant-design/icons';

import { generateSearchQueries, refineSearchQuery } from '../services/searchSuggestions';

type SearchQuerySuggestion = {
  query: string;
  keywords: string[];
  insights: string[];
  relevanceScore?: number;
};

type SearchQuerySuggestionsProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectQuery: (query: string) => void;
  currentContent: string;
  gscInsights: Array<{
    type: string;
    title: string;
    description: string;
    data: unknown[];
  }>;
};

export default function SearchQuerySuggestions({
  isOpen,
  onClose,
  onSelectQuery,
  currentContent,
  gscInsights
}: SearchQuerySuggestionsProps) {
  const router = useRouter();
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null);
  const [isRefining, setIsRefining] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SearchQuerySuggestion[]>([]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!currentContent || !isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const generatedSuggestions = await generateSearchQueries({
          content: currentContent,
          gscInsights
        });
        
        setSuggestions(generatedSuggestions.map(suggestion => ({
          ...suggestion,
          relevanceScore: generateRelevanceScore(suggestion.query, currentContent)
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate suggestions');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [currentContent, gscInsights, isOpen]);

  const handleRefineQuery = async (query: string) => {
    setIsRefining(true);
    setSelectedQuery(query);
    
    try {
      const refinedSuggestion = await refineSearchQuery(query, currentContent);
      setSuggestions(prev => prev.map(suggestion => 
        suggestion.query === query ? { ...suggestion, ...refinedSuggestion } : suggestion
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refine query');
    } finally {
      setIsRefining(false);
      setSelectedQuery(null);
    }
  };

  const generateRelevanceScore = (query: string, content: string): number => {
    const contentKeywords = content.toLowerCase().split(/\s+/);
    const queryKeywords = query.toLowerCase().split(/\s+/);
    const commonWords = queryKeywords.filter(word => contentKeywords.includes(word));
    return Math.min(100, (commonWords.length / queryKeywords.length) * 100);
  };

  const handleUseQuery = async (query: string) => {
    setIsLoading(true);
    onSelectQuery(query);
    await router.push(`/combined-results?query=${encodeURIComponent(query)}`);
  };

  return (
    <Modal
      title={
        <div className="flex items-center space-x-2">
          <span className="text-xl font-semibold">Search Query Suggestions</span>
          <Badge count="ALwrity" style={{ backgroundColor: '#1890ff' }} />
        </div>
      }
      open={isOpen}
      onCancel={onClose}
      width={800}
      footer={null}
    >
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
              <div className="mt-4 space-y-2">
                <p className="text-gray-600 font-medium">
                  {suggestions.length === 0 ? 'Analyzing content and generating suggestions...' : 'Applying changes...'}
                </p>
                <p className="text-sm text-gray-500">
                  {suggestions.length === 0 ? 'Our AI is crafting optimized search queries based on your content' : 'Implementing your selected query'}
                </p>
              </div>
            </div>
            {suggestions.length === 0 && [
              <Card key="loading-1" className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </Card>
            ]}
          </div>
        ) : suggestions.length > 0 ? (
          suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01] bg-gradient-to-r from-white via-blue-50/30 to-white"
              styles={{ body: { padding: '16px' } }}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <Tooltip title="This search query is optimized based on your content and search trends">
                      <h3 className="text-lg font-medium text-gray-800 flex items-center gap-2 hover:text-blue-700 transition-colors">
                        <SearchOutlined />
                        {suggestion.query}
                        <Badge
                          count={`${Math.round(suggestion.relevanceScore || 0)}% match`}
                          style={{ backgroundColor: '#52c41a' }}
                        />
                      </h3>
                    </Tooltip>
                  </div>
                  <div className="flex space-x-2">
                    <Tooltip title="Refine this query with AI assistance">
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => handleRefineQuery(suggestion.query)}
                        loading={isRefining && selectedQuery === suggestion.query}
                        className="hover:border-blue-400 hover:text-blue-500 transition-colors"
                      >
                        ALwrity it
                      </Button>
                    </Tooltip>
                    <Button
                      type="primary"
                      icon={<CheckOutlined />}
                      onClick={() => handleUseQuery(suggestion.query)}
                      loading={isLoading && selectedQuery === suggestion.query}
                      className="hover:opacity-90 transition-opacity"
                    >
                      Use this
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Collapse
                    ghost
                    expandIcon={({ isActive }) => (
                      <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    )}
                    items={[
                      {
                        key: '1',
                        label: 'Keywords',
                        children: suggestion.keywords?.length > 0 ? (
                          <div className="flex flex-wrap gap-2 p-3 bg-gradient-to-r from-blue-50/50 via-blue-100/30 to-blue-50/50 rounded-lg">
                            {suggestion.keywords.map((keyword, idx) => (
                              <Tag key={idx} color="blue">{keyword}</Tag>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">No keywords available</p>
                        )
                      }
                    ]}
                  />
                  <Collapse
                    ghost
                    expandIcon={({ isActive }) => (
                      <CaretRightOutlined rotate={isActive ? 90 : 0} />
                    )}
                    items={[
                      {
                        key: '2',
                        label: 'Insights',
                        children: suggestion.insights?.length > 0 ? (
                          <ul className="list-disc pl-4 space-y-1 p-3 bg-gradient-to-r from-blue-50/50 via-blue-100/30 to-blue-50/50 rounded-lg">
                            {suggestion.insights.map((insight, idx) => (
                              <li key={idx} className="text-gray-600">{insight}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-500">No insights available</p>
                        )
                      }
                    ]}
                  />
                </div>
              </div>
            </Card>
          ))
        ) : (
          <div className="text-center text-gray-500 py-8">
            No suggestions available. Try updating your content.
          </div>
        )}
      </div>
    </Modal>
  );
}