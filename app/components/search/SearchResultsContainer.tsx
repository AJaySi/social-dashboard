'use client';

import { useState, useCallback } from 'react';
import { Card, Spin, Alert, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import OrganicResults from './OrganicResults';
import SearchInsights from './SearchInsights';
import CompetitorInsights from './CompetitorInsights';
import FAQSection from './FAQSection';
import RelatedSearches from './RelatedSearches';
import ContentOutlineGenerator from '../ContentOutlineGenerator';
import ContentPreview from '../ContentPreview';

type SearchResultsContainerProps = {
  query: string | null;
  onBack: () => void;
  data: {
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
      related_searches: Array<string | {
        query: string;
        items?: Array<string | { query: string }>;
        type?: 'search';
      }>;
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
  } | null;
  isLoading: boolean;
  error: string | null;
};

export default function SearchResultsContainer({ query, onBack, data, isLoading, error }: SearchResultsContainerProps) {
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; summary: string } | null>(null);
  const [isOutlineModalOpen, setIsOutlineModalOpen] = useState(false);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [generatedOutline, setGeneratedOutline] = useState<Array<any>>([]);

  const handleOutlineCreate = () => {
    setIsOutlineModalOpen(true);
  };

  const handleOutlineGenerated = useCallback((outline: any) => {
    setGeneratedOutline(outline);
  }, []);

  const handleGenerateContent = () => {
    if (generatedOutline.length === 0) return;
    setIsOutlineModalOpen(false);
    setShowContentPreview(true);
  };

  const handleArticleClick = (article: any) => {
    setSelectedArticle(article);
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
          <OrganicResults
            organicResults={data.serp_data.organic_results}
            totalResults={data.serp_data.total_results}
            onArticleClick={handleArticleClick}
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

      {isOutlineModalOpen && (
        <ContentOutlineGenerator
          query={query || ''}
          onOutlineGenerated={handleOutlineGenerated}
          onClose={() => setIsOutlineModalOpen(false)}
          onGenerateContent={handleGenerateContent}
        />
      )}

      {showContentPreview && (
        <ContentPreview
          outline={generatedOutline}
          onClose={() => setShowContentPreview(false)}
        />
      )}
    </div>
  );
}