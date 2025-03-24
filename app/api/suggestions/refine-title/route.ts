import { NextResponse } from 'next/server';

type RefinedTitle = {
  title: string;
  metrics: {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  };
  insights: Array<{
    type: string;
    description: string;
    score: number;
  }>;
};

export async function POST(request: Request) {
  try {
    const { title } = await request.json();

    // Mock refined title data
    const refinedTitle: RefinedTitle = {
      title: `${title} - Updated for Better SEO Performance`,
      metrics: {
        clicks: Math.floor(Math.random() * 1000) + 500,
        impressions: Math.floor(Math.random() * 10000) + 5000,
        ctr: Math.random() * 10,
        position: Math.floor(Math.random() * 5) + 1
      },
      insights: [
        {
          type: 'optimization',
          description: 'Title optimized for better keyword targeting',
          score: Math.floor(Math.random() * 20) + 80
        },
        {
          type: 'readability',
          description: 'Improved clarity and engagement potential',
          score: Math.floor(Math.random() * 15) + 85
        }
      ]
    };

    return NextResponse.json(refinedTitle);
  } catch (err) {
    console.error('Error refining title:', err);
    return NextResponse.json(
      { error: 'Failed to refine blog title' },
      { status: 500 }
    );
  }
}