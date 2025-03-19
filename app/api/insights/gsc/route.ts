import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route';
import { google } from 'googleapis';
import { webmasters_v3 } from 'googleapis';

const webmasters = google.webmasters('v3');

interface SearchAnalyticsRow {
  clicks?: number | null | undefined;
  impressions?: number | null | undefined;
  ctr?: number | null | undefined;
  position?: number | null | undefined;
  keys?: string[] | null | undefined;
}

interface InsightData {
  type: string;
  title: string;
  description: string;
  metrics?: {
    current: number;
    previous?: number;
    change?: number;
  };
  recommendations?: string[];
}

function generateInsights(searchData: SearchAnalyticsRow[]): InsightData[] {
  const insights: InsightData[] = [];

  if (!searchData || searchData.length === 0) {
    return [];
  }

  // Top Performing Queries
  const topQueries = searchData
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 3);

  if (topQueries.length > 0) {
    insights.push({
      type: 'top_queries',
      title: 'Top Performing Search Queries',
      description: 'These keywords are driving the most traffic to your site',
      recommendations: topQueries.map(query => 
        `"${query.keys?.[0]}" - ${query.clicks} clicks, ${Math.round(query.position || 0)} avg. position`
      )
    });
  }

  // Low CTR High Impression Opportunities
  const opportunities = searchData
    .filter(row => (row.impressions || 0) > 100 && (row.ctr || 0) < 0.02)
    .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
    .slice(0, 3);

  if (opportunities.length > 0) {
    insights.push({
      type: 'opportunities',
      title: 'Click-Through Rate Opportunities',
      description: 'Keywords with high impressions but low CTR - optimize these titles and meta descriptions',
      recommendations: opportunities.map(query =>
        `Optimize for "${query.keys?.[0]}" - ${query.impressions} impressions, ${(query.ctr || 0 * 100).toFixed(1)}% CTR`
      )
    });
  }

  // Position Improvement Opportunities
  const positionOpportunities = searchData
    .filter(row => (row.position || 0) > 10 && (row.position || 0) <= 20 && (row.impressions || 0) > 50)
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .slice(0, 3);

  if (positionOpportunities.length > 0) {
    insights.push({
      type: 'ranking_opportunities',
      title: 'Ranking Improvement Opportunities',
      description: 'Keywords ranking on page 2 with potential for improvement',
      recommendations: positionOpportunities.map(query =>
        `Boost "${query.keys?.[0]}" from position ${Math.round(query.position || 0)} to first page`
      )
    });
  }

  // High Position Low CTR Opportunities
  const highPosLowCtr = searchData
    .filter(row => (row.position || 0) <= 10 && (row.ctr || 0) < 0.05 && (row.impressions || 0) > 50)
    .sort((a, b) => (a.position || 0) - (b.position || 0))
    .slice(0, 3);

  if (highPosLowCtr.length > 0) {
    insights.push({
      type: 'metadata_optimization',
      title: 'Title Tag & Meta Description Opportunities',
      description: 'High-ranking keywords with low CTR - quick wins through metadata optimization',
      recommendations: highPosLowCtr.map(query => {
        const potentialClicks = Math.round((query.impressions || 0) * 0.1); // Assuming 10% CTR potential
        const additionalClicks = potentialClicks - (query.clicks || 0);
        return `Optimize metadata for "${query.keys?.[0]}" - currently at position ${Math.round(query.position || 0)} with ${(query.ctr || 0 * 100).toFixed(1)}% CTR. Potential for ${additionalClicks} more clicks monthly.`;
      })
    });
  }

  // Content Ideas from Top Performing Content
  const contentIdeas = searchData
    .filter(row => (row.clicks || 0) > 10)
    .sort((a, b) => (b.clicks || 0) - (a.clicks || 0))
    .slice(0, 3);

  if (contentIdeas.length > 0) {
    insights.push({
      type: 'content_ideas',
      title: 'New Content Ideas',
      description: 'Based on your top performing queries, consider creating content around these topics',
      recommendations: contentIdeas.map(query => {
        const topic = query.keys?.[0] || '';
        return `Create in-depth content about "${topic}" - currently getting ${query.clicks} clicks with ${query.impressions} impressions. Consider exploring related topics and creating a content cluster.`;
      })
    });
  }

  // Keyword Opportunities from Search Patterns
  const keywordOpportunities = searchData
    .filter(row => (row.impressions || 0) > 100 && (row.position || 0) > 5 && (row.position || 0) <= 20)
    .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
    .slice(0, 3);

  if (keywordOpportunities.length > 0) {
    insights.push({
      type: 'keyword_opportunities',
      title: 'Keyword Opportunities',
      description: 'Discover new keyword opportunities based on your search performance',
      recommendations: keywordOpportunities.map(query => {
        const keyword = query.keys?.[0] || '';
        const potentialTraffic = Math.round((query.impressions || 0) * 0.1); // Assuming 10% CTR if ranking improves
        return `Target "${keyword}" - currently at position ${Math.round(query.position || 0)} with ${query.impressions} monthly impressions. Potential for ${potentialTraffic} monthly clicks if ranking improves.`;
      })
    });
  }
  return insights;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.accessToken || session.provider !== 'google') {
      return NextResponse.json(
        { error: 'Not authenticated with Google' },
        { status: 401 }
      );
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_ID,
      process.env.GOOGLE_SECRET,
      process.env.NEXTAUTH_URL
    );
    
    auth.setCredentials({ access_token: session.accessToken });

    const { data: siteList } = await webmasters.sites.list({ auth });

    if (!siteList.siteEntry?.length) {
      return NextResponse.json(
        { error: 'No verified sites found in Google Search Console' },
        { status: 404 }
      );
    }

    const siteUrl = siteList.siteEntry[0].siteUrl;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const response = await webmasters.searchanalytics.query({
      auth: auth,
      siteUrl: siteUrl,
      requestBody: {
        startDate: startDate,
        endDate: endDate,
        dimensions: ['query'],
        rowLimit: 100 // Increased limit for better analysis
      }
    } as webmasters_v3.Params$Resource$Searchanalytics$Query);

    const insights = generateInsights(response.data.rows || []);

    return NextResponse.json({
      success: true,
      insights,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error generating GSC insights:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate insights. Please try again later.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}