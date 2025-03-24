import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import FirecrawlApp, { ScrapeResponse } from '@mendable/firecrawl-js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Helper function to summarize content using OpenAI
async function summarizeContent(content: string, context: string) {
  try {
    // Validate content is a non-empty string
    if (typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content must be a non-empty string' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes website content. Provide a concise, informative summary that captures the main points and key insights.'
        },
        {
          role: 'user',
          content: `Please summarize the following content from ${context}:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 650,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarize content:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { content, url, title } = requestData;

    // Handle URL-based summarization (from CombinedResults.tsx)
    if (url && !content) {
      try {
        // Use Firecrawl to scrape the URL content
        const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });
        const response = await firecrawl.scrapeUrl(url, {
          formats: ['markdown']
        }) as ScrapeResponse;
        
        if (!response.success) {
          return NextResponse.json(
            { error: `Failed to scrape content: ${response.error}` },
            { status: 400 }
          );
        }
        
        // Validate that we have content before proceeding
        if (!response || !response.markdown || typeof response.markdown !== 'string' || response.markdown.trim() === '') {
          return NextResponse.json(
            { error: 'No valid content found on the page' },
            { status: 400 }
          );
        }
        
        // Use the scraped content for summarization
        return await summarizeContent(response.markdown, title || url);
      } catch (error) {
        console.error('Error scraping URL:', error);
        return NextResponse.json(
          { error: 'Failed to scrape URL content' },
          { status: 500 }
        );
      }
    }

    // Handle direct content summarization (from ArticleSummarizer.tsx)
    if (!content) {
      return NextResponse.json(
        { error: 'Either content or URL is required' },
        { status: 400 }
      );
    }
    
    // Validate content is a non-empty string
    if (typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        { error: 'Content must be a non-empty string' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that summarizes website content. Provide a concise, informative summary that captures the main points and key insights.'
        },
        {
          role: 'user',
          content: `Please summarize the following content:\n\n${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 650,
    });

    const summary = completion.choices[0]?.message?.content || 'No summary generated';

    return NextResponse.json({ summary });
  } catch (error) {
    console.error('Error in summarize API:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}