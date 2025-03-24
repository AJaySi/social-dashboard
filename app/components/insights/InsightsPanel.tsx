'use client';

import { useState, useEffect } from 'react';

interface Metrics {
  impressions: number;
  ctr: number;
  avgPosition: number;
  currentPosition?: number;
  potentialClicks?: number;
  estimatedDifficulty?: string;
}

interface InsightItem {
  keyword: string;
  page: string;
  metrics: Metrics;
  currentMetrics?: {
    position: number;
    impressions: number;
    currentClicks: number;
  };
  opportunity?: {
    potentialTraffic: number;
    trafficIncrease: number;
    effort: string;
  };
}

interface Insights {
  quick_wins: InsightItem[];
  content_gaps: InsightItem[];
  growth_opportunities: InsightItem[];
  optimization_opportunities: InsightItem[];
}

export default function InsightsPanel() {
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await fetch('/api/insights');
        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }
        const data = await response.json();
        setInsights(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error: {error}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-4">
        No insights available.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Wins</h2>
        <div className="space-y-4">
          {insights.quick_wins.map((item, index) => (
            <div key={index} className="border-b pb-4">
              <h3 className="font-medium">{item.keyword}</h3>
              <p className="text-sm text-gray-600">{item.page}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Current Position</p>
                  <p className="font-medium">{item.currentMetrics?.position}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Potential Traffic</p>
                  <p className="font-medium">{item.opportunity?.potentialTraffic}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Content Gaps</h2>
        <div className="space-y-4">
          {insights.content_gaps.map((item, index) => (
            <div key={index} className="border-b pb-4">
              <h3 className="font-medium">{item.keyword}</h3>
              <p className="text-sm text-gray-600">{item.page}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Impressions</p>
                  <p className="font-medium">{item.metrics.impressions}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CTR</p>
                  <p className="font-medium">{(item.metrics.ctr * 100).toFixed(2)}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Growth Opportunities</h2>
        <div className="space-y-4">
          {insights.growth_opportunities.map((item, index) => (
            <div key={index} className="border-b pb-4">
              <h3 className="font-medium">{item.keyword}</h3>
              <p className="text-sm text-gray-600">{item.page}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Current Position</p>
                  <p className="font-medium">{item.metrics.currentPosition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Potential Clicks</p>
                  <p className="font-medium">{item.metrics.potentialClicks}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Optimization Opportunities</h2>
        <div className="space-y-4">
          {insights.optimization_opportunities.map((item, index) => (
            <div key={index} className="border-b pb-4">
              <h3 className="font-medium">{item.keyword}</h3>
              <p className="text-sm text-gray-600">{item.page}</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-gray-500">Current Position</p>
                  <p className="font-medium">{item.metrics.currentPosition}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Difficulty</p>
                  <p className="font-medium">{item.metrics.estimatedDifficulty}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}