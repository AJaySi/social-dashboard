import { NextResponse } from 'next/server';
import { rateLimit } from '@/app/utils/rate-limit';
import { generateSearchQueries } from '@/app/services/searchSuggestions';

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokensPerInterval: 500
});

export async function POST(request: Request) {
  try {
    const rateLimitResult = await limiter.check(5, 'SEARCH_SUGGESTIONS_TOKEN');
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    const suggestions = await generateSearchQueries({ content, gscInsights: [] });
    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Error generating search suggestions:', error);
    return NextResponse.json(
      { error: 'Failed to generate search suggestions' },
      { status: 500 }
    );
  }
}