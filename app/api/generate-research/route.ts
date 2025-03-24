import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimit } from '@/app/utils/rate-limit';

const limiter = rateLimit();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function POST(request: Request) {
  try {
    await limiter.check(5, 'GENERATE_RESEARCH_TOKEN');

    const body = await request.json();
    const { query, relatedSearches } = body;

    const prompt = `Generate 5 novel research directions based on this search query: "${query}"

Related searches to consider:
${relatedSearches?.map((search: string) => `- ${search}`).join('\n') || 'No related searches available'}

Provide research directions that:
1. Explore unique angles and perspectives
2. Identify potential gaps in current research
3. Suggest interdisciplinary approaches
4. Consider emerging trends and future implications
5. Highlight practical applications

Format each direction with:
- A clear research question
- Key areas to explore
- Potential impact`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a research advisor specializing in identifying novel research directions and unexplored areas of study.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    const researchDirections = completion.choices[0]?.message?.content
      ?.split('\n\n')
      .filter(direction => direction.trim())
      .map(direction => ({
        question: direction.split('\n')[0].replace(/^\d+\.\s*/, ''),
        areas: direction.split('\n').slice(1).join('\n')
      }));

    return NextResponse.json({ researchDirections });
  } catch (error) {
    console.error('Error generating research directions:', error);
    return NextResponse.json(
      { error: 'Failed to generate research directions' },
      { status: 500 }
    );
  }
}