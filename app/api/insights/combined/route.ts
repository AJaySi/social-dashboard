import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { google } from 'googleapis';
import { webmasters_v3, webmasters } from '@googleapis/webmasters';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { rateLimit } from '@/app/utils/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000,
  uniqueTokensPerInterval: 500
});

const SERPAPI_KEY = process.env.SERPAPI_KEY || '89358270433a51dc8c78fc6ad73d457f396f0e2534b629f2004b9eef7b019706';

export async function GET(request: Request) {
  try {
    await limiter.check(5, 'COMBINED_INSIGHTS_TOKEN');

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return new NextResponse(
        JSON.stringify({ error: 'Query parameter is required' }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Get GSC data
    const session = await getServerSession(authOptions);
    if (!session?.accessToken || session.provider !== 'google') {
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated with Google' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_ID,
      process.env.GOOGLE_SECRET
    );
    auth.setCredentials({ access_token: session.accessToken });

    const webmastersService = webmasters('v3');
    const { data: siteList } = await webmastersService.sites.list({ auth });
    if (!siteList.siteEntry?.length) {
      return new NextResponse(
        JSON.stringify({ error: 'No verified sites found' }),
        { 
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const site = siteList.siteEntry[0].siteUrl;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    // Fetch GSC data for the query
    const { data: searchAnalytics } = await webmastersService.searchanalytics.query({
      auth,
      siteUrl: site,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query', 'page'],
        query,
        rowLimit: 10
      }
    } as webmasters_v3.Params$Resource$Searchanalytics$Query) as { data: webmasters_v3.Schema$SearchAnalyticsQueryResponse };

    // Fetch SERP data
    const serpResponse = await fetch(
      `https://serpapi.com/search.json?api_key=${SERPAPI_KEY}&engine=google&q=${encodeURIComponent(query)}&google_domain=google.com&gl=us&hl=en`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!serpResponse.ok) {
      throw new Error('Failed to fetch SERP results');
    }

    const serpData = await serpResponse.json();

    // Combine GSC and SERP data
    const combinedInsights = {
      query,
      gsc_data: {
        clicks: searchAnalytics.rows?.[0]?.clicks || 0,
        impressions: searchAnalytics.rows?.[0]?.impressions || 0,
        ctr: searchAnalytics.rows?.[0]?.ctr || 0,
        position: searchAnalytics.rows?.[0]?.position || 0,
        pages: searchAnalytics.rows?.map((row: webmasters_v3.Schema$ApiDataRow) => ({
          page: row.keys?.[1] || '',
          clicks: row.clicks || 0,
          impressions: row.impressions || 0,
          position: row.position || 0
        })) || []
      },
      serp_data: {
        organic_results: serpData.organic_results?.map((result: { position: number; title: string; link: string; snippet: string; displayed_link: string }) => ({
          position: result.position,
          title: result.title,
          link: result.link,
          snippet: result.snippet,
          displayed_link: result.displayed_link
        })) || [],
        related_searches: serpData.related_searches || [],
        total_results: serpData.search_metadata?.total_results
      },
      insights: {
        ranking_gap: calculateRankingGap(searchAnalytics.rows ?? [], serpData.organic_results ?? []),
        content_opportunities: identifyContentOpportunities(serpData.organic_results ?? [], searchAnalytics.rows ?? []),
        competitor_analysis: analyzeCompetitors(serpData.organic_results ?? [])
      }
    };

    return new NextResponse(
      JSON.stringify(combinedInsights),
      { 
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      }
    );

  } catch (error: any) {
    console.error('Error in combined insights API:', error);
    
    // Handle rate limit errors
    if (error.name === 'RateLimitError') {
      return new NextResponse(
        JSON.stringify({
          error: 'Rate limit exceeded',
          limit: error.limit,
          remaining: error.remaining,
          reset: error.reset,
          retryAfter: Math.ceil((error.reset - Date.now()) / 1000)
        }),
        { 
          status: 429,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Handle SERP API errors
    if (error.message.includes('Failed to fetch SERP results')) {
      return new NextResponse(
        JSON.stringify({ error: 'External API service is temporarily unavailable' }),
        { 
          status: 503,
          headers: { 
            'Content-Type': 'application/json',
            'X-Error-Type': 'serp_api_error'
          }
        }
      );
    }

    // Handle Google API errors
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return new NextResponse(
        JSON.stringify({ error: 'Google API authentication failed. Please reconnect your Google account.' }),
        { 
          status: 401,
          headers: { 
            'Content-Type': 'application/json',
            'X-Error-Type': 'google_auth_error'
          }
        }
      );
    }

    // Handle all other errors
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to fetch combined insights',
        details: error.message || 'An unexpected error occurred'
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'X-Error-Type': 'combined_insights_error'
        }
      }
    );
  }
}

function calculateRankingGap(gscData: webmasters_v3.Schema$ApiDataRow[], serpResults: { position: number }[]) {
  // Compare GSC position with SERP position
  const gscPosition = gscData?.[0]?.position || 0;
  const serpPositions = serpResults?.map(r => r.position) || [];
  return {
    gsc_position: gscPosition,
    serp_positions: serpPositions,
    position_difference: serpPositions.length ? Math.abs(gscPosition - Math.min(...serpPositions)) : 0
  };
}

function identifyContentOpportunities(serpResults: { snippet?: string; link: string; title: string }[], gscData: webmasters_v3.Schema$ApiDataRow[]) {
const opportunities: Array<{ type: string; source_url: string; title: string; snippet: string }> = [];
  
  // Analyze SERP snippets for content gaps
  serpResults?.forEach(result => {
    if (result.snippet) {
      opportunities.push({
        type: 'content_gap',
        source_url: result.link,
        title: result.title,
        snippet: result.snippet
      });
    }
  });
  
  // Use gscData to enhance content opportunities if available
  if (gscData && gscData.length > 0) {
    // Add insights based on GSC data
    gscData.forEach(row => {
      if (row.keys && row.keys.length >= 2) {
        const query = row.keys[0];
        const page = row.keys[1];
        
        // Only add if we have meaningful data
        if (query && page && row.position && row.position > 10) {
          opportunities.push({
            type: 'ranking_opportunity',
            source_url: page,
            title: `Improve ranking for "${query}"`,
            snippet: `Current position: ${row.position.toFixed(1)}. Potential for improvement.`
          });
        }
      }
    });
  }

  return opportunities;
}

function analyzeCompetitors(serpResults: { link: string; title: string; position: number; snippet?: string }[]) {
  return serpResults?.map(result => ({
    url: result.link,
    title: result.title,
    position: result.position,
    snippet: result.snippet
  })) || [];
}