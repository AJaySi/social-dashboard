import { NextResponse } from 'next/server';
import { rateLimit } from '../../utils/rate-limit';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokensPerInterval: 500
});

export async function GET(request: Request) {
  try {
    // Apply rate limiting
    await limiter.check(10, 'CACHE_TOKEN'); // 10 requests per minute

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    // Make request to Google's autocomplete API
    const response = await fetch(
      `https://www.google.com/complete/search?client=hp&hl=en&sugexp=msedr&gs_rn=62&gs_ri=hp&cp=1&gs_id=9c&q=${encodeURIComponent(query)}&xhr=t`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }

    const data = await response.json();
    return NextResponse.json({ suggestions: data[1] || [] });

  } catch (error) {
    console.error('Error in suggestions API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}