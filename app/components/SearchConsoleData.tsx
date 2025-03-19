'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import TopPerformers from './insights/TopPerformers';
import ContentGaps from './insights/ContentGaps';
import GrowthOpportunities from './insights/GrowthOpportunities';
import QuickWins from './insights/QuickWins';
import ContentEnhancement from './insights/ContentEnhancement';
import OptimizationOpportunities from './insights/OptimizationOpportunities';
import RightSidebar from './RightSidebar';

type SearchAnalyticsRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type Insight = {
  type: string;
  title: string;
  description: string;
  data: any[];
};

type SearchConsoleData = {
  site: string;
  searchAnalytics: SearchAnalyticsRow[];
  insights: Insight[];
};

export default function SearchConsoleData() {
  const { data: session } = useSession();
  const [data, setData] = useState<SearchConsoleData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const renderInsightComponent = (insight: Insight) => {
    switch (insight.type) {
      case 'growth_opportunities':
        return <GrowthOpportunities data={insight.data} />;
      case 'content_enhancement':
        return <ContentEnhancement data={insight.data} />;
      case 'optimization_opportunities':
        return <OptimizationOpportunities data={insight.data} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (session?.provider !== 'google') return;

      try {
        setLoading(true);
        const response = await fetch('/api/gsc');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch data');
        }

        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session]);

  if (!session || session.provider !== 'google') {
    return null;
  }

  if (loading) {
    return (
      <div className="mt-8 p-4 bg-white rounded-lg shadow">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 p-4 bg-red-50 text-red-600 rounded-lg">
        Error: {error}
      </div>
    );
  }

  if (!data?.searchAnalytics.length) {
    return (
      <div className="mt-8 p-4 bg-yellow-50 text-yellow-600 rounded-lg">
        No search analytics data available for {data?.site}
      </div>
    );
  }

  const mainContentInsights = data.insights.filter(
    insight => !['top_performers', 'quick_wins', 'content_gaps', 'growth_opportunities', 'optimization_opportunities'].includes(insight.type)
  );

  return (
    <div className="mt-8 space-y-8">
      <div className="flex gap-6">
        <div className="flex-1 grid grid-cols-1 gap-6">
          {mainContentInsights.map((insight, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800">{insight.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{insight.description}</p>
              </div>
              <div className="p-4">
                {renderInsightComponent(insight)}
              </div>
            </div>
          ))}        
        </div>
        <RightSidebar insights={data.insights} />
      </div>
    </div>
  );
}
