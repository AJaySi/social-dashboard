'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import InsightsPanel from '../components/insights/InsightsPanel';

interface Insights {
  quick_wins: Array<{
    keyword: string;
    page: string;
    currentMetrics: {
      position: number;
      impressions: number;
      currentClicks: number;
    };
    opportunity: {
      potentialTraffic: number;
      trafficIncrease: number;
      effort: string;
    };
  }>;
  content_gaps: Array<{
    keyword: string;
    page: string;
    metrics: {
      impressions: number;
      ctr: number;
      avgPosition: number;
    };
  }>;
  growth_opportunities: Array<{
    keyword: string;
    page: string;
    metrics: {
      currentPosition: number;
      impressions: number;
      potentialClicks: number;
    };
  }>;
  optimization_opportunities: Array<{
    keyword: string;
    page: string;
    metrics: {
      currentPosition: number;
      impressions: number;
      estimatedDifficulty: string;
    };
  }>;
}

interface PerformanceData {
  date: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export default function ContentIdeator() {
  const { data: session } = useSession();
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [insights, setInsights] = useState<Insights | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentIdeas, setContentIdeas] = useState<Array<{
    title: string;
    description: string;
    metrics?: {
      potential_traffic?: number;
      difficulty?: string;
      relevance_score?: number;
    };
    recommendations: string[];
  }>>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0];

        const [performanceResponse, insightsResponse] = await Promise.all([
          fetch(`/api/gsc/performance?startDate=${startDate}&endDate=${endDate}`),
          fetch('/api/insights')
        ]);

        if (!performanceResponse.ok || !insightsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [performanceData, insightsData] = await Promise.all([
          performanceResponse.json(),
          insightsResponse.json()
        ]);

        setPerformanceData(performanceData.performanceData);
        setInsights(insightsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session]);

  useEffect(() => {
    const fetchContentIdeas = async () => {
      if (insights) {
        const ideas = [
          ...insights.quick_wins.map(item => ({
            title: `Quick Win: ${item.keyword}`,
            description: `Opportunity to improve rankings and traffic for ${item.page}`,
            metrics: {
              potential_traffic: item.opportunity.trafficIncrease,
              difficulty: item.opportunity.effort,
              relevance_score: 85
            },
            recommendations: [
              `Current position: ${item.currentMetrics.position}`,
              `Potential traffic increase: ${item.opportunity.trafficIncrease}`,
              `Focus on improving content relevance and depth`,
              `Optimize meta tags and internal linking`
            ]
          })),
          ...insights.content_gaps.map(item => ({
            title: `Content Gap: ${item.keyword}`,
            description: `Address missing content opportunity for better visibility`,
            metrics: {
              potential_traffic: item.metrics.impressions,
              difficulty: 'Medium',
              relevance_score: 90
            },
            recommendations: [
              `Current CTR: ${(item.metrics.ctr * 100).toFixed(2)}%`,
              `Average position: ${item.metrics.avgPosition}`,
              `Create comprehensive content addressing user intent`,
              `Include relevant keywords and semantic variations`
            ]
          })),
          ...insights.growth_opportunities.map(item => ({
            title: `Growth Opportunity: ${item.keyword}`,
            description: `Potential for significant traffic growth`,
            metrics: {
              potential_traffic: item.metrics.potentialClicks,
              difficulty: 'Medium-High',
              relevance_score: 75
            },
            recommendations: [
              `Current position: ${item.metrics.currentPosition}`,
              `Potential clicks: ${item.metrics.potentialClicks}`,
              `Enhance content depth and authority`,
              `Build quality backlinks to boost rankings`
            ]
          }))
        ];
        setContentIdeas(ideas);
      }
    };

    fetchContentIdeas();
  }, [insights]);

  if (!session) {
    return (
      <div className="p-4">
        <p>Please sign in to view content ideation insights.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4">
        <p>Loading performance data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-8">
      <h1 className="text-2xl font-bold">Content Ideator</h1>
      
      {contentIdeas.length > 0 && (
        <ContentIdeasCarousel ideas={contentIdeas} />
      )}
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">GSC Performance Metrics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Clicks</th>
                <th className="px-4 py-2">Impressions</th>
                <th className="px-4 py-2">CTR</th>
                <th className="px-4 py-2">Position</th>
              </tr>
            </thead>
            <tbody>
              {performanceData.map((data, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2">{data.date}</td>
                  <td className="px-4 py-2">{data.clicks}</td>
                  <td className="px-4 py-2">{data.impressions}</td>
                  <td className="px-4 py-2">{(data.ctr * 100).toFixed(2)}%</td>
                  <td className="px-4 py-2">{data.position.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Quick Wins</h2>
            <div className="space-y-4">
              {insights.quick_wins.map((item, index) => (
                <div key={index} className="border-b pb-4">
                  <h3 className="font-medium">{item.keyword}</h3>
                  <p className="text-sm text-gray-600">{item.page}</p>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Current Position</p>
                      <p>{item.currentMetrics.position}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Potential Traffic Increase</p>
                      <p>{item.opportunity.trafficIncrease}</p>
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
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Impressions</p>
                      <p>{item.metrics.impressions}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">CTR</p>
                      <p>{(item.metrics.ctr * 100).toFixed(2)}%</p>
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
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Current Position</p>
                      <p>{item.metrics.currentPosition}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Potential Clicks</p>
                      <p>{item.metrics.potentialClicks}</p>
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
                  <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500">Current Position</p>
                      <p>{item.metrics.currentPosition}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Difficulty</p>
                      <p>{item.metrics.estimatedDifficulty}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}