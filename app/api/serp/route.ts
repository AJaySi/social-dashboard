import { NextResponse } from 'next/server';
import { rateLimit } from '../../utils/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokensPerInterval: 500
});

const SERPAPI_KEY = process.env.SERPAPI_KEY || '89358270433a51dc8c78fc6ad73d457f396f0e2534b629f2004b9eef7b019706';

export async function GET(request: Request) {
  try {
    // Apply rate limiting
    await limiter.check(5, 'SERP_CACHE_TOKEN'); // 5 requests per minute

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const location = searchParams.get('location') || 'United States';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Make request to SerpAPI
    const response = await fetch(
      `https://serpapi.com/search.json?api_key=${SERPAPI_KEY}&engine=google&q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}&google_domain=google.com&gl=us&hl=en`,
      {
        headers: {
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch SERP results');
    }

    const data = await response.json();
    
    // Extract relevant SERP data
    const serpResults = {
      organic_results: data.organic_results?.map((result: {
        position: number;
        title: string;
        link: string;
        snippet: string;
        displayed_link: string;
      }) => ({
        position: result.position,
        title: result.title,
        link: result.link,
        snippet: result.snippet,
        displayed_link: result.displayed_link
      })) || [],
      related_searches: data.related_searches || [],
      search_metadata: {
        google_url: data.search_metadata?.google_url,
        total_results: data.search_metadata?.total_results
      }
    };

    return NextResponse.json(serpResults);

  } catch (error) {
    console.error('Error in SERP API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SERP results' },
      { status: 500 }
    );
  }
}