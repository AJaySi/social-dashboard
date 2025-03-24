import { NextResponse } from 'next/server';
import { generateSectionContent, ContentPersonalizationPreferences } from '@/app/services/openai-content';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, keywords = [], type, estimatedWordCount, personalizationPreferences } = body;

    if (!title || !type) {
      return NextResponse.json(
        { error: 'Title and type are required parameters' },
        { status: 400 }
      );
    }

    if (keywords && !Array.isArray(keywords)) {
      return NextResponse.json(
        { error: 'Keywords must be an array of strings' },
        { status: 400 }
      );
    }

    const content = await generateSectionContent(
      title,
      keywords,
      type,
      estimatedWordCount,
      personalizationPreferences as ContentPersonalizationPreferences
    );

    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error in content generation:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}