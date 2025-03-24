import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { google, webmasters_v3 } from 'googleapis';
import { NextResponse } from 'next/server';
import { GaxiosResponse } from 'googleapis-common';

const webmasters = google.webmasters('v3');

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
      process.env.GOOGLE_SECRET
    );
    auth.setCredentials({ access_token: session.accessToken });

    // Get the list of verified sites
    const { data: siteList } = await webmasters.sites.list({
      auth
    });

    if (!siteList.siteEntry?.length) {
      return NextResponse.json(
        { error: 'No verified sites found' },
        { status: 404 }
      );
    }

    const site = siteList.siteEntry[0].siteUrl;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Fetch search analytics data
    const { data: searchAnalytics } = await webmasters.searchanalytics.query({
      auth,
      siteUrl: site,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        rowLimit: 100
      }
    } as webmasters_v3.Params$Resource$Searchanalytics$Query) as GaxiosResponse<webmasters_v3.Schema$SearchAnalyticsQueryResponse>;

    // Process data for insights
    const insights = {
      quick_wins: processQuickWins(searchAnalytics.rows || []),
      content_gaps: processContentGaps(searchAnalytics.rows || []),
      growth_opportunities: processGrowthOpportunities(searchAnalytics.rows || []),
      optimization_opportunities: processOptimizationOpportunities(searchAnalytics.rows || [])
    };

    return NextResponse.json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights data' },
      { status: 500 }
    );
  }
}

function processQuickWins(rows: webmasters_v3.Schema$ApiDataRow[]) {
  return rows
    .filter(row => row.position > 5 && row.position <= 20)
    .map(row => ({
      keyword: row.keys[0],
      page: row.keys[1],
      currentMetrics: {
        position: row.position,
        impressions: row.impressions,
        currentClicks: row.clicks
      },
      opportunity: {
        potentialTraffic: Math.round(row.impressions * 0.2),
        trafficIncrease: Math.round(row.clicks * 2),
        effort: 'Medium'
      }
    }));
}

function processContentGaps(rows: webmasters_v3.Schema$ApiDataRow[]) {
  return rows
    .filter(row => row.impressions > 1000 && row.ctr < 0.02)
    .map(row => ({
      keyword: row.keys[0],
      page: row.keys[1],
      metrics: {
        impressions: row.impressions,
        ctr: row.ctr,
        avgPosition: row.position
      }
    }));
}

function processGrowthOpportunities(rows: webmasters_v3.Schema$ApiDataRow[]) {
  return rows
    .filter(row => row.position <= 5 && row.ctr < 0.1)
    .map(row => ({
      keyword: row.keys[0],
      page: row.keys[1],
      metrics: {
        currentPosition: row.position,
        impressions: row.impressions,
        potentialClicks: Math.round(row.impressions * 0.1)
      }
    }));
}

function processOptimizationOpportunities(rows: webmasters_v3.Schema$ApiDataRow[]) {
  return rows
    .filter(row => row.position > 10 && row.impressions > 500)
    .map(row => ({
      keyword: row.keys[0],
      page: row.keys[1],
      metrics: {
        currentPosition: row.position,
        impressions: row.impressions,
        estimatedDifficulty: 'Medium'
      }
    }));
}