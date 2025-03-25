import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { google } from 'googleapis';
import { webmasters_v3 } from 'googleapis';
import { GaxiosResponse } from 'googleapis-common';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { rateLimit } from '@/app/utils/rate-limit';
import { generateBlogOutline } from '@/app/services/openai-outline';

const webmasters = google.webmasters('v3');

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokensPerInterval: 500
});

interface GSCInsight {
  keyword: string;
  metrics: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  type: string;
  title: string;
}

export async function POST(request: Request) {
  try {
    const rateLimitResult = await limiter.check(5, 'OUTLINE_GENERATOR_TOKEN');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

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

    const { title, query, gscInsights, blogTitle, serpData } = await request.json();

    // Get search analytics data for the query or title
    const searchTerm = query || title || blogTitle;
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data: siteList } = await webmasters.sites.list({ auth });
    if (!siteList.siteEntry?.length) {
      return NextResponse.json(
        { error: 'No verified sites found in Google Search Console' },
        { status: 404 }
      );
    }
    const siteUrl = siteList.siteEntry[0].siteUrl;

    const { data: searchAnalytics } = await webmasters.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: {
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 20,
        dimensionFilterGroups: [{
          filters: [{
            dimension: 'query',
            operator: 'contains',
            expression: searchTerm
          }]
        }]
      }
    } as webmasters_v3.Params$Resource$Searchanalytics$Query) as GaxiosResponse<webmasters_v3.Schema$SearchAnalyticsQueryResponse>;

    // Note: SERP data is now passed directly from the combinedResults component
    // instead of being fetched here to avoid redundant API calls

    // Generate outline using OpenAI with enhanced context
    let outlineText;
    try {
      // Enhance gscInsights with search analytics data if available
      const enhancedGscInsights = gscInsights.map((insight: GSCInsight) => ({
        keyword: insight.keyword,
        metrics: insight.metrics,
        type: insight.type,
        title: insight.title
      }));
      
      // Add search analytics data if available
      if (searchAnalytics.rows && searchAnalytics.rows.length > 0) {
        // Add additional insights from search analytics
        searchAnalytics.rows.forEach(row => {
          const keyword = row.keys?.[0];
          if (keyword && !enhancedGscInsights.some((insight: GSCInsight) => insight.keyword === keyword)) {
            enhancedGscInsights.push({
              keyword,
              metrics: {
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0
              },
              type: 'content_gap',
              title: `Search term: ${keyword}`
            });
          }
        });
      }
      
      // Get the provider from environment variable with openai as fallback
      const provider = (process.env.DEFAULT_AI_PROVIDER || 'openai') as 'openai' | 'gemini';
      
      outlineText = await generateBlogOutline({
        title,
        query,
        blogTitle,
        gscInsights: enhancedGscInsights,
        serpData,
        provider
      });
    } catch (outlineError: Error) {
      console.error('Error in generateBlogOutline:', outlineError);
      return NextResponse.json(
        { error: 'Failed to generate outline: ' + (outlineError.message || 'Unknown error') },
        { status: 500 }
      );
    }

    if (!outlineText || !Array.isArray(outlineText)) {
      return NextResponse.json(
        { error: 'Invalid outline format received' },
        { status: 500 }
      );
    }

    // The outline is already structured, no need to parse it
    const sections = outlineText.map(section => ({
      ...section,
      // Ensure all required properties are present
      id: section.id || Date.now().toString() + Math.random(),
      title: section.title || 'Untitled Section',
      keywords: section.keywords || [],
      estimatedWordCount: section.estimatedWordCount || 300,
      keyPoints: section.keyPoints || [
        `Detailed information about ${section.title}`,
        `Best practices and examples`,
        `Actionable insights and tips`
      ],
      sectionType: section.sectionType || 'body',
      optimizationScore: section.optimizationScore || 70
    }));

    return NextResponse.json({ sections });
  } catch (error) {
    console.error('Error generating outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
}