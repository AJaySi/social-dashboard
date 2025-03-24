'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Spin, Progress } from 'antd';
import RightSidebar from './RightSidebar';

// Update the GSCDataItem type to include trend data
type GSCDataItem = {
  type: string;
  title?: string;
  keyword?: string;
  currentPosition?: number;
  impressions?: number;
  potentialTraffic?: number;
  recommendation?: string;
  data?: any;
} | {
  type: 'trend';
  title: string;
  data: SearchAnalyticsRow;
};

type Insight = {
  type: string;
  title: string;
  description: string;
  data: GSCDataItem[];
};

type InsightData = {
  insights: GSCDataItem[];
};

type SearchAnalyticsRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type SearchConsoleData = {
  site: string;
  searchAnalytics: SearchAnalyticsRow[];
};

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

interface SearchConsoleDataProps {
  insights: Insight[];
}

export default function SearchConsoleData({ insights: initialInsights }: SearchConsoleDataProps) {
  const { data: session } = useSession();
  const [insights, setInsights] = useState<Insight[]>(initialInsights || []); 
  const [loading, setLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const shouldFetchData = () => {
    if (!lastFetchTime) return true;
    return Date.now() - lastFetchTime > CACHE_DURATION;
  };

  // Update the InsightData type
  // Remove this duplicate type definition
  // type InsightData = {
  //   insights: Array<{
  //     type: string;
  //     title?: string;
  //     data?: any;
  //   }>;
  // };
  
  const fetchWithRetry = async (url: string, retries = MAX_RETRIES): Promise<InsightData | SearchConsoleData> => {
    try {
      const response = await fetch(url);
      
      if (response.status === 429) { // Rate limit exceeded
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return fetchWithRetry(url, retries - 1);
        }
        throw new Error('Rate limit exceeded. Please try again later.');
      }

      if (response.status === 401) {
        const errorData = await response.json().catch(() => ({}));
        if (errorData.error === 'RefreshAccessTokenError' || errorData.error === 'invalid_grant') {
          throw new Error('Your session has expired. Please sign in again to refresh your access.');
        }
        throw new Error('Authentication failed. Please verify your Google Search Console access.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage;
        try {
          const errorData = JSON.parse(errorText);
          if (response.status === 403) {
            errorMessage = 'Access denied. Please check your Google Search Console permissions.';
          } else if (response.status === 404) {
            errorMessage = 'No data found. Please verify your Google Search Console setup.';
          } else {
            errorMessage = errorData.error || errorData.message || `Error: ${response.statusText}`;
          }
        } catch {
          errorMessage = `Request failed: ${response.statusText || 'Unknown error'}`;
        }
        throw new Error(errorMessage);
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      // Validate response data structure
      if (url.includes('/api/insights/gsc')) {
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response: Expected a JSON object from insights API');
        }
        if (!Array.isArray(data.insights)) {
          throw new Error('Invalid response: Missing or invalid insights data');
        }
        if (data.insights.length === 0) {
          console.warn('No insights data available');
        }
      }
      
      if (url.includes('/api/gsc')) {
        if (!data || typeof data !== 'object') {
          throw new Error('Invalid response: Expected a JSON object from search analytics API');
        }
        if (!Array.isArray(data.searchAnalytics)) {
          throw new Error('Invalid response: Missing or invalid search analytics data');
        }
        if (data.searchAnalytics.length === 0) {
          console.warn('No search analytics data available');
        }
      }

      return data;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return fetchWithRetry(url, retries - 1);
      }
      throw error;
    }
  };

  const fetchInsights = useCallback(async (forceRefresh = false) => {
    if (!forceRefresh && !shouldFetchData()) {
      console.log('Using cached data');
      return;
    }

    if (!session) {
      setError('Please sign in with your Google account to access Search Console data');
      return;
    }

    if (session.provider !== 'google') {
      setError('Please sign in with your Google account to access Search Console data');
      return;
    }

    if (session.error === 'RefreshAccessTokenError') {
      setError('Your session has expired. Please sign in again to refresh your access.');
      return;
    }

    let progressInterval: NodeJS.Timeout | undefined;

    try {
      setLoading(true);
      setError(null);
      setLoadingProgress(0);
      
      progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 800);
      
      const [insightsData, searchResult] = await Promise.all([
        fetchWithRetry('/api/insights/gsc') as Promise<InsightData>,
        fetchWithRetry('/api/gsc') as Promise<SearchConsoleData>
      ]);

      const formattedInsights = [
        {
          type: 'top_performers',
          title: insightsData.insights?.find((i: { type: string }) => i.type === 'top_queries')?.title || 'Top Performers',
          description: 'Your best performing content',
          data: insightsData.insights?.filter((i: { type: string }) => i.type === 'top_queries') || []
        },
        {
          type: 'quick_wins',
          title: insightsData.insights?.find((i: { type: string }) => i.type === 'opportunities')?.title || 'Quick Wins',
          description: 'Opportunities for rapid improvement',
          data: insightsData.insights?.filter((i: { type: string }) => i.type === 'opportunities') || []
        },
        {
          type: 'content_gaps',
          title: insightsData.insights?.find((i: { type: string }) => i.type === 'content_ideas')?.title || 'Content Gaps',
          description: 'Areas needing content expansion',
          data: insightsData.insights?.filter((i: { type: string }) => i.type === 'content_ideas') || []
        },
        {
          type: 'growth_opportunities',
          title: insightsData.insights?.find((i: { type: string }) => i.type === 'keyword_opportunities')?.title || 'Growth Opportunities',
          description: 'Potential areas for traffic growth',
          data: insightsData.insights?.filter((i: { type: string }) => i.type === 'keyword_opportunities') || []
        },
        {
          type: 'optimization_opportunities',
          title: insightsData.insights?.find((i: { type: string }) => i.type === 'metadata_optimization')?.title || 'Optimization Opportunities',
          description: 'Pages needing SEO improvements',
          data: insightsData.insights?.filter((i: { type: string }) => i.type === 'metadata_optimization') || []
        },
        {
          type: 'trends',
          title: 'Performance Trends',
          description: 'Historical performance metrics',
          data: searchResult?.searchAnalytics.map(row => ({
            type: 'trend',
            title: row.keys.join(' - '),
            data: row
          })) || []
        }
      ];

      setInsights(formattedInsights);
      setLoadingProgress(100);
      setTimeout(() => {
        setLoading(false);
        setLoadingProgress(0);
      }, 500);
      setLastFetchTime(Date.now());
    } catch (err) {
      if (progressInterval) clearInterval(progressInterval);
      setLoadingProgress(100);
      console.error('Error fetching insights:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      if (progressInterval) clearInterval(progressInterval);
      setLoading(false);
    }
  }, [session?.provider]);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights, session?.provider]);

  if (loading) {
    return (
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get the current content from the page component
  const getCurrentContent = () => {
    // If we're in a browser environment, try to get the content from the textarea
    if (typeof window !== 'undefined') {
      const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
      return textarea?.value || '';
    }
    return '';
  };

  // Update GSCDataItem type to match RightSidebar's expectations
  type GSCDataItem = {
    type: string;
    title?: string;
    keyword?: string;
    currentPosition?: number;
    impressions?: number;
    potentialTraffic?: number;
    recommendation?: string;
    data?: any;
  } | {
    type: 'trend';
    title: string;
    data: SearchAnalyticsRow;
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
          <div className="text-center">
            <Spin size="large" />
            <div className="mt-4">
              <Progress type="circle" percent={loadingProgress} />
            </div>
          </div>
        </div>
      )}
      <RightSidebar 
        insights={insights}
        onRefresh={() => fetchInsights(true)} 
        currentContent={getCurrentContent()}
      />
    </div>
  );
}