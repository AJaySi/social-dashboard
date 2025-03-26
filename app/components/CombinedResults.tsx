'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Spin,
  Alert,
  Button,
  Typography
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';

// Child components
import SearchInsights from './search/SearchInsights';
import FAQSection from './search/FAQSection';
import RelatedSearches from './search/RelatedSearches';
import CompetitorInsights from './search/CompetitorInsights';
import SearchResults from './search/SearchResults';
import GSCData from './search/GSCData';

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

  const handleOutlineCreate = () => {
    // Store necessary data in sessionStorage
    if (typeof window !== 'undefined' && data) {
      sessionStorage.setItem('outlineQuery', query || '');
      sessionStorage.setItem('outlineTitle', data.serp_data.organic_results[0]?.title || '');
      sessionStorage.setItem('outlineGscInsights', JSON.stringify(data.gsc_data || []));
    }
    
    // Redirect to outline page
    window.location.href = '/outline';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Error"
        description={error}
        type="error"
        showIcon
        className="mb-4"
      />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={onBack}
          className="flex items-center"
        >
          Back to Search
        </Button>
        <Button type="primary" onClick={handleOutlineCreate}>
          Create Content Outline
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-4">
          <SearchResults
            organicResults={data.serp_data.organic_results}
            totalResults={data.serp_data.total_results}
            //onSummarize={handleSummarize}
            //isSummarizing={isSummarizing}
            //summaryProgress={summaryProgress}
            //summaryStage={summaryStage}
          />
          <FAQSection
            relatedQuestions={data.serp_data.related_questions}
          />
          <RelatedSearches
            searches={data.serp_data.related_searches}
          />
        </div>
        <div className="space-y-4">
        <GSCData data={data.gsc_data} />

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
    </div>
  );
}